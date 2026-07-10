import {
 Play,
 Pause,
 SkipBack,
 SkipForward,
 RotateCcw,
 RotateCw,
 Repeat,
 Repeat1,
 Shuffle,
 MessageSquareText,
 Search,
 ListMusic,
 GripVertical,
} from '../icons.jsx';
import { usePlayerStore } from '../store';
import VolumeSlider from './VolumeSlider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 DndContext,
 PointerSensor,
 closestCenter,
 useSensor,
 useSensors,
} from '@dnd-kit/core';
import {
 SortableContext,
 arrayMove,
 verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ImageWithFallback from './ImageWithFallback';
import TrackActionSheet from './TrackActionSheet';
import TrackEditModal from './TrackEditModal';
import NowPlaying from './NowPlaying';
import SortableQueueItem from './SortableQueueItem';
import { resolveMediaUrl, updateTrack } from '../api';
import { triggerImpact } from '../utils/haptics';

// Move outside component to avoid recreation
function queueTrackLabel(queueItem) {
 return queueItem.track.title || queueItem.track.filename || 'unknown';
}

function formatTime(seconds) {
 if (isNaN(seconds)) return '00:00';
 const mins = Math.floor(seconds / 60);
 const secs = Math.floor(seconds % 60);
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}



export default function Player({ onHideDesktop, onSwipeDown, searchOverlayActive = false }) {
 const navigate = useNavigate();
  const {
  currentTrack,
  isPlaying,
  currentPosition,
  volume,
  repeatMode,
  shuffle,
  showLyrics,
  queue,
  currentQueueIndex,
  playPause,
  nextTrack,
  previousTrack,
  jump,
  seekTo,
  setVolume,
  setRepeatMode,
  toggleShuffle,
  toggleLyrics,
  setCurrentPosition,
  loadQueue,
  loadPlayerState,
  playTrack,
  removeFromQueue,
  reorderQueueItem,
  toggleFavorite,
  settings,
  } = usePlayerStore();

 const [showQueue, setShowQueue] = useState(false);
 const [queueSearch, setQueueSearch] = useState('');
 const [queueItems, setQueueItems] = useState([]);
 const [actionTrack, setActionTrack] = useState(null);
 const [editingTrack, setEditingTrack] = useState(null);
 const [showEditModal, setShowEditModal] = useState(false);
 const [isMuted, setIsMuted] = useState(false);
 const [showVolumePopup, setShowVolumePopup] = useState(false);
 const [showNowPlaying, setShowNowPlaying] = useState(false);
 const normalizedQueue = Array.isArray(queue) ? queue : [];
 const compactWhileSearching = Boolean(searchOverlayActive && !showQueue && !showLyrics);
 const swipeStartRef = useRef(null);

 const sensors = useSensors(
 useSensor(PointerSensor, {
 activationConstraint: {
 delay: 0,
 tolerance: 3,
 },
 })
 );

 useEffect(() => {
 setQueueItems(normalizedQueue);
 }, [normalizedQueue]);

 // Update service worker prefetch queue when queue changes
 useEffect(() => {
 if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
 navigator.serviceWorker.controller.postMessage({
 type: 'SET_PREFETCH_QUEUE',
 data: {
 queue: normalizedQueue,
 currentIndex: currentQueueIndex
 }
 });
 }
 }, [normalizedQueue, currentQueueIndex]);

 const toggleMute = () => {
 setIsMuted(!isMuted);
 };

 useEffect(() => {
 if (searchOverlayActive) return;

 const handleKeyDown = (e) => {
 // Ignore if user is typing in an input
 if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
 return;
 }

 switch (e.key) {
 case ' ':
 case 'k':
 e.preventDefault();
 playPause();
 break;
 case 'ArrowRight':
 case 'l':
 e.preventDefault();
 nextTrack();
 break;
 case 'ArrowLeft':
 case 'j':
 e.preventDefault();
 previousTrack();
 break;
 case 'ArrowUp':
 e.preventDefault();
 setVolume(Math.min(1, volume + 0.1));
 break;
 case 'ArrowDown':
 e.preventDefault();
 setVolume(Math.max(0, volume - 0.1));
 break;
 case 'm':
 e.preventDefault();
 toggleMute();
 break;
 case 'f':
 e.preventDefault();
 if (currentTrack) {
 toggleFavorite(currentTrack);
 }
 break;
 case 'q':
 e.preventDefault();
 setShowQueue(v => !v);
 break;
 case 's':
 e.preventDefault();
 toggleShuffle();
 break;
 case 'r':
 e.preventDefault();
 setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none');
 break;
 case 'n':
 e.preventDefault();
 setShowNowPlaying(true);
 break;
 }
 };

 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [playPause, nextTrack, previousTrack, volume, toggleMute, toggleFavorite, currentTrack, toggleShuffle, setRepeatMode, repeatMode, searchOverlayActive]);

 const handleTouchStart = (e) => {
 if (!onSwipeDown || showQueue || showLyrics || window.matchMedia('(pointer:fine)').matches) {
 swipeStartRef.current = null;
 return;
 }
 const touch = e.touches?.[0];
 if (!touch) {
 return;
 }
 swipeStartRef.current = {
 x: touch.clientX,
 y: touch.clientY,
 };
 };

 const handleTouchMove = (e) => {
 if (!swipeStartRef.current || !onSwipeDown) {
 return;
 }
 const touch = e.touches?.[0];
 if (!touch) {
 return;
 }
 const deltaY = touch.clientY - swipeStartRef.current.y;
 const deltaX = Math.abs(touch.clientX - swipeStartRef.current.x);
 if (deltaY > 90 && deltaY > deltaX * 1.4) {
 swipeStartRef.current = null;
 onSwipeDown?.();
 } else if (deltaY < -40) {
 swipeStartRef.current = null;
 }
 };

 const handleTouchEnd = () => {
 swipeStartRef.current = null;
 };

 const openTrackDetails = (track) => {
 setEditingTrack(track);
 setShowEditModal(true);
 };

 const handleTrackLongPress = (track) => {
 setActionTrack(track);
 };

 const saveTrack = async (data) => {
 if (!editingTrack) return;
 try {
 const res = await updateTrack(editingTrack.id, data);
 const updated = res?.data;
 if (updated) {
 // Update any active track info and reload the queue list to show changes.
 if (currentTrack?.id === updated.id) {
 usePlayerStore.setState({ currentTrack: updated });
 }
 await loadQueue();
 setEditingTrack(updated);
 }
 } catch (error) {
 }
 };

 // Get audioRef from store for volume sync
 const audioRef = usePlayerStore((state) => state.audioRef);

 // Sync volume with audio element
 useEffect(() => {
 const audio = audioRef;
 if (!audio) return;
 audio.volume = isMuted ? 0 : volume;
 }, [audioRef, volume, isMuted]);

 const filteredQueue = useMemo(() => {
 const q = queueSearch.trim().toLowerCase();
 if (!q) return queueItems;
 return queueItems.filter((item) => {
 const haystack = `${queueTrackLabel(item)} ${item.track.artist || ''} ${item.track.album || ''}`.toLowerCase();
 return haystack.includes(q);
 });
 }, [queueItems, queueSearch]);



 const handleVolumeChange = (e) => {
 const newVolume = parseFloat(e.target.value);
 setVolume(newVolume);
 if (newVolume > 0 && isMuted) {
 setIsMuted(false);
 }
 };

 const handlePlayQueueItem = useCallback((queueItem) => {
 // find the index in the full queue, not filtered
 const queueIndex = queueItems.findIndex((item) => item.id === queueItem.id);
 if (queueIndex >= 0) {
 playTrack(queueItem.track, queueIndex);
 }
 }, [queueItems, playTrack]);

 const handleRemoveQueueItem = useCallback(async (queueItemId) => {
 await removeFromQueue(queueItemId);
 await loadQueue();
 }, [removeFromQueue, loadQueue]);

 const handleTitleClick = useCallback(async () => {
 if (!currentTrack) return;
 try {
 const res = await fetch(`/api/playlists`);
 const playlists = await res.json();
 for (const playlist of playlists) {
 const playlistRes = await fetch(`/api/playlists/${playlist.id}`);
 const playlistData = await playlistRes.json();
 const trackInPlaylist = playlistData.tracks?.find(t => t.id === currentTrack.id);
 if (trackInPlaylist) {
 navigate(`/playlists/${playlist.id}`, { state: { highlightTrackId: currentTrack.id } });
 return;
 }
 }
 } catch (err) {
 }
 }, [currentTrack, navigate]);

 const handleArtistClick = useCallback(() => {
 if (currentTrack?.artist) {
 navigate(`/artists/${encodeURIComponent(currentTrack.artist)}`);
 }
 }, [currentTrack?.artist, navigate]);

 const handleQueueDragEnd = useCallback(async ({ active, over }) => {
 if (!over || active.id === over.id) {
 return;
 }

 const activeId = String(active.id);
 const overId = String(over.id);

 const filteredOldIndex = filteredQueue.findIndex((item) => String(item.id) === activeId);
 const filteredNewIndex = filteredQueue.findIndex((item) => String(item.id) === overId);
 if (filteredOldIndex < 0 || filteredNewIndex < 0) {
 return;
 }

 const reorderedFiltered = arrayMove(filteredQueue, filteredOldIndex, filteredNewIndex);

 let reorderedFull;
 if (!queueSearch.trim()) {
 const fullOldIndex = queueItems.findIndex((item) => String(item.id) === activeId);
 const fullNewIndex = queueItems.findIndex((item) => String(item.id) === overId);
 reorderedFull = arrayMove(queueItems, fullOldIndex, fullNewIndex);
 } else {
 const filteredIdSet = new Set(filteredQueue.map((item) => String(item.id)));
 const replacement = [...reorderedFiltered];
 reorderedFull = queueItems.map((item) => {
 if (!filteredIdSet.has(String(item.id))) {
 return item;
 }
 return replacement.shift() || item;
 });
 }

 setQueueItems(reorderedFull);
 const newPosition = reorderedFull.findIndex((item) => String(item.id) === activeId);
 await reorderQueueItem(Number(active.id), newPosition);
 await loadQueue();
 }, [filteredQueue, queueItems, queueSearch, setQueueItems, reorderQueueItem, loadQueue]);

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <TrackActionSheet
        track={actionTrack}
        onClose={() => setActionTrack(null)}
        onViewDetails={openTrackDetails}
      />
      <TrackEditModal
        isOpen={showEditModal}
        track={editingTrack}
        onClose={() => setShowEditModal(false)}
        onSave={saveTrack}
      />
      {showNowPlaying && (
        <NowPlaying onClose={() => setShowNowPlaying(false)} />
      )}
    </>
  );
}