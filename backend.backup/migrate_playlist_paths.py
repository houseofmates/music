#!/usr/bin/env python3
"""
Migration script to fix playlist folder_path values.

Converts old host paths (e.g., /mnt/nextcloud/.../music/playlist) to 
container paths (e.g., /music/playlist) for better portability.

Run this in the backend container:
    cd /app && python migrate_playlist_paths.py
"""

import os
import sys

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from database import engine
from models import Playlist


def migrate_playlist_paths():
    """Migrate playlist folder_path values from host paths to /music/ paths."""
    print("🔧 Starting playlist path migration...")
    
    with Session(engine) as session:
        # Get all playlists with folder paths
        stmt = select(Playlist).where(Playlist.folder_path.isnot(None))
        playlists = session.exec(stmt).all()
        
        updated = 0
        skipped = 0
        
        for playlist in playlists:
            folder_path = playlist.folder_path
            
            # Skip if already in /music/ format
            if folder_path.startswith('/music/'):
                skipped += 1
                continue
            
            # Check if this is a host path containing /music/
            if '/music/' in folder_path:
                # Extract the part after /music/
                idx = folder_path.find('/music/')
                new_path = '/music/' + folder_path[idx + 7:]
                
                print(f"  Updating: {playlist.name}")
                print(f"    Old: {folder_path}")
                print(f"    New: {new_path}")
                
                playlist.folder_path = new_path
                updated += 1
            else:
                # Check if this looks like a music subfolder (ends with folder name)
                # Try to extract just the folder name
                folder_name = os.path.basename(os.path.normpath(folder_path))
                if folder_name:
                    new_path = os.path.join('/music', folder_name)
                    
                    print(f"  Updating: {playlist.name}")
                    print(f"    Old: {folder_path}")
                    print(f"    New: {new_path}")
                    
                    playlist.folder_path = new_path
                    updated += 1
        
        if updated > 0:
            session.commit()
            print(f"\n✅ Migration complete: {updated} playlists updated, {skipped} already correct")
        else:
            print(f"\n✅ No updates needed: {skipped} playlists already using correct format")
        
        return updated


if __name__ == "__main__":
    try:
        count = migrate_playlist_paths()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
