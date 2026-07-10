import asyncio
import os
import re
import logging
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, File, UploadFile
from fastapi.responses import FileResponse
import uuid
import shutil
from sqlmodel import Session, select, func, or_, update, delete

from database import get_session
from models import Track, Playlist, PlaylistTrack, PlayerState, QueueItem, User, Favorite, PlayHistory
from auth import get_current_user_optional
from config import settings
from services import MetadataService

router = APIRouter()
logger = logging.getLogger(__name__)

# Constants
CACHE_TTL_SECONDS = 300  # 5 minutes cache TTL

# Simple in-memory cache for history queries
_history_cache: Dict[int, Dict[str, Any]] = {}

MUSIC_DIR = settings.music_dir


def _resolve_file_path(file_path: str) -> str:
    """Resolve a stored file path to an absolute filesystem path."""
    if not file_path:
        return ""
    if os.path.isabs(file_path):
        # If path starts with /music but MUSIC_DIR is different, rewrite it
        if file_path.startswith("/music/") and MUSIC_DIR != "/music":
            return os.path.join(MUSIC_DIR, file_path[7:])
        return file_path
    return os.path.join(MUSIC_DIR, file_path)


def _file_exists(file_path: str) -> bool:
    """Check if a file exists in the music directory."""
    resolved = _resolve_file_path(file_path)
    return resolved and os.path.exists(resolved)


def _format_filename_to_title(filename: str) -> str:
    """Derive a readable title from a filename when ID3 metadata is missing.

    Handles patterns like:
        '01 - title.mp3' -> 'title'
        '01-title.mp3'   -> 'title'
        '01_title.mp3'   -> 'title'
        '01. title.mp3'  -> 'title'
        'title.mp3'      -> 'title'
    """
    if not filename:
        return "Untitled"

    # Remove extension
    stem = Path(filename).stem

    # Strip leading track numbers with various separators
    # Matches: 01 - , 01- , 01_ , 01. , 01  , etc.
    stem = re.sub(r"^\d+[\s\-_\.]+", "", stem)

    # Replace remaining hyphens and underscores with spaces
    stem = re.sub(r"[_\-]+", " ", stem)

    # Collapse multiple spaces
    stem = re.sub(r"\s+", " ", stem).strip()

    return stem or "Untitled"


class SimpleTrackResponse:
    def __init__(self, id, title, artist, album, duration, track_number, genre, year, file_path, created_at, updated_at):
        self.id = id
        self.title = title
        self.artist = artist
        self.album = album
        self.duration = duration
        self.track_number = track_number
        self.genre = genre
        self.year = year
        self.file_path = file_path
        self.created_at = created_at
        self.updated_at = updated_at
        self.is_favorite = False
        self.play_count = 0
        self.last_played = None
        self.tags = []


def _to_track_dict(track: Track) -> dict:
    """Convert Track model to a dictionary response."""
    display_title = track.title if track.title else _format_filename_to_title(track.filename)
    return {
        "id": track.id,
        "title": display_title,
        "artist": track.artist,
        "album": track.album,
        "duration": track.duration,
        "track_number": track.track_number,
        "genre": track.genre,
        "year": track.year,
        "file_path": track.file_path,
        "created_at": track.created_at.isoformat() if track.created_at else None,
        "updated_at": track.updated_at.isoformat() if track.updated_at else None,
        "is_favorite": False,
        "play_count": 0,
        "last_played": None,
        "tags": [],
        "cover_art_url": track.cover_art_url,
        "lyrics": track.lyrics,
    }


def _to_track_dict_lightweight(track: Track) -> dict:
    """Convert Track model to a lightweight dictionary for history endpoint."""
    display_title = track.title if track.title else _format_filename_to_title(track.filename)
    return {
        "id": track.id,
        "title": display_title,
        "artist": track.artist,
        "album": track.album,
        "duration": track.duration,
        "cover_art_url": track.cover_art_url,
    }


