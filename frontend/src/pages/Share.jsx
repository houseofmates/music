import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShareLink, getTrack, getPlaylist } from '../api';
import { usePlayerStore } from '../store';

export default function Share() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [share, setShare] = useState(null);
  const [track, setTrack] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        const res = await getShareLink(token);
        if (!mounted) return;
        setShare(res.data);

        if (res.data.kind === 'track') {
          const trackRes = await getTrack(res.data.resource_id);
          if (mounted) setTrack(trackRes.data);
        } else if (res.data.kind === 'playlist') {
          const listRes = await getPlaylist(res.data.resource_id);
          if (mounted) {
            const playlistData = listRes.data;
            setPlaylist(playlistData);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.detail || 'Could not load share link');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [token, navigate]);

  const handlePlay = () => {
    if (track) {
      playTrack(track);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-vibe-black p-4">
        <div className="text-white/70">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibe-black p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">shared link</h1>
        {share && (
          <div className="text-white/60 mb-4">
            {share.title ? `${share.title}` : `shared ${share.kind}`}
          </div>
        )}

        {track && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{track.title || track.filename}</h2>
            <p className="text-white/60">{track.artist || 'unknown artist'}</p>
            <button
              type="button"
              onClick={handlePlay}
              className="mt-4 rounded-xl bg-vibe-gold px-5 py-3 text-black font-semibold"
            >
              play track
            </button>
          </div>
        )}

        {playlist && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{playlist.name}</h2>
            <p className="text-white/60 mb-4">{playlist.description}</p>
            <div className="space-y-2">
              {(playlist.tracks || []).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => playTrack(t)}
                  className="w-full text-left rounded-xl border border-white/10 bg-black/20 p-3 text-white hover:bg-white/10"
                >
                  <div className="font-semibold truncate">{t.title || t.filename}</div>
                  <div className="text-white/60 text-sm truncate">{t.artist || 'unknown'}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
