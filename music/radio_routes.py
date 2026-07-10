"""
Radio API endpoints for artist radio and genre radio
"""

import random
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import List, Optional
from database import get_session
from models import Track
from radio_service import radio_service
from schemas import TrackResponse

router = APIRouter()

@router.get("/radio/artist/{artist_name}", response_model=List[TrackResponse])
def get_artist_radio(
    artist_name: str,
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """Generate artist radio playlist based on similar artists and genres"""
    
    tracks = radio_service.generate_artist_radio(session, artist_name, limit)
    return [_to_track_response(track) for track in tracks]

@router.get("/radio/genre/{genre_name}", response_model=List[TrackResponse])
def get_genre_radio(
    genre_name: str,
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """Generate genre radio playlist based on genre and related genres"""
    
    tracks = radio_service.generate_genre_radio(session, genre_name, limit)
    return [_to_track_response(track) for track in tracks]

@router.get("/radio/mood/{mood}", response_model=List[TrackResponse])
def get_mood_radio(
    mood: str,
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """Generate mood-based radio playlist"""
    
    tracks = radio_service.generate_mood_radio(session, mood, limit)
    return [_to_track_response(track) for track in tracks]

@router.get("/radio/discover", response_model=List[TrackResponse])
def get_discover_radio(
    limit: int = Query(default=50, ge=1, le=100),
    session: Session = Depends(get_session)
):
    """Generate discovery radio with diverse tracks"""
    
    # Get a diverse selection of tracks
    tracks = session.exec(
        select(Track).where(
            Track.genre.is_not(None)
        ).limit(limit * 3)
    ).all()
    
    # Group by genre and sample from each
    genre_groups = {}
    for track in tracks:
        genre = track.genre or "unknown"
        if genre not in genre_groups:
            genre_groups[genre] = []
        genre_groups[genre].append(track)
    
    # Sample from each genre to ensure variety
    selected_tracks = []
    tracks_per_genre = max(1, limit // len(genre_groups))
    
    for genre_tracks in genre_groups.values():
        sample = random.sample(genre_tracks, min(tracks_per_genre, len(genre_tracks)))
        selected_tracks.extend(sample)
    
    # Shuffle and limit
    random.shuffle(selected_tracks)
    
    return [_to_track_response(track) for track in selected_tracks[:limit]]

def _to_track_response(track: Track) -> TrackResponse:
    """Convert Track to TrackResponse"""
    return TrackResponse(
        id=track.id,
        title=track.title,
        artist=track.artist,
        album=track.album,
        genre=track.genre,
        year=track.year,
        track_number=track.track_number,
        duration=track.duration,
        cover_art_url=track.cover_art_url,
        file_path=track.file_path,
        filename=track.filename,
        file_size=track.file_size,
        last_modified=track.last_modified,
        created_at=track.created_at,
        updated_at=track.updated_at
    )