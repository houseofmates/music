import { F as require_jsx_runtime, I as require_react, R as __toESM } from "./store-CF1ZVsO4.js";
import { n as useDataSaver } from "./DataSaverContext-JVn9PKBV.js";
//#region src/components/ImageWithFallback.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ImageWithFallback({ src, alt, fallbackText, className = "", eager = false, style, respectDataSaver = true, ...props }) {
	const [error, setError] = (0, import_react.useState)(false);
	const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
	const dataSaver = useDataSaver();
	(0, import_react.useEffect)(() => {
		setError(false);
		setIsLoaded(false);
	}, [src]);
	const handleImageError = () => {
		if (src) setError(true);
	};
	const handleImageLoad = () => {
		setIsLoaded(true);
	};
	const getInitial = (text) => {
		if (!text) return "?";
		const firstChar = text.trim().charAt(0).toUpperCase();
		return firstChar.match(/[A-Z]/) ? firstChar : "#";
	};
	const sharedClassName = `${className}`.trim();
	const progressiveClasses = ["transition-all duration-500 ease-out will-change-transform will-change-opacity"];
	const visualStateClasses = isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-[1.02]";
	const combinedClassName = [
		sharedClassName,
		...progressiveClasses,
		visualStateClasses
	].filter(Boolean).join(" ");
	const mergedStyle = { ...style };
	const shouldRenderHighRes = !respectDataSaver || eager || dataSaver?.shouldLoadHighRes !== false;
	if (error || !src || !shouldRenderHighRes) {
		const fallbackClasses = ["flex items-center justify-center bg-[#101010] text-[#f6b012] font-varela", sharedClassName].filter(Boolean).join(" ");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: fallbackClasses,
			style: mergedStyle,
			...props,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-4xl font-bold leading-none",
				children: getInitial(fallbackText)
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		onError: handleImageError,
		onLoad: handleImageLoad,
		className: combinedClassName,
		loading: eager ? "eager" : "lazy",
		decoding: "async",
		style: mergedStyle,
		...props
	});
}
//#endregion
export { ImageWithFallback as t };
