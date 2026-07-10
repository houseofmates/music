#!/usr/bin/env python3
"""
Music File Watcher & Auto-Organizer

This background worker:
1. Watches the music directory for new files
2. Auto-lowercases all files and folders
3. Auto-organizes music by reading ID3 tags and moving to <artist>/<album>/<song>.mp3
4. Triggers library scans when changes are detected
"""

import os
import shutil
import time
import logging
from pathlib import Path
from typing import Optional, Union
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent, FileMovedEvent
from mutagen import File as MutagenFile  # type: ignore[attr-defined]
from sqlmodel import Session
from config import settings
from database import engine
from services import LibraryService


logger = logging.getLogger(__name__)


class MusicFileHandler(FileSystemEventHandler):
    """Handler for music file system events."""
    
    def __init__(self, music_dir: str):
        self.music_dir = Path(music_dir)
        self.processing = set()  # Track files being processed to avoid loops
        self.pending_scan = False
        self.last_scan_time = 0
        self.scan_cooldown = 30  # 30-second debounce to avoid scanning during Nextcloud sync
    
    def on_created(self, event: FileSystemEvent):
        """Handle file/directory creation."""
        if event.is_directory:
            self._lowercase_path(event.src_path)
        else:
            self._process_new_file(event.src_path)
    
    def on_moved(self, event: FileSystemEvent):
        """Handle file/directory move."""
        if not event.is_directory:
            self._process_new_file(event.dest_path)
    
    def _should_skip_lowercase(self, p: Path) -> bool:
        """Skip lowercasing for temporary/download-in-progress files."""
        name = p.name.lower()
        # yt-dlp temp files
        if name.startswith('temp_') or name.startswith('ytdl'):
            return True
        if name.endswith('.part') or name.endswith('.ytdl'):
            return True
        if name.endswith('.webp') or name.endswith('.jpg') or name.endswith('.png'):
            # Skip thumbnail downloads
            return True
        return False
    
    def _lowercase_path(self, path: Union[str, Path]) -> Optional[str]:
        """Recursively lowercase a file or directory path."""
        p = Path(path)
        
        if str(p) in self.processing:
            return None
        
        # Skip temporary files to avoid racing with active downloads
        if not p.is_dir() and self._should_skip_lowercase(p):
            return str(p)
        
        try:
            # Get relative path from music directory
            rel_path = p.relative_to(self.music_dir)
            
            # Build new lowercase path
            parts = []
            for part in rel_path.parts:
                lowercase_part = part.lower()
                parts.append(lowercase_part)
            
            new_rel_path = Path(*parts) if parts else Path()
            new_path = self.music_dir / new_rel_path
            
            # Check if rename is needed
            if p != new_path:
                self.processing.add(str(p))
                self.processing.add(str(new_path))
                
                # Ensure parent directory exists
                new_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Rename
                logger.info("Lowercasing: %s → %s", p.name, new_path.name)
                p.rename(new_path)
                
                self.processing.discard(str(p))
                self.processing.discard(str(new_path))
                
                return str(new_path)
            
            return str(p)
        except (OSError, shutil.Error) as e:
            logger.error("Error lowercasing %s: %s", p, e)
            self.processing.discard(str(p))
            return None
    
    def _extract_metadata_for_organizing(self, file_path: str) -> dict:
        """Extract basic metadata for organizing."""
        try:
            audio = MutagenFile(file_path, easy=True)
            if not audio or not audio.tags:
                return {}
            
            metadata = {}
            metadata["artist"] = audio.tags.get("artist", [None])[0]
            metadata["album"] = audio.tags.get("album", [None])[0]
            metadata["title"] = audio.tags.get("title", [None])[0]
            
            return metadata
        except Exception as e:
            logger.error("Error extracting metadata from %s: %s", file_path, e)
            return {}
    
    def _organize_file(self, file_path: Union[str, Path]):
        """Organize file based on ID3 tags."""
        fp = Path(file_path)
        
        if str(fp) in self.processing:
            return
        
        # Skip if already organized (in artist/album structure)
        rel_path = fp.relative_to(self.music_dir)
        if len(rel_path.parts) >= 3:  # Already in artist/album/song structure
            return
        
        # Only process music files
        supported_formats = {".mp3", ".flac", ".m4a", ".ogg", ".wav", ".webm"}
        if fp.suffix.lower() not in supported_formats:
            return
        
        try:
            self.processing.add(str(fp))
            
            # Extract metadata
            metadata = self._extract_metadata_for_organizing(str(fp))
            
            artist = metadata.get("artist")
            album = metadata.get("album")
            title = metadata.get("title")
            
            if not artist or not album:
                logger.warning("Insufficient metadata to organize: %s", fp.name)
                self.processing.discard(str(fp))
                return
            
            # Sanitize names
            artist = self._sanitize_filename(artist)
            album = self._sanitize_filename(album)
            
            # Build target path
            target_dir = self.music_dir / artist.lower() / album.lower()
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Use title if available, otherwise keep original filename
            if title:
                title = self._sanitize_filename(title)
                filename = f"{title.lower()}{fp.suffix.lower()}"
            else:
                filename = fp.name.lower()
            
            target_path = target_dir / filename
            
            # Handle duplicate filenames
            counter = 1
            original_target = target_path
            while target_path.exists():
                stem = original_target.stem
                suffix = original_target.suffix
                target_path = target_dir / f"{stem}_{counter}{suffix}"
                counter += 1
            
            # Move file
            logger.info("Organizing: %s → %s/%s/%s", fp.name, artist, album, target_path.name)
            shutil.move(str(fp), str(target_path))
            
            self.processing.discard(str(fp))
            
            # Trigger scan
            self._trigger_scan()
            
        except (OSError, shutil.Error) as e:
            logger.error("Error organizing %s: %s", fp, e)
            self.processing.discard(str(fp))
    
    def _sanitize_filename(self, name: str) -> str:
        """Sanitize filename by removing invalid characters and path traversal."""
        invalid_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
        for char in invalid_chars:
            name = name.replace(char, '_')
        # Prevent directory traversal
        name = name.replace('..', '_')
        return name.strip()
    
    def _process_new_file(self, file_path: str):
        """Process a new file."""
        # Only lowercase the file - don't organize/move files
        self._lowercase_path(file_path)
        # Trigger scan after file is processed
        self._trigger_scan()
    
    def _trigger_scan(self):
        """Trigger a library scan with 30-second debounce."""
        current_time = time.time()
        
        # Check if directory is readable before even scheduling a scan
        if not self._is_directory_readable():
            logger.warning("Music directory not readable, skipping scan trigger")
            self.pending_scan = False
            return
        
        # If we're within the cooldown window, just mark pending and wait
        if current_time - self.last_scan_time < self.scan_cooldown:
            self.pending_scan = True
            logger.info("Scan debounced - will retry after cooldown (%ss)", self.scan_cooldown)
            return
        
        self._perform_scan()
    
    def _is_directory_readable(self) -> bool:
        """Verify the music directory exists and is readable."""
        try:
            if not self.music_dir.exists():
                logger.error("Music directory does not exist: %s", self.music_dir)
                return False
            entries = os.listdir(self.music_dir)
            if len(entries) == 0:
                logger.warning("Music directory is empty (possible mount issue): %s", self.music_dir)
                return False
            return True
        except (OSError, PermissionError) as e:
            logger.error("Music directory not readable: %s", e)
            return False

    def _perform_scan(self):
        """Perform library scan (sync)."""
        # Double-check directory readability before actually scanning
        if not self._is_directory_readable():
            logger.warning("Directory became unreadable before scan started, aborting")
            self.pending_scan = False
            self.last_scan_time = time.time()
            return

        try:
            logger.info("Scanning library...")
            with Session(engine) as session:
                scan_log = LibraryService.scan_directory(
                    session,
                    settings.music_dir,
                    full_scan=False
                )
                logger.info(
                    "Scan complete: +%d tracks, ~%d updated, -%d removed",
                    scan_log.tracks_added,
                    scan_log.tracks_updated,
                    scan_log.tracks_removed
                )
            
            self.last_scan_time = time.time()
            self.pending_scan = False
        except (OSError, RuntimeError) as e:
            logger.error("Error during scan: %s", e)
            self.last_scan_time = time.time()
            self.pending_scan = False


