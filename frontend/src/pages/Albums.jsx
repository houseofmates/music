import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlbums, mergeAlbums, uploadAlbumCover, resolveMediaUrl } from '../api';
import { useLiveSearch } from '../hooks/useLiveSearch';
import AlbumEditModal from '../components/AlbumEditModal';
import { Loader2, Disc3, Search, Layers3, Check, X, WifiOff, Zap } from '../icons.jsx';
import { truncateText } from '../utils/text';
import {
  DndContext,
  PointerSensor,
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
import { triggerImpact } from '../utils/haptics';
import { useDataSaver } from '../context/DataSaverContext';

const LS_KEY = 'music_albums_order';

function albumKey(album) {
  return `${album.album}||${album.artist}`;
}

function SortableAlbumCard({ album, albumKey: key, onEdit, onOpen, suppressTap, selectionMode, isSelected, onToggleSelection, isDropTarget }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: key,
    disabled: selectionMode,
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
  const albumData = { album: album.album, artist: album.artist, cover_art_url: album.cover_art_url };

  const handleOpen = (event) => {
    if (selectionMode) {
      event?.preventDefault?.();
      onToggleSelection(albumData);
      return;
    }
    if (suppressTap || isDragging) {
      event?.preventDefault?.();
      return;
    }
    onOpen(albumData);
  };

 return (
 <div
 ref={setNodeRef}
 style={{ ...style, touchAction: 'pan-y' }}
 className={`relative select-none cursor-grab active:cursor-grabbing ${
 isDragging ? 'scale-[1.02] rotate-[1deg] opacity-95' : isDropTarget ? 'scale-[1.04]' : 'scale-100'
 }`}
 onClick={handleOpen}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 handleOpen(e);
 }
 }}
 onContextMenu={(e) => {
 e.preventDefault();
 if (selectionMode) {
 onToggleSelection(albumData);
 } else {
 onEdit(albumData, e);
 }
 }}
 role="button"
 tabIndex={0}
 >
 <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333] relative select-none">
 <ImageWithFallback
 src={resolveMediaUrl(album.cover_art_url)}
 alt={album.album}
 fallbackText={album.album}
 className="w-full h-full object-cover"
 />
 <div className="absolute inset-0 pointer-events-none">
 {album.year && (
 <div className="absolute bottom-2 left-2 flex items-center text-[10px] gap-2">
 <span className="inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-white font-medium">
 {album.year}
 </span>
 </div>
 )}
 </div>
 </div>
 <div className="mt-2 px-1">
          <h3 className="text-sm text-white font-semibold text-center leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{album.album}</h3>
          <p className="text-xs text-white/60 truncate text-center">{truncateText(album.artist || 'unknown artist', 30)}</p>
 </div>
 {selectionMode && (
 <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
 {isSelected ? <Check className="h-4 w-4 text-vibe-gold" /> : <div className="h-3.5 w-3.5 rounded-full border border-[#888]" />}
 </div>
 )}
 </div>
 );
}

