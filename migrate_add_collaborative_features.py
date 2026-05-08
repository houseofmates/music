"""
Migration to add collaborative playlist features.
"""

from sqlmodel import SQLModel, create_engine, Session
from models import Playlist, PlaylistTrack, PlaylistCollaborator, User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Add collaborative playlist features to existing database."""
    
    # This would normally be run with alembic, but for simplicity we'll use raw SQL
    # In a production app, you'd use proper migration tools
    
    from database import engine
    
    with Session(engine) as session:
        try:
            # Add new columns to existing tables
            logger.info("Adding collaborative columns to playlists table...")
            
            # Add is_collaborative column
            session.exec("""
                ALTER TABLE playlists 
                ADD COLUMN IF NOT EXISTS is_collaborative BOOLEAN DEFAULT FALSE
            """)
            
            # Add allow_public_edits column  
            session.exec("""
                ALTER TABLE playlists 
                ADD COLUMN IF NOT EXISTS allow_public_edits BOOLEAN DEFAULT FALSE
            """)
            
            # Add added_by_user_id to playlist_tracks
            session.exec("""
                ALTER TABLE playlist_tracks 
                ADD COLUMN IF NOT EXISTS added_by_user_id INTEGER REFERENCES users(id)
            """)
            
            # Create playlist_collaborators table
            session.exec("""
                CREATE TABLE IF NOT EXISTS playlist_collaborators (
                    id SERIAL PRIMARY KEY,
                    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    can_edit BOOLEAN DEFAULT TRUE,
                    can_delete BOOLEAN DEFAULT FALSE,
                    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(playlist_id, user_id)
                )
            """)
            
            # Create indexes
            session.exec("""
                CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_playlist 
                ON playlist_collaborators(playlist_id)
            """)
            
            session.exec("""
                CREATE INDEX IF NOT EXISTS idx_playlist_collaborators_user 
                ON playlist_collaborators(user_id)
            """)
            
            session.exec("""
                CREATE INDEX IF NOT EXISTS idx_playlist_tracks_added_by 
                ON playlist_tracks(added_by_user_id)
            """)
            
            session.commit()
            logger.info("Migration completed successfully")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            session.rollback()
            raise

if __name__ == "__main__":
    migrate_database()
