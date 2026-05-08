"""smart contextual queueing system with ai-powered recommendations.

this module provides intelligent queue management that:
- weights tracks based on skip history and user preferences
- adapts to time of day and listening patterns
- provides contextual shuffle with mood awareness
- learns from user behavior over time
"""

import os
import asyncio
import logging
import numpy as np
from datetime import datetime, timezone, time as dt_time, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict, Counter

logger = logging.getLogger(__name__)

from sqlmodel import Session, select, and_, or_, func
from models import Track, QueueItem, UserPlayStats, AudioFeatures, User, UserSettings
from enhanced_semantic_search import enhanced_search


class ContextualQueueManager:
    """advanced intelligent queue management with contextual recommendations."""

    def __init__(self):
        self.time_weights = {
            'morning': (6, 12),    # 6am - 12pm
            'afternoon': (12, 18), # 12pm - 6pm
            'evening': (18, 22),   # 6pm - 10pm
            'night': (22, 6)       # 10pm - 6am
        }

        self.mood_keywords = {
            'energetic': ['workout', 'energy', 'upbeat', 'party', 'dance', 'rock', 'electronic'],
            'relaxed': ['chill', 'calm', 'relax', 'peaceful', 'ambient', 'jazz', 'classical'],
            'focused': ['focus', 'study', 'work', 'concentration', 'instrumental'],
            'happy': ['happy', 'joy', 'uplifting', 'positive', 'pop', 'funk'],
            'melancholic': ['sad', 'melancholy', 'emotional', 'reflective', 'blues', 'indie']
        }

        # Enhanced mood transition matrix for smooth listening experiences
        self.mood_transitions = {
            'energetic': {'energetic': 0.9, 'happy': 0.7, 'relaxed': 0.3, 'focused': 0.2, 'melancholic': 0.1},
            'happy': {'happy': 0.8, 'energetic': 0.6, 'relaxed': 0.8, 'focused': 0.4, 'melancholic': 0.2},
            'relaxed': {'relaxed': 0.9, 'happy': 0.7, 'focused': 0.6, 'melancholic': 0.5, 'energetic': 0.2},
            'focused': {'focused': 0.9, 'relaxed': 0.7, 'happy': 0.5, 'energetic': 0.3, 'melancholic': 0.3},
            'melancholic': {'melancholic': 0.8, 'relaxed': 0.7, 'focused': 0.5, 'happy': 0.4, 'energetic': 0.2}
        }

        # Time-of-day preference learning
        self.time_preferences = {
            'morning': {'energy': 0.7, 'tempo': 120, 'valence': 0.6, 'danceability': 0.6},
            'afternoon': {'energy': 0.6, 'tempo': 110, 'valence': 0.7, 'danceability': 0.5},
            'evening': {'energy': 0.4, 'tempo': 90, 'valence': 0.8, 'danceability': 0.4},
            'night': {'energy': 0.3, 'tempo': 80, 'valence': 0.5, 'danceability': 0.3}
        }
    
    async def get_contextual_recommendations(self, user_id: int, current_track_id: Optional[int] = None, 
                                          queue_size: int = 20, context: Optional[Dict] = None) -> List[Dict]:
        """get intelligent recommendations based on user context and behavior."""
        
        # get current context
        current_context = await self._analyze_context(user_id, current_track_id, context)
        
        # get candidate tracks
        candidates = await self._get_candidate_tracks(user_id, current_context)
        
        # score and rank candidates
        scored_candidates = await self._score_candidates(candidates, current_context, user_id)
        
        # apply diversity and variety
        final_recommendations = await self._apply_diversity_filter(scored_candidates, queue_size)
        
        return final_recommendations
    
    async def _analyze_context(self, user_id: int, current_track_id: Optional[int],
                              provided_context: Optional[Dict]) -> Dict:
        """analyze current listening context with enhanced pattern recognition."""
        context = provided_context or {}

        # time of day
        now = datetime.now(timezone.utc)
        hour = now.hour
        time_of_day = self._get_time_of_day(hour)
        context['time_of_day'] = time_of_day

        # day of week
        day_of_week = now.weekday()  # 0=Monday, 6=Sunday
        context['day_of_week'] = day_of_week
        context['is_weekend'] = day_of_week >= 5

        # current track analysis
        if current_track_id:
            with Session(engine) as session:
                current_track = session.exec(select(Track).where(Track.id == current_track_id)).first()
                if current_track:
                    audio_features = session.exec(
                        select(AudioFeatures).where(AudioFeatures.track_id == current_track_id)
                    ).first()

                    context['current_mood'] = audio_features.mood if audio_features else None
                    context['current_energy'] = audio_features.energy if audio_features else 0.5
                    context['current_tempo'] = audio_features.tempo if audio_features else 120
                    context['current_genre'] = current_track.genre

        # Enhanced user behavior analysis
        with Session(engine) as session:
            user_stats = session.exec(
                select(UserPlayStats).where(UserPlayStats.user_id == user_id)
            ).all()

            if user_stats:
                # analyze user's listening patterns
                avg_love_score = np.mean([stat.love_score for stat in user_stats if stat.love_score != 0])
                context['user_preference_score'] = avg_love_score

                # Time-based pattern analysis
                time_patterns = await self._analyze_time_patterns(user_stats, time_of_day)
                context.update(time_patterns)

                # Mood transition analysis
                mood_patterns = await self._analyze_mood_patterns(user_stats)
                context.update(mood_patterns)

                # Skip behavior analysis
                skip_patterns = await self._analyze_skip_patterns(user_stats)
                context.update(skip_patterns)

                # Recent listening trends
                recent_trends = await self._analyze_recent_trends(user_stats, time_of_day)
                context.update(recent_trends)

        return context
    
    def _get_time_of_day(self, hour: int) -> str:
        """determine time of day category."""
        for period, (start, end) in self.time_weights.items():
            if start <= hour < end or (period == 'night' and (hour >= start or hour < end)):
                return period
        return 'evening'  # default

    async def _analyze_time_patterns(self, user_stats: List, current_time_of_day: str) -> Dict:
        """analyze user's time-based listening patterns."""
        patterns = {}

        # Aggregate hour preferences
        hour_preferences = {}
        for stat in user_stats:
            if stat.hour_of_day_plays:
                hours = list(stat.hour_of_day_plays)
                for hour_idx, count in enumerate(hours):
                    if count > 0:
                        if hour_idx not in hour_preferences:
                            hour_preferences[hour_idx] = []
                        hour_preferences[hour_idx].extend([stat.love_score] * count)

        # Calculate average love scores by hour
        patterns['hour_preferences'] = {}
        for hour, scores in hour_preferences.items():
            if scores:
                patterns['hour_preferences'][hour] = np.mean(scores)

        # Current time preference
        current_hour = datetime.now(timezone.utc).hour
        patterns['current_hour_preference'] = patterns['hour_preferences'].get(current_hour, 0.0)

        # Time-of-day preferences
        time_preferences = {}
        for stat in user_stats:
            if stat.hour_of_day_plays:
                hours = list(stat.hour_of_day_plays)
                for hour_idx, count in enumerate(hours):
                    if count > 0:
                        time_period = self._get_time_of_day(hour_idx)
                        if time_period not in time_preferences:
                            time_preferences[time_period] = []
                        time_preferences[time_period].extend([stat.love_score] * count)

        patterns['time_of_day_preferences'] = {}
        for period, scores in time_preferences.items():
            if scores:
                patterns['time_of_day_preferences'][period] = np.mean(scores)

        return patterns

    async def _analyze_mood_patterns(self, user_stats: List) -> Dict:
        """analyze user's mood-based listening patterns with batch loading."""
        patterns = {}
        mood_preferences = defaultdict(list)
        skip_moods = defaultdict(list)

        # Batch load all audio features in a single query
        relevant_track_ids = [stat.track_id for stat in user_stats if stat.play_count > 0]
        if relevant_track_ids:
            with Session(engine) as session:
                af_list = session.exec(
                    select(AudioFeatures).where(AudioFeatures.track_id.in_(relevant_track_ids))
                ).all()
                af_by_track = {af.track_id: af for af in af_list}

                for stat in user_stats:
                    if stat.play_count > 0:
                        af = af_by_track.get(stat.track_id)
                        if af and af.mood:
                            if stat.love_score > 0.2:
                                mood_preferences[af.mood].append(stat.love_score)
                            if stat.skip_count > stat.play_count * 0.3:
                                skip_moods[af.mood].append(1)

        patterns['preferred_moods'] = {}
        for mood, scores in mood_preferences.items():
            patterns['preferred_moods'][mood] = np.mean(scores)

        patterns['avoided_moods'] = list(skip_moods.keys())

        return patterns

    async def _analyze_skip_patterns(self, user_stats: List) -> Dict:
        """analyze user's skip behavior patterns with batch loading."""
        patterns = {}

        total_plays = sum(stat.play_count for stat in user_stats)
        total_skips = sum(stat.skip_count for stat in user_stats)

        if total_plays > 0:
            patterns['overall_skip_rate'] = total_skips / total_plays

        # Batch load all relevant tracks in a single query
        relevant_track_ids = [stat.track_id for stat in user_stats if stat.play_count > 0]
        genre_skip_rates = defaultdict(lambda: {'plays': 0, 'skips': 0})
        if relevant_track_ids:
            with Session(engine) as session:
                tracks = session.exec(
                    select(Track).where(Track.id.in_(relevant_track_ids))
                ).all()
                track_by_id = {t.id: t for t in tracks}

                for stat in user_stats:
                    if stat.play_count > 0:
                        track = track_by_id.get(stat.track_id)
                        if track and track.genre:
                            genre_skip_rates[track.genre]['plays'] += stat.play_count
                            genre_skip_rates[track.genre]['skips'] += stat.skip_count

        patterns['genre_skip_rates'] = {}
        for genre, counts in genre_skip_rates.items():
            if counts['plays'] > 0:
                patterns['genre_skip_rates'][genre] = counts['skips'] / counts['plays']

        return patterns

    async def _analyze_recent_trends(self, user_stats: List, current_time_of_day: str) -> Dict:
        """analyze recent listening trends with batch loading."""
        patterns = {}
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_stats = [stat for stat in user_stats if stat.last_played and stat.last_played > week_ago]

        if recent_stats:
            # Batch load all tracks and audio features in two queries
            recent_track_ids = [stat.track_id for stat in recent_stats]
            recent_genres = []
            recent_moods = []
            energies = []
            tempos = []

            with Session(engine) as session:
                tracks = session.exec(
                    select(Track).where(Track.id.in_(recent_track_ids))
                ).all()
                track_by_id = {t.id: t for t in tracks}

                af_list = session.exec(
                    select(AudioFeatures).where(AudioFeatures.track_id.in_(recent_track_ids))
                ).all()
                af_by_track = {af.track_id: af for af in af_list}

                for stat in recent_stats:
                    track = track_by_id.get(stat.track_id)
                    af = af_by_track.get(stat.track_id)

                    if track and track.genre:
                        recent_genres.append(track.genre)
                    if af and af.mood:
                        recent_moods.append(af.mood)
                    if af:
                        if af.energy is not None:
                            energies.append(af.energy)
                        if af.tempo is not None:
                            tempos.append(af.tempo)

            patterns['recent_genres'] = Counter(recent_genres).most_common(3)
            patterns['recent_moods'] = Counter(recent_moods).most_common(3)

            if energies:
                patterns['recent_avg_energy'] = np.mean(energies)
            if tempos:
                patterns['recent_avg_tempo'] = np.mean(tempos)

        return patterns
    
    async def _get_candidate_tracks(self, user_id: int, context: Dict) -> List[Dict]:
        """get candidate tracks based on context."""
        candidates = []
        
        with Session(engine) as session:
            # get user's play stats to identify preferences
            user_stats = session.exec(
                select(UserPlayStats).where(UserPlayStats.user_id == user_id)
            ).all()
            
            user_stats_by_track = {stat.track_id: stat for stat in user_stats}
            
            # get tracks user loves (high love_score, low skip_rate)
            loved_track_ids = [
                stat.track_id for stat in user_stats 
                if stat.love_score > 0.3 and stat.skip_count < stat.play_count * 0.2
            ]
            
            # get recently played tracks (for variety)
            recent_track_ids = [
                stat.track_id for stat in user_stats 
                if stat.last_played and (datetime.now(timezone.utc) - stat.last_played).days < 7
            ]
            
            # base query - get tracks user hasn't recently played
            base_query = select(Track).where(
                and_(
                    Track.id.notin(recent_track_ids[:100]) if recent_track_ids else True,
                    Track.duration.isnot(None)
                )
            )
            
            # apply context-based filtering
            if context.get('time_of_day') == 'morning':
                # prefer upbeat, energetic tracks for morning
                base_query = base_query.where(
                    or_(
                        Track.genre.ilike('%pop%'),
                        Track.genre.ilike('%rock%'),
                        Track.genre.ilike('%electronic%')
                    )
                )
            elif context.get('time_of_day') == 'evening':
                # prefer relaxed, chill tracks for evening
                base_query = base_query.where(
                    or_(
                        Track.genre.ilike('%jazz%'),
                        Track.genre.ilike('%ambient%'),
                        Track.genre.ilike('%chill%')
                    )
                )
            
            tracks = session.exec(base_query.limit(200)).all()
            track_ids = [t.id for t in tracks]
            
            # batch load all audio features in a single query (eliminates N+1)
            audio_features_by_track = {}
            if track_ids:
                af_list = session.exec(
                    select(AudioFeatures).where(AudioFeatures.track_id.in_(track_ids))
                ).all()
                audio_features_by_track = {af.track_id: af for af in af_list}
            
            for track in tracks:
                candidates.append({
                    'track': track,
                    'user_stat': user_stats_by_track.get(track.id),
                    'audio_features': audio_features_by_track.get(track.id)
                })
        
        return candidates
    
    async def _score_candidates(self, candidates: List[Dict], context: Dict, user_id: int) -> List[Dict]:
        """score candidates based on multiple factors."""
        scored_candidates = []
        
        for candidate in candidates:
            track = candidate['track']
            user_stat = candidate['user_stat']
            audio_features = candidate['audio_features']
            
            score = 0.0
            
            # base score
            score += 0.3
            
            # user preference score
            if user_stat:
                # love score influence
                if user_stat.love_score > 0:
                    score += user_stat.love_score * 0.4
                
                # play count influence (diminishing returns)
                if user_stat.play_count > 0:
                    play_bonus = min(user_stat.play_count / 50, 0.3)
                    score += play_bonus
                
                # skip penalty
                if user_stat.skip_count > 0:
                    skip_ratio = user_stat.skip_count / max(user_stat.play_count, 1)
                    score -= skip_ratio * 0.5
                
                # recency penalty (avoid overplaying recent tracks)
                if user_stat.last_played:
                    days_since_play = (datetime.now(timezone.utc) - user_stat.last_played).days
                    if days_since_play < 3:
                        score -= 0.3
                    elif days_since_play > 30:
                        score += 0.1  # rediscovery bonus
            
            # Enhanced time of day scoring with user preferences
            time_of_day = context.get('time_of_day', 'evening')
            time_prefs = context.get('time_of_day_preferences', {})

            if audio_features:
                # User-specific time preferences
                user_time_pref = time_prefs.get(time_of_day, 0.0)
                score += user_time_pref * 0.2

                # General time-of-day preferences
                default_prefs = self.time_preferences.get(time_of_day, {})
                if audio_features.energy is not None:
                    energy_diff = abs(audio_features.energy - default_prefs.get('energy', 0.5))
                    energy_match = 1 - min(energy_diff, 1.0)
                    score += energy_match * 0.15

                if audio_features.tempo is not None and default_prefs.get('tempo'):
                    tempo_diff = abs(audio_features.tempo - default_prefs['tempo'])
                    tempo_match = max(0, 1 - (tempo_diff / 50))  # Within 50 BPM
                    score += tempo_match * 0.1

                if audio_features.valence is not None:
                    valence_diff = abs(audio_features.valence - default_prefs.get('valence', 0.5))
                    valence_match = 1 - min(valence_diff, 1.0)
                    score += valence_match * 0.1
            
            # Enhanced mood compatibility with transition matrix
            current_mood = context.get('current_mood')
            preferred_moods = context.get('preferred_moods', {})
            avoided_moods = context.get('avoided_moods', [])

            if audio_features and audio_features.mood:
                track_mood = audio_features.mood

                # Penalize avoided moods
                if track_mood in avoided_moods:
                    score -= 0.3

                # Boost preferred moods
                if track_mood in preferred_moods:
                    score += preferred_moods[track_mood] * 0.4

                # Mood transition scoring
                if current_mood and current_mood in self.mood_transitions:
                    transition_score = self.mood_transitions[current_mood].get(track_mood, 0.1)
                    score += transition_score * 0.2
                elif current_mood == track_mood:
                    score += 0.3  # Same mood bonus
            
            # Enhanced genre variety with user patterns
            current_genre = context.get('current_genre')
            recent_genres = context.get('recent_genres', [])
            genre_skip_rates = context.get('genre_skip_rates', {})
            recent_genre_names = [genre for genre, _ in recent_genres]

            if track.genre:
                genre_lower = track.genre.lower()

                # Penalize genres with high skip rates
                skip_rate = genre_skip_rates.get(track.genre, 0.0)
                score -= skip_rate * 0.4

                # Boost genres recently listened to but not overplayed
                if genre_lower in [g.lower() for g in recent_genre_names]:
                    recent_count = next((count for g, count in recent_genres if g.lower() == genre_lower), 0)
                    if recent_count < 3:  # Not overplayed
                        score += 0.15

                # Variety from current genre
                if current_genre and genre_lower == current_genre.lower():
                    score -= 0.1  # slight penalty for same genre
                elif current_genre and self._are_genres_compatible(current_genre, track.genre):
                    score += 0.05
            
            # Enhanced audio feature similarity for smooth transitions
            if audio_features:
                # Energy/tempo matching with current track
                if context.get('current_energy') is not None:
                    energy_diff = abs(audio_features.energy - context['current_energy'])
                    energy_similarity = 1 - min(energy_diff, 1.0)
                    score += energy_similarity * 0.1

                # Match recent listening trends
                recent_energy = context.get('recent_avg_energy')
                recent_tempo = context.get('recent_avg_tempo')

                if recent_energy is not None and audio_features.energy is not None:
                    energy_trend_diff = abs(audio_features.energy - recent_energy)
                    energy_trend_match = 1 - min(energy_trend_diff, 1.0)
                    score += energy_trend_match * 0.05

                if recent_tempo is not None and audio_features.tempo is not None:
                    tempo_trend_diff = abs(audio_features.tempo - recent_tempo)
                    tempo_trend_match = max(0, 1 - (tempo_trend_diff / 30))  # Within 30 BPM
                    score += tempo_trend_match * 0.05

                # Valence matching based on time of day
                current_hour_pref = context.get('current_hour_preference', 0.0)
                if audio_features.valence is not None:
                    # Adjust valence based on user's hour preference
                    ideal_valence = 0.5 + (current_hour_pref * 0.3)  # Range: 0.2 to 0.8
                    valence_diff = abs(audio_features.valence - ideal_valence)
                    valence_match = 1 - min(valence_diff, 1.0)
                    score += valence_match * 0.05
            
            scored_candidates.append({
                **candidate,
                'score': max(0, score)  # ensure non-negative
            })
        
        # sort by score
        scored_candidates.sort(key=lambda x: x['score'], reverse=True)
        return scored_candidates
    
    def _are_moods_compatible(self, mood1: str, mood2: str) -> bool:
        """check if two moods are compatible for smooth transitions."""
        compatible_pairs = [
            ('happy', 'energetic'),
            ('energetic', 'happy'),
            ('relaxed', 'calm'),
            ('calm', 'relaxed'),
            ('melancholic', 'relaxed'),
            ('relaxed', 'melancholic'),
        ]
        
        return (mood1, mood2) in compatible_pairs or (mood2, mood1) in compatible_pairs
    
    def _are_genres_compatible(self, genre1: str, genre2: str) -> bool:
        """check if genres are compatible for variety."""
        genre_map = {
            'rock': ['alternative', 'indie', 'punk'],
            'electronic': ['techno', 'house', 'ambient', 'synthwave'],
            'pop': ['indie pop', 'synthpop'],
            'jazz': ['smooth jazz', 'fusion'],
            'classical': ['orchestral', 'contemporary classical'],
        }
        
        genre1_lower = genre1.lower()
        genre2_lower = genre2.lower()
        
        for base, related in genre_map.items():
            if base in genre1_lower and any(r in genre2_lower for r in related):
                return True
            if base in genre2_lower and any(r in genre1_lower for r in related):
                return True
        
        return False
    
    async def _apply_diversity_filter(self, scored_candidates: List[Dict], queue_size: int) -> List[Dict]:
        """apply advanced diversity filter to ensure varied and contextual recommendations."""
        if not scored_candidates:
            return []

        recommendations = []
        genre_counts = defaultdict(int)
        mood_counts = defaultdict(int)
        artist_counts = defaultdict(int)
        energy_ranges = defaultdict(int)  # Low, medium, high energy

        def get_energy_range(energy: float) -> str:
            if energy < 0.4:
                return 'low'
            elif energy < 0.7:
                return 'medium'
            else:
                return 'high'

        # Enhanced diversity constraints
        max_genre_pct = 0.25  # Max 25% of same genre
        max_mood_pct = 0.3    # Max 30% of same mood
        max_artist_pct = 0.15 # Max 15% of same artist
        max_energy_pct = 0.4  # Max 40% of same energy range

        # First pass: select diverse candidates with dynamic constraints
        for candidate in scored_candidates:
            if len(recommendations) >= queue_size:
                break

            track = candidate['track']
            audio_features = candidate['audio_features']

            # Diversity constraints
            genre = track.genre or 'unknown'
            mood = audio_features.mood if audio_features else 'unknown'
            artist = track.artist or 'unknown'
            energy_range = get_energy_range(audio_features.energy) if audio_features and audio_features.energy else 'unknown'

            # Dynamic max counts based on current queue size
            current_size = len(recommendations) + 1
            max_genre_count = max(1, int(current_size * max_genre_pct))
            max_mood_count = max(1, int(current_size * max_mood_pct))
            max_artist_count = max(1, int(current_size * max_artist_pct))
            max_energy_count = max(1, int(current_size * max_energy_pct))

            # Skip if diversity limits exceeded
            if genre_counts[genre] >= max_genre_count:
                continue
            if mood_counts[mood] >= max_mood_count:
                continue
            if artist_counts[artist] >= max_artist_count:
                continue
            if energy_ranges[energy_range] >= max_energy_count:
                continue

            recommendations.append(candidate)
            genre_counts[genre] += 1
            mood_counts[mood] += 1
            artist_counts[artist] += 1
            energy_ranges[energy_range] += 1

        # Second pass: fill remaining slots with highest scoring candidates
        if len(recommendations) < queue_size:
            remaining_candidates = [c for c in scored_candidates if c not in recommendations]
            # Sort remaining by score and add diversity penalties
            for candidate in remaining_candidates[:queue_size - len(recommendations)]:
                track = candidate['track']
                audio_features = candidate['audio_features']

                # Apply diversity penalty to score
                diversity_penalty = 0
                genre = track.genre or 'unknown'
                mood = audio_features.mood if audio_features else 'unknown'
                artist = track.artist or 'unknown'

                if genre_counts[genre] > 0:
                    diversity_penalty += 0.05
                if mood_counts[mood] > 0:
                    diversity_penalty += 0.05
                if artist_counts[artist] > 0:
                    diversity_penalty += 0.1

                candidate['score'] -= diversity_penalty

            # Re-sort by adjusted score
            remaining_candidates.sort(key=lambda x: x['score'], reverse=True)
            recommendations.extend(remaining_candidates[:queue_size - len(recommendations)])

        # Final sort by score for optimal ordering
        recommendations.sort(key=lambda x: x['score'], reverse=True)

        # Format response with additional metadata
        formatted_recommendations = []
        for rec in recommendations:
            track = rec['track']
            audio_features = rec['audio_features']

            formatted_recommendations.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'genre': track.genre,
                'score': round(rec['score'], 3),
                'confidence': self._calculate_confidence(rec),
                'audio_features': {
                    'mood': audio_features.mood if audio_features else None,
                    'energy': audio_features.energy if audio_features else None,
                    'tempo': audio_features.tempo if audio_features else None,
                    'valence': audio_features.valence if audio_features else None,
                    'danceability': audio_features.danceability if audio_features else None,
                } if audio_features else None,
                'context_factors': self._explain_recommendation(rec)
            })

        return formatted_recommendations

    def _calculate_confidence(self, recommendation: Dict) -> float:
        """calculate confidence score for recommendation."""
        score = recommendation['score']
        # Normalize score to 0-1 confidence range
        confidence = min(1.0, max(0.0, (score - 0.3) / 0.7))  # Scores from 0.3-1.0 map to 0-1
        return round(confidence, 2)

    def _explain_recommendation(self, recommendation: Dict) -> List[str]:
        """provide human-readable explanation for why this track was recommended."""
        factors = []
        candidate = recommendation
        track = candidate['track']
        audio_features = candidate['audio_features']

        if candidate.get('score', 0) > 0.8:
            factors.append("High user preference")
        if audio_features and audio_features.energy and audio_features.energy > 0.7:
            factors.append("High energy match")
        if track.genre:
            factors.append(f"Genre: {track.genre}")
        if audio_features and audio_features.mood:
            factors.append(f"Mood: {audio_features.mood}")

        return factors[:3]  # Limit to top 3 factors

    async def _generate_explanation(self, recommendation: Dict, context: Dict) -> str:
        """generate detailed explanation for recommendation."""
        track = recommendation['track']
        audio_features = recommendation.get('audio_features')

        reasons = []

        # Time-based reasons
        time_of_day = context.get('time_of_day')
        if time_of_day:
            reasons.append(f"Good for {time_of_day} listening")

        # Mood-based reasons
        target_mood = context.get('target_mood')
        if target_mood and audio_features and audio_features.mood == target_mood:
            reasons.append(f"Matches your preferred {target_mood} mood")

        # Energy-based reasons
        target_energy = context.get('target_energy')
        if target_energy and audio_features and audio_features.energy:
            energy_diff = abs(audio_features.energy - target_energy)
            if energy_diff < 0.2:
                energy_level = "high energy" if target_energy > 0.6 else "relaxed" if target_energy < 0.4 else "moderate energy"
                reasons.append(f"Perfect {energy_level} level")

        # User preference reasons
        score = recommendation.get('score', 0)
        if score > 0.7:
            reasons.append("Based on your listening history")

        # Genre variety
        recent_genres = context.get('recent_genres', [])
        if track.genre and not any(track.genre.lower() == g.lower() for g, _ in recent_genres):
            reasons.append(f"New genre variety: {track.genre}")

        if not reasons:
            reasons.append("General recommendation")

        return ". ".join(reasons)
    
    async def update_user_preferences(self, user_id: int, track_id: int, action: str,
                                    position: Optional[float] = None, duration: Optional[float] = None):
        """update user preferences based on playback actions with enhanced learning."""
        with Session(engine) as session:
            # get or create user play stats
            user_stat = session.exec(
                select(UserPlayStats).where(
                    and_(
                        UserPlayStats.user_id == user_id,
                        UserPlayStats.track_id == track_id
                    )
                )
            ).first()

            if not user_stat:
                user_stat = UserPlayStats(user_id=user_id, track_id=track_id)
                session.add(user_stat)

            current_time = datetime.now(timezone.utc)

            # update based on action
            if action == 'play':
                user_stat.play_count += 1
                user_stat.last_played = current_time

                if position and duration:
                    # calculate completion percentage
                    completion = position / duration if duration > 0 else 0
                    user_stat.total_play_time += position

                    # Enhanced love score calculation based on completion and engagement
                    if completion > 0.9:  # nearly full play
                        user_stat.love_score = min(1.0, user_stat.love_score + 0.15)
                    elif completion > 0.7:  # good completion
                        user_stat.love_score = min(1.0, user_stat.love_score + 0.08)
                    elif completion > 0.5:  # moderate completion
                        user_stat.love_score = min(1.0, user_stat.love_score + 0.03)
                    elif completion < 0.2:  # very short play
                        user_stat.love_score = max(-1.0, user_stat.love_score - 0.08)
                    elif completion < 0.3:  # skipped early
                        user_stat.love_score = max(-1.0, user_stat.love_score - 0.05)

                # Enhanced time-based statistics
                current_hour = current_time.hour
                current_day = current_time.weekday()

                # Initialize arrays if needed
                if not user_stat.hour_of_day_plays:
                    user_stat.hour_of_day_plays = bytes([0] * 24)
                if not user_stat.day_of_week_plays:
                    user_stat.day_of_week_plays = bytes([0] * 7)

                # Update hour statistics
                hour_plays = list(user_stat.hour_of_day_plays)
                hour_plays[current_hour] = min(255, hour_plays[current_hour] + 1)
                user_stat.hour_of_day_plays = bytes(hour_plays)

                # Update day statistics
                day_plays = list(user_stat.day_of_week_plays)
                day_plays[current_day] = min(255, day_plays[current_day] + 1)
                user_stat.day_of_week_plays = bytes(day_plays)

            elif action == 'skip':
                user_stat.skip_count += 1
                # More nuanced skip penalty based on play time
                if position and duration and position / duration > 0.5:
                    # Skip after halfway - less severe penalty
                    user_stat.love_score = max(-1.0, user_stat.love_score - 0.05)
                else:
                    # Early skip - stronger penalty
                    user_stat.love_score = max(-1.0, user_stat.love_score - 0.1)

            elif action == 'love':
                user_stat.love_score = 1.0
            elif action == 'hate':
                user_stat.love_score = -1.0

            # Update last modified timestamp
            user_stat.updated_at = current_time

            session.commit()

    async def _update_contextual_patterns(self, user_id: int, track_id: int, action: str, timestamp: datetime):
        """update contextual patterns based on user actions for improved recommendations."""
        # This could be expanded to maintain separate pattern databases
        # For now, we rely on the existing UserPlayStats updates
        # Future enhancement: maintain mood transition matrices per user
        logger.debug("Contextual pattern update skipped (not implemented): user=%s track=%s action=%s", user_id, track_id, action)


# singleton instance
contextual_queue = ContextualQueueManager()

# need to import engine from database
from database import engine