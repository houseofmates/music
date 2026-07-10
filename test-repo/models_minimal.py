from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Track(SQLModel, table=True):
    """Music track model."""
    __tablename__ = "tracks"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # File information
    file_path: str = Field(index=True)
    filename: Optional[str] = None
    file_size: Optional[int] = None
    last_modified: Optional[datetime] = None
    inode: Optional[int] = None
    device: Optional[int] = None
    
    # ID3 metadata
    title: Optional[str] = Field(index=True)
    artist: Optional[str] = Field(index=True)
    album: Optional[str] = Field(index=True)
    album_artist: Optional[str] = None
    genre: Optional[str] = Field(index=True)
    year: Optional[int] = None
    track_number: Optional[int] = None
    disc_number: Optional[int] = None
    duration: Optional[float] = None  # seconds
    
    # Additional metadata
    acoustid: Optional[str] = None
    musicbrainz_recording_id: Optional[str] = None
    cover_art_url: Optional[str] = None
    lyrics: Optional[str] = None
    synced_lyrics: Optional[str] = None
    featured_artists: Optional[str] = None
    
    # Custom flags
    is_custom_metadata: Optional[bool] = None
    is_custom_cover: Optional[bool] = None
    is_custom_lyrics: Optional[bool] = None
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class User(SQLModel, table=True):
    """User account."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Playlist(SQLModel, table=True):
    """Playlist model."""
    __tablename__ = "playlists"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    name: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    folder_path: Optional[str] = Field(default=None, index=True)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PlaylistTrack(SQLModel, table=True):
    """Many-to-many relationship between playlists and tracks."""
    __tablename__ = "playlist_tracks"

    id: Optional[int] = Field(default=None, primary_key=True)
    playlist_id: int = Field(foreign_key="playlists.id")
    track_id: int = Field(foreign_key="tracks.id")
    position: int = Field(default=0)
    added_at: Optional[datetime] = None


class PlayerState(SQLModel, table=True):
    """Persistent player state."""
    __tablename__ = "player_state"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    current_track_id: Optional[int] = Field(default=None, foreign_key="tracks.id", index=True)
    current_position: float = Field(default=0.0)
    is_playing: bool = Field(default=False)
    volume: float = Field(default=0.8)
    repeat_mode: str = Field(default="none")
    shuffle: bool = Field(default=False)
    updated_at: Optional[datetime] = None


class QueueItem(SQLModel, table=True):
    """Queue item model."""
    __tablename__ = "queue"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id")
    position: int = Field(default=0, index=True)
    added_at: Optional[datetime] = None


class Favorite(SQLModel, table=True):
    """User favorite tracks."""
    __tablename__ = "favorites"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    created_at: Optional[datetime] = None


class PlayHistory(SQLModel, table=True):
    """History of played tracks."""
    __tablename__ = "play_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    played_at: Optional[datetime] = None
    position: Optional[float] = None
    duration: Optional[float] = None


class ScanLog(SQLModel, table=True):
    """Log of library scans."""
    __tablename__ = "scan_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    scan_type: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    tracks_added: int = Field(default=0)
    tracks_updated: int = Field(default=0)
    tracks_removed: int = Field(default=0)
    errors: Optional[str] = None
    status: str = Field(default="running")
