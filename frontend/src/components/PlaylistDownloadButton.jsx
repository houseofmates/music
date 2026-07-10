import React, { useState, useEffect } from 'react';
import { Download, WifiOff, Loader2, Check, X, Zap } from '../icons.jsx';
import { playlistDownloadManager } from '../services/playlistDownloadManager.js';
import { triggerImpact } from '../utils/haptics.js';

const PlaylistDownloadButton = ({ playlist, compact = false }) => {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDownloadStatus();
  }, [playlist.id]);

  const loadDownloadStatus = async () => {
    try {
      const status = await playlistDownloadManager.getPlaylistDownloadStatus(playlist.id);
      setDownloadStatus(status);
    } catch (err) {
    }
  };

  const handleDownload = async () => {
    triggerImpact('medium');
    setError(null);
    
    try {
      setIsDownloading(true);
      
      // Start download
      await playlistDownloadManager.downloadPlaylist(playlist.id);
      
      // Update status
      await loadDownloadStatus();
      triggerImpact('success');
      
    } catch (err) {
      setError(err.message);
      triggerImpact('error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteDownloads = async () => {
    triggerImpact('medium');
    
    try {
      await playlistDownloadManager.deletePlaylistDownloads(playlist.id);
      await loadDownloadStatus();
      triggerImpact('success');
    } catch (err) {
      setError(err.message);
      triggerImpact('error');
    }
  };

  // Monitor download progress
  useEffect(() => {
    if (isDownloading) {
      const interval = setInterval(() => {
        const progress = playlistDownloadManager.getDownloadProgress(playlist.id);
        setDownloadProgress(progress);
        
        if (!progress.isDownloading) {
          setIsDownloading(false);
          loadDownloadStatus(); // Refresh status
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isDownloading, playlist.id]);

  if (!downloadStatus) {
    return (
      <div className="touch-target">
        <Loader2 className="w-4 h-4 animate-spin text-vibe-gold" />
      </div>
    );
  }

  // Fully downloaded state
  if (downloadStatus.isFullyDownloaded) {
    if (compact) {
      return (
        <button
          onClick={handleDeleteDownloads}
          className="touch target p-2 rounded-full bg-vibe-gold-subtle text-vibe-gold hover:bg-vibe-gold-border transition-colors"
          title="Remove from offline"
        >
          <WifiOff className="w-4 h-4" />
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-vibe-gray text-sm">
          <Check className="w-4 h-4 text-green-500" />
          <span>{downloadStatus.downloaded} tracks offline</span>
        </div>
        <button
          onClick={handleDeleteDownloads}
          className="btn-gold text-sm"
        >
          <X className="w-4 h-4 mr-2" />
          remove offline
        </button>
      </div>
    );
  }

  // Downloading state
  if (isDownloading && downloadProgress) {
    const percentage = downloadProgress.percentage;
    const current = downloadProgress.completed;
    const total = downloadProgress.total;

    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-vibe-gold" />
          <span className="text-xs text-vibe-gray">{percentage}%</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-vibe-gold text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>downloading {current}/{total}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-vibe-gold-subtle rounded-full h-2">
          <div 
            className="bg-vibe-gold h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <button
          onClick={() => playlistDownloadManager.cancelPlaylistDownload(playlist.id)}
          className="text-vibe-gray text-sm hover:text-vibe-white transition-colors"
        >
          cancel
        </button>
      </div>
    );
  }

  // Partially downloaded state
  if (downloadStatus.isPartiallyDownloaded) {
    if (compact) {
      return (
        <button
          onClick={handleDownload}
          className="touch-target p-2 rounded-full bg-vibe-gold-subtle text-vibe-gold hover:bg-vibe-gold transition-colors"
          title="Complete download"
        >
          <Download className="w-4 h-4" />
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-vibe-gray text-sm">
          <WifiOff className="w-4 h-4" />
          <span>{downloadStatus.downloaded}/{downloadStatus.total} offline</span>
        </div>
        <button onClick={handleDownload} className="btn-gold text-sm">
          <Download className="w-4 h-4 mr-2" />
          complete download
        </button>
      </div>
    );
  }

  // Not downloaded state
  if (compact) {
    return (
      <button
        onClick={handleDownload}
        className="touch-target p-2 rounded-full bg-vibe-gold text-vibe-black hover:bg-vibe-gold-hover transition-colors"
        title="Download for offline"
      >
        <Download className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button onClick={handleDownload} className="btn-gold">
      <Download className="w-4 h-4 mr-2" />
      download {downloadStatus.total} tracks
    </button>
  );
};

export default PlaylistDownloadButton;
