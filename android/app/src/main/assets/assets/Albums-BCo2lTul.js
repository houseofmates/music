import { A as require_jsx_runtime, D as uploadAlbumCover, N as __toESM, b as resolveMediaUrl, g as mergeAlbums, j as require_react, o as getAlbums } from "./store-DiutPrSL.js";
import { s as useNavigate } from "./dist-CclwtIHd.js";
import { H as X, U as Zap, V as WifiOff, g as Layers3, i as Check, j as Search, n as useDataSaver, y as Loader2 } from "./DataSaverContext-CdWIg2hh.js";
import { t as ImageWithFallback } from "./ImageWithFallback-pWXsvhVu.js";
import { a as SortableContext, c as sortableKeyboardCoordinates, d as KeyboardSensor, f as PointerSensor, g as CSS, h as useSensors, l as useSortable, m as useSensor, o as arrayMove, p as closestCenter, s as rectSortingStrategy, u as DndContext } from "./index-BN93Sjve.js";
import { t as truncateText } from "./text-umVwu9ru.js";
//#region src/components/AlbumEditModal.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AlbumEditModal({ isOpen, albumData, onClose, onSave }) {
	const [album, setAlbum] = (0, import_react.useState)("");
	const [artist, setArtist] = (0, import_react.useState)("");
	const [cover, setCover] = (0, import_react.useState)("");
	const [coverFile, setCoverFile] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (albumData) {
			setAlbum(albumData.album || "");
			setArtist(albumData.artist || "");
			setCover(albumData.cover_art_url || "");
		}
	}, [albumData]);
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		setCoverFile(file);
		const reader = new FileReader();
		reader.onload = () => {
			setCover(reader.result);
		};
		reader.readAsDataURL(file);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			await onSave({
				album,
				artist,
				cover_art_url: cover,
				coverFile
			});
			onClose();
		} catch (err) {
			console.error("Error saving album:", err);
		} finally {
			setSaving(false);
		}
	};
	if (!isOpen || !albumData) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-[#050505] flex items-center justify-center z-50 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-[#050505] rounded-3xl p-6 w-full max-w-md border-2 border-[#ffbb20]",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-bold text-vibe-gold mb-4 lowercase",
				children: "edit album"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-white/60 text-sm mb-2 block lowercase",
							children: "album"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: album,
							onChange: (e) => setAlbum(e.target.value),
							className: "w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-white/60 text-sm mb-2 block lowercase",
							children: "artist"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: artist,
							onChange: (e) => setArtist(e.target.value),
							className: "w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-white/60 text-sm mb-2 block lowercase",
								children: "cover image"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								onChange: handleFileChange,
								className: "w-full text-white"
							}),
							cover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: cover,
									alt: "cover",
									className: "w-24 h-24 rounded-xl object-cover"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "flex-1 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors lowercase",
							disabled: saving,
							children: "cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "flex-1 py-3 rounded-2xl bg-vibe-gold text-vibe-black hover:bg-vibe-gold/90 transition-colors font-semibold disabled:opacity-50",
							disabled: saving,
							children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-5 h-5 animate-spin mx-auto" }) : "save"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/pages/Albums.jsx
