/*@__NO_SIDE_EFFECTS__*/
import React, { useState, useEffect } from 'react';
import { useDataSaver } from '../context/DataSaverContext';

export function ImageWithFallback({
  src,
  alt,
  fallbackText,
  className = '',
  eager = false,
  style,
  respectDataSaver = true,
  ...props
}) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const dataSaver = useDataSaver();

  useEffect(() => {
    setError(false);
    setIsLoaded(false);
  }, [src]);

  const handleImageError = () => {
    if (src) { // Only set error if a src was provided
      setError(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const getInitial = (text) => {
    if (!text) return '?';
    const firstChar = text.trim().charAt(0).toUpperCase();
    return firstChar.match(/[A-Z]/) ? firstChar : '#';
  };

  const sharedClassName = `${className}`.trim();
  const progressiveClasses = ['transition-all duration-500 ease-out will-change-transform will-change-opacity'];
  const visualStateClasses = isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-[1.02]';
  const combinedClassName = [sharedClassName, ...progressiveClasses, visualStateClasses].filter(Boolean).join(' ');
  const mergedStyle = {
    ...style,
  };

  const shouldRenderHighRes = !respectDataSaver || eager || dataSaver?.shouldLoadHighRes !== false;

  if (error || !src || !shouldRenderHighRes) {
    const fallbackClasses = ['flex items-center justify-center bg-[#101010] text-[#f6b012] font-varela', sharedClassName]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fallbackClasses} style={mergedStyle} {...props}>
        <span className="text-4xl font-bold leading-none">
          {getInitial(fallbackText)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleImageError}
      onLoad={handleImageLoad}
      className={combinedClassName}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={mergedStyle}
      {...props}
    />
  );
}

export default ImageWithFallback;
