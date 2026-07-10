"""semantic embedding utilities for music_app.

this module provides local embeddings and a faiss vector index for semantic search.

all strings and logs are lowercase to match the project requirement.
"""

import os
import logging
import threading
import hashlib
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    try:
        import faiss_cpu as faiss
        FAISS_AVAILABLE = True
    except ImportError:
        FAISS_AVAILABLE = False
        logging.getLogger(__name__).warning("faiss not available - semantic search will use fallback")

import numpy as np
from sentence_transformers import SentenceTransformer
from sqlmodel import Session, select
import torch

from models import Track, TrackEmbedding, TrackTag
from database import engine

logger = logging.getLogger(__name__)

# use a small, fast model for local inference.
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
EMBEDDING_DIM = 384

# where to store the faiss index (default to user-writable location)
_vector_dir_env = os.getenv("VECTOR_DIR")
if _vector_dir_env:
    VECTOR_DIR = Path(_vector_dir_env)
else:
    VECTOR_DIR = Path.home() / ".local" / "share" / "music_app" / "vectors"

INDEX_PATH = VECTOR_DIR / "faiss.index"
IDS_PATH = VECTOR_DIR / "faiss.ids.npy"

_lock = threading.Lock()

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model


def _normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm


def _prepare_text(track: Track, session: Session) -> str:
    """build the text used for embedding for a track."""
    tags = session.exec(
        select(TrackTag.tag).where(TrackTag.track_id == track.id)
    ).all()
    parts = [track.title or "", track.artist or "", track.album or "", track.lyrics or ""]
    if tags:
        parts.append(" ".join(tags))
    return " ".join([p.strip() for p in parts if p])


def compute_track_embedding(track: Track, session: Session) -> np.ndarray:
    model = _get_model()
    text = _prepare_text(track, session)
    emb = model.encode(text, normalize_embeddings=True)[0].astype(np.float32)
    return emb


def _ensure_vector_dir():
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)


def _load_index():
    if not FAISS_AVAILABLE:
        return None
    _ensure_vector_dir()
    if INDEX_PATH.exists() and IDS_PATH.exists():
        index = faiss.read_index(str(INDEX_PATH))
        return index
    return None


def _save_index(index: faiss.IndexFlatIP, ids: np.ndarray):
    _ensure_vector_dir()
    temp_index_path = INDEX_PATH.with_suffix('.index.tmp')
    temp_ids_path = IDS_PATH.with_suffix('.npy.tmp')
    faiss.write_index(index, str(temp_index_path))
    np.save(temp_ids_path, ids)
    os.replace(temp_index_path, INDEX_PATH)
    os.replace(temp_ids_path, IDS_PATH)