export default function Albums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [sortedAlbums, setSortedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showAlbumEdit, setShowAlbumEdit] = useState(false);
  // Live search for albums
  const {
    query: searchTerm,
    setQuery: setSearchTerm,
    results: searchResults,
    loading: searchLoading,
    error: searchError
  } = useLiveSearch(
    (query) => {
      // Client-side filtering for albums
      return albums.filter(album => 
        album.album.toLowerCase().includes(query.toLowerCase()) ||
        album.artist.toLowerCase().includes(query.toLowerCase())
      );
    },
    { debounceMs: 200, minQueryLength: 1 }
  );
  const [suppressAlbumTap, setSuppressAlbumTap] = useState(false);
  const [albumOverId, setAlbumOverId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAlbumKeys, setSelectedAlbumKeys] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTargetAlbum, setMergeTargetAlbum] = useState('');
  const [mergeTargetArtist, setMergeTargetArtist] = useState('');
  const [merging, setMerging] = useState(false);
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const lowDataActive = Boolean(dataSaver?.effectiveLowData);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadAlbums = useCallback(async () => {
    if (shouldDeferNetwork) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getAlbums();
      const fetched = Array.isArray(response?.data) ? response.data : [];
      setAlbums(fetched);
      
      // Validate localStorage cache against fetched data
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        if (saved.length > 0) {
          const fetchedKeys = new Set(fetched.map(albumKey));
          const validSaved = saved.filter(k => fetchedKeys.has(k));
          
          // If cache has entries not in fetched data, it's stale - clear it
          if (validSaved.length !== saved.length) {
            localStorage.removeItem(LS_KEY);
            setSortedAlbums(fetched);
          } else {
            // Cache is valid, use it for ordering
            const keyToAlbum = Object.fromEntries(fetched.map((a) => [albumKey(a), a]));
            const ordered = validSaved.map((k) => keyToAlbum[k]).filter(Boolean);
            const remaining = fetched.filter((a) => !validSaved.includes(albumKey(a)));
            setSortedAlbums([...ordered, ...remaining]);
          }
        } else {
          setSortedAlbums(fetched);
        }
      } catch {
        // Invalid cache, clear it
        localStorage.removeItem(LS_KEY);
        setSortedAlbums(fetched);
      }
    } catch (error) {
      setAlbums([]);
      setSortedAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [shouldDeferNetwork]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleDragEnd = (event) => {
    setAlbumOverId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedAlbums.findIndex((a) => albumKey(a) === active.id);
      const newIndex = sortedAlbums.findIndex((a) => albumKey(a) === over.id);
      const reordered = arrayMove(sortedAlbums, oldIndex, newIndex);
      setSortedAlbums(reordered);
      localStorage.setItem(LS_KEY, JSON.stringify(reordered.map(albumKey)));
    }

    setTimeout(() => {
      setSuppressAlbumTap(false);
    }, 140);
  };

  const handleDragStart = () => {
    setSuppressAlbumTap(true);
  };

  const handleDragCancel = () => {
    setAlbumOverId(null);
    setTimeout(() => {
      setSuppressAlbumTap(false);
    }, 140);
  };

  const handleEditAlbumClick = (albumData, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (shouldDeferNetwork) {
      return;
    }
    setEditingAlbum(albumData);
    setShowAlbumEdit(true);
  };

  const handleSaveAlbum = async (data) => {
    if (!editingAlbum) return;
    if (shouldDeferNetwork) return;
    try {
      if (data.coverFile) {
        // upload cover for album
        await uploadAlbumCover(editingAlbum.album, editingAlbum.artist, data.coverFile);
      }
      // if name/artist edited we could re-fetch list
      setEditingAlbum(null);
      setShowAlbumEdit(false);
      loadAlbums();
    } catch (err) {
    }
  };

  // Use searchResults from live search hook

  const selectedAlbums = searchResults.filter((album) => selectedAlbumKeys.includes(albumKey(album)));

  const handleOpenAlbum = (albumData) => {
    triggerImpact('light');
    navigate(`/albums/${encodeURIComponent(albumData.album)}?artist=${encodeURIComponent(albumData.artist)}`);
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedAlbumKeys([]);
      }
      return next;
    });
  };

  const toggleAlbumSelection = (albumData) => {
    const key = albumKey(albumData);
    setSelectedAlbumKeys((current) =>
      current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key]
    );
  };

  const openMergeModal = () => {
    if (selectedAlbums.length < 2 || shouldDeferNetwork) {
      return;
    }
    setMergeTargetAlbum(selectedAlbums[0]?.album || '');
    setMergeTargetArtist(selectedAlbums[0]?.artist || '');
    setShowMergeModal(true);
  };

  const handleMergeSelectedAlbums = async (e) => {
    e.preventDefault();
    if (selectedAlbums.length < 2 || !mergeTargetAlbum.trim() || shouldDeferNetwork) {
      return;
    }

    try {
      setMerging(true);
      await mergeAlbums({
        source_albums: selectedAlbums.map((album) => ({
          album: album.album,
          artist: album.artist,
        })),
        target_album: mergeTargetAlbum.trim(),
        target_artist: mergeTargetArtist.trim() || null,
      });
      setShowMergeModal(false);
      setSelectionMode(false);
      setSelectedAlbumKeys([]);
      await loadAlbums();
    } catch (error) {
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-vibe-black pb-32 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe ">
        <div className="px-4 py-0">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8"></div>
            <h1 className="text-2xl font-bold text-vibe-gold text-center">albums</h1>
            {!loading && (
              <div className="flex items-center gap-2">
                {selectionMode && (
                  <button
                    type="button"
                    onClick={openMergeModal}
                    disabled={selectedAlbums.length < 2 || shouldDeferNetwork}
                    className="rounded-xl bg-vibe-gold px-3 py-2 text-sm font-medium text-vibe-black transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    merge
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (shouldDeferNetwork) return;
                    toggleSelectionMode();
                  }}
                  className={`inline-flex items-center justify-center rounded-xl p-2 transition-colors ${
                    selectionMode ? 'bg-[#1a1a1a] text-white' : 'bg-[#111] text-[#9b9b9b] hover:bg-[#1a1a1a]'
                  } ${shouldDeferNetwork ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={shouldDeferNetwork}
                >
                  {selectionMode ? <X className="h-4 w-4" /> : <Layers3 className="h-4 w-4" />}
                </button>
              </div>
            )}
            {loading && <div className="w-8"></div>}
          </div>
          {shouldDeferNetwork && (
            <p className="text-xs text-red-200 -mt-2 mb-2 flex items-center gap-1">
              <WifiOff className="w-4 h-4" /> offline mode pauses album changes
            </p>
          )}
          {!shouldDeferNetwork && lowDataActive && (
            <p className="text-xs text-yellow-200 -mt-2 mb-2 flex items-center gap-1">
              <Zap className="w-4 h-4" /> low data mode may delay cover refresh
            </p>
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search albums or artists"
              className="w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
    <div className="px-4 flex-1 overflow-y-auto pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12 text-white">
            <p>no albums match your search</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={({ over }) => setAlbumOverId(over?.id ?? null)}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={searchResults.map(albumKey)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4">
                {searchResults.map((album) => (
                  <SortableAlbumCard
                    key={albumKey(album)}
                    album={album}
                    albumKey={albumKey(album)}
                    onOpen={handleOpenAlbum}
                    onEdit={handleEditAlbumClick}
                    suppressTap={suppressAlbumTap}
                    selectionMode={selectionMode}
                    isSelected={selectedAlbumKeys.includes(albumKey(album))}
                    onToggleSelection={toggleAlbumSelection}
                    isDropTarget={albumKey(album) === albumOverId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <AlbumEditModal 
          isOpen={showAlbumEdit}
          albumData={editingAlbum}
          onClose={() => {
            setShowAlbumEdit(false);
            setEditingAlbum(null);
          }}
          onSave={handleSaveAlbum}
        />

        {showMergeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
            onClick={() => setShowMergeModal(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl border-2 border-vibe-gold bg-vibe-black p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-2 text-2xl font-bold text-vibe-gold">merge albums</h2>
              <p className="mb-4 text-sm text-[#888]">
                combining {searchResults.length} album groups into one album
              </p>

              <form onSubmit={handleMergeSelectedAlbums}>
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-[#888]">target album name</label>
                  <input
                    type="text"
                    value={mergeTargetAlbum}
                    onChange={(e) => setMergeTargetAlbum(e.target.value)}
                    className="w-full rounded-2xl border-2 border-transparent bg-[#1a1a1a] px-4 py-3 text-white focus:border-vibe-gold focus:outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-sm text-[#888]">target album artist</label>
                  <input
                    type="text"
                    value={mergeTargetArtist}
                    onChange={(e) => setMergeTargetArtist(e.target.value)}
                    placeholder="main album artist"
                    className="w-full rounded-2xl border-2 border-transparent bg-[#1a1a1a] px-4 py-3 text-white placeholder:text-[#666] focus:border-vibe-gold focus:outline-none"
                  />
                </div>

                <div className="mb-5 rounded-2xl bg-[#111] p-3 text-sm text-white">
                  {selectedAlbums.map((album) => (
                    <div key={albumKey(album)} className="truncate">
                      {album.album} • {album.artist}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMergeModal(false)}
                    className="flex-1 rounded-2xl bg-[#1a1a1a] py-3 text-white hover:bg-[#252525]"
                    disabled={merging}
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-vibe-gold py-3 font-semibold text-vibe-black hover:bg-[#ffcc40] disabled:opacity-50"
                    disabled={merging || selectedAlbums.length < 2 || !mergeTargetAlbum.trim()}
                  >
                    {merging ? 'merging...' : 'merge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
