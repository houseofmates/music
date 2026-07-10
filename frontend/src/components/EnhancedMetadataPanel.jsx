import { useState, useEffect } from 'react';
import { getTrackDeepDiscovery, triggerDeepDiscovery } from '../api';
import { Loader2, RefreshCw, ExternalLink, Calendar, MapPin, Music, Info } from '../icons.jsx';

export default function EnhancedMetadataPanel({ track, embedded = false }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (track?.id) {
      loadMetadata();
    }
  }, [track?.id]);

  const loadMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrackDeepDiscovery(track.id);
      setMetadata(response.data);
    } catch (err) {
      // If not found, that's okay - metadata hasn't been generated yet
      if (err.response?.status !== 404) {
        setError(err.message);
      }
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDiscovery = async () => {
    setTriggering(true);
    try {
      await triggerDeepDiscovery(track.id);
      // Reload metadata after a short delay
      setTimeout(() => loadMetadata(), 2000);
    } catch (err) {
      setError('Failed to start deep discovery');
    } finally {
      setTriggering(false);
    }
  };

  const cardClass = embedded
    ? "h-full flex flex-col"
    : "rounded-2xl bg-white/5 border border-white/10 p-4";

  if (loading) {
    return (
      <div className={`${cardClass} flex items-center justify-center`}>
        <Loader2 className="w-5 h-5 text-vibe-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClass} flex items-center justify-center`}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const artistInfo = metadata?.enhanced_metadata?.artist;
  const albumInfo = metadata?.enhanced_metadata?.album;
  const lyricsInfo = metadata?.enhanced_metadata?.lyrics;

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-vibe-gold text-sm font-medium">Enhanced Metadata</h3>
        <button
          onClick={triggering ? null : handleTriggerDiscovery}
          disabled={triggering}
          className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
          title="Trigger deep discovery"
        >
          {triggering ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {!metadata && (
        <div className="text-center py-8">
          <Info className="w-8 h-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60 text-sm mb-4">
            No enhanced metadata available yet
          </p>
          <button
            onClick={handleTriggerDiscovery}
            disabled={triggering}
            className="px-4 py-2 rounded-xl bg-vibe-gold text-vibe-black text-sm font-medium hover:bg-vibe-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {triggering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Discover Metadata
          </button>
        </div>
      )}

      {metadata && (
        <div className="space-y-4 overflow-y-auto">
          {/* Artist Information */}
          {artistInfo && (
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                Artist Info
              </h4>
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                {artistInfo.name && (
                  <p className="text-white text-sm">
                    <span className="text-white/60">Name:</span> {artistInfo.name}
                  </p>
                )}
                {artistInfo.country && (
                  <p className="text-white text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-white/60">Country:</span> {artistInfo.country}
                  </p>
                )}
                {(artistInfo.begin_date || artistInfo.end_date) && (
                  <p className="text-white text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-white/60">Active:</span>
                    {artistInfo.begin_date || '?'} - {artistInfo.end_date || 'present'}
                  </p>
                )}
                {artistInfo.biography && (
                  <div>
                    <p className="text-white/60 text-xs mb-1">Biography:</p>
                    <p className="text-white text-sm leading-relaxed">
                      {artistInfo.biography.length > 200
                        ? `${artistInfo.biography.substring(0, 200)}...`
                        : artistInfo.biography
                      }
                    </p>
                  </div>
                )}
                {artistInfo.image_url && (
                  <div>
                    <p className="text-white/60 text-xs mb-1">Artist Image:</p>
                    <img
                      src={artistInfo.image_url}
                      alt="Artist"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Album Information */}
          {albumInfo && (
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Album Info</h4>
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                {albumInfo.title && (
                  <p className="text-white text-sm">
                    <span className="text-white/60">Title:</span> {albumInfo.title}
                  </p>
                )}
                {albumInfo.first_release_date && (
                  <p className="text-white text-sm">
                    <span className="text-white/60">Released:</span> {albumInfo.first_release_date}
                  </p>
                )}
                {albumInfo.type && (
                  <p className="text-white text-sm">
                    <span className="text-white/60">Type:</span> {albumInfo.type}
                  </p>
                )}
                {albumInfo.cover_art_urls && albumInfo.cover_art_urls.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs mb-2">Cover Art:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {albumInfo.cover_art_urls.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Cover ${index + 1}`}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lyrics Information */}
          {lyricsInfo && lyricsInfo.lyrics && (
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Lyrics</h4>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    lyricsInfo.lyrics.synced_text ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {lyricsInfo.lyrics.synced_text ? 'Synced' : 'Plain'}
                  </span>
                  {lyricsInfo.lyrics.source && (
                    <span className="text-white/60 text-xs">{lyricsInfo.lyrics.source}</span>
                  )}
                  {lyricsInfo.lyrics.url && (
                    <a
                      href={lyricsInfo.lyrics.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vibe-gold hover:text-vibe-gold/80"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-white text-sm leading-relaxed">
                  {lyricsInfo.lyrics.text
                    ? (lyricsInfo.lyrics.text.length > 150
                        ? `${lyricsInfo.lyrics.text.substring(0, 150)}...`
                        : lyricsInfo.lyrics.text
                      )
                    : 'Lyrics found but not saved to track yet'
                  }
                </p>
              </div>
            </div>
          )}

          {metadata.enriched_at && (
            <p className="text-white/40 text-xs text-center">
              Last updated: {new Date(metadata.enriched_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}