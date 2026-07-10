#!/usr/bin/env python3
"""add artist and album metadata tables for deep discovery."""

import sqlite3
import argparse

parser = argparse.ArgumentParser(description='Add metadata tables')
parser.add_argument('--db-path', default='./music.db', help='Path to database file')
args = parser.parse_args()

def upgrade():
    """create artist_metadata and album_metadata tables."""

    db_path = args.db_path
    print(f"Using database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create artist_metadata table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artist_metadata (
            id INTEGER PRIMARY KEY,
            artist_name TEXT NOT NULL UNIQUE,
            mbid TEXT,
            country TEXT,
            area TEXT,
            begin_date TEXT,
            end_date TEXT,
            artist_type TEXT,
            disambiguation TEXT,
            mb_tags TEXT,
            image_url TEXT,
            cover_art_urls TEXT,
            biography TEXT,
            bio_source TEXT,
            tags TEXT,
            genres TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create index on artist_name
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_artist_metadata_name
        ON artist_metadata (artist_name)
    """)

    # Create album_metadata table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS album_metadata (
            id INTEGER PRIMARY KEY,
            artist_name TEXT NOT NULL,
            album_name TEXT NOT NULL,
            mbid TEXT,
            title TEXT,
            release_type TEXT,
            first_release_date TEXT,
            primary_type TEXT,
            secondary_types TEXT,
            mb_tags TEXT,
            cover_art_urls TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create index on artist_name and album_name
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_album_metadata_artist_album
        ON album_metadata (artist_name, album_name)
    """)

    # Commit changes
    conn.commit()
    conn.close()

    print("Created artist_metadata and album_metadata tables")

if __name__ == "__main__":
    upgrade()