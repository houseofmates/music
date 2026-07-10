import { A as require_jsx_runtime, N as __toESM, d as getShareLink, f as getTrack, j as require_react, l as getPlaylist, t as usePlayerStore } from "./store-DiutPrSL.js";
import { c as useParams, s as useNavigate } from "./dist-CclwtIHd.js";
//#region src/pages/Share.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Share() {
	const { token } = useParams();
	const navigate = useNavigate();
	const { playTrack } = usePlayerStore();
	const [share, setShare] = (0, import_react.useState)(null);
	const [track, setTrack] = (0, import_react.useState)(null);
	const [playlist, setPlaylist] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!token) {
			navigate("/");
			return;
		}
		let mounted = true;
		const load = async () => {
			try {
				const res = await getShareLink(token);
				if (!mounted) return;
				setShare(res.data);
				if (res.data.kind === "track") {
					const trackRes = await getTrack(res.data.resource_id);
					if (mounted) setTrack(trackRes.data);
				} else if (res.data.kind === "playlist") {
					const listRes = await getPlaylist(res.data.resource_id);
					if (mounted) {
						const playlistData = listRes.data;
						setPlaylist(playlistData);
					}
				}
			} catch (err) {
				setError(err?.response?.data?.detail || "Could not load share link");
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, [token, navigate]);
	const handlePlay = () => {
		if (track) playTrack(track);
	};
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-white/70",
			children: error
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-white mb-2",
					children: "shared link"
				}),
				share && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-white/60 mb-4",
					children: share.title ? `${share.title}` : `shared ${share.kind}`
				}),
				track && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-white/10 bg-white/5 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold text-white",
							children: track.title || track.filename
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white/60",
							children: track.artist || "unknown artist"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handlePlay,
							className: "mt-4 rounded-xl bg-vibe-gold px-5 py-3 text-black font-semibold",
							children: "play track"
						})
					]
				}),
				playlist && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-white/10 bg-white/5 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold text-white",
							children: playlist.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white/60 mb-4",
							children: playlist.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: (playlist.tracks || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => playTrack(t),
								className: "w-full text-left rounded-xl border border-white/10 bg-black/20 p-3 text-white hover:bg-white/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold truncate",
									children: t.title || t.filename
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-white/60 text-sm truncate",
									children: t.artist || "unknown"
								})]
							}, t.id))
						})
					]
				})
			]
		})
	});
}
//#endregion
export { Share as default };
