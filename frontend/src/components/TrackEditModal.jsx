import { useState, useEffect } from 'react';
import { X, Loader2, Search } from '../icons.jsx';
import { uploadTrackCover } from '../api.js';
import CoverSearchModal from './CoverSearchModal.jsx';

export default function TrackEditModal({ isOpen, track, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [cover, setCover] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCoverSearch, setShowCoverSearch] = useState(false);

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      setCover(track.cover_art_url || '');
    }
  }, [track]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !track) return;
    
    setUploading(true);
    try {
      const res = await uploadTrackCover(track.id, file);
      setCover(res.data.cover_art_url);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => setCover(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ title, artist, album });
      onClose();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div
      className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#050505] rounded-3xl p-6 w-full max-w-md border-2 border-[#ffbb20]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-vibe-gold mb-4 lowercase">edit song</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-white/60 text-sm mb-2 block lowercase">title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
            />
          </div>
          <div className="mb-4">
            <label className="text-white/60 text-sm mb-2 block lowercase">artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
            />
          </div>
          <div className="mb-4">
            <label className="text-white/60 text-sm mb-2 block lowercase">album</label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
            />
          </div>
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block lowercase">cover image</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full text-white file:bg-vibe-gold file:text-vibe-black file:border-0 file:rounded-xl file:px-4 file:py-2 file:cursor-pointer file:mr-4 hover:file:bg-vibe-gold/90 cursor-pointer"
                disabled={uploading || saving}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl pointer-events-none">
                  <Loader2 className="w-5 h-5 animate-spin text-vibe-gold" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowCoverSearch(true)}
              className="w-full mt-3 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors lowercase flex items-center justify-center gap-2"
              disabled={saving || uploading}
            >
              <Search className="w-5 h-5" />
              search for covers
            </button>
            {cover && (
              <div className="mt-3">
                <img src={cover} alt="preview" className="w-24 h-24 rounded-xl object-cover" />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors lowercase"
              disabled={saving || uploading}
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
      <CoverSearchModal
        track={track}
        isOpen={showCoverSearch}
        onClose={() => setShowCoverSearch(false)}
        onCoverApplied={(newCover) => {
          setCover(newCover);
        }}
      />
    </div>
  );
}
