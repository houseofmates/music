import { F as require_jsx_runtime, I as require_react, N as uploadArtistCover, R as __toESM, S as renameArtist, u as getArtists } from "./store-B1lyn0fi.js";
import { s as useNavigate } from "./dist-BoG_MAZs.js";
import { V as Zap, k as Search, n as useDataSaver, y as Loader2, z as WifiOff } from "./DataSaverContext-BoPuygQl.js";
import { t as triggerImpact } from "./haptics-BGTWm9ug.js";
//#region src/components/ArtistEditModal.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArtistEditModal({ isOpen, artistData, onClose, onSave }) {
	const [artist, setArtist] = (0, import_react.useState)("");
	const [cover, setCover] = (0, import_react.useState)("");
	const [coverFile, setCoverFile] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (artistData) {
			setArtist(artistData.name || "");
			setCover(artistData.cover_art_url || "");
		}
	}, [artistData]);
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
				name: artist,
				cover_art_url: cover,
				coverFile
			});
			onClose();
		} catch (err) {
			console.error("Error saving artist:", err);
		} finally {
			setSaving(false);
		}
	};
	if (!isOpen || !artistData) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-[#050505] flex items-center justify-center z-50 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-[#050505] rounded-3xl p-6 w-full max-w-md border-2 border-[#ffbb20]",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-bold text-vibe-gold mb-4 lowercase",
				children: "edit artist"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-white/60 text-sm mb-2 block lowercase",
							children: "artist name"
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
//#region src/pages/Artists.jsx
function Artists() {
	const [artists, setArtists] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [editingArtist, setEditingArtist] = (0, import_react.useState)(null);
	const [showArtistEdit, setShowArtistEdit] = (0, import_react.useState)(false);
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	const navigate = useNavigate();
	const loadArtists = (0, import_react.useCallback)(async () => {
		if (shouldDeferNetwork) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			const response = await getArtists();
			setArtists(Array.isArray(response?.data) ? response.data : []);
		} catch (error) {
			console.error("Error loading artists:", error);
			setArtists([]);
		} finally {
			setLoading(false);
		}
	}, [shouldDeferNetwork]);
	(0, import_react.useEffect)(() => {
		loadArtists();
	}, [loadArtists]);
	const handleEditArtistClick = (artistName, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (shouldDeferNetwork) return;
		setEditingArtist({ name: artistName });
		setShowArtistEdit(true);
	};
	const handleSaveArtist = async (data) => {
		if (!editingArtist) return;
		if (shouldDeferNetwork) return;
		try {
			if (data.name && data.name !== editingArtist.name) await renameArtist(editingArtist.name, data.name);
			if (data.coverFile) await uploadArtistCover(data.name || editingArtist.name, data.coverFile);
			setEditingArtist(null);
			setShowArtistEdit(false);
			loadArtists();
		} catch (err) {
			console.error("Error saving artist data:", err);
		}
	};
	const filteredArtists = artists.filter((artist) => artist.toLowerCase().includes(searchTerm.trim().toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-0 bg-vibe-black z-10 pt-safe ",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center justify-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold text-vibe-gold",
								children: "artists"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8" })
						]
					}),
					!loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-white mb-3 text-center",
						children: [
							filteredArtists.length,
							searchTerm.trim() ? ` of ${artists.length}` : "",
							" artists"
						]
					}),
					(shouldDeferNetwork || lowDataActive) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 mb-3",
						children: [shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode — showing cached artists"]
						}), !shouldDeferNetwork && lowDataActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4" }), " low data mode pauses auto-refresh"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value),
							placeholder: "search artists",
							className: "w-full rounded-2xl search-opaque placeholder-[#888] pl-10 pr-4 py-3 border-2 focus:border-[#ffbb20] focus:outline-none"
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 flex-1 overflow-y-auto pb-32",
			style: { WebkitOverflowScrolling: "touch" },
			children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
			}) : filteredArtists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-center py-12 text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: shouldDeferNetwork ? "artist list unavailable while offline" : "no artists match your search" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4",
				children: filteredArtists.map((artist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => {
						triggerImpact("light");
						navigate(`/artists/${encodeURIComponent(artist)}`);
					},
					onContextMenu: (e) => {
						e.preventDefault();
						handleEditArtistClick(artist, e);
					},
					className: "cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333] flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-4xl font-bold text-vibe-gold",
							children: artist.charAt(0).toUpperCase()
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 px-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm text-white font-semibold text-center leading-tight",
							style: {
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								wordBreak: "break-word"
							},
							children: artist
						})
					})]
				}, artist))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistEditModal, {
				isOpen: showArtistEdit,
				artistData: editingArtist,
				onClose: () => {
					setShowArtistEdit(false);
					setEditingArtist(null);
				},
				onSave: handleSaveArtist
			})]
		})]
	});
}
//#endregion
export { Artists as default };