def _build_tracks_query(search: Optional[str], sort_by: str, order: str, skip: int, limit: int):
    """Build the tracks query with search, sorting, and pagination."""
    statement = select(Track)

    if search:
        query_lower = search.lower()
        conditions = [
            func.lower(Track.title).like(f"%{query_lower}%"),
            func.lower(Track.artist).like(f"%{query_lower}%"),
            func.lower(Track.album).like(f"%{query_lower}%"),
            func.lower(Track.genre).like(f"%{query_lower}%"),
        ]
        statement = statement.where(or_(*conditions))

    if sort_by == "title":
        statement = statement.order_by(Track.title.asc() if order == "asc" else Track.title.desc())
    elif sort_by == "artist":
        statement = statement.order_by(Track.artist.asc() if order == "asc" else Track.artist.desc())
    elif sort_by == "album":
        statement = statement.order_by(Track.album.asc() if order == "asc" else Track.album.desc())
    elif sort_by == "year":
        statement = statement.order_by(Track.year.asc() if order == "asc" else Track.year.desc())
    else:
        statement = statement.order_by(Track.title.asc())

    statement = statement.offset(skip).limit(limit)
    return statement


@router.get("/tracks")
async def get_tracks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    search: Optional[str] = Query(None),
    sort_by: str = Query("title"),
    order: str = Query("asc"),
    session: Session = Depends(get_session)
):
    """Get all tracks with optional search and pagination."""
    try:
        statement = _build_tracks_query(search, sort_by, order, skip, limit)
        tracks = session.exec(statement).all()

        valid_tracks = [track for track in tracks if _file_exists(track.file_path)]
        return [_to_track_dict(track) for track in valid_tracks]

    except Exception:
        logger.exception("Error in get_tracks")
        raise HTTPException(status_code=500, detail="Failed to retrieve tracks")


@router.get("/tracks/{track_id}")
async def get_track(track_id: int, session: Session = Depends(get_session)):
    """Get a single track by ID."""
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return _to_track_dict(track)


@router.get("/tracks/{track_id}/stream")
async def stream_track(track_id: int, session: Session = Depends(get_session)):
    """Stream audio file for a track."""
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    file_path = _resolve_file_path(track.file_path)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(file_path, media_type="audio/mpeg", filename=os.path.basename(file_path))


@router.get("/albums")
async def get_albums(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    session: Session = Depends(get_session)
):
    """Get all albums with track counts."""
    try:
        albums_query = (
            select(
                Track.album,
                Track.artist,
                func.count(Track.id).label("track_count"),
                func.min(Track.year).label("year")
            )
            .where(Track.album.isnot(None))
            .where(Track.album != "")
            .group_by(Track.album, Track.artist)
            .order_by(Track.album.asc())
            .offset(skip)
            .limit(limit)
        )

        albums = session.exec(albums_query).all()

        result = []
        for album in albums:
            result.append({
                "album": album.album,
                "artist": album.artist,
                "track_count": album.track_count,
                "year": album.year
            })

        return result

    except Exception:
        logger.exception("Error in get_albums")
        raise HTTPException(status_code=500, detail="Failed to retrieve albums")


@router.get("/artists")
async def get_artists(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    session: Session = Depends(get_session)
):
    """Get all artists as a list of names."""
    try:
        artists_query = (
            select(Track.artist)
            .where(Track.artist.isnot(None))
            .where(Track.artist != "")
            .group_by(Track.artist)
            .order_by(Track.artist.asc())
            .offset(skip)
            .limit(limit)
        )

        artists = session.exec(artists_query).all()
        return [artist for artist in artists if artist]

    except Exception:
        logger.exception("Error in get_artists")
        raise HTTPException(status_code=500, detail="Failed to retrieve artists")


