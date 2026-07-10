// Minimal store without zustand to test if bundling works
import { useState, useEffect } from 'react';

// Simple in-memory state (no persistence for testing)
const state = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  queue: [],
  currentQueueIndex: -1,
  favorites: [],
  currentPosition: 0,
  repeatMode: 'none',
  shuffle: false,
  showLyrics: false,
  audioRef: null,
};

const listeners = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

export function usePlayerStore(selector = null) {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  
  const storeState = {
    ...state,
    getState: () => state,
    setState: (updates) => {
      Object.assign(state, updates);
      notify();
    },
    setAudioRef: (ref) => {
      state.audioRef = ref;
    },
    loadPlayerState: async () => {},
    loadQueue: async () => {},
    loadUser: async () => {},
    loadSettings: async () => {},
    initAudioContext: () => {
    },
    resumeAudioContext: () => {},
    playPause: () => {
      const audio = state.audioRef;
      if (audio) {
        if (state.isPlaying) {
          audio.pause();
        } else {
          audio.play().catch(() => {});
        }
      }
      state.isPlaying = !state.isPlaying;
      notify();
    },
    nextTrack: () => {
      const { queue, currentQueueIndex, repeatMode, shuffle, currentTrack } = state;
      
      if (!queue.length && !currentTrack) return;
      
      // If repeat one, just replay current track
      if (repeatMode === 'one' && currentTrack) {
        // Replay current track from beginning
        const audio = state.audioRef;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
        state.currentPosition = 0;
        notify();
        return;
      }
      
      let nextIndex;
      
      if (shuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else {
        nextIndex = currentQueueIndex + 1;
        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            // End of queue, stop playback
            state.isPlaying = false;
            const audio = state.audioRef;
            if (audio) audio.pause();
            notify();
            return;
          }
        }
      }
      
      const nextTrackItem = queue[nextIndex]?.track;
      if (nextTrackItem) {
        state.currentTrack = nextTrackItem;
        state.currentQueueIndex = nextIndex;
        state.currentPosition = 0;
        state.isPlaying = true;
        
        // Update audio source
        const audio = state.audioRef;
        if (audio) {
          // Need to get stream URL - this is simplified, in real app would import api
          audio.src = `/api/tracks/${nextTrackItem.id}/stream`;
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
        
        notify();
      }
    },
    previousTrack: () => {},
    seekTo: (pos) => {
      const audio = state.audioRef;
      if (audio && Number.isFinite(pos)) {
        audio.currentTime = pos;
      }
      state.currentPosition = pos;
      notify();
    },
    jump: (delta) => {
      const audio = state.audioRef;
      if (audio) {
        const newTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
        audio.currentTime = newTime;
        state.currentPosition = newTime;
        notify();
      }
    },
    setVolume: (v) => {
      state.volume = v;
      notify();
    },
    setRepeatMode: (mode) => {
      state.repeatMode = mode;
      notify();
    },
    toggleShuffle: () => {
      state.shuffle = !state.shuffle;
      notify();
    },
    toggleLyrics: () => {
      state.showLyrics = !state.showLyrics;
      notify();
    },
    toggleFavorite: (track) => {
      const idx = state.favorites.findIndex(f => f.id === track.id);
      if (idx >= 0) {
        state.favorites = state.favorites.filter((_, i) => i !== idx);
      } else {
        state.favorites = [...state.favorites, track];
      }
      notify();
    },
    addToQueue: (track) => {
      state.queue.push({ id: Date.now(), track });
      notify();
    },
    removeFromQueue: (id) => {
      state.queue = state.queue.filter(item => item.id !== id);
      notify();
    },
    reorderQueueItem: (id, newPos) => {},
    setCurrentPosition: (pos) => {
      state.currentPosition = pos;
      notify();
    },
    playTrack: (track, queueIndex) => {
      state.currentTrack = track;
      state.isPlaying = true;
      state.currentQueueIndex = queueIndex ?? -1;
      
      // Set audio source and play for mobile
      const audio = state.audioRef;
      if (audio && track) {
        const fileUrl = track.file_url || `/api/tracks/${track.id}/stream`;
        if (audio.src !== fileUrl) {
          audio.src = fileUrl;
          audio.load();
        }
        // Play with proper error handling for mobile
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            // Retry once after user interaction
            state.isPlaying = false;
            notify();
          });
        }
      }
      
      notify();
    },
    setSearchOverlayActive: () => {},
  };
  
  return selector ? selector(storeState) : storeState;
}

