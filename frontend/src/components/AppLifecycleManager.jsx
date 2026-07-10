import { useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { usePlayerStore } from '../store';
import { resolveMediaUrl } from '../api';
import { consumeWidgetAction } from '../widgetBridge';
import { nativeMusic, NATIVE_MUSIC_STATE } from '../native/nativeMusic';

function getBackgroundModePlugin() {
  if (typeof window === 'undefined') return null;
  return window.cordova?.plugins?.backgroundMode || null;
}

const SILENT_AUDIO_URI = 'data:audio/mpeg;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQyAFRTU0UAAAAPAAADTGF2ZjYwLjMuMTAwAAAAAAAAAAAAAAD/8MUAAAAAAAAAAAAAAAAAAAAAABVbm5hbWVkAFVubmFtZWQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * AppLifecycleManager handles the "bulletproof" background playback persistence.
 * It manages heartbeats, stall detection, and Capacitor background mode.
 * Hardened against: duplicate listeners, stale refs, race conditions, promise rejections,
 * memory leaks, configuration changes, process death/recreation.
 */
const AppLifecycleManager = () => {
  const silentAudioRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const durIntRef = useRef(null);
  const posIntRef = useRef(null);
  const stallCounterRef = useRef(0);
  const lastPositionSeenRef = useRef(0);
  const mainAudioRef = useRef(null);
  const crossfadeAudioRef = useRef(null);
  const isMountedRef = useRef(true);
  const nativeListenerRef = useRef(null);
  const lifecycleListenersRef = useRef([]);
  const mediaSessionHandlersRef = useRef(null);
  const wakeLockRef = useRef(null);
  const positionIntervalRef = useRef(null);
  
  const {
    currentTrack,
    isPlaying,
    currentPosition,
    audioRef,
    resumeAudioContext,
    flushPositionSync,
    nextTrack,
    playPause,
    previousTrack,
    jump,
    seekTo,
    queue,
    currentQueueIndex,
    loadQueue,
    playTrack,
    reorderQueueItem,
    setAudioRef,
    setCrossfadeAudioRef,
    isDraggingProgress,
    setCurrentPosition,
    setAudioDuration,
  } = usePlayerStore();

  // Safe state getter that checks mounted status
  const getSafeState = useCallback(() => {
    if (!isMountedRef.current) return null;
    return usePlayerStore.getState();
  }, []);

  // Safe audio element accessor
  const getAudio = useCallback(() => {
    const state = getSafeState();
    return state?.audioRef ?? mainAudioRef.current;
  }, [getSafeState]);

  // 1. Initialize Main Audio Elements (Main & Crossfade) — skip when native handles playback
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (nativeMusic.isAvailable) return;

    isMountedRef.current = true;

    // Initialize Main Audio
    const audio = document.createElement('audio');
    audio.id = 'background-audio-player';
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.crossOrigin = 'anonymous';
    audio.style.display = 'none';
    document.body.appendChild(audio);
    mainAudioRef.current = audio;

    // Initialize Crossfade Audio
    const crossfade = document.createElement('audio');
    crossfade.id = 'crossfade-audio-player';
    crossfade.preload = 'none';
    crossfade.setAttribute('playsinline', 'true');
    crossfade.setAttribute('webkit-playsinline', 'true');
    crossfade.crossOrigin = 'anonymous';
    crossfade.style.display = 'none';
    document.body.appendChild(crossfade);
    crossfadeAudioRef.current = crossfade;

    // Sync with store
    const store = usePlayerStore.getState();
    store.setAudioRef(audio);
    store.setCrossfadeAudioRef(crossfade);

    // Core Event Listeners
    const handleTimeUpdate = () => {
      const s = getSafeState();
      if (!s) return;
      const isDragging = typeof window !== 'undefined' && !!window.__isDraggingProgressRef;
      if (isDragging || s.isDraggingProgress) return;
      if (audio.currentTime === 0 && s.currentPosition > 5) return;
      s.setCurrentPosition(audio.currentTime);
    };

    const handleDurationChange = () => {
      if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
        const state = getSafeState();
        if (state) state.setAudioDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      const state = getSafeState();
      if (state) state.nextTrack();
    };

    const handleError = () => {
      const s = getSafeState();
      if (s && audio.error && s.isPlaying && audio.src) {
        console.error("Audio error detected, attempting recovery:", audio.error);
        setTimeout(() => {
          const currentState = getSafeState();
          if (currentState && currentState.isPlaying) {
            currentState.forceRecovery();
          }
        }, 2000);
      }
    };

    const handleStall = () => {
      const s = getSafeState();
      if (s && s.isPlaying && audio.paused && !audio.ended) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleStall);
    audio.addEventListener('stalled', handleStall);
    audio.addEventListener('suspend', handleStall);

    // Critical Sync Intervals (Fallback for when events don't fire in background)
    durIntRef.current = setInterval(handleDurationChange, 3000);
    posIntRef.current = setInterval(() => {
      const s = getSafeState();
      const isDragging = typeof window !== 'undefined' && !!window.__isDraggingProgressRef;
      if (s && s.isPlaying && !isDragging && !s.isDraggingProgress && Number.isFinite(audio.currentTime)) {
        s.setCurrentPosition(audio.currentTime);
      }
    }, 1000);

    // Initialize Silent Loop (Audio Thread Keep-Alive)
    const silent = document.createElement('audio');
    silent.id = 'silent-audio-loop';
    silent.src = SILENT_AUDIO_URI;
    silent.loop = true;
    silent.volume = 0.01;
    silent.style.display = 'none';
    document.body.appendChild(silent);
    silentAudioRef.current = silent;

    return () => {
      isMountedRef.current = false;
      
      if (durIntRef.current) clearInterval(durIntRef.current);
      if (posIntRef.current) clearInterval(posIntRef.current);
      
      const cleanupAudio = (el) => {
        if (el) {
          el.removeEventListener('timeupdate', handleTimeUpdate);
          el.removeEventListener('durationchange', handleDurationChange);
          el.removeEventListener('ended', handleEnded);
          el.removeEventListener('error', handleError);
          el.removeEventListener('waiting', handleStall);
          el.removeEventListener('stalled', handleStall);
          el.removeEventListener('suspend', handleStall);
          try {
            el.pause();
            el.src = '';
            el.load();
          } catch (e) {}
          el.parentNode?.removeChild(el);
        }
      };
      
      cleanupAudio(mainAudioRef.current);
      cleanupAudio(crossfadeAudioRef.current);
      cleanupAudio(silentAudioRef.current);
      
      // Nullify store refs to prevent stale references
      const store = usePlayerStore.getState();
      store.setAudioRef(null);
      store.setCrossfadeAudioRef(null);
      
      mainAudioRef.current = null;
      crossfadeAudioRef.current = null;
      silentAudioRef.current = null;
    };
  }, [getSafeState]);

  // Cleanup web audio elements when native player becomes available
  useEffect(() => {
    if (!nativeMusic.isAvailable) return;
    
    const store = usePlayerStore.getState();
    const audio = store.audioRef;
    const crossfade = store.crossfadeAudioRef;
    const silent = silentAudioRef.current;
    
    const cleanupAudio = (el) => {
      if (el) {
        try {
          el.pause();
          el.src = '';
          el.load();
        } catch (e) {}
        el.parentNode?.removeChild(el);
      }
    };
    
    cleanupAudio(audio);
    cleanupAudio(crossfade);
    cleanupAudio(silent);
    
    store.setAudioRef(null);
    store.setCrossfadeAudioRef(null);
    mainAudioRef.current = null;
    crossfadeAudioRef.current = null;
    silentAudioRef.current = null;
    
    // Clear intervals
    if (durIntRef.current) clearInterval(durIntRef.current);
    if (posIntRef.current) clearInterval(posIntRef.current);
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, [nativeMusic.isAvailable]);

  // 2. Heartbeat & Stall Detection Logic (skipped when native handles playback)
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (nativeMusic.isAvailable) return;
    
    heartbeatIntervalRef.current = setInterval(() => {
      const store = getSafeState();
      if (!store || !store.isPlaying) return;

      const audio = store.audioRef;
      const silentAudio = silentAudioRef.current;

      if (silentAudio) {
        if (audio && !audio.paused && audio.src) {
          if (!silentAudio.paused) {
            silentAudio.pause().catch(() => {});
          }
        } else if (silentAudio.paused) {
          silentAudio.play().catch(() => {});
        }
      }

      if (audio) {
        const currentPos = audio.currentTime;
        if (currentPos === lastPositionSeenRef.current && !audio.paused && !audio.ended && audio.readyState >= 2) {
          stallCounterRef.current++;
          if (stallCounterRef.current > 5) {
            console.warn("Playback stall detected in heartbeat, forcing recovery...");
            store.forceRecovery();
            stallCounterRef.current = 0;
          }
        } else {
          stallCounterRef.current = 0;
        }
        lastPositionSeenRef.current = currentPos;

        if (audio.paused && !audio.ended && audio.readyState >= 2) {
          audio.play().catch(() => {});
        }
      }

      if (store.resumeAudioContext) store.resumeAudioContext();
    }, 1000);
  }, [getSafeState]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // 3. Widget Action Processing
  const processWidgetAction = useCallback(async () => {
    try {
      const pendingAction = await consumeWidgetAction();
      if (!pendingAction) return;

      const action = pendingAction?.action;
      if (!action) return;

      if (pendingAction.route) {
        window.location.hash = pendingAction.route;
      }

      const store = usePlayerStore.getState();

      switch (action) {
        case 'playPause':
          await store.playPause();
          break;
        case 'nextTrack':
          store.nextTrack();
          break;
        case 'previousTrack':
          store.previousTrack();
          break;
        case 'playQueueItem':
          if (!store.queue.length) await store.loadQueue();
          const latestStore = usePlayerStore.getState();
          const qid = Number(pendingAction.queueItemId);
          const idx = latestStore.queue.findIndex(it => Number(it.id) === qid);
          if (idx >= 0) await latestStore.playTrack(latestStore.queue[idx].track, idx);
          break;
        case 'reorderQueueItem':
          await store.reorderQueueItem(Number(pendingAction.queueItemId), Number(pendingAction.newPosition));
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Widget action failed:", err);
    }
  }, []);

  // 4. App Lifecycle Management (Background/Foreground)
  const handleAppLifecycle = useCallback(async (isActive) => {
    const store = getSafeState();
    if (!store) return;
    
    const audio = store.audioRef;
    const silentAudio = silentAudioRef.current;
    const bgMode = getBackgroundModePlugin();

    if (!isActive) {
      // ENTERING BACKGROUND
      if (store.currentTrack && !nativeMusic.isAvailable) {
        try {
          bgMode?.setDefaults({
            title: 'vibe music player',
            text: `playing: ${store.currentTrack.title || 'track'}`,
            icon: 'ic_player', 
            color: '050505',
            resume: true,
            hidden: false,
            bigText: true,
            priority: 2
          });
          bgMode?.enable();
          bgMode?.overrideBackButton();
          bgMode?.disableWebViewOptimizations?.();
          bgMode?.disableBatteryOptimizations?.();
        } catch (e) { 
          console.warn("BackgroundMode activation failed:", e); 
        }
      }

      if (store.isPlaying) {
        startHeartbeat();
        if (!nativeMusic.isAvailable) {
          if (audio?.paused) audio.play().catch(() => {});
          if (silentAudio?.paused) silentAudio.play().catch(() => {});
        }
      }
      store.flushPositionSync();
    } else {
      // RETURNING TO FOREGROUND
      stopHeartbeat();
      if (!nativeMusic.isAvailable) {
        if (store.resumeAudioContext) store.resumeAudioContext();
        if (store.isPlaying && audio && audio.paused) {
          audio.play().catch(() => {});
        }

        // Sync position to fix potential webview drift
        setTimeout(() => {
          const s = getSafeState();
          const a = s?.audioRef;
          if (!a || !s?.currentTrack) return;
          if (s.currentPosition > 0 && Math.abs(a.currentTime - s.currentPosition) > 5) {
            try { a.currentTime = s.currentPosition; } catch (e) {}
          }
        }, 300);
      }

      processWidgetAction();
    }
  }, [startHeartbeat, stopHeartbeat, processWidgetAction, getSafeState]);

  // Lifecycle effect with proper cleanup tracking
  useEffect(() => {
    const onVisibilityChange = () => handleAppLifecycle(document.visibilityState === 'visible');
    const onBeforeUnload = () => {
      const state = usePlayerStore.getState();
      state.flushPositionSync();
      nativeMusic.stop().catch(() => {});
    };
    
    let capacitorSub = null;
    if (CapacitorApp?.addListener) {
      capacitorSub = CapacitorApp.addListener('appStateChange', ({ isActive }) => handleAppLifecycle(isActive));
      lifecycleListenersRef.current.push(capacitorSub);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('focus', processWidgetAction);
    lifecycleListenersRef.current.push(
      { type: 'visibility', handler: onVisibilityChange },
      { type: 'beforeunload', handler: onBeforeUnload },
      { type: 'focus', handler: processWidgetAction }
    );

    if (document.visibilityState !== 'visible') {
      handleAppLifecycle(false);
    }

    return () => {
      isMountedRef.current = false;
      stopHeartbeat();
      
      lifecycleListenersRef.current.forEach(l => {
        if (l?.remove) l.remove();
        else if (l?.type === 'visibility') document.removeEventListener('visibilitychange', l.handler);
        else if (l?.type === 'beforeunload') window.removeEventListener('beforeunload', l.handler);
        else if (l?.type === 'focus') window.removeEventListener('focus', l.handler);
      });
      lifecycleListenersRef.current = [];
      
      capacitorSub?.remove?.();
    };
  }, [handleAppLifecycle, stopHeartbeat, processWidgetAction]);

  // 5. Sync Play/Pause state with Audio Element (only for system-initiated pauses, skipped when native)
  useEffect(() => {
    if (nativeMusic.isAvailable) return;
    const audio = mainAudioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying && audio.paused && audio.src && !audio.ended) {
      audio.play().catch(() => {});
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // 6. MediaSession API Integration (skipped when native handles it)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (nativeMusic.isAvailable) return;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try { 
          wakeLockRef.current = await navigator.wakeLock.request('screen'); 
        } catch (e) {}
      }
    };

    const updatePos = () => {
      const store = getSafeState();
      const a = store?.audioRef;
      if (!a || !store?.currentTrack) return;
      try {
        const duration = Number(a.duration || 0);
        const safeDur = Number.isFinite(duration) && duration > 0 ? duration : 0;
        const safePos = Math.max(0, Math.min(store.currentPosition || 0, safeDur || 9999));
        navigator.mediaSession.setPositionState?.({
          duration: safeDur,
          playbackRate: 1,
          position: safePos,
        });
      } catch (e) {}
    };

    if (!currentTrack) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    const artwork = currentTrack.cover_art_url ? [
      { src: resolveMediaUrl(currentTrack.cover_art_url), sizes: '512x512' }
    ] : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || 'Unknown',
      artist: currentTrack.artist || 'Unknown',
      album: currentTrack.album || 'Unknown',
      artwork
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    if (isPlaying) {
      positionIntervalRef.current = setInterval(updatePos, 1000);
      requestWakeLock();
    }

    const handlers = {
      play: () => usePlayerStore.getState().playPause(),
      pause: () => usePlayerStore.getState().playPause(),
      previoustrack: () => usePlayerStore.getState().previousTrack(),
      nexttrack: () => usePlayerStore.getState().nextTrack(),
      seekbackward: (d) => usePlayerStore.getState().jump(-(d.seekOffset || 10)),
      seekforward: (d) => usePlayerStore.getState().jump(d.seekOffset || 10),
      seekto: (d) => usePlayerStore.getState().seekTo(d.seekTime),
      stop: () => usePlayerStore.getState().playPause(),
    };

    mediaSessionHandlersRef.current = handlers;
    Object.entries(handlers).forEach(([action, handler]) => {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) {}
    });

    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      // Clear media session handlers
      if (mediaSessionHandlersRef.current) {
        Object.keys(mediaSessionHandlersRef.current).forEach(action => {
          try { navigator.mediaSession.setActionHandler(action, null); } catch (e) {}
        });
        mediaSessionHandlersRef.current = null;
      }
    };
  }, [currentTrack, isPlaying, currentPosition, getSafeState]);

  // 7. Native State Listener — forwards native playback events to the store
  useEffect(() => {
    if (!nativeMusic.isAvailable) return;

    const handler = (data) => {
      const s = getSafeState();
      if (!s) return;

      if (data.state === NATIVE_MUSIC_STATE.COMPLETED) {
        const beforeId = s.currentTrack?.id;
        s.nextTrack();
        // If nextTrack didn't start a new track, fully stop native
        setTimeout(() => {
          const after = getSafeState();
          if (after && after.currentTrack?.id === beforeId) {
            nativeMusic.stop().catch(() => {});
            usePlayerStore.setState({ isPlaying: false });
          }
        }, 200);
      } else if (data.state === NATIVE_MUSIC_STATE.ERROR) {
        s.forceRecovery();
      }

      // Sync isPlaying with native state
      if (data.state === NATIVE_MUSIC_STATE.PLAYING && !s.isPlaying) {
        usePlayerStore.setState({ isPlaying: true });
      } else if (data.state === NATIVE_MUSIC_STATE.PAUSED && s.isPlaying) {
        usePlayerStore.setState({ isPlaying: false });
      }

      if (data.position != null) {
        if (!s.isDraggingProgress) {
          s.setCurrentPosition(data.position);
        }
      }
      if (data.duration != null && data.duration > 0) {
        s.setAudioDuration(data.duration);
      }
    };

    nativeListenerRef.current = nativeMusic.onStateChange(handler);

    return () => {
      nativeListenerRef.current?.();
      nativeListenerRef.current = null;
    };
  }, [getSafeState]);

  return null;
};

export default AppLifecycleManager;