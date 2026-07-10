import { useState } from 'react';
import { Download, Info, ListPlus, WifiOff, Zap, X } from '../icons.jsx';
import { usePlayerStore } from '../store';
import { getTrackStreamUrl, resolveMediaUrl } from '../api';
import ImageWithFallback from './ImageWithFallback';
import { useDataSaver } from '../context/DataSaverContext';

const ACTION_BUTTON_BASE = 'w-full flex items-center justify-between gap-3 rounded-2xl bg-[#111111] px-4 py-3 text-left text-white transition-colors min-h-[44px]';

export default function TrackActionSheet({ track, onClose, onViewDetails }) {
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const dataSaver = useDataSaver();
  const [pendingAction, setPendingAction] = useState(null);

  const offlineBlocked = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const lowDataActive = Boolean(dataSaver?.effectiveLowData);
  const downloadDisabledReason = (() => {
    if (offlineBlocked) return 'offline downloads unavailable';
    if (lowDataActive) return 'low data mode disabled downloads';
    return '';
  })();
  const downloadDisabled = Boolean(downloadDisabledReason);

  if (!track) {
    return null;
  }

  const handleAddToQueue = async () => {
    if (!track || pendingAction) return;
    try {
      setPendingAction('queue');
      await addToQueue(track);
    } catch (error) {
    } finally {
      setPendingAction(null);
      onClose();
    }
  };

  const handleDownload = async () => {
    if (!track || downloadDisabled) {
      return;
    }

    try {
      setPendingAction('download');
      // Import offline manager dynamically
      const offlineManager = (await import('../services/offlineManager')).default;

      // Use the offline manager for caching instead of direct download
      await offlineManager.downloadTrack(track.id, 'lossless');

      // Show success feedback (you might want to add a toast notification here)
    } catch (error) {
    } finally {
      setPendingAction(null);
      onClose();
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(track);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[#050505]" role="dialog" aria-modal="true">
      <button
        type="button"
        className="flex-1 w-full"
        onClick={onClose}
        aria-label="Close track actions"
      />
      <div className="bg-[#050505] border-t-2 border-[#f6b012] rounded-t-3xl px-5 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#111]">
            <ImageWithFallback
              src={resolveMediaUrl(track.cover_art_url)}
              alt={track.title || track.filename}
              fallbackText={track.title || track.filename}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{track.title || track.filename}</p>
            <p className="text-white text-sm truncate">{track.artist || 'unknown artist'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#111111] text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close actions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {(offlineBlocked || lowDataActive) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {offlineBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-900 bg-[#2a1515] px-3 py-1 text-xs lowercase text-red-100">
                <WifiOff className="w-3.5 h-3.5" /> offline paused
              </span>
            )}
            {!offlineBlocked && lowDataActive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-900 bg-[#2a2515] px-3 py-1 text-xs lowercase text-yellow-100">
                <Zap className="w-3.5 h-3.5" /> low data mode
              </span>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            className={`${ACTION_BUTTON_BASE} ${pendingAction === 'queue' ? 'opacity-70' : 'hover:bg-[#1b1b1b]'}`}
            onClick={handleAddToQueue}
            disabled={Boolean(pendingAction)}
          >
            <span className="flex items-center gap-2 text-base font-semibold lowercase">
              <ListPlus className="w-5 h-5 text-[#f6b012]" />
              add to queue
            </span>
          </button>

          <button
            type="button"
            className={`${ACTION_BUTTON_BASE} ${
              downloadDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1b1b1b]'
            }`}
            onClick={handleDownload}
            disabled={downloadDisabled}
          >
            <span className="flex items-center gap-2 text-base font-semibold lowercase">
              <Download className="w-5 h-5 text-[#f6b012]" />
              download for offline
            </span>
            {downloadDisabledReason && (
              <span className="text-[11px] text-[#888] ml-auto">
                {downloadDisabledReason}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`${ACTION_BUTTON_BASE} hover:bg-[#1b1b1b]`}
            onClick={handleViewDetails}
          >
            <span className="flex items-center gap-2 text-base font-semibold lowercase">
              <Info className="w-5 h-5 text-[#f6b012]" />
              view details
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
