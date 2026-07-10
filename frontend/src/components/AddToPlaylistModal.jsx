import { useEffect, useState } from 'react';
import { getPlaylists, addTrackToPlaylist, createPlaylist } from '../api';
import { X, Plus, Loader2, Music } from '../icons.jsx';
import { triggerImpact } from '../utils/haptics';
import { showToast } from '../utils/toast';

export default function AddToPlaylistModal({ track, isOpen, onClose, onAdded }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadPlaylists();
  }, [isOpen]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const res = await getPlaylists();
      setPlaylists(res.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (playlistId) => {
    if (!track?.id) return;
    setAddingTo(playlistId);
    triggerImpact('light');
    try {
      await addTrackToPlaylist(playlistId, track.id);
      onAdded?.(playlistId);
      onClose();
    } catch (err) {
      showToast('Failed to add track', 'error');
    } finally {
      setAddingTo(null);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim() || !track?.id) return;
    setCreating(true);
    triggerImpact('light');
    try {
      const res = await createPlaylist({ name: newPlaylistName.trim() });
      const newPlaylist = res.data;
      await addTrackToPlaylist(newPlaylist.id, track.id);
      onAdded?.(newPlaylist.id);
      onClose();
    } catch (err) {
      showToast('Failed to create playlist', 'error');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] w-full max-w-sm rounded-3xl p-6 border border-[#333]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-vibe-gold lowercase">add to playlist</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#888] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {track && (
          <p className="text-sm text-[#888] mb-4 lowercase truncate">
            {track.title || track.filename}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-vibe-gold animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {playlists.length === 0 && (
                <p className="text-[#888] text-sm text-center py-4 lowercase">no playlists yet</p>
              )}
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAdd(playlist.id)}
                  disabled={addingTo === playlist.id}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-xl hover:bg-[#2a2a2a] transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-vibe-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate lowercase">
                      {playlist.name}
                    </p>
                    <p className="text-[#888] text-xs lowercase">
                      {playlist.track_count || 0} tracks
                    </p>
                  </div>
                  {addingTo === playlist.id && (
                    <Loader2 className="w-4 h-4 text-vibe-gold animate-spin" />
                  )}
                </button>
              ))}
            </div>

            {showCreate ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="playlist name..."
                  className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#666] outline-none lowercase"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateAndAdd();
                    if (e.key === 'Escape') setShowCreate(false);
                  }}
                />
                <button
                  onClick={handleCreateAndAdd}
                  disabled={creating || !newPlaylistName.trim()}
                  className="w-12 h-12 bg-vibe-gold text-vibe-black rounded-xl flex items-center justify-center font-bold disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full py-3 text-vibe-gold hover:bg-[#1a1a1a] rounded-xl transition-colors text-sm font-medium lowercase flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                create new playlist
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
