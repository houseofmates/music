import { useState, useEffect } from 'react';
import { X, Loader2 } from '../icons.jsx';

export default function ArtistEditModal({ isOpen, artistData, onClose, onSave }) {
  const [artist, setArtist] = useState('');
  const [cover, setCover] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (artistData) {
      setArtist(artistData.name || '');
      setCover(artistData.cover_art_url || '');
    }
  }, [artistData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCover(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name: artist, cover_art_url: cover, coverFile });
      onClose();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !artistData) return null;

  return (
    <div
      className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#050505] rounded-3xl p-6 w-full max-w-md border-2 border-[#ffbb20]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-vibe-gold mb-4 lowercase">edit artist</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-white/60 text-sm mb-2 block lowercase">artist name</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
            />
          </div>
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block lowercase">cover image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-white" />
            {cover && (
              <div className="mt-3">
                <img src={cover} alt="cover" className="w-24 h-24 rounded-xl object-cover" />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors lowercase"
              disabled={saving}
            >
              cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-vibe-gold text-vibe-black hover:bg-vibe-gold/90 transition-colors font-semibold disabled:opacity-50"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
