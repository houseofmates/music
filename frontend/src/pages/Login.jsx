import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, user } = usePlayerStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-vibe-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-4">{mode === 'login' ? 'sign in' : 'create account'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1" htmlFor="username">
              username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-vibe-gold"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1" htmlFor="password">
              password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-vibe-gold"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-vibe-gold py-3 text-black font-semibold hover:bg-yellow-500 transition"
          >
            {loading ? 'working…' : mode === 'login' ? 'sign in' : 'create account'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-white/70">
          {mode === 'login' ? (
            <>
              new here?{' '}
              <button className="text-vibe-gold underline" onClick={() => setMode('register')}>
                create account
              </button>
            </>
          ) : (
            <>
              already have an account?{' '}
              <button className="text-vibe-gold underline" onClick={() => setMode('login')}>
                sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
