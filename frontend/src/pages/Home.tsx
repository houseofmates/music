import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Shuffle, ListMusic } from '../icons.jsx';
import { usePlayerStore } from '../store';
import { resolveMediaUrl } from '../api';
import ImageWithFallback from '../components/ImageWithFallback';
import { truncateText } from '../utils/text';

interface Track {
  id: number;
  title?: string;
  filename?: string;
  artist?: string;
  album?: string;
  cover_art_url?: string;
  duration?: number;
}

interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

const Home: React.FC = () => {
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recent tracks
        const tracksRes = await fetch('/api/tracks?limit=20');
        const tracksData = await tracksRes.json();
        // API returns a direct list, not {tracks: [...]}
        setRecentTracks(Array.isArray(tracksData) ? tracksData : []);

        // Load playlists
        const playlistsRes = await fetch('/api/playlists');
        const playlistsData = await playlistsRes.json();
        setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handleShuffleAll = () => {
    if (recentTracks.length > 0) {
      const randomTrack = recentTracks[Math.floor(Math.random() * recentTracks.length)];
      playTrack(randomTrack);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-32 md:pb-16">
      <div className="p-4 space-y-8">
        {/* Recently Added */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recently Added</h2>
            <button
              onClick={handleShuffleAll}
              className="flex items-center gap-2 px-4 py-2 bg-vibe-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
              aria-label="Shuffle all recent tracks"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentTracks.map((track) => (
              <div
                key={track.id}
                className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors group cursor-pointer"
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
                <div className="relative mb-3">
                  <ImageWithFallback
                    src={resolveMediaUrl(track.cover_art_url)}
                    alt={track.album || 'Album cover'}
                    fallbackText={track.title || track.filename}
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    aria-label="Play track"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                  >
                    <Play className="w-8 h-8 text-white" />
                  </button>
                </div>

                <h3 className="text-white font-medium truncate mb-1">
                  {track.title || track.filename}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {track.artist || 'Unknown Artist'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Playlists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
            <Link
              to="/playlists"
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
              aria-label="View all playlists"
            >
              <ListMusic className="w-4 h-4" />
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.slice(0, 8).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/playlists/${playlist.id}`}
                className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors block"
                aria-label={`Open playlist: ${playlist.name}`}
              >
                <div className="w-full aspect-square bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center">
                  <ListMusic className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-white font-medium mb-1 leading-tight">{truncateText(playlist.name, 30)}</h3>
                <p className="text-gray-400 text-sm">{playlist.tracks.length} tracks</p>
              </Link>
            ))}

            <Link
              to="/playlists"
              className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center border-2 border-dashed border-gray-600"
              aria-label="Create new playlist"
            >
              <Plus className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">New Playlist</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;