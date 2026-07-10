import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Search, GripVertical, ListMusic, Disc3, Plus, Loader2 as Loader, Trash2 } from '../icons.jsx';
import { usePlayerStore } from '../store';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageWithFallback from './ImageWithFallback';
import { resolveMediaUrl, searchTracks, getPlaylists, getPlaylist, getAlbums } from '../api';

function SortableQueueItem({ queueItem, isCurrent, onPlay, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(queueItem.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 50ms ease-out',
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const label = queueItem.track.title || queueItem.track.filename || 'unknown';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-xl ${
        isCurrent ? 'bg-[#2a1f0f] border border-[#f6b012]' : 'bg-[#111] hover:bg-[#181818]'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1.5 text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        aria-label="drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Track info (tappable to play) */}
      <button
        type="button"
        onClick={() => onPlay(queueItem)}
        className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
      >
        <ImageWithFallback
          src={resolveMediaUrl(queueItem.track.cover_art_url)}
          alt={queueItem.track.album || label}
          fallbackText={label}
          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
          eager={isCurrent}
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#f6b012]' : 'text-white'}`}>
            {label}
          </p>
          <p className="text-[11px] text-white/40 truncate">
            {queueItem.track.artist || 'unknown'}
            {queueItem.track.album && (
              <span className="text-white/25"> · {queueItem.track.album}</span>
            )}
          </p>
        </div>
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(queueItem.id)}
        className="p-1.5 text-white/25 hover:text-red-400 flex-shrink-0"
        aria-label="remove"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function QueueModal({ onClose }) {
  const {
    queue,
    currentQueueIndex,
    playTrack,
    removeFromQueue,
    reorderQueueItem,
    addToQueue,
    loadQueue,
    clearQueue,
  } = usePlayerStore((state) => ({
    queue: state.queue,
    currentQueueIndex: state.currentQueueIndex,
    playTrack: state.playTrack,
    removeFromQueue: state.removeFromQueue,
    reorderQueueItem: state.reorderQueueItem,
    addToQueue: state.addToQueue,
    loadQueue: state.loadQueue,
    clearQueue: state.clearQueue,
  }));

  const [queueItems, setQueueItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searched yet
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null); // id of item being added
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'add'

  const normalizedQueue = useMemo(() => (Array.isArray(queue) ? queue : []), [queue]);

  useEffect(() => {
    setQueueItems(normalizedQueue);
  }, [normalizedQueue]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [tracksRes, playlistsRes, albumsRes] = await Promise.allSettled([
          searchTracks(searchQuery),
          getPlaylists(),
          getAlbums(),
        ]);

        const tracks = tracksRes.status === 'fulfilled'
          ? (Array.isArray(tracksRes.value?.data) ? tracksRes.value.data : [])
          : [];

        const allPlaylists = playlistsRes.status === 'fulfilled'
          ? (Array.isArray(playlistsRes.value?.data) ? playlistsRes.value.data : [])
          : [];

        const allAlbums = albumsRes.status === 'fulfilled'
          ? (Array.isArray(albumsRes.value?.data) ? albumsRes.value.data : [])
          : [];

        const q = searchQuery.toLowerCase();

        const playlists = allPlaylists.filter(
          (p) => p.name?.toLowerCase().includes(q)
        );

        const albums = allAlbums.filter(
          (a) => (a.album || a.name || '').toLowerCase().includes(q) ||
                 (a.artist || '').toLowerCase().includes(q)
        );

        setSearchResults({ tracks: tracks.slice(0, 20), playlists, albums: albums.slice(0, 10) });
      } catch {
        setSearchResults({ tracks: [], playlists: [], albums: [] });
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 0, tolerance: 3 } })
  );

  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIdx = queueItems.findIndex((i) => String(i.id) === String(active.id));
    const newIdx = queueItems.findIndex((i) => String(i.id) === String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;

    const reordered = arrayMove(queueItems, oldIdx, newIdx);
    setQueueItems(reordered);
    await reorderQueueItem(Number(active.id), newIdx);
    await loadQueue();
  }, [queueItems, reorderQueueItem, loadQueue]);

  const handlePlay = useCallback((queueItem) => {
    const idx = queueItems.findIndex((i) => i.id === queueItem.id);
    if (idx >= 0) playTrack(queueItem.track, idx);
  }, [queueItems, playTrack]);

  const handleRemove = useCallback(async (id) => {
    await removeFromQueue(id);
    await loadQueue();
  }, [removeFromQueue, loadQueue]);

  const handleAddTrack = useCallback(async (track) => {
    setAdding(`track-${track.id}`);
    try {
      await addToQueue(track);
      await loadQueue();
    } finally {
      setAdding(null);
    }
  }, [addToQueue, loadQueue]);

  const handleAddPlaylist = useCallback(async (playlist) => {
    setAdding(`playlist-${playlist.id}`);
    try {
      const res = await getPlaylist(playlist.id);
      const tracks = Array.isArray(res?.data?.tracks) ? res.data.tracks : [];
      for (const track of tracks) {
        await addToQueue(track);
      }
      await loadQueue();
    } finally {
      setAdding(null);
    }
  }, [addToQueue, loadQueue]);

  const handleAddAlbum = useCallback(async (album) => {
    const key = `album-${album.album || album.name}`;
    setAdding(key);
    try {
      // Search for all tracks in this album
      const res = await searchTracks(album.album || album.name || '');
      const tracks = Array.isArray(res?.data) ? res.data : [];
      const albumTracks = tracks.filter(
        (t) => (t.album || '').toLowerCase() === (album.album || album.name || '').toLowerCase()
      );
      for (const track of albumTracks) {
        await addToQueue(track);
      }
      await loadQueue();
    } finally {
      setAdding(null);
    }
  }, [addToQueue, loadQueue]);

  const hasResults = searchResults && (
    searchResults.tracks.length > 0 ||
    searchResults.playlists.length > 0 ||
    searchResults.albums.length > 0
  );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[60] flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-[#0a0a0a] border-t-2 border-[#f6b012] rounded-t-3xl max-h-[85vh] flex flex-col z-10">
        {/* Handle bar */}
        <div className="flex justify-center pt-2.5 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-2 pb-2 flex-shrink-0">
          <ListMusic className="w-5 h-5 text-[#f6b012] flex-shrink-0" />
          <h2 className="text-white font-semibold flex-1 text-base">queue</h2>
          <span className="text-white/30 text-xs mr-2">{queueItems.length} tracks</span>
          {queueItems.length > 0 && (
            <button
              onClick={async () => { await clearQueue(); }}
              className="p-1.5 text-white/30 hover:text-red-400"
              aria-label="clear queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search to add */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            {searching && (
              <Loader className="w-3.5 h-3.5 text-[#f6b012] absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search to add songs, albums, playlists…"
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#f6b012] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search results OR queue list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
          {searchQuery.trim() && searchResults !== null ? (
            // Search results
            <div className="space-y-4">
              {!hasResults && !searching && (
                <p className="text-center text-white/30 text-sm py-6">no results</p>
              )}

              {/* Playlists */}
              {searchResults.playlists.length > 0 && (
                <div>
                  <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1.5">playlists</p>
                  <div className="space-y-1">
                    {searchResults.playlists.map((pl) => (
                      <div key={pl.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#111] hover:bg-[#181818]">
                        <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                          <ListMusic className="w-4 h-4 text-[#f6b012]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{pl.name}</p>
                          <p className="text-[11px] text-white/30">{pl.track_count || '?'} tracks</p>
                        </div>
                        <button
                          onClick={() => handleAddPlaylist(pl)}
                          disabled={adding === `playlist-${pl.id}`}
                          className="p-2 rounded-full bg-[#f6b012]/10 text-[#f6b012] hover:bg-[#f6b012]/20 disabled:opacity-40"
                          aria-label={`add playlist ${pl.name}`}
                        >
                          {adding === `playlist-${pl.id}`
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Plus className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Albums */}
              {searchResults.albums.length > 0 && (
                <div>
                  <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1.5">albums</p>
                  <div className="space-y-1">
                    {searchResults.albums.map((al, idx) => {
                      const name = al.album || al.name || 'unknown album';
                      const key = `album-${name}-${idx}`;
                      const addKey = `album-${name}`;
                      return (
                        <div key={key} className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#111] hover:bg-[#181818]">
                          {al.cover_art_url ? (
                            <img src={resolveMediaUrl(al.cover_art_url)} alt={name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                              <Disc3 className="w-4 h-4 text-[#f6b012]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{name}</p>
                            <p className="text-[11px] text-white/30 truncate">{al.artist || 'unknown artist'}</p>
                          </div>
                          <button
                            onClick={() => handleAddAlbum(al)}
                            disabled={adding === addKey}
                            className="p-2 rounded-full bg-[#f6b012]/10 text-[#f6b012] hover:bg-[#f6b012]/20 disabled:opacity-40"
                            aria-label={`add album ${name}`}
                          >
                            {adding === addKey
                              ? <Loader className="w-4 h-4 animate-spin" />
                              : <Plus className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracks */}
              {searchResults.tracks.length > 0 && (
                <div>
                  <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1.5">tracks</p>
                  <div className="space-y-1">
                    {searchResults.tracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-[#111] hover:bg-[#181818]">
                        <ImageWithFallback
                          src={resolveMediaUrl(track.cover_art_url)}
                          alt={track.album || track.title}
                          fallbackText={track.title || track.filename}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{track.title || track.filename}</p>
                          <p className="text-[11px] text-white/30 truncate">
                            {track.artist || 'unknown'}
                            {track.album && <span className="text-white/20"> · {track.album}</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddTrack(track)}
                          disabled={adding === `track-${track.id}`}
                          className="p-2 rounded-full bg-[#f6b012]/10 text-[#f6b012] hover:bg-[#f6b012]/20 disabled:opacity-40"
                          aria-label={`add ${track.title}`}
                        >
                          {adding === `track-${track.id}`
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Plus className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Current queue
            queueItems.length === 0 ? (
              <div className="py-12 text-center">
                <ListMusic className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">queue is empty</p>
                <p className="text-white/20 text-xs mt-1">search above to add songs</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={queueItems.map((i) => String(i.id))} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {queueItems.map((item) => (
                      <SortableQueueItem
                        key={item.id}
                        queueItem={item}
                        isCurrent={queueItems.indexOf(item) === currentQueueIndex}
                        onPlay={handlePlay}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )
          )}
        </div>
      </div>
    </div>
  );
}
