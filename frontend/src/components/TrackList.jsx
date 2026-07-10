import { usePlayerStore } from '../store';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Heart, Download, MoreVertical } from '../icons.jsx';
import TrackEditModal from './TrackEditModal';
import TrackActionSheet from './TrackActionSheet';
import ContextMenu from './ContextMenu';
import AddToPlaylistModal from './AddToPlaylistModal';
import ImageWithFallback from './ImageWithFallback';
import { updateTrack, resolveMediaUrl, getTrackStreamUrl, downloadTrack } from '../api';
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
import { triggerImpact } from '../utils/haptics';

function TrackItem({
  track,
  showArtist,
  onPlay,
  onContextMenu,
  onLongPress,
  onEdit,
  isSortable,
  suppressTap,
  isFavorite,
  onToggleFavorite,
  onDownload,
  onAddToQueue,
  isDropTarget,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(track.id),
    disabled: !isSortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.5)' : undefined,
    outline: (!isDragging && isDropTarget) ? '2px solid #F6B012' : undefined,
    outlineOffset: (!isDragging && isDropTarget) ? '3px' : undefined,
    borderRadius: (!isDragging && isDropTarget) ? '14px' : undefined,
  };

  const longPressBinder = {}; // useLongPress disabled


  const handleClick = (e) => {
    if (suppressTap || isDragging) return;
    // On touch devices the synthetic click event fires after touchend.
    // If we already handled the tap in handleTouchEnd, ignore this click
    // so we don't double-fire playTrack (which can pause then fail to resume).
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    onPlay(track);
  };

  // Track where touch started to avoid accidental plays while scrolling
  const touchStartRef = useRef(null);
  const touchHandledRef = useRef(false);

  const handleTouchStartForTap = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchHandledRef.current = false;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      element: e.currentTarget,
      time: Date.now(),
    };
  };

  // Mobile tap handler - only fires if touch started AND ended on same element
  const handleTouchEnd = (e) => {
    if (suppressTap || isDragging) return;
    const start = touchStartRef.current;
    if (!start) return;
    
    // Check if touch ended on the same element it started
    if (start.element !== e.currentTarget) {
      touchStartRef.current = null;
      return;
    }
    
    // Check if it was a short tap (not a long scroll)
    const elapsed = Date.now() - start.time;
    if (elapsed > 500) {
      touchStartRef.current = null;
      return;
    }
    
    // Check if finger moved too much (was scrolling, not tapping)
    const touch = e.changedTouches?.[0];
    if (touch) {
      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      if (dx > 10 || dy > 10) {
        touchStartRef.current = null;
        return;
      }
    }
    
    touchStartRef.current = null;
    touchHandledRef.current = true;
    if (onPlay) {
      onPlay(track);
    }
  };

  // Mobile long press handler - simplified to not interfere with taps
  const handleTouchStart = (e) => {
    if (!onLongPress) return;
    const touch = e.touches[0];
    if (!touch) return;
    
    const startTime = Date.now();
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    const checkLongPress = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 500) {
        onLongPress(e, track);
      }
    };
    
    const timer = setTimeout(checkLongPress, 500);
    
    const cancelLongPress = () => {
      clearTimeout(timer);
      document.removeEventListener('touchend', cancelLongPress);
      document.removeEventListener('touchmove', handleMove);
    };
    
    const handleMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      if (!moveTouch) return;
      const dx = Math.abs(moveTouch.clientX - startX);
      const dy = Math.abs(moveTouch.clientY - startY);
      if (dx > 10 || dy > 10) {
        cancelLongPress();
      }
    };
    
    document.addEventListener('touchend', cancelLongPress, { once: true });
    document.addEventListener('touchmove', handleMove);
  };
  
  const dragHandleProps = isSortable ? listeners : {};
  const rootProps = isSortable ? { ref: setNodeRef, style } : {};

  // On mobile, don't use drag system's touch handlers - they interfere with clicks
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const effectiveDragHandleProps = (isSortable && !isMobile) ? dragHandleProps : {};

  return (
<div
      {...rootProps}
      className={`group cursor-pointer transition-all duration-150 fade-in-stagger ${
        isDragging ? 'scale-[1.03] rotate-[1deg] opacity-95 z-20' : isDropTarget ? 'scale-[1.04]' : 'scale-100'
      }`}
    >
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStartForTap}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e, track);
        }}
        {...effectiveDragHandleProps}
        style={{ touchAction: 'pan-y' }}
        className="relative aspect-square rounded-xl overflow-hidden bg-[#111] mb-2 select-none"
      >
        <ImageWithFallback
          src={resolveMediaUrl(track.cover_art_url)}
          alt={track.title || track.filename}
          fallbackText={track.title || track.filename}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Action overlay (favorite / download / queue) — desktop only */}
        <div className="absolute top-0 right-0 hidden md:flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerImpact('light');
              onToggleFavorite?.(track);
            }}
            className="flex items-center justify-center rounded-full bg-black p-1.5 text-white hover:bg-[#222]"
            aria-label={isFavorite ? 'unfavorite' : 'favorite'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'text-vibe-gold' : ''}`} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.(track);
            }}
            className="flex items-center justify-center rounded-full bg-black p-1.5 text-white hover:bg-[#222]"
            aria-label="download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(track);
            }}
            className="flex items-center justify-center rounded-full bg-black p-1.5 text-white hover:bg-[#222]"
            aria-label="edit track"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="px-1 overflow-hidden">
        <h4 className="text-white text-base font-medium mb-0.5 text-center whitespace-nowrap">
          {track.title || track.filename}
        </h4>
        {showArtist && (
          <p className="text-[#888] text-sm text-center whitespace-nowrap">
            {track.artist || 'unknown'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TrackList({
  tracks,
  showArtist = true,
  onTrackUpdated = null,
  sortable = false,
  onReorder = null,
  onContextMenu = null,
  onLongPress = null,
  gridCols = 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
}) {
  const { playTrack } = usePlayerStore();
  const favorites = usePlayerStore((state) => state.favorites);
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const favoriteIds = useMemo(() => {
    return new Set((favorites || []).map((t) => String(t.id)));
  }, [favorites]);

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

  const [editingTrack, setEditingTrack] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [actionTrack, setActionTrack] = useState(null);
  const [trackOverrides, setTrackOverrides] = useState({});
  const [localTracks, setLocalTracks] = useState(tracks || []);
  const [suppressTap, setSuppressTap] = useState(false);
  const [overId, setOverId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null);

  useEffect(() => {
    setLocalTracks(tracks || []);
  }, [tracks]);
  
  useEffect(() => {
    const ids = new Set((tracks || []).map((t) => String(t.id)));
    setTrackOverrides((prev) => {
      const next = {};
      for (const [id, track] of Object.entries(prev)) {
        if (ids.has(String(id))) {
          next[id] = track;
        }
      }
      return next;
    });
  }, [tracks]);

  const finalTracks = useMemo(() => {
    return localTracks.map(t => trackOverrides[String(t.id)] || t);
  }, [localTracks, trackOverrides]);

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

  const handleDragEnd = (event) => {
    setOverId(null);
    setSuppressTap(true);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalTracks((current) => {
        const oldIndex = current.findIndex((t) => String(t.id) === active.id);
        const newIndex = current.findIndex((t) => String(t.id) === over.id);
        const reordered = arrayMove(current, oldIndex, newIndex);
        if (onReorder) onReorder(reordered.map((t) => t.id));
        return reordered;
      });
    }

    setTimeout(() => {
      setSuppressTap(false);
    }, 140);
  };

  const handleDragStart = () => {
    setSuppressTap(true);
  };

  const handleDragCancel = () => {
    setOverId(null);
    setTimeout(() => {
      setSuppressTap(false);
    }, 140);
  };

  const handlePlay = async (track) => {
    // Find the index of the clicked track in the tracks array
    const trackIndex = finalTracks.findIndex((t) => t.id === track.id);
    
    // Create queue items from all tracks
    const queueItems = finalTracks.map((t, index) => ({
      id: `queue-${t.id}-${index}`,
      track: t,
      position: index,
    }));
    
    // Set queue and play track immediately (local state only)
    usePlayerStore.setState({ queue: queueItems, currentQueueIndex: trackIndex });
    await playTrack(track, trackIndex);
  };



  const openTrackDetails = (track) => {
    setEditingTrack(track);
    setShowEdit(true);
  };

  const handleContextMenu = (e, track) => {
    if (onContextMenu) {
      onContextMenu(e, track);
      return;
    }
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      track,
    });
  };

  const handleLongPress = (e, track) => {
    if (onLongPress) {
      onLongPress(e, track);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: rect.left + rect.width / 2,
      y: rect.top,
      track,
    });
  };

  const saveTrack = async (data) => {
    if (!editingTrack) return;
    const res = await updateTrack(editingTrack.id, data);
    setEditingTrack(res.data);
    setTrackOverrides((prev) => ({
      ...prev,
      [String(res.data.id)]: res.data,
    }));
    if (onTrackUpdated) {
      onTrackUpdated(res.data);
    }
  };

  if (!finalTracks || finalTracks.length === 0) {
    return (
      <div className="text-center py-12 text-white">
        <p className="text-white/60 mb-4">no tracks found</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-vibe-gold text-vibe-black rounded-full text-sm font-semibold hover:bg-[#ffcc40] transition-colors"
        >
          refresh page
        </button>
      </div>
    );
  }

  const gridClassName = `grid ${gridCols} gap-3 md:gap-4`;

  const trackItems = finalTracks.map((track) => (
    <TrackItem
      key={track.id}
      track={track}
      showArtist={showArtist}
      onPlay={handlePlay}
      onContextMenu={handleContextMenu}
      onLongPress={handleLongPress}
      onEdit={openTrackDetails}
      isSortable={sortable}
      suppressTap={suppressTap}
      isFavorite={favoriteIds.has(String(track.id))}
      onToggleFavorite={toggleFavorite}
      onDownload={handleDownload}
      onAddToQueue={addToQueue}
      isDropTarget={sortable && String(track.id) === overId}
    />
  ));

  return (
    <>
      {sortable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={({ over }) => setOverId(over?.id ?? null)}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={finalTracks.map((t) => String(t.id))}
            strategy={rectSortingStrategy}
          >
            <div className={gridClassName}>{trackItems}</div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className={gridClassName}>{trackItems}</div>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          onClose={() => setContextMenu(null)}
          onEdit={(track) => {
            openTrackDetails(track);
            setContextMenu(null);
          }}
          onAddToQueue={(track) => {
            addToQueue(track);
            setContextMenu(null);
          }}
          onDownload={handleDownload}
          onToggleFavorite={toggleFavorite}
          isFavorite={favoriteIds.has(String(contextMenu.track?.id))}
          onAddToPlaylist={(track) => {
            setAddToPlaylistTrack(track);
            setContextMenu(null);
          }}
        />
      )}

      <AddToPlaylistModal
        track={addToPlaylistTrack}
        isOpen={!!addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
        onAdded={() => {
          setAddToPlaylistTrack(null);
        }}
      />

      <TrackActionSheet
        track={actionTrack}
        onClose={() => setActionTrack(null)}
        onViewDetails={(track) => openTrackDetails(track)}
      />
      <TrackEditModal
        isOpen={showEdit}
        track={editingTrack}
        onClose={() => setShowEdit(false)}
        onSave={saveTrack}
      />
    </>
  );
}
