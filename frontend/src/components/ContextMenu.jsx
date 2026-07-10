import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, ListPlus, Download, Heart, X, ImageIcon } from '../icons.jsx';

export default function ContextMenu({
  x,
  y,
  track,
  onClose,
  onEdit,
  onAddToQueue,
  onDownload,
  onToggleFavorite,
  isFavorite,
  onRemoveFromPlaylist,
  onSearchCover,
  onAddToPlaylist,
  showRemoveOption = false,
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Calculate position after mount to ensure menu fits on screen
  useEffect(() => {
    if (!menuRef.current) return;
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const menuHeight = rect.height;
    const menuWidth = rect.width;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // If menu would go off bottom of screen, show it above the click point
    if (y + menuHeight > windowHeight) {
      adjustedY = y - menuHeight;
      // Ensure it doesn't go off top of screen
      if (adjustedY < 0) {
        adjustedY = 10;
      }
    }
    
    // If menu would go off right of screen, align to right edge
    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 10;
    }
    
    // If menu would go off left of screen
    if (adjustedX < 10) {
      adjustedX = 10;
    }
    
    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  return (
    <>
      {/* Backdrop - invisible but catches clicks */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 rounded-xl shadow-2xl py-2 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
        style={{
          left: position.x,
          top: position.y,
          backgroundColor: '#050505',
          border: '1px solid #333',
        }}
      >
        {/* Track info header */}
        <div className="px-3 py-2 border-b border-[#333] mb-1">
          <p className="text-white text-sm font-medium truncate max-w-[200px] lowercase">
            {(track?.title || track?.filename || '').toLowerCase()}
          </p>
          <p className="text-[#888] text-xs truncate max-w-[200px] lowercase">
            {(track?.artist || 'unknown artist').toLowerCase()}
          </p>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <button
            onClick={() => {
              onEdit?.(track);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <Pencil className="w-4 h-4 text-vibe-gold" />
            edit details
          </button>

          <button
            onClick={() => {
              onToggleFavorite?.(track);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-vibe-gold fill-vibe-gold' : 'text-vibe-gold'}`} />
            {isFavorite ? 'remove from favorites' : 'add to favorites'}
          </button>

          <button
            onClick={() => {
              onAddToPlaylist?.(track);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <ListPlus className="w-4 h-4 text-vibe-gold" />
            add to playlist
          </button>

          <button
            onClick={() => {
              onAddToQueue?.(track);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <ListPlus className="w-4 h-4 text-vibe-gold" />
            add to queue
          </button>

          <button
            onClick={() => {
              onDownload?.(track);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <Download className="w-4 h-4 text-vibe-gold" />
            download
          </button>

          <button
            onClick={() => {
              onSearchCover?.(track);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <ImageIcon className="w-4 h-4 text-vibe-gold" />
            search cover
          </button>

          {showRemoveOption && (
            <>
              <div className="border-t border-[#333] my-1" />
              <button
                onClick={() => {
                  onRemoveFromPlaylist?.(track);
                  onClose();
                }}
                className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-900 flex items-center gap-2 text-sm transition-colors lowercase"
              >
                <Trash2 className="w-4 h-4" />
                remove from playlist
              </button>
            </>
          )}
        </div>

        {/* Close button at bottom */}
        <div className="border-t border-[#333] mt-1 pt-1">
          <button
            onClick={onClose}
            aria-label="cancel"
            className="w-full px-3 py-2 text-left text-[#888] hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase"
          >
            <X className="w-4 h-4" />
            cancel
          </button>
        </div>
      </div>
    </>
  );
}
