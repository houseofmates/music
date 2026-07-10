const STATE = {
  IDLE: 0,
  PLAYING: 1,
  PAUSED: 2,
  COMPLETED: 3,
  ERROR: 4,
};

// Production API base URL for Android native player
const PROD_API_BASE = 'https://music.houseofmates.space/api';

class NativeMusic {
  constructor() {
    this._plugin = null;
    this._listeners = new Map();
    this._currentState = STATE.IDLE;
    this._currentPosition = 0;
    this._currentDuration = 0;
    this._isAvailable = false;
    this._initPromise = null;
    this._init();
  }

  _init() {
    this._initPromise = (async () => {
      try {
        if (
          typeof window === 'undefined' ||
          !window.Capacitor ||
          window.Capacitor.getPlatform() !== 'android' ||
          !window.Capacitor.Plugins ||
          !window.Capacitor.Plugins.Music
        ) {
          console.info('NativeMusic: Not on Android or plugin not available');
          return;
        }

        this._plugin = window.Capacitor.Plugins.Music;
        this._isAvailable = true;

        // Add listener with error handling
        await this._plugin.addListener('onPlaybackStateChange', (data) => {
          try {
            this._currentState = data.state ?? STATE.IDLE;
            this._currentPosition = data.position ?? 0;
            this._currentDuration = data.duration ?? 0;
            this._listeners.forEach((cb) => {
              try { cb(data); } catch (e) { console.error('NativeMusic listener error:', e); }
            });
          } catch (e) {
            console.error('NativeMusic state change handler error:', e);
          }
        });
        
        console.info('NativeMusic: Initialized successfully');
      } catch (e) {
        console.warn('NativeMusic plugin initialization failed:', e);
        this._isAvailable = false;
        this._plugin = null;
      }
    })();
  }

  // Wait for initialization to complete
  async ready() {
    if (this._initPromise) {
      await this._initPromise;
    }
    return this._isAvailable;
  }

  get isAvailable() {
    return this._isAvailable && this._plugin != null;
  }

  get state() {
    return this._currentState;
  }

  get position() {
    return this._currentPosition;
  }

  get duration() {
    return this._currentDuration;
  }

  async play(url, track) {
    if (!this._plugin) return false;
    
    // Validate URL
    if (!url || typeof url !== 'string') {
      console.error('NativeMusic.play: Invalid URL');
      return false;
    }
    
    try {
      // Convert blob URLs to HTTP streaming URLs for native MediaPlayer
      const resolvedUrl = url.startsWith('blob:') && track?.id
        ? `${PROD_API_BASE}/tracks/${track.id}/stream?t=${Date.now()}`
        : url;
      
      // Validate URL scheme
      if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
        console.error('NativeMusic.play: Unsupported URL scheme:', resolvedUrl);
        return false;
      }
      
      await this._plugin.play({ url: resolvedUrl, track: track || {} });
      return true;
    } catch (e) {
      console.error('NativeMusic.play failed:', e);
      return false;
    }
  }

  async pause() {
    if (!this._plugin) return;
    try {
      await this._plugin.pause();
    } catch (e) {
      console.error('NativeMusic.pause failed:', e);
    }
  }

  async resume() {
    if (!this._plugin) return;
    try {
      await this._plugin.resume();
    } catch (e) {
      console.error('NativeMusic.resume failed:', e);
    }
  }

  async seekTo(positionSeconds) {
    if (!this._plugin) return;
    if (typeof positionSeconds !== 'number' || !Number.isFinite(positionSeconds) || positionSeconds < 0) {
      console.error('NativeMusic.seekTo: Invalid position', positionSeconds);
      return;
    }
    try {
      await this._plugin.seekTo({ position: positionSeconds });
    } catch (e) {
      console.error('NativeMusic.seekTo failed:', e);
    }
  }

  async stop() {
    if (!this._plugin) return;
    try {
      await this._plugin.stop();
    } catch (e) {
      console.error('NativeMusic.stop failed:', e);
    }
  }

  async getPlaybackState() {
    if (!this._plugin) return null;
    try {
      return await this._plugin.getPlaybackState();
    } catch (e) {
      console.error('NativeMusic.getPlaybackState failed:', e);
      return null;
    }
  }

  onStateChange(callback) {
    if (typeof callback !== 'function') return () => {};
    this._listeners.set(callback, callback);
    return () => this._listeners.delete(callback);
  }
  
  // Remove all listeners
  removeAllListeners() {
    this._listeners.clear();
  }
}

export const nativeMusic = new NativeMusic();
export { STATE as NATIVE_MUSIC_STATE };