"""ai service for intelligent music features using nvidia api.

this module provides:
- intelligent track recommendations
- mood and energy analysis
- contextual playlist generation
- semantic search enhancements
"""

import os
import logging
import asyncio
import aiohttp
import json
import hashlib
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from itertools import cycle

from sqlmodel import Session, select
from models import Track, AudioFeatures, UserPlayStats

logger = logging.getLogger(__name__)


class AIService:
    """intelligent ai service with nvidia api integration and key rotation."""
    
    def __init__(self):
        self.api_base = "https://integrate.api.nvidia.com/v1"
        self.current_key_index = 0
        self.session = None
        self.request_count = 0
        self.last_rotation = datetime.now(timezone.utc)
        
        # load api keys from environment
        self.api_keys = [
            os.getenv('NVIDIA_API_KEY_1', '').strip(),
            os.getenv('NVIDIA_API_KEY_2', '').strip(),
            os.getenv('NVIDIA_API_KEY_3', '').strip(),
            os.getenv('NVIDIA_API_KEY_4', '').strip(),
            os.getenv('NVIDIA_API_KEY_5', '').strip(),
            os.getenv('NVIDIA_API_KEY_6', '').strip(),
            os.getenv('NVIDIA_API_KEY_7', '').strip(),
            os.getenv('NVIDIA_API_KEY_8', '').strip(),
            os.getenv('NVIDIA_API_KEY_9', '').strip(),
            os.getenv('NVIDIA_API_KEY_10', '').strip(),
            os.getenv('NVIDIA_API_KEY_11', '').strip(),
            os.getenv('NVIDIA_API_KEY_12', '').strip(),
            os.getenv('NVIDIA_API_KEY_13', '').strip(),
            os.getenv('NVIDIA_API_KEY_14', '').strip(),
            os.getenv('NVIDIA_API_KEY_15', '').strip(),
            os.getenv('NVIDIA_API_KEY_16', '').strip(),
            os.getenv('NVIDIA_API_KEY_17', '').strip(),
            os.getenv('NVIDIA_API_KEY_18', '').strip(),
            os.getenv('NVIDIA_API_KEY_19', '').strip(),
            os.getenv('NVIDIA_API_KEY_20', '').strip(),
            os.getenv('NVIDIA_API_KEY_21', '').strip(),
            os.getenv('NVIDIA_API_KEY_22', '').strip(),
            os.getenv('NVIDIA_API_KEY_23', '').strip(),
            os.getenv('NVIDIA_API_KEY_24', '').strip(),
        ]
        
        # filter out empty keys
        self.api_keys = [key for key in self.api_keys if key]
        
        if not self.api_keys:
            logger.warning("no nvidia api keys configured")
            self.api_keys = []
    
    def get_current_key(self) -> Optional[str]:
        """get current api key using round-robin rotation."""
        if not self.api_keys:
            return None
        
        # rotate every 100 requests to distribute load
        if self.request_count % 100 == 0:
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            logger.info("rotating to api key %d/%d", self.current_key_index + 1, len(self.api_keys))
        
        return self.api_keys[self.current_key_index]
    
    async def get_session(self):
        """get aiohttp session for api requests."""
        if self.session is None:
            timeout = aiohttp.ClientTimeout(total=30)
            headers = {
                'Authorization': f'Bearer {self.get_current_key()}',
                'Content-Type': 'application/json'
            }
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers
            )
        return self.session
    
    async def make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """make authenticated request to nvidia api with retry logic."""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                session = await self.get_session()
                url = f"{self.api_base}/{endpoint}"
                
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        self.request_count += 1
                        result = await response.json()
                        return result
                    elif response.status == 401:
                        logger.error("api key %d unauthorized", self.current_key_index + 1)
                        # rotate to next key on auth failure
                        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
                        if attempt < max_retries - 1:
                            continue
                    else:
                        error_text = await response.text()
                        raise Exception(f"api request failed: {response.status} - {error_text}")
                        
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                logger.warning("request attempt %d failed, retrying...", attempt + 1)
                await asyncio.sleep(1)
        
        raise Exception("all retry attempts failed")
    
    async def analyze_track_mood(self, track_id: int) -> Dict[str, Any]:
        """analyze track mood and energy using ai."""
        with Session(engine) as session:
            track = session.exec(select(Track).where(Track.id == track_id)).first()
            if not track:
                return {}
        
        prompt = f"""
        analyze the following song for mood and energy characteristics:
        
        title: {track.title}
        artist: {track.artist}
        album: {track.album}
        genre: {track.genre or 'unknown'}
        
        provide:
        1. mood (happy, sad, energetic, relaxed, melancholic, focused)
        2. energy_level (0.0 to 1.0)
        3. danceability (0.0 to 1.0)
        4. valence (0.0 to 1.0)
        5. arousal (0.0 to 1.0)
        6. suggested_tags (3-5 relevant tags)
        
        respond with json only.
        """
        
        try:
            data = {
                "model": "deepseek-ai/deepseek-v4-pro",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 500
            }
            
            result = await self.make_request("chat/completions", data)
            
            if "choices" in result and result["choices"]:
                content = result["choices"][0]["message"]["content"]
                # parse json response
                try:
                    analysis = json.loads(content)
                    return {
                        "mood": analysis.get("mood", "neutral"),
                        "energy_level": float(analysis.get("energy_level", 0.5)),
                        "danceability": float(analysis.get("danceability", 0.5)),
                        "valence": float(analysis.get("valence", 0.5)),
                        "arousal": float(analysis.get("arousal", 0.5)),
                        "suggested_tags": analysis.get("suggested_tags", [])
                    }
                except json.JSONDecodeError:
                    logger.warning("failed to parse ai response for track %d", track_id)
                    return {}
            
        except Exception as e:
            logger.warning("ai mood analysis failed for track %d: %s", track_id, e)
            return {}
        
        return {}
    
    async def generate_contextual_playlist(
        self, 
        user_id: int, 
        context: str, 
        track_count: int = 20,
        exclude_recent: bool = True
    ) -> List[int]:
        """generate intelligent playlist based on context using ai."""
        
        with Session(engine) as session:
            # get user's recent tracks for exclusion
            recent_tracks = []
            if exclude_recent:
                recent_stats = session.exec(
                    select(UserPlayStats)
                    .where(UserPlayStats.user_id == user_id)
                    .order_by(UserPlayStats.last_played.desc())
                    .limit(50)
                ).all()
                recent_tracks = [stat.track_id for stat in recent_stats if stat.track_id]
            
            # get user's favorite tracks for context
            favorite_stats = session.exec(
                select(UserPlayStats)
                .where(UserPlayStats.user_id == user_id)
                .where(UserPlayStats.love_score > 0.5)
                .order_by(UserPlayStats.love_score.desc())
                .limit(10)
            ).all()
            
            favorite_tracks = session.exec(
                select(Track)
                .where(Track.id.in_([stat.track_id for stat in favorite_stats]))
            ).all()
            
            # build context from favorites
            favorites_context = ""
            if favorite_tracks:
                favorites_context = "\n".join([
                    f"- {track.title} by {track.artist} ({track.genre})"
                    for track in favorite_tracks[:5]
                ])
        
        prompt = f"""
        create a {track_count}-track playlist based on this context:
        
        user context: {context}
        
        user's favorite tracks:
        {favorites_context}
        
        recently played tracks to exclude: {len(recent_tracks)} tracks
        
        requirements:
        1. create a cohesive flow and mood
        2. include variety in tempo and energy
        3. balance familiar and discovery tracks
        4. consider time of day and listening patterns
        5. avoid tracks recently played (if specified)
        
        respond with a json array of search queries that would find appropriate tracks.
        each query should be semantic and natural language.
        example: ["chill electronic music for evening focus", "upbeat indie rock for workout"]
        """
        
        try:
            data = {
                "model": "deepseek-ai/deepseek-v4-pro",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 800
            }
            
            result = await self.make_request("chat/completions", data)
            
            if "choices" in result and result["choices"]:
                content = result["choices"][0]["message"]["content"]
                try:
                    queries = json.loads(content)
                    if isinstance(queries, list):
                        return queries
                except json.JSONDecodeError:
                    logger.warning("failed to parse playlist queries")
                    return ["upbeat music", "relaxing tracks", "focus music"]
            
        except Exception as e:
            logger.warning("playlist generation failed: %s", e)
            return ["upbeat music", "relaxing tracks", "focus music"]
        
        return ["upbeat music", "relaxing tracks", "focus music"]
    
    async def enhance_semantic_search(
        self, 
        query: str, 
        user_id: Optional[int] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """enhance semantic search with ai-powered query expansion."""
        
        # get user context for personalization
        user_context = ""
        if user_id:
            with Session(engine) as session:
                user_stats = session.exec(
                    select(UserPlayStats)
                    .where(UserPlayStats.user_id == user_id)
                    .order_by(UserPlayStats.love_score.desc())
                    .limit(5)
                ).all()
                
                if user_stats:
                    avg_mood = "energetic" if sum(stat.love_score for stat in user_stats) > 2 else "relaxed"
                    user_context = f"user prefers {avg_mood} music"
        
        prompt = f"""
        enhance this music search query for better results:
        
        original query: "{query}"
        {user_context}
        
        provide:
        1. 3-5 expanded search queries that capture the intent
        2. identify the likely mood, genre, and use case
        3. suggest relevant terms and synonyms
        4. include both specific and general search terms
        
        respond with json format:
        {{
            "expanded_queries": ["query1", "query2", ...],
            "mood": "detected_mood",
            "genre": "detected_genre",
            "use_case": "relaxing, workout, focus, etc"
        }}
        """
        
        try:
            data = {
                "model": "deepseek-ai/deepseek-v4-pro",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 600
            }
            
            result = await self.make_request("chat/completions", data)
            
            if "choices" in result and result["choices"]:
                content = result["choices"][0]["message"]["content"]
                try:
                    enhancement = json.loads(content)
                    return {
                        "original_query": query,
                        "expanded_queries": enhancement.get("expanded_queries", [query]),
                        "mood": enhancement.get("mood"),
                        "genre": enhancement.get("genre"),
                        "use_case": enhancement.get("use_case"),
                        "ai_enhanced": True
                    }
                except json.JSONDecodeError:
                    logger.warning("failed to parse search enhancement")
                    return {
                        "original_query": query,
                        "expanded_queries": [query],
                        "ai_enhanced": False
                    }
            
        except Exception as e:
            logger.warning("search enhancement failed: %s", e)
            return {
                "original_query": query,
                "expanded_queries": [query],
                "ai_enhanced": False
            }
    
    async def get_track_recommendations(
        self,
        seed_track_id: int,
        user_id: Optional[int] = None,
        count: int = 10
    ) -> List[int]:
        """get ai-powered track recommendations based on seed track."""
        
        with Session(engine) as session:
            seed_track = session.exec(select(Track).where(Track.id == seed_track_id)).first()
            if not seed_track:
                return []
        
        prompt = f"""
        recommend {count} tracks similar to this seed track:
        
        seed track:
        title: {seed_track.title}
        artist: {seed_track.artist}
        album: {seed_track.album}
        genre: {seed_track.genre or 'unknown'}
        
        criteria for recommendations:
        1. similar mood and energy level
        2. complementary tempo and rhythm
        3. related artists or genres
        4. variety in key and instrumentation
        5. avoid exact duplicates but allow similar styles
        
        respond with a json array of search queries that would find ideal recommendations.
        focus on musical characteristics rather than exact matches.
        """
        
        try:
            data = {
                "model": "deepseek-ai/deepseek-v4-pro",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.6,
                "max_tokens": 700
            }
            
            result = await self.make_request("chat/completions", data)
            
            if "choices" in result and result["choices"]:
                content = result["choices"][0]["message"]["content"]
                try:
                    queries = json.loads(content)
                    if isinstance(queries, list):
                        return queries
                except json.JSONDecodeError:
                    logger.warning("failed to parse recommendation queries")
                    return [f"similar to {seed_track.title}", f"{seed_track.genre} music"]
            
        except Exception as e:
            logger.warning("recommendation generation failed: %s", e)
            return [f"similar to {seed_track.title}", f"{seed_track.genre} music"]
        
        return [f"similar to {seed_track.title}", f"{seed_track.genre} music"]
    
    async def close(self):
        """cleanup aiohttp session."""
        if self.session:
            await self.session.close()
            self.session = None


# global ai service instance
ai_service = AIService()

# need to import engine from database
from database import engine
