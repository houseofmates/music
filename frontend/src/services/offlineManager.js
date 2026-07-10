// premium offline-first service with indexeddb metadata store and large file cache
export class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.audioCacheName = 'music-audio-v1';
    this.metadataCacheName = 'music-metadata-v1';
    this.maxCacheSize = 2 * 1024 * 1024 * 1024; // 2GB cache
    this.currentCacheSize = 0;
    this.downloadedTracks = new Set();
    this.downloadQueue = [];
    this.isDownloading = false;
    this.db = null;

    this.qualities = {
      offline: 'lossless', // FLAC for premium experience
      streaming: 'adaptive', // Opus 96k/128k based on network
      download: 'high' // FLAC/320kbps Opus for downloads
    };

    // Enhanced download management
    this.downloadProgress = new Map();
    this.downloadHistory = [];
    this.maxConcurrentDownloads = 3;
    this.activeDownloads = new Set();

    this.setupEventListeners();
    this.initialize();
  }

  async initialize() {
    await this.initIndexedDB();
    await this.calculateCacheSize();
    await this.loadDownloadedTracks();
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('music-offline-db', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'trackId' });
        }
        if (!db.objectStoreNames.contains('downloads')) {
          db.createObjectStore('downloads', { keyPath: 'trackId' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async calculateCacheSize() {
    try {
      const cache = await caches.open(this.audioCacheName);
      const keys = await cache.keys();
      this.currentCacheSize = 0;
      for (const req of keys) {
        const res = await cache.match(req);
        if (res) {
          const blob = await res.clone().blob();
          this.currentCacheSize += blob.size;
        }
      }
    } catch (e) {
    }
  }

  async loadDownloadedTracks() {
    if (!this.db) return;
    const tx = this.db.transaction('downloads', 'readonly');
    const store = tx.objectStore('downloads');
    const all = await new Promise(resolve => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
    this.downloadedTracks = new Set(all);
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processDownloadQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async downloadTrack(trackId, quality = 'lossless') {
    if (!this.isOnline) throw new Error('cannot download: offline');
    if (this.downloadedTracks.has(trackId)) return;

    this.downloadQueue.push({ trackId, quality, timestamp: Date.now() });
    if (!this.isDownloading) {
      this.processDownloadQueue();
    }
  }

  async downloadTracks(trackIds, quality = 'high') {
    // Batch download with concurrency control
    const concurrency = 3;
    const batches = [];
    for (let i = 0; i < trackIds.length; i += concurrency) {
      batches.push(trackIds.slice(i, i + concurrency));
    }
    
    for (const batch of batches) {
      await Promise.allSettled(batch.map(id => this.downloadTrack(id, quality)));
    }
  }

  async processDownloadQueue() {
    if (this.isDownloading || this.downloadQueue.length === 0) return;
    
    this.isDownloading = true;
    const concurrency = 2; // Max 2 concurrent downloads
    
    while (this.downloadQueue.length > 0 && this.isOnline) {
      const batch = this.downloadQueue.splice(0, concurrency);
      await Promise.allSettled(
        batch.map(item => this._downloadSingleTrack(item.trackId, item.quality))
      );
    }
    
    this.isDownloading = false;
  }

  async _downloadSingleTrack(trackId, quality) {
    try {
      // Check if already downloaded
      if (this.downloadedTracks.has(trackId)) return;

      // Get stream URL with quality preference
      const qualityMap = {
        'lossless': 'lossless',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
      };
      const streamQuality = qualityMap[quality] || 'lossless';
      const streamUrl = `/api/tracks/${trackId}/stream?quality=${streamQuality}`;

      // Fetch with progress tracking
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      const contentLength = parseInt(response.headers.get('content-length') || '0');

      // Check storage quota before proceeding
      if (contentLength > 0) {
        const hasSpace = await this.checkStorageQuota(contentLength);
        if (!hasSpace) {
          throw new Error('Insufficient storage space for download');
        }
      }

      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        // Emit progress event
        const progress = contentLength ? (received / contentLength) * 100 : null;
        this.emit('downloadProgress', { trackId, progress, received });
      }
      
      // Create blob and cache
      const blob = new Blob(chunks);
      await this.cacheTrack(trackId, blob, quality);
      
      // Update IndexedDB
      await this.saveDownloadRecord(trackId, quality, blob.size);
      
      // Update tracking
      this.downloadedTracks.add(trackId);
      this.currentCacheSize += blob.size;
      
      this.emit('downloadComplete', { trackId, quality, size: blob.size });
      
    } catch (error) {
      this.emit('downloadError', { trackId, error });
    }
  }

  async cacheTrack(trackId, blob, quality = 'lossless') {
    const cache = await caches.open(this.audioCacheName);
    const contentType = quality === 'lossless' ? 'audio/flac' : 'audio/opus'; // Assume FLAC for lossless, Opus for others
    const response = new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': blob.size,
        'Cache-Control': 'public, max-age=31536000',
        'X-Offline-Quality': quality
      }
    });
    // Include quality in cache key for different quality versions
    const cacheKey = `/api/tracks/${trackId}/stream-offline-${quality}`;
    await cache.put(cacheKey, response);
  }

  async saveDownloadRecord(trackId, quality, size) {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('downloads', 'readwrite');
      const store = tx.objectStore('downloads');
      const record = {
        trackId,
        quality,
        size,
        downloadDate: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };
      
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  emit(event, data) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  // Check if storage quota would be exceeded
  async checkStorageQuota(size) {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const available = estimate.quota - estimate.usage;
        return size <= available;
      } catch (e) {
      }
    }
    // Fallback: check against our max cache size
    return (this.currentCacheSize + size) <= this.maxCacheSize;
  }

  async isTrackDownloaded(trackId) {
    return this.downloadedTracks.has(trackId);
  }

  async getDownloadedTracks() {
    return Array.from(this.downloadedTracks);
  }

  async removeDownloadedTrack(trackId) {
    try {
      // Remove from cache - try all quality variants
      const cache = await caches.open(this.audioCacheName);
      const qualityVariants = ['lossless', 'high', 'medium', 'low'];
      for (const quality of qualityVariants) {
        await cache.delete(`/api/tracks/${trackId}/stream-offline-${quality}`);
      }
      // Also try the old cache key for backward compatibility
      await cache.delete(`/api/tracks/${trackId}/stream`);

      // Remove from IndexedDB
      if (this.db) {
        const tx = this.db.transaction('downloads', 'readwrite');
        const store = tx.objectStore('downloads');
        await store.delete(trackId);
      }

      // Update tracking
      this.downloadedTracks.delete(trackId);

      // Recalculate cache size
      await this.calculateCacheSize();

      this.emit('downloadRemoved', { trackId });

    } catch (error) {
    }
  }

  async getCacheStats() {
    const downloadedCount = this.downloadedTracks.size;
    const cacheSizeMB = Math.round(this.currentCacheSize / (1024 * 1024));
    const cacheSizeGB = (cacheSizeMB / 1024).toFixed(2);
    
    return {
      downloadedCount,
      cacheSizeBytes: this.currentCacheSize,
      cacheSizeMB,
      cacheSizeGB,
      maxCacheSizeMB: Math.round(this.maxCacheSize / (1024 * 1024)),
      usagePercentage: Math.round((this.currentCacheSize / this.maxCacheSize) * 100)
    };
  }

  async clearCache() {
    try {
      // Clear audio cache
      await caches.delete(this.audioCacheName);
      
      // Clear IndexedDB
      if (this.db) {
        const tx = this.db.transaction('downloads', 'readwrite');
        await tx.objectStore('downloads').clear();
      }
      
      // Reset tracking
      this.downloadedTracks.clear();
      this.currentCacheSize = 0;
      
      this.emit('cacheCleared');
      
    } catch (error) {
    }
  }

  async getOfflineStream(trackId, quality = 'lossless') {
    if (!this.downloadedTracks.has(trackId)) return null;

    try {
      const cache = await caches.open(this.audioCacheName);
      // Try quality-specific cache key first, then fallback to default
      let response = await cache.match(`/api/tracks/${trackId}/stream-offline-${quality}`);
      if (!response) {
        response = await cache.match(`/api/tracks/${trackId}/stream`);
      }
      return response;
    } catch (error) {
      return null;
    }
  }
}

// Enhanced singleton export
const offlineManager = new OfflineManager();
export default offlineManager;
