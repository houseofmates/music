import { useState, useRef, useEffect } from 'react';
import {
  Home, Music, Heart, Clock, ListMusic, WifiOff, Zap,
  User, Disc3, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  Repeat1, MessageSquareText, Volume2, VolumeX,
} from '../icons.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { usePlayerStore } from '../store';
import { resolveMediaUrl } from '../api';
import { triggerImpact } from '../utils/haptics';
import { useDataSaver } from '../context/DataSaverContext';
import AudioProcessingModal from './AudioProcessingModal';
import { useProgressDrag } from '../hooks/useProgressDrag';

// Live position/duration getters read straight from the store so the rAF
// progress animation follows the <audio> element's currentTime at 60fps
// (falling back to the store position on the native-playback path).
const liveDuration = () => {
  const s = usePlayerStore.getState();
  return s.audioDuration || s.currentTrack?.duration || 0;
};
const livePosition = () => {
  const s = usePlayerStore.getState();
  const t = s.audioRef?.currentTime;
  return Number.isFinite(t) ? t : s.currentPosition;
};

export default function BottomNav({ onRevealPlayer, isPlayerHidden = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dataSaver = useDataSaver();
  const isDesktopViewport =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(min-width: 768px)').matches;
  const volumeContainerRef = useRef(null);
  const volumeSliderRef = useRef(null);

  const {
  settings,
  currentTrack,
  isPlaying,
  currentPosition,
  audioDuration,
  repeatMode,
  shuffle,
  showQueue,
  showLyrics,
  volume,
  toggleOfflineMode,
  toggleLowPowerMode,
  playPause,
  nextTrack,
  previousTrack,
  jump,
  seekTo,
  setRepeatMode,
  toggleShuffle,
  toggleLyrics,
  toggleQueue,
  setVolume,
  } = usePlayerStore((state) => ({
  settings: state.settings,
  currentTrack: state.currentTrack,
  isPlaying: state.isPlaying,
  currentPosition: state.currentPosition,
  audioDuration: state.audioDuration,
  repeatMode: state.repeatMode,
  shuffle: state.shuffle,
  showQueue: state.showQueue,
  showLyrics: state.showLyrics,
  volume: state.volume,
  toggleOfflineMode: state.toggleOfflineMode,
  toggleLowPowerMode: state.toggleLowPowerMode,
  setVolume: state.setVolume,
  playPause: state.playPause,
  nextTrack: state.nextTrack,
  previousTrack: state.previousTrack,
  jump: state.jump,
  seekTo: state.seekTo,
  setRepeatMode: state.setRepeatMode,
  toggleShuffle: state.toggleShuffle,
  toggleLyrics: state.toggleLyrics,
  toggleQueue: state.toggleQueue,
  }), shallow);

  const [pendingAction, setPendingAction] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAudioProcessing, setShowAudioProcessing] = useState(false);
  const [audioProcessingSettings, setAudioProcessingSettings] = useState({});

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const offlineActive = Boolean(settings?.offlineMode);
  const lowPowerActive = Boolean(settings?.lowPowerMode);

  const duration = audioDuration || currentTrack?.duration || 0;

  const handleToggle = async (type) => {
    try {
      setPendingAction(type);
      if (type === 'offline') await toggleOfflineMode?.();
      else if (type === 'lowPower') await toggleLowPowerMode?.();
    } finally {
      setPendingAction(null);
    }
  };

  const desktopProgressBarRef = useRef(null);
  const desktopFillRef = useRef(null);
  const desktopThumbRef = useRef(null);

  const { onPointerDown: onDesktopPointerDown } = useProgressDrag({
    getDuration: liveDuration,
    getCurrentPosition: livePosition,
    onSeek: seekTo,
    trackRef: desktopProgressBarRef,
    fillRef: desktopFillRef,
    thumbRef: desktopThumbRef,
    enabled: isPlayerHidden && isDesktopViewport,
  });

  const mobileProgressBarRef = useRef(null);
  const mobileFillRef = useRef(null);
  const mobileThumbRef = useRef(null);

  const { onPointerDown: onMobilePointerDown } = useProgressDrag({
    getDuration: liveDuration,
    getCurrentPosition: livePosition,
    onSeek: seekTo,
    trackRef: mobileProgressBarRef,
    fillRef: mobileFillRef,
    thumbRef: mobileThumbRef,
    enabled: isPlayerHidden && !isDesktopViewport,
  });

  const formatTime = (s) => {
    if (!s || isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { path: '/artists', icon: User, label: 'artists' },
    { path: '/player', icon: Music, label: 'player' },
    { path: '/favorites', icon: Heart, label: 'favorites' },
    { path: '/', icon: Home, label: 'home' },
    { path: '/playlists', icon: ListMusic, label: 'playlists' },
    { path: '/albums', icon: Disc3, label: 'albums' },
    { path: '/history', icon: Clock, label: 'history' },
  ];

  const handleNavClick = (path, isActive) => {
    if (isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  const getIsActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    if (item.path === '/playlists') return location.pathname === '/playlists' || location.pathname.startsWith('/playlists/');
    if (item.path === '/artists') return location.pathname === '/artists' || location.pathname.startsWith('/artists/');
    if (item.path === '/albums') return location.pathname === '/albums' || location.pathname.startsWith('/albums/');
    return location.pathname.startsWith(item.path);
  };

  const handleQuickActionsTouchStart = (e) => {
    if (!isPlayerHidden) return;
    const touch = e.touches?.[0];
    if (touch) setTouchStartY(touch.clientY);
  };

  const handleQuickActionsTouchEnd = (e) => {
    if (!isPlayerHidden || touchStartY === null) return;
    const touch = e.changedTouches?.[0];
    if (!touch) { setTouchStartY(null); return; }
    const delta = touchStartY - touch.clientY;
    setTouchStartY(null);
    if (delta > 40) onRevealPlayer?.();
  };

  const showPlayerControls = Boolean(currentTrack && !isPlayerHidden);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutsideContainer = volumeContainerRef.current && !volumeContainerRef.current.contains(e.target);
      const clickedOutsideSlider = volumeSliderRef.current && !volumeSliderRef.current.contains(e.target);
      if (clickedOutsideContainer && clickedOutsideSlider) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showVolumeSlider]);

  const handleVolumeButtonClick = (e) => {
  e.stopPropagation();
  setShowVolumeSlider(!showVolumeSlider);
  };

  const handleApplyAudioSettings = async (settings) => {
    try {
      const response = await fetch('/api/audio-processing/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setAudioProcessingSettings(settings);
        usePlayerStore.setState(state => ({
          settings: {
            ...state.settings,
            audioProcessing: settings
          }
        }));
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    const defaultSettings = {
      normalize: true,
      compression: false,
      equalizer_preset: null,
      effects: [],
      spatial_preset: null,
      compression_settings: {
        attack: 0.3,
        release: 0.8,
        threshold: -20,
        ratio: 4,
        makeup: 8
      }
    };
    handleApplyAudioSettings(defaultSettings);
  }, []);

  return (
    <>
      <AudioProcessingModal
        isOpen={showAudioProcessing}
        onClose={() => setShowAudioProcessing(false)}
        onApplySettings={handleApplyAudioSettings}
      />
{/* ===== DESKTOP ONLY: Player bar ABOVE the nav bar ===== */}
 <div
 className="hidden md:grid fixed bottom-14 xl:bottom-16 left-0 right-0 bg-[#050505] border-t border-[#f6b012] items-center h-14 xl:h-16 z-40 px-4"
 style={{ fontFamily: '"Varela Round", sans-serif', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)' }}
 >
 {/* Left: track title */}
 <div className="flex items-center gap-3 min-w-0" style={{ minWidth: '200px' }}>
 {currentTrack && !isPlayerHidden && (
 <p
 className="text-white text-base leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
 title={`${currentTrack.title || currentTrack.filename}${currentTrack.artist ? ` — ${currentTrack.artist}` : ''}`}
 >
 {(() => {
 const title = currentTrack.title || currentTrack.filename || '';
 const artist = currentTrack.artist || '';
 return artist ? `${title} — ${artist}` : title;
 })()}
 </p>
 )}
 </div>

 {/* Center: lyrics / repeat / prev / play / next / volume - all inline */}
 {currentTrack && !isPlayerHidden && (
 <div className="flex items-center gap-2">
 {/* Lyrics button - leftmost */}
 <button
 onClick={() => { navigate('/player'); }}
 className="rounded-full p-2 transition-colors bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]"
 aria-label="lyrics"
 >
 <MessageSquareText className="h-4 w-4" />
 </button>

 {/* Repeat button */}
 <button
 onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
 className={`rounded-full p-2 transition-colors ${repeatMode !== 'none' ? 'bg-[#ffbb20]/20 text-[#ffbb20]' : 'bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]'}`}
 aria-label={repeatMode === 'one' ? 'repeat one' : repeatMode === 'all' ? 'repeat all' : 'repeat off'}
 >
 {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
 </button>

 <button
 onClick={previousTrack}
 className="rounded-full bg-[#2a1f0f] p-2 text-white hover:bg-[#3a2f1f] transition-colors"
 aria-label="previous track"
 >
 <SkipBack className="h-4 w-4 fill-current" />
 </button>

 <button
 onClick={() => {
 triggerImpact('medium');
 playPause();
 }}
  className="rounded-full p-2.5 bg-[#ffbb20] text-black hover:bg-[#ffcc40] active:scale-95 transition-all"
 style={{ minWidth: 0, minHeight: 0 }}
 aria-label={isPlaying ? 'pause' : 'play'}
 >
 {isPlaying ? (
 <Pause className="h-5 w-5 fill-current" />
 ) : (
 <Play className="h-5 w-5 fill-current pl-0.5" />
 )}
 </button>

 <button
 onClick={nextTrack}
 className="rounded-full bg-[#2a1f0f] p-2 text-white hover:bg-[#3a2f1f] transition-colors"
 aria-label="next track"
 >
 <SkipForward className="h-4 w-4 fill-current" />
 </button>

 
 {/* Volume button with popup slider */}
 <div ref={volumeContainerRef} className="relative">
 <button
 onClick={handleVolumeButtonClick}
 className={`rounded-full p-2 transition-colors ${showVolumeSlider ? 'bg-[#ffbb20]/20 text-[#ffbb20]' : 'bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]'}`}
 aria-label="volume"
 >
 {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
 </button>

 {/* Volume slider popup - centered above the button, with longer background */}
 {showVolumeSlider && (
 <div 
 ref={volumeSliderRef}
 className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 bg-[#1a1a1a] rounded-xl border border-[#333] shadow-xl z-50"
 style={{ width: '280px', maxWidth: '90vw' }}
 >
 <div className="flex items-center gap-3">
 <button
 onClick={() => setIsMuted(!isMuted)}
 className="p-1.5 rounded-full text-white/70 hover:text-[#ffbb20] flex-shrink-0"
 >
 {isMuted || volume === 0 ? <VolumeX className="w-4 w-4" /> : <Volume2 className="w-4 h-4" />}
 </button>
 <input
 type="range"
 min="0"
 max="1"
 step="0.01"
 value={isMuted ? 0 : volume}
 onChange={handleVolumeChange}
 className="flex-1 accent-[#ffbb20]"
 />
 <span className="text-white/70 text-xs w-8 text-right">
 {Math.round((isMuted ? 0 : volume) * 100)}%
 </span>
 </div>
 </div>
 )}
 </div>

 {/* Shuffle button */}
 <button
 onClick={toggleShuffle}
 className={`rounded-full p-2 transition-colors ${shuffle ? 'bg-[#ffbb20]/20 text-[#ffbb20]' : 'bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]'}`}
 aria-label={shuffle ? 'shuffle on' : 'shuffle off'}
 >
 <Shuffle className="h-4 w-4" />
 </button>
 </div>
 )}

 {/* Right: progress bar centered between center column and right edge + toggle buttons */}
 <div className="flex items-center gap-2 min-w-0">
 {currentTrack && !isPlayerHidden && (
 <>
 {/* Progress bar - centered, bridging space */}
 <div className="flex items-center gap-2 flex-1 justify-center">
 <div className="flex items-center gap-2 w-full max-w-xs lg:max-w-sm">
 <span className="text-white/40 text-xs flex-shrink-0">{formatTime(currentPosition)}</span>
<div
    ref={desktopProgressBarRef}
    className="relative flex-1 h-1.5 bg-[#222] rounded-full cursor-pointer"
    style={{ touchAction: 'none' }}
    onPointerDown={onDesktopPointerDown}
  >
    <div
      ref={desktopFillRef}
      className="absolute left-0 top-0 bottom-0 bg-[#f6b012] rounded-full"
      style={{ width: 0 }}
    />
    <div
      ref={desktopThumbRef}
      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f6b012] rounded-full border-2 border-white/80 shadow-sm"
      style={{ left: '-6px' }}
    />
  </div>
 <span className="text-white/40 text-xs flex-shrink-0">{formatTime(duration)}</span>
 </div>
 </div>
 </>
 )}
 <button type="button" onClick={() => handleToggle('offline')} disabled={pendingAction === 'offline'}
 className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${offlineActive ? 'border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]' : 'border-white/10 bg-white/5 text-white/70'} ${pendingAction === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 <WifiOff className="w-4 h-4" fill="none" strokeWidth={2} />
 <span className="whitespace-nowrap">{offlineActive ? 'offline on' : 'offline'}</span>
 </button>
 <button type="button" onClick={() => handleToggle('lowPower')} disabled={pendingAction === 'lowPower'}
 className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${lowPowerActive ? 'border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]' : 'border-white/10 bg-white/5 text-white/70'} ${pendingAction === 'lowPower' ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 <Zap className="w-4 h-4" fill="none" strokeWidth={2} />
 <span className="whitespace-nowrap">low data</span>
 </button>
 </div>
 </div>

       {/* ===== BOTTOM NAV BAR ===== */}
       <nav
         className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t-2 border-[#ffbb20] flex flex-col pb-safe z-40"
         onTouchStart={handleQuickActionsTouchStart}
         onTouchEnd={handleQuickActionsTouchEnd}
         style={{ fontFamily: '"Varela Round", sans-serif' }}
       >
{/* ===== MOBILE PLAYER STRIP (hidden on desktop) ===== */}
  {showPlayerControls && (
  <div className="md:hidden flex-shrink-0 mobile-player-strip">
 {/* Track info row - title and artist centered on screen */}
 <div className="relative flex items-center px-3 pt-0 pb-0" style={{ minHeight: '32px' }}>
 {/* Cover art - left side */}
 {currentTrack.cover_art_url ? (
 <img
 src={resolveMediaUrl(currentTrack.cover_art_url)}
 alt={currentTrack.album || currentTrack.title}
 className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
 />
 ) : (
 <div className="w-7 h-7 rounded-lg bg-[#2a1f0f] flex items-center justify-center flex-shrink-0">
 <Music className="w-3 h-3 text-[#ffbb20]" />
 </div>
 )}
 {/* Title and artist - absolutely centered on screen */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="text-center px-12">
 <p className="text-white text-[11px] font-semibold truncate leading-tight">
 {currentTrack.title || currentTrack.filename}
 </p>
 <p className="text-white/40 text-[9px] truncate leading-tight">
 {currentTrack.artist || 'unknown artist'}
 </p>
 </div>
 </div>
 </div>

{/* Controls + progress live in a flex column. Flex `gap` never collapses,
    so the fixed vertical gap between the controls row and the progress bar
    is guaranteed regardless of button sizes — the play button can never
    overlap the progress bar on any screen size. */}
  <div className="flex flex-col gap-2 px-4 py-2">
   {/* Controls row */}
   <div className="flex items-center justify-between" style={{ minHeight: '48px' }}>
    {/* Left group: lyrics, repeat */}
   <div className="flex items-center gap-2">
     <button
     onClick={() => { navigate('/player'); }}
     className="w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none text-white"
     aria-label="lyrics"
     >
     <MessageSquareText className="w-5 h-5" />
     </button>

     <button
       onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
       className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none ${repeatMode !== 'none' ? 'text-[#ffb10f]' : 'text-white'}`}
       aria-label={repeatMode === 'one' ? 'repeat one' : repeatMode === 'all' ? 'repeat all' : 'repeat off'}
     >
       {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
     </button>
   </div>

   {/* Center group: previous, play/pause, next - flex layout */}
   <div className="flex items-center justify-center gap-3 flex-shrink-0">
     <button
     onClick={previousTrack}
     className="w-11 h-11 flex items-center justify-center text-white rounded-full active:scale-90 transition-none"
     aria-label="previous"
     >
     <SkipBack className="w-6 h-6 fill-current" />
     </button>

     <button
      onClick={() => { triggerImpact('medium'); playPause(); }}
      className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#ffb10f] text-black rounded-full active:scale-90 transition-none"
      aria-label={isPlaying ? 'pause' : 'play'}
      >
      {isPlaying
      ? <Pause className="w-6 h-6 fill-current" />
      : <Play className="w-6 h-6 fill-current" style={{ marginLeft: '2px' }} />
      }
      </button>

     <button
     onClick={nextTrack}
     className="w-11 h-11 flex items-center justify-center text-white rounded-full active:scale-90 transition-none"
     aria-label="next"
     >
     <SkipForward className="w-6 h-6 fill-current" />
     </button>
   </div>

   {/* Right group: shuffle, queue */}
   <div className="flex items-center gap-2">
     <button
       onClick={toggleShuffle}
       className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none ${shuffle ? 'text-[#ffb10f]' : 'text-white'}`}
       aria-label={shuffle ? 'shuffle on' : 'shuffle off'}
     >
     <Shuffle className="w-5 h-5" />
     </button>

     <button
     onClick={toggleQueue}
     className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none ${showQueue ? 'text-[#ffb10f]' : 'text-white'}`}
     aria-label="queue"
     >
     <ListMusic className="w-5 h-5" />
     </button>
   </div>
   </div>

   {/* Progress bar - div-based for reliable Android WebView pointer handling */}
   <div>
    <div
    ref={mobileProgressBarRef}
    className="w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full cursor-pointer relative"
    style={{ touchAction: 'none' }}
    onPointerDown={onMobilePointerDown}
  >
    {/* Progress fill bar */}
    <div
      ref={mobileFillRef}
      className="absolute left-0 top-0 bottom-0 bg-[#f6b012] rounded-full"
      style={{ width: 0 }}
    />
    {/* Yellow thumb/circle indicator */}
    <div
      ref={mobileThumbRef}
      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f6b012] rounded-full border-2 border-white/80 shadow-sm"
      style={{ left: '-6px' }}
    />
  </div>
  <div className="flex justify-between mt-1">
    <span className="text-white/40 text-[10px]">{formatTime(currentPosition)}</span>
    <span className="text-white/40 text-[10px]">{formatTime(duration)}</span>
  </div>
  </div>
  </div>
  </div>
  )}

 {/* No track playing on mobile - show simple quick actions */}
 {!showPlayerControls && (
   <div className="md:hidden px-4 pt-2 pb-1 flex justify-center gap-2">
     <button
       type="button"
       onClick={() => handleToggle('offline')}
       disabled={pendingAction === 'offline'}
       className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${offlineActive ? 'border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]' : 'border-white/10 bg-white/5 text-white/70'}`}
     >
       <WifiOff className="w-3.5 h-3.5" fill="none" strokeWidth={2} />
       <span>{offlineActive ? 'offline on' : 'offline'}</span>
     </button>
     <button
       type="button"
       onClick={() => handleToggle('lowPower')}
       disabled={pendingAction === 'lowPower'}
       className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${lowPowerActive ? 'border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]' : 'border-white/10 bg-white/5 text-white/70'}`}
     >
       <Zap className="w-3.5 h-3.5" fill="none" strokeWidth={2} />
       <span>low data</span>
     </button>
   </div>
 )}

 {/* Nav icons row (always shown) */}
 <div className="flex justify-around items-center h-14 xl:h-16">
   {navItems.map((item) => {
     const Icon = item.icon;
     const isActive = getIsActive(item);
     return (
       <button
         key={item.path}
         onClick={() => handleNavClick(item.path, isActive)}
         className={`flex flex-col items-center justify-center flex-1 h-full transition-none ${isActive ? 'text-[#f6b012]' : 'text-white'} hover:text-[#ffd86a]`}
       >
         <Icon className="w-6 h-6 xl:w-10 xl:h-10 stroke-current" fill="none" strokeWidth={2} />
         <span className="hidden md:block text-xs xl:text-sm lowercase leading-none mt-0.5 xl:mt-1">
           {item.label}
         </span>
       </button>
     );
   })}
 </div>
 </nav>

 </>
 );
}
