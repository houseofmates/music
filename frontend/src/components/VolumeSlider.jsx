import { Volume2, VolumeX } from '../icons.jsx';

export default function VolumeSlider({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  showLabel = false,
  size = 'md',
  className = '',
}) {
  const isZero = isMuted || volume === 0;
  const displayVolume = isZero ? 0 : volume;

  const sizeClasses = {
    sm: { slider: 'w-20 h-1', icon: 'w-4 h-4' },
    md: { slider: 'w-24 h-1.5', icon: 'w-4 h-4' },
    lg: { slider: 'w-80 h-2', icon: 'w-5 h-5' },
  };

  const { slider, icon } = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onToggleMute}
        className="rounded-full bg-[#2a1f0f] p-2 text-white hover:bg-[#3a2f1f] transition-colors"
        aria-label={isMuted ? 'unmute' : 'mute'}
        type="button"
      >
        {isZero ? (
          <VolumeX className={icon} />
        ) : (
          <Volume2 className={icon} />
        )}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={displayVolume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className={`${slider} cursor-pointer appearance-none rounded-full transition-all`}
        style={{
          background: `linear-gradient(to right, #f6b012 0%, #f6b012 ${displayVolume * 100}%, rgba(255,255,255,0.2) ${displayVolume * 100}%, rgba(255,255,255,0.2) 100%)`,
        }}
        aria-label="Volume"
      />

      {showLabel && (
        <span className="text-xs text-white w-8 text-right">
          {Math.round(displayVolume * 100)}%
        </span>
      )}
    </div>
  );
}