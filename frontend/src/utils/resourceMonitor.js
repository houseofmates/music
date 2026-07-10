// Resource monitoring utilities for performance tracking
export class ResourceMonitor {
  constructor() {
    this.metrics = {
      audioLoadTimes: [],
      bufferingEvents: [],
      cacheHits: 0,
      cacheMisses: 0,
      errors: [],
      networkRequests: []
    };

    this.isMonitoring = false;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Monitor network requests
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.initiatorType === 'audio' || entry.name.includes('/stream')) {
              this.metrics.networkRequests.push({
                url: entry.name,
                duration: entry.duration,
                size: entry.transferSize,
                timestamp: entry.startTime
              });
            }
          }
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // PerformanceObserver not available in this environment.
      }
    }

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Resource monitoring started
  }

  stopMonitoring() {
    this.isMonitoring = false;
    // Resource monitoring stopped
  }

  startMemoryMonitoring() {
    if (!('memory' in performance)) return;

    const logMemoryUsage = () => {
      if (!this.isMonitoring) return;

      const memInfo = performance.memory;
      // Memory usage logged internally if needed

      // Continue monitoring every 30 seconds
      setTimeout(logMemoryUsage, 30000);
    };

    logMemoryUsage();
  }

  recordAudioLoadTime(trackId, loadTime) {
    this.metrics.audioLoadTimes.push({
      trackId,
      loadTime,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    if (this.metrics.audioLoadTimes.length > 100) {
      this.metrics.audioLoadTimes.shift();
    }
  }

  recordBufferingEvent(trackId, duration) {
    this.metrics.bufferingEvents.push({
      trackId,
      duration,
      timestamp: Date.now()
    });

    // Keep only last 50 events
    if (this.metrics.bufferingEvents.length > 50) {
      this.metrics.bufferingEvents.shift();
    }
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordError(error, context = {}) {
    this.metrics.errors.push({
      error: error.message || error,
      context,
      timestamp: Date.now(),
      stack: error.stack
    });

    // Keep only last 20 errors
    if (this.metrics.errors.length > 20) {
      this.metrics.errors.shift();
    }
  }

  getMetrics() {
    const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
      : 0;

    const avgLoadTime = this.metrics.audioLoadTimes.length > 0
      ? this.metrics.audioLoadTimes.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.audioLoadTimes.length
      : 0;

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageLoadTime: Math.round(avgLoadTime * 100) / 100,
      memoryInfo: 'memory' in performance ? performance.memory : null
    };
  }

  logPerformanceReport() {
    const metrics = this.getMetrics();
    // Performance metrics are collected silently for internal use.
    // External callers can inspect the returned metrics object via getMetrics().
  }

  // Export metrics for debugging
  exportMetrics() {
    return {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...this.getMetrics()
    };
  }
}

// Singleton instance
export const resourceMonitor = new ResourceMonitor();

// Auto-start monitoring in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  resourceMonitor.startMonitoring();
}