import { create } from 'zustand';
import * as api from './api';
import { getAuthToken, setAuthToken as apiSetAuthToken, clearAuthToken } from './api';
import { audioStreamingManager } from './utils/audioStreaming';
import offlineManager from './services/offlineManager';
import { nativeMusic } from './native/nativeMusic';

export const usePlayerStore = create((set, get) => ({
  // Audio context for background playback (silent buffer)
  audioContext: null,
  silentNode: null,
  
  // Auth & user
  authToken: getAuthToken(),
  user: null,
  isAuthenticated: false,

  // Player state
  currentTrack: null,
  currentPosition: 0,
  isPlaying: false,
  volume: 0.8,
  repeatMode: 'none', // none, one, all
  shuffle: false,
  showLyrics: false,
  showEnhancedMetadata: false,
  searchOverlayActive: false,

  // User settings (syncs)
  settings: {
    offlineMode: false,
    crossfadeSeconds: 0.8,
    isCrossfadeEnabled: true,
    gaplessPlayback: true,
    lowPowerMode: false,
    audioProcessing: {
      equalizer_preset: null,
      effects: [],
      spatial_preset: null,
      normalize: false,
      compression: false,
      compression_settings: {
        attack: 0.3,
        release: 0.8,
        threshold: -20,
        ratio: 4,
        makeup: 8
      }
    }
  },

  // Network monitoring for handoff
  networkType: 'wifi',
  networkSpeed: 'high',
  isOnline: navigator.onLine,
  connectionMonitor: null,

  // Queue
  queue: [],
  currentQueueIndex: -1,
  
  // Audio element ref (not persisted)
  audioRef: null,
  crossfadeAudioRef: null,
  isCrossfading: false,
  nextTrackPreloaded: false,
  preloaderRef: null,

  setAudioRef: (audioRef) => set({ audioRef }),
  setCrossfadeAudioRef: (ref) => set({ crossfadeAudioRef: ref }),
  
  // Initialize audio context for background playback (deferred until user interaction)
  initAudioContext: () => {
    if (typeof window === 'undefined') return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      // Set queue getter for audioStreamingManager
      audioStreamingManager.setQueueGetter(() => get().queue.map(item => item.track));
    } catch (e) {
      // AudioContext not available in this environment; silent fallback.
    }
  },

  // Create audio context after user interaction
  createAudioContext: () => {
    if (typeof window === 'undefined') return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      set({ audioContext });

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      gainNode.gain.value = 0.01;
      oscillator.frequency.value = 40;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      set({ silentNode: { oscillator, gainNode } });

      const resumeAudio = () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          resumeAudio();
        }
      });

      window.addEventListener('focus', resumeAudio);
    } catch (e) {
    }
  },

  disconnectSilentNode: () => {
    const { silentNode } = get();
    if (silentNode) {
      try { silentNode.gainNode.disconnect(); } catch (e) {}
    }
  },

  reconnectSilentNode: () => {
    const { silentNode, audioContext } = get();
    if (silentNode && audioContext) {
      try { silentNode.gainNode.connect(audioContext.destination); } catch (e) {}
    }
  },
  
  // Resume audio context (call when app returns to foreground)
  resumeAudioContext: () => {
    const { audioContext } = get();
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  },

  // Network monitoring for seamless handoffs
  startNetworkMonitoring: () => {
    const monitorConnection = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const updateNetworkInfo = () => {
          const { effectiveType, downlink } = connection;
          const networkType = effectiveType === '4g' ? 'wifi' : 
                            effectiveType === '3g' ? 'mobile' : 'slow';
          const networkSpeed = downlink > 1.5 ? 'high' : 
                             downlink > 0.5 ? 'medium' : 'low';
          
          set({ 
            networkType, 
            networkSpeed,
            isOnline: navigator.onLine 
          });

          // Aggressively adapt quality and preloading based on network state
          get().adaptAudioQuality(networkType, networkSpeed);
        };

        connection.addEventListener('change', updateNetworkInfo);
        updateNetworkInfo();
      }

      const handleOnline = () => {
        set({ isOnline: true });
        get().handleNetworkReconnect();
      };
      
      const handleOffline = () => {
        set({ isOnline: false });
        get().handleNetworkDisconnect();
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      set({ connectionMonitor: { connection, handleOnline, handleOffline, handleChange: updateNetworkInfo } });
    };

    monitorConnection();
  },

  stopNetworkMonitoring: () => {
    const { connectionMonitor } = get();
    if (connectionMonitor) {
      const { connection, handleOnline, handleOffline, handleChange } = connectionMonitor;
      if (connection && handleChange) {
        connection.removeEventListener('change', handleChange);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      set({ connectionMonitor: null });
    }
  },

  adaptAudioQuality: (networkType, networkSpeed) => {
    const { audioRef, currentTrack } = get();
    if (!audioRef || !currentTrack) return;

    // Adjust buffer size and preload strategy based on network
    if (networkSpeed === 'low') {
      // Reduce preload, increase buffer for stability
      audioRef.preload = 'none';
    } else if (networkSpeed === 'high') {
      // Enable aggressive preloading for smooth experience
      audioRef.preload = 'auto';
      get().preloadNextTrack();
    }
  },

  preloadNextTrack: async () => {
    const { queue, currentQueueIndex, repeatMode, shuffle, nextTrackPreloaded } = get();
    if (nextTrackPreloaded || queue.length === 0) return;

    let nextIndex;
    if (repeatMode === 'one') {
      nextIndex = currentQueueIndex;
    } else if (shuffle) {
      try {
        nextIndex = await get()._smartShufflePick();
        if (nextIndex === null || nextIndex === undefined) {
          // Fallback to random
          nextIndex = Math.floor(Math.random() * queue.length);
          if (nextIndex === currentQueueIndex && queue.length > 1) {
            nextIndex = (nextIndex + 1) % queue.length;
          }
        }
      } catch (e) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
    } else {
      nextIndex = currentQueueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return; // End of queue
        }
      }
    }

    const nextTrack = queue[nextIndex]?.track;
    if (nextTrack) {
      // Check if track is available offline first
      const offlineResponse = await offlineManager.getOfflineStream(nextTrack.id);
      let url;
      
      if (offlineResponse) {
        const blob = await offlineResponse.blob();
        url = URL.createObjectURL(blob);
      } else {
        url = api.getTrackStreamSrc(nextTrack.id);
      }

      // Use a persistent preloader reference in the state to prevent GC
      const preloader = new Audio();
      preloader.preload = 'auto';
      preloader.crossOrigin = 'anonymous';
      preloader.src = url;
      
      // Cleanup previous object URL if it was a blob URL
      if (get().preloaderRef?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(get().preloaderRef.src);
      }

      set({ 
        nextTrackPreloaded: true,
        preloaderRef: preloader
      });
    }
  },

  handleNetworkReconnect: () => {
    const { currentTrack, isPlaying, audioRef } = get();
    
    // If we have a track and it's supposed to be playing, ensure it's active
    if (currentTrack && isPlaying && audioRef) {
      if (audioRef.paused || audioRef.error || audioRef.readyState < 2) {
        // If we were on a blob (offline fallback), maybe stay on it until track ends
        // or proactively reload from network for potentially higher quality/stability.
        // For 'bulletproof' stability, we refresh the source.
        const currentPos = audioRef.currentTime;
        audioRef.src = api.getTrackStreamSrc(currentTrack.id);
        audioRef.load();
        audioRef.currentTime = currentPos;
        audioRef.play().catch(() => {});
      }
    }

    // Refresh critical state from server
    get().loadQueue().catch(() => {});
    get().loadSettings().catch(() => {});
  },

  handleNetworkDisconnect: () => {
    const { isPlaying, audioRef, currentTrack } = get();
    
    // If we lose network while playing an online stream, try to hot-swap to offline cache
    if (isPlaying && audioRef && currentTrack && !audioRef.src.startsWith('blob:')) {
      offlineManager.getOfflineStream(currentTrack.id).then(async (response) => {
        if (response) {
          try {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const currentPos = audioRef.currentTime;
            
            // Seamlessly swap source
            audioRef.src = blobUrl;
            audioRef.currentTime = currentPos;
            audioRef.play().catch(() => {});
          } catch (e) {
            // Fallback swap failed
          }
        }
      });
    }
  },

  // Auth
  setAuthToken: (token) => {
    set({ authToken: token, isAuthenticated: Boolean(token) });
    apiSetAuthToken(token);
  },

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

  login: async (username, password) => {
    try {
      const response = await api.login(username, password);
      const token = response?.data?.access_token;
      if (token) {
        get().setAuthToken(token);
        await get().loadUser();
        await get().loadSettings();
        await get().loadFavorites();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (username, password) => {
    try {
      const response = await api.register(username, password);
      const token = response?.data?.access_token;
      if (token) {
        get().setAuthToken(token);
        await get().loadUser();
        await get().loadSettings();
        await get().loadFavorites();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    set({ authToken: null, user: null, isAuthenticated: false });
    clearAuthToken();
  },

  loadUser: async () => {
    try {
      const response = await api.getMe();
      if (response?.data) {
        set({ user: response.data, isAuthenticated: true });
        await get().loadFavorites();
      }
    } catch (error) {
      // User profile load failed; app continues in anonymous mode.
    }
  },

  loadSettings: async () => {
    try {
      const response = await api.getSettings();
      if (response?.data) {
        set({ settings: response.data });
        // Sync to audioStreamingManager
        if (response.data.crossfadeSeconds !== undefined) {
          audioStreamingManager.setCrossfadeDuration(response.data.crossfadeSeconds);
        }
        if (response.data.gaplessPlayback !== undefined) {
          audioStreamingManager.setGaplessEnabled(response.data.gaplessPlayback);
        }
      }
    } catch (error) {
      // Settings load failed; use local defaults.
    }
  },

  updateSettings: async (partialSettings = {}) => {
    const current = get().settings || {};
    const payload = { ...current, ...partialSettings };
    try {
      const response = await api.updateSettings(payload);
      const nextSettings = response?.data || payload;
      set({ settings: nextSettings });

      // Sync crossfade settings to audioStreamingManager
      if (nextSettings.crossfadeSeconds !== undefined) {
        audioStreamingManager.setCrossfadeDuration(nextSettings.crossfadeSeconds);
      }
      if (nextSettings.gaplessPlayback !== undefined) {
        audioStreamingManager.setGaplessEnabled(nextSettings.gaplessPlayback);
      }

      return nextSettings;
    } catch (error) {
      set({ settings: payload });
      throw error;
    }
  },

  toggleOfflineMode: async () => {
    const current = Boolean(get().settings?.offlineMode);
    return get().updateSettings({ offlineMode: !current });
  },

  toggleLowPowerMode: async () => {
    const current = Boolean(get().settings?.lowPowerMode);
    return get().updateSettings({ lowPowerMode: !current });
  },

  favorites: [],
  loadFavorites: async () => {
    try {
      const response = await api.getFavorites();
      const favs = Array.isArray(response?.data) ? response.data.map((item) => item.track) : [];
      set({ favorites: favs });
    } catch (error) {
      // Favorites load failed; continue with empty list.
    }
  },

  toggleFavorite: async (track) => {
    const { favorites } = get();
    const isFav = favorites.some((t) => t.id === track.id);
    try {
      if (isFav) {
        await api.removeFavorite(track.id);
        set({ favorites: favorites.filter((t) => t.id !== track.id) });
      } else {
        await api.addFavorite(track.id);
        set({ favorites: [...favorites, track] });
      }
    } catch (error) {
      // Favorite toggle failed; state remains unchanged.
    }
  },
  
  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
    api.updatePlayerState({ is_playing: playing });
  },
  
  setVolume: (volume) => {
    set({ volume });
    const { audioRef } = get();
    if (audioRef) {
      audioRef.volume = volume;
    }
    api.updatePlayerState({ volume });
  },
  
  // Cross-device position sync: throttle to avoid flooding the server.
  _lastSyncedPosition: 0,
  _positionSyncTimer: null,

  setCurrentPosition: (position) => {
    if (!Number.isFinite(position)) return;
    
    set({ currentPosition: position });

    const state = get();
    const track = state.currentTrack;
    if (!track) return;

    // Trigger aggressive preloading when near end of track (85% or 30s remaining)
    const remaining = (state.audioDuration || track.duration || 0) - position;
    if (!state.nextTrackPreloaded && (remaining < 30 || (state.audioDuration > 0 && position / state.audioDuration > 0.85))) {
      get().preloadNextTrack();
    }

    // Throttle position sync to backend (every 10 seconds or when significantly changed)
    if (state._positionSyncTimer) return;

    const timer = setTimeout(() => {
      const { currentPosition: pos, currentTrack: activeTrack } = get();
      if (activeTrack && pos != null) {
        api.updatePlayerState({ current_position: pos }).catch(() => {});
      }
      set({ _positionSyncTimer: null });
    }, 10000);

    set({ _positionSyncTimer: timer });
  },

  flushPositionSync: () => {
    const state = get();
    if (state._positionSyncTimer) {
      clearTimeout(state._positionSyncTimer);
      set({ _positionSyncTimer: null });
    }
    const { currentPosition, currentTrack } = state;
    if (currentTrack && currentPosition != null) {
      return api.updatePlayerState({ current_position: currentPosition }).catch(() => {});
    }
  },
  
  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
    api.updatePlayerState({ repeat_mode: mode });
  },
  
  toggleShuffle: () => {
    const { shuffle } = get();
    set({ shuffle: !shuffle });
    api.updatePlayerState({ shuffle: !shuffle });
  },
  
  toggleLyrics: () => {
    const { showLyrics } = get();
    set({ showLyrics: !showLyrics });
  },

  toggleEnhancedMetadata: () => {
    const { showEnhancedMetadata } = get();
    set({ showEnhancedMetadata: !showEnhancedMetadata });
  },

  setSearchOverlayActive: (active) => {
    set({ searchOverlayActive: Boolean(active) });
  },

  // Queue panel visibility (shared across Player + BottomNav)
  showQueue: false,
  toggleQueue: () => set((state) => ({ showQueue: !state.showQueue })),
  setShowQueue: (v) => set({ showQueue: Boolean(v) }),

  // Audio duration tracked from the <audio> element
  audioDuration: 0,
  setAudioDuration: (d) => set({ audioDuration: Number(d) || 0 }),

  // Dragging state for progress bars (prevents timeupdate override)
  isDraggingProgress: false,
  setIsDraggingProgress: (v) => {
    const boolVal = Boolean(v);
    set({ isDraggingProgress: boolVal });
    // Also update ref for synchronous access in event handlers
    if (typeof window !== 'undefined') {
      window.__isDraggingProgressRef = boolVal;
    }
  },
  
  // Synchronous ref for isDraggingProgress (accessible in event handlers without React batching delay)
  getIsDraggingProgressRef: () => {
    if (typeof window !== 'undefined') {
      return { get current() { return !!window.__isDraggingProgressRef; } };
    }
    return { get current() { return false; } };
  },
  
  fadeAudio: (audio, toVolume, duration = 600) => {
    if (!audio) return;
    // Clear any existing fade interval on this audio element to prevent overlapping fades.
    if (audio._fadeInterval) {
      clearInterval(audio._fadeInterval);
      audio._fadeInterval = null;
    }
    const startVolume = audio.volume;
    const target = Math.max(0, Math.min(toVolume, 1));
    if (duration <= 0 || startVolume === target) {
      audio.volume = target;
      return;
    }

    const step = 50;
    const steps = Math.ceil(duration / step);
    const delta = (target - startVolume) / steps;
    let currentStep = 0;

    const handle = setInterval(() => {
      currentStep += 1;
      audio.volume = Math.max(0, Math.min(1, audio.volume + delta));
      if (currentStep >= steps) {
        audio.volume = target;
        clearInterval(handle);
        if (audio._fadeInterval === handle) {
          audio._fadeInterval = null;
        }
      }
    }, step);
    audio._fadeInterval = handle;
    return handle;
  },

  playTrack: async (track, queueIndex = -1) => {
    const { audioRef, settings, volume, audioContext, queue } = get();

    // Create audio context on first user interaction if it doesn't exist
    if (!audioContext) {
      get().createAudioContext();
    }

    // Resume audio context if suspended (important for background playback)
    const { audioContext: updatedContext } = get();
    if (updatedContext && updatedContext.state === 'suspended') {
      await updatedContext.resume().catch(() => {});
    }

    // Destroy any existing gapless playback
    audioStreamingManager.destroyPlayback();

    // Disconnect silent oscillator to prevent audio pipeline interference
    get().disconnectSilentNode();

    // Set state BEFORE loading new source
    set({
      currentTrack: { ...track },
      currentQueueIndex: queueIndex,
      currentPosition: 0,
      isPlaying: true,
      nextTrackPreloaded: false,
      audioDuration: (track.duration && Number.isFinite(track.duration) && track.duration > 0) ? track.duration : 0,
    });

    try {
      const offlineResponse = await offlineManager.getOfflineStream(track.id);
      let streamUrl;
      if (offlineResponse) {
        const blob = await offlineResponse.blob();
        streamUrl = URL.createObjectURL(blob);
      } else {
        streamUrl = api.getTrackStreamSrc(track.id);
      }

      if (nativeMusic.isAvailable) {
        await nativeMusic.play(streamUrl, track);
      } else if (audioRef) {
        audioRef.src = streamUrl;
        audioRef.preload = 'auto';
        audioRef.load();

        await new Promise((resolve, reject) => {
          let done = false;
          const cleanup = () => {
            done = true;
            audioRef.removeEventListener('canplaythrough', onReady);
            audioRef.removeEventListener('progress', onProgress);
            audioRef.removeEventListener('error', onError);
          };
          const onReady = () => {
            const buffered = audioRef.buffered;
            let bufferedSeconds = 0;
            if (buffered.length > 0) {
              bufferedSeconds = buffered.end(buffered.length - 1) - buffered.start(0);
            }
            if (bufferedSeconds >= 3) {
              cleanup();
              resolve();
            }
          };
          const onProgress = () => {
            if (!done) onReady();
          };
          const onError = () => {
            cleanup();
            reject(new Error('audio load error'));
          };
          audioRef.addEventListener('canplaythrough', onReady);
          audioRef.addEventListener('progress', onProgress);
          audioRef.addEventListener('error', onError);
          setTimeout(() => { if (!done) { cleanup(); resolve(); } }, 10000);
        });

        await audioRef.play();
      }

      // Record play history
      try {
        await api.addHistory(track.id, 0, track.duration);
      } catch (err) {
        // History recording failed; non-critical.
      }

      api.updatePlayerState({
        current_track_id: track.id,
        current_position: 0,
        is_playing: true,
      });

    } catch (error) {
      set({ isPlaying: false });
    }
  },
  
  playPause: async () => {
    const { audioRef, isPlaying } = get();

    if (!audioRef && !nativeMusic.isAvailable) return;

    if (nativeMusic.isAvailable) {
      if (isPlaying) {
        await nativeMusic.pause();
        set({ isPlaying: false });
        api.updatePlayerState({ is_playing: false });
        get().reconnectSilentNode();
      } else {
        await nativeMusic.resume();
        set({ isPlaying: true });
        api.updatePlayerState({ is_playing: true });
      }
      return;
    }

    if (isPlaying) {
      audioRef.pause();
      set({ isPlaying: false });
      api.updatePlayerState({ is_playing: false });
      get().reconnectSilentNode();
    } else {
      try {
        await audioRef.play();
        set({ isPlaying: true });
        api.updatePlayerState({ is_playing: true });
      } catch (error) {
        set({ isPlaying: false });
      }
    }
  },
  
  forceRecovery: async () => {
    const { audioRef, currentTrack, currentPosition, isPlaying } = get();
    if (!audioRef && !nativeMusic.isAvailable) return;
    if (!currentTrack) return;
    try {
      console.warn("forceRecovery triggered");
      if (isPlaying) {
        if (nativeMusic.isAvailable) {
          await nativeMusic.stop();
          const offlineResponse = await offlineManager.getOfflineStream(currentTrack.id);
          let streamUrl;
          if (offlineResponse) {
            const blob = await offlineResponse.blob();
            streamUrl = URL.createObjectURL(blob);
          } else {
            streamUrl = api.getTrackStreamSrc(currentTrack.id);
          }
          await nativeMusic.play(streamUrl, currentTrack);
          return;
        }

        audioRef.pause();
        const offlineResponse = await offlineManager.getOfflineStream(currentTrack.id);
        if (offlineResponse) {
          const blob = await offlineResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          audioRef.src = blobUrl;
        } else {
audioRef.src = api.getTrackStreamSrc(currentTrack.id);
        }
        audioRef.load();
        audioRef.currentTime = currentPosition;
        await audioRef.play();
      }
    } catch (e) {
      console.error("forceRecovery failed:", e);
    }
  },
  
  nextTrack: () => {
    const { queue, currentQueueIndex, repeatMode, shuffle, currentTrack } = get();

    if (queue.length === 0) {
      if (nativeMusic.isAvailable) nativeMusic.stop();
      return;
    }

    let nextIndex;

    if (repeatMode === 'one') {
      nextIndex = currentQueueIndex;
    } else if (shuffle) {
      // Use smart contextual shuffle when available
      get()._smartShufflePick().then((smartIdx) => {
        if (smartIdx !== null && smartIdx !== undefined) {
          const nextTrack = queue[smartIdx]?.track;
          if (nextTrack) {
            audioStreamingManager.destroyPlayback();
            get().playTrack(nextTrack, smartIdx);
            return;
          }
        }
        // Fallback: simple random shuffle
        const randomIdx = Math.floor(Math.random() * queue.length);
        const randomTrack = queue[randomIdx]?.track;
        if (randomTrack) {
          audioStreamingManager.destroyPlayback();
          get().playTrack(randomTrack, randomIdx);
        }
      }).catch(() => {
        // Fallback: simple random shuffle
        const randomIdx = Math.floor(Math.random() * queue.length);
        const randomTrack = queue[randomIdx]?.track;
        if (randomTrack) {
          audioStreamingManager.destroyPlayback();
          get().playTrack(randomTrack, randomIdx);
        }
      });
      return; // Async path handled above
    } else {
      nextIndex = currentQueueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          get().reconnectSilentNode();
          if (nativeMusic.isAvailable) nativeMusic.stop();
          return;
        }
      }
    }

    const nextTrack = queue[nextIndex]?.track;
    if (nextTrack) {
      audioStreamingManager.destroyPlayback();
      get().playTrack(nextTrack, nextIndex);
    }
  },

  _smartShufflePick: async () => {
    const { queue, currentQueueIndex, currentTrack } = get();
    if (queue.length <= 1) return null;

    try {
      const currentTrackId = currentTrack?.id || queue[currentQueueIndex]?.track?.id;
      const response = await api.fetchSmartQueue(currentTrackId, queue.length);
      const recommendations = response?.data || [];
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        // Map recommendation IDs back to queue indices, avoiding recently played
        const alreadyPlayedIds = new Set();
        const historyRange = 5;
        const recentHistory = queue.slice(
          Math.max(0, currentQueueIndex - historyRange),
          currentQueueIndex + 1
        );
        recentHistory.forEach(item => {
          if (item?.track?.id) alreadyPlayedIds.add(item.track.id);
        });

        for (const rec of recommendations) {
          if (alreadyPlayedIds.has(rec.id)) continue;
          const idx = queue.findIndex(item => item?.track?.id === rec.id);
          if (idx >= 0 && idx !== currentQueueIndex) return idx;
        }
      }

      // Fallback: Weighted random based on popularity/score if available, otherwise simple random
      const weights = queue.map((item, idx) => {
        if (idx === currentQueueIndex) return 0;
        // Use track score or popularity as weight, defaulting to 1.0
        return (item.track?.score || item.track?.popularity || 100) / 100;
      });
      
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      if (totalWeight <= 0) return Math.floor(Math.random() * queue.length);

      let rand = Math.random() * totalWeight;
      for (let i = 0; i < queue.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return i;
      }
      return Math.floor(Math.random() * queue.length);
    } catch (err) {
      // On error, fallback to basic random avoid current track
      let nextIdx = Math.floor(Math.random() * queue.length);
      if (nextIdx === currentQueueIndex && queue.length > 1) {
        nextIdx = (nextIdx + 1) % queue.length;
      }
      return nextIdx;
    }
  },
  
  previousTrack: () => {
    const { queue, currentQueueIndex, currentPosition } = get();

    // If more than 3 seconds into the song, restart it
    if (currentPosition > 3) {
      get().seekTo(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = currentQueueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex]?.track;
    if (prevTrack) {
      audioStreamingManager.destroyPlayback();
      get().playTrack(prevTrack, prevIndex);
    }
  },
  
  seekTo: (position) => {
    const { audioRef, isPlaying } = get();

    if (nativeMusic.isAvailable) {
      nativeMusic.seekTo(position);
      set({ currentPosition: position });
      api.updatePlayerState({ current_position: position });
      return;
    }

    if (audioRef) {
      audioRef.currentTime = position;

      if (isPlaying && audioRef.paused) {
        audioRef.play().catch(() => {
          set({ isPlaying: false });
        });
      }

      set({ currentPosition: position });
      api.updatePlayerState({ current_position: position });
    }
  },
  
  jump: (seconds) => {
    const { audioRef, currentPosition } = get();
    if (audioRef) {
      const maxPosition = audioRef.duration || 0;
      const newPosition = Math.max(0, Math.min(maxPosition, currentPosition + seconds));
      get().seekTo(newPosition);
    }
  },
  
  loadQueue: async () => {
    try {
      const response = await api.getQueue();
      const queueData = Array.isArray(response?.data) ? response.data : [];
      // Don't overwrite a non-empty local queue with an empty server queue
      const currentQueue = get().queue;
      if (queueData.length === 0 && currentQueue.length > 0) {
        return;
      }
      set({ queue: queueData });
    } catch (error) {
      // Don't clear the queue on error
    }
  },
  
  addToQueue: async (track, position = null) => {
    try {
      await api.addToQueue(track.id, position);
      await get().loadQueue();

      // If nothing is currently playing, play this track immediately
      if (!get().currentTrack) {
        const { queue } = get();
        const queueIndex = queue.findIndex((item) => item.track?.id === track.id);
        const idx = queueIndex >= 0 ? queueIndex : 0;
        await get().playTrack(track, idx);
      }
    } catch (error) {
      // Queue add failed; state unchanged.
    }
  },
  
  removeFromQueue: async (queueItemId) => {
    try {
      await api.removeFromQueue(queueItemId);
      await get().loadQueue();
    } catch (error) {
      // Queue remove failed; state unchanged.
    }
  },

  reorderQueueItem: async (queueItemId, newPosition) => {
    try {
      await api.reorderQueue(queueItemId, newPosition);
      await get().loadQueue();
    } catch (error) {
      // Queue reorder failed; state unchanged.
    }
  },
  
  clearQueue: async () => {
    try {
      await api.clearQueue();
      set({ queue: [], currentQueueIndex: -1 });
    } catch (error) {
      // Queue clear failed; state unchanged.
    }
  },
  
  loadPlayerState: async () => {
    try {
      const response = await api.getPlayerState();
      const state = response.data;

      if (state.current_track) {
        const { audioRef } = get();

        // Restore queue if backend sent one (cross-device sync)
        if (state.queue && state.queue.length > 0) {
          const queue = state.queue.map(item => ({
            id: item.id,
            track_id: item.track_id,
            position: item.position,
            track: item.track,
          }));
          const currentQueueIndex = queue.findIndex(item => item.track_id === state.current_track_id);

          set({
            queue,
            currentQueueIndex,
            currentTrack: state.current_track,
            currentPosition: state.current_position || 0,
            isPlaying: false,
            volume: state.volume ?? 0.8,
            repeatMode: state.repeat_mode || 'none',
            shuffle: state.shuffle || false,
          });
        } else {
          set({
            currentTrack: state.current_track,
            currentPosition: state.current_position || 0,
            isPlaying: false, // Don't auto-play on load (browser policy)
            volume: state.volume ?? 0.8,
            repeatMode: state.repeat_mode || 'none',
            shuffle: state.shuffle || false,
          });
        }

        // Also set audioDuration from track duration if available
        if (state.current_track.duration && Number.isFinite(state.current_track.duration) && state.current_track.duration > 0) {
          set({ audioDuration: state.current_track.duration });
        }

        // Don't preload audio source - let playTrack handle it on user interaction
        if (audioRef) {
          audioRef.volume = state.volume ?? 0.8;
        }
      }
    } catch (error) {
      // Player state load failed; use defaults.
    }
  },
    })
  );