@router.get("/playlists")
async def get_playlists(
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all playlists."""
    try:
        stmt = select(Playlist)
        if current_user:
            stmt = stmt.where((Playlist.user_id == current_user.id) | (Playlist.user_id == None))
        else:
            stmt = stmt.where(Playlist.user_id == None)

        playlists = session.exec(stmt).all()

        result = []
        for playlist in playlists:
            # Count valid tracks
            count_stmt = (
                select(func.count(PlaylistTrack.id))
                .join(Track, PlaylistTrack.track_id == Track.id)
                .where(PlaylistTrack.playlist_id == playlist.id)
            )
            count = session.exec(count_stmt).one()

            # Also count by checking file existence
            stmt_tracks = (
                select(Track)
                .join(PlaylistTrack, Track.id == PlaylistTrack.track_id)
                .where(PlaylistTrack.playlist_id == playlist.id)
            )
            all_tracks = session.exec(stmt_tracks).all()
            valid_count = sum(1 for t in all_tracks if t.file_path and _file_exists(t.file_path))

            if playlist.folder_path or valid_count > 0:
                result.append({
                    "id": playlist.id,
                    "name": playlist.name,
                    "description": playlist.description,
                    "cover_image": playlist.cover_image,
                    "folder_path": playlist.folder_path,
                    "track_count": valid_count,
                    "created_at": playlist.created_at.isoformat() if playlist.created_at else None,
                    "updated_at": playlist.updated_at.isoformat() if playlist.updated_at else None,
                })

        return result

    except Exception:
        logger.exception("Error in get_playlists")
        raise HTTPException(status_code=500, detail="Failed to retrieve playlists")


@router.get("/playlists/{playlist_id}")
async def get_playlist(
    playlist_id: int,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get a single playlist with its tracks."""
    playlist = session.get(Playlist, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    stmt = (
        select(Track)
        .join(PlaylistTrack, Track.id == PlaylistTrack.track_id)
        .where(PlaylistTrack.playlist_id == playlist_id)
        .order_by(PlaylistTrack.position)
    )
    tracks = session.exec(stmt).all()

    return {
        "id": playlist.id,
        "name": playlist.name,
        "description": playlist.description,
        "cover_image": playlist.cover_image,
        "is_collaborative": playlist.is_collaborative,
        "allow_public_edits": playlist.allow_public_edits,
        "track_count": len(playlist.tracks),
        "tracks": [_to_track_dict(t) for t in tracks if _file_exists(t.file_path)],
        "created_at": playlist.created_at.isoformat() if playlist.created_at else None,
        "updated_at": playlist.updated_at.isoformat() if playlist.updated_at else None,
    }


@router.post("/playlists/{playlist_id}/cover")
async def upload_playlist_cover(
    playlist_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Upload a custom cover image for a playlist."""
    playlist = session.get(Playlist, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Create covers directory if it doesn't exist
    covers_dir = Path(__file__).parent / "data" / "covers"
    covers_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"playlist_{playlist_id}_{uuid.uuid4().hex}{ext}"
    file_path = covers_dir / filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save playlist cover: {e}")
        raise HTTPException(status_code=500, detail="Failed to save image")

    # Update playlist in database
    # Use the mounted path /api/covers/
    playlist.cover_image = f"/api/covers/{filename}"
    playlist.is_custom_cover = True
    playlist.updated_at = datetime.now(timezone.utc)
    
    session.add(playlist)
    session.commit()
    session.refresh(playlist)

    return {"cover_image": playlist.cover_image}


@router.post("/tracks/{track_id}/cover")
async def upload_track_cover(
    track_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Upload a custom cover art for a track."""
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Create covers directory if it doesn't exist
    covers_dir = Path(__file__).parent / "data" / "covers"
    covers_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"track_{track_id}_{uuid.uuid4().hex}{ext}"
    file_path = covers_dir / filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save track cover: {e}")
        raise HTTPException(status_code=500, detail="Failed to save image")

    # Update track in database
    track.cover_art_url = f"/api/covers/{filename}"
    track.is_custom_cover = True
    track.updated_at = datetime.now(timezone.utc)
    
    session.add(track)
    session.commit()
    session.refresh(track)

    return {"cover_art_url": track.cover_art_url}


@router.get("/player/state")
async def get_player_state(
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get current player state."""
    user_id = current_user.id if current_user else None
    state = None

    if user_id is not None:
        state = session.exec(select(PlayerState).where(PlayerState.user_id == user_id)).first()
    else:
        state = session.get(PlayerState, 1)

    if not state:
        state = PlayerState(user_id=user_id)
        if user_id is None:
            state.id = 1
        session.add(state)
        session.commit()
        session.refresh(state)

    return {
        "current_track_id": state.current_track_id,
        "current_position": state.current_position,
        "is_playing": state.is_playing,
        "volume": state.volume,
        "repeat_mode": state.repeat_mode,
        "shuffle": state.shuffle,
        "updated_at": state.updated_at.isoformat() if state.updated_at else None,
    }


@router.patch("/player/state")
async def update_player_state(
    data: dict,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Update player state."""
    # Whitelist allowed fields to prevent arbitrary attribute injection.
    ALLOWED_FIELDS = {
        "current_track_id",
        "current_position",
        "is_playing",
        "volume",
        "repeat_mode",
        "shuffle",
    }
    # Validate numeric/boolean types where appropriate.
    type_validators = {
        "current_track_id": lambda v: isinstance(v, int) and v >= 0,
        "current_position": lambda v: isinstance(v, (int, float)) and v >= 0,
        "is_playing": lambda v: isinstance(v, bool),
        "volume": lambda v: isinstance(v, (int, float)) and 0.0 <= v <= 1.0,
        "repeat_mode": lambda v: isinstance(v, str) and v in {"none", "one", "all"},
        "shuffle": lambda v: isinstance(v, bool),
    }
    for key, value in data.items():
        if key not in ALLOWED_FIELDS:
            raise HTTPException(status_code=400, detail=f"Invalid field: {key}")
        if key in type_validators and not type_validators[key](value):
            raise HTTPException(status_code=400, detail=f"Invalid value for {key}")

    user_id = current_user.id if current_user else None
    state = None

    if user_id is not None:
        state = session.exec(select(PlayerState).where(PlayerState.user_id == user_id)).first()
    else:
        # Use a fixed singleton ID for anonymous state.
        state = session.get(PlayerState, 1)

    if not state:
        state = PlayerState(user_id=user_id)
        if user_id is None:
            state.id = 1
        session.add(state)

    for key in ALLOWED_FIELDS:
        if key in data:
            setattr(state, key, data[key])

    state.updated_at = datetime.now()
    session.add(state)
    session.commit()
    session.refresh(state)

    return {
        "current_track_id": state.current_track_id,
        "current_position": state.current_position,
        "is_playing": state.is_playing,
        "volume": state.volume,
        "repeat_mode": state.repeat_mode,
        "shuffle": state.shuffle,
        "updated_at": state.updated_at.isoformat() if state.updated_at else None,
    }


@router.get("/queue")
async def get_queue(
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get current queue."""
    stmt = select(QueueItem, Track).join(Track, QueueItem.track_id == Track.id)
    if current_user:
        stmt = stmt.where(QueueItem.user_id == current_user.id)
    else:
        stmt = stmt.where(QueueItem.user_id == None)
    stmt = stmt.order_by(QueueItem.position)
    results = session.exec(stmt).all()

    result = []
    for item, track in results:
        result.append({
            "id": item.id,
            "track_id": track.id,
            "position": item.position,
            "track": _to_track_dict(track),
        })

    return result


@router.post("/queue")
async def add_to_queue(
    data: dict,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Add track to queue."""
    track_id = data.get("track_id")
    position = data.get("position")
    
    if not track_id:
        raise HTTPException(status_code=400, detail="track_id is required")
    
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Get current queue items to determine position
    stmt = select(QueueItem).where(QueueItem.user_id == (current_user.id if current_user else None))
    existing_items = session.exec(stmt).all()
    
    if position is None:
        # Add to end
        position = len(existing_items)
    else:
        # Insert at specified position, shift others down
        stmt = (
            update(QueueItem)
            .where(QueueItem.user_id == (current_user.id if current_user else None))
            .where(QueueItem.position >= position)
            .values(position=QueueItem.position + 1)
        )
        session.exec(stmt)
    
    queue_item = QueueItem(
        track_id=track_id,
        user_id=current_user.id if current_user else None,
        position=position
    )
    session.add(queue_item)
    session.commit()
    session.refresh(queue_item)
    
    return {"id": queue_item.id, "position": queue_item.position}


@router.delete("/queue/{queue_item_id}")
async def remove_from_queue(
    queue_item_id: int,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Remove item from queue."""
    queue_item = session.get(QueueItem, queue_item_id)
    if not queue_item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    
    # Check ownership
    if current_user and queue_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if not current_user and queue_item.user_id is not None:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get the position of the item to be removed
    removed_position = queue_item.position
    
    # Delete the item
    session.delete(queue_item)
    
    # Shift all items after the removed position up by 1
    stmt = (
        update(QueueItem)
        .where(QueueItem.user_id == (current_user.id if current_user else None))
        .where(QueueItem.position > removed_position)
        .values(position=QueueItem.position - 1)
    )
    session.exec(stmt)
    
    session.commit()
    
    return {"message": "Item removed from queue"}


@router.post("/queue/reorder")
async def reorder_queue(
    data: dict,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Reorder queue item."""
    queue_item_id = data.get("queue_item_id")
    new_position = data.get("new_position")
    
    if queue_item_id is None or new_position is None:
        raise HTTPException(status_code=400, detail="queue_item_id and new_position are required")
    
    queue_item = session.get(QueueItem, queue_item_id)
    if not queue_item:
        raise HTTPException(status_code=404, detail="Queue item not found")
    
    # Check ownership
    if current_user and queue_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if not current_user and queue_item.user_id is not None:
        raise HTTPException(status_code=403, detail="Access denied")
    
    old_position = queue_item.position
    
    if old_position == new_position:
        return {"message": "No change needed"}
    
    # Get all queue items for this user
    stmt = select(QueueItem).where(QueueItem.user_id == (current_user.id if current_user else None)).order_by(QueueItem.position)
    all_items = session.exec(stmt).all()
    
    if new_position < 0 or new_position >= len(all_items):
        raise HTTPException(status_code=400, detail="Invalid position")
    
    # Update positions
    if old_position < new_position:
        # Moving down: shift items between old+1 and new_position up by 1
        stmt = (
            update(QueueItem)
            .where(QueueItem.user_id == (current_user.id if current_user else None))
            .where(QueueItem.position > old_position)
            .where(QueueItem.position <= new_position)
            .values(position=QueueItem.position - 1)
        )
    else:
        # Moving up: shift items between new_position and old-1 down by 1
        stmt = (
            update(QueueItem)
            .where(QueueItem.user_id == (current_user.id if current_user else None))
            .where(QueueItem.position >= new_position)
            .where(QueueItem.position < old_position)
            .values(position=QueueItem.position + 1)
        )
    
    session.exec(stmt)
    
    # Update the moved item's position
    queue_item.position = new_position
    session.commit()
    
    return {"message": "Queue reordered"}


@router.delete("/queue")
async def clear_queue(
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Clear entire queue."""
    stmt = delete(QueueItem).where(QueueItem.user_id == (current_user.id if current_user else None))
    session.exec(stmt)
    session.commit()
    
    return {"message": "Queue cleared"}


@router.get("/users/me/history")
async def get_history(
    limit: int = Query(50, ge=1, le=200),
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get play history for current user with caching."""
    if not current_user:
        return []

    # Check cache first
    cache_key = f"{current_user.id}_{limit}"
    now = time.time()
    
    if cache_key in _history_cache:
        cached_data = _history_cache[cache_key]
        if now - cached_data["timestamp"] < CACHE_TTL_SECONDS:
            logger.debug(f"Cache hit for user {current_user.id} history")
            return cached_data["data"]
        else:
            # Remove expired cache
            del _history_cache[cache_key]

    # Use optimized JOIN query to avoid N+1 problem
    items = session.exec(
        select(PlayHistory, Track)
        .join(Track, PlayHistory.track_id == Track.id)
        .where(PlayHistory.user_id == current_user.id)
        .order_by(PlayHistory.played_at.desc())
        .limit(limit)
    ).all()

    result = []
    for history_item, track in items:
        result.append({
            "id": history_item.id,
            "track_id": history_item.track_id,
            "played_at": history_item.played_at.isoformat() if history_item.played_at else None,
            "position": history_item.position,
            "duration": history_item.duration,
            "track": _to_track_dict_lightweight(track) if track else None,
        })

    # Cache the result
    _history_cache[cache_key] = {
        "data": result,
        "timestamp": now
    }
    logger.debug(f"Cached history for user {current_user.id}, {len(result)} items")

    return result


def invalidate_user_history_cache(user_id: int):
    """Invalidate cached history for a specific user."""
    keys_to_remove = [key for key in _history_cache.keys() if key.startswith(f"{user_id}_")]
    for key in keys_to_remove:
        del _history_cache[key]
    logger.debug(f"Invalidated history cache for user {user_id}")


@router.post("/users/me/history")
async def add_history(
    data: dict,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Add a track to play history."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    track_id = data.get("track_id")
    if not track_id:
        raise HTTPException(status_code=400, detail="track_id is required")
    
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    history_item = PlayHistory(
        user_id=current_user.id,
        track_id=track_id,
        played_at=datetime.now(),
        position=data.get("position"),
        duration=data.get("duration")
    )
    session.add(history_item)
    session.commit()
    session.refresh(history_item)
    
    # Invalidate cache for this user
    invalidate_user_history_cache(current_user.id)
    
    return {
        "id": history_item.id,
        "track_id": history_item.track_id,
        "played_at": history_item.played_at.isoformat() if history_item.played_at else None,
        "position": history_item.position,
        "duration": history_item.duration
    }


@router.get("/auth/me")
async def get_auth_me(current_user: Optional[User] = Depends(get_current_user_optional)):
    """Get current user profile."""
    if current_user:
        return {
            "id": current_user.id,
            "username": current_user.username,
        }
    return {"id": None, "username": None}


@router.get("/users/me/settings")
async def get_user_settings():
    """Get user settings."""
    return {"theme": "dark", "language": "en"}


@router.get("/users/me/favorites")
async def get_user_favorites(
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get user favorites."""
    if not current_user:
        return []

    favorites = session.exec(
        select(Favorite).where(Favorite.user_id == current_user.id)
    ).all()

    result = []
    for fav in favorites:
        track = session.get(Track, fav.track_id)
        if track:
            result.append({
                "id": fav.id,
                "track_id": fav.track_id,
                "track": _to_track_dict(track),
                "created_at": fav.created_at.isoformat() if fav.created_at else None,
            })

    return result


@router.get("/tracks/{track_id}/lyrics")
async def get_track_lyrics(track_id: int, session: Session = Depends(get_session)):
    """Get lyrics for a track."""
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return {
        "lyrics": track.lyrics,
        "synced_lyrics": track.synced_lyrics
    }


@router.put("/tracks/{track_id}/lyrics")
async def save_track_lyrics(
    track_id: int,
    data: dict,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Save lyrics for a track."""
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track.lyrics = data.get("lyrics", "")
    track.is_custom_lyrics = True
    track.updated_at = datetime.now()
    session.add(track)
    session.commit()
    session.refresh(track)
    
    return {"lyrics": track.lyrics}


@router.put("/tracks/{track_id}/synced-lyrics")
async def save_synced_lyrics(
    track_id: int,
    data: dict,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Save synced lyrics for a track."""
    track = session.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    track.synced_lyrics = data.get("synced_lyrics", "")
    track.is_custom_lyrics = True
    track.updated_at = datetime.now()
    session.add(track)
    session.commit()
    session.refresh(track)
    
    return {"synced_lyrics": track.synced_lyrics}


@router.get("/lyrics/search")
async def search_lyrics(
    q: str = Query(..., min_length=1),
    artist: Optional[str] = Query(None),
    title: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Search for lyrics across local tracks and external APIs."""
    query_lower = q.lower()
    results = []

    # 1. Search local tracks that already have lyrics
    statement = (
        select(Track)
        .where(Track.lyrics.isnot(None))
        .where(Track.lyrics != "")
        .where(
            or_(
                func.lower(Track.title).like(f"%{query_lower}%"),
                func.lower(Track.artist).like(f"%{query_lower}%"),
                func.lower(Track.album).like(f"%{query_lower}%"),
                func.lower(Track.lyrics).like(f"%{query_lower}%")
            )
        )
        .limit(20)
    )

    tracks = session.exec(statement).all()
    for track in tracks:
        results.append({
            "id": track.id,
            "title": track.title,
            "artist": track.artist,
            "album": track.album,
            "plain_lyrics": track.lyrics,
            "synced_lyrics": track.synced_lyrics,
            "source": "local"
        })

    # 2. If no local results, query external APIs
    if not results:
        # Normalize inputs: fall back to query string if title/artist are missing
        search_title = (title or q).strip()
        search_artist = (artist or "").strip()
        # Filter out placeholder artist names
        if search_artist.lower() in ("", "unknown artist", "unknown"):
            search_artist = ""

        if search_title:
            logger.info("Searching external lyrics APIs for: '%s' - '%s'", search_artist or "(no artist)", search_title)

            # Try LRCLIB first (returns multiple candidates)
            try:
                import requests
                lrclib_params = {"track_name": search_title}
                if search_artist:
                    lrclib_params["artist_name"] = search_artist

                lrclib_res = await asyncio.to_thread(
                    requests.get,
                    "https://lrclib.net/api/search",
                    params=lrclib_params,
                    timeout=10
                )
                if lrclib_res.status_code == 200:
                    lrclib_results = lrclib_res.json()
                    for item in lrclib_results[:5]:  # cap at 5 results
                        plain = item.get("plainLyrics") or ""
                        synced = item.get("syncedLyrics") or ""
                        if plain or synced:
                            results.append({
                                "id": None,
                                "title": item.get("trackName") or search_title,
                                "artist": item.get("artistName") or search_artist or "unknown artist",
                                "album": item.get("albumName"),
                                "plain_lyrics": MetadataService._clean_lyrics(plain) if plain else "",
                                "synced_lyrics": synced or "",
                                "source": "lrclib"
                            })
            except Exception as e:
                logger.warning("LRCLIB lyrics search failed: %s", e)

            # Fallback to Genius if LRCLIB returned nothing
            if not results and search_artist:
                try:
                    genius_lyrics = await asyncio.to_thread(
                        MetadataService.fetch_lyrics_from_genius,
                        search_artist,
                        search_title
                    )
                    if genius_lyrics:
                        results.append({
                            "id": None,
                            "title": search_title,
                            "artist": search_artist,
                            "album": None,
                            "plain_lyrics": genius_lyrics,
                            "synced_lyrics": "",
                            "source": "genius"
                        })
                except Exception as e:
                    logger.warning("Genius lyrics search failed: %s", e)

    return results


# Audio processing settings endpoints
@router.get("/audio-processing/settings")
async def get_audio_processing_settings():
    """Get available audio processing settings and presets."""
    from audio_processing import AudioProcessingService
    
    return {
        "equalizer_presets": AudioProcessingService.get_equalizer_presets(),
        "audio_effects": AudioProcessingService.get_audio_effects(),
        "spatial_presets": AudioProcessingService.get_spatial_presets()
    }


@router.post("/audio-processing/settings")
async def update_audio_processing_settings(settings: dict):
    """Update audio processing settings (for future use)."""
    # For now, just return the settings to confirm they were received
    # In the future, this could store user preferences
    return {
        "status": "success",
        "settings": settings
    }


@router.get("/health")
async def health():
    return {"status": "ok"}
