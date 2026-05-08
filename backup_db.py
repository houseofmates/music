#!/usr/bin/env python3
"""Daily backup script for the music database."""
import os
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

def backup_database():
    """Create a timestamped backup of the music database."""
    db_path = "/app/music.db"
    backup_dir = "/app/backups"
    
    # Create backup directory if it doesn't exist
    os.makedirs(backup_dir, exist_ok=True)
    
    # Generate timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(backup_dir, f"music_backup_{timestamp}.db")
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    # Create backup
    shutil.copy2(db_path, backup_path)
    
    # Also create a 'latest' symlink
    latest_path = os.path.join(backup_dir, "music_latest.db")
    if os.path.exists(latest_path):
        os.remove(latest_path)
    shutil.copy2(db_path, latest_path)
    
    # Clean up old backups (keep last 7 days)
    cleanup_old_backups(backup_dir)
    
    print(f"✅ Backup created: {backup_path}")
    return True

def cleanup_old_backups(backup_dir):
    """Remove backups older than 7 days."""
    cutoff = datetime.now().timestamp() - (7 * 24 * 60 * 60)
    
    for filename in os.listdir(backup_dir):
        if filename.startswith("music_backup_") and filename.endswith(".db"):
            filepath = os.path.join(backup_dir, filename)
            if os.path.getmtime(filepath) < cutoff:
                os.remove(filepath)
                print(f"🗑️  Removed old backup: {filename}")

def restore_from_backup(backup_file=None):
    """Restore database from a backup file."""
    db_path = "/app/music.db"
    backup_dir = "/app/backups"
    
    if backup_file is None:
        # Use latest backup
        backup_file = os.path.join(backup_dir, "music_latest.db")
    
    if not os.path.exists(backup_file):
        print(f"❌ Backup not found: {backup_file}")
        return False
    
    # Verify it's a valid SQLite database
    try:
        conn = sqlite3.connect(backup_file)
        conn.execute("SELECT 1 FROM tracks LIMIT 1")
        conn.close()
    except Exception as e:
        print(f"❌ Invalid backup file: {e}")
        return False
    
    # Create emergency backup of current state before restore
    if os.path.exists(db_path):
        emergency = os.path.join(backup_dir, f"pre_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db")
        shutil.copy2(db_path, emergency)
        print(f"⚠️  Emergency backup created: {emergency}")
    
    # Restore
    shutil.copy2(backup_file, db_path)
    print(f"✅ Restored from: {backup_file}")
    return True

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "restore":
        backup_file = sys.argv[2] if len(sys.argv) > 2 else None
        restore_from_backup(backup_file)
    else:
        backup_database()
