"""Migration: Add database indexes for semantic search performance.

Run this once to add indexes that improve query performance for semantic search
and embedding operations. Safe to run multiple times (idempotent).
"""

import sqlite3
import os
import sys

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "music.db")

# Indexes for semantic search and embedding performance
EMBEDDING_INDEXES = [
    # Track embedding indexes
    "CREATE INDEX IF NOT EXISTS idx_track_embeddings_track_id ON track_embeddings(track_id)",
    "CREATE INDEX IF NOT EXISTS idx_track_embeddings_updated_at ON track_embeddings(updated_at)",

    # Audio features indexes for related tracks
    "CREATE INDEX IF NOT EXISTS idx_audio_features_track_id ON audio_features(track_id)",
    "CREATE INDEX IF NOT EXISTS idx_audio_features_tempo ON audio_features(tempo)",
    "CREATE INDEX IF NOT EXISTS idx_audio_features_energy ON audio_features(energy)",
    "CREATE INDEX IF NOT EXISTS idx_audio_features_valence ON audio_features(valence)",
    "CREATE INDEX IF NOT EXISTS idx_audio_features_danceability ON audio_features(danceability)",
    "CREATE INDEX IF NOT EXISTS idx_audio_features_mood ON audio_features(mood)",

    # Semantic cache indexes for fast lookups
    "CREATE INDEX IF NOT EXISTS idx_semantic_cache_query_hash ON semantic_cache(query_hash)",
    "CREATE INDEX IF NOT EXISTS idx_semantic_cache_expires_at ON semantic_cache(expires_at)",
    "CREATE INDEX IF NOT EXISTS idx_semantic_cache_hit_count ON semantic_cache(hit_count)",

    # User play stats for contextual recommendations
    "CREATE INDEX IF NOT EXISTS idx_user_play_stats_user_track ON user_play_stats(user_id, track_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_play_stats_love_score ON user_play_stats(user_id, love_score)",
    "CREATE INDEX IF NOT EXISTS idx_user_play_stats_play_count ON user_play_stats(user_id, play_count)",
    "CREATE INDEX IF NOT EXISTS idx_user_play_stats_last_played ON user_play_stats(user_id, last_played)",

    # Composite indexes for common query patterns
    "CREATE INDEX IF NOT EXISTS idx_tracks_artist_album_year ON tracks(artist, album, year)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_genre_year ON tracks(genre, year)",
    "CREATE INDEX IF NOT EXISTS idx_tracks_title_artist ON tracks(title, artist)",
]


def run_migration():
    if not os.path.exists(DATABASE_PATH):
        print(f"Database not found at {DATABASE_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    print("Adding semantic search performance indexes...")

    for sql in EMBEDDING_INDEXES:
        try:
            cursor.execute(sql)
            print(f"OK: {sql[:80]}...")
        except sqlite3.OperationalError as e:
            if "already exists" in str(e):
                print(f"SKIP: index already exists")
            else:
                print(f"ERROR: {e}")

    # Analyze tables for query optimization
    try:
        cursor.execute("ANALYZE")
        print("OK: analyzed database for query optimization")
    except sqlite3.OperationalError as e:
        print(f"SKIP: analyze failed: {e}")

    conn.commit()
    conn.close()
    print("Semantic search optimization migration complete.")


if __name__ == "__main__":
    run_migration()