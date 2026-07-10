"""
Radio Service for Music App
Generates artist radio and genre radio playlists
"""

import random
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select, func
from models import Track, PlayHistory
from datetime import datetime, timezone, timedelta

class RadioService:
    """Service for generating radio-style playlists"""
    
    def __init__(self):
        self.similarity_weights = {
            'artist': 0.4,
            'genre': 0.3,
            'year': 0.2,
            'audio_features': 0.1
        }
    
    def generate_artist_radio(self, session: Session, artist_name: str, limit: int = 50) -> List[Track]:
        """Generate artist radio based on similar artists and genres"""
        
        # Find tracks by the specified artist
        artist_tracks = session.exec(
            select(Track).where(
                func.lower(Track.artist).ilike(f"%{artist_name.lower()}%")
            )
        ).all()
        
        if not artist_tracks:
            return []
        
        # Get primary genres and years from this artist's tracks
        artist_genres = set()
        artist_years = set()
        
        for track in artist_tracks:
            if track.genre:
                artist_genres.add(track.genre.lower())
            if track.year:
                artist_years.add(track.year)
        
        # Find similar artists (collaborators, same genre, same era)
        similar_artists = self._find_similar_artists(session, artist_name, artist_genres, artist_years)
        
        # Build radio playlist
        radio_tracks = []
        
        # Add some tracks from the original artist (30%)
        original_artist_tracks = random.sample(artist_tracks, min(len(artist_tracks), int(limit * 0.3)))
        radio_tracks.extend(original_artist_tracks)
        
        # Add tracks from similar artists (70%)
        remaining_slots = limit - len(radio_tracks)
        if similar_artists and remaining_slots > 0:
            similar_tracks = session.exec(
                select(Track).where(
                    func.lower(Track.artist).in_([sa.lower() for sa in similar_artists])
                ).limit(remaining_slots * 2)  # Get more than needed for variety
            ).all()
            
            # Prioritize tracks with matching genres and years
            prioritized_tracks = []
            other_tracks = []
            
            for track in similar_tracks:
                score = 0
                
                # Genre match
                if track.genre and any(genre in track.genre.lower() for genre in artist_genres):
                    score += 2
                
                # Year match (within 5 years)
                if track.year and artist_years:
                    min_year_diff = min(abs(track.year - ay) for ay in artist_years)
                    if min_year_diff <= 5:
                        score += 1
                
                if score >= 1:
                    prioritized_tracks.append((track, score))
                else:
                    other_tracks.append(track)
            
            # Sort by score and take top tracks
            prioritized_tracks.sort(key=lambda x: x[1], reverse=True)
            selected_tracks = [t[0] for t in prioritized_tracks[:remaining_slots]]
            
            # Fill remaining slots with other tracks if needed
            if len(selected_tracks) < remaining_slots:
                needed = remaining_slots - len(selected_tracks)
                selected_tracks.extend(random.sample(other_tracks, min(len(other_tracks), needed)))
            
            radio_tracks.extend(selected_tracks)
        
        # Shuffle the final playlist
        random.shuffle(radio_tracks)
        
        return radio_tracks[:limit]
    
    def generate_genre_radio(self, session: Session, genre_name: str, limit: int = 50) -> List[Track]:
        """Generate genre radio based on genre and related genres"""
        
        # Find tracks in the specified genre
        genre_tracks = session.exec(
            select(Track).where(
                func.lower(Track.genre).ilike(f"%{genre_name.lower()}%")
            )
        ).all()
        
        if not genre_tracks:
            return []
        
        # Get related genres
        related_genres = self._get_related_genres(genre_name.lower())
        
        # Find tracks in related genres
        related_tracks = []
        if related_genres:
            related_tracks = session.exec(
                select(Track).where(
                    func.lower(Track.genre).in_(related_genres)
                ).limit(limit)
            ).all()
        
        # Combine and prioritize tracks
        all_tracks = genre_tracks + related_tracks
        
        # Score tracks based on various factors
        scored_tracks = []
        for track in all_tracks:
            score = self._calculate_genre_radio_score(track, genre_name.lower(), related_genres)
            scored_tracks.append((track, score))
        
        # Sort by score and take top tracks
        scored_tracks.sort(key=lambda x: x[1], reverse=True)
        selected_tracks = [t[0] for t in scored_tracks[:limit * 2]]  # Get more for variety
        
        # Ensure variety by avoiding too many tracks from same artist
        final_tracks = []
        artist_counts = {}
        
        for track in selected_tracks:
            artist = track.artist or "Unknown"
            if artist_counts.get(artist, 0) < 3:  # Max 3 tracks per artist
                final_tracks.append(track)
                artist_counts[artist] = artist_counts.get(artist, 0) + 1
            
            if len(final_tracks) >= limit:
                break
        
        # Shuffle to maintain radio feel
        random.shuffle(final_tracks)
        
        return final_tracks[:limit]
    
    def generate_mood_radio(self, session: Session, mood: str, limit: int = 50) -> List[Track]:
        """Generate mood-based radio playlist"""
        
        mood_keywords = {
            'happy': ['pop', 'dance', 'upbeat', 'electronic', 'rock'],
            'sad': ['blues', 'acoustic', 'folk', 'ballad', 'slow'],
            'energetic': ['rock', 'electronic', 'hip-hop', 'dance', 'metal'],
            'relaxing': ['ambient', 'jazz', 'classical', 'chill', 'lofi'],
            'romantic': ['r&b', 'soul', 'love', 'ballad', 'smooth'],
            'angry': ['metal', 'rock', 'punk', 'hardcore', 'industrial'],
            'focus': ['classical', 'ambient', 'electronic', 'instrumental', 'lofi']
        }
        
        keywords = mood_keywords.get(mood.lower(), [])
        
        if not keywords:
            return []
        
        # Find tracks matching mood keywords
        mood_tracks = []
        for keyword in keywords:
            tracks = session.exec(
                select(Track).where(
                    or_(
                        func.lower(Track.genre).ilike(f"%{keyword}%"),
                        func.lower(Track.title).ilike(f"%{keyword}%")
                    )
                )
            ).all()
            mood_tracks.extend(tracks)
        
        # Remove duplicates and score
        unique_tracks = list(set(mood_tracks))
        scored_tracks = []
        
        for track in unique_tracks:
            score = self._calculate_mood_score(track, mood.lower(), keywords)
            scored_tracks.append((track, score))
        
        # Sort and select top tracks
        scored_tracks.sort(key=lambda x: x[1], reverse=True)
        selected_tracks = [t[0] for t in scored_tracks[:limit]]
        
        # Add some variety with related tracks
        if len(selected_tracks) < limit:
            remaining = limit - len(selected_tracks)
            
            # Get artists from selected tracks and find their other songs
            selected_artists = set(track.artist for track in selected_tracks if track.artist)
            
            if selected_artists:
                additional_tracks = session.exec(
                    select(Track).where(
                        func.lower(Track.artist).in_([sa.lower() for sa in selected_artists])
                    ).limit(remaining * 2)
                ).all()
                
                # Filter out already selected tracks
                additional_tracks = [t for t in additional_tracks if t not in selected_tracks]
                
                # Add variety
                selected_tracks.extend(random.sample(additional_tracks, min(len(additional_tracks), remaining)))
        
        return selected_tracks[:limit]
    
    def _find_similar_artists(self, session: Session, artist_name: str, genres: set, years: set) -> List[str]:
        """Find artists similar to the given artist"""
        
        similar_artists = set()
        
        # Find artists in same genres
        if genres:
            genre_artists = session.exec(
                select(Track.artist).where(
                    and_(
                        func.lower(Track.genre).in_(genres),
                        func.lower(Track.artist) != artist_name.lower(),
                        Track.artist.is_not(None)
                    )
                ).distinct()
            ).all()
            
            similar_artists.update(artist for artist in genre_artists if artist)
        
        # Find artists from same era
        if years:
            min_year = min(years) - 5
            max_year = max(years) + 5
            
            era_artists = session.exec(
                select(Track.artist).where(
                    and_(
                        Track.year.between(min_year, max_year),
                        func.lower(Track.artist) != artist_name.lower(),
                        Track.artist.is_not(None)
                    )
                ).distinct()
            ).all()
            
            similar_artists.update(artist for artist in era_artists if artist)
        
        # Find collaborators (artists featured on same tracks)
        featured_artists = session.exec(
            select(Track.featured_artists).where(
                and_(
                    func.lower(Track.artist).ilike(f"%{artist_name.lower()}%"),
                    Track.featured_artists.is_not(None)
                )
            )
        ).all()
        
        for featured in featured_artists:
            if featured:
                similar_artists.update(self._parse_artists(featured))
        
        return list(similar_artists)[:20]  # Limit to top 20 similar artists
    
    def _get_related_genres(self, genre: str) -> List[str]:
        """Get genres related to the specified genre"""
        
        genre_relations = {
            'rock': ['alternative', 'indie', 'punk', 'metal', 'hard rock', 'classic rock'],
            'pop': ['electropop', 'dance-pop', 'synth-pop', 'indie pop', 'art pop'],
            'electronic': ['edm', 'techno', 'house', 'trance', 'dubstep', 'ambient'],
            'hip-hop': ['rap', 'trap', 'drill', 'grime', 'old school', 'conscious'],
            'jazz': ['smooth jazz', 'bebop', 'fusion', 'swing', 'cool jazz'],
            'classical': ['orchestral', 'symphony', 'concerto', 'chamber', 'opera'],
            'country': ['folk', 'bluegrass', 'americana', 'country rock', 'outlaw'],
            'r&b': ['soul', 'funk', 'motown', 'contemporary r&b', 'neo soul'],
            'blues': ['delta blues', 'chicago blues', 'electric blues', 'blues rock']
        }
        
        for main_genre, related in genre_relations.items():
            if main_genre in genre or any(rg in genre for rg in related):
                return related
        
        return []
    
    def _calculate_genre_radio_score(self, track: Track, target_genre: str, related_genres: List[str]) -> float:
        """Calculate score for genre radio"""
        
        score = 0.0
        
        # Primary genre match
        if track.genre and target_genre in track.genre.lower():
            score += 3.0
        
        # Related genre match
        if track.genre:
            for related in related_genres:
                if related in track.genre.lower():
                    score += 1.5
                    break
        
        # Title relevance (bonus for genre-related words)
        if track.title:
            genre_words = target_genre.split()
            for word in genre_words:
                if word in track.title.lower():
                    score += 0.5
        
        # Avoid over-representation of any single artist
        # (This will be handled in the selection logic)
        
        return score
    
    def _calculate_mood_score(self, track: Track, mood: str, keywords: List[str]) -> float:
        """Calculate score for mood-based radio"""
        
        score = 0.0
        
        # Genre matching
        if track.genre:
            for keyword in keywords:
                if keyword in track.genre.lower():
                    score += 2.0
                    break
        
        # Title matching
        if track.title:
            for keyword in keywords:
                if keyword in track.title.lower():
                    score += 1.0
                    break
        
        # Artist reputation (some artists are known for certain moods)
        if track.artist:
            artist_mood_mapping = {
                'happy': ['pharrell williams', 'katy perry', 'bruno mars'],
                'sad': ['adele', 'radiohead', 'the national'],
                'energetic': ['daft punk', 'the prodigy', 'rage against the machine'],
                'relaxing': ['bonobo', 'tycho', 'brian eno'],
                'romantic': ['marvin gaye', 'al green', 'dAngelo']
            }
            
            mood_artists = artist_mood_mapping.get(mood, [])
            for artist in mood_artists:
                if artist in track.artist.lower():
                    score += 1.5
                    break
        
        return score
    
    def _parse_artists(self, artist_string: str) -> List[str]:
        """Parse artist string to extract individual artists"""
        
        if not artist_string:
            return []
        
        # Split by common separators
        separators = [' ft. ', ' feat. ', ' featuring ', ' & ', ' x ', ' with ', ' + ']
        
        artists = [artist_string]
        for sep in separators:
            new_artists = []
            for artist in artists:
                new_artists.extend(artist.split(sep))
            artists = new_artists
        
        return [artist.strip() for artist in artists if artist.strip()]

# Global instance
radio_service = RadioService()