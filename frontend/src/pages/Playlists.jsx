import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist, resolveMediaUrl } from '../api';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Music, Trash2, Search, WifiOff, Zap } from '../icons.jsx';
import {
  DndContext,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// use-long-press disabled for webview compatibility testing
// import { useLongPress } from 'use-long-press';
import ImageWithFallback from '../components/ImageWithFallback';
import PlaylistContextMenu from '../components/PlaylistContextMenu';
import { triggerImpact } from '../utils/haptics';
import { useDataSaver } from '../context/DataSaverContext';
import { truncateText } from '../utils/text';
import PlaylistDownloadButton from '../components/PlaylistDownloadButton.jsx';
import QuickPlaylistDownload from '../components/QuickPlaylistDownload.jsx';

const LS_KEY = 'music_playlists_order';

function SortablePlaylistCard({ playlist, onOpen, onEdit, suppressTap, isDropTarget }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(playlist.id),
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
    outline: (!isDragging && isDropTarget) ? '2px solid #F6B012' : undefined,
    outlineOffset: (!isDragging && isDropTarget) ? '3px' : undefined,
    borderRadius: (!isDragging && isDropTarget) ? '18px' : undefined,
  };

  const longPressBinder = {}; // useLongPress disabled
  const didDragRef = useRef(false);

  useEffect(() => {
    if (isDragging) didDragRef.current = true;
  }, [isDragging]);

  const handleOpen = () => {
    if (suppressTap || didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onOpen(playlist.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: 'pan-y' }}
      className={`cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging ? 'scale-[1.02] rotate-[1deg] opacity-95' : isDropTarget ? 'scale-[1.04]' : 'scale-100'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          didDragRef.current = false;
          listeners.onPointerDown?.(e);
        }}
        onPointerUp={(e) => {
          listeners.onPointerUp?.(e);
          handleOpen();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onEdit(playlist, e);
        }}
        role="button"
        tabIndex={0}
        className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333] relative select-none group"
        style={{ touchAction: 'pan-y' }}
      >
        <ImageWithFallback
          src={resolveMediaUrl(playlist.cover_image)}
          alt={playlist.name}
          fallbackText={playlist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 pointer-events-none">
        </div>
        
        {/* Download button overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PlaylistDownloadButton playlist={playlist} compact={true} />
        </div>
      </div>
 <div className="mt-2 px-1">
 <h3 className="text-sm text-white font-semibold text-center leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{playlist.name}</h3>
 <p className="text-xs text-white/60 truncate text-center">
 {truncateText(playlist.description || 'playlist', 30)}
 </p>
 </div>
    </div>
  );
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [sortedPlaylists, setSortedPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFolderPath, setEditFolderPath] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editCoverSource, setEditCoverSource] = useState('url'); // 'file' or 'url'
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newFolderPath, setNewFolderPath] = useState('');
  const [newCover, setNewCover] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Client-side filtering for playlists
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPlaylists = sortedPlaylists.filter((playlist) =>
    playlist.name && playlist.name.toLowerCase().includes(normalizedSearch)
  );

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuPlaylist, setContextMenuPlaylist] = useState(null);
  const navigate = useNavigate();
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const [suppressPlaylistTap, setSuppressPlaylistTap] = useState(false);
  const [playlistOverId, setPlaylistOverId] = useState(null);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 350,
        tolerance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadPlaylists = useCallback(async () => {
    if (shouldDeferNetwork) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getPlaylists();
      // Handle both axios response format and direct array
      const fetched = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      setPlaylists(fetched);
      // Restore saved order from localStorage, but validate against fetched data
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        if (saved.length > 0) {
          const fetchedIds = new Set(fetched.map(p => String(p.id)));
          const validSaved = saved.filter(id => fetchedIds.has(String(id)));
          
          // If cache has entries not in fetched data, clear it
          if (validSaved.length !== saved.length) {
            localStorage.removeItem(LS_KEY);
            setSortedPlaylists(fetched); // Use backend order (by folder_path)
          } else {
            const idToPlaylist = Object.fromEntries(fetched.map((p) => [String(p.id), p]));
            const ordered = validSaved.map((id) => idToPlaylist[String(id)]).filter(Boolean);
            const remaining = fetched.filter((p) => !validSaved.includes(p.id));
            setSortedPlaylists([...ordered, ...remaining]);
          }
        } else {
          setSortedPlaylists(fetched); // Use backend order (by folder_path)
        }
      } catch {
        // Invalid cache, clear it
        localStorage.removeItem(LS_KEY);
        setSortedPlaylists(fetched); // Use backend order (by folder_path)
      }
    } catch (error) {
      setPlaylists([]);
      setSortedPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [shouldDeferNetwork]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleDragEnd = (event) => {
    setPlaylistOverId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedPlaylists.findIndex((p) => String(p.id) === active.id);
      const newIndex = sortedPlaylists.findIndex((p) => String(p.id) === over.id);
      const reordered = arrayMove(sortedPlaylists, oldIndex, newIndex);
      setSortedPlaylists(reordered);
      localStorage.setItem(LS_KEY, JSON.stringify(reordered.map((p) => p.id)));
    }

    setTimeout(() => {
      setSuppressPlaylistTap(false);
    }, 140);
  };

  const handleDragStart = () => {
    setSuppressPlaylistTap(true);
  };

  const handleDragCancel = () => {
    setPlaylistOverId(null);
    setTimeout(() => {
      setSuppressPlaylistTap(false);
    }, 140);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || shouldDeferNetwork) return;

    try {
      setCreating(true);
      await createPlaylist({ name: newPlaylistName, folder_path: newFolderPath || null, cover_image: newCover || null });
      setNewPlaylistName('');
      setNewCover('');
      setShowCreateModal(false);
      loadPlaylists();
    } catch (error) {
    } finally {
      setCreating(false);
    }
  };

  const handleEditPlaylist = async (e) => {
    e.preventDefault();
    if (!editName.trim() || shouldDeferNetwork) return;

    try {
      setSaving(true);
      await updatePlaylist(editingPlaylist.id, {
        name: editName,
        folder_path: editFolderPath || null,
        cover_image: editCoverImage || null
      });
      setShowEditModal(false);
      setEditingPlaylist(null);
      loadPlaylists();
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (shouldDeferNetwork) return;
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deletePlaylist(id);
      setShowEditModal(false);
      setEditingPlaylist(null);
      loadPlaylists();
    } catch (error) {
    }
  };

  const openContextMenu = (playlist, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setContextMenuPlaylist(playlist);
    setContextMenuPosition({
      x: e?.clientX || window.innerWidth / 2,
      y: e?.clientY || window.innerHeight / 2,
    });
    setShowContextMenu(true);
  };

  const closeContextMenu = () => {
    setShowContextMenu(false);
    setContextMenuPlaylist(null);
  };

  const handleEditName = (playlist) => {
    setEditingPlaylist(playlist);
    setEditName(playlist.name);
    setEditFolderPath(playlist.folder_path || '');
    setEditCoverImage(playlist.cover_image || '');
    if (playlist.cover_image && playlist.cover_image.startsWith('data:')) {
      setEditCoverSource('file');
    } else {
      setEditCoverSource('url');
    }
    setShowEditModal(true);
  };

  const handleEditCover = (playlist) => {
    setEditingPlaylist(playlist);
    setEditName(playlist.name);
    setEditFolderPath(playlist.folder_path || '');
    setEditCoverImage(playlist.cover_image || '');
    if (playlist.cover_image && playlist.cover_image.startsWith('data:')) {
      setEditCoverSource('file');
    } else {
      setEditCoverSource('url');
    }
    setShowEditModal(true);
  };

  const handleDeleteFromMenu = (playlist) => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      handleDeletePlaylist(playlist.id);
    }
  };

  const handleOpenPlaylist = (playlistId) => {
    triggerImpact('light');
    navigate(`/playlists/${playlistId}`);
  };

  return (
    <div className="min-h-screen bg-vibe-black pb-32 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe ">
        <div className="px-4 py-0">
          <div className="relative flex items-center justify-between">
            <div className="w-8"></div>
            <div className="text-center absolute left-1/2 -translate-x-1/2">
              <h1 className="text-2xl font-bold text-vibe-gold">playlists</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`p-3 rounded-full transition-colors flex items-center justify-center ${
                shouldDeferNetwork ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              disabled={shouldDeferNetwork}
            >
              <Plus className="w-6 h-6" style={{ color: shouldDeferNetwork ? '#666' : '#f6b012' }} />
            </button>
          </div>

          {shouldDeferNetwork && (
            <p className="text-xs text-red-200 mt-1 flex items-center gap-1">
              <WifiOff className="w-4 h-4" /> offline mode pauses playlist changes
            </p>
          )}
          <div className="relative mt-3">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search playlists"
              className="w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Quick Download Section */}
      <div className="px-4 pt-4">
        <QuickPlaylistDownload hideWhenEmpty={true} />
      </div>

      {/* Main Content */}
      <div className="px-4 flex-1 overflow-y-auto pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-[#414141] mx-auto mb-4" />
            <p className="text-white mb-2">
              {normalizedSearch ? 'No playlists match your search' : 'No playlists yet'}
            </p>
            {!normalizedSearch && (
              <p className="text-white text-sm">Create your first playlist to get started</p>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={({ over }) => setPlaylistOverId(over?.id ?? null)}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={filteredPlaylists.map((p) => String(p.id))}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4">
                {filteredPlaylists.map((playlist) => (
                  <SortablePlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onOpen={handleOpenPlaylist}
                    onEdit={openContextMenu}
                    suppressTap={suppressPlaylistTap}
                    isDropTarget={String(playlist.id) === playlistOverId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Context Menu - render at root level with high z-index */}
      {showContextMenu && contextMenuPlaylist && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="pointer-events-auto">
            <PlaylistContextMenu
              x={contextMenuPosition.x}
              y={contextMenuPosition.y}
              playlist={contextMenuPlaylist}
              onClose={closeContextMenu}
              onEditName={handleEditName}
              onEditCover={handleEditCover}
              onDelete={handleDeleteFromMenu}
            />
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-vibe-black rounded-3xl p-6 w-full max-w-md border-2 border-vibe-gold"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-vibe-gold mb-4">new playlist</h2>

            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                placeholder="playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] placeholder-lowercase border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors mb-4"
                autoFocus
              />
              <input
                type="text"
                placeholder="folder path (e.g. chill/evening)"
                value={newFolderPath}
                onChange={(e) => setNewFolderPath(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] placeholder-lowercase border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors mb-4"
              />
              <div className="mb-4">
                <label className="text-[#888] text-sm mb-2 block lowercase">cover image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setNewCover(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-white"
                />
                {newCover && (
                  <div className="mt-2">
                    <img src={newCover} alt="Playlist cover preview" className="w-24 h-24 rounded-xl object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                    setNewCover('');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors lowercase"
                  disabled={creating}
                >
                  cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-vibe-gold text-vibe-black transition-colors font-semibold disabled:opacity-50"
                  disabled={creating || !newPlaylistName.trim() || shouldDeferNetwork}
                >
                  {creating ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'create'
                  )}
                </button>
              </div>
              {shouldDeferNetwork && (
                <p className="text-xs text-red-200 mt-2 flex items-center gap-1">
                  <WifiOff className="w-4 h-4" /> go back online to add playlists
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && editingPlaylist && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-vibe-black rounded-3xl p-6 w-full max-w-md border-2 border-vibe-gold"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-vibe-gold mb-4">edit playlist</h2>

            <form onSubmit={handleEditPlaylist}>
              <div className="mb-4">
                <label className="text-[#888] text-sm mb-2 block lowercase">playlist name</label>
                <input
                  type="text"
                  placeholder="playlist name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="text-[#888] text-sm mb-2 block lowercase">folder path</label>
                <input
                  type="text"
                  placeholder="e.g. chill/evening"
                  value={editFolderPath}
                  onChange={(e) => setEditFolderPath(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#888] text-sm mb-2 block lowercase">cover image</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEditCoverSource('file')}
                    className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                      editCoverSource === 'file' ? 'bg-vibe-gold text-vibe-black' : 'bg-[#1a1a1a] text-white'
                    }`}
                  >
                    upload file
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCoverSource('url')}
                    className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                      editCoverSource === 'url' ? 'bg-vibe-gold text-vibe-black' : 'bg-[#1a1a1a] text-white'
                    }`}
                  >
                    from url
                  </button>
                </div>
                {editCoverSource === 'file' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setEditCoverImage(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-white"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
                  />
                )}
                {editCoverImage && (
                  <div className="mt-2">
                    <img src={editCoverImage} alt="Playlist cover preview" className="w-24 h-24 rounded-xl object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlaylist(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors"
                  disabled={saving}
                >
                  cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-vibe-gold text-vibe-black transition-colors font-semibold disabled:opacity-50"
                  disabled={saving || !editName.trim() || shouldDeferNetwork}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'save'
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDeletePlaylist(editingPlaylist.id)}
                className="w-full py-3 rounded-2xl bg-red-900 text-red-400 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={saving || shouldDeferNetwork}
              >
                <Trash2 className="w-5 h-5" />
                delete playlist
              </button>
              {shouldDeferNetwork && (
                <p className="text-xs text-red-200 mt-2 flex items-center gap-1">
                  <WifiOff className="w-4 h-4" /> editing is paused while offline
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
