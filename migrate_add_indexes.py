"""Migration: Add missing database indexes for performance.

Run this once to add indexes that improve query performance on frequently
accessed columns. Safe to run multiple times (idempotent).
"""

import sqlite3
import os
import sys

import argparse

parser = argparse.ArgumentParser(description='Add indexes')
parser.add_argument('--db-path', default='./music.db', help='Path to database file')
args = parser.parse_args()

DATABASE_PATH = args.db_path

INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_tracks_filename ON tracks(filename)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_artist_album ON tracks(artist, album)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_year ON tracks(year)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_duration ON tracks(duration)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_updated_at ON tracks(updated_at)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_file_size ON tracks(file_size)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_album_artist ON tracks(album_artist)",
    "CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id)",
    "CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks(track_id)",
    "CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(position)",
    "CREATE INDEX IF NOT EXISTS idx_play_history_user_track ON play_history(user_id, track_id, played_at)",
    "CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON play_history(played_at)",
    "CREATE INDEX IF NOT EXISTS idx_favorites_user_track ON favorites(user_id, track_id)",
    "CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_queue_user_position ON queue(user_id, position)",
    "CREATE INDEX IF NOT EXISTS idx_track_tags_user_track ON track_tags(user_id, track_id)",
    "CREATE INDEX IF NOT EXISTS idx_track_tags_tag ON track_tags(tag)",
    "CREATE INDEX IF NOT EXISTS idx_track_tags_type ON track_tags(type)",
    "CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token)",
    "CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_share_comments_share_link_id ON share_comments(share_link_id)",
]


def run_migration():
    if not os.path.exists(DATABASE_PATH):
        print(f"Database not found at {DATABASE_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    for sql in INDEXES:
        try:
            cursor.execute(sql)
            print(f"OK: {sql[:60]}...")
        except sqlite3.OperationalError as e:
            if "already exists" in str(e):
                print(f"SKIP: index already exists")
            else:
                print(f"ERROR: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")


if __name__ == "__main__":
    run_migration()