def initial_lowercase_pass(music_dir: Path):
    """Perform initial pass to lowercase all existing files and folders."""
    logger.info("Performing initial lowercase pass...")
    
    # Process from deepest to shallowest to avoid path issues
    all_paths = []
    for root, dirs, files in os.walk(music_dir):
        root_path = Path(root)
        for d in dirs:
            all_paths.append((root_path / d, True))
        for f in files:
            all_paths.append((root_path / f, False))
    
    # Sort by depth (deepest first)
    all_paths.sort(key=lambda x: len(x[0].parts), reverse=True)
    
    for path, is_dir in all_paths:
        try:
            new_name = path.name.lower()
            if path.name != new_name:
                new_path = path.parent / new_name
                if not new_path.exists():
                    logger.info("Lowercasing: %s → %s", path.name, new_name)
                    path.rename(new_path)
        except (OSError, shutil.Error) as e:
            logger.error("Error lowercasing %s: %s", path, e)
    
    logger.info("Initial lowercase pass complete")


def main():
    """Main entry point for the file watcher."""
    music_dir = Path(settings.music_dir)
    
    if not music_dir.exists():
        logger.error("Music directory does not exist: %s", music_dir)
        logger.info("Creating directory...")
        music_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info("Music File Watcher Starting...")
    logger.info("Watching: %s", music_dir)
    
    # Perform initial lowercase pass
    initial_lowercase_pass(music_dir)
    
    # Perform initial scan
    logger.info("Performing initial library scan...")
    try:
        with Session(engine) as session:
            scan_log = LibraryService.scan_directory(
                session,
                str(music_dir),
                full_scan=True
            )
            logger.info("Initial scan complete: %d tracks found", scan_log.tracks_added)
    except (OSError, RuntimeError) as e:
        logger.error("Error during initial scan: %s", e)
    
    # Start file watcher
    event_handler = MusicFileHandler(str(music_dir))
    observer = Observer()
    observer.schedule(event_handler, str(music_dir), recursive=True)
    observer.start()
    
    logger.info("File watcher started")
    logger.info("  - Auto-lowercase: ENABLED")
    logger.info("  - Auto-organize: DISABLED (files stay in their original folders)")
    logger.info("  - Press Ctrl+C to stop")
    
    try:
        while True:
            time.sleep(1)
            
            # Check for pending scan
            if event_handler.pending_scan:
                current_time = time.time()
                if current_time - event_handler.last_scan_time >= event_handler.scan_cooldown:
                    event_handler._perform_scan()
    except KeyboardInterrupt:
        logger.info("Stopping file watcher...")
        observer.stop()
    
    observer.join()
    logger.info("File watcher stopped")


if __name__ == "__main__":
    main()
