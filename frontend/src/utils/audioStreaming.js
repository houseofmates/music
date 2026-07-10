class AudioStreamingManager {
  constructor(options = {}) {
    this.options = options;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.maxRetryDelay = options.maxRetryDelay || 5000;
    this.queueGetter = null;
    this.crossfadeDuration = 0;
    this.gaplessEnabled = false;
    this._activeAudio = null;
    this._nextAudio = null;
    this._abortController = null;
  }

  setQueueGetter(fn) {
    this.queueGetter = fn;
  }

  setCrossfadeDuration(seconds) {
    this.crossfadeDuration = seconds;
  }

  setGaplessEnabled(enabled) {
    this.gaplessEnabled = enabled;
  }

  destroyPlayback() {
    if (this._abortController) {
      try {
        this._abortController.abort();
      } catch (e) {
        // ignore
      }
      this._abortController = null;
    }
    if (this._activeAudio) {
      try {
        this._activeAudio.pause();
        this._activeAudio.src = '';
        this._activeAudio.load();
      } catch (e) {
        // ignore cleanup errors
      }
      this._activeAudio = null;
    }
    if (this._nextAudio) {
      try {
        this._nextAudio.pause();
        this._nextAudio.src = '';
        this._nextAudio.load();
      } catch (e) {
        // ignore cleanup errors
      }
      this._nextAudio = null;
    }
  }

  async createGaplessPlayback(trackId, nextTrackId, options = {}) {
    const { onError } = options;

    const apiBase = this.options.apiBaseUrl || '';
    const audioUrl = `${apiBase}/api/tracks/${trackId}/stream`;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.src = audioUrl;

    this._activeAudio = audio;

    if (this.gaplessEnabled && nextTrackId) {
      try {
        const nextUrl = `${apiBase}/api/tracks/${nextTrackId}/stream`;
        const nextAudio = new Audio();
        nextAudio.crossOrigin = 'anonymous';
        nextAudio.preload = 'metadata';
        nextAudio.src = nextUrl;
        this._nextAudio = nextAudio;
      } catch (e) {
        if (typeof onError === 'function') {
          onError(e);
        }
      }
    }

    return audio;
  }

  async calculateRetryDelay(attempt) {
    const baseDelay = this.retryDelay;
    const exponentialBackoff = Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1;
    return Math.min(baseDelay * exponentialBackoff + jitter, this.maxRetryDelay);
  }

  async streamWithRetry(audioUrl, options = {}) {
    let lastError;
    let attempt = 0;
    this._abortController = new AbortController();

    while (attempt < this.retryAttempts) {
      try {
        const response = await fetch(audioUrl, {
          method: 'GET',
          headers: {
            'Range': options.range || 'bytes=0-',
          },
          signal: this._abortController.signal,
        });

        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }

        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error;
        }
        lastError = error;
        attempt++;

        if (attempt < this.retryAttempts) {
          const delay = await this.calculateRetryDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error('Failed to stream audio after ' + this.retryAttempts + ' attempts. Last error: ' + lastError.message);
  }
}

export default AudioStreamingManager;
export const audioStreamingManager = new AudioStreamingManager();
