#!/usr/bin/env python3
"""Add featured_artists column to tracks table."""

import sys
sys.path.insert(0, '/home/house/Documents/docker/music_app/backend')

import sqlite3
from config import settings

# Get database path from settings
db_path = settings.database_url.replace('sqlite:///', '')
if db_path.startswith('./'):
    db_path = '/home/house/Documents/docker/music_app/backend/' + db_path[2:]

print(f"Using database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if column exists
cursor.execute("PRAGMA table_info(tracks)")
columns = [col[1] for col in cursor.fetchall()]

if 'featured_artists' not in columns:
    print("Adding featured_artists column...")
    cursor.execute("ALTER TABLE tracks ADD COLUMN featured_artists TEXT")
    conn.commit()
    print("✅ Column added successfully")
else:
    print("Column already exists")

conn.close()
