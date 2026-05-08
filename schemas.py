from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel


# Track Schemas
class TrackBase(BaseModel):
    """Base track schema."""
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    album_artist: Optional[str] = None
    featured_artists: Optional[str] = None
    genre: Optional[str] = None
    year: Optional[int] = None
    track_number: Optional[int] = None
    disc_number: Optional[int] = None
    duration: Optional[float] = None


class TrackResponse(TrackBase):
    """Track response schema."""
    id: int
    file_path: str
    filename: str
    cover_art_url: Optional[str] = None
    acoustid: Optional[str] = None
    musicbrainz_recording_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TrackWithLyrics(TrackResponse):
    """Track response with lyrics."""
    lyrics: Optional[str] = None
    synced_lyrics: Optional[str] = None


# Playlist Schemas
class PlaylistCreate(BaseModel):
    """Create playlist schema."""
    name: str
    description: Optional[str] = None
    cover_image: Optional[str] = None  # data URL or remote URL
    folder_path: Optional[str] = None


class PlaylistUpdate(BaseModel):
    """Update playlist schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    folder_path: Optional[str] = None


class PlaylistResponse(BaseModel):
    """Playlist response schema."""
    id: int
    name: str
    folder_path: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    track_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PlaylistWithTracks(PlaylistResponse):
    """Playlist with tracks."""
    tracks: List[TrackResponse] = []


class AddTrackToPlaylist(BaseModel):
    """Add track to playlist schema."""
    track_id: int
    position: Optional[int] = None


# Track update schema (used for editing metadata)
class TrackUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    cover_art_url: Optional[str] = None


# Queue Schemas
class QueueItemResponse(BaseModel):
    """Queue item response."""
    id: int
    position: int
    track: TrackResponse
    added_at: datetime
    
    class Config:
        from_attributes = True


class AddToQueue(BaseModel):
    """Add to queue schema."""
    track_id: int
    position: Optional[int] = None  # If None, add to end


class ReorderQueue(BaseModel):
    """Reorder queue schema."""
    queue_item_id: int
    new_position: int


# Player State Schemas
class PlayerStateResponse(BaseModel):
    """Player state response."""
    current_track: Optional[TrackResponse] = None
    current_position: float = 0.0
    is_playing: bool = False
    volume: float = 0.8
    repeat_mode: str = "none"
    shuffle: bool = False
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UpdatePlayerState(BaseModel):
    """Update player state schema."""
    current_track_id: Optional[int] = None
    current_position: Optional[float] = None
    is_playing: Optional[bool] = None
    volume: Optional[float] = None
    repeat_mode: Optional[str] = None
    shuffle: Optional[bool] = None


# Search & Filter
class SearchQuery(BaseModel):
    """Search query schema."""
    query: str
    search_in: List[str] = ["title", "artist", "album"]  # Fields to search in


# Auth / Users
class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    username: str
    created_at: datetime
    updated_at: datetime


class UserSettingsResponse(BaseModel):
    offline_mode: bool
    crossfade_seconds: float
    low_power_mode: bool
    last_synced_at: datetime


class UserSettingsUpdate(BaseModel):
    offline_mode: Optional[bool] = None
    crossfade_seconds: Optional[float] = None
    low_power_mode: Optional[bool] = None


class FavoriteResponse(BaseModel):
    id: int
    track: TrackResponse
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryCreate(BaseModel):
    """Request body for creating a play history entry."""
    track_id: int
    position: Optional[float] = None
    duration: Optional[float] = None


class HistoryItem(BaseModel):
    id: int
    track: TrackResponse
    played_at: datetime
    position: Optional[float] = None
    duration: Optional[float] = None

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    track_id: int
    tag: str
    type: Optional[str] = "custom"  # mood or custom


class TagResponse(BaseModel):
    id: int
    track: TrackResponse
    tag: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


# Share Links
class ShareCreateRequest(BaseModel):
    kind: str  # track or playlist
    resource_id: int
    title: Optional[str] = None


class ShareLinkResponse(BaseModel):
    token: str
    url: str
    kind: str
    resource_id: int
    title: Optional[str] = None
    created_at: datetime


class ShareCommentRequest(BaseModel):
    comment: str


class ShareCommentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


# Library Scan
class ScanRequest(BaseModel):
    """Library scan request."""
    scan_type: str = "incremental"  # full, incremental


class ScanStatus(BaseModel):
    """Scan status response."""
    is_scanning: bool
    current_scan_id: Optional[int] = None
    progress: Optional[str] = None


# ============= SLEEP & AMBIENT SCHEMAS =============

class AmbientSoundResponse(BaseModel):
    """Ambient sound response."""
    id: int
    mode: str
    name: str
    description: Optional[str] = None
    volume: float
    loop: bool
    is_premium: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AmbientSoundUpdate(BaseModel):
    """Update ambient sound settings."""
    volume: Optional[float] = None
    loop: Optional[bool] = None


class SleepTimerCreate(BaseModel):
    """Create sleep timer request."""
    duration_minutes: int
    fade_out_minutes: Optional[int] = 5
    start_volume: Optional[float] = 0.8
    end_volume: Optional[float] = 0.0
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None


class SleepTimerResponse(BaseModel):
    """Sleep timer response."""
    id: int
    user_id: Optional[int] = None
    duration_minutes: int
    fade_out_minutes: int
    start_volume: float
    end_volume: float
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None
    is_active: bool
    started_at: datetime
    scheduled_end_at: datetime
    actual_end_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SleepPlaylistCreate(BaseModel):
    """Create sleep playlist request."""
    name: str
    description: Optional[str] = None
    playlist_id: int  # Base playlist to convert to sleep playlist
    wind_down_duration: Optional[int] = 30
    energy_progression: Optional[str] = "high_to_low"
    tempo_range: Optional[dict] = None  # {"min": 60, "max": 90}
    genre_filters: Optional[List[str]] = None
    mood_filters: Optional[List[str]] = None
    ambient_mode: Optional[str] = None
    ambient_volume: Optional[float] = 0.3


class SleepPlaylistResponse(BaseModel):
    """Sleep playlist response."""
    id: int
    user_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    wind_down_duration: int
    energy_progression: str
    tempo_range: Optional[dict] = None
    genre_filters: Optional[List[str]] = None
    mood_filters: Optional[List[str]] = None
    ambient_mode: Optional[str] = None
    ambient_volume: float
    is_premium: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SleepScheduleCreate(BaseModel):
    """Create sleep schedule request."""
    name: str
    description: Optional[str] = None
    days_of_week: List[str]  # ["monday", "tuesday", ...]
    start_time: str  # HH:MM
    duration_minutes: int
    fade_out_minutes: Optional[int] = 5
    start_volume: Optional[float] = 0.8
    end_volume: Optional[float] = 0.0
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None


class SleepScheduleResponse(BaseModel):
    """Sleep schedule response."""
    id: int
    user_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    days_of_week: List[str]
    start_time: str
    duration_minutes: int
    fade_out_minutes: int
    start_volume: float
    end_volume: float
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None
    is_enabled: bool
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlarmCreate(BaseModel):
    """Create alarm request."""
    name: str
    description: Optional[str] = None
    time: str  # HH:MM
    days_of_week: List[str]  # ["monday", "tuesday", ...]
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None
    volume_start: Optional[float] = 0.0
    volume_end: Optional[float] = 0.8
    fade_in_minutes: Optional[int] = 10
    snooze_enabled: Optional[bool] = True
    snooze_minutes: Optional[int] = 9


class AlarmResponse(BaseModel):
    """Alarm response."""
    id: int
    user_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    time: str
    days_of_week: List[str]
    is_enabled: bool
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None
    volume_start: float
    volume_end: float
    fade_in_minutes: int
    snooze_enabled: bool
    snooze_minutes: int
    last_triggered_at: Optional[datetime] = None
    next_trigger_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlarmUpdate(BaseModel):
    """Update alarm request."""
    name: Optional[str] = None
    description: Optional[str] = None
    time: Optional[str] = None
    days_of_week: Optional[List[str]] = None
    is_enabled: Optional[bool] = None
    playlist_id: Optional[int] = None
    ambient_mode: Optional[str] = None
    volume_start: Optional[float] = None
    volume_end: Optional[float] = None
    fade_in_minutes: Optional[int] = None
    snooze_enabled: Optional[bool] = None
    snooze_minutes: Optional[int] = None
