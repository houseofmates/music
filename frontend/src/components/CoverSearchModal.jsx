import React, { useState, useCallback } from 'react';
import { Search, X, Check, ImageIcon } from '../icons';
import api from '../api.js';

export default function CoverSearchModal({ track, isOpen, onClose, onCoverApplied }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [applying, setApplying] = useState(false);

  // Build default search query from track metadata
  React.useEffect(() => {
    if (track && isOpen) {
      const defaultQuery = `${track.title || ''} ${track.artist || ''}`.trim();
      setSearchQuery(defaultQuery);
      // Auto-search on open
      if (defaultQuery) {
        searchCovers(defaultQuery);
      }
    }
  }, [track, isOpen]);

  const searchCovers = useCallback(async (query) => {
    if (!query.trim() || !track) return;
    
    setLoading(true);
    setError(null);
    setCovers([]);
    
    try {
      const response = await api.get(
        `/tracks/${track.id}/search-covers`,
        {
          params: {
            query: query,
            limit: 12
          }
        }
      );
      
      const data = response.data;
      setCovers(data.covers || []);
    } catch (err) {
      setError(err.message || 'Failed to search covers');
    } finally {
      setLoading(false);
    }
  }, [track]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchCovers(searchQuery);
  };

  const applyCover = async (coverUrl) => {
    if (!track) return;
    
    setApplying(true);
    setSelectedCover(coverUrl);
    
    try {
      const formData = new FormData();
      formData.append('cover_url', coverUrl);
      
      const response = await api.post(
        `/tracks/${track.id}/apply-cover`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const data = response.data;
      onCoverApplied(data.cover_art_url);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to apply cover');
      setSelectedCover(null);
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ImageIcon size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              Search Cover Art
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Form */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for album covers..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #444',
                backgroundColor: '#252525',
                color: '#fff',
                fontSize: '1rem',
              }}
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#6366f1',
                color: '#fff',
                fontSize: '1rem',
                cursor: loading || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !searchQuery.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 24px',
        }}>
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#ef444422',
              borderRadius: '8px',
              color: '#ef4444',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {covers.length === 0 && !loading && !error && (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '40px',
            }}>
              <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <p>No covers found. Try a different search.</p>
            </div>
          )}

          {covers.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {covers.map((cover, index) => (
                <div
                  key={index}
                  onClick={() => applyCover(cover.url)}
                  style={{
                    position: 'relative',
                    cursor: applying ? 'not-allowed' : 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    border: selectedCover === cover.url ? '3px solid #6366f1' : '2px solid transparent',
                    opacity: applying && selectedCover !== cover.url ? 0.5 : 1,
                  }}
                >
                  <img
                    src={cover.preview_url}
                    alt={`${cover.title} - ${cover.artist}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {selectedCover === cover.url && applying && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #6366f1',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                    </div>
                  )}
                  {selectedCover === cover.url && !applying && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#6366f1',
                      borderRadius: '50%',
                      padding: '4px',
                    }}>
                      <Check size={20} color="#fff" />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    fontSize: '0.875rem',
                  }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cover.title}
                    </div>
                    <div style={{ color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cover.artist}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
