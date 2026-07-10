import axios from 'axios';

// Determine API base URL.
// - Browser/web: use relative /api (nginx proxy) as primary.
// - Packaged Electron (file://): local backend fallbacks.
// - Optional VITE_API_URL can override, but production web should not be set to internal Docker host names.
const isFileProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'file:';
const isAndroidNative =
  typeof window !== 'undefined' &&
  window.Capacitor &&
  typeof window.Capacitor.getPlatform === 'function' &&
  window.Capacitor.getPlatform() === 'android';

const explicitApiUrlRaw = import.meta.env.VITE_API_URL?.trim() || '';
const DEFAULT_PROD_API_URL = 'https://music.houseofmates.space/api';

// In development ignore a VITE_API_URL that points to the production server so the dev server
// uses the local proxy (/api) by default. This avoids accidentally pointing the local browser
// at production when VITE_API_URL is set globally in the shell/build environment.
const explicitApiUrl = (import.meta.env.DEV && explicitApiUrlRaw === DEFAULT_PROD_API_URL)
  ? ''
  : explicitApiUrlRaw;

const isWebBrowser = !isFileProtocol && !isAndroidNative;

const getFallbackApiBases = () => {
  // AppImage/Electron (file://) - use production server since no local backend
  if (isFileProtocol) {
    return [
      DEFAULT_PROD_API_URL,
    ];
  }

  if (isAndroidNative) {
    // Avoid hardcoding private IPs; rely on prod URL, localhost, and optional env override.
    const envUrl = explicitApiUrl || '';
    const bases = [DEFAULT_PROD_API_URL, 'http://127.0.0.1:3006/api'];
    if (envUrl && envUrl !== DEFAULT_PROD_API_URL) {
      bases.unshift(envUrl);
    }
    return bases;
  }

  if (isWebBrowser) {
    return [
      '/api',
      DEFAULT_PROD_API_URL,
    ];
  }

  return [
    '/api',
    DEFAULT_PROD_API_URL,
    'http://localhost:3006/api',
  ];
};

const isSafeBrowserApiUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  if (typeof window === 'undefined') return true;

  try {
    const parsed = new URL(url, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    // If user explicitly gave an internal Docker host for a browser app, prefer the proxy route /api.
    if (parsed.hostname === 'music-backend' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const fallbackApiBases = getFallbackApiBases();

// Prefer explicitly configured URL. For desktop file:// apps, also allow production URLs.
const safeExplicitApiUrl = explicitApiUrl && isSafeBrowserApiUrl(explicitApiUrl)
  ? explicitApiUrl
  : null;

const apiBases = safeExplicitApiUrl
  ? [safeExplicitApiUrl, ...fallbackApiBases.filter((base) => base !== safeExplicitApiUrl)]
  : isFileProtocol
    ? [explicitApiUrl || DEFAULT_PROD_API_URL, ...fallbackApiBases.filter(b => b !== (explicitApiUrl || DEFAULT_PROD_API_URL))].filter(Boolean)
    : [...fallbackApiBases, ...(!fallbackApiBases.includes(explicitApiUrl) && explicitApiUrl ? [explicitApiUrl] : [])];

let activeApiBaseIndex = 0;
const API_BASE_URL = apiBases[activeApiBaseIndex];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

let cachedBaseUrl = null;
const resolveApiBase = () => {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }

  const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  try {
    cachedBaseUrl = new URL(api.defaults.baseURL, fallbackOrigin);
  } catch {
    cachedBaseUrl = new URL(fallbackOrigin);
  }
  return cachedBaseUrl;
};

export const resolveMediaUrl = (value) => {
  if (!value) return '';
  if (typeof value !== 'string') return '';
  if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const baseUrl = resolveApiBase();
  if (value.startsWith('/')) {
    return `${baseUrl.origin}${value}`;
  }

  const normalizedBase = baseUrl.toString().replace(/\/$/, '');
  return `${normalizedBase}/${value.replace(/^\/+/, '')}`;
};

const authTokenKey = 'music_app_token';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(authTokenKey);
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(authTokenKey, token);
  } else {
    window.localStorage.removeItem(authTokenKey);
  }
};

