import { A as require_jsx_runtime, N as __toESM, j as require_react, t as usePlayerStore } from "./store-DiutPrSL.js";
import { s as useNavigate } from "./dist-CclwtIHd.js";
//#region src/pages/Profile.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Profile() {
	const navigate = useNavigate();
	const { user, logout, settings, updateSettings } = usePlayerStore();
	const [localSettings, setLocalSettings] = (0, import_react.useState)(settings);
	(0, import_react.useEffect)(() => {
		setLocalSettings(settings);
	}, [settings]);
	if (!user) {
		navigate("/login");
		return null;
	}
	const handleSave = async () => {
		try {
			await updateSettings(localSettings);
		} catch (err) {
			console.warn("Failed to save settings", err);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-white",
					children: "profile"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white/60",
					children: user.username
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						logout();
						navigate("/");
					},
					className: "rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20",
					children: "sign out"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold text-white",
						children: "sync settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white/80",
							children: "offline first mode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: localSettings?.offlineMode || false,
							onChange: (e) => setLocalSettings((prev) => ({
								...prev,
								offlineMode: e.target.checked
							})),
							className: "h-5 w-5 accent-vibe-gold"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white/80",
							children: "battery / low power mode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: localSettings?.lowPowerMode || false,
							onChange: (e) => setLocalSettings((prev) => ({
								...prev,
								lowPowerMode: e.target.checked
							})),
							className: "h-5 w-5 accent-vibe-gold"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-white/80",
								children: "crossfade (seconds)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 2,
								step: .1,
								value: localSettings?.crossfadeSeconds || .6,
								onChange: (e) => setLocalSettings((prev) => ({
									...prev,
									crossfadeSeconds: Number(e.target.value)
								})),
								className: "w-full"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right text-sm text-white/60",
								children: [localSettings?.crossfadeSeconds?.toFixed(1), "s"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleSave,
						className: "w-full rounded-xl bg-vibe-gold py-3 text-black font-semibold hover:bg-yellow-500",
						children: "save settings"
					})
				]
			})]
		})
	});
}
//#endregion
export { Profile as default };
