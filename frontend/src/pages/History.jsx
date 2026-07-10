import { useEffect, useState, useCallback } from 'react';
import { Clock, Play, WifiOff, Zap } from '../icons.jsx';
import { getHistory } from '../api';
import { usePlayerStore } from '../store';
import { useDataSaver } from '../context/DataSaverContext';

const CACHE_KEY = 'music_history_cache';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_SIZE = 1024 * 1024; // 1MB limit

// Helper functions for size-aware caching
const getCacheSize = () => {
  try {
    let totalSize = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        totalSize += sessionStorage[key].length + key.length;
      }
    }
    return totalSize;
  } catch (e) {
    return 0;
  }
};

const setCacheItem = (key, value) => {
  try {
    const item = JSON.stringify(value);
    const itemSize = item.length + key.length;
    
    // Check if this single item would exceed our limit
    if (itemSize > MAX_CACHE_SIZE) {
      console.warn('Cache item too large, skipping cache');
      return false;
    }
    
    // Clear old cache if we're approaching the limit
    if (getCacheSize() + itemSize > MAX_CACHE_SIZE * 0.8) {
      clearOldCache();
    }
    
    sessionStorage.setItem(key, item);
    return true;
  } catch (e) {
    console.warn('Failed to set cache item:', e);
    clearOldCache();
    return false;
  }
};

const getCacheItem = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn('Failed to get cache item:', e);
    return null;
  }
};

const clearOldCache = () => {
  try {
    // Clear all music-related cache except the most recent
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith('music_'));
    keys.sort().slice(0, Math.max(0, keys.length - 1)).forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
  } catch (e) {
    console.warn('Failed to clear old cache:', e);
  }
};

export default function History() {
  const { playTrack } = usePlayerStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const lowDataActive = Boolean(dataSaver?.effectiveLowData);

  const loadHistory = useCallback(async (forceRefresh = false) => {
    if (shouldDeferNetwork && !forceRefresh) {
      setLoading(false);
      return;
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      try {
        const cached = getCacheItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = cached;
          if (Date.now() - timestamp < CACHE_TTL) {
            setHistory(data);
            setLoading(false);
            // Background refresh if cache is getting stale
            if (Date.now() - timestamp > CACHE_TTL * 0.7) {
              loadHistory(true);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to read history cache:', err);
      }
    }

    try {
      if (forceRefresh) {
        setRefreshing(true);
      }
      const res = await getHistory(100);
      // Handle both axios response format and direct array
      const historyData = Array.isArray(res) ? res : (res.data || []);
      setHistory(historyData);
      
      // Cache the result using size-aware caching
      const cacheData = {
        data: historyData,
        timestamp: Date.now()
      };
      
      // Only cache if it's not too large
      if (!setCacheItem(CACHE_KEY, cacheData)) {
        console.warn('History data too large for cache, skipping cache');
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      // Try to use stale cache if available
      if (!forceRefresh) {
        try {
          const cached = getCacheItem(CACHE_KEY);
          if (cached && cached.data) {
            setHistory(cached.data);
          }
        } catch (cacheErr) {
          console.warn('Failed to use stale cache:', cacheErr);
        }
      }
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shouldDeferNetwork]);

  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      loadHistory();
    }
    
    return () => {
      mounted = false;
    };
  }, [loadHistory]);

  // Pull-to-refresh functionality
  const handleRefresh = () => {
    loadHistory(true);
  };

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe ">
        <div className="px-4 py-0 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-vibe-gold">listening history</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 rounded-full hover:bg-[#222] transition-colors disabled:opacity-50"
            title="Refresh history"
          >
            <Clock className={`h-5 w-5 text-vibe-gold ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="px-4">
        {(shouldDeferNetwork || lowDataActive) && (
          <div className="space-y-2 mb-4">
            {shouldDeferNetwork && (
              <div className="rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2">
                <WifiOff className="w-4 h-4" /> offline mode — showing cached plays
              </div>
            )}
            {!shouldDeferNetwork && lowDataActive && (
              <div className="rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2">
                <Zap className="w-4 h-4" /> low data mode pauses auto-refresh
              </div>
            )}
          </div>
        )}

        {loading && !refreshing ? (
          <div className="text-[#888]">loading…</div>
        ) : refreshing ? (
          <div className="text-[#888] flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            refreshing…
          </div>
        ) : history.length === 0 ? (
          <div className="text-white">
            {shouldDeferNetwork ? 'history unavailable while offline' : 'no recent plays yet'}
          </div>
        ) : (
          <div className="space-y-3">
            {history.filter(item => item && item.track).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => playTrack(item.track)}
                className="w-full flex items-center justify-between rounded-2xl border border-[#333] bg-[#111] p-3 text-left hover:bg-[#1a1a1a]"
              >
                <div>
                  <div className="text-white font-semibold truncate">{item.track.title || item.track.filename}</div>
                  <div className="text-[#888] text-sm truncate">
                    {item.track.artist || 'unknown artist'} • {new Date(item.played_at).toLocaleString()}
                  </div>
                </div>
                <Play className="h-5 w-5 text-vibe-gold" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
