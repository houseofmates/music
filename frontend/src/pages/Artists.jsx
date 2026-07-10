import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getArtists, uploadArtistCover, renameArtist } from '../api';
import { useLiveSearch } from '../hooks/useLiveSearch';
import ArtistEditModal from '../components/ArtistEditModal';
import { Loader2, Search, WifiOff, Zap } from '../icons.jsx';
import { useDataSaver } from '../context/DataSaverContext';
import { triggerImpact } from '../utils/haptics';

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Live search for artists
  const {
    query: searchTerm,
    setQuery: setSearchTerm,
    results: searchResults,
    loading: searchLoading,
    error: searchError
  } = useLiveSearch(
    (query) => {
      // Client-side filtering for artists
      return artists.filter(artist => 
        artist.toLowerCase().includes(query.toLowerCase())
      );
    },
    { debounceMs: 200, minQueryLength: 1 }
  );
  const [editingArtist, setEditingArtist] = useState(null);
  const [showArtistEdit, setShowArtistEdit] = useState(false);
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
  const lowDataActive = Boolean(dataSaver?.effectiveLowData);
  const navigate = useNavigate();

  const loadArtists = useCallback(async () => {
    if (shouldDeferNetwork) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getArtists();
      setArtists(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setArtists([]);
    } finally {
      setLoading(false);
    }
  }, [shouldDeferNetwork]);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  const handleEditArtistClick = (artistName, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (shouldDeferNetwork) return;
    setEditingArtist({ name: artistName });
    setShowArtistEdit(true);
  };

  const handleSaveArtist = async (data) => {
    if (!editingArtist) return;
    if (shouldDeferNetwork) return;
    try {
      if (data.name && data.name !== editingArtist.name) {
        await renameArtist(editingArtist.name, data.name);
      }
      if (data.coverFile) {
        const artistName = data.name || editingArtist.name;
        await uploadArtistCover(artistName, data.coverFile);
      }
      setEditingArtist(null);
      setShowArtistEdit(false);
      loadArtists();
    } catch (err) {
    }
  };

  // Use searchResults from live search hook

  return (
    <div className="min-h-screen bg-vibe-black pb-32 flex flex-col">
      {/* Header - centered like playlists */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe ">
        <div className="px-4 py-0">
          <div className="relative flex items-center justify-center">
            <div className="w-8"></div>
            <h1 className="text-2xl font-bold text-vibe-gold">artists</h1>
            <div className="w-8"></div>
          </div>
          {!loading && (
            <p className="text-white mb-3 text-center">
              {searchResults.length}{searchTerm.trim() ? ` of ${artists.length}` : ''} artists
            </p>
          )}
          {(shouldDeferNetwork || lowDataActive) && (
            <div className="space-y-2 mb-3">
              {shouldDeferNetwork && (
                <div className="rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2">
                  <WifiOff className="w-4 h-4" /> offline mode — showing cached artists
                </div>
              )}
              {!shouldDeferNetwork && lowDataActive && (
                <div className="rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> low data mode pauses auto-refresh
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search artists"
              className="w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 flex-1 overflow-y-auto pb-32" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12 text-white">
            <p>
              {shouldDeferNetwork
                ? 'artist list unavailable while offline'
                : 'no artists match your search'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4">
            {searchResults.map((artist) => (
              <div
                key={artist}
                onClick={() => { triggerImpact('light'); navigate(`/artists/${encodeURIComponent(artist)}`); }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleEditArtistClick(artist, e);
                }}
                className="cursor-pointer"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333] flex items-center justify-center">
                  <span className="text-4xl font-bold text-vibe-gold">{artist.charAt(0).toUpperCase()}</span>
                </div>
                <div className="mt-2 px-1">
                  <h3 className="text-sm text-white font-semibold text-center leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{artist}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        <ArtistEditModal
          isOpen={showArtistEdit}
          artistData={editingArtist}
          onClose={() => {
            setShowArtistEdit(false);
            setEditingArtist(null);
          }}
          onSave={handleSaveArtist}
        />
      </div>
    </div>
  );
}
