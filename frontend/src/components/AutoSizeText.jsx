import { useRef, useEffect } from 'react';

// Auto-size text to fit container width without truncation
// Starts at maxSize, shrinks only if text overflows
export default function AutoSizeText({ text, maxSize = 20, minSize = 12, className = '', style = {} }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fitText = () => {
      const el = textRef.current;
      const container = containerRef.current;
      if (!el || !container) return;

      // Reset to max size to measure natural width
      el.style.fontSize = maxSize + 'px';
      el.style.whiteSpace = 'nowrap';

      // Force layout recalculation
      void el.offsetHeight;

      const containerWidth = container.clientWidth;
      const textWidth = el.scrollWidth;

      if (textWidth <= containerWidth) {
        // Text fits at max size
        el.style.fontSize = maxSize + 'px';
      } else {
        // Text overflows - shrink to fit
        const ratio = containerWidth / textWidth;
        const newSize = Math.max(minSize, Math.floor(maxSize * ratio));
        el.style.fontSize = newSize + 'px';
      }
    };

    fitText();

    // Re-fit on window resize
    window.addEventListener('resize', fitText);
    return () => window.removeEventListener('resize', fitText);
  }, [text, maxSize, minSize]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`} style={style}>
      <span
        ref={textRef}
        className="inline-block whitespace-nowrap"
        style={{ fontSize: maxSize + 'px' }}
      >
        {text}
      </span>
    </div>
  );
}
