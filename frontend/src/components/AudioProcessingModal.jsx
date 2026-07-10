import { useState, useEffect } from 'react';
import { X, Settings, Volume2, Music, Zap } from '../icons.jsx';

export default function AudioProcessingModal({ isOpen, onClose, onApplySettings }) {
  const [presets, setPresets] = useState(null);
  const [settings, setSettings] = useState({
    equalizer_preset: null,
    effects: [],
    spatial_preset: null,
    normalize: true,
    compression: false,
    compression_settings: {
      attack: 0.3,
      release: 0.8,
      threshold: -20,
      ratio: 4,
      makeup: 8
    }
  });

  useEffect(() => {
    if (isOpen && !presets) {
      // Load presets from API
      fetch('/api/audio-processing/presets')
        .then(res => res.json())
        .then(data => setPresets(data))
        .catch(() => {});
    }
  }, [isOpen, presets]);

  const handlePresetSelect = (preset) => {
    setSettings(prev => ({
      ...prev,
      equalizer_preset: preset
    }));
  };

  const handleEffectToggle = (effect) => {
    setSettings(prev => ({
      ...prev,
      effects: prev.effects.includes(effect)
        ? prev.effects.filter(e => e !== effect)
        : [...prev.effects, effect]
    }));
  };

  const handleSpatialSelect = (spatial) => {
    setSettings(prev => ({
      ...prev,
      spatial_preset: spatial === prev.spatial_preset ? null : spatial
    }));
  };

  const handleCompressionChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      compression_settings: {
        ...prev.compression_settings,
        [key]: value
      }
    }));
  };

  const handleApply = () => {
    onApplySettings(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      equalizer_preset: null,
      effects: [],
      spatial_preset: null,
      normalize: false,
      compression: false,
      compression_settings: {
        attack: 0.3,
        release: 0.8,
        threshold: -20,
        ratio: 4,
        makeup: 8
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-[#050505] rounded-t-3xl md:rounded-3xl border border-[#f6b012]/20 max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f6b012]/20">
          <h2 className="text-xl font-bold text-[#f6b012]">audio processing</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f6b012]/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Equalizer Presets */}
          <div className="p-4 border-b border-[#f6b012]/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Music className="w-5 h-5 text-[#f6b012]" />
              equalizer presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {presets?.equalizer_presets && Object.entries(presets.equalizer_presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`p-3 rounded-xl border transition-all ${
                    settings.equalizer_preset === key
                      ? 'border-[#f6b012] bg-[#f6b012]/10 text-[#f6b012]'
                      : 'border-white/10 bg-white/5 text-white hover:border-[#f6b012]/30'
                  }`}
                >
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="text-xs text-white/60 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Effects */}
          <div className="p-4 border-b border-[#f6b012]/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#f6b012]" />
              audio effects
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {presets?.audio_effects && Object.entries(presets.audio_effects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => handleEffectToggle(key)}
                  className={`p-3 rounded-xl border transition-all ${
                    settings.effects.includes(key)
                      ? 'border-[#f6b012] bg-[#f6b012]/10 text-[#f6b012]'
                      : 'border-white/10 bg-white/5 text-white hover:border-[#f6b012]/30'
                  }`}
                >
                  <div className="text-sm font-medium">{effect.name}</div>
                  <div className="text-xs text-white/60 mt-1">{effect.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Spatial Audio */}
          <div className="p-4 border-b border-[#f6b012]/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#f6b012]" />
              spatial audio
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {presets?.spatial_presets && Object.entries(presets.spatial_presets).map(([key, spatial]) => (
                <button
                  key={key}
                  onClick={() => handleSpatialSelect(key)}
                  className={`p-3 rounded-xl border transition-all ${
                    settings.spatial_preset === key
                      ? 'border-[#f6b012] bg-[#f6b012]/10 text-[#f6b012]'
                      : 'border-white/10 bg-white/5 text-white hover:border-[#f6b012]/30'
                  }`}
                >
                  <div className="text-sm font-medium">{spatial.name}</div>
                  <div className="text-xs text-white/60 mt-1">{spatial.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Processing Options */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#f6b012]" />
              processing options
            </h3>

            <div className="space-y-3">
              {/* Audio Normalization */}
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">audio normalization</div>
                  <div className="text-xs text-white/60">consistent volume levels</div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, normalize: !prev.normalize }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.normalize ? 'bg-[#f6b012]' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.normalize ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </label>

              {/* Dynamic Range Compression */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">dynamic range compression</div>
                    <div className="text-xs text-white/60">prevent clipping, even out dynamics</div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, compression: !prev.compression }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.compression ? 'bg-[#f6b012]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.compression ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>

                {settings.compression && (
                  <div className="ml-4 space-y-2">
                    <div>
                      <label className="text-xs text-white/80">attack: {settings.compression_settings.attack}s</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={settings.compression_settings.attack}
                        onChange={(e) => handleCompressionChange('attack', parseFloat(e.target.value))}
                        className="w-full accent-[#f6b012]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/80">release: {settings.compression_settings.release}s</label>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={settings.compression_settings.release}
                        onChange={(e) => handleCompressionChange('release', parseFloat(e.target.value))}
                        className="w-full accent-[#f6b012]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/80">threshold: {settings.compression_settings.threshold}dB</label>
                      <input
                        type="range"
                        min="-30"
                        max="-10"
                        step="1"
                        value={settings.compression_settings.threshold}
                        onChange={(e) => handleCompressionChange('threshold', parseInt(e.target.value))}
                        className="w-full accent-[#f6b012]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/80">ratio: {settings.compression_settings.ratio}:1</label>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="1"
                        value={settings.compression_settings.ratio}
                        onChange={(e) => handleCompressionChange('ratio', parseInt(e.target.value))}
                        className="w-full accent-[#f6b012]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/80">makeup: {settings.compression_settings.makeup}dB</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={settings.compression_settings.makeup}
                        onChange={(e) => handleCompressionChange('makeup', parseInt(e.target.value))}
                        className="w-full accent-[#f6b012]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#f6b012]/20">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white font-medium hover:border-[#f6b012]/30 transition-colors"
          >
            reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl bg-[#f6b012] text-black font-medium hover:bg-[#f6b012]/90 transition-colors"
          >
            apply
          </button>
        </div>
      </div>
    </div>
  );
}