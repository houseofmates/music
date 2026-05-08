#!/usr/bin/env python3
"""Script to normalize artist data in the database."""

import sys
sys.path.insert(0, '/home/house/Documents/docker/music_app/backend')

from database import Session, engine
from models import Track
from sqlmodel import select
from datetime import datetime, timezone

from typing import Optional, List

def parse_artists(artist_string: Optional[str]) -> List[str]:
    """Parse artist string to extract individual artists.
    
    Treats commas as PRIMARY separators (like "Artist A, Artist B")
    PLUS ft./feat./& as separators (like "Artist A ft. Artist B")
    
    Returns list of individual artist names with original casing preserved.
    """
    if not artist_string:
        return []
    
    # First, split by commas (PRIMARY separator)
    comma_parts = [p.strip() for p in artist_string.split(',')]
    
    all_artists = []
    
    # Then check each part for ft./feat./&/x/etc. (SECONDARY separators)
    for part in comma_parts:
        if not part:
            continue
            
        # Normalize for separator detection (lowercase)
        normalized = part.lower()
        
        # Find positions of all markers in the original string
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
            # No secondary separators found, add the whole part
            all_artists.append(part.strip())
        else:
            # Sort by position and extract substrings from original
            split_positions.sort()
            
            # Get the first artist (before first marker)
            first_end = split_positions[0][0]
            first_artist = part[:first_end].strip()
            if first_artist:
                all_artists.append(first_artist)
            
            # Get artists between markers
            for i in range(len(split_positions)):
                start = split_positions[i][1]  # End of current marker
                if i + 1 < len(split_positions):
                    end = split_positions[i + 1][0]  # Start of next marker
                else:
                    end = len(part)
                
                artist = part[start:end].strip()
                # Clean up common prefixes that might remain
                if artist.lower().startswith('ft '):
                    artist = artist[3:].strip()
                if artist.lower().startswith('feat '):
                    artist = artist[5:].strip()
                if artist:
                    all_artists.append(artist)
    
    return all_artists


def normalize_artists():
    with Session(engine) as session:
        stmt = select(Track).where(Track.artist.isnot(None))
        tracks = session.exec(stmt).all()

        updated_count = 0

        for track in tracks:
            if not track.artist:
                continue

            if track.is_custom_metadata:
                continue

            # Parse the artist string - returns list of all individual artists
            parsed = parse_artists(track.artist)

            if len(parsed) > 1:
                # Multiple artists found - split into main and featured
                main_artist = parsed[0]
                featured = parsed[1:]
                
                print(f"📝 Track {track.id}: '{track.artist}'")
                print(f"   -> main: '{main_artist}'")
                print(f"   -> featured: {featured}")
                
                track.artist = main_artist
                track.featured_artists = ", ".join(featured)
                track.updated_at = datetime.now(timezone.utc)
                session.add(track)
                updated_count += 1
                
                if updated_count % 50 == 0:
                    session.commit()
                    print(f"  Committed {updated_count} changes so far...")
                    
            elif len(parsed) == 1 and parsed[0] != track.artist.strip():
                # Single artist but with different formatting (trailing spaces, etc)
                print(f"📝 Track {track.id}: '{track.artist}' -> '{parsed[0]}' (cleanup)")
                track.artist = parsed[0]
                track.updated_at = datetime.now(timezone.utc)
                session.add(track)
                updated_count += 1

        if updated_count > 0:
            session.commit()

        print(f"\n✅ Done! Updated {updated_count} tracks")
        return updated_count


if __name__ == "__main__":
    count = normalize_artists()
    sys.exit(0 if count >= 0 else 1)
