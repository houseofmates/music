#!/usr/bin/env python3
"""Add all missing columns to tracks table."""

import sys
import argparse

parser = argparse.ArgumentParser(description='Migrate database')
parser.add_argument('--backend-path', default='.', help='Path to backend directory')
args = parser.parse_args()

sys.path.insert(0, args.backend_path)

import sqlite3
from config import settings

db_path = settings.database_url.replace('sqlite:///', '')
if db_path.startswith('./'):
    db_path = args.backend_path + '/' + db_path[2:]

print(f"Using database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(tracks)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Existing columns: {columns}")

# Add missing columns
new_columns = [
    ('inode', 'INTEGER'),
    ('device', 'INTEGER'),
    ('featured_artists', 'TEXT'),
    ('is_custom_metadata', 'BOOLEAN DEFAULT 0'),
    ('is_custom_cover', 'BOOLEAN DEFAULT 0'),
    ('is_custom_lyrics', 'BOOLEAN DEFAULT 0'),
    ('acoustid', 'TEXT'),
    ('musicbrainz_recording_id', 'TEXT'),
    ('lyrics', 'TEXT'),
    ('synced_lyrics', 'TEXT'),
]

for col_name, col_type in new_columns:
    if col_name not in columns:
        print(f"Adding {col_name} column...")
        try:
            cursor.execute(f"ALTER TABLE tracks ADD COLUMN {col_name} {col_type}")
            conn.commit()
            print(f"  ✅ Added {col_name}")
        except Exception as e:
            print(f"  ⚠️  {e}")
    else:
        print(f"Column {col_name} already exists")

# Also migrate playlists table
print("\n📋 Checking playlists table...")
cursor.execute("PRAGMA table_info(playlists)")
playlist_columns = [col[1] for col in cursor.fetchall()]
print(f"Existing playlist columns: {playlist_columns}")

if 'is_custom_cover' not in playlist_columns:
    print("Adding is_custom_cover to playlists...")
    try:
        cursor.execute("ALTER TABLE playlists ADD COLUMN is_custom_cover BOOLEAN DEFAULT 0")
        conn.commit()
        print("  ✅ Added is_custom_cover to playlists")
    except Exception as e:
        print(f"  ⚠️  {e}")
else:
    print("Column is_custom_cover already exists in playlists")

conn.close()
print("\n✅ Migration complete!")
