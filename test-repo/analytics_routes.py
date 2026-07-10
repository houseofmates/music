"""
Analytics API endpoints for music app
"""

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import List, Optional
from database import get_session
from analytics_service import analytics_service

router = APIRouter()

@router.get("/analytics/year-in-review")
def get_year_in_review(
    year: Optional[int] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session)
):
    """Generate comprehensive year-in-review analytics"""
    return analytics_service.generate_year_in_review(session, user_id, year)

@router.get("/analytics/real-time")
def get_real_time_stats(
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session)
):
    """Get real-time listening statistics"""
    return analytics_service.get_real_time_stats(session, user_id)

@router.get("/analytics/genre-breakdown")
def get_genre_breakdown(
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session)
):
    """Get detailed genre breakdown analytics"""
    return analytics_service.get_genre_breakdown(session, user_id)

@router.get("/analytics/new-song-frequency")
def get_new_song_frequency(
    user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session)
):
    """Track how often new songs are added and discovered"""
    return analytics_service.track_new_song_frequency(session, user_id)

@router.get("/analytics/library-health")
def get_library_health(session: Session = Depends(get_session)):
    """Analyze library health and identify issues"""
    return analytics_service.analyze_library_health(session)

@router.get("/analytics/storage-optimization")
def get_storage_optimization(session: Session = Depends(get_session)):
    """Get storage optimization recommendations"""
    return analytics_service.get_storage_optimization(session)