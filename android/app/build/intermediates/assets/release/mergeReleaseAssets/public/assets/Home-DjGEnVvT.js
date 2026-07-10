import { F as require_jsx_runtime, I as require_react, R as __toESM, k as searchTracks, l as getAlbums, p as getPlaylists, t as usePlayerStore, u as getArtists, v as getTracks, w as resolveMediaUrl } from "./store-B1lyn0fi.js";
import { n as Link, s as useNavigate } from "./dist-BoG_MAZs.js";
import { A as Shuffle, E as Plus, T as Play, V as Zap, _ as ListMusic, k as Search, n as useDataSaver, y as Loader2, z as WifiOff } from "./DataSaverContext-BoPuygQl.js";
import { t as ImageWithFallback } from "./ImageWithFallback-Bn8n0AkE.js";
import { t as triggerImpact } from "./haptics-BGTWm9ug.js";
import { t as truncateText } from "./text-lVkUak4s.js";
//#region src/pages/Home.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fuzzyMatch = (text, query) => {
	if (!text || !query) return false;
	const t = text.toLowerCase().replace(/[^a-z0-9]/g, "");
	const q = query.toLowerCase().replace(/[^a-z0-9]/g, "");
	if (q.length === 0) return true;
	let qi = 0;
	for (let ti = 0; ti < t.length && qi < q.length; ti++) if (t[ti] === q[qi]) qi++;
	return qi === q.length;
};
var Home = () => {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [searchTrackResults, setSearchTrackResults] = (0, import_react.useState)([]);
	const [searchLoading, setSearchLoading] = (0, import_react.useState)(false);
	const [playlists, setPlaylists] = (0, import_react.useState)([]);
	const [recentTracks, setRecentTracks] = (0, import_react.useState)([]);
	const [albums, setAlbums] = (0, import_react.useState)([]);
	const [artists, setArtists] = (0, import_react.useState)([]);
	const { playTrack } = usePlayerStore();
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	const navigateFn = useNavigate();
	const navigate = (0, import_react.useCallback)((path) => {
		triggerImpact("light");
		navigateFn(path);
	}, [navigateFn]);
	const isAndroidNative = typeof window !== "undefined" && window.Capacitor && window.Capacitor.getPlatform() === "android";
	(0, import_react.useEffect)(() => {
		loadData();
	}, []);
	(0, import_react.useEffect)(() => {
		const doSearch = async () => {
			if (!searchQuery.trim()) {
				setSearchTrackResults([]);
				setSearchLoading(false);
				return;
			}
			setSearchLoading(true);
			try {
				const { data } = await searchTracks(searchQuery, [
					"title",
					"artist",
					"album"
				]);
				setSearchTrackResults(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error("Error searching tracks:", error);
			} finally {
				setSearchLoading(false);
			}
		};
		const debounceTimer = setTimeout(doSearch, 50);
		return () => clearTimeout(debounceTimer);
	}, [searchQuery]);
	searchQuery.trim() && playlists.filter((p) => fuzzyMatch(p.name, searchQuery));
	searchQuery.trim() && albums.filter((a) => fuzzyMatch(a.album, searchQuery) || fuzzyMatch(a.artist, searchQuery));
	searchQuery.trim() && artists.filter((a) => fuzzyMatch(a, searchQuery));
	const loadData = async () => {
		if (shouldDeferNetwork) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			const [tracksRes, playlistsRes, albumsRes, artistsRes] = await Promise.all([
				getTracks({ limit: 10 }),
				getPlaylists(),
				getAlbums(),
				getArtists()
			]);
			setTracks(tracksRes?.data?.slice(0, 10) || []);
			setPlaylists(playlistsRes?.data || []);
			setAlbums(albumsRes?.data || []);
			setArtists(artistsRes?.data || []);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};
	const handlePlayTrack = (track) => {
		triggerImpact("light");
		playTrack(track);
	};
	const shuffleArray = (arr) => [...arr].sort(() => Math.random() - .5);
	const cardGridClass = isAndroidNative ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `sticky top-0 bg-vibe-black z-10 ${isAndroidNative ? "pt-safe" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `${isAndroidNative ? "px-4" : "px-1"} py-0`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-vibe-gold",
								children: "music"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/download",
								className: "p-2 transition-colors flex items-center justify-center",
								"aria-label": "Download songs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									className: "w-6 h-6",
									style: { color: "#f6b012" }
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `relative ${isAndroidNative ? "mt-2" : "mt-1"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "search tracks, artists, albums...",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "w-full pl-12 pr-4 py-3 rounded-2xl search-opaque placeholder-lowercase border-2 focus:outline-none transition-colors bg-[#1a1a1a] text-white"
						})]
					}),
					(shouldDeferNetwork || lowDataActive) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 mt-2",
						children: [shouldDeferNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-red-900 bg-[#2a1515] px-3 py-2 text-sm text-red-100 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-4 h-4" }), " offline mode"]
						}), !shouldDeferNetwork && lowDataActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-yellow-900 bg-[#2a2515] px-3 py-2 text-sm text-yellow-100 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4" }), " low data mode"]
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 md:px-0 pt-4 md:pt-2 space-y-6 md:space-y-4",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => navigate("/tracks"),
					className: "flex-1 flex items-center justify-center gap-2 bg-vibe-gold text-vibe-black py-3 rounded-2xl font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "w-5 h-5" }), "all tracks"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						if (tracks.length > 0) {
							const randomTracks = shuffleArray(tracks).slice(0, 20);
							playTrack(randomTracks[0], randomTracks);
						}
					},
					className: "flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3 rounded-2xl hover:bg-[#252525]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5" }), "shuffle play"]
				})]
			}) }), searchQuery.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold text-white mb-3",
				children: "search results"
			}), searchLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-8 h-8 text-vibe-gold animate-spin" })
			}) : searchTrackResults.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/60 text-center py-8",
				children: "no tracks found"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-gray-400 mb-4",
					children: [searchTrackResults.length, " results"]
				}), searchTrackResults.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => handlePlayTrack(track),
					className: "flex items-center gap-3 p-3 rounded-2xl bg-[#111] hover:bg-[#1a1a1a] cursor-pointer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-12 h-12 rounded-lg overflow-hidden bg-[#222] flex-shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl(track.cover_art_url),
								alt: track.title,
								fallbackText: track.title,
								className: "w-full h-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white font-medium truncate",
								children: track.title || track.filename || "unknown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-white/50 text-sm truncate",
								children: [
									track.artist || "unknown artist",
									" • ",
									track.album || "unknown album"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-5 h-5 text-vibe-gold flex-shrink-0" })
					]
				}, track.id))]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "recent tracks"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tracks",
						className: "text-sm text-vibe-gold pb-0.5",
						children: "see all"
					})]
				}), isAndroidNative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4",
					children: tracks.slice(0, 10).map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => handlePlayTrack(track),
						className: "group cursor-pointer flex-shrink-0 w-[110px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl(track.cover_art_url),
								alt: track.title,
								fallbackText: track.title,
								className: "w-full h-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 px-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm text-white font-semibold leading-tight",
								style: {
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									wordBreak: "break-word"
								},
								children: track.title || track.filename || "unknown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-white/60 truncate",
								children: truncateText(track.artist || "unknown artist", 18)
							})]
						})]
					}, track.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid " + cardGridClass,
					children: tracks.slice(0, 10).map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => handlePlayTrack(track),
						className: "group cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl(track.cover_art_url),
								alt: track.title,
								fallbackText: track.title,
								className: "w-full h-full object-cover"
							})
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
								children: track.title || track.filename || "unknown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-white/60 text-center truncate",
								children: truncateText(track.artist || "unknown artist", 25)
							})]
						})]
					}, track.id))
				})] }),
				playlists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "playlists"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/playlists",
						className: "text-sm text-vibe-gold pb-0.5",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid " + cardGridClass,
					children: playlists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => {
							triggerImpact("light");
							navigateFn(`/playlists/${playlist.id}`);
						},
						className: "group cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl(playlist.cover_image),
								alt: playlist.name,
								fallbackText: playlist.name,
								className: "w-full h-full object-cover"
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
								children: playlist.name
							})
						})]
					}, playlist.id))
				})] }),
				albums.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "albums"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/albums",
						className: "text-sm text-vibe-gold pb-0.5",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid " + cardGridClass,
					children: albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => {
							triggerImpact("light");
							navigateFn(`/albums/${encodeURIComponent(album.album)}`);
						},
						className: "group cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-square rounded-2xl overflow-hidden bg-[#111] border border-[#333]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl(album.cover_art_url),
								alt: album.album,
								fallbackText: album.album,
								className: "w-full h-full object-cover"
							})
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
								children: album.album
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-white/60 text-center truncate",
								children: truncateText(album.artist || "unknown artist", 30)
							})]
						})]
					}, `${album.album}-${album.artist}`))
				})] }),
				artists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "artists"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/artists",
						className: "text-sm text-vibe-gold pb-0.5",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid " + cardGridClass,
					children: artists.map((artist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => {
							triggerImpact("light");
							navigateFn(`/artists/${encodeURIComponent(artist)}`);
						},
						className: "group cursor-pointer",
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
				})] })
			] })] })
		})]
	});
};
//#endregion
export { Home as default };
