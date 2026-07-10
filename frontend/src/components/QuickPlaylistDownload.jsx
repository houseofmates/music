import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, WifiOff, Zap, Loader2, Check, ArrowRight } from '../icons.jsx';
import { playlistDownloadManager } from '../services/playlistDownloadManager.js';
import { triggerImpact } from '../utils/haptics.js';

const QuickPlaylistDownload = ({ hideWhenEmpty = false }) => {
  const [autoDetectedPlaylists, setAutoDetectedPlaylists] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [completedDownloads, setCompletedDownloads] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAutoDetectedPlaylists();
  }, []);

  const loadAutoDetectedPlaylists = async () => {
    try {
      const playlists = await playlistDownloadManager.getAllPlaylistsWithStatus();
      const autoDetected = playlists.filter(p => p.isAutoDetected || p.isRecommendedForOffline);
      setAutoDetectedPlaylists(autoDetected);
    } catch (err) {
    }
  };

  const handleQuickDownload = async (playlistId) => {
    triggerImpact('medium');
    setError(null);
    setIsDownloading(true);
    setCompletedDownloads([]);

    try {
      await playlistDownloadManager.downloadPlaylist(playlistId);
      
      // Mark as completed
      setCompletedDownloads(prev => [...prev, playlistId]);
      triggerImpact('success');
      
      // Refresh auto-detected playlists
      await loadAutoDetectedPlaylists();
      
    } catch (err) {
      setError(err.message);
      triggerImpact('error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Monitor download progress
  useEffect(() => {
    if (isDownloading) {
      const interval = setInterval(() => {
        // Check if any downloads are active
        const hasActiveDownloads = autoDetectedPlaylists.some(playlist => {
          const progress = playlistDownloadManager.getDownloadProgress(playlist.id);
          return progress.isDownloading;
        });

        if (!hasActiveDownloads) {
          setIsDownloading(false);
          loadAutoDetectedPlaylists(); // Refresh status
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isDownloading]);

  if (autoDetectedPlaylists.length === 0) {
    if (hideWhenEmpty) return null;

    return (
      <div className="card-vibe p-6 rounded-xl text-center">
        <WifiOff className="w-12 h-12 text-vibe-gray mx-auto mb-4" />
        <h3 className="text-lg font-medium text-vibe-white mb-2">no playlists found for offline</h3>
        <p className="text-vibe-gray mb-4 text-sm">
          create playlists with keywords like "offline", "mobile", "travel", "commute", or "gym" to auto-detect them
        </p>
        <Link 
          to="/playlists" 
          className="btn-gold inline-flex items-center"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          manage playlists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-vibe-gold" />
        <h3 className="text-lg font-medium text-vibe-white">quick offline downloads</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {autoDetectedPlaylists.map(playlist => {
        const isCompleted = completedDownloads.includes(playlist.id);
        const isFullyDownloaded = playlist.downloadStatus?.isFullyDownloaded;
        const progress = playlistDownloadManager.getDownloadProgress(playlist.id);

        return (
          <div 
            key={playlist.id} 
            className="card-vibe p-4 rounded-xl border border-vibe-gold-border/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-vibe-white font-medium">{playlist.name}</h4>
                <p className="text-vibe-gray text-sm">
                  {playlist.downloadStatus?.downloaded || 0} / {playlist.downloadStatus?.total || 0} tracks offline
                </p>
              </div>
              
              {/* Status icon */}
              <div className="ml-4">
                {isFullyDownloaded || isCompleted ? (
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                ) : progress.isDownloading ? (
                  <div className="w-8 h-8 bg-vibe-gold/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-vibe-gold animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-vibe-gold-subtle rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-vibe-gold" />
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {progress.isDownloading && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-vibe-gray mb-1">
                  <span>downloading {progress.completed}/{progress.total}</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-vibe-gold-subtle rounded-full h-1.5">
                  <div 
                    className="bg-vibe-gold h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="flex gap-2">
              {isFullyDownloaded || isCompleted ? (
                <div className="flex-1 text-center py-2 px-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  <Check className="w-4 h-4 inline mr-2" />
                  ready for offline
                </div>
              ) : progress.isDownloading ? (
                <button
                  onClick={() => playlistDownloadManager.cancelPlaylistDownload(playlist.id)}
                  className="flex-1 py-2 px-4 bg-vibe-gray/10 border border-vibe-gray/30 rounded-lg text-vibe-gray text-sm hover:bg-vibe-gray/20 transition-colors"
                >
                  cancel
                </button>
              ) : (
                <button
                  onClick={() => handleQuickDownload(playlist.id)}
                  disabled={isDownloading}
                  className="flex-1 btn-gold text-sm disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'downloading...' : 'download for offline'}
                </button>
              )}
              
              <Link 
                to={`/playlist/${playlist.id}`}
                className="py-2 px-4 bg-vibe-gold-subtle text-vibe-gold rounded-lg text-sm hover:bg-vibe-gold-border transition-colors"
              >
                view
              </Link>
            </div>
          </div>
        );
      })}

      {/* Tips */}
      <div className="text-center text-vibe-gray text-xs mt-6">
        <p>💡 playlists with keywords like "offline", "mobile", "travel", "gym", "work" are auto-detected</p>
      </div>
    </div>
  );
};

export default QuickPlaylistDownload;
