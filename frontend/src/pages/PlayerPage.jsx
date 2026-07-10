import { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '../store';
import { X, GripVertical, ChevronDown, ChevronUp } from '../icons.jsx';
import { Loader2 } from '../icons.jsx';
import ImageWithFallback from '../components/ImageWithFallback';
import LyricsPanel from '../components/LyricsPanel';
import { resolveMediaUrl } from '../api';

export default function PlayerPage() {
  const {
    currentTrack,
    queue,
    currentQueueIndex,
    loadQueue,
    removeFromQueue,
    playTrack,
    clearQueue,
  } = usePlayerStore();

  const [loading, setLoading] = useState(true);
  const [lyricsExpanded, setLyricsExpanded] = useState(true);
  const lyricsRef = useRef(null);
  const safeQueue = Array.isArray(queue) ? queue : [];

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    try {
      setLoading(true);
      await loadQueue();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromQueue = async (queueItem, e) => {
    e.stopPropagation();
    await removeFromQueue(queueItem.id);
  };

  const handlePlayTrack = (queueItem, index) => {
    playTrack(queueItem.track, index);
  };

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-vibe-black flex items-center justify-center pb-32">
        <div className="text-center">
          <p className="text-white mb-4">no track playing</p>
          <p className="text-[#888] text-sm">select a track to start playing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibe-black pb-80 pt-safe">
      {/* Header */}
      <div className="px-4 py-1">
        <h1 className="text-2xl font-bold text-vibe-gold text-center">now playing</h1>
      </div>

      {/* Current Track Display */}
      <div className="px-4 mb-4 flex justify-center">
        <div className="rounded-3xl overflow-hidden bg-[#0a0a0a] p-6 max-w-md w-full">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#111] mb-4">
            {currentTrack.cover_art_url ? (
              <ImageWithFallback
                src={resolveMediaUrl(currentTrack.cover_art_url)}
                alt={currentTrack.album || currentTrack.title || currentTrack.filename}
                fallbackText={currentTrack.title || currentTrack.filename}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#111] text-vibe-gold text-5xl">
                ♪
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {currentTrack.title || currentTrack.filename}
          </h2>
          <p className="text-vibe-gold text-lg mb-1">
            {currentTrack.artist || 'unknown artist'}
          </p>
          {currentTrack.album && (
            <p className="text-[#888] mb-3">{currentTrack.album}</p>
          )}
        </div>
      </div>

      {/* Lyrics - always visible, collapsible */}
      <div ref={lyricsRef} className="px-4 mb-4">
        <div className={`w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${
          lyricsExpanded ? 'h-64 md:h-80 lg:h-96' : 'h-12'
        }`}>
          {/* Collapsible Header - tappable area */}
          <button
            onClick={() => setLyricsExpanded(!lyricsExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors shrink-0"
          >
            <span className="text-sm font-medium text-white/80">lyrics</span>
            {lyricsExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>
          {/* Lyrics Content */}
          {lyricsExpanded && (
            <div className="flex-1 min-h-0 p-1">
              <LyricsPanel track={currentTrack} embedded />
            </div>
          )}
        </div>
      </div>

      {/* Queue */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">queue</h3>
          {safeQueue.length > 0 && (
            <button
              onClick={async () => {
                if (clearQueue) {
                  await clearQueue();
                }
              }}
              className="px-3 py-1.5 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors lowercase"
            >
              clear queue
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : safeQueue.length === 0 ? (
          <div className="text-center py-12 text-white">
            <p>queue is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeQueue.map((queueItem, index) => (
              <div
                key={queueItem.id}
                onClick={() => handlePlayTrack(queueItem, index)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer ${
                  index === currentQueueIndex
                    ? 'bg-[#2a1f0f] border-2 border-vibe-gold'
                    : 'bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                {/* Drag Handle */}
                <GripVertical className="w-5 h-5 text-[#888] flex-shrink-0" />

                {/* Cover Art */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#111] flex-shrink-0">
                  {queueItem.track.cover_art_url ? (
                    <ImageWithFallback
                      src={resolveMediaUrl(queueItem.track.cover_art_url)}
                      alt={queueItem.track.album || queueItem.track.title || queueItem.track.filename}
                      fallbackText={queueItem.track.title || queueItem.track.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111] text-vibe-gold">
                      ♪
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate">
                    {queueItem.track.title || queueItem.track.filename}
                  </h4>
                  <p className="text-[#888] text-sm truncate">
                    {queueItem.track.artist || 'unknown artist'}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveFromQueue(queueItem, e)}
                  className="p-2 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#2a1515] hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
