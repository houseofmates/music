"""
Migration to add collaborative playlist features.
"""

from sqlmodel import Session, text
from models import Playlist, PlaylistTrack, PlaylistCollaborator, User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Add collaborative playlist features to existing database."""

    from database import engine
    
    with Session(engine) as session:
        try:
            def table_columns(table_name: str) -> set[str]:
                rows = session.exec(text(f"PRAGMA table_info({table_name})")).all()
                return {row[1] for row in rows}

            # Add new columns to existing tables
            logger.info("Adding collaborative columns to playlists table...")

            playlist_columns = table_columns("playlists")
            if "is_collaborative" not in playlist_columns:
                session.exec(text("""
                    ALTER TABLE playlists
                    ADD COLUMN is_collaborative BOOLEAN DEFAULT 0
                """))

            if "allow_public_edits" not in playlist_columns:
                session.exec(text("""
                    ALTER TABLE playlists
                    ADD COLUMN allow_public_edits BOOLEAN DEFAULT 0
                """))

            playlist_track_columns = table_columns("playlist_tracks")
            if "added_by_user_id" not in playlist_track_columns:
                session.exec(text("""
                    ALTER TABLE playlist_tracks
                    ADD COLUMN added_by_user_id INTEGER REFERENCES users(id)
                """))
            
            # Create playlist_collaborators table
            session.exec(text("""
                CREATE TABLE IF NOT EXISTS playlist_collaborators (
                    id INTEGER PRIMARY KEY,
                    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    can_edit BOOLEAN DEFAULT 1,
                    can_delete BOOLEAN DEFAULT 0,
                    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(playlist_id, user_id)
                )
            """))
            
            # Create indexes
            session.exec(text("""
                CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_playlist 
                ON playlist_collaborators(playlist_id)
            """))
            
            session.exec(text("""
                CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_user 
                ON playlist_collaborators(user_id)
            """))
            
            session.exec(text("""
                CREATE INDEX IF NOT EXISTS idx_playlist_tracks_added_by 
                ON playlist_tracks(added_by_user_id)
            """))
            
            session.commit()
            logger.info("Migration completed successfully")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            session.rollback()
            raise

if __name__ == "__main__":
    migrate_database()
