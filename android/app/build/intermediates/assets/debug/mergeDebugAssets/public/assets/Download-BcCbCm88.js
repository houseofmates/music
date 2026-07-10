import { F as require_jsx_runtime, I as require_react, O as searchMusicDl, R as __toESM, i as createMusicDlFolder, s as downloadMusicDl, y as listMusicDlFolders } from "./store-CF1ZVsO4.js";
import { n as Link } from "./dist-DQ47giAv.js";
import { E as Plus, n as useDataSaver, r as ArrowLeft, y as Loader2, z as WifiOff } from "./DataSaverContext-JVn9PKBV.js";
import { t as triggerImpact } from "./haptics-BGTWm9ug.js";
//#region src/pages/Download.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var formatDuration = (seconds) => {
	if (!seconds) return "";
	return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};
var isAndroidNative = typeof window !== "undefined" && window.Capacitor && window.Capacitor.getPlatform() === "android";
var Download = () => {
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [selectedSongs, setSelectedSongs] = (0, import_react.useState)(/* @__PURE__ */ new Map());
	const [showFolderModal, setShowFolderModal] = (0, import_react.useState)(false);
	const [folders, setFolders] = (0, import_react.useState)([]);
	const [newFolderName, setNewFolderName] = (0, import_react.useState)("");
	const [toast, setToast] = (0, import_react.useState)(null);
	const searchTimeoutRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		triggerImpact("light");
	}, []);
	const showToast = (0, import_react.useCallback)((message) => {
		setToast(message);
		setTimeout(() => setToast(null), 3e3);
	}, []);
	const performSearch = (0, import_react.useCallback)(async (query) => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		setLoading(true);
		try {
			const res = await searchMusicDl(query);
			console.log("Found", res.data?.length || 0, "results");
			setResults(res.data || []);
		} catch (err) {
			console.error("Search error:", err);
			showToast(`search failed: ${err.message}`);
		} finally {
			setLoading(false);
		}
	}, [showToast]);
	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
		if (!value.trim()) {
			setResults([]);
			return;
		}
		searchTimeoutRef.current = setTimeout(() => {
			performSearch(value);
		}, 500);
	};
	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
		performSearch(searchQuery);
	};
	const toggleSelection = (video) => {
		setSelectedSongs((prev) => {
			const next = new Map(prev);
			if (next.has(video.id)) next.delete(video.id);
			else next.set(video.id, {
				url: video.url,
				title: video.title
			});
			return next;
		});
	};
	const loadFolders = async () => {
		try {
			setFolders((await listMusicDlFolders()).data || ["/"]);
		} catch (err) {
			console.error("Failed to load folders:", err);
			setFolders(["/"]);
		}
	};
	const handleShowFolderPicker = async () => {
		await loadFolders();
		setShowFolderModal(true);
	};
	const handleCreateFolder = async () => {
		if (!newFolderName.trim()) return;
		try {
			await createMusicDlFolder(newFolderName.trim());
			setNewFolderName("");
			showToast(`folder '${newFolderName.trim()}' created`);
			await loadFolders();
		} catch (err) {
			console.error("Failed to create folder:", err);
			showToast("failed to create folder");
		}
	};
	const handleDownload = async (folder) => {
		const urls = Array.from(selectedSongs.values()).map((v) => v.url);
		const count = selectedSongs.size;
		setShowFolderModal(false);
		showToast(`saving ${count} item${count > 1 ? "s" : ""}...`);
		setSelectedSongs(/* @__PURE__ */ new Map());
		try {
			await downloadMusicDl({
				urls,
				folder
			});
			showToast("batch saved successfully");
		} catch (err) {
			console.error("Download error:", err);
			showToast("error starting download");
		}
	};
	if (shouldDeferNetwork) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `sticky top-0 bg-vibe-black z-10 px-4 py-4 ${isAndroidNative ? "pt-safe" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-center min-h-[44px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "absolute left-0 p-2 text-white hover:text-vibe-gold transition-colors",
					"aria-label": "Back to home",
					onClick: () => triggerImpact("light"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-6 h-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold text-vibe-gold",
					children: "download"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center px-4 pt-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-16 h-16 text-[#555] mb-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[#888] text-center",
					children: "downloads are not available in offline mode"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[#666] text-sm text-center mt-2",
					children: "connect to the internet to search and download songs"
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `sticky top-0 bg-vibe-black z-20 px-4 py-4 border-b border-[#333] ${isAndroidNative ? "pt-safe" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-center justify-center min-h-[44px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "absolute left-0 p-2 text-white hover:text-vibe-gold transition-colors",
						"aria-label": "Back to home",
						onClick: () => triggerImpact("light"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-6 h-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-bold text-vibe-gold",
						children: "download"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSearchSubmit,
					className: "flex gap-2 items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: searchQuery,
						onChange: handleSearchChange,
						placeholder: "search youtube...",
						className: "flex-1 bg-[#1a1a1a] border-2 border-transparent focus:border-vibe-gold rounded-xl px-4 py-3 text-white placeholder:text-[#666] outline-none lowercase min-w-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "bg-vibe-gold text-vibe-black px-5 py-3 rounded-xl font-semibold lowercase flex-shrink-0 h-[48px]",
						onClick: () => triggerImpact("light"),
						children: "go"
					})]
				})
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pb-32 space-y-3",
				children: [!loading && results.length === 0 && searchQuery.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[#888] text-center py-8 lowercase",
					children: "no results found"
				}), results.map((video) => {
					const isSelected = selectedSongs.has(video.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => {
							triggerImpact("light");
							toggleSelection(video);
						},
						className: `flex gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isSelected ? "bg-[#1a1a1a] border-2 border-vibe-gold" : "bg-[#121212] border-2 border-transparent hover:bg-[#1a1a1a]"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-28 flex-shrink-0 rounded-xl overflow-hidden aspect-video bg-[#1a1a1a]",
							children: [video.thumbnail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: video.thumbnail,
								alt: "",
								className: "w-full h-full object-cover",
								loading: "lazy"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full h-full bg-[#2a2a2a]" }), video.duration && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded",
								children: formatDuration(video.duration)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 flex flex-col justify-center min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-white text-sm font-medium line-clamp-2 lowercase leading-snug",
								children: video.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[#888] text-xs mt-1 lowercase",
								children: video.uploader
							})]
						})]
					}, video.id);
				})]
			}),
			selectedSongs.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed bottom-0 left-0 right-0 bg-[#121212] px-4 py-4 z-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						triggerImpact("light");
						handleShowFolderPicker();
					},
					className: "w-full bg-vibe-gold text-vibe-black py-4 rounded-2xl font-semibold lowercase",
					children: [
						"save ",
						selectedSongs.size,
						" song",
						selectedSongs.size > 1 ? "s" : ""
					]
				})
			}),
			showFolderModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4",
				onClick: () => setShowFolderModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[#121212] w-full max-w-md rounded-3xl p-6 border border-[#333]",
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-bold text-vibe-gold text-center mb-4 lowercase",
							children: "save to folder"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: newFolderName,
								onChange: (e) => setNewFolderName(e.target.value),
								placeholder: "new folder name...",
								className: "flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#666] outline-none lowercase"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleCreateFolder,
								className: "w-12 h-12 bg-vibe-gold text-vibe-black rounded-xl flex items-center justify-center font-bold text-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-6 h-6" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2 max-h-64 overflow-y-auto",
							children: folders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									triggerImpact("light");
									handleDownload(folder);
								},
								className: "w-full text-left px-4 py-3 bg-[#1a1a1a] rounded-xl hover:bg-[#2a2a2a] hover:text-vibe-gold transition-colors lowercase",
								children: folder === "/" ? "📂 root folder" : `📂 ${folder}`
							}, folder))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowFolderModal(false),
							className: "w-full mt-4 py-3 text-[#888] hover:text-white transition-colors lowercase",
							children: "cancel"
						})
					]
				})
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed bottom-24 left-1/2 -translate-x-1/2 bg-vibe-gold text-vibe-black px-6 py-3 rounded-full font-semibold z-50 shadow-lg lowercase",
				children: toast
			})
		]
	});
};
//#endregion
export { Download as default };
