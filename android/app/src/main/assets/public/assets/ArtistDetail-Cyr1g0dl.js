import { F as require_jsx_runtime, I as require_react, R as __toESM, t as usePlayerStore, v as getTracks } from "./store-B1lyn0fi.js";
import { c as useParams, s as useNavigate } from "./dist-BoG_MAZs.js";
import { A as Shuffle, k as Search, r as ArrowLeft, y as Loader2 } from "./DataSaverContext-BoPuygQl.js";
import "./ImageWithFallback-Bn8n0AkE.js";
import "./haptics-BGTWm9ug.js";
import { n as TrackList, t as AutoSizeText } from "./AutoSizeText-C_kvbcYl.js";
//#region src/pages/ArtistDetail.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArtistDetail() {
	const { artist } = useParams();
	const navigate = useNavigate();
	const { playTrack } = usePlayerStore();
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const searchInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		loadArtistTracks();
	}, [artist]);
	const handleShufflePlay = async () => {
		if (!tracks || tracks.length === 0) return;
		const shuffled = [...tracks].sort(() => Math.random() - .5);
		const queueItems = shuffled.map((t, index) => ({
			id: `queue-${t.id}-${index}`,
			track: t,
			position: index
		}));
		usePlayerStore.setState({
			queue: queueItems,
			currentQueueIndex: 0
		});
		await playTrack(shuffled[0], 0);
	};
	const filteredTracks = (0, import_react.useMemo)(() => {
		if (!searchTerm.trim()) return tracks;
		const term = searchTerm.toLowerCase();
		return tracks.filter((track) => (track.title || track.filename || "").toLowerCase().includes(term) || (track.album || "").toLowerCase().includes(term));
	}, [tracks, searchTerm]);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.key === "f") {
				e.preventDefault();
				searchInputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);
	const loadArtistTracks = async () => {
		try {
			setLoading(true);
			const response = await getTracks({
				artist: decodeURIComponent(artist),
				limit: 500
			});
			setTracks(Array.isArray(response?.data) ? response.data : []);
		} catch (error) {
			console.error("Error loading artist tracks:", error);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-0 bg-vibe-black z-10 pt-safe",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => navigate(-1),
								className: "p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors inline-flex items-center gap-2 lowercase",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-5 h-5" }), "back"]
							}), tracks && tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleShufflePlay,
								className: "p-2 inline-flex items-center justify-center",
								"aria-label": "shuffle play",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5 text-[#f5af12]" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoSizeText, {
							text: decodeURIComponent(artist),
							maxSize: 24,
							minSize: 14,
							className: "text-vibe-gold font-bold mb-1"
						}),
						!loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-white/60",
							children: [tracks.length, " tracks"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: searchInputRef,
						type: "text",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						placeholder: "search tracks by this artist...",
						className: "w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
					})]
				}), searchTerm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-white/60 mt-2",
					children: [
						filteredTracks.length,
						" of ",
						tracks.length,
						" tracks match"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, {
					tracks: filteredTracks,
					showArtist: false
				})
			})
		]
	});
}
//#endregion
export { ArtistDetail as default };
