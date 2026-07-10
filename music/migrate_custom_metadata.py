#!/usr/bin/env python3
"""
Migration: Add is_custom_metadata column to tracks table.
This protects user-edited song titles, artists, albums from being overwritten.
"""

import sqlite3
import os
import argparse

parser = argparse.ArgumentParser(description='Migrate custom metadata')
parser.add_argument('--db-path', default='./music.db', help='Path to database file')
args = parser.parse_args()

DB_PATH = args.db_path

def migrate():
    """Add is_custom_metadata column to tracks table."""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if is_custom_metadata column exists
    cursor.execute("PRAGMA table_info(tracks)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "is_custom_metadata" not in columns:
        print("Adding is_custom_metadata column to tracks table...")
        cursor.execute("ALTER TABLE tracks ADD COLUMN is_custom_metadata BOOLEAN DEFAULT 0")
        conn.commit()
        print("Column added.")
    else:
        print("is_custom_metadata column already exists.")
    
    # Note: We can't auto-detect which tracks have custom metadata
    # The user will need to manually edit tracks to set this flag,
    # or we could try to detect if metadata differs from filename
    
    conn.close()
    print("✅ Migration complete: is_custom_metadata column ready")

if __name__ == "__main__":
    migrate()
