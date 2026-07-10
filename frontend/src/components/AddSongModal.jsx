import { useState, useEffect } from 'react';
import { X, Search, Loader2, Plus, Download } from '../icons.jsx';
import { showToast } from '../utils/toast';
import {
  searchMusicDl,
  listMusicDlFolders,
  createMusicDlFolder,
  downloadMusicDl,
} from '../api';

export default function AddSongModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState(new Map());
  const [folders, setFolders] = useState([]);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    } else {
      // Reset state when closing
      setSearchQuery('');
      setResults([]);
      setSelectedSongs(new Map());
      setShowFolderPicker(false);
    }
  }, [isOpen]);

  const loadFolders = async () => {
    try {
      const { data } = await listMusicDlFolders();
      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      setFolders([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data } = await searchMusicDl(searchQuery.trim());
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSelection = (video) => {
    const newSelection = new Map(selectedSongs);
    if (newSelection.has(video.id)) {
      newSelection.delete(video.id);
    } else {
      newSelection.set(video.id, { url: video.url, title: video.title });
    }
    setSelectedSongs(newSelection);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDownload = async (folder) => {
    const urls = Array.from(selectedSongs.values()).map((v) => v.url);
    if (urls.length === 0) return;

    setDownloading(true);
    setShowFolderPicker(false);

    try {
      await downloadMusicDl({ urls, folder });
      showToast(`Successfully queued ${urls.length} song${urls.length > 1 ? 's' : ''} for download!`, 'success');
      setSelectedSongs(new Map());
      setSearchQuery('');
      setResults([]);
    } catch (error) {
      showToast('Error starting download', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createMusicDlFolder(newFolderName.trim());
      setNewFolderName('');
      await loadFolders();
    } catch (error) {
      showToast('Failed to create folder', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-vibe-black border-2 border-vibe-gold rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-vibe-gold">add new songs</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors"
            aria-label="close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-[#333]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888]" />
            <input
              type="text"
              placeholder="search for songs, artists, or paste spotify/youtube link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 rounded-2xl search-opaque placeholder-[#888] placeholder-lowercase border-2 focus:border-[#ffbb20] focus:outline-none transition-colors"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-vibe-gold animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center text-[#888] py-12">
              {searchQuery ? 'no results found' : 'search for songs to add to your library'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {results.map((video) => (
                <div
                  key={video.id}
                  onClick={() => toggleSelection(video)}
                  className={`flex gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                    selectedSongs.has(video.id)
                      ? 'bg-[#2a1f0f] border-2 border-vibe-gold'
                      : 'bg-[#111] hover:bg-[#1a1a1a] border-2 border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    {video.duration && (
                      <div className="absolute bottom-1 right-1 bg-black px-2 py-0.5 rounded text-xs text-white">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium line-clamp-2 mb-1">
                      {video.title}
                    </div>
                    <div className="text-[#888] text-sm">
                      {video.uploader}
                    </div>
                  </div>
                  {selectedSongs.has(video.id) && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-vibe-gold flex items-center justify-center">
                        <span className="text-vibe-black font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        {selectedSongs.size > 0 && !showFolderPicker && (
          <div className="p-6 border-t border-[#333] bg-vibe-black">
            <button
              onClick={() => setShowFolderPicker(true)}
              disabled={downloading}
              className="w-full py-4 bg-vibe-gold text-vibe-black rounded-2xl font-bold text-lg hover:bg-[#ffcc40] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  save {selectedSongs.size} song{selectedSongs.size > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}

        {/* Folder Picker */}
        {showFolderPicker && (
          <div className="p-6 border-t border-[#333] bg-vibe-black">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-3">select destination</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-4">
                {folders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => handleDownload(folder)}
                    className="p-3 bg-[#1a1a1a] hover:bg-[#2a1f0f] hover:border-vibe-gold border-2 border-transparent rounded-xl text-white text-left transition-colors"
                  >
                    📂 {folder === '/' ? 'root folder' : folder}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="new folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                className="flex-1 px-4 py-2 rounded-xl bg-[#1a1a1a] text-white placeholder-[#888] placeholder-lowercase border-2 border-transparent focus:border-vibe-gold focus:outline-none"
              />
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-vibe-gold text-vibe-black rounded-xl font-bold hover:bg-[#ffcc40] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                create
              </button>
            </div>

            <button
              onClick={() => setShowFolderPicker(false)}
              className="w-full py-2 text-[#888] hover:text-white transition-colors"
            >
              cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
