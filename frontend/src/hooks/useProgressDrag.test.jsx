import { useRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useProgressDrag } from './useProgressDrag';

// The hook only needs setIsDraggingProgress from the store; mock it so the test
// does not pull in the full store (api/native/offline side effects).
vi.mock('../store', () => ({
  usePlayerStore: Object.assign(
    (selector) => selector({ setIsDraggingProgress: () => {} }),
    { getState: () => ({}) }
  ),
}));

const DURATION = 100;

function Harness({ onSeek, enabled = true }) {
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);
  const { onPointerDown } = useProgressDrag({
    getDuration: () => DURATION,
    getCurrentPosition: () => 0,
    onSeek,
    trackRef,
    fillRef,
    thumbRef,
    enabled,
  });
  return (
    <div data-testid="track" ref={trackRef} onPointerDown={onPointerDown}>
      <div data-testid="fill" ref={fillRef} />
      <div data-testid="thumb" ref={thumbRef} />
    </div>
  );
}

function mountWithRect(onSeek) {
  const utils = render(<Harness onSeek={onSeek} />);
  const track = utils.getByTestId('track');
  // The visible bar is 200px wide starting at x=0.
  track.getBoundingClientRect = () => ({
    left: 0, top: 0, right: 200, bottom: 6, width: 200, height: 6, x: 0, y: 0,
  });
  return { ...utils, track };
}

describe('useProgressDrag', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('paints the fill/thumb to the exact pointer fraction while dragging', () => {
    const onSeek = vi.fn();
    const { track, getByTestId } = mountWithRect(onSeek);

    fireEvent.pointerDown(track, { clientX: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(window, { clientX: 100, pointerId: 1 }); // 50% of 200px

    expect(getByTestId('fill').style.width).toBe('50%');
    expect(getByTestId('thumb').style.left).toBe('calc(50% - 6px)');
    // No seek until release.
    expect(onSeek).not.toHaveBeenCalled();
  });

  it('applies exactly one seek to the released position', () => {
    const onSeek = vi.fn();
    const { track } = mountWithRect(onSeek);

    fireEvent.pointerDown(track, { clientX: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(window, { clientX: 150, pointerId: 1 }); // 75%
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenCalledWith(75); // 0.75 * 100
  });

  it('treats a plain tap as a seek to the tap position', () => {
    const onSeek = vi.fn();
    const { track } = mountWithRect(onSeek);

    fireEvent.pointerDown(track, { clientX: 40, pointerId: 1, button: 0 }); // 20%
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onSeek).toHaveBeenCalledWith(20);
  });

  it('clamps to [0, duration] outside the track bounds', () => {
    const onSeek = vi.fn();
    const { track } = mountWithRect(onSeek);

    fireEvent.pointerDown(track, { clientX: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(window, { clientX: 999, pointerId: 1 }); // past the end
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(onSeek).toHaveBeenCalledWith(100);
  });

  it('registers no window listeners when idle (cannot block scrolling)', () => {
    const onSeek = vi.fn();
    const add = vi.spyOn(window, 'addEventListener');
    mountWithRect(onSeek);
    // Mounting the hook must not attach any pointer/touch move listeners.
    const moveListeners = add.mock.calls.filter(
      ([type]) => type === 'pointermove' || type === 'touchmove'
    );
    expect(moveListeners).toHaveLength(0);
  });

  it('stays dormant when disabled', () => {
    const onSeek = vi.fn();
    const raf = typeof window.requestAnimationFrame === 'function'
      ? vi.spyOn(window, 'requestAnimationFrame')
      : null;
    const add = vi.spyOn(window, 'addEventListener');
    const { getByTestId } = render(<Harness onSeek={onSeek} enabled={false} />);

    fireEvent.pointerDown(getByTestId('track'), { clientX: 0, pointerId: 1, button: 0 });

    if (raf) expect(raf).not.toHaveBeenCalled();
    expect(add.mock.calls.some(([type]) => type === 'pointermove')).toBe(false);
    expect(onSeek).not.toHaveBeenCalled();
  });
});