export const clearAuthToken = () => setAuthToken(null);

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the current API base is unreachable, automatically fail over to the next one.
// Also add connection testing for desktop apps
const testConnection = async (baseUrl) => {
  try {
    const testApi = axios.create({
      baseURL: baseUrl,
      timeout: 1500,
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await testApi.get('/health');
    return res.status === 200;
  } catch {
    return false;
  }
};

// Test connections on load and set the working base URL
let connectionTested = false;
const ensureConnection = async () => {
  if (connectionTested) return;
  connectionTested = true;
  
  for (const baseUrl of apiBases) {
    if (await testConnection(baseUrl)) {
      if (api.defaults.baseURL !== baseUrl) {
        api.defaults.baseURL = baseUrl;
        cachedBaseUrl = null;
      }
      return;
    }
  }
};

// Trigger connection test for file:// apps and dev browsers (improves automatic fallback during local development)
if (isFileProtocol || isAndroidNative || import.meta.env.DEV) {
  ensureConnection();
}
api.interceptors.response.use(
  (response) => {
    // Stick to whichever base just succeeded so parallel requests don't scatter.
    const successBase = response?.config?.baseURL;
    if (successBase && successBase !== api.defaults.baseURL) {
      api.defaults.baseURL = successBase;
      cachedBaseUrl = null; // reset cached origin so resolveMediaUrl picks up the new base
    }
    return response;
  },
  async (error) => {
    const config = error?.config;
    if (!config) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const networkError = !error?.response;
    const retried = config.__baseFallbackRetried || 0;

    // Retry on network failures and upstream availability errors.
    if ((networkError || status === 403 || status === 502 || status === 503 || status === 504) && retried < apiBases.length - 1) {
      // Pick the next base sequentially from where this request started, not from
      // the shared mutable index, to avoid parallel-request race conditions.
      const startIndex = apiBases.indexOf(config.baseURL || apiBases[0]);
      const nextIndex = Math.min(
        (startIndex < 0 ? 0 : startIndex) + retried + 1,
        apiBases.length - 1
      );
      const nextBase = apiBases[nextIndex];

      config.__baseFallbackRetried = retried + 1;
      config.baseURL = nextBase;

      return api.request(config);
    }

    return Promise.reject(error);
  }
);

// Tracks
export const getTracks = (params = {}) => api.get('/tracks', { params: { limit: 50, ...params }, timeout: 30000 });
export const getTrack = (id) => api.get(`/tracks/${id}`);
export const searchTracks = (query, searchIn = ['title', 'artist', 'album']) => 
  api.post('/tracks/search', { query, search_in: searchIn });
export const semanticSearchTracks = (q, top_k = 20) => api.get('/tracks/semantic-search', { params: { q, top_k } });
export const findDuplicateTracks = () => api.get('/tracks/duplicates');
export const buildEmbeddings = (params = {}) => api.post('/embeddings/build', null, { params });
export const buildPlaylistFromPrompt = (data) => api.post('/playlists/ai', data);
export const normalizeMetadata = (data = {}) => api.post('/metadata/normalize', data);
export const getTrackStreamUrl = (id) => `${api.defaults.baseURL}/tracks/${id}/stream`;
export const getTrackStreamSrc = (id) => `${api.defaults.baseURL}/tracks/${id}/stream?t=${Date.now()}`;
export const downloadTrack = (id) =>
  api.get(`/tracks/${id}/download`, { responseType: 'blob' });
export const enrichTrack = (id) => api.post(`/tracks/${id}/enrich`);
export const autoFillTrackCoverArt = (params = {}) => api.post('/tracks/auto-cover-art', null, { params });
export const updateTrack = (id, data) => api.put(`/tracks/${id}`, data);

// Lyrics
export const getTrackLyrics = (id) => api.get(`/tracks/${id}/lyrics`);
export const saveTrackLyrics = (id, lyrics) => api.put(`/tracks/${id}/lyrics`, { lyrics });
export const saveSyncedLyrics = (id, synced_lyrics) => api.put(`/tracks/${id}/synced-lyrics`, { synced_lyrics });
export const searchLyrics = (query, artist, title) =>
  api.get('/lyrics/search', { params: { q: query, artist, title } }).then((res) => res.data);
export const getTrackDeepDiscovery = (id) => api.get(`/tracks/${id}/deep-discovery`);
export const triggerDeepDiscovery = (id) => api.post(`/tracks/${id}/deep-discovery`);


// Artists & Albums
export const getArtists = () => api.get('/artists');
export const getAlbums = (artist = null) => api.get('/albums', { params: { artist } });
export const mergeAlbums = (data) => api.post('/albums/merge', data);

// Playlists
export const getPlaylists = () => api.get('/playlists');
export const getPlaylist = (id) => api.get(`/playlists/${id}`);
export const createPlaylist = (data) => api.post('/playlists', data);
export const updatePlaylist = (id, data) => api.patch(`/playlists/${id}`, data);
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);
export const uploadPlaylistCover = (id, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/playlists/${id}/cover`, form, { headers: {'Content-Type': 'multipart/form-data'} });
};

export const uploadTrackCover = (id, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/tracks/${id}/cover`, form, { headers: {'Content-Type': 'multipart/form-data'} });
};

