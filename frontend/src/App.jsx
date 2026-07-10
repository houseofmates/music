import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Music, X } from './icons.jsx';
import { usePlayerStore } from './store';
import { getTrackLyrics, resolveMediaUrl } from './api';
import Player from './components/Player';
import BottomNav from './components/BottomNav';
import QueueModal from './components/QueueModal';
import ErrorBoundary from './components/ErrorBoundary';
import PasscodeLock, { hasPasscode, getStoredPasscode } from './components/PasscodeLock';
import { consumeWidgetAction, syncWidgetState } from './widgetBridge';
import AppLifecycleManager from './components/AppLifecycleManager';
import useSwipeBack from './hooks/useSwipeBack';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';

// Pages - lazy loaded for code splitting
const Home = lazy(() => import('./pages/Home'));
const Tracks = lazy(() => import('./pages/Tracks'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const Playlists = lazy(() => import('./pages/Playlists'));
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'));
const Artists = lazy(() => import('./pages/Artists'));
const ArtistDetail = lazy(() => import('./pages/ArtistDetail'));
const Albums = lazy(() => import('./pages/Albums'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const History = lazy(() => import('./pages/History'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Share = lazy(() => import('./pages/Share'));
const Download = lazy(() => import('./pages/Download'));
const DownloadsManager = lazy(() => import('./components/DownloadsManager.jsx'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-vibe-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-vibe-gold border-t-transparent rounded-full animate-spin" />
  </div>
);



function parseLRC(lrc) {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const parsed = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
    if (!match) continue;
    const mins = Number(match[1]);
    const secs = Number(match[2]);
    const hundredths = Number(match[3].slice(0, 2));
    const text = (match[4] || '').trim();
    if (!text) continue;
    parsed.push({ time: mins * 60 + secs + hundredths / 100, text });
  }
  return parsed.sort((a, b) => a.time - b.time);
}

function getActiveLyricLine(currentPosition, syncedLines, plainLyrics) {
  if (syncedLines.length > 0) {
    for (let i = syncedLines.length - 1; i >= 0; i -= 1) {
      if (currentPosition >= syncedLines[i].time) {
        return syncedLines[i].text;
      }
    }
    return syncedLines[0]?.text || '';
  }

  const plainLines = (plainLyrics || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (plainLines.length === 0) return '';
  return plainLines[0];
}

function AppContent() {
  const {
    loadPlayerState,
    loadQueue,
    currentTrack,
    isPlaying,
    currentPosition,
    showLyrics,
    showQueue,
    setShowQueue,
    queue,
    currentQueueIndex,
    searchOverlayActive,
  } = usePlayerStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [appError, setAppError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [plainLyrics, setPlainLyrics] = useState('');
  const [syncedLines, setSyncedLines] = useState([]);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [isPlayerHidden, setIsPlayerHidden] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputFocusActive, setInputFocusActive] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLockChecked, setIsLockChecked] = useState(false);
  const [hasPasscodeStorage, setHasPasscodeStorage] = useState(false);

const handleSwipeBack = useCallback(() => {
    // ALWAYS dispatch clearSearch first - let all pages with search clear themselves
    // This handles search on Home, Albums, Artists, Playlists, and any detail pages
    window.dispatchEvent(new CustomEvent('clearSearch'));

    // If on home page with search overlay active, also clear the overlay state
    if (location.pathname === '/' && searchOverlayActive) {
      const store = usePlayerStore.getState();
      if (store && typeof store.setSearchOverlayActive === 'function') {
        store.setSearchOverlayActive(false);
      }
      // Return early - don't navigate, just clear search
      return;
    }

    // Check if any search input is focused or has content
    // If so, return early after clearing search (don't navigate)
    const activeElement = document.activeElement;
    const isSearchFocused = activeElement?.tagName === 'INPUT' && 
      (activeElement.type === 'text' || activeElement.type === 'search');
    const hasSearchContent = isSearchFocused && activeElement.value?.trim();
    
    if (hasSearchContent || isSearchFocused) {
      // Search was active - we've cleared it, don't navigate
      return;
    }

    // If on home page already (and no search), do nothing
    if (location.pathname === '/') {
      return;
    }

    // Use window.history.back() instead of navigate(-1) to properly go back
    // This works better with hash router and avoids going to phone homepage
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, go to home page
      navigate('/', { replace: true });
    }
  }, [navigate, location.pathname, searchOverlayActive]);

  useSwipeBack({ enabled: true, onBack: handleSwipeBack });



  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Check passcode lock status
      const stored = hasPasscode();
      setHasPasscodeStorage(stored);
      const existingToken = typeof window !== 'undefined' ? window.localStorage.getItem('music_app_token') : null;
      setIsUnlocked(stored && existingToken ? true : false);
      setIsLockChecked(true);

      const store = usePlayerStore.getState();
      store.initAudioContext();
      
      try {
        await Promise.allSettled([
          store.loadPlayerState(),
          store.loadQueue(),
          store.loadFavorites(),
          store.loadUser(),
          store.loadSettings()
        ]);
        if (mounted) setIsInitialized(true);
      } catch (e) {
        console.error("Init load error:", e);
        if (mounted) setIsInitialized(true);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Global Event Listeners & Environment
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Platform & Viewport
    const isNative = window.Capacitor?.isNativePlatform?.() || 
      (/android|iphone|ipad|ipod/i.test(navigator.userAgent) && window.location.protocol === 'capacitor:');
    document.body.classList.toggle('native-app', isNative);

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleViewport = (e) => setIsDesktopViewport(e.matches);
    setIsDesktopViewport(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewport);

    // Keyboard & Focus
    const viewport = window.visualViewport;
    const handleKeyboard = () => {
      if (!viewport) return;
      setKeyboardVisible(window.innerHeight - viewport.height > 120);
    };
    viewport?.addEventListener('resize', handleKeyboard);
    viewport?.addEventListener('scroll', handleKeyboard);

    const handleFocus = (e) => {
      if (mediaQuery.matches) return setInputFocusActive(false);
      const isEditable = e.target?.matches?.('input, textarea, select, [contenteditable="true"]');
      setInputFocusActive(isEditable);
    };
    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', () => setInputFocusActive(false));

    // Keyboard Shortcuts
    const handleKeys = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          navigate('/', { state: { focusSearch: true } });
        }
      }
    };
    window.addEventListener('keydown', handleKeys);

    return () => {
      mediaQuery.removeEventListener('change', handleViewport);
      viewport?.removeEventListener('resize', handleKeyboard);
      viewport?.removeEventListener('scroll', handleKeyboard);
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('keydown', handleKeys);
    };
  }, [navigate]);



  // Note: Syncing play/pause state is now handled inside AppLifecycleManager
  // to ensure continuity in background states.



  useEffect(() => {
    syncWidgetState({
      currentTrack,
      queue,
      currentQueueIndex,
      isPlaying,
    });
  }, [currentTrack, queue, currentQueueIndex, isPlaying]);



  useEffect(() => {
    let cancelled = false;

    const loadLyricsForMedia = async () => {
      if (!currentTrack?.id) {
        setPlainLyrics('');
        setSyncedLines([]);
        return;
      }

      try {
        const res = await getTrackLyrics(currentTrack.id);
        if (cancelled) return;
        const lyrics = res?.data?.lyrics || '';
        const syncedRaw = res?.data?.synced_lyrics || '';
        setPlainLyrics(lyrics);
        setSyncedLines(parseLRC(syncedRaw));
      } catch {
        if (!cancelled) {
          setPlainLyrics('');
          setSyncedLines([]);
        }
      }
    };

    loadLyricsForMedia();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);





  if (appError) {
    return (
      <div className="min-h-screen bg-vibe-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl text-vibe-gold mb-4">error loading app</h1>
          <p className="text-white/60">{appError}</p>
        </div>
      </div>
    );
  }

  const anyModalOpen = typeof document !== "undefined" && !!document.querySelector(".fixed.inset-0.z-50");
  const forceHideForSearch = !isDesktopViewport && !anyModalOpen && (searchOverlayActive || keyboardVisible || inputFocusActive);

  const mainPadding = (() => {
    if (!currentTrack || isPlayerHidden || forceHideForSearch) {
      return 'pb-24 md:pb-16 xl:pb-20';
    }
    if (searchOverlayActive) {
      return 'pb-64 md:pb-16 xl:pb-20';
    }
    return 'pb-96 md:pb-16 xl:pb-20';
  })();

  const shouldShowPlayer = Boolean(currentTrack && !isPlayerHidden && !forceHideForSearch);

  // Show loading while checking passcode status
  if (!isLockChecked) {
    return (
      <div className="min-h-screen bg-vibe-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vibe-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show passcode lock if not unlocked
  if (!isUnlocked) {
    return <PasscodeLock onUnlock={() => setIsUnlocked(true)} hasStoredPasscode={hasPasscodeStorage} />;
  }
  return (
      <div className="min-h-screen bg-vibe-black font-varela lowercase " style={{ fontFamily: "'Varela Round', sans-serif" }}>
      {/* Main Content */}
      <div className={mainPadding}>
        <AppLifecycleManager />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/share/:token" element={<Share />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:artist" element={<ArtistDetail />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:album" element={<AlbumDetail />} />
            <Route path="/download" element={<Download />} />
          </Routes>
        </Suspense>
      </div>

      {/* Player Controls (shown when track is playing) */}
      {shouldShowPlayer && (
        <Player
          onHideDesktop={() => setIsPlayerHidden(true)}
          onSwipeDown={() => setIsPlayerHidden(true)}
          searchOverlayActive={searchOverlayActive}
        />
      )}

      {currentTrack && isPlayerHidden && !forceHideForSearch && (
        <button
          type="button"
          onClick={() => setIsPlayerHidden(false)}
          className="fixed bottom-20 xl:bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-[#333] bg-vibe-black px-3 py-2 text-white hover:bg-[#1a1a1a]"
          aria-label="Show player"
        >
          <Music className="h-4 w-4 text-vibe-gold" />
          <span className="text-sm text-white">show player</span>
          <X className="h-3.5 w-3.5 text-white rotate-45" />
        </button>
      )}

      {/* Bottom Navigation */}
      {!forceHideForSearch && (
        <BottomNav onRevealPlayer={() => setIsPlayerHidden(false)} isPlayerHidden={isPlayerHidden} />
      )}

      {/* Queue Modal */}
      {showQueue && (
        <QueueModal onClose={() => setShowQueue(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;