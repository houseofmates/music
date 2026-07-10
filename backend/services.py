import os
import json
import base64
import re
import fcntl
import asyncio
import logging
from pathlib import Path
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from mutagen import File as MutagenFile
from mutagen.id3 import ID3
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from mutagen.mp4 import MP4Cover
from sqlmodel import Session, select, or_
from sqlalchemy.exc import DataError
from sqlalchemy.orm.exc import DetachedInstanceError
from models import Track, TrackEmbedding, ScanLog, Playlist, PlaylistTrack, PlayHistory
from config import settings
import requests
import acoustid
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Cross-process lock file to prevent concurrent scans across containers
_LOCK_FILE_PATH = os.path.join(os.path.dirname(__file__), '.scan_lock')

# Thread pool for parallel metadata extraction
_METADATA_THREAD_POOL = ThreadPoolExecutor(max_workers=8, thread_name_prefix="metadata")

def _acquire_scan_lock(timeout: float = 5.0) -> bool:
    """Acquire a cross-process file lock for scanning."""
    import time as _time
    start = _time.time()
    while _time.time() - start < timeout:
        try:
            fd = os.open(_LOCK_FILE_PATH, os.O_CREAT | os.O_RDWR)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            # Keep fd open for the duration of the lock
            return fd
        except (OSError, IOError):
            _time.sleep(0.1)
    return None

def _release_scan_lock(fd: int) -> None:
    """Release the cross-process file lock."""
    try:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)
    except (OSError, IOError) as e:
        logger.warning("Failed to release scan lock: %s", e)


def _parse_artists(artist_string: Optional[str]) -> Tuple[str, Optional[str]]:
    """Parse artist string to extract main artist and featured artists.
    
    Treats commas as PRIMARY separators (like "Artist A, Artist B")
    PLUS ft./feat./& as separators (like "Artist A ft. Artist B")
    
    Returns tuple of (main_artist, featured_artists_string_or_None)
    """
    if not artist_string:
        return artist_string, None
    
    # First, split by commas (PRIMARY separator)
    comma_parts = [p.strip() for p in artist_string.split(',')]
    
    all_artists = []
    
    # Then check each part for ft./feat./&/x/etc. (SECONDARY separators)
    for part in comma_parts:
        if not part:
            continue
            
        # Normalize for separator detection (lowercase)
        normalized = part.lower()
        
        # Replace various featuring markers with a standard separator
        markers = [
            ' featuring ', ' ft. ', ' feat. ',
            ' & ', ' x ', ' vs ', ' versus ',
            ' with ', ' and ', ' + '
        ]
        
        # Find positions of all markers in the original string
        split_positions = []
        for marker in markers:
            pos = normalized.find(marker)
            while pos != -1:
                split_positions.append((pos, pos + len(marker)))
                pos = normalized.find(marker, pos + 1)
        
        if not split_positions:
            # No secondary separators found, add the whole part
            all_artists.append(part.strip())
        else:
            # Sort by position and extract substrings from original
            split_positions.sort()
            
            # Get the first artist (before first marker)
            first_end = split_positions[0][0]
            first_artist = part[:first_end].strip()
            if first_artist:
                all_artists.append(first_artist)
            
            # Get artists between markers
            for i in range(len(split_positions)):
                start = split_positions[i][1]  # End of current marker
                if i + 1 < len(split_positions):
                    end = split_positions[i + 1][0]  # Start of next marker
                else:
                    end = len(part)
                
                artist = part[start:end].strip()
                # Clean up common prefixes that might remain
                if artist.lower().startswith('ft '):
                    artist = artist[3:].strip()
                if artist.lower().startswith('feat '):
                    artist = artist[5:].strip()
                if artist:
                    all_artists.append(artist)
    
    if len(all_artists) > 1:
        return all_artists[0], ", ".join(all_artists[1:])
    elif len(all_artists) == 1:
        return all_artists[0], None
    else:
        return artist_string, None


