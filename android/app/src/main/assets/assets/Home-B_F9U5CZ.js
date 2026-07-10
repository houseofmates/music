import { A as require_jsx_runtime, N as __toESM, b as resolveMediaUrl, h as getTracks, j as require_react, o as getAlbums, s as getArtists, t as usePlayerStore, u as getPlaylists } from "./store-DiutPrSL.js";
import { n as Link } from "./dist-CclwtIHd.js";
import { D as Plus, E as Play, M as Shuffle, U as Zap, V as WifiOff, _ as ListMusic, j as Search, n as useDataSaver, y as Loader2 } from "./DataSaverContext-CdWIg2hh.js";
import { t as ImageWithFallback } from "./ImageWithFallback-pWXsvhVu.js";
import { t as truncateText } from "./text-umVwu9ru.js";
//#region src/pages/Home.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Home = () => {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [playlists, setPlaylists] = (0, import_react.useState)([]);
	const [recentTracks, setRecentTracks] = (0, import_react.useState)([]);
	const [albums, setAlbums] = (0, import_react.useState)([]);
	const [artists, setArtists] = (0, import_react.useState)([]);
	const { playTrack } = usePlayerStore();
	const dataSaver = useDataSaver();
	const shouldDeferNetwork = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	const navigate = (0, import_react.useCallback)((path) => window.location.href = path, []);
	(0, import_react.useEffect)(() => {
		loadData();
	}, []);
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
			setPlaylists(playlistsRes?.data?.slice(0, 6) || []);
			setAlbums(albumsRes?.data?.slice(0, 6) || []);
			setArtists(artistsRes?.data?.slice(0, 6) || []);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};
	const handlePlayTrack = (track) => {
		playTrack(track);
	};
	const filteredTracks = searchQuery.trim() ? tracks.filter((t) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.artist?.toLowerCase().includes(searchQuery.toLowerCase()) || t.album?.toLowerCase().includes(searchQuery.toLowerCase())) : tracks;
	const shuffleArray = (arr) => [...arr].sort(() => Math.random() - .5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black pb-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-0 bg-vibe-black z-10 pt-safe ",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-0",
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
								to: "/playlists",
								className: "p-2 bg-vibe-gold rounded-full transition-colors flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-6 h-6 text-vibe-black" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "search tracks, artists, albums...",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "w-full pl-12 pr-4 py-3 rounded-2xl search-opaque placeholder-lowercase border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors bg-[#1a1a1a] text-white"
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
			className: "px-4 pt-4 space-y-6",
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
			}), filteredTracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/60 text-center py-8",
				children: "no tracks found"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: filteredTracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								children: track.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white/50 text-sm truncate",
								children: track.artist || "unknown artist"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-5 h-5 text-vibe-gold flex-shrink-0" })
					]
				}, track.id))
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				playlists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "playlists"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/playlists",
						className: "text-sm text-vibe-gold",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3",
					children: playlists.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: `/playlists/${playlist.id}`,
						className: "group",
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
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "albums"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/albums",
						className: "text-sm text-vibe-gold",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3",
					children: albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: `/albums/${encodeURIComponent(album.album)}`,
						className: "group",
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
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "artists"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/artists",
						className: "text-sm text-vibe-gold",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3",
					children: artists.map((artist) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: `/artists/${encodeURIComponent(artist)}`,
						className: "group",
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
				})] }),
				tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold text-white",
						children: "recent tracks"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tracks",
						className: "text-sm text-vibe-gold",
						children: "see all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: tracks.slice(0, 5).map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
									children: track.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white/50 text-sm truncate",
									children: track.artist || "unknown artist"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-5 h-5 text-vibe-gold flex-shrink-0" })
						]
					}, track.id))
				})] })
			] })] })
		})]
	});
};
//#endregion
export { Home as default };
