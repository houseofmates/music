import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, settings, updateSettings } = usePlayerStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
    } catch (err) {
    }
  };

  return (
    <div className="min-h-screen bg-vibe-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">profile</h1>
            <p className="text-white/60">{user.username}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20"
          >
            sign out
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">sync settings</h2>

          <label className="flex items-center justify-between gap-4">
            <span className="text-white/80">offline first mode</span>
            <input
              type="checkbox"
              checked={localSettings?.offlineMode || false}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, offlineMode: e.target.checked }))
              }
              className="h-5 w-5 accent-vibe-gold"
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="text-white/80">battery / low power mode</span>
            <input
              type="checkbox"
              checked={localSettings?.lowPowerMode || false}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, lowPowerMode: e.target.checked }))
              }
              className="h-5 w-5 accent-vibe-gold"
            />
          </label>

          <div className="space-y-1">
            <label className="text-white/80">crossfade (seconds)</label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={localSettings?.crossfadeSeconds || 0.6}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  crossfadeSeconds: Number(e.target.value),
                }))
              }
              className="w-full"
            />
            <div className="text-right text-sm text-white/60">
              {localSettings?.crossfadeSeconds?.toFixed(1)}s
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-vibe-gold py-3 text-black font-semibold hover:bg-yellow-500"
          >
            save settings
          </button>
        </div>
      </div>
    </div>
  );
}
