import { A as require_jsx_runtime, E as updateTrack, N as __toESM, a as downloadTrack, b as resolveMediaUrl, j as require_react, t as usePlayerStore } from "./store-DiutPrSL.js";
import { c as Download, d as Heart, x as MoreVertical } from "./DataSaverContext-CdWIg2hh.js";
import { t as ImageWithFallback } from "./ImageWithFallback-pWXsvhVu.js";
import { a as SortableContext, c as sortableKeyboardCoordinates, d as KeyboardSensor, f as PointerSensor, g as CSS, h as useSensors, i as TrackActionSheet, l as useSortable, m as useSensor, n as TrackEditModal, o as arrayMove, p as closestCenter, s as rectSortingStrategy, u as DndContext } from "./index-BN93Sjve.js";
//#region src/components/TrackList.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
		onPlay(track);
	};
	const touchStartRef = (0, import_react.useRef)(null);
	const handleTouchStartForTap = (e) => {
		const touch = e.touches[0];
		if (!touch) return;
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
		if (onContextMenu) onContextMenu(e, track);
		else {
			setEditingTrack(track);
			setShowEdit(true);
		}
	};
	const handleLongPress = (e, track) => {
		if (onLongPress) onLongPress(e, track);
		else {
			setEditingTrack(track);
			setShowEdit(true);
		}
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
export { TrackList as n, AutoSizeText as t };
