import React, { useEffect, useState } from 'react';
import { Play, Search as SearchIcon } from '../icons.jsx';
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

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const searchTracks = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/tracks/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            search_in: ['title', 'artist', 'album']
          })
        });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTracks, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handlePlayTrack = (track: Track) => {
    const queueItems = [{ id: `queue-${track.id}-0`, track, position: 0 }];
    usePlayerStore.setState({ queue: queueItems, currentQueueIndex: 0 });
    playTrack(track, 0);
  };

  return (
    <main className="pb-32 md:pb-16">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracks, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-gray-600 focus:border-vibe-gold focus:outline-none"
            aria-label="Search music"
          />
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-vibe-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No tracks found for "{query}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 mb-4">{results.length} results</p>
            {results.map((track) => (
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
                    {track.artist || 'Unknown Artist'} • {track.album || 'Unknown Album'}
                  </p>
                </div>

                <div className="text-gray-400 text-sm">
                  {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '--:--'}
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#3a3a3a] rounded-full ml-2"
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
        )}

        {!query && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Start typing to search your music library</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Search;