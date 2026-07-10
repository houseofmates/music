import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../store";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Repeat1, 
  Shuffle, 
  ChevronDown,
  Heart,
  ListMusic,
  MessageSquareText,
  Volume2,
  VolumeX,
  Keyboard
} from "../icons.jsx";
import { shallow } from "zustand/shallow";
import ImageWithFallback from "./ImageWithFallback";
import LyricsPanel from "./LyricsPanel";
import { resolveMediaUrl } from "../api.js";
import { triggerImpact } from "../utils/haptics";
import { useProgressDrag } from "../hooks/useProgressDrag";

// Live getters so the progress fill animates from the <audio> element's
// currentTime at 60fps (native path falls back to the store position).
const liveDuration = () => {
  const s = usePlayerStore.getState();
  return s.audioDuration || s.currentTrack?.duration || 0;
};
const livePosition = () => {
  const s = usePlayerStore.getState();
  const t = s.audioRef?.currentTime;
  return Number.isFinite(t) ? t : s.currentPosition;
};

function AudioVisualizer({ audio, isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (!audio || !canvasRef.current) return;

    const audioEl = audio;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioEl);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    } catch (e) {
      return () => window.removeEventListener("resize", resize);
    }

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * height * 0.8;
        
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, "#f6b012");
        gradient.addColorStop(1, "rgba(246, 176, 18, 0.2)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audio, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-24 opacity-60"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
}

