import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getTracks } from '../api';
import TrackList from '../components/TrackList';
import { Loader2, ArrowLeft, Search, Shuffle } from '../icons.jsx';
import { usePlayerStore } from '../store';
import AutoSizeText from '../components/AutoSizeText';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function bannerPositionStorageKey(albumName, artistName) {
  return `music_album_banner_position_${albumName}_${artistName || ''}`;
}

export default function AlbumDetail() {
  const { album } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const artist = searchParams.get('artist');
  const { playTrack } = usePlayerStore();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumArt, setAlbumArt] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 50 });
  const [isAdjustingBanner, setIsAdjustingBanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const bannerDragStateRef = useRef(null);

  const decodedAlbum = useMemo(() => decodeURIComponent(album), [album]);
  const decodedArtist = useMemo(() => (artist ? decodeURIComponent(artist) : ''), [artist]);
  const bannerStorageKey = useMemo(
    () => bannerPositionStorageKey(decodedAlbum, decodedArtist),
    [decodedAlbum, decodedArtist]
  );

  useEffect(() => {
    loadAlbumTracks();
  }, [album, artist]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(bannerStorageKey) || '{}');
      setBannerPosition({
        x: typeof saved.x === 'number' ? clamp(saved.x, 0, 100) : 50,
        y: typeof saved.y === 'number' ? clamp(saved.y, 0, 100) : 50,
      });
    } catch {
      setBannerPosition({ x: 50, y: 50 });
    }
  }, [bannerStorageKey]);

  useEffect(() => {
    localStorage.setItem(bannerStorageKey, JSON.stringify(bannerPosition));
  }, [bannerPosition, bannerStorageKey]);

  const loadAlbumTracks = async () => {
    try {
      setLoading(true);
      const params = { album: decodedAlbum, limit: 500 };
      if (artist) {
        params.artist = decodedArtist;
      }

      const response = await getTracks(params);
      const albumTracks = Array.isArray(response?.data) ? response.data : [];

      // Sort by track number
      albumTracks.sort((a, b) => {
        if (a.track_number && b.track_number) {
          return a.track_number - b.track_number;
        }
        return 0;
      });

      // Restore saved track order from localStorage, fall back to track_number sort
      try {
        const lsKey = `music_album_track_order_${decodeURIComponent(album)}_${artist ? decodeURIComponent(artist) : ''}`;
        const saved = JSON.parse(localStorage.getItem(lsKey) || '[]');
        if (saved.length > 0) {
          const idToTrack = Object.fromEntries(albumTracks.map((t) => [t.id, t]));
          const ordered = saved.filter((id) => idToTrack[id]).map((id) => idToTrack[id]);
          const rest = albumTracks.filter((t) => !saved.includes(t.id));
          setTracks([...ordered, ...rest]);
        } else {
          setTracks(albumTracks);
        }
      } catch {
        setTracks(albumTracks);
      }

      // Get album art from first track
      if (albumTracks.length > 0 && albumTracks[0].cover_art_url) {
        setAlbumArt(albumTracks[0].cover_art_url);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateBannerPositionFromPointer = (clientX, clientY) => {
    const dragState = bannerDragStateRef.current;
    if (!dragState) {
      return;
    }

    const { rect, startX, startY, originX, originY } = dragState;
    const deltaXPercent = ((clientX - startX) / Math.max(rect.width, 1)) * 100;
    const deltaYPercent = ((clientY - startY) / Math.max(rect.height, 1)) * 100;

    setBannerPosition({
      x: clamp(originX - deltaXPercent, 0, 100),
      y: clamp(originY - deltaYPercent, 0, 100),
    });
  };

  const endBannerAdjustment = () => {
    bannerDragStateRef.current = null;
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handleWindowPointerUp);
  };

  const handleWindowPointerMove = (event) => {
    updateBannerPositionFromPointer(event.clientX, event.clientY);
  };

  const handleWindowPointerUp = () => {
    endBannerAdjustment();
  };

  const handleBannerPointerDown = (event) => {
    if (!isAdjustingBanner || !albumArt) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    bannerDragStateRef.current = {
      rect,
      startX: event.clientX,
      startY: event.clientY,
      originX: bannerPosition.x,
      originY: bannerPosition.y,
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
  };

  const resetBannerPosition = () => {
    setBannerPosition({ x: 50, y: 50 });
  };

  // Filter tracks based on search term
  const filteredTracks = useMemo(() => {
    if (!searchTerm.trim()) return tracks;
    const term = searchTerm.toLowerCase();
    return tracks.filter(track =>
      (track.title || track.filename || '').toLowerCase().includes(term) ||
      (track.artist || '').toLowerCase().includes(term)
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

  useEffect(() => () => endBannerAdjustment(), []);

  // Shuffle and play random song from album
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

  return (
    <div className="min-h-screen bg-vibe-black pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-vibe-black z-10 pt-safe">
        <div className="relative flex items-center justify-center px-4 py-3" style={{ minHeight: '44px' }}>
          {/* Back button - left side */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 text-white hover:text-vibe-gold transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Title - centered on screen, auto-sized to fit */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-20">
            <AutoSizeText
              text={decodedAlbum}
              maxSize={20}
              minSize={12}
              className="text-center"
            />
          </div>

          {/* Shuffle - right side */}
          {tracks && tracks.length > 0 && (
            <button
              onClick={handleShufflePlay}
              className="absolute right-4 p-2 inline-flex items-center justify-center shrink-0"
              aria-label="shuffle play"
            >
              <Shuffle className="w-5 h-5 text-[#f5af12]" />
            </button>
          )}
        </div>

        {/* Artist name - centered under title */}
        {artist && (
          <p className="text-center text-sm text-vibe-gold pb-2">{decodedArtist}</p>
        )}
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
            placeholder="search tracks in this album..."
            className="w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
          />
        </div>
        {searchTerm && (
          <p className="text-xs text-white/60 mt-2">
            {filteredTracks.length} of {tracks.length} tracks match
          </p>
        )}
      </div>

      {/* Tracks */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
          </div>
        ) : (
          <TrackList
            tracks={filteredTracks}
            showAlbum={false}
            showArtist={false}
            sortable={!searchTerm}
            onReorder={!searchTerm ? (orderedIds) => {
              const idToTrack = new Map(tracks.map((t) => [String(t.id), t]));
              const reordered = orderedIds
                .map((id) => idToTrack.get(String(id)))
                .filter(Boolean);
              setTracks(reordered);
              const lsKey = `music_album_track_order_${decodeURIComponent(album)}_${artist ? decodeURIComponent(artist) : ''}`;
              localStorage.setItem(lsKey, JSON.stringify(orderedIds));
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
