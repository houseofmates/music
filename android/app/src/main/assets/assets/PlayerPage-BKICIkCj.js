import { A as require_jsx_runtime, N as __toESM, b as resolveMediaUrl, j as require_react, t as usePlayerStore } from "./store-DiutPrSL.js";
import { H as X, u as GripVertical, y as Loader2 } from "./DataSaverContext-CdWIg2hh.js";
import { t as ImageWithFallback } from "./ImageWithFallback-pWXsvhVu.js";
//#region src/pages/PlayerPage.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlayerPage() {
	const { currentTrack, showLyrics, queue, currentQueueIndex, loadQueue, removeFromQueue, playTrack, clearQueue } = usePlayerStore();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const safeQueue = Array.isArray(queue) ? queue : [];
	(0, import_react.useEffect)(() => {
		loadQueueData();
	}, []);
	const loadQueueData = async () => {
		try {
			setLoading(true);
			await loadQueue();
		} catch (error) {
			console.error("Error loading queue:", error);
		} finally {
			setLoading(false);
		}
	};
	const handleRemoveFromQueue = async (queueItem, e) => {
		e.stopPropagation();
		await removeFromQueue(queueItem.id);
	};
	const handlePlayTrack = (queueItem, index) => {
		playTrack(queueItem.track, index);
	};
	if (!currentTrack) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black flex items-center justify-center pb-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white mb-4",
				children: "no track playing"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[#888] text-sm",
				children: "select a track to start playing"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-80 pt-safe",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-vibe-gold text-center",
					children: "now playing"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 mb-8 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl overflow-hidden bg-[#0a0a0a] p-6 max-w-md w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full aspect-square rounded-2xl overflow-hidden bg-[#111] mb-4",
							children: currentTrack.cover_art_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl(currentTrack.cover_art_url),
								alt: currentTrack.album || currentTrack.title || currentTrack.filename,
								fallbackText: currentTrack.title || currentTrack.filename,
								className: "w-full h-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full h-full flex items-center justify-center bg-[#111] text-vibe-gold text-5xl",
								children: "♪"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold text-white mb-2",
							children: currentTrack.title || currentTrack.filename
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-vibe-gold text-lg mb-1",
							children: currentTrack.artist || "unknown artist"
						}),
						currentTrack.album && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[#888]",
							children: currentTrack.album
						})
					]
				})
			}),
			showLyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 mb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl bg-[#111] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl font-bold text-vibe-gold mb-4",
						children: "lyrics"
					}), currentTrack.synced_lyrics || currentTrack.lyrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-white whitespace-pre-line leading-relaxed",
						children: currentTrack.synced_lyrics || currentTrack.lyrics
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[#888]",
						children: "No lyrics available"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl font-bold text-white",
						children: "queue"
					}), safeQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: async () => {
							if (clearQueue) await clearQueue();
						},
						className: "px-3 py-1.5 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors lowercase",
						children: "clear queue"
					})]
				}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
				}) : safeQueue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center py-12 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "queue is empty" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: safeQueue.map((queueItem, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => handlePlayTrack(queueItem, index),
						className: `flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer ${index === currentQueueIndex ? "bg-[#2a1f0f] border-2 border-vibe-gold" : "bg-[#111] hover:bg-[#1a1a1a]"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "w-5 h-5 text-[#888] flex-shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-12 h-12 rounded-xl overflow-hidden bg-[#111] flex-shrink-0",
								children: queueItem.track.cover_art_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
									src: resolveMediaUrl(queueItem.track.cover_art_url),
									alt: queueItem.track.album || queueItem.track.title || queueItem.track.filename,
									fallbackText: queueItem.track.title || queueItem.track.filename,
									className: "w-full h-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full h-full flex items-center justify-center bg-[#111] text-vibe-gold",
									children: "♪"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-white font-semibold truncate",
									children: queueItem.track.title || queueItem.track.filename
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[#888] text-sm truncate",
									children: queueItem.track.artist || "unknown artist"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: (e) => handleRemoveFromQueue(queueItem, e),
								className: "p-2 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#2a1515] hover:text-red-400 transition-colors flex-shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
							})
						]
					}, queueItem.id))
				})]
			})
		]
	});
}
//#endregion
export { PlayerPage as default };