export const uploadAlbumCover = (album, artist, file) => {
  const form = new FormData();
  form.append('album', album);
  if (artist) form.append('artist', artist);
  form.append('file', file);
  return api.post('/albums/cover', form, { headers: {'Content-Type': 'multipart/form-data'} });
};

export const uploadArtistCover = (artist, file) => {
  const form = new FormData();
  form.append('artist', artist);
  form.append('file', file);
  return api.post('/artists/cover', form, { headers: {'Content-Type': 'multipart/form-data'} });
};

export const renameArtist = (oldName, newName) => {
  const form = new FormData();
  form.append('old_name', oldName);
  form.append('new_name', newName);
  return api.post('/artists/rename', form);
};
export const addTrackToPlaylist = (playlistId, trackId, position = null) =>
  api.post(`/playlists/${playlistId}/tracks`, { track_id: trackId, position });
export const addAllTracksToPlaylist = (playlistId) =>
  api.post(`/playlists/${playlistId}/add-all-tracks`);
export const removeTrackFromPlaylist = (playlistId, trackId) =>
  api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
export const reorderPlaylistTracks = (playlistId, trackIds) =>
  api.put(`/playlists/${playlistId}/tracks/reorder`, { track_ids: trackIds });

// Queue - Smart context
export const fetchSmartQueue = (currentTrackId, queueSize, context = null) =>
  api.post('/queue/smart', null, { params: { current_track_id: currentTrackId, queue_size: queueSize, context } });
export const sendQueueFeedback = (trackId, action, position = null, duration = null) =>
  api.post('/queue/feedback', null, { params: { track_id: trackId, action, position, duration } });
export const getQueue = () => api.get('/queue');
export const addToQueue = (trackId, position = null) =>
  api.post('/queue', { track_id: trackId, position });
export const reorderQueue = (queueItemId, newPosition) =>
  api.post('/queue/reorder', { queue_item_id: queueItemId, new_position: newPosition });
export const removeFromQueue = (queueItemId) => api.delete(`/queue/${queueItemId}`);
export const clearQueue = () => api.delete('/queue');

// Player State
export const getPlayerState = () => api.get('/player/state');
export const updatePlayerState = (data) => api.patch('/player/state', data);

// Auth & User
export const register = (username, password) => api.post('/auth/register', { username, password });
export const login = (username, password) =>
  api.post(
    '/auth/token',
    new URLSearchParams({ username, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
export const getMe = () => api.get('/auth/me');

export const getSettings = () => api.get('/users/me/settings');
export const updateSettings = (data) => api.patch('/users/me/settings', data);

// Favorites & History
export const getFavorites = () => api.get('/users/me/favorites');
export const addFavorite = (trackId) => api.post('/users/me/favorites', { track_id: trackId });
export const removeFavorite = (trackId) => api.delete(`/users/me/favorites/${trackId}`);

export const getHistory = (limit = 50) => api.get('/users/me/history', { params: { limit } });
export const addHistory = (trackId, position, duration) =>
  api.post('/users/me/history', { track_id: trackId, position, duration });

// Tags
export const getTags = (trackId) => api.get('/users/me/tags', { params: { track_id: trackId } });
export const addTag = (trackId, tag, type = 'custom') =>
  api.post('/users/me/tags', { track_id: trackId, tag, type });
export const removeTag = (tagId) => api.delete(`/users/me/tags/${tagId}`);

// Share Links
export const createShareLink = (kind, resourceId, title) =>
  api.post('/share', { kind, resource_id: resourceId, title });
export const getShareLink = (token) => api.get(`/share/${token}`);
export const listShareComments = (token) => api.get(`/share/${token}/comments`);
export const addShareComment = (token, comment) => api.post(`/share/${token}/comments`, { comment });

// Virtual playlists
export const getFavoritesPlaylist = () => api.get('/playlists/favorites');
export const getMostPlayedPlaylist = (limit = 50) => api.get('/playlists/most-played', { params: { limit } });

// music-dl (external downloader) helpers
export const searchMusicDl = (q) => api.get('/music-dl/search', { params: { q } });
export const listMusicDlFolders = () => api.get('/music-dl/folders');
export const createMusicDlFolder = (name) => api.post('/music-dl/folders', { name });
export const downloadMusicDl = (data = {}) => api.post('/music-dl/download', data);

export default api;