var LS_KEY = "music_albums_order";
function albumKey(album) {
	return `${album.album}||${album.artist}`;
}
function SortableAlbumCard({ album, albumKey: key, onEdit, onOpen, suppressTap, selectionMode, isSelected, onToggleSelection, isDropTarget }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: key,
		disabled: selectionMode
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : void 0,
		opacity: isDragging ? .85 : 1,
		outline: !isDragging && isDropTarget ? "2px solid #F6B012" : void 0,
		outlineOffset: !isDragging && isDropTarget ? "3px" : void 0,
		borderRadius: !isDragging && isDropTarget ? "18px" : void 0
	};
	const albumData = {
		album: album.album,
		artist: album.artist,
		cover_art_url: album.cover_art_url
	};
	const handleOpen = (event) => {
		if (selectionMode) {
			event?.preventDefault?.();
			onToggleSelection(albumData);
			return;
		}
		if (suppressTap || isDragging) {
			event?.preventDefault?.();
			return;
		}
		onOpen(albumData);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style: {
			...style,
			touchAction: "pan-y"
		},
		className: `relative select-none cursor-grab active:cursor-grabbing ${isDragging ? "scale-[1.02] rotate-[1deg] opacity-95" : isDropTarget ? "scale-[1.04]" : "scale-100"}`,
		onClick: handleOpen,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleOpen(e);
			}
		},
		onContextMenu: (e) => {
			e.preventDefault();
			if (selectionMode) onToggleSelection(albumData);
			else onEdit(albumData, e);
		},
		role: "button",
		tabIndex: 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333] relative select-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
					src: resolveMediaUrl(album.cover_art_url),
					alt: album.album,
					fallbackText: album.album,
					className: "w-full h-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 pointer-events-none",
					children: album.year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-2 left-2 flex items-center text-[10px] gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-white font-medium",
							children: album.year
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm text-white font-semibold text-center leading-tight",
					style: {
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						wordBreak: "break-word"
					},
					children: album.album
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-white/60 truncate text-center",
					children: truncateText(album.artist || "unknown artist", 30)
				})]
			}),
			selectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white",
				children: isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-vibe-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3.5 w-3.5 rounded-full border border-[#888]" })
			})
		]
	});
}
function Albums() {
	const navigate = useNavigate();
	const [albums, setAlbums] = (0, import_react.useState)([]);
	const [sortedAlbums, setSortedAlbums] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [editingAlbum, setEditingAlbum] = (0, import_react.useState)(null);
	const [showAlbumEdit, setShowAlbumEdit] = (0, import_react.useState)(false);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [suppressAlbumTap, setSuppressAlbumTap] = (0, import_react.useState)(false);
	const [albumOverId, setAlbumOverId] = (0, import_react.useState)(null);
	const [selectionMode, setSelectionMode] = (0, import_react.useState)(false);
	const [selectedAlbumKeys, setSelectedAlbumKeys] = (0, import_react.useState)([]);
	const [showMergeModal, setShowMergeModal] = (0, import_react.useState)(false);
	const [mergeTargetAlbum, setMergeTargetAlbum] = (0, import_react.useState)("");
	const [mergeTargetArtist, setMergeTargetArtist] = (0, import_react.useState)("");
	const [merging, setMerging] = (0, import_react.useState)(false);
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const loadAlbums = (0, import_react.useCallback)(async () => {
		if (shouldDeferNetwork) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			const response = await getAlbums();
			const fetched = Array.isArray(response?.data) ? response.data : [];
			setAlbums(fetched);
			try {
				const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
				if (saved.length > 0) {
					const fetchedKeys = new Set(fetched.map(albumKey));
					const validSaved = saved.filter((k) => fetchedKeys.has(k));
					if (validSaved.length !== saved.length) {
						localStorage.removeItem(LS_KEY);
						setSortedAlbums(fetched);
					} else {
						const keyToAlbum = Object.fromEntries(fetched.map((a) => [albumKey(a), a]));
						const ordered = validSaved.map((k) => keyToAlbum[k]).filter(Boolean);
						const remaining = fetched.filter((a) => !validSaved.includes(albumKey(a)));
						setSortedAlbums([...ordered, ...remaining]);
					}
				} else setSortedAlbums(fetched);
			} catch {
				localStorage.removeItem(LS_KEY);
				setSortedAlbums(fetched);
			}
		} catch (error) {
			console.error("Error loading albums:", error);
			setAlbums([]);
			setSortedAlbums([]);
		} finally {
			setLoading(false);
		}
	}, [shouldDeferNetwork]);
	(0, import_react.useEffect)(() => {
		loadAlbums();
	}, [loadAlbums]);
	const handleDragEnd = (event) => {
		setAlbumOverId(null);
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const reordered = arrayMove(sortedAlbums, sortedAlbums.findIndex((a) => albumKey(a) === active.id), sortedAlbums.findIndex((a) => albumKey(a) === over.id));
			setSortedAlbums(reordered);
			localStorage.setItem(LS_KEY, JSON.stringify(reordered.map(albumKey)));
		}
		setTimeout(() => {
			setSuppressAlbumTap(false);
		}, 140);
	};
	const handleDragStart = () => {
		setSuppressAlbumTap(true);
	};
	const handleDragCancel = () => {
		setAlbumOverId(null);
		setTimeout(() => {
			setSuppressAlbumTap(false);
		}, 140);
	};
	const handleEditAlbumClick = (albumData, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (shouldDeferNetwork) return;
		setEditingAlbum(albumData);
		setShowAlbumEdit(true);
	};
	const handleSaveAlbum = async (data) => {
		if (!editingAlbum) return;
		if (shouldDeferNetwork) return;
		try {
			if (data.coverFile) await uploadAlbumCover(editingAlbum.album, editingAlbum.artist, data.coverFile);
			setEditingAlbum(null);
			setShowAlbumEdit(false);
			loadAlbums();
		} catch (err) {
			console.error("Error saving album data:", err);
		}
	};
	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredAlbums = sortedAlbums.filter((album) => `${album.album} ${album.artist}`.toLowerCase().includes(normalizedSearch));
	const selectedAlbums = filteredAlbums.filter((album) => selectedAlbumKeys.includes(albumKey(album)));
	const handleOpenAlbum = (albumData) => {
		navigate(`/albums/${encodeURIComponent(albumData.album)}?artist=${encodeURIComponent(albumData.artist)}`);
	};
	const toggleSelectionMode = () => {
		setSelectionMode((prev) => {
			const next = !prev;
			if (!next) setSelectedAlbumKeys([]);
			return next;
		});
	};
	const toggleAlbumSelection = (albumData) => {
		const key = albumKey(albumData);
		setSelectedAlbumKeys((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
	};
	const openMergeModal = () => {
		if (selectedAlbums.length < 2 || shouldDeferNetwork) return;
		setMergeTargetAlbum(selectedAlbums[0]?.album || "");
		setMergeTargetArtist(selectedAlbums[0]?.artist || "");
		setShowMergeModal(true);
	};
	const handleMergeSelectedAlbums = async (e) => {
		e.preventDefault();
		if (selectedAlbums.length < 2 || !mergeTargetAlbum.trim() || shouldDeferNetwork) return;
		try {
			setMerging(true);
			await mergeAlbums({
				source_albums: selectedAlbums.map((album) => ({
					album: album.album,
					artist: album.artist
				})),
				target_album: mergeTargetAlbum.trim(),
				target_artist: mergeTargetArtist.trim() || null
			});
			setShowMergeModal(false);
			setSelectionMode(false);
			setSelectedAlbumKeys([]);
			await loadAlbums();
		} catch (error) {
			console.error("Error merging albums:", error);
		} finally {
			setMerging(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-0 bg-vibe-black z-10 pt-safe ",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold text-vibe-gold mb-1 text-center",
						children: "albums"
					}),
					!loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-white",
							children: [
								filteredAlbums.length,
								normalizedSearch ? ` of ${albums.length}` : "",
								" albums"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-red-200 -mt-2 mb-2 flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode pauses album changes"]
								}),
								selectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: openMergeModal,
									disabled: selectedAlbums.length < 2 || shouldDeferNetwork,
									className: "rounded-xl bg-vibe-gold px-3 py-2 text-sm font-medium text-vibe-black transition-colors disabled:cursor-not-allowed disabled:opacity-40",
									children: "merge selected"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										if (shouldDeferNetwork) return;
										toggleSelectionMode();
									},
									className: `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${selectionMode ? "bg-[#1a1a1a] text-white" : "bg-[#111] text-[#9b9b9b] hover:bg-[#1a1a1a]"} ${shouldDeferNetwork ? "opacity-40 cursor-not-allowed" : ""}`,
									disabled: shouldDeferNetwork,
									children: [selectionMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers3, { className: "h-4 w-4" }), selectionMode ? "cancel" : "combine albums"]
								})
							]
						})]
					}),
					shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-red-200 -mt-2 mb-2 flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode pauses album changes"]
					}),
					!shouldDeferNetwork && lowDataActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-yellow-200 -mt-2 mb-2 flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4" }), " low data mode may delay cover refresh"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value),
							placeholder: "search albums or artists",
							className: "w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 border-transparent focus:border-[#ffbb20] focus:outline-none"
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 flex-1 overflow-y-auto pb-32",
			style: { WebkitOverflowScrolling: "touch" },
			children: [
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
				}) : filteredAlbums.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center py-12 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "no albums match your search" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
					sensors,
					collisionDetection: closestCenter,
					onDragStart: handleDragStart,
					onDragOver: ({ over }) => setAlbumOverId(over?.id ?? null),
					onDragEnd: handleDragEnd,
					onDragCancel: handleDragCancel,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
						items: filteredAlbums.map(albumKey),
						strategy: rectSortingStrategy,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-4",
							children: filteredAlbums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableAlbumCard, {
								album,
								albumKey: albumKey(album),
								onOpen: handleOpenAlbum,
								onEdit: handleEditAlbumClick,
								suppressTap: suppressAlbumTap,
								selectionMode,
								isSelected: selectedAlbumKeys.includes(albumKey(album)),
								onToggleSelection: toggleAlbumSelection,
								isDropTarget: albumKey(album) === albumOverId
							}, albumKey(album)))
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumEditModal, {
					isOpen: showAlbumEdit,
					albumData: editingAlbum,
					onClose: () => {
						setShowAlbumEdit(false);
						setEditingAlbum(null);
					},
					onSave: handleSaveAlbum
				}),
				showMergeModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixed inset-0 z-50 flex items-center justify-center bg-black p-4",
					onClick: () => setShowMergeModal(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-md rounded-3xl border-2 border-vibe-gold bg-vibe-black p-6",
						onClick: (e) => e.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-2 text-2xl font-bold text-vibe-gold",
								children: "merge albums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-4 text-sm text-[#888]",
								children: [
									"combining ",
									selectedAlbums.length,
									" album groups into one album"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleMergeSelectedAlbums,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-2 block text-sm text-[#888]",
											children: "target album name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: mergeTargetAlbum,
											onChange: (e) => setMergeTargetAlbum(e.target.value),
											className: "w-full rounded-2xl border-2 border-transparent bg-[#1a1a1a] px-4 py-3 text-white focus:border-vibe-gold focus:outline-none"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-2 block text-sm text-[#888]",
											children: "target album artist"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: mergeTargetArtist,
											onChange: (e) => setMergeTargetArtist(e.target.value),
											placeholder: "main album artist",
											className: "w-full rounded-2xl border-2 border-transparent bg-[#1a1a1a] px-4 py-3 text-white placeholder:text-[#666] focus:border-vibe-gold focus:outline-none"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mb-5 rounded-2xl bg-[#111] p-3 text-sm text-white",
										children: selectedAlbums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "truncate",
											children: [
												album.album,
												" • ",
												album.artist
											]
										}, albumKey(album)))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowMergeModal(false),
											className: "flex-1 rounded-2xl bg-[#1a1a1a] py-3 text-white hover:bg-[#252525]",
											disabled: merging,
											children: "cancel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "submit",
											className: "flex-1 rounded-2xl bg-vibe-gold py-3 font-semibold text-vibe-black hover:bg-[#ffcc40] disabled:opacity-50",
											disabled: merging || selectedAlbums.length < 2 || !mergeTargetAlbum.trim(),
											children: merging ? "merging..." : "merge"
										})]
									})
								]
							})
						]
					})
				})
			]
		})]
	});
}
//#endregion
export { Albums as default };
