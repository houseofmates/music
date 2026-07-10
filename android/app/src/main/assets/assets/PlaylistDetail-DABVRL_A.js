import { A as require_jsx_runtime, E as updateTrack, N as __toESM, _ as removeTrackFromPlaylist, a as downloadTrack, i as deletePlaylist, j as require_react, l as getPlaylist, t as usePlayerStore, y as reorderPlaylistTracks } from "./store-DiutPrSL.js";
import { c as useParams, s as useNavigate } from "./dist-CclwtIHd.js";
import { H as X, I as Trash2, M as Shuffle, T as Pencil, c as Download, d as Heart, j as Search, p as ImageIcon, r as ArrowLeft, v as ListPlus, y as Loader2 } from "./DataSaverContext-CdWIg2hh.js";
import "./ImageWithFallback-pWXsvhVu.js";
import { n as TrackEditModal, r as CoverSearchModal } from "./index-BN93Sjve.js";
import { n as TrackList, t as AutoSizeText } from "./AutoSizeText-B5atnw5D.js";
//#region src/components/ContextMenu.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContextMenu({ x, y, track, onClose, onEdit, onAddToQueue, onDownload, onToggleFavorite, isFavorite, onRemoveFromPlaylist, onSearchCover, showRemoveOption = false }) {
	const menuRef = (0, import_react.useRef)(null);
	const [position, setPosition] = (0, import_react.useState)({
		x,
		y
	});
	(0, import_react.useEffect)(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
		};
		const handleEsc = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [onClose]);
	(0, import_react.useEffect)(() => {
		if (!menuRef.current) return;
		const rect = menuRef.current.getBoundingClientRect();
		const menuHeight = rect.height;
		const menuWidth = rect.width;
		const windowHeight = window.innerHeight;
		const windowWidth = window.innerWidth;
		let adjustedX = x;
		let adjustedY = y;
		if (y + menuHeight > windowHeight) {
			adjustedY = y - menuHeight;
			if (adjustedY < 0) adjustedY = 10;
		}
		if (x + menuWidth > windowWidth) adjustedX = windowWidth - menuWidth - 10;
		if (adjustedX < 10) adjustedX = 10;
		setPosition({
			x: adjustedX,
			y: adjustedY
		});
	}, [x, y]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40",
		onClick: onClose
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: menuRef,
		className: "fixed z-50 rounded-xl shadow-2xl py-2 min-w-[180px] animate-in fade-in zoom-in-95 duration-100",
		style: {
			left: position.x,
			top: position.y,
			backgroundColor: "#050505",
			border: "1px solid #333"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3 py-2 border-b border-[#333] mb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white text-sm font-medium truncate max-w-[200px] lowercase",
					children: (track?.title || track?.filename || "").toLowerCase()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[#888] text-xs truncate max-w-[200px] lowercase",
					children: (track?.artist || "unknown artist").toLowerCase()
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onEdit?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-4 h-4 text-vibe-gold" }), "edit details"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onToggleFavorite?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `w-4 h-4 ${isFavorite ? "text-vibe-gold fill-vibe-gold" : "text-vibe-gold"}` }), isFavorite ? "remove from favorites" : "add to favorites"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onAddToQueue?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "w-4 h-4 text-vibe-gold" }), "add to queue"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onDownload?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-4 h-4 text-vibe-gold" }), "download"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onSearchCover?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageIcon, { className: "w-4 h-4 text-vibe-gold" }), "search cover"]
					}),
					showRemoveOption && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-[#333] my-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onRemoveFromPlaylist?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-red-400 hover:bg-red-900 flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-4 h-4" }), "remove from playlist"]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-[#333] mt-1 pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onClose,
					"aria-label": "cancel",
					className: "w-full px-3 py-2 text-left text-[#888] hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" }), "cancel"]
				})
			})
		]
	})] });
}
//#endregion
//#region src/pages/PlaylistDetail.jsx
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => navigate(-1),
							className: "absolute left-4 p-2 rounded-xl bg-[#111] text-white hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-1 lowercase shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-5 h-5" }), "back"]
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
							className: "absolute right-4 flex items-center gap-2",
							children: [playlist.tracks && playlist.tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleShufflePlay,
								className: "p-2 inline-flex items-center justify-center shrink-0",
								"aria-label": "shuffle play",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5 text-[#f5af12]" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleDelete,
								className: "p-2 rounded-xl bg-[#2a1515] text-red-400 hover:bg-[#3a2020] transition-colors inline-flex items-center justify-center shrink-0",
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
						className: "w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 border-transparent focus:border-[#ffbb20] focus:outline-none"
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
				showRemoveOption: true
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
