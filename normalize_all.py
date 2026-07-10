#!/usr/bin/env python3
"""Normalize ALL artist data in root database."""

import sys
import os

os.chdir('/home/house/Documents/docker/music_app')
sys.path.insert(0, '/home/house/Documents/docker/music_app/backend')

import config
config.settings.database_url = "sqlite:///./music.db"

from database import Session, engine, create_db_and_tables
from models import Track
from sqlmodel import select
from datetime import datetime
from typing import Optional, List

def _parse_artists(artist_string: Optional[str]) -> List[str]:
    """Parse artist string - treats commas AND ft./feat./& as separators."""
    if not artist_string:
        return []
    
    # First, split by commas (PRIMARY separator)
    comma_parts = [p.strip() for p in artist_string.split(',')]
    
    all_artists = []
    
    for part in comma_parts:
        if not part:
            continue
            
        normalized = part.lower()
        
        markers = [
            ' featuring ', ' ft. ', ' feat. ',
            ' & ', ' x ', ' vs ', ' versus ',
            ' with ', ' and ', ' + '
        ]
        
        split_positions = []
        for marker in markers:
            pos = normalized.find(marker)
            while pos != -1:
                split_positions.append((pos, pos + len(marker)))
                pos = normalized.find(marker, pos + 1)
        
        if not split_positions:
            all_artists.append(part.strip())
        else:
            split_positions.sort()
            
            first_end = split_positions[0][0]
            first_artist = part[:first_end].strip()
            if first_artist:
                all_artists.append(first_artist)
            
            for i in range(len(split_positions)):
                start = split_positions[i][1]
                if i + 1 < len(split_positions):
                    end = split_positions[i + 1][0]
                else:
                    end = len(part)
                
                artist = part[start:end].strip()
                if artist.lower().startswith('ft '):
                    artist = artist[3:].strip()
                if artist.lower().startswith('feat '):
                    artist = artist[5:].strip()
                if artist:
                    all_artists.append(artist)
    
    return all_artists


def normalize_artists():
    create_db_and_tables()
    
    with Session(engine) as session:
        stmt = select(Track).where(Track.artist.isnot(None))
        tracks = session.exec(stmt).all()
        
        print(f"Processing {len(tracks)} tracks...")

        updated_count = 0

        for track in tracks:
            if not track.artist:
                continue

            # Force normalize ALL tracks (ignore custom metadata flag)
            # User explicitly wants artists split regardless of custom flag

            parsed = _parse_artists(track.artist)

            if len(parsed) > 1:
                main_artist = parsed[0]
                featured = parsed[1:]
                
                print(f"Track {track.id}: '{track.artist}'")
                print(f"   -> main: '{main_artist}'")
                print(f"   -> featured: {featured}")
                
                track.artist = main_artist
                track.featured_artists = ", ".join(featured)
                track.updated_at = datetime.utcnow()
                session.add(track)
                updated_count += 1
                
                if updated_count % 50 == 0:
                    session.commit()
                    print(f"  Committed {updated_count}...")

        if updated_count > 0:
            session.commit()

        print(f"\n✅ Done! Updated {updated_count} tracks")
        return updated_count


if __name__ == "__main__":
    count = normalize_artists()
    sys.exit(0 if count >= 0 else 1)
