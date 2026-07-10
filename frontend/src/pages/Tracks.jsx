import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, WifiOff, ChevronLeft, Plus, ListPlus } from '../icons.jsx';
import { useNavigate } from 'react-router-dom';
import TrackList from '../components/TrackList';
import { getTracks, getPlaylists, addAllTracksToPlaylist } from '../api';
import { useDataSaver } from '../context/DataSaverContext';
import { truncateText } from '../utils/text';
import { triggerImpact } from '../utils/haptics';
import { showToast } from '../utils/toast';

const TRACKS_PER_PAGE = 50;

export default function Tracks() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const observerRef = useRef(null);
  const dataSaver = useDataSaver();
  const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);

  const loadTracks = useCallback(async (currentOffset = 0, append = false) => {
    // Always attempt to load tracks - let the API handle network failures
    try {
      if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getTracks({ 
        skip: currentOffset, 
        limit: TRACKS_PER_PAGE 
      });
      
      const newTracks = Array.isArray(response?.data) ? response.data : [];
      
      if (append) {
        setTracks(prev => [...prev, ...newTracks]);
      } else {
        setTracks(newTracks);
      }
      
      // If we got fewer tracks than requested, there are no more
      setHasMore(newTracks.length === TRACKS_PER_PAGE);
      setOffset(currentOffset + newTracks.length);
      
      if (currentOffset === 0) {
        triggerImpact('light');
      }
    } catch (error) {
      if (!append) {
        setTracks([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTracks(0, false);
  }, [loadTracks]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadTracks(offset, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, offset, loadTracks]);

  const loadPlaylists = async () => {
    try {
      const response = await getPlaylists();
      setPlaylists(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setPlaylists([]);
    }
  };

  const handleAddAllClick = async () => {
    await loadPlaylists();
    setShowPlaylistModal(true);
  };

  const handleAddToPlaylist = async (playlistId) => {
    setAddingToPlaylist(playlistId);
    try {
      const response = await addAllTracksToPlaylist(playlistId);
      showToast(`Added ${response.data.added_count} tracks to playlist!`, 'success');
      setShowPlaylistModal(false);
    } catch (error) {
      showToast('Failed to add tracks to playlist', 'error');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10  px-4 py-4 border-b border-[#333]">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-vibe-gold flex-1">all tracks</h1>
          <span className="text-white/60 text-sm">{tracks.length} tracks</span>
        </div>
        {shouldDeferNetwork && (
          <div className="rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2">
            <WifiOff className="w-4 h-4" /> offline — cached tracks only
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-24 text-white">
            <p>no tracks found</p>
          </div>
        ) : (
          <>
            <TrackList tracks={tracks} />
            
            {/* Infinite scroll sentinel */}
            <div ref={observerRef} className="h-4" />
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-vibe-gold animate-spin" />
              </div>
            )}
            
            {/* End of list message */}
            {!hasMore && !loadingMore && (
              <div className="text-center py-4 text-white/40 text-sm">
                all tracks loaded ({tracks.length} total)
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Add All Button */}
      {!loading && tracks.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-20">
          <button
            onClick={handleAddAllClick}
            className="bg-vibe-gold text-vibe-black px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#ffcc40] transition-colors flex items-center gap-2"
          >
            <ListPlus className="w-5 h-5" />
            add all to playlist
          </button>
        </div>
      )}

      {/* Playlist Selection Modal */}
      {showPlaylistModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowPlaylistModal(false)}
        >
          <div 
            className="bg-[#111] w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">select playlist</h2>
              <button 
                onClick={() => setShowPlaylistModal(false)}
                className="p-2 text-white/60 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            {playlists.length === 0 ? (
              <p className="text-white/60 text-center py-4">no playlists available</p>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id}
                    className="w-full p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors flex items-center gap-3 text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#333] flex items-center justify-center overflow-hidden">
                      {playlist.cover_image ? (
                        <img 
                          src={playlist.cover_image} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ListPlus className="w-6 h-6 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{truncateText(playlist.name, 30)}</p>
                      <p className="text-white/40 text-sm">{playlist.track_count || 0} tracks</p>
                    </div>
                    {addingToPlaylist === playlist.id ? (
                      <Loader2 className="w-5 h-5 text-vibe-gold animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5 text-vibe-gold" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => navigate('/playlists')}
              className="w-full mt-4 py-3 rounded-xl border border-vibe-gold text-vibe-gold hover:bg-vibe-gold/10 transition-colors"
            >
              create new playlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
