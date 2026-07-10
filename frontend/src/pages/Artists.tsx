import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft } from '../icons.jsx';
import { usePlayerStore } from '../store';
import { resolveMediaUrl } from '../api';
import ImageWithFallback from '../components/ImageWithFallback';

interface Track {
  id: number;
  title?: string;
  filename?: string;
  artist?: string;
  album?: string;
  cover_art_url?: string;
  duration?: number;
}

const Artists: React.FC = () => {
  const { artist } = useParams<{ artist: string }>();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const url = artist
          ? `/api/tracks?artist=${encodeURIComponent(artist)}`
          : '/api/tracks?group=artist';
        const res = await fetch(url);
        const data = await res.json();
        setTracks(data.tracks || data || []);
      } catch (error) {
        console.error("Failed to load artists:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [artist]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const uniqueArtists = Array.from(
    new Set(tracks.map(track => track.artist).filter((a): a is string => Boolean(a)))
  ).sort();

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (artist) {
    // Show tracks by specific artist
    return (
      <main className="pb-32 md:pb-16">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">{artist}</h1>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors group cursor-pointer"
                onClick={() => handlePlayTrack(track)}
                role="button"
                tabIndex={0}
                aria-label={`Play ${track.title || track.filename}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayTrack(track);
                  }
                }}
              >
                <ImageWithFallback
                  src={resolveMediaUrl(track.cover_art_url)}
                  alt={track.album || 'Album cover'}
                  fallbackText={track.title || track.filename}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {track.title || track.filename}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {track.album || 'Unknown Album'}
                  </p>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#3a3a3a] rounded-full"
                  aria-label="Play track"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                >
                  <Play className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Show artist list
  return (
    <main className="pb-32 md:pb-16">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Artists</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueArtists.map((artistName) => {
            const artistTracks = tracks.filter(track => track.artist === artistName);
            const coverArt = artistTracks.find(track => track.cover_art_url)?.cover_art_url;

            return (
              <div
                key={artistName}
                className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                onClick={() => navigate(`/artists/${encodeURIComponent(artistName)}`)}
                role="button"
                tabIndex={0}
                aria-label={`View tracks by ${artistName}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/artists/${encodeURIComponent(artistName)}`);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={resolveMediaUrl(coverArt)}
                    alt={`${artistName} cover`}
                    fallbackText={artistName}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{artistName}</h3>
                    <p className="text-gray-400 text-sm">
                      {artistTracks.length} track{artistTracks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Artists;