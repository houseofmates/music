import { F as require_jsx_runtime, I as require_react, R as __toESM, d as getHistory, t as usePlayerStore } from "./store-CF1ZVsO4.js";
import { T as Play, V as Zap, n as useDataSaver, z as WifiOff } from "./DataSaverContext-JVn9PKBV.js";
//#region src/pages/History.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function History() {
	const { playTrack } = usePlayerStore();
	const [history, setHistory] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const load = async () => {
			setLoading(true);
			if (shouldDeferNetwork) {
				if (mounted) setLoading(false);
				return;
			}
			try {
				const res = await getHistory(100);
				if (!mounted) return;
				setHistory(Array.isArray(res) ? res : res.data || []);
			} catch (err) {
				console.error("Failed to load history", err);
				if (mounted) setHistory([]);
			} finally {
				if (mounted) setLoading(false);
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, [shouldDeferNetwork]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-0 bg-vibe-black z-10 pt-safe ",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-vibe-gold text-center",
					children: "listening history"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4",
			children: [(shouldDeferNetwork || lowDataActive) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 mb-4",
				children: [shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode — showing cached plays"]
				}), !shouldDeferNetwork && lowDataActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4" }), " low data mode pauses auto-refresh"]
				})]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[#888]",
				children: "loading…"
			}) : history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-white",
				children: shouldDeferNetwork ? "history unavailable while offline" : "no recent plays yet"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: history.filter((item) => item && item.track).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => playTrack(item.track),
					className: "w-full flex items-center justify-between rounded-2xl border border-[#333] bg-[#111] p-3 text-left hover:bg-[#1a1a1a]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-white font-semibold truncate",
						children: item.track.title || item.track.filename
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[#888] text-sm truncate",
						children: [
							item.track.artist || "unknown artist",
							" • ",
							new Date(item.played_at).toLocaleString()
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5 text-vibe-gold" })]
				}, item.id))
			})]
		})]
	});
}
//#endregion
export { History as default };
