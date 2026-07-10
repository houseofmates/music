import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTracks } from '../api';
import TrackList from '../components/TrackList';
import { Loader2, ArrowLeft, Search, Shuffle } from '../icons.jsx';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store';
import AutoSizeText from '../components/AutoSizeText';

export default function ArtistDetail() {
  const { artist } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadArtistTracks();
  }, [artist]);

  // Shuffle and play random song from artist
  const handleShufflePlay = async () => {
    if (!tracks || tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    const queueItems = shuffled.map((t, index) => ({
      id: `queue-${t.id}-${index}`,
      track: t,
      position: index,
    }));
    usePlayerStore.setState({ queue: queueItems, currentQueueIndex: 0 });
    await playTrack(shuffled[0], 0);
  };

  // Filter tracks based on search term
  const filteredTracks = useMemo(() => {
    if (!searchTerm.trim()) return tracks;
    const term = searchTerm.toLowerCase();
    return tracks.filter(track =>
      (track.title || track.filename || '').toLowerCase().includes(term) ||
      (track.album || '').toLowerCase().includes(term)
    );
  }, [tracks, searchTerm]);

  // Ctrl+F keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadArtistTracks = async () => {
    try {
      setLoading(true);
      const response = await getTracks({ artist: decodeURIComponent(artist), limit: 500 });
      setTracks(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe">
        <div className="px-4 py-1">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors inline-flex items-center gap-2 lowercase"
            >
              <ArrowLeft className="w-5 h-5" />
              back
            </button>
            {tracks && tracks.length > 0 && (
              <button
                onClick={handleShufflePlay}
                className="p-2 inline-flex items-center justify-center"
                aria-label="shuffle play"
              >
                <Shuffle className="w-5 h-5 text-[#f5af12]" />
              </button>
            )}
          </div>

          <AutoSizeText
            text={decodeURIComponent(artist)}
            maxSize={24}
            minSize={14}
            className="text-vibe-gold font-bold mb-1"
          />
          {!loading && (
            <p className="text-white/60">{tracks.length} tracks</p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search tracks by this artist..."
            className="w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
          />
        </div>
        {searchTerm && (
          <p className="text-xs text-white/60 mt-2">
            {filteredTracks.length} of {tracks.length} tracks match
          </p>
        )}
      </div>

      {/* Content */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : (
          <TrackList tracks={filteredTracks} showArtist={false} />
        )}
      </div>
    </div>
  );
}
