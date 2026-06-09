from sqlmodel import SQLModel, Field, Relationship, Index
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from enum import Enum


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Track(SQLModel, table=True):
    """Music track model."""
    __tablename__ = "tracks"
    __table_args__ = (
        Index("idx_tracks_artist_album", "artist", "album"),
        Index("idx_tracks_genre_energy", "genre"),
        Index("idx_tracks_duration_filepath", "duration", "file_path"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)

    # File info
    file_path: str = Field(index=True, unique=True)
    filename: str = Field(index=True)
    file_size: int
    last_modified: datetime

    # Hardlink detection - files with same inode+device share content
    inode: Optional[int] = Field(default=None, index=True)
    device: Optional[int] = Field(default=None, index=True)

    # ID3 Metadata
    title: Optional[str] = None
    artist: Optional[str] = Field(default=None, index=True)
    album: Optional[str] = Field(default=None, index=True)
    album_artist: Optional[str] = None
    featured_artists: Optional[str] = None  # Comma-separated list of featured artists (extracted from ft./feat.)
    genre: Optional[str] = None
    year: Optional[int] = None
    track_number: Optional[int] = None
    disc_number: Optional[int] = None
    duration: Optional[float] = None  # in seconds

    # Custom metadata protection flags
    is_custom_metadata: bool = Field(default=False)  # User-edited metadata, NEVER overwrite
    is_custom_cover: bool = Field(default=False)  # User-uploaded cover, NEVER overwrite
    is_custom_lyrics: bool = Field(default=False)  # User-edited lyrics, NEVER overwrite

    # Audio fingerprinting
    acoustid: Optional[str] = Field(default=None, index=True)
    musicbrainz_recording_id: Optional[str] = Field(default=None, index=True)

    # Additional metadata
    cover_art_url: Optional[str] = None
    lyrics: Optional[str] = None
    synced_lyrics: Optional[str] = None  # LRC format

    # Silent gap detection for dynamic crossfade
    leading_silence_ms: Optional[int] = Field(default=None)  # Silence at track start in milliseconds
    trailing_silence_ms: Optional[int] = Field(default=None)  # Silence at track end in milliseconds
    has_detected_gaps: bool = Field(default=False)  # Whether gap detection has been run

    # Timestamps
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    # Relationships
    queue_items: List["QueueItem"] = Relationship(back_populates="track")
    playlist_items: List["PlaylistTrack"] = Relationship(back_populates="track")
    player_states: List["PlayerState"] = Relationship(back_populates="current_track")
    favorites: List["Favorite"] = Relationship(back_populates="track")
    history: List["PlayHistory"] = Relationship(back_populates="track")
    tags: List["TrackTag"] = Relationship(back_populates="track")
    embeddings: List["TrackEmbedding"] = Relationship(back_populates="track")
    audio_features: Optional["AudioFeatures"] = Relationship(back_populates="track")
    play_stats: List["UserPlayStats"] = Relationship(back_populates="track")


class Playlist(SQLModel, table=True):
    """Playlist model."""
    __tablename__ = "playlists"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    name: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    is_custom_cover: bool = Field(default=False)  # User-uploaded cover, NEVER overwrite
    folder_path: Optional[str] = Field(default=None, index=True)  # Path to folder in music dir

    # Collaborative features
    is_collaborative: bool = Field(default=False)  # Allow multiple users to edit
    allow_public_edits: bool = Field(default=False)  # Allow anyone to add tracks

    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    # Relationships
    owner: Optional["User"] = Relationship(back_populates="playlists")
    sleep_timers: List["SleepTimer"] = Relationship(back_populates="playlist")
    tracks: List["PlaylistTrack"] = Relationship(back_populates="playlist")
    collaborators: List["PlaylistCollaborator"] = Relationship(back_populates="playlist")
    alarms: List["Alarm"] = Relationship(back_populates="playlist")
    sleep_config: Optional["SleepPlaylist"] = Relationship(back_populates="playlist")
    sleep_schedules: List["SleepSchedule"] = Relationship(back_populates="playlist")


class PlaylistTrack(SQLModel, table=True):
    """Many-to-many relationship between playlists and tracks."""
    __tablename__ = "playlist_tracks"

    id: Optional[int] = Field(default=None, primary_key=True)
    playlist_id: int = Field(foreign_key="playlists.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    position: int = Field(default=0)
    added_by_user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)  # Who added this track

    added_at: datetime = Field(default_factory=now_utc)

    # Relationships
    playlist: Playlist = Relationship(back_populates="tracks")
    track: Track = Relationship(back_populates="playlist_items")
    added_by: Optional["User"] = Relationship(back_populates="added_tracks")


class PlaylistCollaborator(SQLModel, table=True):
    """Users who can edit a collaborative playlist."""
    __tablename__ = "playlist_collaborators"

    id: Optional[int] = Field(default=None, primary_key=True)
    playlist_id: int = Field(foreign_key="playlists.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    can_edit: bool = Field(default=True)  # Permission to add/remove tracks
    can_delete: bool = Field(default=False)  # Permission to delete playlist

    added_at: datetime = Field(default_factory=now_utc)

    # Relationships
    playlist: Playlist = Relationship(back_populates="collaborators")
    user: "User" = Relationship(back_populates="collaborative_playlists")


class QueueItem(SQLModel, table=True):
    """Queue item model - persistent queue."""
    __tablename__ = "queue"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id")
    position: int = Field(default=0, index=True)
    
    # Dynamic crossfade override for this specific queue item
    dynamic_crossfade_ms: Optional[int] = Field(default=None)  # Calculated optimal crossfade in ms

    added_at: datetime = Field(default_factory=now_utc)

    # Relationships
    track: Track = Relationship(back_populates="queue_items")


class PlayerState(SQLModel, table=True):
    """Persistent player state - per-user (or global if no user)."""
    __tablename__ = "player_state"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    current_track_id: Optional[int] = Field(default=None, foreign_key="tracks.id", index=True)
    current_position: float = Field(default=0.0) # in seconds
    is_playing: bool = Field(default=False)
    volume: float = Field(default=0.8) # 0.0 to 1.0
    repeat_mode: str = Field(default="none") # none, one, all
    shuffle: bool = Field(default=False)

    updated_at: datetime = Field(default_factory=now_utc)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="player_states")
    current_track: Optional["Track"] = Relationship(back_populates="player_states")


class User(SQLModel, table=True):
    """User account for cross-device sync and user-specific state."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)
    # Relationships
    playlists: List["Playlist"] = Relationship(back_populates="owner")
    favorites: List["Favorite"] = Relationship(back_populates="user")
    history: List["PlayHistory"] = Relationship(back_populates="user")
    tags: List["TrackTag"] = Relationship(back_populates="user")
    settings: Optional["UserSettings"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    share_links: List["ShareLink"] = Relationship(back_populates="user")
    # Sleep-related relationships
    sleep_timers: List["SleepTimer"] = Relationship(back_populates="user")
    sleep_playlists: List["SleepPlaylist"] = Relationship(back_populates="user")
    sleep_schedules: List["SleepSchedule"] = Relationship(back_populates="user")
    player_states: List["PlayerState"] = Relationship(back_populates="user")
    share_comments: List["ShareComment"] = Relationship(back_populates="user")
    added_tracks: List["PlaylistTrack"] = Relationship(back_populates="added_by")
    collaborative_playlists: List["PlaylistCollaborator"] = Relationship(back_populates="user")
    alarms: List["Alarm"] = Relationship(back_populates="user")


class Favorite(SQLModel, table=True):
    """Tracks favorited by a user."""
    __tablename__ = "favorites"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    created_at: datetime = Field(default_factory=now_utc)

    user: User = Relationship(back_populates="favorites")
    track: Track = Relationship(back_populates="favorites")


class PlayHistory(SQLModel, table=True):
    """History of played tracks."""
    __tablename__ = "play_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    played_at: datetime = Field(default_factory=now_utc)
    position: Optional[float] = None
    duration: Optional[float] = None

    user: User = Relationship(back_populates="history")
    track: Track = Relationship(back_populates="history")


class TagType(str, Enum):
    mood = "mood"
    custom = "custom"


class TrackTag(SQLModel, table=True):
    """Custom tags (mood/tags) applied to tracks."""
    __tablename__ = "track_tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    tag: str
    type: TagType = Field(default=TagType.custom)
    created_at: datetime = Field(default_factory=now_utc)

    user: User = Relationship(back_populates="tags")
    track: Track = Relationship(back_populates="tags")


class UserSettings(SQLModel, table=True):
    """Per-user settings that sync across devices."""
    __tablename__ = "user_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    offline_mode: bool = Field(default=False)
    crossfade_seconds: float = Field(default=0.6)
    low_power_mode: bool = Field(default=False)

    # Audio processing settings
    equalizer_preset: Optional[str] = Field(default=None)  # Preset name or None for flat
    custom_equalizer: Optional[str] = Field(default=None)  # JSON string of custom bands
    audio_effects: Optional[str] = Field(default=None)  # JSON array of enabled effects
    spatial_preset: Optional[str] = Field(default=None)  # Spatial audio preset
    normalize_audio: bool = Field(default=False)  # Enable audio normalization
    compression_enabled: bool = Field(default=False)  # Enable dynamic range compression
    compression_settings: Optional[str] = Field(default=None)  # JSON compression settings

    last_synced_at: datetime = Field(default_factory=now_utc)

    user: User = Relationship(back_populates="settings")


class ShareLink(SQLModel, table=True):
    """Shareable links for tracks/playlists with comments."""
    __tablename__ = "share_links"

    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    kind: str  # track or playlist
    resource_id: int
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=now_utc)

    user: Optional[User] = Relationship(back_populates="share_links")
    comments: List["ShareComment"] = Relationship(back_populates="share_link")


class ShareComment(SQLModel, table=True):
    """comments added to a shared link."""
    __tablename__ = "share_comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    share_link_id: int = Field(foreign_key="share_links.id", index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    comment: str
    created_at: datetime = Field(default_factory=now_utc)

    share_link: ShareLink = Relationship(back_populates="comments")
    user: Optional["User"] = Relationship(back_populates="share_comments")


class TrackEmbedding(SQLModel, table=True):
    """vector embedding for semantic search with performance optimizations."""
    __tablename__ = "track_embeddings"
    __table_args__ = (
        Index("idx_embeddings_track_id", "track_id", unique=True),
        Index("idx_embeddings_updated", "updated_at"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    track_id: int = Field(foreign_key="tracks.id", unique=True, index=True)
    embedding: bytes  # 384-dimensional vector
    embedding_version: str = Field(default="v1")  # For model upgrades
    updated_at: datetime = Field(default_factory=now_utc)

    track: Track = Relationship(back_populates="embeddings")


class AudioFeatures(SQLModel, table=True):
    """audio analysis features for related tracks and discovery."""
    __tablename__ = "audio_features"
    __table_args__ = (
        Index("idx_audiofeatures_mood", "mood"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    track_id: int = Field(foreign_key="tracks.id", unique=True, index=True)
    
    # Low-level audio features
    tempo: Optional[float] = None  # BPM
    key: Optional[str] = None  # Musical key (C, Dm, etc.)
    mode: Optional[int] = None  # Major (0) or Minor (1)
    energy: Optional[float] = None  # 0.0-1.0
    valence: Optional[float] = None  # 0.0-1.0 (sad to happy)
    danceability: Optional[float] = None  # 0.0-1.0
    
    # Spectral features
    spectral_centroid: Optional[float] = None
    spectral_rolloff: Optional[float] = None
    zero_crossing_rate: Optional[float] = None
    mfcc: Optional[bytes] = None  # MFCC coefficients as bytes
    
    # High-level classifications
    mood: Optional[str] = None  # happy, sad, energetic, calm
    genre_prediction: Optional[str] = None
    acousticness: Optional[float] = None  # 0.0-1.0
    instrumentalness: Optional[float] = None  # 0.0-1.0
    
    updated_at: datetime = Field(default_factory=now_utc)

    track: Track = Relationship(back_populates="audio_features")


class SemanticCache(SQLModel, table=True):
    """cache for semantic search queries to ensure sub-100ms response times."""
    __tablename__ = "semantic_cache"
    __table_args__ = (
        Index("idx_semantic_cache_expires", "expires_at"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    query_hash: str = Field(index=True, unique=True)  # SHA256 of query
    query: str
    track_ids: bytes  # Serialized list of track IDs
    result_count: int
    created_at: datetime = Field(default_factory=now_utc)
    expires_at: datetime = Field(default_factory=lambda: now_utc() + timedelta(hours=24))
    hit_count: int = Field(default=0)


class UserPlayStats(SQLModel, table=True):
    """user play statistics for contextual recommendations."""
    __tablename__ = "user_play_stats"
    __table_args__ = (
        Index("idx_playstats_user_love", "user_id", "love_score"),
        Index("idx_playstats_user_track", "user_id", "track_id"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    track_id: int = Field(foreign_key="tracks.id", index=True)
    
    # Play statistics
    play_count: int = Field(default=0)
    skip_count: int = Field(default=0)
    total_play_time: float = Field(default=0.0)  # seconds
    last_played: Optional[datetime] = None
    
    # Time-based preferences
    hour_of_day_plays: bytes  # 24-hour histogram as bytes
    day_of_week_plays: bytes  # 7-day histogram as bytes
    
    # User ratings
    love_score: float = Field(default=0.0)  # -1.0 (hate) to 1.0 (love)
    
    updated_at: datetime = Field(default_factory=now_utc)
    
    # Relationship back to Track model
    track: Optional["Track"] = Relationship(back_populates="play_stats")


class ArtistMetadata(SQLModel, table=True):
    """enhanced artist metadata from deep discovery."""
    __tablename__ = "artist_metadata"

    id: Optional[int] = Field(default=None, primary_key=True)
    artist_name: str = Field(index=True, unique=True)

    # MusicBrainz data
    mbid: Optional[str] = None
    country: Optional[str] = None
    area: Optional[str] = None
    begin_date: Optional[str] = None
    end_date: Optional[str] = None
    artist_type: Optional[str] = None
    disambiguation: Optional[str] = None
    mb_tags: Optional[str] = None  # JSON string of tags

    # Images and media
    image_url: Optional[str] = None
    cover_art_urls: Optional[str] = None  # JSON string of URLs

    # Biography
    biography: Optional[str] = None
    bio_source: Optional[str] = None  # wikipedia, genius, etc.

    # Additional metadata
    tags: Optional[str] = None  # JSON string of tags from Last.fm etc.
    genres: Optional[str] = None  # JSON string of genres

    # Timestamps
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)


class AlbumMetadata(SQLModel, table=True):
    """enhanced album metadata from deep discovery."""
    __tablename__ = "album_metadata"

    id: Optional[int] = Field(default=None, primary_key=True)
    artist_name: str = Field(index=True)
    album_name: str = Field(index=True)

    # MusicBrainz data
    mbid: Optional[str] = None
    title: Optional[str] = None
    release_type: Optional[str] = None
    first_release_date: Optional[str] = None
    primary_type: Optional[str] = None
    secondary_types: Optional[str] = None  # JSON string
    mb_tags: Optional[str] = None  # JSON string

    # Cover art
    cover_art_urls: Optional[str] = None  # JSON string of cover URLs

    # Timestamps
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    __table_args__ = (
        Index("idx_album_metadata_artist_album", "artist_name", "album_name"),
    )


class ScanLog(SQLModel, table=True):
    """log of library scans."""
    __tablename__ = "scan_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    scan_type: str  # full, incremental, reorganize
    started_at: datetime
    completed_at: Optional[datetime] = None
    tracks_added: int = Field(default=0)
    tracks_updated: int = Field(default=0)
    tracks_removed: int = Field(default=0)
    errors: Optional[str] = None

    status: str = Field(default="running")  # running, completed, failed


# ============= SLEEP & AMBIENT FEATURES =============

class AmbientMode(str, Enum):
    """Predefined ambient sound modes."""
    rain = "rain"
    nature = "nature"
    white_noise = "white_noise"
    ocean = "ocean"
    forest = "forest"
    fireplace = "fireplace"
    fan = "fan"
    city = "city"


class AmbientSound(SQLModel, table=True):
    """Ambient sound configuration."""
    __tablename__ = "ambient_sounds"

    id: Optional[int] = Field(default=None, primary_key=True)
    mode: AmbientMode = Field(index=True)
    name: str  # Display name
    description: Optional[str] = None
    file_path: Optional[str] = None  # Path to audio file
    volume: float = Field(default=0.5)  # 0.0 to 1.0
    loop: bool = Field(default=True)
    is_premium: bool = Field(default=False)  # Premium feature flag

    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)


class SleepTimer(SQLModel, table=True):
    """Active sleep timer configuration."""
    __tablename__ = "sleep_timers"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    # Timer settings
    duration_minutes: int  # Total sleep duration
    fade_out_minutes: int = Field(default=5)  # Fade-out period at end
    start_volume: float = Field(default=0.8)  # Initial volume (0.0-1.0)
    end_volume: float = Field(default=0.0)  # Final volume (0.0-1.0)

    # Associated content
    playlist_id: Optional[int] = Field(default=None, foreign_key="playlists.id")
    ambient_mode: Optional[AmbientMode] = None

    # Status
    is_active: bool = Field(default=True)
    started_at: datetime = Field(default_factory=now_utc)
    scheduled_end_at: datetime
    actual_end_at: Optional[datetime] = None

    # Relationships
    user: Optional["User"] = Relationship(back_populates="sleep_timers")
    playlist: Optional["Playlist"] = Relationship(back_populates="sleep_timers")


class SleepPlaylist(SQLModel, table=True):
    """Special playlists optimized for sleep/wind-down."""
    __tablename__ = "sleep_playlists"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    name: str
    description: Optional[str] = None

    # Sleep-specific settings
    wind_down_duration: int = Field(default=30)  # Minutes to wind down
    energy_progression: str = Field(default="high_to_low")  # high_to_low, low_to_high, custom
    tempo_range: Optional[str] = None  # JSON: {"min": 60, "max": 90}
    genre_filters: Optional[str] = None  # JSON array of allowed genres
    mood_filters: Optional[str] = None  # JSON array of moods

    # Ambient integration
    ambient_mode: Optional[AmbientMode] = None
    ambient_volume: float = Field(default=0.3)  # Ambient sound volume (0.0-1.0)

    is_premium: bool = Field(default=True)  # Sleep playlists are premium

    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    # Associated playlist link
    playlist_id: Optional[int] = Field(default=None, foreign_key="playlists.id")

    # Relationships
    user: Optional["User"] = Relationship(back_populates="sleep_playlists")
    # Link to the actual Playlist when needed
    playlist: Optional["Playlist"] = Relationship(back_populates="sleep_config", sa_relationship_kwargs={"uselist": False})


class SleepSchedule(SQLModel, table=True):
    """Scheduled sleep sessions."""
    __tablename__ = "sleep_schedules"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    name: str
    description: Optional[str] = None

    # Schedule settings
    days_of_week: str  # JSON array: ["monday", "tuesday", ...]
    start_time: str  # HH:MM format (24-hour)
    duration_minutes: int

    # Sleep settings (same as SleepTimer)
    fade_out_minutes: int = Field(default=5)
    start_volume: float = Field(default=0.8)
    end_volume: float = Field(default=0.0)
    playlist_id: Optional[int] = Field(default=None, foreign_key="playlists.id")
    ambient_mode: Optional[AmbientMode] = None

    # Status
    is_enabled: bool = Field(default=True)
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="sleep_schedules")
    playlist: Optional["Playlist"] = Relationship(back_populates="sleep_schedules")


class Alarm(SQLModel, table=True):
    """Wake-up alarms."""
    __tablename__ = "alarms"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    name: str
    description: Optional[str] = None

    # Alarm settings
    time: str  # HH:MM format (24-hour)
    days_of_week: str  # JSON array: ["monday", "tuesday", ...]
    is_enabled: bool = Field(default=True)

    # Wake-up settings
    playlist_id: Optional[int] = Field(default=None, foreign_key="playlists.id")  # Wake-up playlist
    ambient_mode: Optional[AmbientMode] = None  # Gentle ambient wake-up
    volume_start: float = Field(default=0.0)  # Start volume (0.0-1.0)
    volume_end: float = Field(default=0.8)  # End volume (0.0-1.0)
    fade_in_minutes: int = Field(default=10)  # Fade-in duration

    # Snooze settings
    snooze_enabled: bool = Field(default=True)
    snooze_minutes: int = Field(default=9)

    # Status
    last_triggered_at: Optional[datetime] = None
    next_trigger_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="alarms")
    playlist: Optional["Playlist"] = Relationship(back_populates="alarms")