class AsyncMetadataService:
    """High-performance async metadata extraction service with optimized batching."""
    
    @staticmethod
    async def _extract_single_file_metadata(file_info: tuple) -> dict:
        """Extract metadata from a single file (runs in thread pool)."""
        file_path, stored_path, relative_path = file_info
        try:
            # Fast metadata extraction with minimal I/O
            metadata = MetadataService.extract_metadata(file_path)
            if not metadata:
                return {"error": f"No metadata found for {file_path}", "file_path": stored_path}
            
            # Get file stats efficiently
            file_stat = os.stat(file_path)
            last_modified = datetime.fromtimestamp(file_stat.st_mtime)
            
            return {
                "file_path": stored_path,
                "filename": os.path.basename(file_path),
                "file_size": file_stat.st_size,
                "last_modified": last_modified,
                "inode": file_stat.st_ino,
                "device": file_stat.st_dev,
                "metadata": metadata,
                "relative_path": relative_path
            }
        except Exception as e:
            return {"error": f"Failed to extract metadata from {file_path}: {str(e)}", "file_path": stored_path}
    
    @staticmethod
    async def _bulk_database_update(session: Session, all_results: list, full_scan: bool = False) -> dict:
        """Perform optimized bulk database operations with minimal blocking."""
        tracks_added = 0
        tracks_updated = 0
        errors = []
        
        # Separate successful results from errors
        successful_results = [r for r in all_results if "error" not in r]
        errors = [r["error"] for r in all_results if "error" in r]
        
        if not successful_results:
            return {"tracks_added": 0, "tracks_updated": 0, "errors": errors}
        
        # Bulk fetch existing tracks to minimize queries
        existing_file_paths = {r["file_path"] for r in successful_results}
        existing_tracks_map = {}
        
        if existing_file_paths:
            existing_db = session.exec(
                select(Track).where(Track.file_path.in_(list(existing_file_paths)))
            ).all()
            existing_tracks_map = {track.file_path: track for track in existing_db}
        
        # Prepare bulk operations
        new_tracks = []
        tracks_to_update = []
        
        for result in successful_results:
            existing = existing_tracks_map.get(result["file_path"])
            
            if existing:
                # Check if update is needed
                should_update = (
                    existing.last_modified < result["last_modified"] or 
                    (full_scan and not existing.is_custom_metadata)
                )
                
                if should_update:
                    metadata = result["metadata"]
                    for key, value in metadata.items():
                        if hasattr(existing, key) and value is not None:
                            setattr(existing, key, value)
                    
                    existing.updated_at = datetime.now(timezone.utc)
                    existing.file_size = result["file_size"]
                    existing.inode = result["inode"]
                    existing.device = result["device"]
                    tracks_to_update.append(existing)
                    tracks_updated += 1
            else:
                # Create new track
                metadata = result["metadata"]
                track = Track(
                    file_path=result["file_path"],
                    filename=result["filename"],
                    file_size=result["file_size"],
                    last_modified=result["last_modified"],
                    inode=result["inode"],
                    device=result["device"],
                    **metadata
                )
                new_tracks.append(track)
                tracks_added += 1
        
        # Bulk insert new tracks
        if new_tracks:
            session.add_all(new_tracks)
            session.flush()  # Get IDs without committing
        
        # Bulk update existing tracks (already in session, just flush)
        if tracks_to_update:
            session.flush()
        
        return {
            "tracks_added": tracks_added,
            "tracks_updated": tracks_updated,
            "errors": errors
        }
    
    @staticmethod
    async def scan_directory_async(session: Session, directory: str, full_scan: bool = False) -> dict:
        """High-performance async directory scanning with optimized batching."""
        import time
        import os
        from pathlib import Path
        
        start_time = time.time()
        
        supported_formats = {".mp3", ".flac", ".m4a", ".ogg", ".wav", ".webm", ".opus"}
        
        # Optimized file discovery with parallel directory traversal
        logger.info("Discovering audio files with optimized IO...")
        audio_files = []
        
        # Use pathlib for better performance
        music_dir = Path(directory)
        
        # Parallel directory discovery using ThreadPoolExecutor
        def discover_parallel():
            files = []
            for root in music_dir.rglob("*"):
                if root.is_file() and root.suffix.lower() in supported_formats:
                    rel_file_path = root.relative_to(music_dir)
                    stored_path = Path('/music') / rel_file_path
                    
                    # Calculate relative path for folder playlists
                    try:
                        root_rel_to_music = root.parent.relative_to(music_dir)
                        if len(root_rel_to_music.parts) >= 1:
                            top_folder = root_rel_to_music.parts[0]
                            top_root = music_dir / top_folder
                            relative_path = root.relative_to(top_root)
                        else:
                            relative_path = root.name
                    except ValueError:
                        relative_path = root.name
                    
                    files.append((str(root), str(stored_path), str(relative_path)))
            return files
        
        # Run discovery in parallel
        loop = asyncio.get_event_loop()
        audio_files = await loop.run_in_executor(_METADATA_THREAD_POOL, discover_parallel)
        
        logger.info("Found %d audio files", len(audio_files))
        
        # Optimize batch size based on system resources
        cpu_count = os.cpu_count() or 4
        batch_size = min(100, max(20, cpu_count * 25))
        
        # Process metadata extraction with optimized batching
        logger.info("Extracting metadata in parallel (batch size: %d)...", batch_size)
        
        # Use semaphore to control concurrent operations
        semaphore = asyncio.Semaphore(cpu_count * 2)
        
        async def process_batch(batch):
            async with semaphore:
                loop = asyncio.get_event_loop()
                batch_results = await loop.run_in_executor(
                    _METADATA_THREAD_POOL,
                    lambda: list(map(AsyncMetadataService._extract_single_file_metadata, batch))
                )
                return batch_results
        
        # Process all batches concurrently
        tasks = []
        for i in range(0, len(audio_files), batch_size):
            batch = audio_files[i:i + batch_size]
            task = asyncio.create_task(process_batch(batch))
            tasks.append(task)
        
        # Wait for all batches to complete
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten results and handle exceptions
        all_results = []
        for result in batch_results:
            if isinstance(result, Exception):
                logger.error("Batch processing error: %s", result)
                continue
            all_results.extend(result)
        
        # Perform bulk database update
        logger.info("Performing bulk database operations...")
        update_result = await AsyncMetadataService._bulk_database_update(session, all_results, full_scan)
        
        logger.info("Scan complete: %d added, %d updated", update_result['tracks_added'], update_result['tracks_updated'])
        return update_result


