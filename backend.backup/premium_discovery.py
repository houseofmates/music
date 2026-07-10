"""
Premium Discovery Service
Handles trending tracks, collaborative filtering, and social features
"""

import math
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select, func, or_, and_
from models import Track, User, UserPlayStats, Playlist, PlaylistTrack, Favorite, ShareLink, ShareComment
import logging

logger = logging.getLogger(__name__)


class PremiumDiscoveryService:
    """Service for premium discovery features."""

    def __init__(self):
        self.collaborative_filtering_cache = {}
        self.trending_cache = {}
        self.cache_timeout = 3600  # 1 hour

    def get_trending_tracks(
        self,
        session: Session,
        limit: int = 50,
        time_window_days: int = 30,
        min_plays: int = 1,
        user_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get trending tracks based on play counts and recency.
        """

        cutoff_date = datetime.now(timezone.utc) - timedelta(days=time_window_days)

        stmt = (
            select(
                UserPlayStats.track_id,
                func.sum(UserPlayStats.play_count).label('total_plays'),
                func.max(UserPlayStats.last_played).label('last_played'),
                func.count(UserPlayStats.id).label('unique_users')
            )
            .where(UserPlayStats.last_played >= cutoff_date)
            .group_by(UserPlayStats.track_id)
            .having(func.sum(UserPlayStats.play_count) >= min_plays)
        )

        if user_id:
            stmt = stmt.where(UserPlayStats.user_id == user_id)

        play_stats = session.exec(stmt).all()

        # Calculate trending scores
        trending_scores = []
        for track_id, total_plays, last_played, unique_users in play_stats:
            if not last_played:
                continue

            days_since = (datetime.now(timezone.utc) - last_played).total_seconds() / (24 * 3600)
            recency_score = max(0, 1 - (days_since / time_window_days))
            popularity_score = min(1.0, total_plays / 100)
            diversity_score = min(1.0, unique_users / 10)

            trending_score = (recency_score * 0.5 + popularity_score * 0.3 + diversity_score * 0.2)

            trending_scores.append({
                'track_id': track_id,
                'trending_score': trending_score,
                'total_plays': total_plays,
                'unique_users': unique_users,
                'last_played': last_played
            })

        trending_scores.sort(key=lambda x: x['trending_score'], reverse=True)

        # Get track details
        top_track_ids = [item['track_id'] for item in trending_scores[:limit]]
        if not top_track_ids:
            return []

        tracks = session.exec(select(Track).where(Track.id.in_(top_track_ids))).all()
        track_lookup = {track.id: track for track in tracks}

        results = []
        for item in trending_scores[:limit]:
            track = track_lookup.get(item['track_id'])
            if track:
                results.append({
                    'id': track.id,
                    'title': track.title,
                    'artist': track.artist,
                    'album': track.album,
                    'duration': track.duration,
                    'cover_art_url': track.cover_art_url,
                    'trending_score': round(item['trending_score'], 3),
                    'total_plays': item['total_plays'],
                    'unique_users': item['unique_users'],
                    'reason': "Trending now"
                })

        return results

    def get_collaborative_recommendations(
        self,
        session: Session,
        user_id: int,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get collaborative filtering recommendations.
        """

        # Get user's favorites and highly-rated tracks
        user_favs = session.exec(
            select(Favorite.track_id).where(Favorite.user_id == user_id)
        ).all()
        user_fav_ids = {fav[0] for fav in user_favs}

        user_stats = session.exec(
            select(UserPlayStats).where(
                and_(
                    UserPlayStats.user_id == user_id,
                    UserPlayStats.love_score > 0.5
                )
            )
        ).all()

        user_liked_tracks = {stat.track_id for stat in user_stats} | user_fav_ids

        if not user_liked_tracks:
            return []

        # Find users who like similar tracks
        similar_users = session.exec(
            select(
                Favorite.user_id,
                func.count(Favorite.track_id).label('common_favs')
            )
            .where(
                and_(
                    Favorite.track_id.in_(user_liked_tracks),
                    Favorite.user_id != user_id
                )
            )
            .group_by(Favorite.user_id)
            .order_by(func.count(Favorite.track_id).desc())
            .limit(20)
        ).all()

        # Get recommendations from similar users
        recommendations = []
        seen_tracks = user_liked_tracks

        for similar_user_id, common_count in similar_users:
            # Get tracks this user likes that current user hasn't seen
            similar_favs = session.exec(
                select(Favorite.track_id).where(
                    and_(
                        Favorite.user_id == similar_user_id,
                        Favorite.track_id.not_in(seen_tracks)
                    )
                ).limit(10)
            ).all()

            for fav in similar_favs:
                recommendations.append({
                    'track_id': fav[0],
                    'score': common_count / 10.0,  # Normalize score
                    'reason': f"Liked by users with similar taste"
                })

        # Remove duplicates and sort
        track_scores = {}
        for rec in recommendations:
            track_id = rec['track_id']
            if track_id not in track_scores or rec['score'] > track_scores[track_id]['score']:
                track_scores[track_id] = rec

        sorted_recs = sorted(track_scores.values(), key=lambda x: x['score'], reverse=True)

        # Get track details
        top_track_ids = [rec['track_id'] for rec in sorted_recs[:limit]]
        if not top_track_ids:
            return []

        tracks = session.exec(select(Track).where(Track.id.in_(top_track_ids))).all()
        track_lookup = {track.id: track for track in tracks}

        results = []
        for rec in sorted_recs[:limit]:
            track = track_lookup.get(rec['track_id'])
            if track:
                results.append({
                    'id': track.id,
                    'title': track.title,
                    'artist': track.artist,
                    'album': track.album,
                    'duration': track.duration,
                    'cover_art_url': track.cover_art_url,
                    'recommendation_score': round(rec['score'], 3),
                    'reason': rec['reason']
                })

        return results

    def get_social_feed(
        self,
        session: Session,
        user_id: Optional[int] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get social feed with shared tracks and playlists.
        """

        stmt = (
            select(ShareLink, User.username)
            .join(User, ShareLink.user_id == User.id, isouter=True)
            .order_by(ShareLink.created_at.desc())
            .limit(limit)
        )

        shares = session.exec(stmt).all()

        feed_items = []
        for share, username in shares:
            if share.kind == 'track':
                resource = session.get(Track, share.resource_id)
                if resource:
                    item = {
                        'id': share.id,
                        'type': 'shared_track',
                        'user': username or 'Anonymous',
                        'title': share.title or f"{resource.title} by {resource.artist}",
                        'resource': {
                            'id': resource.id,
                            'title': resource.title,
                            'artist': resource.artist,
                            'album': resource.album,
                            'cover_art_url': resource.cover_art_url
                        },
                        'created_at': share.created_at,
                        'url': f"/share/{share.token}"
                    }
                    feed_items.append(item)

            elif share.kind == 'playlist':
                resource = session.get(Playlist, share.resource_id)
                if resource:
                    track_count = session.exec(
                        select(func.count(PlaylistTrack.id))
                        .where(PlaylistTrack.playlist_id == resource.id)
                    ).first()

                    item = {
                        'id': share.id,
                        'type': 'shared_playlist',
                        'user': username or 'Anonymous',
                        'title': share.title or resource.name,
                        'resource': {
                            'id': resource.id,
                            'name': resource.name,
                            'description': resource.description,
                            'cover_image': resource.cover_image,
                            'track_count': track_count or 0
                        },
                        'created_at': share.created_at,
                        'url': f"/share/{share.token}"
                    }
                    feed_items.append(item)

        return feed_items

    def create_collaborative_playlist(
        self,
        session: Session,
        user_id: int,
        name: str,
        max_tracks: int = 30
    ) -> Dict[str, Any]:
        """
        Create a collaborative playlist.
        """

        recommendations = self.get_collaborative_recommendations(session, user_id, limit=max_tracks)

        if not recommendations:
            return {"playlist_id": None, "message": "No recommendations available"}

        playlist = Playlist(
            name=name,
            description="Collaborative playlist based on users with similar taste",
            user_id=user_id
        )
        session.add(playlist)
        session.commit()
        session.refresh(playlist)

        for i, rec in enumerate(recommendations):
            playlist_track = PlaylistTrack(
                playlist_id=playlist.id,
                track_id=rec['id'],
                position=i
            )
            session.add(playlist_track)

        session.commit()

        return {
            "playlist_id": playlist.id,
            "track_count": len(recommendations),
            "message": f"Created collaborative playlist with {len(recommendations)} tracks"
        }

    def get_discovery_algorithms(
        self,
        session: Session,
        algorithm: str,
        limit: int = 20,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Get tracks using various discovery algorithms.
        """

        algorithms = {
            'similar_artists': self._discover_similar_artists,
            'era_based': self._discover_era_based,
            'mood_progression': self._discover_mood_progression,
            'genre_evolution': self._discover_genre_evolution,
            'underground_gems': self._discover_underground_gems
        }

        if algorithm not in algorithms:
            raise ValueError(f"Unknown algorithm: {algorithm}")

        return algorithms[algorithm](session, limit, **kwargs)

    def _discover_similar_artists(self, session: Session, limit: int, seed_artist: Optional[str] = None, **kwargs) -> List[Dict[str, Any]]:
        """Discover tracks from similar artists."""
        if not seed_artist:
            # Get a random popular artist
            popular_artists = session.exec(
                select(Track.artist, func.count(Track.id).label('count'))
                .where(Track.artist.isnot(None))
                .group_by(Track.artist)
                .order_by(func.count(Track.id).desc())
                .limit(1)
            ).first()

            if popular_artists:
                seed_artist = popular_artists[0]

        if not seed_artist:
            return []

        # Simplified similar artists discovery
        tracks = session.exec(
            select(Track).where(
                and_(
                    Track.artist != seed_artist,
                    Track.artist.isnot(None)
                )
            ).order_by(func.random()).limit(limit)
        ).all()

        results = []
        for track in tracks:
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'reason': f"Similar to {seed_artist}"
            })

        return results

    def _discover_era_based(self, session: Session, limit: int, era: Optional[str] = None, **kwargs) -> List[Dict[str, Any]]:
        """Discover tracks from a specific era."""
        era_ranges = {
            '80s': (1980, 1989),
            '90s': (1990, 1999),
            '2000s': (2000, 2009),
            '2010s': (2010, 2019),
            '2020s': (2020, 2029)
        }

        if era in era_ranges:
            start_year, end_year = era_ranges[era]
        else:
            start_year, end_year = 2000, 2029  # Default to recent

        tracks = session.exec(
            select(Track).where(
                and_(
                    Track.year.between(start_year, end_year),
                    Track.year.isnot(None)
                )
            ).order_by(func.random()).limit(limit)
        ).all()

        results = []
        for track in tracks:
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'reason': f"From the {era or 'recent era'}"
            })

        return results

    def _discover_mood_progression(self, session: Session, limit: int, **kwargs) -> List[Dict[str, Any]]:
        """Discover tracks for mood progression."""
        # Simplified - just return some tracks
        tracks = session.exec(
            select(Track).order_by(func.random()).limit(limit)
        ).all()

        results = []
        for track in tracks:
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'reason': "Part of mood progression"
            })

        return results

    def _discover_genre_evolution(self, session: Session, limit: int, genre: str = "rock", **kwargs) -> List[Dict[str, Any]]:
        """Discover how a genre evolved."""
        tracks = session.exec(
            select(Track).where(
                Track.genre.ilike(f"%{genre}%")
            ).order_by(Track.year).limit(limit)
        ).all()

        results = []
        for track in tracks:
            era = f"{(track.year // 10) * 10}s" if track.year else "unknown era"
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'reason': f"{genre.capitalize()} from the {era}"
            })

        return results

    def _discover_underground_gems(self, session: Session, limit: int, **kwargs) -> List[Dict[str, Any]]:
        """Discover lesser-known tracks."""
        tracks = session.exec(
            select(Track).order_by(func.random()).limit(limit)
        ).all()

        results = []
        for track in tracks:
            results.append({
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'album': track.album,
                'duration': track.duration,
                'cover_art_url': track.cover_art_url,
                'reason': "Underground gem"
            })

        return results


# Global instance
premium_discovery = PremiumDiscoveryService()
