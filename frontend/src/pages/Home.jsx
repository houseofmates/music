import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Shuffle, ListMusic, Search as SearchIcon, Loader2, WifiOff, Zap, Heart, Disc, Clock, Mic } from '../icons.jsx';
import { usePlayerStore } from '../store';
import { resolveMediaUrl, getTracks, getPlaylists, getAlbums, getArtists, searchTracks } from '../api';
import ImageWithFallback from '../components/ImageWithFallback';
import { truncateText } from '../utils/text';
import { useDataSaver } from '../context/DataSaverContext';
import { triggerImpact } from '../utils/haptics';
import VoiceSearch from '../components/VoiceSearch';
import VoiceControl from '../components/VoiceControl';
import VoiceControlTest from '../components/VoiceControlTest';
import { commandProcessor } from '../utils/voiceRecognition';

// Fuzzy match: letters in order, case-insensitive
const fuzzyMatch = (text, query) => {
 if (!text || !query) return false;
 const t = text.toLowerCase().replace(/[^a-z0-9]/g, '');
 const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
 if (q.length === 0) return true;
 let qi = 0;
 for (let ti = 0; ti < t.length && qi < q.length; ti++) {
 if (t[ti] === q[qi]) qi++;
 }
 return qi === q.length;
};


const Home = () => {
 const [searchQuery, setSearchQuery] = useState('');
 const [tracks, setTracks] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTrackResults, setSearchTrackResults] = useState([]);
 const [searchLoading, setSearchLoading] = useState(false);
 const [playlists, setPlaylists] = useState([]);
 const [recentTracks, setRecentTracks] = useState([]);
 const [albums, setAlbums] = useState([]);
 const [artists, setArtists] = useState([]);
  const [voiceResults, setVoiceResults] = useState([]);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [showVoiceTest, setShowVoiceTest] = useState(false);
  const { playTrack } = usePlayerStore();
 const dataSaver = useDataSaver();
 const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
 const lowDataActive = Boolean(dataSaver?.effectiveLowData);
 const navigateFn = useNavigate();
 const navigate = useCallback((path) => { triggerImpact('light'); navigateFn(path); }, [navigateFn]);

 // Handle voice search results
 const handleVoiceResults = (results, message) => {
  setVoiceResults(results);
  setVoiceMessage(message);
  setSearchTrackResults(Array.isArray(results) ? results : []);
  // Auto-clear voice message after 3 seconds
  if (message) {
   setTimeout(() => setVoiceMessage(''), 3000);
  }
 };

 // Detect if running as Android APK (Capacitor)
 const isAndroidNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android';

 useEffect(() => {
 loadData();
 }, []);

 useEffect(() => {
 const doSearch = async () => {
 if (!searchQuery.trim()) {
 setSearchTrackResults([]);
 setSearchLoading(false);
 return;
 }
 setSearchLoading(true);
 try {
 const { data } = await searchTracks(searchQuery, ['title', 'artist', 'album']);
 setSearchTrackResults(Array.isArray(data) ? data : []);
 } catch (error) {
 } finally {
 setSearchLoading(false);
 }
 };

 const debounceTimer = setTimeout(doSearch, 50);
 return () => clearTimeout(debounceTimer);
 }, [searchQuery]);

 // Client-side fuzzy search for playlists, albums, artists
 const matchedPlaylists = searchQuery.trim()
 ? playlists.filter(p => fuzzyMatch(p.name, searchQuery))
 : [];
 const matchedAlbums = searchQuery.trim()
 ? albums.filter(a => fuzzyMatch(a.album, searchQuery) || fuzzyMatch(a.artist, searchQuery))
 : [];
 const matchedArtists = searchQuery.trim()
 ? artists.filter(a => fuzzyMatch(a, searchQuery))
 : [];

 const loadData = async () => {
 if (shouldDeferNetwork) {
 setLoading(false);
 return;
 }
 try {
 setLoading(true);
 const [tracksRes, playlistsRes, albumsRes, artistsRes] = await Promise.all([
 getTracks({ limit: 10 }),
 getPlaylists(),
 getAlbums(),
 getArtists(),
 ]);
 // Handle case where tracksRes.data might be undefined or not an array
const tracksData = Array.isArray(tracksRes?.data) ? tracksRes.data : [];
setTracks(tracksData);
 setPlaylists(playlistsRes?.data || []);
 // Handle case where albumsRes.data might be undefined or not an array
const albumsData = Array.isArray(albumsRes?.data) ? albumsRes.data : [];
setAlbums(albumsData);
 // Handle case where artistsRes.data might be undefined or not an array
const artistsData = Array.isArray(artistsRes?.data) ? artistsRes.data : [];
setArtists(artistsData);
 } catch (error) {
 } finally {
 setLoading(false);
 }
 };

 const handlePlayTrack = (track) => {
 triggerImpact('light');
 // Search results (and single track plays) should have a queue of just this track
 const queueItems = [{ id: `queue-${track.id}-0`, track, position: 0 }];
 usePlayerStore.setState({ queue: queueItems, currentQueueIndex: 0 });
 playTrack(track, 0);
 };

 // Shuffle array helper
 const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

 // Grid classes based on platform
 // APK: 3 per row, Desktop/Web: 2 per row
 const cardGridClass = isAndroidNative
 ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
 : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3';

 return (
 <div className="min-h-screen bg-vibe-black pb-32">
 {/* Header */}
    <div className={`sticky top-0 bg-vibe-black z-10 ${isAndroidNative ? 'pt-safe' : ''}`}>
        <div className={`${isAndroidNative ? 'px-4' : 'px-1'} py-0`}>
 <div className="relative flex items-center justify-between">
 <div className="w-8"></div>
 <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-vibe-gold">music</h1>
 <Link
 to="/download"
 className="p-2 transition-colors flex items-center justify-center"
 aria-label="Download songs"
>
 <Plus className="w-6 h-6" style={{ color: '#f6b012' }} />
</Link>
 </div>

        {/* Search */}
        <div className={`relative ${isAndroidNative ? 'mt-2' : 'mt-1'}`}>
 <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888]" />
 <input
 type="text"
 placeholder="search tracks, artists, albums..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-12 pr-12 py-3 rounded-2xl search-opaque placeholder-lowercase border-2 focus:outline-none transition-colors bg-[#1a1a1a] text-white"
 />
  {/* Voice Search Button */}
  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
  <VoiceSearch onResults={handleVoiceResults} setSearchQuery={setSearchQuery} />
  </div>
 </div>

 {/* Voice Message */}
 {voiceMessage && (
 <div className="mt-2 px-4 py-2 bg-vibe-gold text-vibe-black rounded-2xl text-center font-medium animate-pulse">
 {voiceMessage}
 </div>
 )}

 {/* Network status */}
 {(shouldDeferNetwork || lowDataActive) && (
 <div className="space-y-2 mt-2">
 {shouldDeferNetwork && (
 <div className="rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2">
 <WifiOff className="w-4 h-4" /> offline mode
 </div>
 )}
 {!shouldDeferNetwork && lowDataActive && (
 <div className="rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2">
 <Zap className="w-4 h-4" /> low data mode
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Content */}
 <div className="px-4 md:px-0 pt-4 md:pt-2 space-y-6 md:space-y-4">
 {loading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
 </div>
 ) : (
 <>
 
 {/* Search Results or Sections */}
 {searchQuery.trim() ? (
 <section>
 <h2 className="text-lg font-bold text-white mb-3">search results</h2>
 {searchLoading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-8 h-8 text-vibe-gold animate-spin" />
 </div>
 ) : searchTrackResults.length === 0 ? (
 <p className="text-white/60 text-center py-8">no tracks found</p>
 ) : (
 <div className="space-y-2">
 <p className="text-gray-400 mb-4">{searchTrackResults.length} results</p>
 {searchTrackResults.map((track) => (
 <div
 key={track.id}
 onClick={() => handlePlayTrack(track)}
 className="flex items-center gap-3 p-3 rounded-2xl bg-[#111] hover:bg-[#1a1a1a] cursor-pointer"
 >
 <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#222] flex-shrink-0">
 <ImageWithFallback
 src={resolveMediaUrl(track.cover_art_url)}
 alt={track.title}
 fallbackText={track.title}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-white font-medium truncate">{track.title || track.filename || 'unknown'}</p>
 <p className="text-white/50 text-sm truncate">{track.artist || 'unknown artist'} &bull; {track.album || 'unknown album'}</p>
 </div>
 <Play className="w-5 h-5 text-vibe-gold flex-shrink-0" />
 </div>
 ))}
 </div>
 )}
 </section>
 ) : (
 <>
 {/* Recent Tracks - Horizontally scrollable for APK */}
 {tracks.length > 0 && (
 <section>
 {/* Section header with "see all" inline with title */}
 <div className="flex items-end justify-between mb-3">
 <h2 className="text-lg font-bold text-white">recent tracks</h2>
 <Link to="/tracks" className="text-sm text-vibe-gold pb-0.5">see all</Link>
 </div>
 
 {isAndroidNative ? (
 // APK: Horizontal scrollable list
 <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
 {tracks.slice(0, 10).map((track) => (
 <div
 key={track.id}
 onClick={() => handlePlayTrack(track)}
 className="group cursor-pointer flex-shrink-0 w-[110px]"
 >
 <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]">
 <ImageWithFallback
 src={resolveMediaUrl(track.cover_art_url)}
 alt={track.title}
 fallbackText={track.title}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="mt-2 px-0.5">
 <h3 className="text-sm text-white font-semibold leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{track.title || track.filename || 'unknown'}</h3>
 <p className="text-xs text-white/60 truncate">{truncateText(track.artist || 'unknown artist', 18)}</p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 // Desktop/Web: Grid layout
 <div className={'grid ' + cardGridClass}>
 {tracks.slice(0, 10).map((track) => (
 <div
 key={track.id}
 onClick={() => handlePlayTrack(track)}
 className="group cursor-pointer"
 >
 <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]">
 <ImageWithFallback
 src={resolveMediaUrl(track.cover_art_url)}
 alt={track.title}
 fallbackText={track.title}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="mt-2 px-1">
 <h3 className="text-sm text-white font-semibold text-center leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{track.title || track.filename || 'unknown'}</h3>
 <p className="text-xs text-white/60 text-center truncate">{truncateText(track.artist || 'unknown artist', 25)}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>
 )}

 {/* Playlists */}
 {playlists.length > 0 && (
 <section>
 <div className="flex items-end justify-between mb-3">
 <h2 className="text-lg font-bold text-white">playlists</h2>
 <Link to="/playlists" className="text-sm text-vibe-gold pb-0.5">see all</Link>
 </div>
 <div className={'grid ' + cardGridClass}>
 {playlists.map((playlist) => (
 <div
 key={playlist.id}
 onClick={() => { triggerImpact('light'); navigateFn(`/playlists/${playlist.id}`); }}
 className="group cursor-pointer"
 >
 <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]">
 <ImageWithFallback
 src={resolveMediaUrl(playlist.cover_image)}
 alt={playlist.name}
 fallbackText={playlist.name}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="mt-2 px-1">
 <h3 className="text-sm text-white font-semibold text-center leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{playlist.name}</h3>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* Albums */}
 {albums.length > 0 && (
 <section>
 <div className="flex items-end justify-between mb-3">
 <h2 className="text-lg font-bold text-white">albums</h2>
 <Link to="/albums" className="text-sm text-vibe-gold pb-0.5">see all</Link>
 </div>
 <div className={'grid ' + cardGridClass}>
 {albums.map((album) => (
 <div
 key={`${album.album}-${album.artist}`}
 onClick={() => { triggerImpact('light'); navigateFn(`/albums/${encodeURIComponent(album.album)}`); }}
 className="group cursor-pointer"
 >
 <div className="aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]">
 <ImageWithFallback
 src={resolveMediaUrl(album.cover_art_url)}
 alt={album.album}
 fallbackText={album.album}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="mt-2 px-1">
 <h3 className="text-sm text-white font-semibold text-center leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{album.album}</h3>
 <p className="text-xs text-white/60 text-center truncate">{truncateText(album.artist || 'unknown artist', 30)}</p>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* Artists */}
 {artists.length > 0 && (
 <section>
 <div className="flex items-end justify-between mb-3">
 <h2 className="text-lg font-bold text-white">artists</h2>
 <Link to="/artists" className="text-sm text-vibe-gold pb-0.5">see all</Link>
 </div>
 <div className={'grid ' + cardGridClass}>
 {artists.map((artist) => (
 <div
 key={artist}
 onClick={() => { triggerImpact('light'); navigateFn(`/artists/${encodeURIComponent(artist)}`); }}
 className="group cursor-pointer"
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
 </section>
  )}

  
  </>
  )}
  </>
  )}
  </div>
  </div>
  );
};

export default Home;
