import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from '../icons.jsx';
import { uploadPlaylistCover } from '../api.js';

export default function PlaylistEditModal({ isOpen, playlist, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [cover, setCover] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || '');
      setCover(playlist.cover_image || '');
    }
  }, [playlist]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !playlist) return;
    
    setUploading(true);
    try {
      const res = await uploadPlaylistCover(playlist.id, file);
      setCover(res.data.cover_image);
    } catch (err) {
      // fallback local preview
      const reader = new FileReader();
      reader.onload = () => setCover(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playlist) return;
    setSaving(true);
    try {
      await onSave({ name, cover_image: cover });
      onClose();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && playlist && confirm('Delete this playlist?')) {
      await onDelete(playlist.id);
      onClose();
    }
  };

  if (!isOpen || !playlist) return null;

  return (
    <div
      className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#050505] rounded-3xl p-6 w-full max-w-md border-2 border-[#ffbb20]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-vibe-gold mb-4 lowercase">edit playlist</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-white/60 text-sm mb-2 block lowercase">name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
            />
          </div>
          <div className="mb-6">
            <label className="text-white/60 text-sm mb-2 block lowercase">cover image</label>
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
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-colors lowercase"
                disabled={saving}
              >
                delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
