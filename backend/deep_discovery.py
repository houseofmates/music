"""deep discovery service for enhanced metadata and artist information.

this module provides comprehensive metadata enrichment including:
- high-resolution artist bios and images
- album artwork from multiple sources
- lyrics fetching and synchronization
- audio analysis for mood and genre detection
- related artist and album discovery
"""

import os
import asyncio
import logging
import aiohttp
import json
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
from pathlib import Path

from sqlmodel import Session, select
import requests
from bs4 import BeautifulSoup

from models import Track, AudioFeatures, ArtistMetadata, AlbumMetadata
from config import settings

logger = logging.getLogger(__name__)


class DeepDiscoveryService:
    """comprehensive metadata discovery and enrichment service."""
    
    def __init__(self):
        self.session = None
        self.cache_ttl = 7 * 24 * 60 * 60  # 7 days
        self.user_agent = 'Music/1.0.0 (Deep Discovery Bot)'
        
        # API endpoints
        self.musicbrainz_base = 'https://musicbrainz.org/ws/2'
        self.coverart_base = 'https://coverartarchive.org'
        self.wikipedia_base = 'https://en.wikipedia.org/api/rest_v1'
        self.lastfm_base = 'https://ws.audioscrobbler.com/2.0'
        
    async def get_session(self):
        """get aiohttp session for async requests."""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers={'User-Agent': self.user_agent}
            )
        return self.session
    
    async def enrich_track_metadata(self, track_id: int) -> Dict:
        """comprehensive metadata enrichment for a track."""
        with Session(engine) as session:
            track = session.exec(select(Track).where(Track.id == track_id)).first()
            if not track:
                return {}

            enrichment = {}

            # Artist information
            if track.artist:
                artist_info = await self.get_artist_information(track.artist)
                enrichment.update(artist_info)

            # Album information
            if track.album:
                album_info = await self.get_album_information(track.artist, track.album)
                enrichment.update(album_info)

            # Enhanced lyrics
            lyrics_info = await self.get_enhanced_lyrics(track.artist, track.title)
            if lyrics_info and lyrics_info.get('lyrics'):
                # Save lyrics to track if not custom and we found some
                lyrics_data = lyrics_info['lyrics']
                if not track.is_custom_lyrics:
                    if lyrics_data.get('synced_text') and not track.synced_lyrics:
                        track.synced_lyrics = lyrics_data['synced_text']
                    elif lyrics_data.get('text') and not track.lyrics:
                        track.lyrics = lyrics_data['text']
                    session.commit()

            enrichment.update(lyrics_info)

            # Audio analysis
            audio_analysis = await self.analyze_audio_features(track.file_path)
            enrichment.update(audio_analysis)

            # Related content
            related_info = await self.get_related_content(track.artist, track.album)
            enrichment.update(related_info)

            return enrichment
    
    async def get_artist_information(self, artist_name: str) -> Dict:
        """get comprehensive artist information."""
        try:
            # Check if we have cached data
            with Session(engine) as session:
                cached = session.exec(
                    select(ArtistMetadata).where(ArtistMetadata.artist_name == artist_name)
                ).first()

                # Return cached data if it's recent (< 7 days)
                if cached and (datetime.now(timezone.utc) - cached.updated_at).days < 7:
                    return {
                        'artist': {
                            'mbid': cached.mbid,
                            'name': cached.artist_name,
                            'country': cached.country,
                            'area': cached.area,
                            'begin_date': cached.begin_date,
                            'end_date': cached.end_date,
                            'type': cached.artist_type,
                            'disambiguation': cached.disambiguation,
                            'tags': json.loads(cached.mb_tags) if cached.mb_tags else [],
                            'image_url': cached.image_url,
                            'biography': cached.biography,
                            'bio_source': cached.bio_source,
                            'lastfm_tags': json.loads(cached.tags) if cached.tags else [],
                            'genres': json.loads(cached.genres) if cached.genres else []
                        }
                    }

            # Search MusicBrainz for artist
            mbid = await self.find_artist_mbid(artist_name)
            if not mbid:
                return {}

            artist_info = {'artist': {}}

            # Get basic artist info from MusicBrainz
            basic_info = await self.get_musicbrainz_artist(mbid)
            artist_info['artist'].update(basic_info)

            # Get high-res artist image
            image_url = await self.get_artist_image(mbid)
            if image_url:
                artist_info['artist']['image_url'] = image_url

            # Get artist biography from Wikipedia
            bio = await self.get_artist_biography(mbid)
            if bio:
                artist_info['artist']['biography'] = bio
                artist_info['artist']['bio_source'] = 'wikipedia'

            # Get artist tags and genres from Last.fm
            tags = await self.get_artist_tags(artist_name)
            if tags:
                artist_info['artist']['lastfm_tags'] = tags

            # Save to database
            await self.save_artist_metadata(artist_name, artist_info['artist'])

            return artist_info

        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting artist info for %s: %s", artist_name, e)
            return {}
    
    async def find_artist_mbid(self, artist_name: str) -> Optional[str]:
        """find MusicBrainz ID for artist."""
        try:
            session = await self.get_session()
            url = f"{self.musicbrainz_base}/artist/"
            params = {
                'query': f'artist:"{artist_name}"',
                'fmt': 'json',
                'limit': 1
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    artists = data.get('artists', [])
                    if artists:
                        return artists[0].get('id')
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error finding artist MBID: %s", e)
        
        return None
    
    async def get_musicbrainz_artist(self, mbid: str) -> Dict:
        """get detailed artist information from MusicBrainz."""
        try:
            session = await self.get_session()
            url = f"{self.musicbrainz_base}/artist/{mbid}"
            params = {
                'fmt': 'json',
                'inc': 'url-rels+tag-rels+release-groups'
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return {
                        'mbid': mbid,
                        'name': data.get('name'),
                        'country': data.get('country'),
                        'area': data.get('area', {}).get('name'),
                        'begin_date': data.get('life-span', {}).get('begin'),
                        'end_date': data.get('life-span', {}).get('end'),
                        'type': data.get('type'),
                        'disambiguation': data.get('disambiguation'),
                        'tags': [tag.get('name') for tag in data.get('tags', [])]
                    }
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting MusicBrainz artist: %s", e)
        
        return {}
    
    async def get_artist_image(self, mbid: str) -> Optional[str]:
        """get high-resolution artist image from CoverArtArchive."""
        try:
            session = await self.get_session()
            url = f"{self.coverart_base}/artist/{mbid}/front"
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    images = data.get('images', [])
                    if images:
                        # Get highest resolution image
                        best_image = max(images, key=lambda x: x.get('sizes', {}).get('huge', 0))
                        return best_image.get('image')
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting artist image: %s", e)
        
        return None
    
    async def get_artist_biography(self, mbid: str) -> Optional[str]:
        """get artist biography from Wikipedia."""
        try:
            # First get Wikipedia link from MusicBrainz
            session = await self.get_session()
            url = f"{self.musicbrainz_base}/artist/{mbid}"
            params = {'fmt': 'json', 'inc': 'url-rels'}
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    relations = data.get('relations', [])
                    
                    wiki_url = None
                    for rel in relations:
                        if rel.get('type') == 'wikipedia':
                            wiki_url = rel.get('url', {}).get('resource')
                            break
                    
                    if wiki_url:
                        # Extract Wikipedia page title
                        title = wiki_url.split('/')[-1].replace('_', ' ')
                        return await self.get_wikipedia_summary(title)
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting artist biography: %s", e)
        
        return None
    
    async def get_wikipedia_summary(self, title: str) -> Optional[str]:
        """get Wikipedia summary for given title."""
        try:
            session = await self.get_session()
            url = f"{self.wikipedia_base}/page/summary/{title}"
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('extract')
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting Wikipedia summary: %s", e)
        
        return None
    
    async def get_artist_tags(self, artist_name: str) -> List[str]:
        """get artist tags from Last.fm."""
        try:
            # Note: This would require Last.fm API key
            # For now, return empty list
            return []
        except Exception:
            return []

    async def save_artist_metadata(self, artist_name: str, artist_data: Dict):
        """save artist metadata to database."""
        try:
            with Session(engine) as session:
                # Check if artist already exists
                existing = session.exec(
                    select(ArtistMetadata).where(ArtistMetadata.artist_name == artist_name)
                ).first()

                if existing:
                    # Update existing record
                    existing.mbid = artist_data.get('mbid')
                    existing.country = artist_data.get('country')
                    existing.area = artist_data.get('area')
                    existing.begin_date = artist_data.get('begin_date')
                    existing.end_date = artist_data.get('end_date')
                    existing.artist_type = artist_data.get('type')
                    existing.disambiguation = artist_data.get('disambiguation')
                    existing.mb_tags = json.dumps(artist_data.get('tags', []))
                    existing.image_url = artist_data.get('image_url')
                    existing.biography = artist_data.get('biography')
                    existing.bio_source = artist_data.get('bio_source')
                    existing.tags = json.dumps(artist_data.get('lastfm_tags', []))
                    existing.genres = json.dumps(artist_data.get('genres', []))
                    existing.updated_at = datetime.now(timezone.utc)
                else:
                    # Create new record
                    metadata = ArtistMetadata(
                        artist_name=artist_name,
                        mbid=artist_data.get('mbid'),
                        country=artist_data.get('country'),
                        area=artist_data.get('area'),
                        begin_date=artist_data.get('begin_date'),
                        end_date=artist_data.get('end_date'),
                        artist_type=artist_data.get('type'),
                        disambiguation=artist_data.get('disambiguation'),
                        mb_tags=json.dumps(artist_data.get('tags', [])),
                        image_url=artist_data.get('image_url'),
                        biography=artist_data.get('biography'),
                        bio_source=artist_data.get('bio_source'),
                        tags=json.dumps(artist_data.get('lastfm_tags', [])),
                        genres=json.dumps(artist_data.get('genres', []))
                    )
                    session.add(metadata)

                session.commit()

        except (OSError, RuntimeError) as e:
            logger.error("Error saving artist metadata: %s", e)

    async def save_album_metadata(self, artist_name: str, album_name: str, album_data: Dict):
        """save album metadata to database."""
        try:
            with Session(engine) as session:
                # Check if album already exists
                existing = session.exec(
                    select(AlbumMetadata).where(
                        AlbumMetadata.artist_name == artist_name,
                        AlbumMetadata.album_name == album_name
                    )
                ).first()

                if existing:
                    # Update existing record
                    existing.mbid = album_data.get('mbid')
                    existing.title = album_data.get('title')
                    existing.release_type = album_data.get('type')
                    existing.first_release_date = album_data.get('first_release_date')
                    existing.primary_type = album_data.get('primary_type')
                    existing.secondary_types = json.dumps(album_data.get('secondary_types', []))
                    existing.mb_tags = json.dumps(album_data.get('tags', []))
                    existing.cover_art_urls = json.dumps(album_data.get('cover_art_urls', []))
                    existing.updated_at = datetime.now(timezone.utc)
                else:
                    # Create new record
                    metadata = AlbumMetadata(
                        artist_name=artist_name,
                        album_name=album_name,
                        mbid=album_data.get('mbid'),
                        title=album_data.get('title'),
                        release_type=album_data.get('type'),
                        first_release_date=album_data.get('first_release_date'),
                        primary_type=album_data.get('primary_type'),
                        secondary_types=json.dumps(album_data.get('secondary_types', [])),
                        mb_tags=json.dumps(album_data.get('tags', [])),
                        cover_art_urls=json.dumps(album_data.get('cover_art_urls', []))
                    )
                    session.add(metadata)

                session.commit()

        except (OSError, RuntimeError) as e:
            logger.error("Error saving album metadata: %s", e)
    
    async def get_album_information(self, artist_name: str, album_name: str) -> Dict:
        """get comprehensive album information."""
        try:
            # Check if we have cached data
            with Session(engine) as session:
                cached = session.exec(
                    select(AlbumMetadata).where(
                        AlbumMetadata.artist_name == artist_name,
                        AlbumMetadata.album_name == album_name
                    )
                ).first()

                # Return cached data if it's recent (< 7 days)
                if cached and (datetime.now(timezone.utc) - cached.updated_at).days < 7:
                    return {
                        'album': {
                            'mbid': cached.mbid,
                            'title': cached.title,
                            'type': cached.release_type,
                            'first_release_date': cached.first_release_date,
                            'primary_type': cached.primary_type,
                            'secondary_types': json.loads(cached.secondary_types) if cached.secondary_types else [],
                            'tags': json.loads(cached.mb_tags) if cached.mb_tags else [],
                            'cover_art_urls': json.loads(cached.cover_art_urls) if cached.cover_art_urls else []
                        }
                    }

            album_info = {'album': {}}

            # Get release group MBID
            rg_mbid = await self.find_release_group_mbid(artist_name, album_name)
            if rg_mbid:
                # Get album cover art
                cover_art = await self.get_album_cover_art(rg_mbid)
                if cover_art:
                    album_info['album']['cover_art_urls'] = cover_art

                # Get album information
                album_details = await self.get_release_group_details(rg_mbid)
                album_info['album'].update(album_details)

                # Save to database
                await self.save_album_metadata(artist_name, album_name, album_info['album'])

            return album_info

        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting album info: %s", e)
            return {}
    
    async def find_release_group_mbid(self, artist_name: str, album_name: str) -> Optional[str]:
        """find release group MBID."""
        try:
            session = await self.get_session()
            url = f"{self.musicbrainz_base}/release-group/"
            params = {
                'query': f'artist:"{artist_name}" AND releasegroup:"{album_name}"',
                'fmt': 'json',
                'limit': 1
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    release_groups = data.get('release-groups', [])
                    if release_groups:
                        return release_groups[0].get('id')
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error finding release group MBID: %s", e)
        
        return None
    
    async def get_album_cover_art(self, rg_mbid: str) -> List[str]:
        """get multiple cover art versions for album."""
        try:
            session = await self.get_session()
            url = f"{self.coverart_base}/release-group/{rg_mbid}"
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    images = data.get('images', [])
                    
                    cover_urls = []
                    for image in images:
                        if image.get('front'):
                            sizes = image.get('sizes', {})
                            # Get all available sizes
                            for size_name in ['small', 'large', '1200', '500']:
                                if size_name in sizes:
                                    cover_urls.append(sizes[size_name])
                    
                    return list(set(cover_urls))  # Remove duplicates
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting album cover art: %s", e)
        
        return []
    
    async def get_release_group_details(self, rg_mbid: str) -> Dict:
        """get release group details."""
        try:
            session = await self.get_session()
            url = f"{self.musicbrainz_base}/release-group/{rg_mbid}"
            params = {'fmt': 'json', 'inc': 'artist-credits+tags'}
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return {
                        'mbid': rg_mbid,
                        'title': data.get('title'),
                        'type': data.get('type'),
                        'first_release_date': data.get('first-release-date'),
                        'primary_type': data.get('primary-type'),
                        'secondary_types': data.get('secondary-type-list', []),
                        'tags': [tag.get('name') for tag in data.get('tags', [])]
                    }
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting release group details: %s", e)
        
        return {}
    
    async def get_enhanced_lyrics(self, artist_name: str, track_title: str) -> Dict:
        """get enhanced lyrics with metadata."""
        try:
            lyrics_info = {'lyrics': {}}

            # Try LRCLIB first for synced lyrics
            try:
                lrclib_data = await self.get_lrclib_lyrics(artist_name, track_title)
                if lrclib_data:
                    lyrics_info['lyrics'].update(lrclib_data)
                    return lyrics_info
            except Exception as e:
                logger.warning("LRCLIB lyrics lookup failed for %s - %s: %s", artist_name, track_title, e)

            # Fallback to other sources
            lyrics_sources = [
                self.get_genius_lyrics,
                self.get_lyricfind_lyrics,
                self.get_musixmatch_lyrics
            ]

            for source_func in lyrics_sources:
                try:
                    lyrics_data = await source_func(artist_name, track_title)
                    if lyrics_data:
                        lyrics_info['lyrics'].update(lyrics_data)
                        break  # Use first successful source
                except (aiohttp.ClientError, OSError):
                    continue

            return lyrics_info

        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting enhanced lyrics: %s", e)
            return {}
    
    async def get_lrclib_lyrics(self, artist_name: str, track_title: str) -> Optional[Dict]:
        """get synced lyrics from LRCLIB."""
        try:
            session = await self.get_session()
            search_url = "https://lrclib.net/api/search"
            params = {'q': f"{artist_name} {track_title}"}

            async with session.get(search_url, params=params) as response:
                if response.status == 200:
                    results = await response.json()
                    if results:
                        # Get the best match
                        best_match = results[0]
                        synced_lyrics = best_match.get('syncedLyrics')
                        plain_lyrics = best_match.get('plainLyrics')

                        if synced_lyrics:
                            return {
                                'text': plain_lyrics or '',
                                'synced_text': synced_lyrics,
                                'source': 'LRCLIB',
                                'url': f"https://lrclib.net/lyrics/{best_match.get('id')}"
                            }
                        elif plain_lyrics:
                            return {
                                'text': plain_lyrics,
                                'source': 'LRCLIB',
                                'url': f"https://lrclib.net/lyrics/{best_match.get('id')}"
                            }
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting LRCLIB lyrics: %s", e)

        return None

    async def get_genius_lyrics(self, artist_name: str, track_title: str) -> Optional[Dict]:
        """get lyrics from Genius."""
        try:
            session = await self.get_session()
            search_url = "https://genius.com/api/search/multi"
            params = {'q': f"{artist_name} {track_title}"}

            async with session.get(search_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()

                    for section in data.get('response', {}).get('sections', []):
                        if section.get('type') == 'song':
                            for hit in section.get('hits', []):
                                result = hit.get('result', {})
                                if self.is_lyrics_match(artist_name, track_title, result):
                                    lyrics_path = result.get('path')
                                    if lyrics_path:
                                        lyrics_url = f"https://genius.com{lyrics_path}"
                                        lyrics = await self.scrape_genius_lyrics(lyrics_url)
                                        if lyrics:
                                            return {
                                                'text': lyrics,
                                                'source': 'Genius',
                                                'url': lyrics_url
                                            }
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting Genius lyrics: %s", e)

        return None
    
    def is_lyrics_match(self, artist_name: str, track_title: str, result: Dict) -> bool:
        """check if search result matches the requested lyrics."""
        result_artist = result.get('primary_artist', {}).get('name', '').lower()
        result_title = result.get('title', '').lower()
        
        artist_lower = artist_name.lower()
        title_lower = track_title.lower()
        
        # Check for artist match
        if artist_lower not in result_artist and result_artist not in artist_lower:
            return False
        
        # Check for title match
        if title_lower not in result_title and result_title not in title_lower:
            return False
        
        return True
    
    async def scrape_genius_lyrics(self, url: str) -> Optional[str]:
        """scrape lyrics from Genius page."""
        try:
            session = await self.get_session()
            async with session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find lyrics div
                    lyrics_div = soup.find('div', {'data-lyrics-container': 'true'})
                    if lyrics_div:
                        lyrics = lyrics_div.get_text(separator='\n', strip=True)
                        # Clean up common Genius artifacts
                        lyrics = re.sub(r'\[.*?\]', '', lyrics)  # Remove [Chorus], [Verse] etc.
                        lyrics = re.sub(r'\([^)]*\)', '', lyrics)  # Remove parenthetical text
                        return lyrics.strip()
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error scraping Genius lyrics: %s", e)
        
        return None
    
    async def get_lyricfind_lyrics(self, artist_name: str, track_title: str) -> Optional[Dict]:
        """Fetch lyrics from LyricFind (requires API key)."""
        # Not implemented: requires LyricFind API partnership
        logger.debug("LyricFind lookup skipped (not configured): %s - %s", artist_name, track_title)
        return None
    
    async def get_musixmatch_lyrics(self, artist_name: str, track_title: str) -> Optional[Dict]:
        """Fetch lyrics from Musixmatch (requires API key)."""
        # Not implemented: requires Musixmatch API key
        logger.debug("Musixmatch lookup skipped (not configured): %s - %s", artist_name, track_title)
        return None
    
    async def analyze_audio_features(self, file_path: str) -> Dict:
        """analyze audio features for mood and genre detection."""
        try:
            import librosa
            import numpy as np
            from concurrent.futures import ThreadPoolExecutor
            
            # run blocking librosa analysis in thread pool to avoid blocking event loop
            loop = asyncio.get_event_loop()
            
            def _analyze_blocking():
                # Load audio file (first 30 seconds only for performance)
                y, sr = librosa.load(file_path, duration=30)
                
                features = {}
                
                # Tempo
                tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
                features['tempo'] = float(tempo)
                
                # Energy (RMS energy)
                energy = librosa.feature.rms(y=y)[0]
                features['energy'] = float(np.mean(energy))
                
                # Spectral centroid for valence approximation
                spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
                features['valence'] = float(np.mean(spectral_centroids) / sr)
                
                # Danceability approximation
                onset_envelope = librosa.onset.onset_strength(y=y, sr=sr)
                features['danceability'] = float(np.std(onset_envelope))
                
                # Key detection
                chroma = librosa.feature.chroma_stft(y=y, sr=sr)
                key_mapping = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                key_counts = np.mean(chroma, axis=1)
                estimated_key = key_mapping[np.argmax(key_counts)]
                features['key'] = estimated_key
                
                # Mode (major/minor)
                major = np.mean(chroma[[0, 2, 4, 5, 7, 9, 11]])
                minor = np.mean(chroma[[0, 2, 3, 5, 7, 8, 10]])
                features['mode'] = 0 if major > minor else 1
                
                # MFCCs for similarity analysis
                mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
                features['mfcc'] = mfccs.tobytes()
                
                return features
            
            features = await loop.run_in_executor(None, _analyze_blocking)
            
            # Mood classification
            features['mood'] = self.classify_mood(features)
            
            # Genre prediction (basic)
            features['genre_prediction'] = self.predict_genre(features)
            
            return {'audio_features': features}
            
        except (OSError, RuntimeError) as e:
            logger.error("Error analyzing audio features: %s", e)
            return {}
    
    def classify_mood(self, features: Dict) -> str:
        """classify mood based on audio features."""
        energy = features.get('energy', 0.5)
        valence = features.get('valence', 0.5)
        tempo = features.get('tempo', 120)
        
        if energy > 0.7 and valence > 0.6:
            return 'energetic'
        elif energy < 0.4 and valence < 0.4:
            return 'melancholic'
        elif energy < 0.5 and valence > 0.5:
            return 'relaxed'
        elif tempo > 130 and energy > 0.6:
            return 'upbeat'
        else:
            return 'neutral'
    
    def predict_genre(self, features: Dict) -> str:
        """predict genre based on audio features."""
        tempo = features.get('tempo', 120)
        energy = features.get('energy', 0.5)
        key = features.get('key', 'C')
        
        # Simple heuristic genre classification
        if tempo > 140 and energy > 0.7:
            return 'electronic'
        elif tempo > 120 and energy > 0.6:
            return 'rock'
        elif tempo < 100 and energy < 0.5:
            return 'ambient'
        elif 100 <= tempo <= 130 and 0.4 <= energy <= 0.7:
            return 'pop'
        else:
            return 'unknown'
    
    async def get_related_content(self, artist_name: str, album_name: str) -> Dict:
        """get related artists and albums."""
        try:
            related_info = {'related': {}}
            
            # Get related artists (would require Last.fm or Spotify API)
            related_artists = await self.get_related_artists(artist_name)
            if related_artists:
                related_info['related']['artists'] = related_artists
            
            # Get similar albums
            similar_albums = await self.get_similar_albums(artist_name, album_name)
            if similar_albums:
                related_info['related']['albums'] = similar_albums
            
            return related_info
            
        except (aiohttp.ClientError, OSError) as e:
            logger.error("Error getting related content: %s", e)
            return {}
    
    async def get_related_artists(self, artist_name: str) -> List[Dict]:
        """Get related artists (requires Last.fm or Spotify API)."""
        logger.debug("Related artists lookup skipped (not configured): %s", artist_name)
        return []
    
    async def get_similar_albums(self, artist_name: str, album_name: str) -> List[Dict]:
        """Get similar albums (requires MusicBrainz relationships)."""
        logger.debug("Similar albums lookup skipped (not configured): %s - %s", artist_name, album_name)
        return []


# Singleton instance
deep_discovery = DeepDiscoveryService()

# Need to import engine from database
from database import engine