class MetadataService:
    """Service for extracting and enriching music metadata."""

    @staticmethod
    def extract_embedded_cover_art(file_path: str) -> Optional[str]:
        """Extract embedded artwork from an audio file and return it as a data URL."""
        try:
            audio = MutagenFile(file_path)
            if audio is None:
                return None

            # FLAC/Vorbis picture blocks.
            pictures = getattr(audio, "pictures", None)
            if pictures:
                picture = pictures[0]
                mime = getattr(picture, "mime", None) or "image/jpeg"
                encoded = base64.b64encode(picture.data).decode("utf-8")
                return f"data:{mime};base64,{encoded}"

            tags = getattr(audio, "tags", None)
            if not tags:
                return None

            # MP3 ID3 APIC frames.
            if hasattr(tags, "keys"):
                for key in tags.keys():
                    if str(key).startswith("APIC"):
                        frame = tags[key]
                        mime = getattr(frame, "mime", None) or "image/jpeg"
                        data = getattr(frame, "data", None)
                        if data:
                            encoded = base64.b64encode(data).decode("utf-8")
                            return f"data:{mime};base64,{encoded}"

            # MP4/M4A covr atoms.
            covr = tags.get("covr") if hasattr(tags, "get") else None
            if covr:
                artwork = covr[0]
                data = bytes(artwork)
                image_format = getattr(artwork, "imageformat", None)
                mime = "image/png" if image_format == MP4Cover.FORMAT_PNG else "image/jpeg"
                encoded = base64.b64encode(data).decode("utf-8")
                return f"data:{mime};base64,{encoded}"

            # FLAC base64-encoded picture blocks stored in tags.
            metadata_block_picture = tags.get("metadata_block_picture") if hasattr(tags, "get") else None
            if metadata_block_picture:
                encoded_picture = metadata_block_picture[0]
                try:
                    raw = base64.b64decode(encoded_picture)
                    encoded = base64.b64encode(raw).decode("utf-8")
                    return f"data:image/jpeg;base64,{encoded}"
                except Exception:
                    return None

            return None
        except (OSError, MutagenFile.Error) as e:
            logger.error("Error extracting embedded cover art from %s: %s", file_path, e)
            return None
    
    @staticmethod
    def extract_metadata(file_path: str) -> dict:
        """Extract metadata from audio file using mutagen."""
        try:
            audio = MutagenFile(file_path, easy=True)
            if audio is None:
                return {}
            
            metadata = {
                "title": None,
                "artist": None,
                "album": None,
                "album_artist": None,
                "genre": None,
                "year": None,
                "track_number": None,
                "disc_number": None,
                "duration": None,
                "cover_art_url": None,
            }
            
            # Extract basic metadata
            if hasattr(audio, 'info') and audio.info:
                metadata["duration"] = audio.info.length
            
            # Extract tags
            if audio.tags:
                metadata["title"] = audio.tags.get("title", [None])[0]
                metadata["artist"] = audio.tags.get("artist", [None])[0]
                metadata["album"] = audio.tags.get("album", [None])[0]
                metadata["album_artist"] = audio.tags.get("albumartist", [None])[0]
                metadata["genre"] = audio.tags.get("genre", [None])[0]
                
                # Year
                date = audio.tags.get("date", [None])[0]
                if date:
                    try:
                        metadata["year"] = int(str(date)[:4])
                    except (ValueError, TypeError):
                        pass
                
                # Track number
                track = audio.tags.get("tracknumber", [None])[0]
                if track:
                    try:
                        # Handle "1/10" format
                        metadata["track_number"] = int(str(track).split("/")[0])
                    except (ValueError, TypeError):
                        pass
                
                # Disc number
                disc = audio.tags.get("discnumber", [None])[0]
                if disc:
                    try:
                        metadata["disc_number"] = int(str(disc).split("/")[0])
                    except (ValueError, TypeError):
                        pass
            
            metadata["cover_art_url"] = MetadataService.extract_embedded_cover_art(file_path)
            return metadata
        except (OSError, MutagenFile.Error) as e:
            logger.error("Error extracting metadata from %s: %s", file_path, e)
            return {}
    
    @staticmethod
    def get_acoustid_fingerprint(file_path: str) -> Tuple[Optional[str], Optional[str]]:
        """Get AcoustID fingerprint and MusicBrainz Recording ID."""
        if not settings.acoustid_api_key:
            return None, None
        
        try:
            duration, fingerprint = acoustid.fingerprint_file(file_path)
            
            # Query AcoustID API
            results = acoustid.lookup(
                settings.acoustid_api_key,
                fingerprint,
                duration,
                meta='recordings'
            )
            
            for score, recording_id, title, artist in results:
                if score > 0.5:  # Confidence threshold
                    # Get MusicBrainz ID from first result
                    return fingerprint[:50], recording_id  # Store truncated fingerprint
            
            return fingerprint[:50], None
        except (OSError, RuntimeError) as e:
            logger.error("Error getting AcoustID for %s: %s", file_path, e)
            return None, None
    
    @staticmethod
    def fetch_cover_art(musicbrainz_recording_id: str) -> Optional[str]:
        """Fetch cover art URL from CoverArtArchive."""
        if not musicbrainz_recording_id:
            return None
        
        try:
            # First, get release info from recording
            url = f"https://musicbrainz.org/ws/2/recording/{musicbrainz_recording_id}"
            params = {
                "fmt": "json",
                "inc": "releases"
            }
            headers = {
                "User-Agent": settings.musicbrainz_user_agent
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code != 200:
                return None
            
            data = response.json()
            releases = data.get("releases", [])
            
            if not releases:
                return None
            
            # Try to get cover art from first release
            release_id = releases[0].get("id")
            if not release_id:
                return None
            
            cover_url = f"https://coverartarchive.org/release/{release_id}/front-500"
            
            # Check if cover exists
            cover_response = requests.head(cover_url, timeout=5)
            if cover_response.status_code == 200:
                return cover_url
            
            return None
        except (requests.RequestException, OSError) as e:
            logger.error("Error fetching cover art: %s", e)
            return None

    @staticmethod
    def fetch_cover_art_by_search(title: Optional[str], artist: Optional[str], album: Optional[str]) -> Optional[str]:
        """Fetch cover art using a metadata search fallback (iTunes Search API)."""
        if not title and not artist and not album:
            return None

        try:
            # Prefer artist + title for single-track matching quality.
            query_parts = [p for p in [artist, title, album] if p]
            if not query_parts:
                return None

            query = " ".join(query_parts)
            response = requests.get(
                "https://itunes.apple.com/search",
                params={
                    "term": query,
                    "media": "music",
                    "entity": "song",
                    "limit": 10,
                },
                timeout=10,
            )
            if response.status_code != 200:
                return None

            data = response.json()
            results = data.get("results", [])
            if not results:
                return None

            wanted_title = (title or "").strip().lower()
            wanted_artist = (artist or "").strip().lower()

            def score_result(item: dict) -> int:
                score = 0
                item_title = (item.get("trackName") or "").strip().lower()
                item_artist = (item.get("artistName") or "").strip().lower()
                item_album = (item.get("collectionName") or "").strip().lower()

                if wanted_title and wanted_title == item_title:
                    score += 5
                elif wanted_title and wanted_title in item_title:
                    score += 2

                if wanted_artist and wanted_artist == item_artist:
                    score += 5
                elif wanted_artist and wanted_artist in item_artist:
                    score += 2

                if album and album.strip().lower() == item_album:
                    score += 2

                return score

            best = max(results, key=score_result)
            artwork = best.get("artworkUrl100") or best.get("artworkUrl60")
            if not artwork:
                return None

            # iTunes artwork URLs are size-based; request higher resolution.
            return artwork.replace("100x100bb", "600x600bb").replace("60x60bb", "600x600bb")
        except (requests.RequestException, OSError) as e:
            logger.error("Error fetching fallback cover art: %s", e)
            return None
    
    @staticmethod
    def search_cover_art_options(query: str, limit: int = 12) -> List[dict]:
        """Search for multiple cover art options using iTunes Search API.
        
        Returns a list of dicts with artwork URLs and metadata.
        """
        if not query or not query.strip():
            return []
        
        try:
            response = requests.get(
                "https://itunes.apple.com/search",
                params={
                    "term": query.strip(),
                    "media": "music",
                    "entity": "song",
                    "limit": limit,
                },
                timeout=10,
            )
            if response.status_code != 200:
                return []
            
            data = response.json()
            results = data.get("results", [])
            
            covers = []
            seen_urls = set()
            
            for item in results:
                artwork = item.get("artworkUrl100") or item.get("artworkUrl60")
                if not artwork:
                    continue
                
                # Get high-res version
                high_res_url = artwork.replace("100x100bb", "600x600bb").replace("60x60bb", "600x600bb")
                
                # Skip duplicates
                if high_res_url in seen_urls:
                    continue
                seen_urls.add(high_res_url)
                
                covers.append({
                    "url": high_res_url,
                    "preview_url": artwork,  # smaller for preview
                    "title": item.get("trackName", ""),
                    "artist": item.get("artistName", ""),
                    "album": item.get("collectionName", ""),
                    "source": "iTunes",
                })
            
            return covers
        except (requests.RequestException, OSError) as e:
            logger.error("Error searching cover art: %s", e)
            return []

    @staticmethod
    def _clean_lyrics(lyrics: str) -> str:
        """Clean lyrics by removing bracketed annotations and normalizing whitespace."""
        if not lyrics:
            return ""
        # Remove bracketed content like [Chorus], [Verse 1], etc.
        cleaned = re.sub(r'\[.*?\]', '', lyrics)
        # Remove parenthetical content that looks like annotations
        cleaned = re.sub(r'\(.*?\)', '', cleaned)
        # Normalize whitespace
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        cleaned = cleaned.strip()
        return cleaned

    @staticmethod
    def fetch_lyrics_from_genius(artist: str, title: str) -> Optional[str]:
        """Fetch plain lyrics from Genius API."""
        if not artist or not title:
            return None
        
        try:
            # Genius search endpoint (public, no auth required for search)
            search_url = "https://genius.com/api/search/multi"
            params = {
                "q": f"{artist} {title}",
            }
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            response = requests.get(search_url, params=params, headers=headers, timeout=10)
            if response.status_code != 200:
                return None
            
            data = response.json()
            sections = data.get("response", {}).get("sections", [])
            
            # Find song results
            for section in sections:
                if section.get("type") == "song":
                    hits = section.get("hits", [])
                    for hit in hits:
                        result = hit.get("result", {})
                        result_artist = result.get("primary_artist", {}).get("name", "").lower()
                        result_title = result.get("title", "").lower()
                        
                        # Check for match
                        if artist.lower() in result_artist or result_artist in artist.lower():
                            if title.lower() in result_title or result_title in title.lower():
                                # Found a match - get the lyrics page
                                lyrics_path = result.get("path")
                                if lyrics_path:
                                    lyrics_url = f"https://genius.com{lyrics_path}"
                                    return MetadataService._scrape_genius_lyrics(lyrics_url)
            
            return None
        except (requests.RequestException, OSError) as e:
            logger.error("Error fetching Genius lyrics: %s", e)
            return None

    @staticmethod
    def _scrape_genius_lyrics(url: str) -> Optional[str]:
        """Scrape lyrics from a Genius song page."""
        try:
            from bs4 import BeautifulSoup
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find lyrics container - Genius uses data-lyrics-container attribute
            lyrics_divs = soup.find_all("div", {"data-lyrics-container": "true"})
            if not lyrics_divs:
                # Fallback: try to find by class
                lyrics_divs = soup.find_all("div", class_=lambda x: x and "Lyrics__Container" in x if x else False)
            
            if lyrics_divs:
                lyrics_parts = []
                for div in lyrics_divs:
                    # Get text, preserving some structure
                    text = div.get_text(separator='\n', strip=True)
                    lyrics_parts.append(text)
                
                full_lyrics = '\n'.join(lyrics_parts)
                # Clean up - remove bracketed content
                return MetadataService._clean_lyrics(full_lyrics)
            
            return None
        except (requests.RequestException, OSError) as e:
            logger.error("Error scraping Genius lyrics: %s", e)
            return None

    @staticmethod
    def fetch_synced_lyrics(artist: str, title: str, duration: float) -> Tuple[Optional[str], Optional[str]]:
        """Fetch synced lyrics from LRCLIB API and plain lyrics from Genius as fallback."""
        if not artist or not title:
            return None, None
        
        synced_lyrics = None
        plain_lyrics = None
        
        # Try LRCLIB first for synced lyrics
        try:
            url = "https://lrclib.net/api/search"
            params = {
                "artist_name": artist,
                "track_name": title,
                "duration": int(duration) if duration else None
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                results = response.json()
                if results:
                    first = results[0]
                    synced_lyrics = first.get("syncedLyrics")
                    plain_lyrics = first.get("plainLyrics")
                    # Clean plain lyrics only; preserve LRC timestamps in synced lyrics
                    if plain_lyrics:
                        plain_lyrics = MetadataService._clean_lyrics(plain_lyrics)
        except (requests.RequestException, OSError) as e:
            logger.error("Error fetching from LRCLIB: %s", e)
        
        # If no plain lyrics from LRCLIB, try Genius
        if not plain_lyrics:
            genius_lyrics = MetadataService.fetch_lyrics_from_genius(artist, title)
            if genius_lyrics:
                plain_lyrics = genius_lyrics
        
        return synced_lyrics, plain_lyrics


class LibraryService:
    """Service for managing music library."""
    
    @staticmethod
    async def scan_directory_async(session: Session, directory: str, full_scan: bool = False) -> ScanLog:
        """Async version of scan_directory for high-performance scanning."""
        # Prevent concurrent scans to avoid SQLite deadlocks
        lock_fd = _acquire_scan_lock(timeout=5.0)
        if lock_fd is None:
            # Another scan is running; return a dummy log
            scan_log = ScanLog(
                scan_type="full" if full_scan else "incremental",
                started_at=datetime.now(timezone.utc),
                status="skipped",
                completed_at=datetime.now(timezone.utc),
                errors="Scan skipped because another scan is already running"
            )
            session.add(scan_log)
            session.commit()
            session.refresh(scan_log)
            logger.info("Scan skipped: another scan is already running")
            return scan_log
        
        try:
            scan_log = ScanLog(
                scan_type="full" if full_scan else "incremental",
                started_at=datetime.now(timezone.utc),
                status="running"
            )
            session.add(scan_log)
            session.commit()
            session.refresh(scan_log)
            
            try:
                # Use the high-performance async scanner
                result = await AsyncMetadataService.scan_directory_async(session, directory, full_scan)
                
                scan_log.tracks_added = result["tracks_added"]
                scan_log.tracks_updated = result["tracks_updated"]
                scan_log.errors = "\n".join(result["errors"]) if result["errors"] else None
                
                # Update folder-based playlists from top-level subdirectories
                LibraryService._update_folder_playlists(session, directory, scan_log)
                
                scan_log.status = "completed"
                scan_log.completed_at = datetime.now(timezone.utc)
                session.add(scan_log)
                session.commit()
                session.refresh(scan_log)
                
                logger.info("Async scan completed successfully")
                return scan_log
                
            except (OSError, RuntimeError) as e:
                error_msg = f"Async scan failed: {e}"
                logger.error("%s", error_msg)
                scan_log.status = "failed"
                scan_log.errors = error_msg
                scan_log.completed_at = datetime.now(timezone.utc)
                session.add(scan_log)
                session.commit()
                session.refresh(scan_log)
                raise
                
        finally:
            _release_scan_lock(lock_fd)
    
    @staticmethod
    def scan_directory(session: Session, directory: str, full_scan: bool = False) -> ScanLog:
        """Scan music directory and update database."""
        # Prevent concurrent scans to avoid SQLite deadlocks
        lock_fd = _acquire_scan_lock(timeout=5.0)
        if lock_fd is None:
            # Another scan is running; return a dummy log
            scan_log = ScanLog(
                scan_type="full" if full_scan else "incremental",
                started_at=datetime.now(timezone.utc),
                status="skipped",
                completed_at=datetime.now(timezone.utc),
                errors="Scan skipped because another scan is already running"
            )
            session.add(scan_log)
            session.commit()
            session.refresh(scan_log)
            logger.info("Scan skipped: another scan is already running")
            return scan_log
        
        try:
            scan_log = ScanLog(
                scan_type="full" if full_scan else "incremental",
                started_at=datetime.now(timezone.utc),
                status="running"
            )
            session.add(scan_log)
            session.commit()
            session.refresh(scan_log)
            
            try:
                # Normalize the directory path for consistent path handling
                directory = os.path.normpath(directory)
                
                # SAFETY CHECK: Verify the music directory is accessible before scanning
                if not os.path.exists(directory):
                    error_msg = f"Music directory does not exist: {directory}"
                    logger.error("%s", error_msg)
                    scan_log.status = "failed"
                    scan_log.errors = error_msg
                    scan_log.completed_at = datetime.now(timezone.utc)
                    session.commit()
                    session.refresh(scan_log)
                    raise FileNotFoundError(error_msg)
                
                # SAFETY CHECK: Verify we can actually read the directory contents
                try:
                    test_entries = os.listdir(directory)
                except (OSError, PermissionError) as e:
                    error_msg = f"Cannot read music directory: {e}"
                    logger.error("%s", error_msg)
                    scan_log.status = "failed"
                    scan_log.errors = error_msg
                    scan_log.completed_at = datetime.now(timezone.utc)
                    session.commit()
                    session.refresh(scan_log)
                    raise RuntimeError(error_msg)
                
                # SAFETY CHECK: If directory exists but is EMPTY, abort the scan entirely.
                # This prevents Nextcloud unmount/sync issues from wiping the database.
                if len(test_entries) == 0:
                    error_msg = (
                        f"SAFETY STOP: Music directory exists but is EMPTY: {directory}. "
                        f"This likely means the storage mount is unavailable. "
                        f"Aborting scan to prevent database wipe."
                    )
                    logger.error("%s", error_msg)
                    scan_log.status = "failed"
                    scan_log.errors = error_msg
                    scan_log.completed_at = datetime.now(timezone.utc)
                    session.commit()
                    session.refresh(scan_log)
                    raise RuntimeError(error_msg)
                
                # SAFETY CHECK: Verify a heartbeat file to confirm Nextcloud is accessible.
                # If the mount is real, there should be actual content.
                # Check that at least one subdirectory or file has content beyond empty dirs.
                has_real_content = False
                for entry in test_entries:
                    entry_path = os.path.join(directory, entry)
                    if os.path.isfile(entry_path):
                        has_real_content = True
                        break
                    if os.path.isdir(entry_path):
                        try:
                            sub_entries = os.listdir(entry_path)
                            if sub_entries:
                                has_real_content = True
                                break
                        except (OSError, PermissionError):
                            continue
                if not has_real_content:
                    error_msg = (
                        f"SAFETY STOP: Music directory has entries but no readable content. "
                        f"All subdirectories appear empty. "
                        f"Aborting scan to prevent database wipe from mount issue."
                    )
                    logger.error("%s", error_msg)
                    scan_log.status = "failed"
                    scan_log.errors = error_msg
                    scan_log.completed_at = datetime.now(timezone.utc)
                    session.commit()
                    session.refresh(scan_log)
                    raise RuntimeError(error_msg)
                
                supported_formats = {".mp3", ".flac", ".m4a", ".ogg", ".wav", ".webm"}
                
                # Build dictionary of existing tracks keyed by file_path AND by inode
                existing_tracks = {}  # by file_path
                existing_tracks_by_inode = {}  # by (inode, device) for hardlink detection
                
                stmt = select(Track)
                for track in session.exec(stmt):
                    existing_tracks[track.file_path] = track
                    # Also index by inode for hardlink detection
                    if track.inode and track.device:
                        existing_tracks_by_inode[(track.inode, track.device)] = track
                
                logger.info("Loaded %d existing tracks, %d indexed by inode", len(existing_tracks), len(existing_tracks_by_inode))
                
                # Get existing playlists by folder path (used for auto‑playlist
                # generation).  These are removed later if their folder disappears.
                existing_playlists = {}
                stmt = select(Playlist).where(Playlist.folder_path.isnot(None))
                for playlist in session.exec(stmt):
                    existing_playlists[playlist.folder_path] = playlist
                
                scanned_paths = set()
                scanned_folders = set()
                folder_tracks = {}  # folder_path -> list of (track_id, relative_path)
                
    # Walk through directory and process audio files.  All files under a
                # given first‑level subdirectory are grouped into a playlist named for
                # that directory.  Deeper folders are ignored for playlist creation but
                # their tracks still belong to the parent top folder.
                for root, dirs, files in os.walk(directory):
                    dirs.sort(key=lambda name: name.lower())
                    files.sort(key=lambda name: name.lower())
                    # Determine top folder relative to the canonical music dir so
                    # subdirectory scans still attribute tracks to the correct playlist.
                    try:
                        root_rel_to_music = Path(root).relative_to(settings.music_dir)
                    except ValueError:
                        root_rel_to_music = Path(root).relative_to(directory)
                    top_folder = None
                    top_root = None
                    if len(root_rel_to_music.parts) >= 1:
                        top_folder = root_rel_to_music.parts[0]
                        top_root = os.path.join(settings.music_dir, top_folder)
                        # Store as /music/... path for container portability
                        top_root_stored = os.path.join('/music', top_folder)

                        # record existence of this top‑level folder
                        scanned_folders.add(top_root)

                        if top_root not in existing_playlists and top_root_stored not in existing_playlists:
                            playlist = Playlist(
                                name=top_folder,
                                folder_path=top_root_stored
                            )
                            session.add(playlist)
                            session.commit()
                            session.refresh(playlist)
                            existing_playlists[top_root] = playlist
                            existing_playlists[top_root_stored] = playlist
                            logger.info("Created playlist from top folder: %s", top_folder)
                        else:
                            # Ensure both path variants are indexed so folder_tracks
                            # lookups (which use the absolute path) work for existing
                            # playlists that were loaded from the DB.
                            playlist = existing_playlists.get(top_root) or existing_playlists.get(top_root_stored)
                            if playlist:
                                existing_playlists[top_root] = playlist
                                existing_playlists[top_root_stored] = playlist

                    # read vibe.json for ordering if present in any subdir
                    vibe_json_path = os.path.join(root, "vibe.json")
                    vibe_order = {}
                    if os.path.exists(vibe_json_path):
                        try:
                            with open(vibe_json_path, 'r') as f:
                                vibe_data = json.load(f)
                                vibe_order = {item["filename"]: idx for idx, item in enumerate(vibe_data.get("tracks", []))}
                        except (OSError, json.JSONDecodeError) as e:
                            logger.error("Error reading vibe.json at %s: %s", vibe_json_path, e)

                    for file in files:
                        ext = os.path.splitext(file)[1].lower()
                        if ext not in supported_formats:
                            continue

                        file_path = os.path.join(root, file)
                        logger.debug("Processing: %s", file)
                        # Store path relative to music dir for container compatibility
                        # Use settings.music_dir (the canonical root) instead of directory
                        # so that subdirectory scans still produce correct /music/... paths
                        rel_file_path = os.path.relpath(file_path, settings.music_dir)
                        stored_path = os.path.join('/music', rel_file_path)
                        scanned_paths.add(stored_path)

                        relative_path = None
                        if top_root:
                            folder_tracks.setdefault(top_root, [])
                            try:
                                relative_path = os.path.relpath(file_path, top_root)
                            except ValueError:
                                relative_path = file

                        # file metadata and stats
                        file_stat = os.stat(file_path)
                        last_modified = datetime.fromtimestamp(file_stat.st_mtime)
                        file_inode = file_stat.st_ino
                        file_device = file_stat.st_dev

                        # Check for hardlink - if this inode already exists, use that track
                        hardlink_track = existing_tracks_by_inode.get((file_inode, file_device))
                        
                        if hardlink_track:
                            # This is a hardlink to an existing track
                            logger.info("Hardlink detected: %s -> existing track %d", file, hardlink_track.id)
                            
                            # Update the track's path if the current path is different
                            # (handles case where primary file was deleted)
                            if hardlink_track.file_path != stored_path:
                                # Check if another track already has this path (stale entry)
                                conflicting_track = existing_tracks.get(stored_path)
                                if conflicting_track and conflicting_track.id != hardlink_track.id:
                                    logger.info("Removing stale track %d at %s", conflicting_track.id, stored_path)
                                    # Delete conflicting track's playlist entries
                                    pt_stmt = select(PlaylistTrack).where(PlaylistTrack.track_id == conflicting_track.id)
                                    for pt in session.exec(pt_stmt):
                                        session.delete(pt)
                                    session.delete(conflicting_track)
                                    # Flush so the delete is applied before the update
                                    session.flush()
                                    # Remove from lookup dicts
                                    existing_tracks.pop(stored_path, None)
                                    existing_tracks.pop(conflicting_track.file_path, None)
                                    existing_tracks_by_inode.pop((conflicting_track.inode, conflicting_track.device), None)
                                    scan_log.tracks_removed += 1
                                
                                logger.info("Updating path: %s -> %s", hardlink_track.file_path, stored_path)
                                # Remove old path entry from dict before updating
                                existing_tracks.pop(hardlink_track.file_path, None)
                                hardlink_track.file_path = stored_path
                                hardlink_track.filename = file
                                hardlink_track.last_modified = last_modified
                                hardlink_track.file_size = file_stat.st_size
                                hardlink_track.updated_at = datetime.now(timezone.utc)
                                session.add(hardlink_track)
                                existing_tracks[stored_path] = hardlink_track
                                scan_log.tracks_updated += 1
                            
                            # Add to playlist
                            if top_root and relative_path is not None:
                                folder_tracks[top_root].append((hardlink_track.id, relative_path))
                            scanned_paths.add(stored_path)
                            continue
                        
                        # Check for existing track by path (normal case)
                        existing_track = existing_tracks.get(stored_path) or existing_tracks.get(file_path)
                        
                        # Log track lookup for diagnostics
                        if existing_track:
                            if existing_track.is_custom_metadata or existing_track.is_custom_cover:
                                logger.debug("Found track with custom flags: %d (meta=%s, cover=%s)", existing_track.id, existing_track.is_custom_metadata, existing_track.is_custom_cover)
                                logger.debug("  Path: %s", stored_path)
                                logger.debug("  File modified: %s, Track modified: %s", last_modified, existing_track.last_modified)
                        else:
                            logger.debug("New track (not in existing_tracks): %s", stored_path)

                        if existing_track and not full_scan and existing_track.last_modified >= last_modified:
                            # unchanged track, still add to playlist list
                            if top_root and relative_path is not None:
                                folder_tracks[top_root].append((existing_track.id, relative_path))
                            continue

                        # extract metadata
                        metadata = MetadataService.extract_metadata(file_path)
                        
                        # Parse and split artist into main and featured
                        raw_artist = metadata.get('artist')
                        if raw_artist:
                            main_artist, featured = _parse_artists(raw_artist)
                            metadata['artist'] = main_artist
                            metadata['featured_artists'] = featured

                        if existing_track:
                            # update existing – don't overwrite fields that already
                            # have a value with None (e.g. cover_art_url fetched
                            # from an external source shouldn't be wiped when the
                            # file itself has no embedded art).
                            # CRITICAL: Never overwrite cover_art_url if is_custom_cover is True.
                            # This flag is set when user uploads a custom cover and persists forever.
                            # ALSO CRITICAL: Never overwrite metadata (title, artist, album) if
                            # is_custom_metadata is True - this preserves user-edited track info.
                            custom_metadata_fields = {'title', 'artist', 'album', 'album_artist'}
                            
                            # Log metadata protection status at debug level
                            if existing_track.is_custom_metadata:
                                logger.debug("Protecting metadata for track %d: %s", existing_track.id, existing_track.title)
                                logger.debug("  Current: title='%s', artist='%s', album='%s'", existing_track.title, existing_track.artist, existing_track.album)
                                logger.debug("  Incoming: title='%s', artist='%s', album='%s'", metadata.get('title'), metadata.get('artist'), metadata.get('album'))
                            
                            for key, value in metadata.items():
                                if key == 'cover_art_url':
                                    if existing_track.is_custom_cover:
                                        # NEVER overwrite user-uploaded custom cover
                                        continue
                                    # If setting a new cover and it's a data URI, mark as custom
                                    if value and value.startswith('data:'):
                                        existing_track.is_custom_cover = True
                                if key in custom_metadata_fields and existing_track.is_custom_metadata:
                                    # NEVER overwrite user-edited metadata (title, artist, album, etc)
                                    logger.debug("  Skipping %s: '%s' (preserving user edit)", key, value)
                                    continue
                                if value is not None or getattr(existing_track, key, None) is None:
                                    setattr(existing_track, key, value)
                            existing_track.last_modified = last_modified
                            existing_track.updated_at = datetime.now(timezone.utc)
                            existing_track.file_size = file_stat.st_size
                            # Update path to new format if needed
                            existing_track.file_path = stored_path
                            # Store inode/device for hardlink detection
                            existing_track.inode = file_inode
                            existing_track.device = file_device
                            scan_log.tracks_updated += 1
                            if top_root and relative_path is not None:
                                folder_tracks[top_root].append((existing_track.id, relative_path))
                        else:
                            # new track - check if cover is data URI (custom)
                            is_custom = bool(metadata.get('cover_art_url') and metadata['cover_art_url'].startswith('data:'))
                            track = Track(
                                file_path=stored_path,
                                filename=file,
                                file_size=file_stat.st_size,
                                last_modified=last_modified,
                                inode=file_inode,
                                device=file_device,
                                is_custom_cover=is_custom,
                                **{k: v for k, v in metadata.items() if k != 'cover_art_url'}
                            )
                            track.cover_art_url = metadata.get('cover_art_url')
                            session.add(track)
                            session.commit()
                            session.refresh(track)
                            # Also index this new track by inode for subsequent hardlinks in same scan
                            existing_tracks_by_inode[(file_inode, file_device)] = track
                            scan_log.tracks_added += 1
                            if top_root and relative_path is not None:
                                folder_tracks[top_root].append((track.id, relative_path))

                        session.commit()
                
                # Update playlist tracks for all folders
                for folder_path, track_entries in folder_tracks.items():
                    playlist = existing_playlists.get(folder_path)
                    if playlist and track_entries:
                        # Sort tracks by filename (case-insensitive, numeric-aware) so that
                        # newly created playlists follow the same stable ordering as the UI.
                        ordered_entries = sorted(
                            track_entries,
                            key=lambda item: (os.path.basename(item[1]).lower(), item[1].lower())
                        )

                        # Load existing playlist entries and keep their stored position.
                        existing_pts = {
                            pt.track_id: pt
                            for pt in session.exec(
                                select(PlaylistTrack).where(PlaylistTrack.playlist_id == playlist.id)
                            ).all()
                        }

                        desired_track_ids = [track_id for track_id, _ in ordered_entries]

                        # Remove any tracks that no longer exist on disk.
                        for track_id in list(existing_pts.keys()):
                            if track_id not in desired_track_ids:
                                session.delete(existing_pts[track_id])
                                del existing_pts[track_id]

                        # Add any new tracks to the end (preserving any manual ordering). This
                        # keeps user reorders stable across rescans while still ensuring new
                        # files appear in a deterministic place.
                        max_position = max((pt.position for pt in existing_pts.values()), default=-1)
                        for track_id in desired_track_ids:
                            if track_id in existing_pts:
                                continue
                            max_position += 1
                            playlist_track = PlaylistTrack(
                                playlist_id=playlist.id,
                                track_id=track_id,
                                position=max_position
                            )
                            session.add(playlist_track)

                        session.commit()
                
                # SAFETY CHECK: Prevent mass deletion if scan found very few files
                # This protects against network/mount issues with Nextcloud storage
                if len(existing_tracks) > 10 and len(scanned_paths) < len(existing_tracks) * 0.5:
                    safety_warning = (
                        f"SAFETY STOP: Scan found only {len(scanned_paths)} files "
                        f"but database has {len(existing_tracks)} tracks. "
                        f"Skipping removal to prevent data loss from temporary storage unavailability."
                    )
                    logger.error("%s", safety_warning)
                    scan_log.errors = safety_warning
                    # Still commit the scan log with what we found, but don't remove tracks
                else:
                    # Remove deleted playlists (folders that no longer exist)
                    for folder_path, playlist in list(existing_playlists.items()):
                        # Normalize paths for comparison
                        norm_folder_path = os.path.normpath(folder_path)
                        norm_scanned = {os.path.normpath(p) for p in scanned_folders}
                        # Also check if stored as /music/... format
                        if folder_path.startswith('/music/'):
                            # Extract folder name and check against scanned folders
                            folder_name = folder_path[7:]  # Remove '/music/' prefix
                            # Check if any scanned folder ends with this folder name
                            matches_scanned = any(
                                os.path.normpath(p).endswith(os.sep + folder_name) or 
                                os.path.normpath(p) == folder_name or
                                os.path.basename(os.path.normpath(p)) == folder_name
                                for p in scanned_folders
                            )
                            if matches_scanned:
                                continue
                        if norm_folder_path not in norm_scanned:
                            # Double-check: is this a /music/ path that corresponds to a scanned folder?
                            if not (folder_path.startswith('/music/') and any(
                                os.path.basename(os.path.normpath(p)) == os.path.basename(folder_path)
                                for p in scanned_folders
                            )):
                                logger.info("Removing playlist for deleted folder: %s", playlist.name)
                                # Delete associated PlaylistTrack records first
                                pt_stmt = select(PlaylistTrack).where(PlaylistTrack.playlist_id == playlist.id)
                                for pt in session.exec(pt_stmt):
                                    session.delete(pt)
                                session.delete(playlist)
                    session.commit()
                    
                    # Remove deleted tracks (files that weren't seen during this scan).
                    for file_path, track in list(existing_tracks.items()):
                        # Check both old format (full path) and new format (/music/...)
                        # Re-fetch track from session to avoid stale-object / lazy-load issues
                        try:
                            track_id = track.id          # fast path if object is still fresh
                        except Exception:
                            # Expired / detached object — pull primary key from instance state directly
                            track_id = track.__dict__.get('id')
                        if track_id is None:
                            continue
                        track = session.get(Track, track_id)
                        if track is None:
                            # track already deleted by a prior partial scan run; skip
                            continue
                        if file_path not in scanned_paths:
                            # Remove associated playlist track entries first
                            pt_stmt = select(PlaylistTrack).where(PlaylistTrack.track_id == track.id)
                            for pt in session.exec(pt_stmt):
                                session.delete(pt)
                            # Remove associated embedding rows before deleting the track
                            emb_stmt = select(TrackEmbedding).where(TrackEmbedding.track_id == track.id)
                            for emb in session.exec(emb_stmt):
                                session.delete(emb)
                            # Remove play_history entries — FK has no ON DELETE CASCADE and track_id is NOT NULL
                            ph_stmt = select(PlayHistory).where(PlayHistory.track_id == track.id)
                            for ph in session.exec(ph_stmt):
                                session.delete(ph)
                            session.delete(track)
                            scan_log.tracks_removed = (scan_log.tracks_removed or 0) + 1
                    # commit removed tracks, embeddings, and playlist_tracks together
                    session.commit()
                
                # Mark scan as completed
                scan_log.completed_at = datetime.now(timezone.utc)
                scan_log.status = "completed"
                session.commit()
                session.refresh(scan_log)

                # update semantic embeddings for new/updated tracks
                try:
                    from embeddings import ensure_embeddings
                    ensure_embeddings(session)
                except (OSError, RuntimeError) as e:
                    logger.error("Error building embeddings: %s", e)

                return scan_log
            except (OSError, RuntimeError) as e:
                scan_log.status = "failed"
                scan_log.errors = str(e)
                scan_log.completed_at = datetime.now(timezone.utc)
                session.commit()
                session.refresh(scan_log)
            raise
        finally:
            _release_scan_lock(lock_fd)
    
    @staticmethod
    def _update_folder_playlists(session: Session, directory: str, scan_log: ScanLog):
        """Create/update folder-based playlists from top-level subdirectories.
        
        Mirrors the folder playlist logic from scan_directory so that the
        async scan path also produces playlists from folder structure.
        """
        import os as _os
        from pathlib import Path as _Path
        
        supported_formats = {".mp3", ".flac", ".m4a", ".ogg", ".wav", ".webm"}
        
        # Fetch existing folder-based playlists
        existing_playlists = {}
        stmt = select(Playlist).where(Playlist.folder_path.isnot(None))
        for playlist in session.exec(stmt):
            existing_playlists[playlist.folder_path] = playlist
        
        scanned_folders = set()
        folder_tracks = {}
        
        for root, dirs, files in _os.walk(directory):
            dirs.sort(key=lambda n: n.lower())
            files.sort(key=lambda n: n.lower())
            
            try:
                root_rel = _Path(root).relative_to(settings.music_dir)
            except ValueError:
                root_rel = _Path(root).relative_to(directory)
            
            if len(root_rel.parts) < 1:
                continue
            
            top_folder = root_rel.parts[0]
            top_root = _os.path.join(settings.music_dir, top_folder)
            top_root_stored = _os.path.join('/music', top_folder)
            
            scanned_folders.add(top_root)
            
            # Create playlist from this folder if it doesn't exist
            playlist = existing_playlists.get(top_root) or existing_playlists.get(top_root_stored)
            if not playlist:
                playlist = Playlist(
                    name=top_folder,
                    folder_path=top_root_stored
                )
                session.add(playlist)
                session.commit()
                session.refresh(playlist)
                existing_playlists[top_root] = playlist
                existing_playlists[top_root_stored] = playlist
                logger.info("Created playlist from top folder: %s", top_folder)
            else:
                existing_playlists[top_root] = playlist
                existing_playlists[top_root_stored] = playlist
            
            for file in files:
                ext = _os.path.splitext(file)[1].lower()
                if ext not in supported_formats:
                    continue
                
                file_path = _os.path.join(root, file)
                rel_path = _os.path.relpath(file_path, settings.music_dir)
                stored_path = _os.path.join('/music', rel_path)
                
                # Look up the track by file_path
                track = session.exec(
                    select(Track).where(Track.file_path == stored_path)
                ).first()
                if not track:
                    continue
                
                try:
                    track_rel_to_top = _os.path.relpath(file_path, top_root)
                except ValueError:
                    track_rel_to_top = file
                
                folder_tracks.setdefault(top_root, []).append((track.id, track_rel_to_top))
        
        # Save playlist-track associations
        for folder_path, track_entries in folder_tracks.items():
            playlist = existing_playlists.get(folder_path)
            if not playlist or not track_entries:
                continue
            
            ordered_entries = sorted(
                track_entries,
                key=lambda item: (_os.path.basename(item[1]).lower(), item[1].lower())
            )
            
            existing_pts = {
                pt.track_id: pt
                for pt in session.exec(
                    select(PlaylistTrack).where(PlaylistTrack.playlist_id == playlist.id)
                ).all()
            }
            
            desired_track_ids = [track_id for track_id, _ in ordered_entries]
            
            # Remove tracks no longer on disk
            for track_id in list(existing_pts.keys()):
                if track_id not in desired_track_ids:
                    session.delete(existing_pts[track_id])
                    del existing_pts[track_id]
            
            # Add new tracks
            max_position = max((pt.position for pt in existing_pts.values()), default=-1)
            for track_id in desired_track_ids:
                if track_id in existing_pts:
                    continue
                max_position += 1
                playlist_track = PlaylistTrack(
                    playlist_id=playlist.id,
                    track_id=track_id,
                    position=max_position
                )
                session.add(playlist_track)
            
            session.commit()
        
        # Remove playlists for folders that no longer exist
        for folder_path, playlist in list(existing_playlists.items()):
            if folder_path.startswith('/music/'):
                folder_name = folder_path[7:]
                matches_scanned = any(
                    _os.path.normpath(p).endswith(_os.sep + folder_name) or
                    _os.path.normpath(p) == folder_name or
                    _os.path.basename(_os.path.normpath(p)) == folder_name
                    for p in scanned_folders
                )
                if matches_scanned:
                    continue
            if _os.path.normpath(folder_path) not in {_os.path.normpath(p) for p in scanned_folders}:
                if not (folder_path.startswith('/music/') and any(
                    _os.path.basename(_os.path.normpath(p)) == _os.path.basename(folder_path)
                    for p in scanned_folders
                )):
                    logger.info("Removing playlist for deleted folder: %s", playlist.name)
                    pt_stmt = select(PlaylistTrack).where(PlaylistTrack.playlist_id == playlist.id)
                    for pt in session.exec(pt_stmt):
                        session.delete(pt)
                    session.delete(playlist)
        session.commit()

    @staticmethod
    def enrich_track_metadata(session: Session, track_id: int):
        """Enrich track with external metadata (AcoustID, cover art, lyrics)."""
        track = session.get(Track, track_id)
        if not track:
            return
        
        # Get AcoustID and MusicBrainz ID
        if not track.acoustid or not track.musicbrainz_recording_id:
            acoustid, mb_id = MetadataService.get_acoustid_fingerprint(track.file_path)
            if acoustid:
                track.acoustid = acoustid
            if mb_id:
                track.musicbrainz_recording_id = mb_id
        
        # Get cover art ONLY if not a custom user-uploaded cover
        if not track.is_custom_cover and not track.cover_art_url:
            embedded_cover = MetadataService.extract_embedded_cover_art(track.file_path)
            if embedded_cover:
                track.cover_art_url = embedded_cover

        if not track.is_custom_cover and not track.cover_art_url and track.musicbrainz_recording_id:
            cover_url = MetadataService.fetch_cover_art(track.musicbrainz_recording_id)
            if cover_url:
                track.cover_art_url = cover_url

        # Fallback cover art by metadata search if MusicBrainz path did not resolve.
        if not track.is_custom_cover and not track.cover_art_url:
            cover_url = MetadataService.fetch_cover_art_by_search(
                track.title,
                track.artist,
                track.album,
            )
            if cover_url:
                track.cover_art_url = cover_url
        
        # Get lyrics ONLY if not custom user-edited lyrics
        if not track.is_custom_lyrics and track.artist and track.title and track.duration:
            synced, plain = MetadataService.fetch_synced_lyrics(
                track.artist, track.title, track.duration
            )
            if synced:
                track.synced_lyrics = synced
            if plain and not track.lyrics:
                track.lyrics = plain
        
        track.updated_at = datetime.now(timezone.utc)
        session.commit()

    @staticmethod
    def auto_fill_missing_cover_art(session: Session, limit: Optional[int] = None, overwrite: bool = False) -> dict:
        """Fill missing cover art for tracks using available metadata sources."""
        stmt = select(Track)
        # NEVER overwrite custom covers - respect user uploads
        stmt = stmt.where(Track.is_custom_cover == False)
        if not overwrite:
            stmt = stmt.where(
                or_(
                    Track.cover_art_url.is_(None),
                    Track.cover_art_url == "",
                )
            )

        if limit is not None:
            stmt = stmt.limit(limit)

        tracks = session.exec(stmt).all()

        updated = 0
        checked = 0
        for track in tracks:
            checked += 1

            current_cover = (track.cover_art_url or "").strip()
            if current_cover and not overwrite:
                continue

            cover_url = None
            embedded_cover = MetadataService.extract_embedded_cover_art(track.file_path)
            if embedded_cover:
                cover_url = embedded_cover

            if not cover_url and track.musicbrainz_recording_id:
                cover_url = MetadataService.fetch_cover_art(track.musicbrainz_recording_id)

            if not cover_url:
                cover_url = MetadataService.fetch_cover_art_by_search(
                    track.title,
                    track.artist,
                    track.album,
                )

            # Final fallback for poorly tagged files: derive a query from
            # filename so we still have a chance to fetch art.
            if not cover_url:
                stem = Path(track.filename or "").stem
                if stem:
                    derived_title = re.sub(r"[_\-]+", " ", stem)
                    derived_title = re.sub(r"\s+", " ", derived_title).strip()
                    cover_url = MetadataService.fetch_cover_art_by_search(
                        derived_title,
                        track.artist,
                        track.album,
                    )

            if cover_url:
                track.cover_art_url = cover_url
                track.updated_at = datetime.now(timezone.utc)
                updated += 1

        session.commit()

        return {
            "checked": checked,
            "updated": updated,
            "limit": limit,
            "overwrite": overwrite,
        }
