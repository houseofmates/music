import { useRef, useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store';

/**
 * useProgressDrag — a single, shared progress-bar interaction hook used by every
 * progress bar in the app (desktop bar, mobile strip, full-screen NowPlaying).
 *
 * Design guarantees:
 *  - ONE implementation. No per-surface duplication.
 *  - Pointer Events unify mouse + touch + pen. A single pointerdown handler is
 *    attached to the track element; move/up/cancel listeners live on `window`
 *    ONLY while a drag is active and are removed the instant it ends. When idle,
 *    the hook attaches ZERO document/window listeners — so it can never break
 *    page scrolling (the previous implementation attached a permanent
 *    `document` touchmove listener that called preventDefault on every touch,
 *    freezing all scrolling).
 *  - During a drag the fill/thumb are written directly to the DOM via a cached
 *    rect. No React state, no Zustand writes, no re-renders. The seek is applied
 *    exactly once, atomically, on pointerup.
 *  - Playback animates the fill at display refresh rate through a single
 *    requestAnimationFrame loop reading a live position getter (the <audio>
 *    element's currentTime when available), so the bar is smooth at ~60fps
 *    without spamming state updates. The loop is skipped while dragging so
 *    playback can never fight the finger.
 */
export function useProgressDrag({
  getDuration,
  getCurrentPosition,
  onSeek,
  trackRef,
  fillRef,
  thumbRef,
  enabled = true,
}) {
  const draggingRef = useRef(false);
  const rectRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const activePointerRef = useRef(null);
  const rafRef = useRef(0);

  // Latest getters/callbacks held in refs so the rAF loop and the (stable)
  // pointer handlers always read fresh values without re-subscribing.
  const getDurationRef = useRef(getDuration);
  const getPositionRef = useRef(getCurrentPosition);
  const onSeekRef = useRef(onSeek);
  getDurationRef.current = getDuration;
  getPositionRef.current = getCurrentPosition;
  onSeekRef.current = onSeek;

  const setStoreDragging = usePlayerStore((s) => s.setIsDraggingProgress);

  // Paint fill width + thumb position. Thumb is 12px (w-3); offset by half so it
  // centres on the value. Pure DOM writes — never touches React.
  const paint = useCallback((position, duration) => {
    if (!duration || duration <= 0) return;
    const percent = Math.max(0, Math.min(100, (position / duration) * 100));
    const fill = fillRef.current;
    const thumb = thumbRef.current;
    if (fill) fill.style.width = `${percent}%`;
    if (thumb) thumb.style.left = `calc(${percent}% - 6px)`;
  }, [fillRef, thumbRef]);

  const percentFromClientX = (clientX) => {
    const rect = rectRef.current;
    if (!rect || rect.width === 0) return null;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handlePointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    if (activePointerRef.current != null && e.pointerId !== activePointerRef.current) return;
    // Only meaningful while dragging — safe to prevent scroll/selection here.
    if (e.cancelable) e.preventDefault();
    const pct = percentFromClientX(e.clientX);
    if (pct == null) return;
    const duration = getDurationRef.current() || 0;
    const pos = pct * duration;
    pendingSeekRef.current = pos;
    paint(pos, duration);
  }, [paint]);

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    activePointerRef.current = null;
    setStoreDragging(false);

    const track = trackRef.current;
    if (track) track.classList.remove('progress-dragging');

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);

    rectRef.current = null;
    const target = pendingSeekRef.current;
    pendingSeekRef.current = null;
    if (target != null && Number.isFinite(target)) {
      onSeekRef.current(target);
    }
  }, [handlePointerMove, setStoreDragging, trackRef]);

  // The ONLY handler a component attaches. Handles a plain tap (press → release
  // seeks to the press point) and a drag (press → move → release) with one path.
  const handlePointerDown = useCallback((e) => {
    if (!enabled) return;
    if (e.button != null && e.button > 0) return; // ignore right/middle click
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return;

    rectRef.current = rect;
    activePointerRef.current = e.pointerId;
    draggingRef.current = true;
    setStoreDragging(true);
    track.classList.add('progress-dragging');

    // Jump immediately to the press location for a responsive tap-to-seek feel.
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const duration = getDurationRef.current() || 0;
    const pos = pct * duration;
    pendingSeekRef.current = pos;
    paint(pos, duration);

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    if (e.cancelable) e.preventDefault();
  }, [enabled, trackRef, paint, handlePointerMove, endDrag, setStoreDragging]);

  // Smooth playback animation: one rAF loop for the lifetime of the hook.
  // Reads the live position getter every frame; skipped while dragging.
  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      return undefined;
    }

    let stopped = false;
    const tick = () => {
      if (stopped) return;
      if (!draggingRef.current) {
        const duration = getDurationRef.current() || 0;
        const pos = getPositionRef.current();
        if (duration > 0 && Number.isFinite(pos) && pos >= 0) {
          paint(pos, duration);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, paint, handlePointerMove, endDrag]);

  // Safety net: if the component unmounts mid-drag, tear down window listeners.
  useEffect(() => () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  }, [handlePointerMove, endDrag]);

  return { onPointerDown: handlePointerDown, isDraggingRef: draggingRef };
}
