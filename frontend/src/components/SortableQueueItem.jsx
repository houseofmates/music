import React from 'react';
import { GripVertical, X } from '../icons.jsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageWithFallback from './ImageWithFallback';
import { resolveMediaUrl } from '../api';

function queueTrackLabel(queueItem) {
  return queueItem.track.title || queueItem.track.filename || 'unknown';
}

function SortableQueueItem({
  queueItem,
  isCurrent,
  onPlay,
  onRemove,
  onLongPress,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(queueItem.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 50ms ease-out',
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 40 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onContextMenu={(e) => {
        if (e && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        onLongPress?.(queueItem.track);
      }}
      className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
        isCurrent ? 'bg-[#2a1f0f] border border-[#f6b012]' : 'bg-[#111] hover:bg-[#1a1a1a]'
      }`}
    >
      <button
        type="button"
        onClick={() => onPlay(queueItem)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className="relative w-11 h-11 flex-shrink-0">
          <ImageWithFallback
            src={resolveMediaUrl(queueItem.track.cover_art_url)}
            alt={queueItem.track.album || queueTrackLabel(queueItem)}
            fallbackText={queueTrackLabel(queueItem)}
            className="w-full h-full rounded-2xl object-cover"
            eager={isCurrent}
          />
          <div className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black text-white capitalize">
            {queueItem.track.format || queueItem.track.bitrate ? (
              queueItem.track.format?.toLowerCase() || `${Math.round(queueItem.track.bitrate / 1000)}kbps`
            ) : (
              queueItem.track.duration ? `${Math.round(queueItem.track.duration / 60)}m` : 'now'
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">{queueTrackLabel(queueItem)}</p>
          <div className="flex items-center gap-2 text-[11px] text-[#888]">
            <span className="truncate">{queueItem.track.artist || 'unknown artist'}</span>
            {queueItem.track.album && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#222] px-2 py-0.5 text-[10px] text-white whitespace-nowrap">
                <span className="w-1 h-1 rounded-full bg-vibe-gold" />
                {queueItem.track.album}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 pl-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="h-11 w-11 rounded-2xl bg-[#1a1a1a] text-white hover:bg-[#252525] flex items-center justify-center"
          aria-label="reorder queue item"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onRemove(queueItem.id)}
          className="h-11 w-11 rounded-2xl bg-[#1a1a1a] text-white hover:bg-red-900 flex items-center justify-center"
          aria-label="remove queue item"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default SortableQueueItem;