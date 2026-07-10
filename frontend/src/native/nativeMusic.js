const STATE = {
  IDLE: 0,
  PLAYING: 1,
  PAUSED: 2,
  COMPLETED: 3,
  ERROR: 4,
};

class NativeMusic {
  constructor() {
    this._plugin = null;
    this._listeners = new Map();
    this._currentState = STATE.IDLE;
    this._currentPosition = 0;
    this._currentDuration = 0;
    this._isAvailable = false;
    this._init();
  }

  _init() {
    try {
      if (
        typeof window !== 'undefined' &&
        window.Capacitor &&
        window.Capacitor.getPlatform() === 'android' &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.Music
      ) {
        this._plugin = window.Capacitor.Plugins.Music;
        this._isAvailable = true;
        this._plugin.addListener('onPlaybackStateChange', (data) => {
          this._currentState = data.state;
          this._currentPosition = data.position;
          this._currentDuration = data.duration;
          this._listeners.forEach((cb) => cb(data));
        });
      }
    } catch (e) {
      console.warn('NativeMusic plugin not available:', e);
    }
  }

  get isAvailable() {
    return this._isAvailable;
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
    try {
      await this._plugin.play({ url, track: track || {} });
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

  onStateChange(callback) {
    this._listeners.set(callback, callback);
    return () => this._listeners.delete(callback);
  }
}

export const nativeMusic = new NativeMusic();
export { STATE as NATIVE_MUSIC_STATE };
