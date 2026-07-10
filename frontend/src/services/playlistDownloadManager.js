// premium playlist download manager with automatic detection and <3 tap workflow
import offlineManager from './offlineManager.js';
import { getPlaylists, getPlaylist } from '../api.js';

export class PlaylistDownloadManager {
  constructor() {
    this.downloadQueue = [];
    this.isDownloading = false;
    this.maxConcurrentDownloads = 3;
    this.activeDownloads = new Set();
    
    // Auto-detection patterns for offline playlists
    this.offlineKeywords = [
      'offline', 'download', 'mobile', 'phone', 'travel', 'commute',
      'plane', 'flight', 'car', 'offline', 'no wifi', 'local',
      'cache', 'saved', 'favorites', 'offline mix', 'road trip'
    ];
    
    // Smart location patterns
    this.locationKeywords = [
      'gym', 'workout', 'running', 'exercise', 'work', 'office',
      'home', 'bedroom', 'kitchen', 'party', 'relax', 'study',
      'focus', 'sleep', 'morning', 'evening', 'night'
    ];
  }

  // Auto-detect playlists that should be available offline
  detectOfflinePlaylists(playlists = []) {
    return playlists.filter(playlist => {
      const name = (playlist.name || '').toLowerCase();
      
      // Check for offline keywords
      const hasOfflineKeyword = this.offlineKeywords.some(keyword => 
        name.includes(keyword)
      );
      
      // Check for location keywords (smart detection)
      const hasLocationKeyword = this.locationKeywords.some(keyword => 
        name.includes(keyword)
      );
      
      // Check for small playlists (good for offline)
      const isSmallPlaylist = playlist.track_count <= 50;
      
      // Prioritize playlists with offline keywords, then location keywords, then small playlists
      return hasOfflineKeyword || (hasLocationKeyword && isSmallPlaylist) || 
             (playlist.track_count <= 20 && playlist.track_count > 0);
    });
  }

  // Get download status for a playlist
  async getPlaylistDownloadStatus(playlistId) {
    try {
      const response = await getPlaylist(playlistId);
      const playlist = response.data;
      const tracks = playlist.tracks || [];
      const downloadedCount = tracks.filter(track => 
        offlineManager.downloadedTracks.has(track.id)
      ).length;
      
      return {
        total: tracks.length,
        downloaded: downloadedCount,
        isFullyDownloaded: downloadedCount === tracks.length,
        isPartiallyDownloaded: downloadedCount > 0 && downloadedCount < tracks.length,
        percentage: tracks.length > 0 ? Math.round((downloadedCount / tracks.length) * 100) : 0
      };
    } catch (error) {
      return { total: 0, downloaded: 0, isFullyDownloaded: false, isPartiallyDownloaded: false, percentage: 0 };
    }
  }

  // Download entire playlist with <3 tap workflow
  async downloadPlaylist(playlistId, quality = 'high') {
    if (this.isDownloading) {
      throw new Error('Already downloading - please wait for current download to complete');
    }

    try {
      const response = await getPlaylist(playlistId);
      const playlist = response.data;
      const tracks = playlist.tracks || [];
      
      if (tracks.length === 0) {
        throw new Error('Playlist is empty');
      }

      // Add all tracks to download queue
      this.downloadQueue = tracks.map(track => ({
        trackId: track.id,
        quality,
        playlistId,
        trackName: track.title || 'Unknown Track',
        artistName: track.artist || 'Unknown Artist'
      }));

      // Start downloading
      this.isDownloading = true;
      await this.processDownloadQueue();
      
      return {
        success: true,
        totalTracks: tracks.length,
        message: `Downloaded ${tracks.length} tracks successfully`
      };
    } catch (error) {
      this.isDownloading = false;
      throw error;
    }
  }

  // Process download queue with concurrent downloads
  async processDownloadQueue() {
    while (this.downloadQueue.length > 0 && this.activeDownloads.size < this.maxConcurrentDownloads) {
      const downloadItem = this.downloadQueue.shift();
      this.activeDownloads.add(downloadItem.trackId);
      
      // Download in background
      this.downloadSingleTrack(downloadItem).finally(() => {
        this.activeDownloads.delete(downloadItem.trackId);
        
        // Continue processing if there are more items
        if (this.downloadQueue.length > 0) {
          setTimeout(() => this.processDownloadQueue(), 100);
        } else if (this.activeDownloads.size === 0) {
          this.isDownloading = false;
        }
      });
    }
  }

  // Download single track
  async downloadSingleTrack(downloadItem) {
    try {
      const { trackId, quality, trackName, artistName } = downloadItem;
      
      // Use offline manager to download
      await offlineManager.downloadTrack(trackId, quality);
      
      // Update progress (could be emitted via event system)
    } catch (error) {
    }
  }

  // Get download progress for current playlist download
  getDownloadProgress(playlistId) {
    const playlistDownloads = this.downloadQueue.filter(item => item.playlistId === playlistId);
    const total = playlistDownloads.length + this.activeDownloads.size;
    const completed = playlistDownloads.length - this.downloadQueue.filter(item => item.playlistId === playlistId).length;
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      isDownloading: this.isDownloading && playlistDownloads.length > 0
    };
  }

  // Cancel playlist download
  cancelPlaylistDownload(playlistId) {
    // Remove tracks from queue
    this.downloadQueue = this.downloadQueue.filter(item => item.playlistId !== playlistId);
    
    // Note: Active downloads will continue but can be cancelled if needed
    if (this.downloadQueue.length === 0 && this.activeDownloads.size === 0) {
      this.isDownloading = false;
    }
  }

  // Delete downloaded playlist tracks
  async deletePlaylistDownloads(playlistId) {
    try {
      const response = await getPlaylist(playlistId);
      const playlist = response.data;
      const tracks = playlist.tracks || [];
      
      const deletePromises = tracks.map(track => 
        offlineManager.removeTrack(track.id)
      );
      
      await Promise.all(deletePromises);
      return { success: true, deletedTracks: tracks.length };
    } catch (error) {
      throw error;
    }
  }

  // Get all playlists with their download status
  async getAllPlaylistsWithStatus() {
    try {
      const response = await getPlaylists();
      const playlists = Array.isArray(response?.data) ? response.data : [];
      const playlistsStatus = await Promise.all(
        playlists.map(async playlist => {
          const status = await this.getPlaylistDownloadStatus(playlist.id);
          const isAutoDetected = this.detectOfflinePlaylists([playlist]).length > 0;
          
          return {
            ...playlist,
            downloadStatus: status,
            isAutoDetected,
            isRecommendedForOffline: isAutoDetected || status.total <= 20
          };
        })
      );
      
      return playlistsStatus;
    } catch (error) {
      return [];
    }
  }

  // Quick download for auto-detected playlists (1-tap download)
  async quickDownloadAutoDetected() {
    const response = await getPlaylists();
    const playlists = Array.isArray(response?.data) ? response.data : [];
    const autoDetected = this.detectOfflinePlaylists(playlists);
    
    if (autoDetected.length === 0) {
      throw new Error('No playlists found for auto-download. Try naming playlists with keywords like "offline", "mobile", "travel", etc.');
    }

    // Download the first auto-detected playlist (or all if user prefers)
    const playlist = autoDetected[0];
    return await this.downloadPlaylist(playlist.id);
  }
}

// Singleton export
const playlistDownloadManager = new PlaylistDownloadManager();
export { playlistDownloadManager };
