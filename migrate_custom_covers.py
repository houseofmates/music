#!/usr/bin/env python3
"""
Migration: Mark all existing data URI covers as custom covers.
This ensures user-uploaded covers are NEVER overwritten by future scans.
Run this once to protect existing custom covers.
"""

import sqlite3
import os
import argparse

parser = argparse.ArgumentParser(description='Migrate custom covers')
parser.add_argument('--db-path', default='./music.db', help='Path to database file')
args = parser.parse_args()

DB_PATH = args.db_path

def migrate():
    """Mark all data URI covers as custom."""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if is_custom_cover column exists
    cursor.execute("PRAGMA table_info(tracks)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "is_custom_cover" not in columns:
        print("Adding is_custom_cover column to tracks table...")
        cursor.execute("ALTER TABLE tracks ADD COLUMN is_custom_cover BOOLEAN DEFAULT 0")
        conn.commit()
        print("Column added.")
    
    # Mark all data URI covers as custom
    cursor.execute("""
        UPDATE tracks 
        SET is_custom_cover = 1 
        WHERE cover_art_url LIKE 'data:%' AND (is_custom_cover = 0 OR is_custom_cover IS NULL)
    """)
    updated = cursor.rowcount
    conn.commit()
    
    print(f"✅ Migration complete: {updated} tracks marked with custom covers")
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM tracks WHERE is_custom_cover = 1")
    total_custom = cursor.fetchone()[0]
    print(f"Total tracks with custom covers: {total_custom}")
    
    conn.close()

if __name__ == "__main__":
    migrate()
