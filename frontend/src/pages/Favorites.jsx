import { useEffect, useState } from 'react';
import { Heart, Play, WifiOff, Zap } from '../icons.jsx';
import { usePlayerStore } from '../store';
import { useDataSaver } from '../context/DataSaverContext';

export default function Favorites() {
  const { favorites, loadFavorites, playTrack, toggleFavorite } = usePlayerStore();
  const [loading, setLoading] = useState(true);
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const lowDataActive = Boolean(dataSaver?.effectiveLowData);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (shouldDeferNetwork) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        await loadFavorites();
      } catch (err) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadFavorites, shouldDeferNetwork]);

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe ">
        <div className="px-4 py-0">
          <h1 className="text-2xl font-bold text-vibe-gold text-center">favorites</h1>
        </div>
      </div>
      <div className="px-4">
        {(shouldDeferNetwork || lowDataActive) && (
          <div className="space-y-2 mb-4">
            {shouldDeferNetwork && (
              <div className="rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2">
                <WifiOff className="w-4 h-4" /> offline mode — showing cached likes
              </div>
            )}
            {!shouldDeferNetwork && lowDataActive && (
              <div className="rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2">
                <Zap className="w-4 h-4" /> low data mode pauses auto-refresh
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-[#888]">loading…</div>
        ) : favorites.length === 0 ? (
          <div className="text-white">
            {shouldDeferNetwork ? 'favorites unavailable while offline' : 'no favorites yet'}
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((track) => (
              <div
                key={track.id}
                className="w-full flex items-center justify-between rounded-2xl border border-[#333] bg-[#111] p-3"
              >
                <button
                  type="button"
                  onClick={() => playTrack(track)}
                  className="text-left flex-1"
                >
                  <div className="text-white font-semibold truncate">{track.title || track.filename}</div>
                  <div className="text-[#888] text-sm truncate">
                    {track.artist || 'unknown artist'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (shouldDeferNetwork) return;
                    toggleFavorite(track);
                  }}
                  className={`rounded-full bg-[#1a1a1a] p-2 text-vibe-gold transition-colors ${shouldDeferNetwork ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#252525]'}`}
                  aria-label="toggle favorite"
                  disabled={shouldDeferNetwork}
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
