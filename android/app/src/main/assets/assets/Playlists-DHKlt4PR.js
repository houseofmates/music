import { A as require_jsx_runtime, N as __toESM, T as updatePlaylist, b as resolveMediaUrl, i as deletePlaylist, j as require_react, r as createPlaylist, u as getPlaylists } from "./store-DiutPrSL.js";
import { s as useNavigate } from "./dist-CclwtIHd.js";
import { C as Music, D as Plus, H as X, I as Trash2, L as Type, V as WifiOff, j as Search, n as useDataSaver, p as ImageIcon, y as Loader2 } from "./DataSaverContext-CdWIg2hh.js";
import { t as ImageWithFallback } from "./ImageWithFallback-pWXsvhVu.js";
import { a as SortableContext, c as sortableKeyboardCoordinates, d as KeyboardSensor, f as PointerSensor, g as CSS, h as useSensors, l as useSortable, m as useSensor, o as arrayMove, p as closestCenter, s as rectSortingStrategy, u as DndContext } from "./index-BN93Sjve.js";
import { t as truncateText } from "./text-umVwu9ru.js";
//#region src/components/PlaylistContextMenu.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlaylistContextMenu({ x, y, playlist, onClose, onEditName, onEditCover, onDelete }) {
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
					children: (playlist?.name || "").toLowerCase()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[#888] text-xs truncate max-w-[200px] lowercase",
					children: [
						playlist?.track_count || 0,
						" ",
						playlist?.track_count === 1 ? "track" : "tracks"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onEditName?.(playlist);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "w-4 h-4 text-vibe-gold" }), "edit name"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onEditCover?.(playlist);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-white hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageIcon, { className: "w-4 h-4 text-vibe-gold" }), "change cover"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-[#333] my-1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onDelete?.(playlist);
							onClose();
						},
						className: "w-full px-3 py-2 text-left text-red-400 hover:bg-red-900 flex items-center gap-2 text-sm transition-colors lowercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-4 h-4" }), "delete playlist"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-[#333] mt-1 pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onClose,
					className: "w-full px-3 py-2 text-left text-[#888] hover:bg-[#1a1a1a] flex items-center gap-2 text-sm transition-colors lowercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" }), "cancel"]
				})
			})
		]
	})] });
}
//#endregion
//#region src/pages/Playlists.jsx
var LS_KEY = "music_playlists_order";
function sortPlaylistsAlphabetically(playlists = []) {
	return [...playlists].sort((a, b) => {
		const nameA = (a.name || "").toString().toLowerCase();
		const nameB = (b.name || "").toString().toLowerCase();
		if (nameA < nameB) return -1;
		if (nameA > nameB) return 1;
		return 0;
	});
}
function SortablePlaylistCard({ playlist, onOpen, onEdit, suppressTap, isDropTarget }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(playlist.id) });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : void 0,
		opacity: isDragging ? .85 : 1,
		outline: !isDragging && isDropTarget ? "2px solid #F6B012" : void 0,
		outlineOffset: !isDragging && isDropTarget ? "3px" : void 0,
		borderRadius: !isDragging && isDropTarget ? "18px" : void 0
	};
	const handleOpen = (event) => {
		if (suppressTap || isDragging) {
			event?.preventDefault?.();
			return;
		}
		onOpen(playlist.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style: {
			...style,
			touchAction: "pan-y"
		},
		className: `cursor-grab active:cursor-grabbing transition-all duration-150 ${isDragging ? "scale-[1.02] rotate-[1deg] opacity-95" : isDropTarget ? "scale-[1.04]" : "scale-100"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...attributes,
			...listeners,
			onClick: handleOpen,
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleOpen(e);
				}
			},
			onContextMenu: (e) => {
				e.preventDefault();
				onEdit(playlist, e);
			},
			role: "button",
			tabIndex: 0,
			className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333] relative select-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
				src: resolveMediaUrl(playlist.cover_image),
				alt: playlist.name,
				fallbackText: playlist.name,
				className: "w-full h-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 pointer-events-none" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
				children: playlist.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-white/60 truncate text-center",
				children: truncateText(playlist.description || "playlist", 30)
			})]
		})]
	});
}
function Playlists() {
	const [playlists, setPlaylists] = (0, import_react.useState)([]);
	const [sortedPlaylists, setSortedPlaylists] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showCreateModal, setShowCreateModal] = (0, import_react.useState)(false);
	const [showEditModal, setShowEditModal] = (0, import_react.useState)(false);
	const [editingPlaylist, setEditingPlaylist] = (0, import_react.useState)(null);
	const [editName, setEditName] = (0, import_react.useState)("");
	const [editFolderPath, setEditFolderPath] = (0, import_react.useState)("");
	const [editCoverImage, setEditCoverImage] = (0, import_react.useState)("");
	const [editCoverSource, setEditCoverSource] = (0, import_react.useState)("url");
	const [newPlaylistName, setNewPlaylistName] = (0, import_react.useState)("");
	const [newFolderPath, setNewFolderPath] = (0, import_react.useState)("");
	const [newCover, setNewCover] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [showContextMenu, setShowContextMenu] = (0, import_react.useState)(false);
	const [contextMenuPosition, setContextMenuPosition] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [contextMenuPlaylist, setContextMenuPlaylist] = (0, import_react.useState)(null);
	const navigate = useNavigate();
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const [suppressPlaylistTap, setSuppressPlaylistTap] = (0, import_react.useState)(false);
	const [playlistOverId, setPlaylistOverId] = (0, import_react.useState)(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const loadPlaylists = (0, import_react.useCallback)(async () => {
		if (shouldDeferNetwork) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			const response = await getPlaylists();
			const fetched = Array.isArray(response?.data) ? response.data : [];
			setPlaylists(fetched);
			try {
				const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
				if (saved.length > 0) {
					const fetchedIds = new Set(fetched.map((p) => String(p.id)));
					const validSaved = saved.filter((id) => fetchedIds.has(String(id)));
					if (validSaved.length !== saved.length) {
						localStorage.removeItem(LS_KEY);
						setSortedPlaylists(sortPlaylistsAlphabetically(fetched));
					} else {
						const idToPlaylist = Object.fromEntries(fetched.map((p) => [String(p.id), p]));
						const ordered = validSaved.map((id) => idToPlaylist[String(id)]).filter(Boolean);
						const remaining = fetched.filter((p) => !validSaved.includes(p.id));
						setSortedPlaylists([...ordered, ...remaining]);
					}
				} else setSortedPlaylists(sortPlaylistsAlphabetically(fetched));
			} catch {
				localStorage.removeItem(LS_KEY);
				setSortedPlaylists(sortPlaylistsAlphabetically(fetched));
			}
		} catch (error) {
			console.error("Error loading playlists:", error);
			setPlaylists([]);
			setSortedPlaylists([]);
		} finally {
			setLoading(false);
		}
	}, [shouldDeferNetwork]);
	(0, import_react.useEffect)(() => {
		loadPlaylists();
	}, [loadPlaylists]);
	const handleDragEnd = (event) => {
		setPlaylistOverId(null);
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const reordered = arrayMove(sortedPlaylists, sortedPlaylists.findIndex((p) => String(p.id) === active.id), sortedPlaylists.findIndex((p) => String(p.id) === over.id));
			setSortedPlaylists(reordered);
			localStorage.setItem(LS_KEY, JSON.stringify(reordered.map((p) => p.id)));
		}
		setTimeout(() => {
			setSuppressPlaylistTap(false);
		}, 140);
	};
	const handleDragStart = () => {
		setSuppressPlaylistTap(true);
	};
	const handleDragCancel = () => {
		setPlaylistOverId(null);
		setTimeout(() => {
			setSuppressPlaylistTap(false);
		}, 140);
	};
	const handleCreatePlaylist = async (e) => {
		e.preventDefault();
		if (!newPlaylistName.trim() || shouldDeferNetwork) return;
		try {
			setCreating(true);
			await createPlaylist({
				name: newPlaylistName,
				folder_path: newFolderPath || null,
				cover_image: newCover || null
			});
			setNewPlaylistName("");
			setNewCover("");
			setShowCreateModal(false);
			loadPlaylists();
		} catch (error) {
			console.error("Error creating playlist:", error);
		} finally {
			setCreating(false);
		}
	};
	const handleEditPlaylist = async (e) => {
		e.preventDefault();
		if (!editName.trim() || shouldDeferNetwork) return;
		try {
			setSaving(true);
			await updatePlaylist(editingPlaylist.id, {
				name: editName,
				folder_path: editFolderPath || null,
				cover_image: editCoverImage || null
			});
			setShowEditModal(false);
			setEditingPlaylist(null);
			loadPlaylists();
		} catch (error) {
			console.error("Error updating playlist:", error);
		} finally {
			setSaving(false);
		}
	};
	const handleDeletePlaylist = async (id) => {
		if (shouldDeferNetwork) return;
		if (!confirm("Are you sure you want to delete this playlist?")) return;
		try {
			await deletePlaylist(id);
			setShowEditModal(false);
			setEditingPlaylist(null);
			loadPlaylists();
		} catch (error) {
			console.error("Error deleting playlist:", error);
		}
	};
	const openContextMenu = (playlist, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		setContextMenuPlaylist(playlist);
		setContextMenuPosition({
			x: e?.clientX || window.innerWidth / 2,
			y: e?.clientY || window.innerHeight / 2
		});
		setShowContextMenu(true);
	};
	const closeContextMenu = () => {
		setShowContextMenu(false);
		setContextMenuPlaylist(null);
	};
	const handleEditName = (playlist) => {
		setEditingPlaylist(playlist);
		setEditName(playlist.name);
		setEditFolderPath(playlist.folder_path || "");
		setEditCoverImage(playlist.cover_image || "");
		if (playlist.cover_image && playlist.cover_image.startsWith("data:")) setEditCoverSource("file");
		else setEditCoverSource("url");
		setShowEditModal(true);
	};
	const handleEditCover = (playlist) => {
		setEditingPlaylist(playlist);
		setEditName(playlist.name);
		setEditFolderPath(playlist.folder_path || "");
		setEditCoverImage(playlist.cover_image || "");
		if (playlist.cover_image && playlist.cover_image.startsWith("data:")) setEditCoverSource("file");
		else setEditCoverSource("url");
		setShowEditModal(true);
	};
	const handleDeleteFromMenu = (playlist) => {
		if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) handleDeletePlaylist(playlist.id);
	};
	const handleOpenPlaylist = (playlistId) => {
		navigate(`/playlists/${playlistId}`);
	};
	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredPlaylists = sortedPlaylists.filter((playlist) => playlist.name.toLowerCase().includes(normalizedSearch));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-0 bg-vibe-black z-10 pt-safe ",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center justify-between",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-center absolute left-1/2 -translate-x-1/2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-2xl font-bold text-vibe-gold",
										children: "playlists"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setShowCreateModal(true),
									className: `p-3 rounded-full bg-vibe-gold text-vibe-black transition-colors shadow-lg flex items-center justify-center ${shouldDeferNetwork ? "opacity-40 cursor-not-allowed" : "hover:bg-[#ffcc40]"}`,
									disabled: shouldDeferNetwork,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-6 h-6" })
								})
							]
						}),
						shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-red-200 mt-1 flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode pauses playlist changes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: searchTerm,
								onChange: (e) => setSearchTerm(e.target.value),
								placeholder: "search playlists",
								className: "w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 border-transparent focus:border-[#ffbb20] focus:outline-none transition-colors"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 flex-1 overflow-y-auto pb-32",
				style: { WebkitOverflowScrolling: "touch" },
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
				}) : filteredPlaylists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center py-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "w-16 h-16 text-[#414141] mx-auto mb-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white mb-2",
							children: normalizedSearch ? "No playlists match your search" : "No playlists yet"
						}),
						!normalizedSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white text-sm",
							children: "Create your first playlist to get started"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
					sensors,
					collisionDetection: closestCenter,
					onDragStart: handleDragStart,
					onDragOver: ({ over }) => setPlaylistOverId(over?.id ?? null),
					onDragEnd: handleDragEnd,
					onDragCancel: handleDragCancel,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
						items: filteredPlaylists.map((p) => String(p.id)),
						strategy: rectSortingStrategy,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-4",
							children: filteredPlaylists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortablePlaylistCard, {
								playlist,
								onOpen: handleOpenPlaylist,
								onEdit: openContextMenu,
								suppressTap: suppressPlaylistTap,
								isDropTarget: String(playlist.id) === playlistOverId
							}, playlist.id))
						})
					})
				})
			}),
			showContextMenu && contextMenuPlaylist && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[9999] pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistContextMenu, {
						x: contextMenuPosition.x,
						y: contextMenuPosition.y,
						playlist: contextMenuPlaylist,
						onClose: closeContextMenu,
						onEditName: handleEditName,
						onEditCover: handleEditCover,
						onDelete: handleDeleteFromMenu
					})
				})
			}),
			showCreateModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 bg-black flex items-center justify-center z-50 p-4",
				onClick: () => setShowCreateModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-vibe-black rounded-3xl p-6 w-full max-w-md border-2 border-vibe-gold",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-bold text-vibe-gold mb-4",
						children: "new playlist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreatePlaylist,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "playlist name",
								value: newPlaylistName,
								onChange: (e) => setNewPlaylistName(e.target.value),
								className: "w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] placeholder-lowercase border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors mb-4",
								autoFocus: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "folder path (e.g. chill/evening)",
								value: newFolderPath,
								onChange: (e) => setNewFolderPath(e.target.value),
								className: "w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] placeholder-lowercase border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors mb-4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[#888] text-sm mb-2 block lowercase",
										children: "cover image"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*",
										onChange: (e) => {
											const file = e.target.files[0];
											if (file) {
												const reader = new FileReader();
												reader.onload = () => setNewCover(reader.result);
												reader.readAsDataURL(file);
											}
										},
										className: "w-full text-white"
									}),
									newCover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: newCover,
											alt: "Playlist cover preview",
											className: "w-24 h-24 rounded-xl object-cover"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setShowCreateModal(false);
										setNewPlaylistName("");
										setNewCover("");
									},
									className: "flex-1 py-3 rounded-2xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors lowercase",
									disabled: creating,
									children: "cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "flex-1 py-3 rounded-2xl bg-vibe-gold text-vibe-black transition-colors font-semibold disabled:opacity-50",
									disabled: creating || !newPlaylistName.trim() || shouldDeferNetwork,
									children: creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-5 h-5 animate-spin mx-auto" }) : "create"
								})]
							}),
							shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-red-200 mt-2 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " go back online to add playlists"]
							})
						]
					})]
				})
			}),
			showEditModal && editingPlaylist && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 bg-black flex items-center justify-center z-50 p-4",
				onClick: () => setShowEditModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-vibe-black rounded-3xl p-6 w-full max-w-md border-2 border-vibe-gold",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-bold text-vibe-gold mb-4",
						children: "edit playlist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleEditPlaylist,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[#888] text-sm mb-2 block lowercase",
									children: "playlist name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "playlist name",
									value: editName,
									onChange: (e) => setEditName(e.target.value),
									className: "w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors",
									autoFocus: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[#888] text-sm mb-2 block lowercase",
									children: "folder path"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "e.g. chill/evening",
									value: editFolderPath,
									onChange: (e) => setEditFolderPath(e.target.value),
									className: "w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-[#888] text-sm mb-2 block lowercase",
										children: "cover image"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setEditCoverSource("file"),
											className: `flex-1 py-2 rounded-xl text-sm transition-colors ${editCoverSource === "file" ? "bg-vibe-gold text-vibe-black" : "bg-[#1a1a1a] text-white"}`,
											children: "upload file"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setEditCoverSource("url"),
											className: `flex-1 py-2 rounded-xl text-sm transition-colors ${editCoverSource === "url" ? "bg-vibe-gold text-vibe-black" : "bg-[#1a1a1a] text-white"}`,
											children: "from url"
										})]
									}),
									editCoverSource === "file" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*",
										onChange: (e) => {
											const file = e.target.files[0];
											if (file) {
												const reader = new FileReader();
												reader.onload = () => setEditCoverImage(reader.result);
												reader.readAsDataURL(file);
											}
										},
										className: "w-full text-white"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "https://example.com/image.jpg",
										value: editCoverImage,
										onChange: (e) => setEditCoverImage(e.target.value),
										className: "w-full px-4 py-3 rounded-2xl bg-[#1a1a1a] text-white placeholder-[#888] border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
									}),
									editCoverImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: editCoverImage,
											alt: "Playlist cover preview",
											className: "w-24 h-24 rounded-xl object-cover"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3 mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setShowEditModal(false);
										setEditingPlaylist(null);
									},
									className: "flex-1 py-3 rounded-2xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors",
									disabled: saving,
									children: "cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "flex-1 py-3 rounded-2xl bg-vibe-gold text-vibe-black transition-colors font-semibold disabled:opacity-50",
									disabled: saving || !editName.trim() || shouldDeferNetwork,
									children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-5 h-5 animate-spin mx-auto" }) : "save"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleDeletePlaylist(editingPlaylist.id),
								className: "w-full py-3 rounded-2xl bg-red-900 text-red-400 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50",
								disabled: saving || shouldDeferNetwork,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-5 h-5" }), "delete playlist"]
							}),
							shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-red-200 mt-2 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " editing is paused while offline"]
							})
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { Playlists as default };
