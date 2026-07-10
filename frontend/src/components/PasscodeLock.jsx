import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store';

const PASSCODE_KEY = 'music_app_passcode';
const AUTH_TOKEN_KEY = 'music_app_token';

// Simple hash function for passcode
const hashPasscode = (code) => {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

export const getStoredPasscode = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PASSCODE_KEY);
};

export const setStoredPasscode = (code) => {
  if (typeof window === 'undefined') return;
  if (code) {
    window.localStorage.setItem(PASSCODE_KEY, hashPasscode(code));
  } else {
    window.localStorage.removeItem(PASSCODE_KEY);
  }
};

export const verifyPasscode = (code) => {
  const stored = getStoredPasscode();
  if (!stored) return true; // No passcode set yet
  return hashPasscode(code) === stored;
};

export const hasPasscode = () => {
  return !!getStoredPasscode();
};

// Generate a fake auth token from passcode
export const generateToken = (code) => {
  const base = hashPasscode(code);
  const payload = btoa(JSON.stringify({ sub: 'user', exp: Date.now() + 31536000000 }));
  const signature = base.substring(0, 16);
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.${signature}`;
};

export default function PasscodeLock({ onUnlock, hasStoredPasscode = false }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  const [isFirstSetup, setIsFirstSetup] = useState(!hasStoredPasscode);
  const [confirmCode, setConfirmCode] = useState('');
  const { setAuthToken } = usePlayerStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (isFirstSetup) {
      if (passcode.length < 4) {
        setError('passcode must be at least 4 digits');
        return;
      }
      if (passcode !== confirmCode) {
        setError('passcodes do not match');
        return;
      }
      // Save passcode and generate token
      setStoredPasscode(passcode);
      const token = generateToken(passcode);
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      setAuthToken(token);
      onUnlock?.();
    } else {
      // Verify existing passcode
      if (verifyPasscode(passcode)) {
        const token = generateToken(passcode);
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
        setAuthToken(token);
        onUnlock?.();
      } else {
        setError('incorrect passcode');
        setPasscode('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-vibe-black flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {isFirstSetup ? 'create passcode' : 'enter passcode'}
        </h1>
        <p className="text-white/60 text-center mb-6 text-sm">
          {isFirstSetup 
            ? 'set a passcode to protect your music' 
            : 'enter your passcode to continue'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">
              {isFirstSetup ? 'passcode' : 'passcode'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-vibe-gold"
              placeholder="••••"
              autoFocus
            />
          </div>

          {isFirstSetup && (
            <div>
              <label className="block text-sm text-white/70 mb-1">
                confirm passcode
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-vibe-gold"
                placeholder="••••"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-vibe-gold py-3 text-black font-semibold hover:bg-yellow-500 transition"
          >
            {isFirstSetup ? 'create' : 'unlock'}
          </button>
        </form>

        {!isFirstSetup && (
          <p className="mt-4 text-center text-xs text-white/40">
            reinstall? use the same passcode to access your data
          </p>
        )}
      </div>
    </div>
  );
}
