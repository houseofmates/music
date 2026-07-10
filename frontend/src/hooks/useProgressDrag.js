import { useRef, useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store';

export function useProgressDrag({ 
  getDuration, 
  getCurrentPosition,
  onSeek,
  progressBarRef,
  thumbRef,
  fillRef 
}) {
  const isDraggingRef = useRef(false);
  const pendingSeekRef = useRef(null);
  const animationFrameRef = useRef(null);
  const durationRef = useRef(0);
  const rectRef = useRef(null);
  const dragOriginRef = useRef(0);
  
  const storeSetIsDragging = usePlayerStore((state) => state.setIsDraggingProgress);

  const updateVisuals = useCallback((position) => {
    const duration = durationRef.current;
    if (!duration || duration <= 0) return;
    
    const percent = Math.max(0, Math.min(100, (position / duration) * 100));
    
    if (fillRef.current) {
      fillRef.current.style.width = `${percent}%`;
    }
    if (thumbRef.current) {
      thumbRef.current.style.left = `calc(${percent}% - 6px)`;
    }
  }, []);

  const handleDragStart = useCallback((clientX) => {
    if (isDraggingRef.current) return;
    
    const progressBar = progressBarRef.current;
    if (!progressBar) return;
    
    // Cache rect once at drag start
    rectRef.current = progressBar.getBoundingClientRect();
    if (rectRef.current.width === 0) return;
    
    dragOriginRef.current = clientX - rectRef.current.left;
    isDraggingRef.current = true;
    storeSetIsDragging(true);
    
    // Add dragging class to disable CSS transitions
    progressBar.classList.add('progress-dragging');
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [storeSetIsDragging]);

  const handleDragMove = useCallback((clientX) => {
    if (!isDraggingRef.current || !rectRef.current) return;
    
    const rect = rectRef.current;
    const localX = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, localX / rect.width));
    const duration = durationRef.current;
    if (!duration || duration <= 0) return;
    
    const newPosition = percent * duration;
    pendingSeekRef.current = newPosition;
    
    // Update visuals immediately (synchronously)
    updateVisuals(newPosition);
    
    // Do NOT call storeSetCurrentPosition during drag - it triggers React re-renders
  }, [updateVisuals]);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    storeSetIsDragging(false);
    
    const progressBar = progressBarRef.current;
    if (progressBar) {
      progressBar.classList.remove('progress-dragging');
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    rectRef.current = null;
    
    const target = pendingSeekRef.current;
    pendingSeekRef.current = null;
    
    if (target != null && Number.isFinite(target)) {
      onSeek(target);
    }
  }, [storeSetIsDragging, onSeek]);

  const syncFromPlayback = useCallback(() => {
    if (isDraggingRef.current) return;
    
    const duration = getDuration();
    const position = getCurrentPosition();
    
    durationRef.current = duration;
    
    if (duration > 0 && position >= 0) {
      updateVisuals(position);
    }
  }, [getDuration, getCurrentPosition, updateVisuals]);

  useEffect(() => {
    const interval = setInterval(syncFromPlayback, 500);
    syncFromPlayback();
    return () => clearInterval(interval);
  }, [syncFromPlayback]);

  const attachMouseEvents = useCallback((element) => {
    const onMouseMove = (e) => {
      e.preventDefault();
      handleDragMove(e.clientX);
    };
    const onMouseUp = () => handleDragEnd();
    
    document.addEventListener('mousemove', onMouseMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleDragMove, handleDragEnd]);

  const attachTouchEvents = useCallback((element) => {
    const onTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handleDragMove(touch.clientX);
    };
    const onTouchEnd = () => handleDragEnd();
    
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    attachMouseEvents,
    attachTouchEvents,
    isDraggingRef,
    pendingSeekRef,
    updateVisuals,
  };
}

export function useProgressClick({ getDuration, getCurrentPosition, onSeek, progressBarRef }) {
  return useCallback((e) => {
    const duration = getDuration();
    if (!duration || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(percent * duration);
  }, [getDuration, onSeek, progressBarRef]);
}