import { F as require_jsx_runtime, I as require_react, R as __toESM, t as usePlayerStore } from "./store-B1lyn0fi.js";
import { s as useNavigate } from "./dist-BoG_MAZs.js";
//#region src/pages/Login.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const { login, register, user } = usePlayerStore();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("login");
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleSubmit = async (event) => {
		event.preventDefault();
		setError(null);
		setLoading(true);
		try {
			if (mode === "login") await login(username.trim(), password);
			else await register(username.trim(), password);
			navigate("/");
		} catch (err) {
			setError(err?.response?.data?.detail || err?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};
	if (user) {
		navigate("/");
		return null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-white text-center mb-4",
					children: mode === "login" ? "sign in" : "create account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-sm text-white/70 mb-1",
							htmlFor: "username",
							children: "username"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "username",
							type: "text",
							value: username,
							onChange: (e) => setUsername(e.target.value),
							className: "w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-vibe-gold",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-sm text-white/70 mb-1",
							htmlFor: "password",
							children: "password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "password",
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-vibe-gold",
							required: true
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-red-400",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "w-full rounded-xl bg-vibe-gold py-3 text-black font-semibold hover:bg-yellow-500 transition",
							children: loading ? "working…" : mode === "login" ? "sign in" : "create account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 text-center text-sm text-white/70",
					children: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"new here?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-vibe-gold underline",
							onClick: () => setMode("register"),
							children: "create account"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"already have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-vibe-gold underline",
							onClick: () => setMode("login"),
							children: "sign in"
						})
					] })
				})
			]
		})
	});
}
//#endregion
export { Login as default };
