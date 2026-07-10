import { useEffect, useRef } from 'react';
import { triggerSelection } from '../utils/haptics';

const EDGE_THRESHOLD = 48; // Increased for easier triggering
const MIN_DISTANCE = 72; // Slightly reduced for easier activation
const MAX_VERTICAL_SLOPE = 0.75; // More lenient vertical tolerance

const isCoarsePointer = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  return window.matchMedia('(pointer: coarse)').matches;
};

const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export default function useSwipeBack({ enabled = true, onBack } = {}) {
  const stateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    progress: 0,
  });
  const indicatorRef = useRef(null);

  useEffect(() => {
    // Enable on both touch devices AND coarse pointer devices
    if (!enabled || typeof document === 'undefined' || typeof window === 'undefined') {
      return undefined;
    }

    // Only enable on mobile/touch devices
    if (!isTouchDevice() && !isCoarsePointer()) {
      return undefined;
    }

    const state = stateRef.current;

    const reset = () => {
      state.active = false;
      state.startX = 0;
      state.startY = 0;
      state.progress = 0;
      hideIndicator();
    };

    const showIndicator = (progress) => {
      if (!indicatorRef.current) {
        const el = document.createElement('div');
        el.id = 'swipe-back-indicator';
        el.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 4px;
          height: 100vh;
          background: linear-gradient(to bottom, #f6b012, #ffcc40);
          transform: translateX(-100%);
          transition: transform 0.1s ease-out, opacity 0.2s;
          opacity: 0;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(el);
        indicatorRef.current = el;
      }
      const opacity = Math.min(progress / MIN_DISTANCE, 1) * 0.8;
      const translate = Math.min((progress / MIN_DISTANCE) * 4, 4);
      indicatorRef.current.style.opacity = opacity;
      indicatorRef.current.style.transform = `translateX(${translate - 4}px)`;
    };

    const hideIndicator = () => {
      if (indicatorRef.current) {
        indicatorRef.current.style.opacity = '0';
        indicatorRef.current.style.transform = 'translateX(-100%)';
      }
    };

    const shouldStartGesture = (x) => {
      // Only detect left edge swipes
      return x <= EDGE_THRESHOLD;
    };

    const handleTouchStart = (event) => {
      // Only handle single finger touches
      if (event.touches.length !== 1) {
        reset();
        return;
      }

      const touch = event.touches[0];
      
      // Check if touch started from left edge
      if (!shouldStartGesture(touch.clientX)) {
        reset();
        return;
      }

      // Don't activate if touching an interactive element
      const target = event.target;
      const isInteractive = target.closest('button, a, input, textarea, select, [role="button"], .no-swipe-back');
      if (isInteractive) {
        reset();
        return;
      }

      state.active = true;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.progress = 0;
    };

    const handleTouchMove = (event) => {
      if (!state.active) {
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      // Must be a horizontal swipe (moving right from left edge)
      if (deltaX <= 0) {
        reset();
        return;
      }

      // Check vertical tolerance - if swiping too vertically, cancel
      if (Math.abs(deltaY) > deltaX * MAX_VERTICAL_SLOPE) {
        reset();
        return;
      }

      state.progress = deltaX;
      showIndicator(deltaX);

      // Prevent default scrolling only if we're clearly doing a back swipe (not browser edge swipe)
      if (deltaX > 30 && Math.abs(deltaY) < deltaX * 0.5) {
        try {
          event.preventDefault();
        } catch (err) {
          // ignore
        }
      }

      // Trigger back navigation when threshold reached
      if (deltaX > MIN_DISTANCE) {
        triggerSelection();
        reset();
        if (typeof onBack === 'function') {
          onBack();
        }
      }
    };

    const handleTouchEnd = () => {
      reset();
    };

    const handleTouchCancel = () => {
      reset();
    };

    // Add listeners with proper options
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true, capture: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.removeEventListener('touchcancel', handleTouchCancel, { capture: true });
      
      // Cleanup indicator
      if (indicatorRef.current && indicatorRef.current.parentNode) {
        indicatorRef.current.parentNode.removeChild(indicatorRef.current);
        indicatorRef.current = null;
      }
    };
  }, [enabled, onBack]);
}
