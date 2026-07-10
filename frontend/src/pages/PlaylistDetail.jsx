import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  reorderPlaylistTracks,
  updateTrack,
  downloadTrack,
  addTrackToPlaylist,
} from '../api';
import TrackList from '../components/TrackList';
import ContextMenu from '../components/ContextMenu';
import AutoSizeText from '../components/AutoSizeText';
import TrackEditModal from '../components/TrackEditModal';
import CoverSearchModal from '../components/CoverSearchModal';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { Loader2, ArrowLeft, Trash2, Search, Shuffle, ListPlus } from '../icons.jsx';
import { usePlayerStore } from '../store';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCustomTrackOrder, setHasCustomTrackOrder] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingTrack, setEditingTrack] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [coverSearchTrack, setCoverSearchTrack] = useState(null);
  const [showCoverSearch, setShowCoverSearch] = useState(false);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null);
  const { toggleFavorite, addToQueue, favorites, playTrack } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  // Filter tracks based on search term
  const filteredTracks = useMemo(() => {
    if (!playlist?.tracks) return [];
    if (!searchTerm.trim()) return playlist.tracks;
    const term = searchTerm.toLowerCase();
    return playlist.tracks.filter(track =>
      (track.title || track.filename || '').toLowerCase().includes(term) ||
      (track.artist || '').toLowerCase().includes(term) ||
      (track.album || '').toLowerCase().includes(term)
    );
  }, [playlist, searchTerm]);

  // Ctrl+F keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortTracksByFilename = (tracks = []) => {
    return [...tracks].sort((a, b) => {
      const aName = (a.filename || a.title || '').toString().toLowerCase();
      const bName = (b.filename || b.title || '').toString().toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  };

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const response = await getPlaylist(id);
      const playlistData = response.data;
      if (playlistData?.tracks && !hasCustomTrackOrder) {
        playlistData.tracks = sortTracksByFilename(playlistData.tracks);
      }
      setPlaylist(playlistData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Shuffle and play random song from playlist
  const handleShufflePlay = async () => {
    if (!playlist?.tracks || playlist.tracks.length === 0) return;
    const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
    const queueItems = shuffled.map((t, index) => ({
      id: `queue-${t.id}-${index}`,
      track: t,
      position: index,
    }));
    usePlayerStore.setState({ queue: queueItems, currentQueueIndex: 0 });
    await playTrack(shuffled[0], 0);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deletePlaylist(id);
      navigate('/playlists');
    } catch (error) {
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await removeTrackFromPlaylist(id, trackId);
      setPlaylist((prev) => {
        if (!prev) return prev;
        const filtered = (prev.tracks || []).filter((t) => t.id !== trackId);
        return { ...prev, tracks: filtered };
      });
    } catch (error) {
    }
  };

  const handleAddTrackToThisPlaylist = async (trackId) => {
    try {
      await addTrackToPlaylist(id, trackId);
      await loadPlaylist();
    } catch (error) {
    }
  };

  const handleSearchCover = (track) => {
    setCoverSearchTrack(track);
    setShowCoverSearch(true);
  };

  const handleCoverApplied = (newCoverUrl) => {
    // Update the track in the playlist with the new cover
    setPlaylist((prev) => {
      if (!prev) return prev;
      const updatedTracks = prev.tracks.map((t) =>
        t.id === coverSearchTrack.id ? { ...t, cover_art_url: newCoverUrl } : t
      );
      return { ...prev, tracks: updatedTracks };
    });
  };

  const handleContextMenu = (e, track) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      track,
    });
  };

  const handleLongPress = (e, track) => {
    // For mobile - show context menu at the element's position
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: rect.left + rect.width / 2,
      y: rect.top,
      track,
    });
  };

  const handleDownload = async (track) => {
    if (!track?.id) return;
    try {
      const response = await downloadTrack(track.id);
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${track.title || track.filename || 'track'}.mp3`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
    }
  };

  const saveTrack = async (data) => {
    if (!editingTrack) return;
    try {
      const res = await updateTrack(editingTrack.id, data);
      setEditingTrack(res.data);
      setPlaylist((prev) => {
        if (!prev) return prev;
        const updated = prev.tracks.map((t) =>
          t.id === res.data.id ? { ...t, ...res.data } : t
        );
        return { ...prev, tracks: updated };
      });
    } catch (err) {
    }
  };

  const handleLocalReorder = async (orderedIds) => {
    setHasCustomTrackOrder(true);
    setPlaylist((prev) => {
      if (!prev || !Array.isArray(prev.tracks)) return prev;
      const idToTrack = new Map(prev.tracks.map((track) => [String(track.id), track]));
      const ordered = orderedIds
        .map((id) => idToTrack.get(String(id)))
        .filter(Boolean);
      const remaining = prev.tracks.filter((track) => !orderedIds.includes(track.id));
      const nextTracks = [...ordered, ...remaining];
      return { ...prev, tracks: nextTracks };
    });

    try {
      await reorderPlaylistTracks(id, orderedIds);
    } catch (error) {
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-vibe-black flex items-center justify-center pb-32">
        <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-vibe-black flex items-center justify-center pb-32">
        <div className="text-center">
          <p className="text-[#888] mb-4">playlist not found</p>
          <button
            onClick={() => navigate('/playlists')}
            className="px-6 py-3 rounded-2xl bg-vibe-gold text-vibe-black hover:bg-[#ffcc40] transition-colors lowercase"
          >
            back to playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header - title centered on screen */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe">
        <div className="relative flex items-center justify-center px-4 py-3" style={{ minHeight: '44px' }}>
          {/* Back button - left side */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 text-white hover:text-vibe-gold transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {/* Title - centered on screen, auto-sized to fit */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-20">
            <AutoSizeText
              text={playlist.name}
              maxSize={20}
              minSize={12}
              className="text-center"
            />
          </div>
          {/* Actions - right side */}
          <div className="absolute right-4 flex items-center gap-1">
            {playlist.tracks && playlist.tracks.length > 0 && (
              <button
                onClick={handleShufflePlay}
                className="p-2 inline-flex items-center justify-center rounded-full hover:bg-white/5"
                aria-label="shuffle play"
              >
                <Shuffle className="w-5 h-5 text-[#f5af12]" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 transition-colors inline-flex items-center justify-center rounded-full hover:bg-white/5"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {playlist.description && (
          <p className="text-sm text-[#888] mb-2 px-4">{playlist.description}</p>
        )}
      </div>

      {/* Search */}
      {playlist.tracks && playlist.tracks.length > 0 && (
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search tracks in this playlist..."
              className="w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-white/60 mt-2">
              {filteredTracks.length} of {playlist.tracks.length} tracks match
            </p>
          )}
        </div>
      )}

      {/* Tracks */}
      <div className="px-4">
        {!playlist.tracks || playlist.tracks.length === 0 ? (
          <div className="text-center py-12 text-white">
            <p>no tracks in this playlist</p>
            <p className="text-[#888] text-sm mt-2">add tracks from any view</p>
          </div>
        ) : (
          <TrackList
            tracks={filteredTracks}
            sortable={!searchTerm}
            onReorder={!searchTerm ? handleLocalReorder : undefined}
            onContextMenu={handleContextMenu}
            onLongPress={handleLongPress}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          onClose={() => setContextMenu(null)}
          onEdit={(track) => {
            setEditingTrack(track);
            setShowEdit(true);
          }}
          onAddToQueue={addToQueue}
          onDownload={handleDownload}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.some((f) => f.id === contextMenu.track?.id)}
          onRemoveFromPlaylist={(track) => handleRemoveTrack(track.id)}
          onSearchCover={handleSearchCover}
          onAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
          showRemoveOption={true}
        />
      )}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        track={addToPlaylistTrack}
        isOpen={!!addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
        onAdded={(playlistId) => {
          setAddToPlaylistTrack(null);
          if (String(playlistId) === String(id)) {
            loadPlaylist();
          }
        }}
      />

      {/* Cover Search Modal */}
      <CoverSearchModal
        track={coverSearchTrack}
        isOpen={showCoverSearch}
        onClose={() => setShowCoverSearch(false)}
        onCoverApplied={handleCoverApplied}
      />

      {/* Track Edit Modal */}
      <TrackEditModal
        isOpen={showEdit}
        track={editingTrack}
        onClose={() => setShowEdit(false)}
        onSave={saveTrack}
      />
    </div>
  );
}