function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "space / k", action: "play/pause" },
    { key: "← / j", action: "previous track" },
    { key: "→ / l", action: "next track" },
    { key: "↑", action: "volume up" },
    { key: "↓", action: "volume down" },
    { key: "m", action: "mute/unmute" },
    { key: "f", action: "toggle favorite" },
    { key: "q", action: "toggle queue" },
    { key: "s", action: "toggle shuffle" },
    { key: "r", action: "toggle repeat" },
    { key: "?", action: "show/hide shortcuts" },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#111] rounded-2xl p-6 max-w-md w-full border border-[#333]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">keyboard shortcuts</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-[#222] last:border-0">
              <kbd className="px-3 py-1 bg-[#222] rounded-lg text-[#f6b012] font-mono text-sm">
                {key}
              </kbd>
              <span className="text-white/80 text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NowPlaying({ onClose }) {
  const {
    currentTrack,
    isPlaying,
    currentPosition,
    audioDuration,
    repeatMode,
    shuffle,
    showLyrics,
    favorites,
    queue,
    currentQueueIndex,
    playPause,
    nextTrack,
    previousTrack,
    seekTo,
    setRepeatMode,
    toggleShuffle,
    toggleLyrics,
    toggleFavorite,
    audioRef,
    volume,
    setVolume,
  } = usePlayerStore((s) => ({
    currentTrack: s.currentTrack,
    isPlaying: s.isPlaying,
    currentPosition: s.currentPosition,
    audioDuration: s.audioDuration,
    repeatMode: s.repeatMode,
    shuffle: s.shuffle,
    showLyrics: s.showLyrics,
    favorites: s.favorites,
    queue: s.queue,
    currentQueueIndex: s.currentQueueIndex,
    playPause: s.playPause,
    nextTrack: s.nextTrack,
    previousTrack: s.previousTrack,
    seekTo: s.seekTo,
    setRepeatMode: s.setRepeatMode,
    toggleShuffle: s.toggleShuffle,
    toggleLyrics: s.toggleLyrics,
    toggleFavorite: s.toggleFavorite,
    audioRef: s.audioRef,
    volume: s.volume,
    setVolume: s.setVolume,
  }), shallow);

  const [showQueue, setShowQueue] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef(null);
  const [localVolume, setLocalVolume] = useState(volume || 0.8);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (showVolumeSlider) {
        setShowVolumeSlider(false);
      }
    };
    
    if (showVolumeSlider) {
      const timer = setTimeout(() => {
        document.addEventListener("click", handleGlobalClick);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleGlobalClick);
      };
    }
  }, [showVolumeSlider]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
      if (e.key === "escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const duration = audioDuration || currentTrack?.duration || 0;

  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);

  const { onPointerDown } = useProgressDrag({
    getDuration: liveDuration,
    getCurrentPosition: livePosition,
    onSeek: seekTo,
    trackRef,
    fillRef,
    thumbRef,
  });

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setLocalVolume(newVol);
    setVolume(newVol);
  };

  const toggleMute = () => {
    if (audioRef) {
      audioRef.muted = !audioRef.muted;
    }
  };

  const isMuted = audioRef?.muted || localVolume === 0;

  const isFavorite = favorites.some(f => f.id === currentTrack?.id);

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* header */}
      <div className="relative flex items-center justify-center pt-safe py-3 px-4 border-b border-[#222] shrink-0">
        <button 
          onClick={onClose}
          className="absolute left-4 p-2 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <span className="text-white/60 text-sm uppercase tracking-wider">now playing</span>
        <button 
          onClick={() => setShowShortcuts(true)}
          className="absolute right-4 p-2 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors"
        >
          <Keyboard className="w-6 h-6" />
        </button>
      </div>

      {/* main content */}
      <div className="flex-1 flex flex-col items-center p-4 overflow-hidden min-h-0 relative">
        {/* track info */}
        <div className="text-center w-full shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-white truncate px-4">
            {currentTrack.title || currentTrack.filename}
          </h1>
          <p className="text-sm text-white/80 font-normal italic my-2">
            {(() => {
              const artist = currentTrack.artist || "unknown artist";
              const artistParts = artist.split(/(\s*(?:ft\.|feat\.|&|,|and)\s*)/i);
              return artistParts.map((part, idx) => {
                if (/^(\s*(?:ft\.|feat\.|&|,|and)\s*)$/i.test(part)) {
                  return <span key={idx}>{part}</span>;
                }
                return <span key={idx} className="italic">{part}</span>;
              });
            })()}
          </p>
          {currentTrack.album && (
            <p className="text-xs text-[#f6b012]">{currentTrack.album}</p>
          )}
        </div>

        {/* album art - always visible, shrinks when lyrics are on */}
        <div className="flex-1 min-h-0 w-full max-w-sm relative mb-2 flex items-center justify-center">
          <ImageWithFallback
            src={resolveMediaUrl(currentTrack.cover_art_url)}
            alt={currentTrack.album || currentTrack.title}
            fallbackText={currentTrack.title}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
          />
          {isPlaying && (
            <div className="absolute -bottom-2 left-0 right-0 px-4">
              <AudioVisualizer audio={audioRef} isPlaying={isPlaying} />
            </div>
          )}
        </div>

        {/* lyrics popout - compact floating panel */}
        {showLyrics && (
          <div className="w-full max-w-sm shrink-0 h-48 mb-2 rounded-2xl bg-black/80 backdrop-blur border border-white/10 overflow-visible flex flex-col p-1">
            <LyricsPanel track={currentTrack} embedded />
          </div>
        )}

        {/* secondary controls */}
        <div className="flex items-center gap-4 mb-2 shrink-0">
          <button
            onClick={() => toggleFavorite(currentTrack)}
            className={`p-2.5 rounded-full transition-colors ${
              isFavorite ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => setShowQueue(v => !v)}
            className={`p-2.5 rounded-full transition-colors ${
              showQueue ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white"
            }`}
          >
            <ListMusic className="w-5 h-5" />
          </button>

          <button
            onClick={toggleLyrics}
            className={`p-2.5 rounded-full transition-colors ${
              showLyrics ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white"
            }`}
          >
            <MessageSquareText className="w-5 h-5" />
          </button>
        </div>

        {/* controls row */}
        <div className="flex items-center justify-center gap-2 shrink-0">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              shuffle ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRepeatMode(repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none")}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== "none" ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
            }`}
          >
            {repeatMode === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>

          <button
            onClick={previousTrack}
            className="p-2.5 rounded-full bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={() => {
              triggerImpact("medium");
              playPause();
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#f6b012] text-black hover:bg-[#ffcc40] transition-colors"
            aria-label={isPlaying ? "pause" : "play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current pl-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2.5 rounded-full bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <div ref={volumeRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumeSlider(v => !v);
              }}
              className={`p-2 rounded-full transition-colors ${
                showVolumeSlider ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
              }`}
              aria-label={isMuted ? "unmute" : "mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            {showVolumeSlider && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1a1a] border border-[#333] rounded-xl p-3 shadow-lg z-50 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : localVolume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-28 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f6b012 0%, #f6b012 ${isMuted ? 0 : localVolume * 100}%, #333 ${isMuted ? 0 : localVolume * 100}%, #333 100%)`
                  }}
                  aria-label="volume control"
                />
              </div>
            )}
          </div>
        </div>

        {/* progress bar row — the ref/handler go on the TRACK element itself so
            the pointer maths use the same box the fill/thumb are positioned in.
            (Previously the ref was on this outer flex row, which includes the
            two time labels, so the drag geometry never matched the visible bar
            and the thumb did not follow the finger.) */}
        <div className="flex items-center gap-2 w-full max-w-[280px] select-none shrink-0">
          <span className="text-xs text-white/60 w-10 text-right">{formatTime(currentPosition)}</span>
          <div
            ref={trackRef}
            className={`flex-1 h-1.5 bg-[#222] rounded-full relative cursor-pointer`}
            style={{ touchAction: 'none' }}
            onPointerDown={onPointerDown}
          >
            <div
              ref={fillRef}
              className="absolute left-0 top-0 bottom-0 bg-[#f6b012] rounded-full"
              style={{ width: 0 }}
            />
            <div
              ref={thumbRef}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f6b012] rounded-full border-2 border-white/80 shadow-sm"
              style={{ left: '-6px' }}
            />
          </div>
          <span className="text-xs text-white/60 w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* queue panel */}
      {showQueue && (
        <div className="absolute inset-x-0 bottom-0 bg-[#111] border-t border-[#333] rounded-t-3xl max-h-[50vh] overflow-y-auto z-10">
          <div className="p-4">
            <div className="w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-white font-semibold mb-4">up next ({queue.length})</h3>
              {queue.slice(currentQueueIndex + 1, currentQueueIndex + 11).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#1a1a1a]">
                  <span className="text-white/40 w-6">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{item.track.title || item.track.filename}</p>
                    <p className="text-white/60 text-xs truncate">{item.track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}