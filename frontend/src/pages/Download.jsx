import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WifiOff, Loader2, Plus } from '../icons.jsx';
import { useDataSaver } from '../context/DataSaverContext';
import { triggerImpact } from '../utils/haptics';
import { useLiveSearch } from '../hooks/useLiveSearch';
import {
  searchMusicDl,
  listMusicDlFolders,
  createMusicDlFolder,
  downloadMusicDl,
} from '../api.js';
import QuickPlaylistDownload from '../components/QuickPlaylistDownload.jsx';

// Format duration from seconds to MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return '';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

// Detect if running as Android APK (Capacitor)
const isAndroidNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android';

const Download = () => {
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const [selectedSongs, setSelectedSongs] = useState(new Map());
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [toast, setToast] = useState(null);
  
  // Live search for downloads
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError
  } = useLiveSearch(searchMusicDl, { debounceMs: 300, minQueryLength: 2 });

  useEffect(() => {
    triggerImpact('light');
  }, []);

  // Toast helper
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Use live search from hook - no manual debounce needed

  // Form submit for immediate search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Use immediate search from live search hook
    if (searchError?.immediateSearch) {
      searchError.immediateSearch();
    }
  };

  // Toggle song selection
  const toggleSelection = (video) => {
    setSelectedSongs(prev => {
      const next = new Map(prev);
      if (next.has(video.id)) {
        next.delete(video.id);
      } else {
        next.set(video.id, { url: video.url, title: video.title });
      }
      return next;
    });
  };

  // Load folders for modal
  const loadFolders = async () => {
    try {
      const res = await listMusicDlFolders();
      setFolders(res.data || ['/']);
    } catch (err) {
      setFolders(['/']);
    }
  };

  // Show folder picker
  const handleShowFolderPicker = async () => {
    await loadFolders();
    setShowFolderModal(true);
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createMusicDlFolder(newFolderName.trim());
      setNewFolderName('');
      showToast(`folder '${newFolderName.trim()}' created`);
      await loadFolders();
    } catch (err) {
      showToast('failed to create folder');
    }
  };

  // Initiate download
  const handleDownload = async (folder) => {
    const urls = Array.from(selectedSongs.values()).map(v => v.url);
    const count = selectedSongs.size;

    setShowFolderModal(false);
    showToast(`saving ${count} item${count > 1 ? 's' : ''}...`);

    // Clear selection
    setSelectedSongs(new Map());

    try {
      await downloadMusicDl({ urls, folder });
      showToast('batch saved successfully');
    } catch (err) {
      showToast('error starting download');
    }
  };

  if (shouldDeferNetwork) {
    return (
      <div className="min-h-screen bg-vibe-black pb-32">
        {/* Header - centered title with status bar padding */}
        <div className={`sticky top-0 bg-vibe-black z-10 px-4 py-4 ${isAndroidNative ? 'pt-safe' : ''}`}>
          <div className="relative flex items-center justify-center min-h-[44px]">
            <Link
              to="/"
              className="absolute left-0 p-2 text-white hover:text-vibe-gold transition-colors"
              aria-label="Back to home"
              onClick={() => triggerImpact('light')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-vibe-gold">download</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-4 pt-20">
          <WifiOff className="w-16 h-16 text-[#555] mb-4" />
          <p className="text-[#888] text-center">
            downloads are not available in offline mode
          </p>
          <p className="text-[#666] text-sm text-center mt-2">
            connect to the internet to search and download songs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header - centered title with status bar padding */}
      <div className={`sticky top-0 bg-vibe-black z-20 px-4 py-4 border-b border-[#333] ${isAndroidNative ? 'pt-safe' : ''}`}>
        <div className="relative flex items-center justify-center min-h-[44px]">
          <Link
            to="/"
            className="absolute left-0 p-2 text-white hover:text-vibe-gold transition-colors"
            aria-label="Back to home"
            onClick={() => triggerImpact('light')}
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-vibe-gold">download</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="search youtube..."
            className="flex-1 bg-[#1a1a1a] border-2 border-transparent focus:border-vibe-gold rounded-xl px-4 py-3 text-white placeholder:text-[#666] outline-none lowercase min-w-0"
          />
          <button
            type="submit"
            className="bg-vibe-gold text-vibe-black px-5 py-3 rounded-xl font-semibold lowercase flex-shrink-0 h-[48px]"
            onClick={() => triggerImpact('light')}
          >
            go
          </button>
        </form>
      </div>

      {/* Quick Playlist Downloads */}
      <div className="px-4 py-2">
        <QuickPlaylistDownload />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
        </div>
      )}

      {/* Results */}
      <div className="px-4 pb-32 space-y-3" style={{ overflowAnchor: 'none' }}>
        {!loading && results.length === 0 && searchQuery.trim() && (
          <p className="text-[#888] text-center py-8 lowercase">no results found</p>
        )}

        {results.map((video) => {
          const isSelected = selectedSongs.has(video.id);
          return (
            <div
              key={video.id}
              onClick={() => { triggerImpact('light'); toggleSelection(video); }}
              className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#1a1a1a] border-2 border-vibe-gold'
                  : 'bg-[#121212] border-2 border-transparent hover:bg-[#1a1a1a]'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-28 flex-shrink-0 rounded-xl overflow-hidden aspect-video bg-[#1a1a1a]">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2a2a2a]" />
                )}
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <h3 className="text-white text-sm font-medium line-clamp-2 lowercase leading-snug">
                  {video.title}
                </h3>
                <p className="text-[#888] text-xs mt-1 lowercase">
                  {video.uploader}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      {selectedSongs.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] px-4 py-4 z-50">
          <button
            onClick={() => { triggerImpact('light'); handleShowFolderPicker(); }}
            className="w-full bg-vibe-gold text-vibe-black py-4 rounded-2xl font-semibold lowercase"
          >
            save {selectedSongs.size} song{selectedSongs.size > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFolderModal(false)}
        >
          <div
            className="bg-[#121212] w-full max-w-md rounded-3xl p-6 border border-[#333]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-vibe-gold text-center mb-4 lowercase">
              save to folder
            </h2>

            {/* New folder input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="new folder name..."
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#666] outline-none lowercase"
              />
              <button
                onClick={handleCreateFolder}
                className="w-12 h-12 bg-vibe-gold text-vibe-black rounded-xl flex items-center justify-center font-bold text-xl"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Folder list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => { triggerImpact('light'); handleDownload(folder); }}
                  className="w-full text-left px-4 py-3 bg-[#1a1a1a] rounded-xl hover:bg-[#2a2a2a] hover:text-vibe-gold transition-colors lowercase"
                >
                  {folder === '/' ? '📂 root folder' : `📂 ${folder}`}
                </button>
              ))}
            </div>

            {/* Cancel */}
            <button
              onClick={() => setShowFolderModal(false)}
              className="w-full mt-4 py-3 text-[#888] hover:text-white transition-colors lowercase"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-vibe-gold text-vibe-black px-6 py-3 rounded-full font-semibold z-50 shadow-lg lowercase">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Download;