// Attach getState to the hook function to match zustand API
usePlayerStore.getState = () => ({
  ...state,
  setAudioRef: (ref) => { state.audioRef = ref; },
  setState: (updates) => {
    Object.assign(state, updates);
    notify();
  },
  loadPlayerState: async () => {},
  loadQueue: async () => {},
  loadUser: async () => {},
  loadSettings: async () => {},
  initAudioContext: () => {},
  resumeAudioContext: () => {},
  playPause: () => {
    const audio = state.audioRef;
    if (audio) {
      if (state.isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    }
    state.isPlaying = !state.isPlaying;
    notify();
  },
  nextTrack: () => {
    const { queue, currentQueueIndex, repeatMode, shuffle, currentTrack } = state;
    
    if (!queue.length && !currentTrack) return;
    
    // If repeat one, just replay current track
    if (repeatMode === 'one' && currentTrack) {
      // Replay current track from beginning
      const audio = state.audioRef;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      state.currentPosition = 0;
      notify();
      return;
    }
    
    let nextIndex;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentQueueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // End of queue, stop playback
          state.isPlaying = false;
          const audio = state.audioRef;
          if (audio) audio.pause();
          notify();
          return;
        }
      }
    }
    
    const nextTrackItem = queue[nextIndex]?.track;
    if (nextTrackItem) {
      state.currentTrack = nextTrackItem;
      state.currentQueueIndex = nextIndex;
      state.currentPosition = 0;
      state.isPlaying = true;
      
      // Update audio source
      const audio = state.audioRef;
      if (audio) {
        audio.src = `/api/tracks/${nextTrackItem.id}/stream`;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      
      notify();
    }
  },
  previousTrack: () => {},
  seekTo: (pos) => {
    const audio = state.audioRef;
    if (audio && Number.isFinite(pos)) {
      audio.currentTime = pos;
    }
    state.currentPosition = pos;
    notify();
  },
  jump: (delta) => {
    const audio = state.audioRef;
    if (audio) {
      const newTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
      audio.currentTime = newTime;
      state.currentPosition = newTime;
      notify();
    }
  },
  setVolume: (v) => {
    state.volume = v;
    notify();
  },
  setRepeatMode: (mode) => {
    state.repeatMode = mode;
    notify();
  },
  toggleShuffle: () => {
    state.shuffle = !state.shuffle;
    notify();
  },
  toggleLyrics: () => {
    state.showLyrics = !state.showLyrics;
    notify();
  },
  toggleFavorite: (track) => {
    const idx = state.favorites.findIndex(f => f.id === track.id);
    if (idx >= 0) {
      state.favorites = state.favorites.filter((_, i) => i !== idx);
    } else {
      state.favorites = [...state.favorites, track];
    }
    notify();
  },
  addToQueue: (track) => {
    state.queue.push({ id: Date.now(), track });
    notify();
  },
  removeFromQueue: (id) => {
    state.queue = state.queue.filter(item => item.id !== id);
    notify();
  },
  reorderQueueItem: (id, newPos) => {},
  setCurrentPosition: (pos) => {
    state.currentPosition = pos;
  },
  playTrack: (track, queueIndex) => {
    state.currentTrack = track;
    state.isPlaying = true;
    notify();
  },
  setSearchOverlayActive: () => {},
});

export function usePlayerStoreSelector(selector) {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  
  return selector(state);
}

export const getPlayerStoreState = () => state;
