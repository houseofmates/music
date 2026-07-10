// premium downloads management ui with queue control and storage optimization
import React, { useState, useEffect } from 'react';
import { WifiOff } from '../icons.jsx';
import offlineManager from '../services/offlineManager';

const DownloadsManager = () => {
  const [downloads, setDownloads] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('lossless');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadDownloads();
    loadCacheStats();

    // Listen for download events
    const handleDownloadProgress = (e) => {
      updateDownloadProgress(e.detail);
    };

    const handleDownloadComplete = (e) => {
      loadDownloads();
      loadCacheStats();
    };

    const handleDownloadError = (e) => {
      // You could show a toast notification here
      setToast && setToast(`Download failed: ${e.detail.error?.message || 'Unknown error'}`);
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      // Resume any pending downloads
      offlineManager.processDownloadQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('downloadProgress', handleDownloadProgress);
    window.addEventListener('downloadComplete', handleDownloadComplete);
    window.addEventListener('downloadError', handleDownloadError);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('downloadProgress', handleDownloadProgress);
      window.removeEventListener('downloadComplete', handleDownloadComplete);
      window.removeEventListener('downloadError', handleDownloadError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDownloads = async () => {
    try {
      const downloadedTracks = await offlineManager.getDownloadedTracks();
      if (downloadedTracks.length === 0) {
        setDownloads([]);
        return;
      }

      // Batch load all tracks from the API in one call
      const response = await fetch(`/api/tracks?limit=${downloadedTracks.length}&ids=${downloadedTracks.join(',')}`);
      const trackDataMap = {};
      if (response.ok) {
        const data = await response.json();
        (Array.isArray(data) ? data : []).forEach(t => {
          trackDataMap[t.id] = t;
        });
      }

      // Load download records from IndexedDB in batch
      const downloadRecords = await batchGetDownloadRecords(downloadedTracks);

      const downloadsWithMetadata = downloadedTracks.map((trackId) => {
        const trackData = trackDataMap[trackId] || {};
        const downloadRecord = downloadRecords[trackId];
        return {
          id: trackId,
          title: trackData.title || trackData.filename || `track ${trackId}`,
          artist: trackData.artist || 'unknown artist',
          album: trackData.album,
          quality: downloadRecord?.quality || 'lossless',
          size: downloadRecord?.size || 0,
          downloadDate: downloadRecord?.downloadDate || new Date().toISOString(),
          duration: trackData.duration
        };
      });

      setDownloads(downloadsWithMetadata);
    } catch (error) {
    }
  };

  // Batch load download records from IndexedDB
  const batchGetDownloadRecords = async (trackIds) => {
    if (!offlineManager.db) return {};
    return new Promise((resolve) => {
      const tx = offlineManager.db.transaction('downloads', 'readonly');
      const store = tx.objectStore('downloads');
      const results = {};
      let completed = 0;
      const total = trackIds.length;
      if (total === 0) { resolve(results); return; }
      trackIds.forEach(trackId => {
        const req = store.get(trackId);
        req.onsuccess = () => {
          if (req.result) results[trackId] = req.result;
          completed++;
          if (completed >= total) resolve(results);
        };
        req.onerror = () => {
          completed++;
          if (completed >= total) resolve(results);
        };
      });
    });
  };

  const loadCacheStats = async () => {
    try {
      const stats = await offlineManager.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
    }
  };

  const updateDownloadProgress = (detail) => {
    setDownloads(prev => prev.map(download => 
      download.id === detail.trackId 
        ? { ...download, progress: detail.progress }
        : download
    ));
  };

  const handleRemoveDownload = async (trackId) => {
    try {
      await offlineManager.removeDownloadedTrack(trackId);
      loadDownloads();
      loadCacheStats();
    } catch (error) {
    }
  };

  const handleClearCache = async () => {
    if (confirm('are you sure you want to clear all downloads? this cannot be undone.')) {
      try {
        await offlineManager.clearCache();
        loadDownloads();
        loadCacheStats();
      } catch (error) {
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'unknown';
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(2)} gb` : `${mb.toFixed(1)} mb`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-us', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="downloads-manager" style={{
      background: '#050505',
      color: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      fontFamily: 'Varela Round, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'normal',
          textTransform: 'lowercase',
          color: '#f6b012',
          margin: 0
        }}>
          downloads
        </h2>
        {isOffline && (
          <div style={{
            marginLeft: '12px',
            padding: '4px 8px',
            background: '#333',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#888',
            display: 'flex',
            alignItems: 'center'
          }}>
            <WifiOff style={{ width: '12px', height: '12px', marginRight: '4px' }} />
            offline
          </div>
        )}
      </div>

      {/* cache stats */}
      {cacheStats && (
        <div className="cache-stats" style={{
          background: '#1a1a1a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>
              storage used
            </span>
            <span style={{ fontSize: '16px', color: '#f6b012' }}>
              {cacheStats.cacheSizeGB} gb / {Math.round(cacheStats.maxCacheSizeMB / 1024)} gb
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '6px',
            background: '#333',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              width: `${cacheStats.usagePercentage}%`,
              height: '100%',
              background: '#f6b012',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            opacity: 0.6
          }}>
            <span>{cacheStats.downloadedCount} tracks</span>
            <span>{cacheStats.usagePercentage}% used</span>
          </div>
        </div>
      )}

      {/* quality selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          marginBottom: '8px',
          opacity: 0.8
        }}>
          download quality
        </label>
        <select
          value={selectedQuality}
          onChange={(e) => setSelectedQuality(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'Varela Round, sans-serif'
          }}
        >
          <option value="lossless">lossless (original flac/opus)</option>
          <option value="high">high quality (320kbps opus)</option>
          <option value="medium">medium quality (128kbps opus)</option>
          <option value="low">low quality (96kbps opus)</option>
        </select>
      </div>

      {/* downloads list */}
      <div className="downloads-list">
        {downloads.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            opacity: 0.5
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              no downloads yet
            </div>
            <div style={{ fontSize: '14px' }}>
              download tracks for offline listening
            </div>
          </div>
        ) : (
          downloads.map((download) => (
            <div
              key={download.id}
              className="download-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#1a1a1a',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {download.title}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>
                  {download.artist} • {download.quality} • {formatFileSize(download.size)}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.4, marginTop: '2px' }}>
                  {formatDate(download.downloadDate)}
                </div>
              </div>
              
              {download.progress !== undefined && download.progress < 100 && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  marginRight: '12px'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid #333',
                    borderTopColor: '#f6b012',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '12px',
                    color: '#f6b012'
                  }}>
                    {Math.round(download.progress)}%
                  </div>
                </div>
              )}
              
              <button
                onClick={() => handleRemoveDownload(download.id)}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #ff4444',
                  borderRadius: '6px',
                  color: '#ff4444',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Varela Round, sans-serif'
                }}
              >
                remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* clear cache button */}
      {downloads.length > 0 && (
        <button
          onClick={handleClearCache}
          disabled={isProcessing}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid #ff4444',
            borderRadius: '8px',
            color: '#ff4444',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Varela Round, sans-serif',
            marginTop: '20px'
          }}
        >
          clear all downloads
        </button>
      )}

      {/* toast notifications */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#f6b012',
          color: '#050505',
          padding: '12px 24px',
          borderRadius: '24px',
          fontSize: '14px',
          zIndex: 100,
          fontFamily: 'Varela Round, sans-serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DownloadsManager;
