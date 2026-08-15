const CACHE_NAME = 'vibecode-shell-v1';
const OFFLINE_AUDIO_CACHE = 'vibecode-audio-cache-v1';

const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// Prefetch queue for upcoming tracks
let prefetchQueue = [];
let currentPrefetchIndex = 0;
const MAX_PREFETCH = 3; // Prefetch up to 3 tracks ahead

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== OFFLINE_AUDIO_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SET_PREFETCH_QUEUE':
      prefetchQueue = data.queue || [];
      currentPrefetchIndex = data.currentIndex || 0;
      startPrefetching();
      break;

    case 'CLEAR_CACHE':
      clearAudioCache();
      break;

    case 'SKIP_TO_TRACK':
      currentPrefetchIndex = data.index;
      startPrefetching();
      break;
  }
});

// Clear audio cache
async function clearAudioCache() {
  const cache = await caches.open(OFFLINE_AUDIO_CACHE);
  const keys = await cache.keys();
  await Promise.all(keys.map(request => cache.delete(request)));
}

// Start prefetching upcoming tracks
async function startPrefetching() {
  if (!prefetchQueue.length) return;

  const cache = await caches.open(OFFLINE_AUDIO_CACHE);

  // Prefetch next few tracks
  for (let i = 0; i < MAX_PREFETCH; i++) {
    const trackIndex = currentPrefetchIndex + i + 1;
    if (trackIndex >= prefetchQueue.length) break;

    const track = prefetchQueue[trackIndex];
    if (!track) continue;

    try {
      // First prefetch metadata
      const metadataUrl = `/api/tracks/${track.id}/preload`;
      const metadataResponse = await fetch(metadataUrl);
      if (metadataResponse.ok) {
        await cache.put(metadataUrl, metadataResponse);
        console.log('Prefetched metadata for track:', track.id);
      }

      // Then prefetch a small portion of the audio (first 64KB for fast startup)
      const audioUrl = `/api/tracks/${track.id}/stream`;
      const rangeResponse = await fetch(audioUrl, {
        headers: { 'Range': 'bytes=0-65535' }
      });

      if (rangeResponse.ok) {
        // Store partial content for faster initial playback
        await cache.put(`${audioUrl}-partial`, rangeResponse);
        console.log('Prefetched partial audio for track:', track.id);
      }
    } catch (error) {
      console.warn('Prefetch failed for track:', track.id, error);
    }
  }
}

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle audio streaming requests with intelligent caching
  if (requestUrl.pathname.match(/^\/api\/tracks\/\d+\/stream/)) {
    event.respondWith(handleAudioRequest(event.request));
    return;
  }

  // Handle preload requests
  if (requestUrl.pathname.match(/^\/api\/tracks\/\d+\/preload/)) {
    event.respondWith(handlePreloadRequest(event.request));
    return;
  }

  // Cache audio streams for offline playback
  if (requestUrl.pathname.match(/^\/api\/tracks\/\d+\/stream/)) {
    event.respondWith(
      caches.open(OFFLINE_AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }
        try {
          const response = await fetch(event.request);
          if (response && response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (err) {
          return cached || new Response('Offline', { status: 503 });
        }
      })
    );
    return;
  }

  // Cache other API calls and assets (online-first)
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Fallback to cache for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
  }
});

// Handle audio streaming requests with intelligent caching
async function handleAudioRequest(request) {
  const cache = await caches.open(OFFLINE_AUDIO_CACHE);
  const url = new URL(request.url);

  // Check for partial content in cache first
  const partialKey = `${request.url}-partial`;
  const partialResponse = await cache.match(partialKey);

  if (partialResponse && !request.headers.has('Range')) {
    // If we have partial content and no range request, return it
    console.log('Serving partial cached audio for:', url.pathname);
    return partialResponse;
  }

  // Check for full cached content
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('Serving cached audio for:', url.pathname);
    return cachedResponse;
  }

  // Fetch from network
  try {
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful responses (but not if they're partial from range requests)
      const contentRange = response.headers.get('Content-Range');
      if (!contentRange) {
        const responseClone = response.clone();
        cache.put(request, responseClone);
        console.log('Cached audio for:', url.pathname);
      }
    }

    return response;
  } catch (error) {
    console.error('Audio fetch failed:', error);
    throw error;
  }
}

// Handle preload requests
async function handlePreloadRequest(request) {
  const cache = await caches.open(OFFLINE_AUDIO_CACHE);

  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('Serving cached preload for:', request.url);
    return cachedResponse;
  }

  // Fetch and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
      console.log('Cached preload for:', request.url);
    }
    return response;
  } catch (error) {
    console.error('Preload fetch failed:', error);
    throw error;
  }
}
