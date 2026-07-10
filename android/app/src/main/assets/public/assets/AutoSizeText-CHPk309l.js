import { F as require_jsx_runtime, I as require_react, R as __toESM, a as createPlaylist, c as downloadTrack, j as updateTrack, n as addTrackToPlaylist, p as getPlaylists, t as usePlayerStore, w as resolveMediaUrl } from "./store-CF1ZVsO4.js";
import { B as X, E as Plus, P as Trash2, S as Music, d as Heart, l as Download, p as ImageIcon, v as ListPlus, w as Pencil, x as MoreVertical, y as Loader2 } from "./DataSaverContext-JVn9PKBV.js";
import { t as ImageWithFallback } from "./ImageWithFallback-BHtvC2dU.js";
import { t as triggerImpact } from "./haptics-BGTWm9ug.js";
import { _ as useSensor, a as TrackActionSheet, c as rectSortingStrategy, d as DndContext, f as KeyboardSensor, g as closestCenter, l as sortableKeyboardCoordinates, m as PointerSensor, o as SortableContext, r as TrackEditModal, s as arrayMove, u as useSortable, v as useSensors, y as CSS } from "./index-DOkzJY4W.js";
//#region src/components/ContextMenu.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContextMenu({ x, y, track, onClose, onEdit, onAddToQueue, onDownload, onToggleFavorite, isFavorite, onRemoveFromPlaylist, onSearchCover, onAddToPlaylist, showRemoveOption = false }) {
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
							onAddToPlaylist?.(track);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "w-4 h-4 text-vibe-gold" }), "add to playlist"]
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
//#region src/components/AddToPlaylistModal.jsx
function AddToPlaylistModal({ track, isOpen, onClose, onAdded }) {
	const [playlists, setPlaylists] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [addingTo, setAddingTo] = (0, import_react.useState)(null);
	const [newPlaylistName, setNewPlaylistName] = (0, import_react.useState)("");
	const [showCreate, setShowCreate] = (0, import_react.useState)(false);
	const [creating, setCreating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		loadPlaylists();
	}, [isOpen]);
	const loadPlaylists = async () => {
		setLoading(true);
		try {
			setPlaylists((await getPlaylists()).data || []);
		} catch (err) {
			console.error("Failed to load playlists:", err);
		} finally {
			setLoading(false);
		}
	};
	const handleAdd = async (playlistId) => {
		if (!track?.id) return;
		setAddingTo(playlistId);
		triggerImpact("light");
		try {
			await addTrackToPlaylist(playlistId, track.id);
			onAdded?.(playlistId);
			onClose();
		} catch (err) {
			console.error("Failed to add track to playlist:", err);
			alert("failed to add track");
		} finally {
			setAddingTo(null);
		}
	};
	const handleCreateAndAdd = async () => {
		if (!newPlaylistName.trim() || !track?.id) return;
		setCreating(true);
		triggerImpact("light");
		try {
			const newPlaylist = (await createPlaylist({ name: newPlaylistName.trim() })).data;
			await addTrackToPlaylist(newPlaylist.id, track.id);
			onAdded?.(newPlaylist.id);
			onClose();
		} catch (err) {
			console.error("Failed to create playlist:", err);
			alert("failed to create playlist");
		} finally {
			setCreating(false);
		}
	};
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-[#121212] w-full max-w-sm rounded-3xl p-6 border border-[#333]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-vibe-gold lowercase",
						children: "add to playlist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-2 text-[#888] hover:text-white transition-colors",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
					})]
				}),
				track && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-[#888] mb-4 lowercase truncate",
					children: track.title || track.filename
				}),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-6 h-6 text-vibe-gold animate-spin" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 max-h-64 overflow-y-auto mb-4",
					children: [playlists.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[#888] text-sm text-center py-4 lowercase",
						children: "no playlists yet"
					}), playlists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => handleAdd(playlist.id),
						disabled: addingTo === playlist.id,
						className: "w-full flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-xl hover:bg-[#2a2a2a] transition-colors text-left disabled:opacity-50",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "w-5 h-5 text-vibe-gold" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white text-sm font-medium truncate lowercase",
									children: playlist.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[#888] text-xs lowercase",
									children: [playlist.track_count || 0, " tracks"]
								})]
							}),
							addingTo === playlist.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 text-vibe-gold animate-spin" })
						]
					}, playlist.id))]
				}), showCreate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: newPlaylistName,
						onChange: (e) => setNewPlaylistName(e.target.value),
						placeholder: "playlist name...",
						className: "flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#666] outline-none lowercase",
						autoFocus: true,
						onKeyDown: (e) => {
							if (e.key === "Enter") handleCreateAndAdd();
							if (e.key === "Escape") setShowCreate(false);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleCreateAndAdd,
						disabled: creating || !newPlaylistName.trim(),
						className: "w-12 h-12 bg-vibe-gold text-vibe-black rounded-xl flex items-center justify-center font-bold disabled:opacity-50",
						children: creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-5 h-5" })
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setShowCreate(true),
					className: "w-full py-3 text-vibe-gold hover:bg-[#1a1a1a] rounded-xl transition-colors text-sm font-medium lowercase flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" }), "create new playlist"]
				})] })
			]
		})
	});
}
//#endregion
//#region src/components/TrackList.jsx
function TrackItem({ track, showArtist, onPlay, onContextMenu, onLongPress, onEdit, isSortable, suppressTap, isFavorite, onToggleFavorite, onDownload, onAddToQueue, isDropTarget }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: String(track.id),
		disabled: !isSortable
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : void 0,
		opacity: isDragging ? .9 : 1,
		boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.5)" : void 0,
		outline: !isDragging && isDropTarget ? "2px solid #F6B012" : void 0,
		outlineOffset: !isDragging && isDropTarget ? "3px" : void 0,
		borderRadius: !isDragging && isDropTarget ? "14px" : void 0
	};
	const handleClick = (e) => {
		if (suppressTap || isDragging) return;
		if (touchHandledRef.current) {
			touchHandledRef.current = false;
			return;
		}
		onPlay(track);
	};
	const touchStartRef = (0, import_react.useRef)(null);
	const touchHandledRef = (0, import_react.useRef)(false);
	const handleTouchStartForTap = (e) => {
		const touch = e.touches[0];
		if (!touch) return;
		touchHandledRef.current = false;
		touchStartRef.current = {
			x: touch.clientX,
			y: touch.clientY,
			element: e.currentTarget,
			time: Date.now()
		};
	};
	const handleTouchEnd = (e) => {
		if (suppressTap || isDragging) return;
		const start = touchStartRef.current;
		if (!start) return;
		if (start.element !== e.currentTarget) {
			touchStartRef.current = null;
			return;
		}
		if (Date.now() - start.time > 500) {
			touchStartRef.current = null;
			return;
		}
		const touch = e.changedTouches?.[0];
		if (touch) {
			const dx = Math.abs(touch.clientX - start.x);
			const dy = Math.abs(touch.clientY - start.y);
			if (dx > 10 || dy > 10) {
				touchStartRef.current = null;
				return;
			}
		}
		touchStartRef.current = null;
		touchHandledRef.current = true;
		if (onPlay) onPlay(track);
	};
	const dragHandleProps = isSortable ? listeners : {};
	const rootProps = isSortable ? {
		ref: setNodeRef,
		style
	} : {};
	const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
	const effectiveDragHandleProps = isSortable && !isMobile ? dragHandleProps : {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		...rootProps,
		className: `group cursor-pointer transition-all duration-150 fade-in-stagger ${isDragging ? "scale-[1.03] rotate-[1deg] opacity-95 z-20" : isDropTarget ? "scale-[1.04]" : "scale-100"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: handleClick,
			onTouchStart: handleTouchStartForTap,
			onTouchEnd: handleTouchEnd,
			onContextMenu: (e) => {
				e.preventDefault();
				onContextMenu(e, track);
			},
			...effectiveDragHandleProps,
			style: { touchAction: "pan-y" },
			className: "relative aspect-square rounded-xl overflow-hidden bg-[#111] mb-2 select-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
				src: resolveMediaUrl(track.cover_art_url),
				alt: track.title || track.filename,
				fallbackText: track.title || track.filename,
				className: "w-full h-full object-cover",
				draggable: false
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-0 right-0 hidden md:flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							triggerImpact("light");
							onToggleFavorite?.(track);
						},
						className: "flex items-center justify-center rounded-full bg-black p-1.5 text-white hover:bg-[#222]",
						"aria-label": isFavorite ? "unfavorite" : "favorite",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							className: `w-3.5 h-3.5 ${isFavorite ? "text-vibe-gold" : ""}`,
							fill: isFavorite ? "currentColor" : "none"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							onDownload?.(track);
						},
						className: "flex items-center justify-center rounded-full bg-black p-1.5 text-white hover:bg-[#222]",
						"aria-label": "download",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-3.5 h-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							onEdit?.(track);
						},
						className: "flex items-center justify-center rounded-full bg-black p-1.5 text-white hover:bg-[#222]",
						"aria-label": "edit track",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreVertical, { className: "w-3.5 h-3.5" })
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-1 overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "text-white text-base font-medium mb-0.5 text-center whitespace-nowrap",
				children: track.title || track.filename
			}), showArtist && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[#888] text-sm text-center whitespace-nowrap",
				children: track.artist || "unknown"
			})]
		})]
	});
}
function TrackList({ tracks, showArtist = true, onTrackUpdated = null, sortable = false, onReorder = null, onContextMenu = null, onLongPress = null, gridCols = "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6" }) {
	const { playTrack } = usePlayerStore();
	const favorites = usePlayerStore((state) => state.favorites);
	const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);
	const addToQueue = usePlayerStore((state) => state.addToQueue);
	const favoriteIds = (0, import_react.useMemo)(() => {
		return new Set((favorites || []).map((t) => String(t.id)));
	}, [favorites]);
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
	const [editingTrack, setEditingTrack] = (0, import_react.useState)(null);
	const [showEdit, setShowEdit] = (0, import_react.useState)(false);
	const [actionTrack, setActionTrack] = (0, import_react.useState)(null);
	const [trackOverrides, setTrackOverrides] = (0, import_react.useState)({});
	const [localTracks, setLocalTracks] = (0, import_react.useState)(tracks || []);
	const [suppressTap, setSuppressTap] = (0, import_react.useState)(false);
	const [overId, setOverId] = (0, import_react.useState)(null);
	const [contextMenu, setContextMenu] = (0, import_react.useState)(null);
	const [addToPlaylistTrack, setAddToPlaylistTrack] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setLocalTracks(tracks || []);
	}, [tracks]);
	(0, import_react.useEffect)(() => {
		const ids = new Set((tracks || []).map((t) => String(t.id)));
		setTrackOverrides((prev) => {
			const next = {};
			for (const [id, track] of Object.entries(prev)) if (ids.has(String(id))) next[id] = track;
			return next;
		});
	}, [tracks]);
	const finalTracks = (0, import_react.useMemo)(() => {
		return localTracks.map((t) => trackOverrides[String(t.id)] || t);
	}, [localTracks, trackOverrides]);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const handleDragEnd = (event) => {
		setOverId(null);
		setSuppressTap(true);
		const { active, over } = event;
		if (over && active.id !== over.id) setLocalTracks((current) => {
			const reordered = arrayMove(current, current.findIndex((t) => String(t.id) === active.id), current.findIndex((t) => String(t.id) === over.id));
			if (onReorder) onReorder(reordered.map((t) => t.id));
			return reordered;
		});
		setTimeout(() => {
			setSuppressTap(false);
		}, 140);
	};
	const handleDragStart = () => {
		setSuppressTap(true);
	};
	const handleDragCancel = () => {
		setOverId(null);
		setTimeout(() => {
			setSuppressTap(false);
		}, 140);
	};
	const handlePlay = async (track) => {
		const trackIndex = finalTracks.findIndex((t) => t.id === track.id);
		const queueItems = finalTracks.map((t, index) => ({
			id: `queue-${t.id}-${index}`,
			track: t,
			position: index
		}));
		usePlayerStore.setState({
			queue: queueItems,
			currentQueueIndex: trackIndex
		});
		await playTrack(track, trackIndex);
	};
	const openTrackDetails = (track) => {
		setEditingTrack(track);
		setShowEdit(true);
	};
	const handleContextMenu = (e, track) => {
		if (onContextMenu) {
			onContextMenu(e, track);
			return;
		}
		e.preventDefault();
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			track
		});
	};
	const handleLongPress = (e, track) => {
		if (onLongPress) {
			onLongPress(e, track);
			return;
		}
		const rect = e.currentTarget.getBoundingClientRect();
		setContextMenu({
			x: rect.left + rect.width / 2,
			y: rect.top,
			track
		});
	};
	const saveTrack = async (data) => {
		if (!editingTrack) return;
		const res = await updateTrack(editingTrack.id, data);
		setEditingTrack(res.data);
		setTrackOverrides((prev) => ({
			...prev,
			[String(res.data.id)]: res.data
		}));
		if (onTrackUpdated) onTrackUpdated(res.data);
	};
	if (!finalTracks || finalTracks.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center py-12 text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-white/60 mb-4",
			children: "no tracks found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => window.location.reload(),
			className: "px-4 py-2 bg-vibe-gold text-vibe-black rounded-full text-sm font-semibold hover:bg-[#ffcc40] transition-colors",
			children: "refresh page"
		})]
	});
	const gridClassName = `grid ${gridCols} gap-3 md:gap-4`;
	const trackItems = finalTracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackItem, {
		track,
		showArtist,
		onPlay: handlePlay,
		onContextMenu: handleContextMenu,
		onLongPress: handleLongPress,
		onEdit: openTrackDetails,
		isSortable: sortable,
		suppressTap,
		isFavorite: favoriteIds.has(String(track.id)),
		onToggleFavorite: toggleFavorite,
		onDownload: handleDownload,
		onAddToQueue: addToQueue,
		isDropTarget: sortable && String(track.id) === overId
	}, track.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		sortable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
			sensors,
			collisionDetection: closestCenter,
			onDragStart: handleDragStart,
			onDragOver: ({ over }) => setOverId(over?.id ?? null),
			onDragEnd: handleDragEnd,
			onDragCancel: handleDragCancel,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
				items: finalTracks.map((t) => String(t.id)),
				strategy: rectSortingStrategy,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: gridClassName,
					children: trackItems
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: gridClassName,
			children: trackItems
		}),
		contextMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextMenu, {
			x: contextMenu.x,
			y: contextMenu.y,
			track: contextMenu.track,
			onClose: () => setContextMenu(null),
			onEdit: (track) => {
				openTrackDetails(track);
				setContextMenu(null);
			},
			onAddToQueue: (track) => {
				addToQueue(track);
				setContextMenu(null);
			},
			onDownload: handleDownload,
			onToggleFavorite: toggleFavorite,
			isFavorite: favoriteIds.has(String(contextMenu.track?.id)),
			onAddToPlaylist: (track) => {
				setAddToPlaylistTrack(track);
				setContextMenu(null);
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToPlaylistModal, {
			track: addToPlaylistTrack,
			isOpen: !!addToPlaylistTrack,
			onClose: () => setAddToPlaylistTrack(null),
			onAdded: () => {
				setAddToPlaylistTrack(null);
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActionSheet, {
			track: actionTrack,
			onClose: () => setActionTrack(null),
			onViewDetails: (track) => openTrackDetails(track)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackEditModal, {
			isOpen: showEdit,
			track: editingTrack,
			onClose: () => setShowEdit(false),
			onSave: saveTrack
		})
	] });
}
//#endregion
//#region src/components/AutoSizeText.jsx
function AutoSizeText({ text, maxSize = 20, minSize = 12, className = "", style = {} }) {
	const textRef = (0, import_react.useRef)(null);
	const containerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const fitText = () => {
			const el = textRef.current;
			const container = containerRef.current;
			if (!el || !container) return;
			el.style.fontSize = maxSize + "px";
			el.style.whiteSpace = "nowrap";
			el.offsetHeight;
			const containerWidth = container.clientWidth;
			const textWidth = el.scrollWidth;
			if (textWidth <= containerWidth) el.style.fontSize = maxSize + "px";
			else {
				const ratio = containerWidth / textWidth;
				const newSize = Math.max(minSize, Math.floor(maxSize * ratio));
				el.style.fontSize = newSize + "px";
			}
		};
		fitText();
		window.addEventListener("resize", fitText);
		return () => window.removeEventListener("resize", fitText);
	}, [
		text,
		maxSize,
		minSize
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: `overflow-hidden ${className}`,
		style,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			ref: textRef,
			className: "inline-block whitespace-nowrap",
			style: { fontSize: maxSize + "px" },
			children: text
		})
	});
}
//#endregion
export { ContextMenu as i, TrackList as n, AddToPlaylistModal as r, AutoSizeText as t };
