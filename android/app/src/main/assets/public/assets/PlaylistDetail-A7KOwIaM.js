import { C as reorderPlaylistTracks, F as require_jsx_runtime, I as require_react, R as __toESM, c as downloadTrack, f as getPlaylist, j as updateTrack, o as deletePlaylist, t as usePlayerStore, x as removeTrackFromPlaylist } from "./store-CF1ZVsO4.js";
import { c as useParams, s as useNavigate } from "./dist-DQ47giAv.js";
import { A as Shuffle, P as Trash2, k as Search, r as ArrowLeft, y as Loader2 } from "./DataSaverContext-JVn9PKBV.js";
import "./ImageWithFallback-BHtvC2dU.js";
import "./haptics-BGTWm9ug.js";
import { i as CoverSearchModal, r as TrackEditModal } from "./index-BQ5xvPba.js";
import { i as ContextMenu, n as TrackList, r as AddToPlaylistModal, t as AutoSizeText } from "./AutoSizeText-B_JBhkgT.js";
//#region src/pages/PlaylistDetail.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlaylistDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [playlist, setPlaylist] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [hasCustomTrackOrder, setHasCustomTrackOrder] = (0, import_react.useState)(false);
	const [contextMenu, setContextMenu] = (0, import_react.useState)(null);
	const [editingTrack, setEditingTrack] = (0, import_react.useState)(null);
	const [showEdit, setShowEdit] = (0, import_react.useState)(false);
	const [coverSearchTrack, setCoverSearchTrack] = (0, import_react.useState)(null);
	const [showCoverSearch, setShowCoverSearch] = (0, import_react.useState)(false);
	const [addToPlaylistTrack, setAddToPlaylistTrack] = (0, import_react.useState)(null);
	const { toggleFavorite, addToQueue, favorites, playTrack } = usePlayerStore();
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const searchInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		loadPlaylist();
	}, [id]);
	const filteredTracks = (0, import_react.useMemo)(() => {
		if (!playlist?.tracks) return [];
		if (!searchTerm.trim()) return playlist.tracks;
		const term = searchTerm.toLowerCase();
		return playlist.tracks.filter((track) => (track.title || track.filename || "").toLowerCase().includes(term) || (track.artist || "").toLowerCase().includes(term) || (track.album || "").toLowerCase().includes(term));
	}, [playlist, searchTerm]);
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
	const sortTracksByFilename = (tracks = []) => {
		return [...tracks].sort((a, b) => {
			const aName = (a.filename || a.title || "").toString().toLowerCase();
			const bName = (b.filename || b.title || "").toString().toLowerCase();
			if (aName < bName) return -1;
			if (aName > bName) return 1;
			return 0;
		});
	};
	const loadPlaylist = async () => {
		try {
			setLoading(true);
			const playlistData = (await getPlaylist(id)).data;
			if (playlistData?.tracks && !hasCustomTrackOrder) playlistData.tracks = sortTracksByFilename(playlistData.tracks);
			setPlaylist(playlistData);
		} catch (error) {
			console.error("Error loading playlist:", error);
		} finally {
			setLoading(false);
		}
	};
	const handleShufflePlay = async () => {
		if (!playlist?.tracks || playlist.tracks.length === 0) return;
		const shuffled = [...playlist.tracks].sort(() => Math.random() - .5);
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
	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this playlist?")) return;
		try {
			await deletePlaylist(id);
			navigate("/playlists");
		} catch (error) {
			console.error("Error deleting playlist:", error);
		}
	};
	const handleRemoveTrack = async (trackId) => {
		try {
			await removeTrackFromPlaylist(id, trackId);
			setPlaylist((prev) => {
				if (!prev) return prev;
				const filtered = (prev.tracks || []).filter((t) => t.id !== trackId);
				return {
					...prev,
					tracks: filtered
				};
			});
		} catch (error) {
			console.error("Error removing track:", error);
		}
	};
	const handleSearchCover = (track) => {
		setCoverSearchTrack(track);
		setShowCoverSearch(true);
	};
	const handleCoverApplied = (newCoverUrl) => {
		setPlaylist((prev) => {
			if (!prev) return prev;
			const updatedTracks = prev.tracks.map((t) => t.id === coverSearchTrack.id ? {
				...t,
				cover_art_url: newCoverUrl
			} : t);
			return {
				...prev,
				tracks: updatedTracks
			};
		});
	};
	const handleContextMenu = (e, track) => {
		e.preventDefault();
		e.stopPropagation();
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			track
		});
	};
	const handleLongPress = (e, track) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setContextMenu({
			x: rect.left + rect.width / 2,
			y: rect.top,
			track
		});
	};
	const handleDownload = async (track) => {
		if (!track?.id) return;
		try {
			const blob = (await downloadTrack(track.id)).data;
			const objectUrl = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = objectUrl;
			anchor.download = `${track.title || track.filename || "track"}.mp3`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(objectUrl);
		} catch (error) {
			console.error("Download failed", error);
		}
	};
	const saveTrack = async (data) => {
		if (!editingTrack) return;
		try {
			const res = await updateTrack(editingTrack.id, data);
			setEditingTrack(res.data);
			setPlaylist((prev) => {
				if (!prev) return prev;
				const updated = prev.tracks.map((t) => t.id === res.data.id ? {
					...t,
					...res.data
				} : t);
				return {
					...prev,
					tracks: updated
				};
			});
		} catch (err) {
			console.error("Error saving track:", err);
		}
	};
	const handleLocalReorder = async (orderedIds) => {
		setHasCustomTrackOrder(true);
		setPlaylist((prev) => {
			if (!prev || !Array.isArray(prev.tracks)) return prev;
			const idToTrack = new Map(prev.tracks.map((track) => [String(track.id), track]));
			const ordered = orderedIds.map((id) => idToTrack.get(String(id))).filter(Boolean);
			const remaining = prev.tracks.filter((track) => !orderedIds.includes(track.id));
			const nextTracks = [...ordered, ...remaining];
			return {
				...prev,
				tracks: nextTracks
			};
		});
		try {
			await reorderPlaylistTracks(id, orderedIds);
		} catch (error) {
			console.error("Error reordering playlist:", error);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black flex items-center justify-center pb-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
	});
	if (!playlist) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black flex items-center justify-center pb-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[#888] mb-4",
				children: "playlist not found"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => navigate("/playlists"),
				className: "px-6 py-3 rounded-2xl bg-vibe-gold text-vibe-black hover:bg-[#ffcc40] transition-colors lowercase",
				children: "back to playlists"
			})]
		})
	});
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
								text: playlist.name,
								maxSize: 20,
								minSize: 12,
								className: "text-center"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute right-0 flex items-center",
							children: [playlist.tracks && playlist.tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleShufflePlay,
								className: "p-0 -mr-4 inline-flex items-center justify-center shrink-0",
								"aria-label": "shuffle play",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5 text-[#f5af12]" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleDelete,
								className: "p-0 -ml-1 text-red-400 hover:text-red-300 transition-colors inline-flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-5 h-5" })
							})]
						})
					]
				}), playlist.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-[#888] mb-2 px-4",
					children: playlist.description
				})]
			}),
			playlist.tracks && playlist.tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: searchInputRef,
						type: "text",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						placeholder: "search tracks in this playlist...",
						className: "w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
					})]
				}), searchTerm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-white/60 mt-2",
					children: [
						filteredTracks.length,
						" of ",
						playlist.tracks.length,
						" tracks match"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4",
				children: !playlist.tracks || playlist.tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center py-12 text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "no tracks in this playlist" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[#888] text-sm mt-2",
						children: "add tracks from any view"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, {
					tracks: filteredTracks,
					sortable: !searchTerm,
					onReorder: !searchTerm ? handleLocalReorder : void 0,
					onContextMenu: handleContextMenu,
					onLongPress: handleLongPress
				})
			}),
			contextMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenu, {
				x: contextMenu.x,
				y: contextMenu.y,
				track: contextMenu.track,
				onClose: () => setContextMenu(null),
				onEdit: (track) => {
					setEditingTrack(track);
					setShowEdit(true);
				},
				onAddToQueue: addToQueue,
				onDownload: handleDownload,
				onToggleFavorite: toggleFavorite,
				isFavorite: favorites.some((f) => f.id === contextMenu.track?.id),
				onRemoveFromPlaylist: (track) => handleRemoveTrack(track.id),
				onSearchCover: handleSearchCover,
				onAddToPlaylist: (track) => setAddToPlaylistTrack(track),
				showRemoveOption: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToPlaylistModal, {
				track: addToPlaylistTrack,
				isOpen: !!addToPlaylistTrack,
				onClose: () => setAddToPlaylistTrack(null),
				onAdded: (playlistId) => {
					setAddToPlaylistTrack(null);
					if (String(playlistId) === String(id)) loadPlaylist();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverSearchModal, {
				track: coverSearchTrack,
				isOpen: showCoverSearch,
				onClose: () => setShowCoverSearch(false),
				onCoverApplied: handleCoverApplied
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackEditModal, {
				isOpen: showEdit,
				track: editingTrack,
				onClose: () => setShowEdit(false),
				onSave: saveTrack
			})
		]
	});
}
//#endregion
export { PlaylistDetail as default };
