import { F as require_jsx_runtime, I as require_react, R as __toESM, t as usePlayerStore, v as getTracks } from "./store-CF1ZVsO4.js";
import { c as useParams, r as useSearchParams, s as useNavigate } from "./dist-DQ47giAv.js";
import { A as Shuffle, k as Search, r as ArrowLeft, y as Loader2 } from "./DataSaverContext-JVn9PKBV.js";
import "./ImageWithFallback-BHtvC2dU.js";
import "./haptics-BGTWm9ug.js";
import { n as TrackList, t as AutoSizeText } from "./AutoSizeText-B_JBhkgT.js";
//#region src/pages/AlbumDetail.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function bannerPositionStorageKey(albumName, artistName) {
	return `music_album_banner_position_${albumName}_${artistName || ""}`;
}
function AlbumDetail() {
	const { album } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const artist = searchParams.get("artist");
	const { playTrack } = usePlayerStore();
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [albumArt, setAlbumArt] = (0, import_react.useState)(null);
	const [uploadingCover, setUploadingCover] = (0, import_react.useState)(false);
	const [bannerPosition, setBannerPosition] = (0, import_react.useState)({
		x: 50,
		y: 50
	});
	const [isAdjustingBanner, setIsAdjustingBanner] = (0, import_react.useState)(false);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const searchInputRef = (0, import_react.useRef)(null);
	const bannerDragStateRef = (0, import_react.useRef)(null);
	const decodedAlbum = (0, import_react.useMemo)(() => decodeURIComponent(album), [album]);
	const decodedArtist = (0, import_react.useMemo)(() => artist ? decodeURIComponent(artist) : "", [artist]);
	const bannerStorageKey = (0, import_react.useMemo)(() => bannerPositionStorageKey(decodedAlbum, decodedArtist), [decodedAlbum, decodedArtist]);
	(0, import_react.useEffect)(() => {
		loadAlbumTracks();
	}, [album, artist]);
	(0, import_react.useEffect)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(bannerStorageKey) || "{}");
			setBannerPosition({
				x: typeof saved.x === "number" ? clamp(saved.x, 0, 100) : 50,
				y: typeof saved.y === "number" ? clamp(saved.y, 0, 100) : 50
			});
		} catch {
			setBannerPosition({
				x: 50,
				y: 50
			});
		}
	}, [bannerStorageKey]);
	(0, import_react.useEffect)(() => {
		localStorage.setItem(bannerStorageKey, JSON.stringify(bannerPosition));
	}, [bannerPosition, bannerStorageKey]);
	const loadAlbumTracks = async () => {
		try {
			setLoading(true);
			const params = {
				album: decodedAlbum,
				limit: 500
			};
			if (artist) params.artist = decodedArtist;
			const response = await getTracks(params);
			const albumTracks = Array.isArray(response?.data) ? response.data : [];
			albumTracks.sort((a, b) => {
				if (a.track_number && b.track_number) return a.track_number - b.track_number;
				return 0;
			});
			try {
				const lsKey = `music_album_track_order_${decodeURIComponent(album)}_${artist ? decodeURIComponent(artist) : ""}`;
				const saved = JSON.parse(localStorage.getItem(lsKey) || "[]");
				if (saved.length > 0) {
					const idToTrack = Object.fromEntries(albumTracks.map((t) => [t.id, t]));
					const ordered = saved.filter((id) => idToTrack[id]).map((id) => idToTrack[id]);
					const rest = albumTracks.filter((t) => !saved.includes(t.id));
					setTracks([...ordered, ...rest]);
				} else setTracks(albumTracks);
			} catch {
				setTracks(albumTracks);
			}
			if (albumTracks.length > 0 && albumTracks[0].cover_art_url) setAlbumArt(albumTracks[0].cover_art_url);
		} catch (error) {
			console.error("Error loading album tracks:", error);
		} finally {
			setLoading(false);
		}
	};
	const updateBannerPositionFromPointer = (clientX, clientY) => {
		const dragState = bannerDragStateRef.current;
		if (!dragState) return;
		const { rect, startX, startY, originX, originY } = dragState;
		const deltaXPercent = (clientX - startX) / Math.max(rect.width, 1) * 100;
		const deltaYPercent = (clientY - startY) / Math.max(rect.height, 1) * 100;
		setBannerPosition({
			x: clamp(originX - deltaXPercent, 0, 100),
			y: clamp(originY - deltaYPercent, 0, 100)
		});
	};
	const endBannerAdjustment = () => {
		bannerDragStateRef.current = null;
		window.removeEventListener("pointermove", handleWindowPointerMove);
		window.removeEventListener("pointerup", handleWindowPointerUp);
	};
	const handleWindowPointerMove = (event) => {
		updateBannerPositionFromPointer(event.clientX, event.clientY);
	};
	const handleWindowPointerUp = () => {
		endBannerAdjustment();
	};
	const filteredTracks = (0, import_react.useMemo)(() => {
		if (!searchTerm.trim()) return tracks;
		const term = searchTerm.toLowerCase();
		return tracks.filter((track) => (track.title || track.filename || "").toLowerCase().includes(term) || (track.artist || "").toLowerCase().includes(term));
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
	(0, import_react.useEffect)(() => () => endBannerAdjustment(), []);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 bg-vibe-black z-10 pt-safe",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-center justify-center px-4 py-3",
					style: { minHeight: "44px" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => navigate(-1),
							className: "absolute left-4 p-2 text-white hover:text-vibe-gold transition-colors",
							"aria-label": "Go back",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center pointer-events-none px-20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoSizeText, {
								text: decodedAlbum,
								maxSize: 20,
								minSize: 12,
								className: "text-center"
							})
						}),
						tracks && tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleShufflePlay,
							className: "absolute right-4 p-2 inline-flex items-center justify-center shrink-0",
							"aria-label": "shuffle play",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5 text-[#f5af12]" })
						})
					]
				}), artist && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm text-vibe-gold pb-2",
					children: decodedArtist
				})]
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
						placeholder: "search tracks in this album...",
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
					showAlbum: false,
					showArtist: false,
					sortable: !searchTerm,
					onReorder: !searchTerm ? (orderedIds) => {
						const idToTrack = new Map(tracks.map((t) => [String(t.id), t]));
						setTracks(orderedIds.map((id) => idToTrack.get(String(id))).filter(Boolean));
						const lsKey = `music_album_track_order_${decodeURIComponent(album)}_${artist ? decodeURIComponent(artist) : ""}`;
						localStorage.setItem(lsKey, JSON.stringify(orderedIds));
					} : void 0
				})
			})
		]
	});
}
//#endregion
export { AlbumDetail as default };