def rebuild_index(session: Session) -> None:
    """rebuild faiss index from db embeddings with optimized IVF index for sub-100ms queries."""
    if not FAISS_AVAILABLE:
        logger.warning("faiss not available - skipping index rebuild")
        return

    with _lock:
        embeddings = []
        ids = []
        for emb in session.exec(select(TrackEmbedding)).all():
            if emb.embedding:
                vec = np.frombuffer(emb.embedding, dtype=np.float32)
                if vec.shape[0] == EMBEDDING_DIM:
                    embeddings.append(vec)
                    ids.append(emb.track_id)

        if not embeddings:
            # create empty IVF index for future additions
            nlist = 1  # number of clusters (will be updated when we have data)
            quantizer = faiss.IndexFlatIP(EMBEDDING_DIM)
            index = faiss.IndexIVFFlat(quantizer, EMBEDDING_DIM, nlist, faiss.METRIC_INNER_PRODUCT)
            faiss.write_index(index, str(INDEX_PATH))
            np.save(IDS_PATH, np.array([], dtype=np.int64))
            return

        xb = np.vstack(embeddings)
        ntotal = len(embeddings)

        # Use IVF (Inverted File) index for approximate nearest neighbors
        # This provides much faster search at the cost of some accuracy
        if ntotal < 1000:
            # For small datasets, use exact search
            index = faiss.IndexFlatIP(EMBEDDING_DIM)
        else:
            # For larger datasets, use IVF for ~10-100x speedup
            nlist = min(1024, max(4, ntotal // 39))  # rule of thumb: nlist = 4*sqrt(ntotal)
            quantizer = faiss.IndexFlatIP(EMBEDDING_DIM)
            index = faiss.IndexIVFFlat(quantizer, EMBEDDING_DIM, nlist, faiss.METRIC_INNER_PRODUCT)

            # Train the index
            index.train(xb)
            logger.info("trained ivf index with %d clusters for %d vectors", nlist, ntotal)

        # Add vectors to index
        index.add_with_ids(xb, np.array(ids, dtype=np.int64))
        faiss.write_index(index, str(INDEX_PATH))


def ensure_embeddings(session: Session, limit: int = None, force: bool = False) -> dict:
    """compute embeddings for tracks missing them or force update."""
    results = {"checked": 0, "updated": 0, "skipped": 0}
    stmt = select(Track).limit(limit) if limit else select(Track)
    for track in session.exec(stmt).all():
        results["checked"] += 1
        if track.id is None:
            results["skipped"] += 1
            continue
        existing = session.exec(select(TrackEmbedding).where(TrackEmbedding.track_id == track.id)).first()
        if existing and not force:
            results["skipped"] += 1
            continue
        vec = compute_track_embedding(track, session)
        blob = vec.tobytes()
        if existing:
            existing.embedding = blob
            existing.updated_at = datetime.now(timezone.utc)
            session.add(existing)
        else:
            emb = TrackEmbedding(track_id=track.id, embedding=blob)
            session.add(emb)
        results["updated"] += 1
        if limit and results["updated"] >= limit:
            break
    session.commit()

    # Rebuild index asynchronously to avoid blocking
    import threading
    def async_rebuild():
        with Session(engine) as rebuild_session:
            rebuild_index(rebuild_session)
    thread = threading.Thread(target=async_rebuild, daemon=True)
    thread.start()

    return results


import time
import functools
from typing import Dict, List, Tuple, OrderedDict
from collections import OrderedDict

# Optimized LRU cache for sub-100ms response times
_query_cache: OrderedDict[str, Tuple[List[Tuple[Track, float]], float, int]] = OrderedDict()
_cache_ttl = 600  # 10 minutes cache TTL (increased for better hit rates)
_cache_max_size = 2000  # Increased cache size
_cache_access_count = 0
_cache_hit_count = 0

def _get_cache_key(query: str, limit: int) -> str:
    """Generate cache key for query."""
    return f"{query.lower().strip()}:{limit}"

def _is_cache_valid(timestamp: float) -> bool:
    """Check if cache entry is still valid."""
    return time.time() - timestamp < _cache_ttl

def _cleanup_cache():
    """Remove expired cache entries with LRU eviction."""
    global _cache_access_count, _cache_hit_count
    current_time = time.time()

    # Remove expired entries
    expired_keys = [
        key for key, (_, timestamp, _) in _query_cache.items()
        if current_time - timestamp > _cache_ttl
    ]
    for key in expired_keys:
        del _query_cache[key]

    # LRU eviction if still too large
    while len(_query_cache) > _cache_max_size:
        _query_cache.popitem(last=False)  # Remove least recently used

def _get_cache_stats() -> dict:
    """Get cache performance statistics."""
    global _cache_access_count, _cache_hit_count
    hit_rate = _cache_hit_count / max(_cache_access_count, 1)
    return {
        "size": len(_query_cache),
        "hit_rate": hit_rate,
        "accesses": _cache_access_count,
        "hits": _cache_hit_count
    }

def semantic_search(query: str, session: Session, limit: int = 20) -> list[tuple[Track, float]]:
    """perform semantic search using embeddings and faiss with optimized LRU caching for sub-100ms response times."""
    global _cache_access_count, _cache_hit_count
    start_time = time.time()

    # Check LRU cache first
    cache_key = _get_cache_key(query, limit)
    _cache_access_count += 1

    if cache_key in _query_cache:
        cached_result, cache_timestamp, access_count = _query_cache[cache_key]
        if _is_cache_valid(cache_timestamp):
            # Move to end (most recently used)
            del _query_cache[cache_key]
            _query_cache[cache_key] = (cached_result, cache_timestamp, access_count + 1)
            _cache_hit_count += 1
            hit_rate = _cache_hit_count / _cache_access_count
            logger.info("cache hit (%.1f%%) for query: %s...", hit_rate * 100, query[:50])
            return cached_result

    # Periodic cache cleanup
    if _cache_access_count % 100 == 0:  # Clean every 100 accesses
        _cleanup_cache()
    
    with _lock:
        # ensure index exists (skip ensure_embeddings on read path to avoid write contention;
        # embeddings are maintained by background rebuilds and metadata writes)
        
        # load index
        index = _load_index()
        if index is None:
            return []
        
        ids_path = IDS_PATH
        if not ids_path.exists():
            return []
        
        track_ids = np.load(ids_path)
        
        # encode query
        model = _get_model()
        query_embedding = model.encode([query], normalize_embeddings=True)[0].detach().cpu().numpy().astype(np.float32)

        # Use IVF search parameters for optimal performance
        if hasattr(index, 'nprobe'):
            # IVF index - set number of probes for accuracy vs speed tradeoff
            index.nprobe = min(10, index.nlist)  # Search 10 clusters for good balance

        # Search with optimized parameters
        search_limit = min(limit * 3, len(track_ids))  # Search more candidates with IVF for better results
        distances, indices = index.search(np.array([query_embedding]), search_limit)
        
        # get tracks with efficient bulk loading
        track_ids_to_fetch = []
        valid_indices = []
        
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            if idx >= 0 and idx < len(track_ids):
                track_id = int(track_ids[idx])
                track_ids_to_fetch.append(track_id)
                valid_indices.append((i, float(1 - distance)))  # convert distance to similarity
        
        # Bulk fetch tracks to minimize database queries
        if not track_ids_to_fetch:
            return []
        
        tracks_map = {}
        if track_ids_to_fetch:
            tracks = session.exec(select(Track).where(Track.id.in_(track_ids_to_fetch))).all()
            tracks_map = {track.id: track for track in tracks}
        
        # Build results efficiently
        results = []
        for (idx, similarity), track_id in zip(valid_indices, track_ids_to_fetch):
            track = tracks_map.get(track_id)
            if track:
                results.append((track, similarity))
                if len(results) >= limit:
                    break
        
        # Cache the result with LRU ordering
        if len(_query_cache) >= _cache_max_size:
            _query_cache.popitem(last=False)  # Remove LRU item
        _query_cache[cache_key] = (results, time.time(), 1)

        search_time = time.time() - start_time
        logger.info("semantic search completed in %.1fms: %d results", search_time * 1000, len(results))

        return results


def get_cache_stats() -> dict:
    """Get semantic search cache performance statistics."""
    return _get_cache_stats()


def clear_cache() -> dict:
    """Clear the semantic search cache."""
    global _query_cache, _cache_access_count, _cache_hit_count
    old_size = len(_query_cache)
    _query_cache.clear()
    _cache_access_count = 0
    _cache_hit_count = 0
    return {"cleared_entries": old_size}
