import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Loader2, Check, X, Pencil, Timer, Play } from "../icons.jsx";
import { getTrackLyrics, saveTrackLyrics, saveSyncedLyrics, searchLyrics } from "../api";
import { useLiveSearch } from "../hooks/useLiveSearch";
import { usePlayerStore } from "../store";
import { triggerImpact } from '../utils/haptics';
import { showToast } from '../utils/toast';

// Parse LRC format "[mm:ss.xx]text" into sorted array of { time, text }
function parseLRC(lrc) {
  if (!lrc) return null;
  const lines = lrc.split("\n");
  const parsed = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = parseInt(match[3].padEnd(3, "0").slice(0, 3), 10);
      const time = mins * 60 + secs + ms / 1000;
      const text = match[4].trim();
      if (text) parsed.push({ time, text });
    }
  }
  return parsed.length > 0 ? parsed.sort((a, b) => a.time - b.time) : null;
}

// Build LRC string from timestamps + lines
function buildLRC(timestamps, lines) {
  return timestamps
    .map((t, i) => {
      if (t == null) return null;
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60);
      const ms = Math.round((t % 1) * 100);
      return `[${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}]${lines[i]}`;
    })
    .filter(Boolean)
    .join("\n");
}

export default function LyricsPanel({ track, embedded }) {
  const [savedLyrics, setSavedLyrics] = useState("");
  const [syncedLyricsRaw, setSyncedLyricsRaw] = useState("");
  const [draftLyrics, setDraftLyrics] = useState("");
  const [draftSynced, setDraftSynced] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("editor");
  // Live search for lyrics
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    setQueryValue,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    clearSearch,
    immediateSearch
  } = useLiveSearch(
    (query) => searchLyrics(query, track?.artist, track?.title),
    { debounceMs: 300, minQueryLength: 2 }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const [syncIndex, setSyncIndex] = useState(0);
  const [syncTimestamps, setSyncTimestamps] = useState([]);
  const [syncDone, setSyncDone] = useState(false);
  const [savingSync, setSavingSync] = useState(false);

  const currentPosition = usePlayerStore((s) => s.currentPosition);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playPause = usePlayerStore((s) => s.playPause);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const lyricsRef = useRef(null);
  const syncScrollRef = useRef(null);
  const linesRef = useRef([]);
  const syncLinesRef = useRef([]);
  const lastScrolledIdx = useRef(-1);

  useEffect(() => {
    if (track?.id) {
      setSavedLyrics("");
      setSyncedLyricsRaw("");
      setDraftLyrics("");
      setDraftSynced("");
      clearSearch();
      setSyncIndex(0);
      setSyncTimestamps([]);
      setSyncDone(false);
      lastScrolledIdx.current = -1;
      linesRef.current = [];
      const loadLyrics = async () => {
        setLoading(true);
        try {
          const res = await getTrackLyrics(track.id);
          const l = res.data.lyrics || "";
          const s = res.data.synced_lyrics || "";
          setSavedLyrics(l);
          setSyncedLyricsRaw(s);
          setDraftLyrics(l);
          if (l || s) {
            setMode("viewer");
          } else {
            setMode("editor");
          }
        } catch {
          setSavedLyrics("");
          setSyncedLyricsRaw("");
          setDraftLyrics("");
          setMode("editor");
        } finally {
          setLoading(false);
        }
      };
      loadLyrics();
      setQueryValue(`${track.artist || ""} ${track.title || ""}`.trim());
    }
  }, [track?.id]);

  const parsedSync = parseLRC(syncedLyricsRaw);
  const lines = savedLyrics ? savedLyrics.split("\n") : [];
  const contentLines = lines.filter((l) => l.trim());



  // Calculate active line reactively based on current position
  const activeLine = useMemo(() => {
    const PREVIEW_OFFSET = 0.5;
    if (!parsedSync) return -1;
    
    let activeIdx = -1;
    for (let i = parsedSync.length - 1; i >= 0; i--) {
      if (currentPosition >= parsedSync[i].time - PREVIEW_OFFSET) {
        activeIdx = i;
        break;
      }
    }
    

    
    return activeIdx;
  }, [currentPosition, parsedSync]);

  // Calculate active line for plain text lyrics (estimated based on position)
  const activeLinePlain = useMemo(() => {
    if (parsedSync) return activeLine; // Use synced lyrics active line
    
    const displayLines = lines.length > 0 ? lines.map(l => l.toLowerCase()) : [];
    if (displayLines.length === 0) return -1;
    
    // For plain text, estimate active line based on position and song duration
    const { audioDuration } = usePlayerStore.getState();
    if (audioDuration > 0) {
      const progressRatio = currentPosition / audioDuration;
      let estimatedLine = Math.floor(progressRatio * displayLines.length);
      return Math.max(0, Math.min(estimatedLine, displayLines.length - 1));
    }
    
    return -1;
  }, [currentPosition, parsedSync, activeLine, lines]);

  useEffect(() => {
    if (mode !== "viewer" || !lyricsRef.current) return;
    if (!parsedSync) return;
    
    // Only scroll when active line actually changes to avoid jitter
    if (activeLine === lastScrolledIdx.current) return;
    lastScrolledIdx.current = activeLine;

    if (activeLine >= 0 && linesRef.current[activeLine] && lyricsRef.current) {
      const line = linesRef.current[activeLine];
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLine, mode, parsedSync]);

  useEffect(() => {
    if (mode !== "viewer" || !lyricsRef.current) return;
    if (parsedSync) return; // Skip if we have synced lyrics
    
    // Only scroll when active line actually changes to avoid jitter
    if (activeLinePlain === lastScrolledIdx.current) return;
    lastScrolledIdx.current = activeLinePlain;

    if (activeLinePlain >= 0 && linesRef.current[activeLinePlain] && lyricsRef.current) {
      const line = linesRef.current[activeLinePlain];
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLinePlain, mode, parsedSync]);

  useEffect(() => {
    if (mode !== "sync" || !syncScrollRef.current) return;
    const el = syncLinesRef.current[syncIndex];
    if (el) {
      const container = syncScrollRef.current;
      const target = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTop = target;
    }
  }, [syncIndex, mode]);

  const selectLyrics = (result) => {
    const text = (result.plain_lyrics || "").trim();
    setDraftLyrics(text);
    setDraftSynced(result.synced_lyrics || "");
    // Clear search results when selecting lyrics
    clearSearch();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await saveTrackLyrics(track.id, draftLyrics);
      const finalLyrics = res.data.lyrics || draftLyrics;
      setSavedLyrics(finalLyrics);
      setDraftLyrics(finalLyrics);
      if (draftSynced) {
        try {
          await saveSyncedLyrics(track.id, draftSynced);
          setSyncedLyricsRaw(draftSynced);
        } catch (e) {
          console.error("Failed to save synced lyrics:", e);
          showToast("Failed to save synced lyrics.", "error");
        }
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setMode("viewer");
      }, 600);
    } catch (e) {
      if (e.response?.status === 401) {
        showToast("Please log in to save lyrics.", "error");
      } else {
        showToast("Failed to save lyrics. Please check your connection.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const startSyncMode = (lyrics) => {
    const text = lyrics || savedLyrics;
    const cl = text.split("\n").filter((l) => l.trim());
    setSyncIndex(0);
    setSyncTimestamps(new Array(cl.length).fill(null));
    setSyncDone(false);
    setMode("sync");
  };

  const handleSyncTap = () => {
    const cl = contentLines.length > 0 ? contentLines : (savedLyrics || "").split("\n").filter((l) => l.trim());
    setSyncTimestamps((prev) => {
      const next = [...prev];
      next[syncIndex] = currentPosition;
      return next;
    });
    if (syncIndex >= cl.length - 1) {
      setSyncDone(true);
    } else {
      setSyncIndex((i) => i + 1);
    }
  };

  const handleSyncLineBacktrack = (lineIndex) => {
    if (lineIndex > syncIndex) return;
    setSyncDone(false);
    setSyncIndex(lineIndex);
    setSyncTimestamps((prev) => {
      const next = [...prev];
      for (let i = lineIndex; i < next.length; i += 1) {
        next[i] = null;
      }
      return next;
    });
  };

  const handleSaveSyncedLyrics = async () => {
    const cl = contentLines.length > 0 ? contentLines : (savedLyrics || "").split("\n").filter((l) => l.trim());
    const lrc = buildLRC(syncTimestamps, cl);
    setSavingSync(true);
    try {
      await saveSyncedLyrics(track.id, lrc);
      setSyncedLyricsRaw(lrc);
      setMode("viewer");
    } catch (e) {
      console.error("Failed to save synced lyrics:", e);
      showToast("Failed to save synced lyrics.", "error");
    } finally {
      setSavingSync(false);
    }
  };

  const setLineRef = useCallback((el, i) => {
    linesRef.current[i] = el;
  }, []);

  const setSyncLineRef = useCallback((el, i) => {
    syncLinesRef.current[i] = el;
  }, []);

  const cardClass = embedded
    ? "h-full flex flex-col"
    : "rounded-2xl bg-white/5 border border-white/10 p-3";
  const scrollClass = embedded ? "flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 md:px-8 lg:px-12" : "max-h-64 overflow-y-auto scroll-smooth";
  const syncScrollClass = embedded ? "flex-1 min-h-0 overflow-y-auto scroll-smooth mb-3 px-4 md:px-8 lg:px-12" : "max-h-52 overflow-y-auto scroll-smooth mb-3";
  const resultsScrollClass = embedded ? "flex-1 min-h-0 overflow-y-auto space-y-1 px-4 md:px-8 lg:px-12" : "max-h-48 overflow-y-auto space-y-1";

  if (loading) {
    const inner = (
      <div className={`${cardClass} flex items-center justify-center`}>
        <Loader2 className="w-5 h-5 text-vibe-gold animate-spin" />
      </div>
    );
    return embedded ? inner : <div className="px-4 pb-3">{inner}</div>;
  }

  if (mode === "sync") {
    const cl = contentLines.length > 0 ? contentLines : (savedLyrics || "").split("\n").filter((l) => l.trim());
    const inner = (
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-2 shrink-0">
          <p className="text-vibe-gold text-xs font-medium">tap each line as it is sung (tap a previous line to redo)</p>
          <button
            onClick={() => setMode(savedLyrics ? "viewer" : "editor")}
            className="text-xs text-white/50 hover:text-white/80"
          >
            cancel
          </button>
        </div>
        {!isPlaying && syncIndex === 0 && (
          <button
            onClick={() => { seekTo(0); playPause(); }}
            className="w-full mb-2 py-2 rounded-xl bg-vibe-gold/20 text-vibe-gold text-sm font-medium flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4" /> start playing to sync
          </button>
        )}
        <div ref={syncScrollRef} className={syncScrollClass}>
          {cl.map((line, i) => (
            <button
              key={i}
              type="button"
              ref={(el) => setSyncLineRef(el, i)}
              onClick={() => handleSyncLineBacktrack(i)}
              className={`block w-full text-left text-sm leading-relaxed py-0.5 transition-all duration-200 ${
                i === syncIndex
                  ? "text-vibe-gold font-semibold scale-105 origin-left"
                  : i < syncIndex
                    ? "text-white/40 hover:text-white/80 cursor-pointer"
                    : "text-white/60"
              } ${i > syncIndex ? "cursor-default" : ""}`}
            >
              {syncTimestamps[i] != null && (
                <span className="text-vibe-gold/50 text-xs mr-1">
                  {Math.floor(syncTimestamps[i] / 60)}:{String(Math.floor(syncTimestamps[i] % 60)).padStart(2, "0")}
                </span>
              )}
              {line.toLowerCase()}
            </button>
          ))}
        </div>
        {!syncDone ? (
          <button
            onClick={handleSyncTap}
            className="w-full py-4 rounded-2xl bg-vibe-gold text-vibe-black text-lg font-bold active:scale-95 transition-transform shrink-0"
          >
            tap
          </button>
        ) : (
          <button
            onClick={handleSaveSyncedLyrics}
            disabled={savingSync}
            className="w-full py-3 rounded-2xl bg-vibe-gold text-vibe-black text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {savingSync ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            save timing
          </button>
        )}
      </div>
    );
    return embedded ? inner : <div className="px-4 pb-3">{inner}</div>;
  }

  if (mode === "viewer" && (savedLyrics || syncedLyricsRaw)) {
    // Use parsed synced lyrics if available, otherwise fall back to plain text
    let displayLines;
    
    if (parsedSync) {
      displayLines = parsedSync.map((e) => e.text.toLowerCase());
    } else if (lines.length > 0) {
      displayLines = lines.map(l => l.toLowerCase());
    } else {
      displayLines = [];
    }



    const inner = (
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-2 shrink-0">
          <p className="text-white/50 text-xs" style={{display: 'none'}}></p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => startSyncMode()}
              className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="re-sync timing"
            >
              <Timer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMode("editor")}
              className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div ref={lyricsRef} className={scrollClass}>
          {displayLines.map((line, i) => {
            const time = parsedSync ? parsedSync[i]?.time : null;
            const isClickable = time != null;
            return (
              <button
                key={i}
                ref={(el) => setLineRef(el, i)}
                onClick={() => {
                  if (isClickable) {
                    seekTo(time);
                    triggerImpact("light");
                  }
                }}
                disabled={!isClickable}
                className={`w-full text-center text-sm leading-relaxed py-1.5 px-2 rounded-lg transition-all duration-200 ${
                  i === activeLinePlain
                    ? "text-vibe-gold font-semibold bg-vibe-gold/10"
                    : activeLinePlain >= 0 && Math.abs(i - activeLinePlain) <= 1
                      ? "text-white/70"
                      : parsedSync ? "text-white/40" : "text-white/60"
                } ${isClickable ? "active:scale-[0.98] cursor-pointer hover:bg-white/5" : "cursor-default"}`}
              >
                {line || "\u00A0"}
              </button>
            );
          })}
        </div>
      </div>
    );
    return embedded ? inner : <div className="px-4 pb-3">{inner}</div>;
  }

  const inner = (
    <div className={`${cardClass} space-y-3`}>
      {savedLyrics && (
        <div className="flex justify-end shrink-0">
          <button
            onClick={() => setMode("viewer")}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            back to lyrics
          </button>
        </div>
      )}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1">
          {searchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              <Loader2 className="w-4 h-4 text-vibe-gold animate-spin" />
            </div>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !searchLoading) {
                setSearchAttempted(true);
                immediateSearch();
              }
            }}
            placeholder="search lyrics..."
            autoFocus={false}
            inputMode="text"
            enterKeyHint="search"
            className="w-full px-3 py-2 rounded-xl border-2 border-transparent bg-[#1a1a1a] text-white placeholder-[#666] focus:border-vibe-gold focus:outline-none"
          />
        </div>
        <button
          onClick={() => {
            if (!searchLoading) {
              setSearchAttempted(true);
              immediateSearch();
            }
          }}
          disabled={searchLoading}
          className="px-3 py-2 rounded-xl bg-vibe-gold text-vibe-black hover:bg-vibe-gold/90 transition-colors disabled:opacity-50 flex-shrink-0 flex items-center justify-center"
          aria-label="search"
        >
          {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>
      {searchLoading && (
        <p className="text-vibe-gold/70 text-xs text-center py-2">searching...</p>
      )}
      {searchError && (
        <p className="text-red-400 text-xs text-center py-2">search error: {searchError}</p>
      )}
      {searchResults.length > 0 && (
        <div className={resultsScrollClass}>
          {[...searchResults]
            .sort((a, b) => (b.synced_lyrics ? 1 : 0) - (a.synced_lyrics ? 1 : 0))
            .map((r, idx) => {
              const preview = (r.plain_lyrics || r.synced_lyrics || "").split("\n")[0] || "";
              return (
                <button
                  key={r.id ?? `${r.source}-${idx}`}
                  onClick={() => selectLyrics(r)}
                  className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation"
                  type="button"
                >
                  <p className="text-white text-sm font-medium truncate">{r.title}</p>
                  <p className="text-white/60 text-xs truncate">
                    {r.artist}{r.album ? ` — ${r.album}` : ""}
                  </p>
                  <p className="text-white/40 text-xs truncate">{preview}</p>
                  {r.synced_lyrics && (
                    <span className="text-vibe-gold/60 text-xs">synced</span>
                  )}
                </button>
              );
            })}
        </div>
      )}
      {!searchLoading && searchAttempted && searchResults.length === 0 && !searchError && searchQuery.trim().length >= 2 && (
        <p className="text-white/40 text-sm text-center py-4">no results found</p>
      )}
      {draftLyrics ? (
        <div className={embedded ? "flex-1 min-h-0 overflow-y-auto" : "max-h-48 overflow-y-auto"}>
          <pre className="text-white/80 text-sm whitespace-pre-wrap font-[inherit] leading-relaxed">
            {draftLyrics}
          </pre>
        </div>
      ) : (
        <p className="text-white/40 text-sm text-center py-4">
          no lyrics yet — search above to find and select lyrics
        </p>
      )}
      {draftLyrics && (
        <div className="flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { setDraftLyrics(""); setDraftSynced(""); clearSearch(); }}
            className="px-3 py-1.5 rounded-xl bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-vibe-gold text-vibe-black text-sm font-medium hover:bg-vibe-gold/90 transition-colors disabled:opacity-50 flex items-center gap-1 touch-manipulation"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                saved
              </>
            ) : (
              "save lyrics"
            )}
          </button>
        </div>
      )}
    </div>
  );
  return embedded ? inner : <div className="px-4 pb-3">{inner}</div>;
}
