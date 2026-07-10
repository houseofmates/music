import { A as require_jsx_runtime, N as __toESM, j as require_react, t as usePlayerStore } from "./store-DiutPrSL.js";
import { U as Zap, V as WifiOff, d as Heart, n as useDataSaver } from "./DataSaverContext-CdWIg2hh.js";
//#region src/pages/Favorites.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Favorites() {
	const { favorites, loadFavorites, playTrack, toggleFavorite } = usePlayerStore();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			if (shouldDeferNetwork) {
				if (mounted) setLoading(false);
				return;
			}
			try {
				await loadFavorites();
			} catch (err) {
				console.warn("Failed to load favorites", err);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [loadFavorites, shouldDeferNetwork]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-0 bg-vibe-black z-10 pt-safe ",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-vibe-gold text-center",
					children: "favorites"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4",
			children: [(shouldDeferNetwork || lowDataActive) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 mb-4",
				children: [shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode — showing cached likes"]
				}), !shouldDeferNetwork && lowDataActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4" }), " low data mode pauses auto-refresh"]
				})]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[#888]",
				children: "loading…"
			}) : favorites.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-white",
				children: shouldDeferNetwork ? "favorites unavailable while offline" : "no favorites yet"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: favorites.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full flex items-center justify-between rounded-2xl border border-[#333] bg-[#111] p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => playTrack(track),
						className: "text-left flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-white font-semibold truncate",
							children: track.title || track.filename
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[#888] text-sm truncate",
							children: track.artist || "unknown artist"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							if (shouldDeferNetwork) return;
							toggleFavorite(track);
						},
						className: `rounded-full bg-[#1a1a1a] p-2 text-vibe-gold transition-colors ${shouldDeferNetwork ? "opacity-40 cursor-not-allowed" : "hover:bg-[#252525]"}`,
						"aria-label": "toggle favorite",
						disabled: shouldDeferNetwork,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-5 w-5" })
					})]
				}, track.id))
			})]
		})]
	});
}
//#endregion
export { Favorites as default };
