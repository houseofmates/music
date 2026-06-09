"""Migration to add gap detection columns to tracks table."""
import sqlite3
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    db_path = Path(__file__).parent / "music.db"
    
    if not db_path.exists():
        logger.error(f"Database not found at {db_path}")
        return False
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(tracks)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'leading_silence_ms' not in columns:
            logger.info("Adding leading_silence_ms column...")
            cursor.execute(
                "ALTER TABLE tracks ADD COLUMN leading_silence_ms INTEGER DEFAULT NULL"
            )
        
        if 'trailing_silence_ms' not in columns:
            logger.info("Adding trailing_silence_ms column...")
            cursor.execute(
                "ALTER TABLE tracks ADD COLUMN trailing_silence_ms INTEGER DEFAULT NULL"
            )
        
        if 'has_detected_gaps' not in columns:
            logger.info("Adding has_detected_gaps column...")
            cursor.execute(
                "ALTER TABLE tracks ADD COLUMN has_detected_gaps BOOLEAN DEFAULT 0"
            )
        
        # Add dynamic_crossfade_ms to queue table
        cursor.execute("PRAGMA table_info(queue)")
        queue_columns = [col[1] for col in cursor.fetchall()]
        
        if 'dynamic_crossfade_ms' not in queue_columns:
            logger.info("Adding dynamic_crossfade_ms column to queue table...")
            cursor.execute(
                "ALTER TABLE queue ADD COLUMN dynamic_crossfade_ms INTEGER DEFAULT NULL"
            )
        
        conn.commit()
        logger.info("Migration completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
