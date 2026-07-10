import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, MoreVertical } from '../icons.jsx';
import { usePlayerStore } from '../store';
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
  description?: string;
  tracks: Track[];
}

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const res = await fetch('/api/playlists');
        const data = await res.json();
        setPlaylists(data || []);
      } catch (error) {
        console.error("Failed to load playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const handleCreatePlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (!name) return;

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const newPlaylist = await res.json();
      setPlaylists(prev => [...prev, newPlaylist]);
    } catch (error) {
      console.error("Failed to create playlist:", error);
      alert("Failed to create playlist. Please try again.");
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await fetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      alert("Failed to delete playlist. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="pt-safe pb-4 px-4">
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
    <main className="pt-safe pb-32 md:pb-16">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Playlists</h1>
          <button
            onClick={handleCreatePlaylist}
            className="flex items-center gap-2 px-4 py-2 bg-vibe-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
            aria-label="Create new playlist"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No playlists yet</p>
            <button
              onClick={handleCreatePlaylist}
              className="px-6 py-3 bg-vibe-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors group relative"
              >
                <Link
                  to={`/playlists/${playlist.id}`}
                  className="block"
                  aria-label={`Open playlist: ${playlist.name}`}
                >
                  <div className="w-full aspect-square bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-white font-medium mb-1 leading-tight">{truncateText(playlist.name, 30)}</h3>
                </Link>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handlePlayPlaylist(playlist);
                    }}
                    className="p-1 hover:bg-[#3a3a3a] rounded"
                    aria-label="Play playlist"
                  >
                    <Play className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className="p-1 hover:bg-[#3a3a3a] rounded ml-1"
                    aria-label="Delete playlist"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Playlists;