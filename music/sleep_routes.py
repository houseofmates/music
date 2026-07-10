"""
Sleep and Ambient Features Routes

API endpoints for sleep timers, ambient sounds, sleep playlists, schedules, and alarms.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from database import get_session

logger = logging.getLogger(__name__)
from models import User, SleepTimer, SleepPlaylist, SleepSchedule, Alarm, AmbientSound
from schemas import (
    SleepTimerCreate, SleepTimerResponse, SleepPlaylistCreate, SleepPlaylistResponse,
    SleepScheduleCreate, SleepScheduleResponse, AlarmCreate, AlarmResponse, AlarmUpdate,
    AmbientSoundResponse, AmbientSoundUpdate
)
from sleep_service import SleepAmbientService
from auth import get_current_user_optional

router = APIRouter()


# ============= AMBIENT SOUNDS =============

@router.get("/ambient-sounds", response_model=List[AmbientSoundResponse])
def get_ambient_sounds(session: Session = Depends(get_session)):
    """Get all available ambient sounds."""
    sounds = SleepAmbientService.get_ambient_sounds()
    return [AmbientSoundResponse.model_validate(sound) for sound in sounds]


@router.get("/ambient-sounds/{sound_id}", response_model=AmbientSoundResponse)
def get_ambient_sound(sound_id: int, session: Session = Depends(get_session)):
    """Get a specific ambient sound."""
    sound = SleepAmbientService.get_ambient_sound(sound_id)
    if not sound:
        raise HTTPException(status_code=404, detail="Ambient sound not found")
    return AmbientSoundResponse.model_validate(sound)


@router.patch("/ambient-sounds/{sound_id}")
def update_ambient_sound(
    sound_id: int,
    updates: AmbientSoundUpdate,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Update ambient sound settings (volume, loop)."""
    sound = SleepAmbientService.get_ambient_sound(sound_id)
    if not sound:
        raise HTTPException(status_code=404, detail="Ambient sound not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sound, key, value)

    session.add(sound)
    session.commit()
    return {"message": "Ambient sound updated"}


# ============= SLEEP TIMERS =============

@router.post("/sleep-timer", response_model=SleepTimerResponse)
def create_sleep_timer(
    timer_data: SleepTimerCreate,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Create and start a new sleep timer."""
    try:
        timer = SleepAmbientService.create_sleep_timer(getattr(user, 'id', None), timer_data)
        return SleepTimerResponse.model_validate(timer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to create sleep timer")
        raise HTTPException(status_code=400, detail="Failed to create sleep timer")


@router.get("/sleep-timer/active", response_model=Optional[SleepTimerResponse])
def get_active_sleep_timer(
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Get the currently active sleep timer."""
    timer = SleepAmbientService.get_active_sleep_timer(getattr(user, 'id', None))
    if timer:
        return SleepTimerResponse.model_validate(timer)
    return None


@router.delete("/sleep-timer")
def cancel_sleep_timer(
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Cancel the active sleep timer."""
    cancelled = SleepAmbientService.cancel_sleep_timer(getattr(user, 'id', None))
    if cancelled:
        return {"message": "Sleep timer cancelled"}
    else:
        raise HTTPException(status_code=404, detail="No active sleep timer found")


@router.get("/sleep-timers", response_model=List[SleepTimerResponse])
def get_sleep_timer_history(
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Get sleep timer history."""
    timers = SleepAmbientService.get_user_sleep_timers(getattr(user, 'id', None), limit)
    return [SleepTimerResponse.model_validate(timer) for timer in timers]


# ============= SLEEP PLAYLISTS =============

@router.post("/sleep-playlists", response_model=SleepPlaylistResponse)
def create_sleep_playlist(
    playlist_data: SleepPlaylistCreate,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Create a sleep playlist configuration."""
    try:
        sleep_playlist = SleepAmbientService.create_sleep_playlist(getattr(user, 'id', None), playlist_data)
        return SleepPlaylistResponse.model_validate(sleep_playlist)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sleep-playlists", response_model=List[SleepPlaylistResponse])
def get_sleep_playlists(
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Get all sleep playlists for the user."""
    playlists = SleepAmbientService.get_sleep_playlists(getattr(user, 'id', None))
    return [SleepPlaylistResponse.model_validate(p) for p in playlists]


@router.get("/sleep-playlists/{playlist_id}/tracks")
def get_sleep_playlist_tracks(
    playlist_id: int,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Generate optimized track list for a sleep playlist."""
    # First get the sleep playlist
    sleep_playlist = session.get(SleepPlaylist, playlist_id)
    if not sleep_playlist or (sleep_playlist.user_id and sleep_playlist.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Sleep playlist not found")

    # Generate the optimized track list
    tracks = SleepAmbientService.generate_sleep_playlist_tracks(sleep_playlist, session)
    from schemas import TrackResponse
    return [TrackResponse.model_validate(track) for track in tracks]


@router.delete("/sleep-playlists/{playlist_id}")
def delete_sleep_playlist(
    playlist_id: int,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Delete a sleep playlist."""
    sleep_playlist = session.get(SleepPlaylist, playlist_id)
    if not sleep_playlist or (sleep_playlist.user_id and sleep_playlist.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Sleep playlist not found")

    session.delete(sleep_playlist)
    session.commit()
    return {"message": "Sleep playlist deleted"}


# ============= SLEEP SCHEDULES =============

@router.post("/sleep-schedules", response_model=SleepScheduleResponse)
def create_sleep_schedule(
    schedule_data: SleepScheduleCreate,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Create a sleep schedule."""
    try:
        schedule = SleepAmbientService.create_sleep_schedule(getattr(user, 'id', None), schedule_data)
        return SleepScheduleResponse.model_validate(schedule)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to create sleep schedule")
        raise HTTPException(status_code=400, detail="Failed to create sleep schedule")


@router.get("/sleep-schedules", response_model=List[SleepScheduleResponse])
def get_sleep_schedules(
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Get all sleep schedules for the user."""
    schedules = SleepAmbientService.get_sleep_schedules(getattr(user, 'id', None))
    return [SleepScheduleResponse.model_validate(s) for s in schedules]


@router.patch("/sleep-schedules/{schedule_id}", response_model=SleepScheduleResponse)
def update_sleep_schedule(
    schedule_id: int,
    updates: dict,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Update a sleep schedule."""
    schedule = SleepAmbientService.update_sleep_schedule(schedule_id, updates)
    if not schedule or (schedule.user_id and schedule.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Sleep schedule not found")

    return SleepScheduleResponse.model_validate(schedule)


@router.delete("/sleep-schedules/{schedule_id}")
def delete_sleep_schedule(
    schedule_id: int,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Delete a sleep schedule."""
    schedule = session.get(SleepSchedule, schedule_id)
    if not schedule or (schedule.user_id and schedule.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Sleep schedule not found")

    session.delete(schedule)
    session.commit()
    return {"message": "Sleep schedule deleted"}


# ============= ALARMS =============

@router.post("/alarms", response_model=AlarmResponse)
def create_alarm(
    alarm_data: AlarmCreate,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Create a new alarm."""
    try:
        alarm = SleepAmbientService.create_alarm(getattr(user, 'id', None), alarm_data)
        return AlarmResponse.model_validate(alarm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Failed to create alarm")
        raise HTTPException(status_code=400, detail="Failed to create alarm")


@router.get("/alarms", response_model=List[AlarmResponse])
def get_alarms(
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Get all alarms for the user."""
    alarms = SleepAmbientService.get_alarms(getattr(user, 'id', None))
    return [AlarmResponse.model_validate(alarm) for alarm in alarms]


@router.patch("/alarms/{alarm_id}", response_model=AlarmResponse)
def update_alarm(
    alarm_id: int,
    updates: AlarmUpdate,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Update an alarm."""
    alarm = SleepAmbientService.update_alarm(alarm_id, updates)
    if not alarm or (alarm.user_id and alarm.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Alarm not found")

    return AlarmResponse.model_validate(alarm)


@router.delete("/alarms/{alarm_id}")
def delete_alarm(
    alarm_id: int,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Delete an alarm."""
    alarm = session.get(Alarm, alarm_id)
    if not alarm or (alarm.user_id and alarm.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Alarm not found")

    deleted = SleepAmbientService.delete_alarm(alarm_id)
    if deleted:
        return {"message": "Alarm deleted"}
    else:
        raise HTTPException(status_code=404, detail="Alarm not found")


@router.post("/alarms/{alarm_id}/snooze")
def snooze_alarm(
    alarm_id: int,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Snooze an alarm."""
    alarm = session.get(Alarm, alarm_id)
    if not alarm or (alarm.user_id and alarm.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Alarm not found")

    snoozed = SleepAmbientService.snooze_alarm(alarm_id)
    if snoozed:
        return {"message": "Alarm snoozed"}
    else:
        raise HTTPException(status_code=400, detail="Alarm cannot be snoozed")


@router.post("/alarms/{alarm_id}/dismiss")
def dismiss_alarm(
    alarm_id: int,
    user: User = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    """Dismiss/stop an alarm."""
    alarm = session.get(Alarm, alarm_id)
    if not alarm or (alarm.user_id and alarm.user_id != getattr(user, 'id', None)):
        raise HTTPException(status_code=404, detail="Alarm not found")

    # Update next trigger time
    from sleep_service import SleepAmbientService
    alarm.next_trigger_at = SleepAmbientService._calculate_next_alarm(alarm)
    session.add(alarm)
    session.commit()

    return {"message": "Alarm dismissed"}