import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Plus } from '../icons.jsx';
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

interface Playlist {
  id: number;
  name: string;
  description?: string;
  tracks: Track[];
}

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!id) return;

      try {
        const res = await fetch(`/api/playlists/${id}`);
        const data = await res.json();
        setPlaylist(data);
      } catch (error) {
        console.error("Failed to load playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [id]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  const handleAddTracks = () => {
    // Simple implementation: navigate to tracks page with add-to-playlist mode
    if (playlist) {
      navigate('/tracks', { state: { addToPlaylistId: playlist.id } });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-4">
        <p className="text-gray-400">Playlist not found</p>
      </div>
    );
  }

  return (
    <main className="pb-32 md:pb-16">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/playlists"
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            aria-label="Back to playlists"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-gray-400 mt-1">{playlist.description}</p>
            )}
            <p className="text-gray-400 text-sm mt-1">
              {playlist.tracks.length} track{playlist.tracks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 bg-vibe-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
              aria-label="Play all tracks"
            >
              <Play className="w-4 h-4" />
              Play All
            </button>
            <button
              onClick={handleAddTracks}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
              aria-label="Add tracks to playlist"
            >
              <Plus className="w-4 h-4" />
              Add Tracks
            </button>
          </div>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No tracks in this playlist</p>
            <button
              onClick={handleAddTracks}
              className="px-6 py-3 bg-vibe-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Add Some Tracks
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors group cursor-pointer"
                onClick={() => handlePlayTrack(track)}
                role="button"
                tabIndex={0}
                aria-label={`Play ${track.title || track.filename} - track ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayTrack(track);
                  }
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm font-medium">
                  {index + 1}
                </div>

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
                    {track.artist || 'Unknown Artist'}
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
      </div>
    </main>
  );
};

export default PlaylistDetail;