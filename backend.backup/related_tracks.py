"""Related Tracks Service
Builds track recommendations based on audio features and user preferences
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from sqlmodel import Session, select
from models import Track, AudioFeatures, UserPlayStats
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


class RelatedTracksService:
    """Service for finding related tracks based on audio features."""
    
    def __init__(self):
        self.feature_weights = {
            'tempo': 0.2,
            'energy': 0.25,
            'valence': 0.2,
            'danceability': 0.15,
            'acousticness': 0.1,
            'instrumentalness': 0.1
        }
        self.scaler = StandardScaler()
        self._feature_cache = {}
    
    def _extract_features(self, track_id: int, session: Session) -> Optional[np.ndarray]:
        """Extract and normalize audio features for a track."""
        if track_id in self._feature_cache:
            return self._feature_cache[track_id]
        
        audio_features = session.exec(
            select(AudioFeatures).where(AudioFeatures.track_id == track_id)
        ).first()
        
        if not audio_features:
            return None
        
        # Create feature vector
        features = np.array([
            audio_features.tempo or 0,
            audio_features.energy or 0,
            audio_features.valence or 0,
            audio_features.danceability or 0,
            audio_features.acousticness or 0,
            audio_features.instrumentalness or 0,
            audio_features.loudness or 0,
            audio_features.speechiness or 0,
            audio_features.key or 0,
            audio_features.mode or 0
        ])
        
        # Apply weights
        weighted_features = features * np.array([
            self.feature_weights['tempo'],
            self.feature_weights['energy'],
            self.feature_weights['valence'],
            self.feature_weights['danceability'],
            self.feature_weights['acousticness'],
            self.feature_weights['instrumentalness'],
            0.05,  # loudness weight
            0.05,  # speechiness weight
            0.02,  # key weight
            0.01   # mode weight
        ])
        
        self._feature_cache[track_id] = weighted_features
        return weighted_features
    
    def _calculate_similarity(self, features1: np.ndarray, features2: np.ndarray) -> float:
        """Calculate weighted similarity between two feature vectors."""
        if features1 is None or features2 is None:
            return 0.0
        
        # Reshape for cosine similarity
        features1 = features1.reshape(1, -1)
        features2 = features2.reshape(1, -1)
        
        similarity = cosine_similarity(features1, features2)[0][0]
        return max(0, similarity)  # Ensure non-negative
    
    def get_related_tracks(
        self,
        track_id: int,
        session: Session,
        limit: int = 20,
        user_id: Optional[int] = None,
        similarity_threshold: float = 0.3
    ) -> List[Dict]:
        """Get tracks similar to the given track based on audio features."""
        
        # Get source track features
        source_features = self._extract_features(track_id, session)
        if source_features is None:
            logger.warning(f"No audio features found for track {track_id}")
            return []
        
        # Get all tracks with audio features
        all_tracks = session.exec(
            select(Track, AudioFeatures)
            .join(AudioFeatures, Track.id == AudioFeatures.track_id)
            .where(Track.id != track_id)
        ).all()
        
        similarities = []
        
        for track, audio_features in all_tracks:
            # Extract features for comparison
            target_features = self._extract_features(track.id, session)
            if target_features is None:
                continue
            
            # Calculate similarity
            similarity = self._calculate_similarity(source_features, target_features)
            
            if similarity < similarity_threshold:
                continue
            
            # Get user stats if user_id provided
            user_score = 0.0
            if user_id:
                user_stat = session.exec(
                    select(UserPlayStats).where(
                        UserPlayStats.user_id == user_id,
                        UserPlayStats.track_id == track.id
                    )
                ).first()
                
                if user_stat:
                    # Boost based on user preferences
                    if user_stat.love_score > 0:
                        user_score += user_stat.love_score * 0.3
                    
                    # Penalty for frequently skipped tracks
                    if user_stat.skip_count > user_stat.play_count * 0.5:
                        user_score -= 0.2
            
            # Genre bonus
            source_track = session.get(Track, track_id)
            genre_bonus = 0.0
            if source_track and track.genre and source_track.genre:
                if track.genre.lower() == source_track.genre.lower():
                    genre_bonus = 0.1
                elif self._are_genres_similar(track.genre, source_track.genre):
                    genre_bonus = 0.05
            
            # Calculate final score
            final_score = similarity + user_score + genre_bonus
            
            similarities.append({
                'track': track,
                'similarity': similarity,
                'user_score': user_score,
                'genre_bonus': genre_bonus,
                'final_score': final_score
            })
        
        # Sort by final score and limit results
        similarities.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Format results
        results = []
        for item in similarities[:limit]:
            track = item['track']
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'similarity_score': round(item['similarity'], 3),
                'match_reason': self._get_match_reason(item['similarity'], item['genre_bonus']),
                'audio_features': {
                    'tempo': track.audio_features.tempo if track.audio_features else None,
                    'energy': track.audio_features.energy if track.audio_features else None,
                    'valence': track.audio_features.valence if track.audio_features else None,
                    'mood': track.audio_features.mood if track.audio_features else None
                } if hasattr(track, 'audio_features') and track.audio_features else None
            })
        
        return results
    
    def get_mood_based_recommendations(
        self,
        mood: str,
        session: Session,
        limit: int = 20,
        energy_level: Optional[float] = None
    ) -> List[Dict]:
        """Get recommendations based on mood and energy level."""
        
        # Define mood characteristics
        mood_characteristics = {
            'happy': {'valence_range': (0.7, 1.0), 'energy_range': (0.6, 1.0)},
            'sad': {'valence_range': (0.0, 0.3), 'energy_range': (0.0, 0.4)},
            'energetic': {'valence_range': (0.5, 1.0), 'energy_range': (0.7, 1.0)},
            'relaxed': {'valence_range': (0.3, 0.7), 'energy_range': (0.0, 0.4)},
            'focused': {'valence_range': (0.4, 0.8), 'energy_range': (0.3, 0.6)},
            'melancholic': {'valence_range': (0.2, 0.5), 'energy_range': (0.2, 0.5)}
        }
        
        if mood not in mood_characteristics:
            return []
        
        characteristics = mood_characteristics[mood]
        
        # Query tracks matching mood characteristics
        tracks = session.exec(
            select(Track, AudioFeatures)
            .join(AudioFeatures, Track.id == AudioFeatures.track_id)
            .where(
                AudioFeatures.valence.between(*characteristics['valence_range']),
                AudioFeatures.energy.between(*characteristics['energy_range'])
            )
        ).all()
        
        # Apply energy level filter if specified
        if energy_level is not None:
            tracks = [
                (track, af) for track, af in tracks 
                if af and abs(af.energy - energy_level) < 0.2
            ]
        
        # Sort by valence and energy
        tracks.sort(key=lambda x: (x[1].valence + x[1].energy) / 2, reverse=True)
        
        # Format results
        results = []
        for track, audio_features in tracks[:limit]:
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'mood_match': round((audio_features.valence + audio_features.energy) / 2, 3),
                'audio_features': {
                    'tempo': audio_features.tempo,
                    'energy': audio_features.energy,
                    'valence': audio_features.valence,
                    'mood': audio_features.mood
                }
            })
        
        return results
    
    def get_energy_progression(
        self,
        start_energy: float,
        end_energy: float,
        session: Session,
        limit: int = 20
    ) -> List[Dict]:
        """Get tracks for energy progression (e.g., workout playlist)."""
        
        # Get tracks with energy levels in range
        tracks = session.exec(
            select(Track, AudioFeatures)
            .join(AudioFeatures, Track.id == AudioFeatures.track_id)
            .where(
                AudioFeatures.energy.between(
                    min(start_energy, end_energy),
                    max(start_energy, end_energy)
                )
            )
        ).all()
        
        # Sort by energy for smooth progression
        if start_energy < end_energy:
            # Increasing energy
            tracks.sort(key=lambda x: x[1].energy)
        else:
            # Decreasing energy
            tracks.sort(key=lambda x: x[1].energy, reverse=True)
        
        # Format results
        results = []
        for track, audio_features in tracks[:limit]:
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'energy_level': round(audio_features.energy, 3),
                'progression_position': round(
                    (audio_features.energy - start_energy) / (end_energy - start_energy), 3
                ) if end_energy != start_energy else 0.5,
                'audio_features': {
                    'tempo': audio_features.tempo,
                    'energy': audio_features.energy,
                    'valence': audio_features.valence,
                    'mood': audio_features.mood
                }
            })
        
        return results
    
    def _are_genres_similar(self, genre1: str, genre2: str) -> bool:
        """Check if two genres are similar."""
        genre_map = {
            'rock': ['alternative', 'indie', 'punk', 'metal'],
            'electronic': ['techno', 'house', 'ambient', 'edm'],
            'pop': ['indie pop', 'synthpop', 'electropop'],
            'jazz': ['smooth jazz', 'fusion', 'bebop'],
            'classical': ['orchestral', 'contemporary classical'],
            'hip-hop': ['rap', 'trap', 'drill'],
            'r&b': ['soul', 'funk', 'motown']
        }
        
        genre1_lower = genre1.lower()
        genre2_lower = genre2.lower()
        
        for base, related in genre_map.items():
            if base in genre1_lower and any(r in genre2_lower for r in related):
                return True
            if base in genre2_lower and any(r in genre1_lower for r in related):
                return True
        
        return False
    
    def _get_match_reason(self, similarity: float, genre_bonus: float) -> str:
        """Get human-readable reason for track match."""
        if similarity > 0.8:
            return "very similar audio characteristics"
        elif similarity > 0.6:
            return "similar energy and mood"
        elif similarity > 0.4:
            return "compatible tempo and feel"
        elif genre_bonus > 0:
            return "same genre"
        else:
            return "related musical style"


# Singleton instance
related_tracks = RelatedTracksService()
