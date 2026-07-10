import { A as require_jsx_runtime, N as __toESM, j as require_react, t as usePlayerStore } from "./store-DiutPrSL.js";
//#region src/icons.jsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Music = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9 18V5l12-2v13" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "6",
			cy: "18",
			r: "3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "18",
			cy: "16",
			r: "3"
		})
	]
});
var X = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "18",
		y1: "6",
		x2: "6",
		y2: "18"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "6",
		y1: "6",
		x2: "18",
		y2: "18"
	})]
});
var Home = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "9 22 9 12 15 12 15 22" })]
});
var Search = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		cx: "11",
		cy: "11",
		r: "8"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "21",
		y1: "21",
		x2: "16.65",
		y2: "16.65"
	})]
});
var Heart = ({ className, style, size = 24, fill = "none" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill,
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })
});
var User = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		cx: "12",
		cy: "7",
		r: "4"
	})]
});
var Play = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
		points: "5 3 19 12 5 21 5 3",
		fill: "currentColor"
	})
});
var Pause = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: "6",
		y: "4",
		width: "4",
		height: "16",
		fill: "currentColor"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: "14",
		y: "4",
		width: "4",
		height: "16",
		fill: "currentColor"
	})]
});
var SkipBack = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
		points: "19 20 9 12 19 4 19 20",
		fill: "currentColor"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "5",
		y1: "19",
		x2: "5",
		y2: "5"
	})]
});
var SkipForward = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
		points: "5 4 15 12 5 20 5 4",
		fill: "currentColor"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "19",
		y1: "5",
		x2: "19",
		y2: "19"
	})]
});
var Plus = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "12",
		y1: "5",
		x2: "12",
		y2: "19"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: "5",
		y1: "12",
		x2: "19",
		y2: "12"
	})]
});
var MoreVertical = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "5",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "19",
			r: "1"
		})
	]
});
var Trash2 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "3 6 5 6 21 6" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "10",
			y1: "11",
			x2: "10",
			y2: "17"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "14",
			y1: "11",
			x2: "14",
			y2: "17"
		})
	]
});
var Edit2 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" })
});
var Check = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "20 6 9 17 4 12" })
});
var Repeat = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "17 1 21 5 17 9" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 11V9a4 4 0 0 1 4-4h14" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "7 23 3 19 7 15" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 13v2a4 4 0 0 1-4 4H3" })
	]
});
var Repeat1 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m17 2 4 4-4 4" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 11v-1a4 4 0 0 1 4-4h12" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m7 22-4-4 4-4" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 13v1a4 4 0 0 1-4 4H5" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11 10h1v4" })
	]
});
var Shuffle = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "16 3 21 3 21 8" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "4",
			y1: "20",
			x2: "21",
			y2: "3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "21 16 21 21 16 21" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "15",
			y1: "15",
			x2: "21",
			y2: "21"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "4",
			y1: "4",
			x2: "9",
			y2: "9"
		})
	]
});
var GripVertical = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "9",
			cy: "12",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "9",
			cy: "5",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "9",
			cy: "19",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "15",
			cy: "12",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "15",
			cy: "5",
			r: "1"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "15",
			cy: "19",
			r: "1"
		})
	]
});
var Type = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "4 7 4 4 20 4 20 7" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "9",
			y1: "20",
			x2: "15",
			y2: "20"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "4",
			x2: "12",
			y2: "20"
		})
	]
});
var Clock = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "12 6 12 12 16 14" })]
});
var Loader2 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "2",
			x2: "12",
			y2: "6"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "18",
			x2: "12",
			y2: "22"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "4.93",
			y1: "4.93",
			x2: "7.76",
			y2: "7.76"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "16.24",
			y1: "16.24",
			x2: "19.07",
			y2: "19.07"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "2",
			y1: "12",
			x2: "6",
			y2: "12"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "18",
			y1: "12",
			x2: "22",
			y2: "12"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "4.93",
			y1: "19.07",
			x2: "7.76",
			y2: "16.24"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "16.24",
			y1: "7.76",
			x2: "19.07",
			y2: "4.93"
		})
	]
});
var ChevronDown = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "6 9 12 15 18 9" })
});
var ImageIcon = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "3",
			y: "3",
			width: "18",
			height: "18",
			rx: "2",
			ry: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "9",
			cy: "9",
			r: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
	]
});
var Download = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "7 10 12 15 17 10" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "15",
			x2: "12",
			y2: "3"
		})
	]
});
var WifiOff = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "1",
			y1: "1",
			x2: "23",
			y2: "23"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.72 11.06A10.94 10.94 0 0 1 19 12.55" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 12.55a10.94 10.94 0 0 1 5.17-2.39" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.71 5.05A16 16 0 0 1 22.58 9" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1.42 9a15.91 15.91 0 0 1 4.7-2.88" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8.53 16.11a6 6 0 0 1 6.95 0" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "20",
			x2: "12.01",
			y2: "20"
		})
	]
});
var Zap = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
		points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2",
		fill: "currentColor"
	})
});
var RotateCcw = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 7v6h6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" })]
});
var MessageSquareText = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "9",
			y1: "10",
			x2: "15",
			y2: "10"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "9",
			y1: "14",
			x2: "15",
			y2: "14"
		})
	]
});
var ListPlus = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2v20" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17 5v9" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 5h14" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2 10h20" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 15h13" })
	]
});
var ArrowLeft = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19 12H5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 19l-7-7 7-7" })]
});
var Disc3 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "0.6"
		})
	]
});
var Layers3 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2L2 7l10 5 10-5-10-5z" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2 17l10 5 10-5" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2 12l10 5 10-5" })
	]
});
var Move = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "5 9 2 12 5 15" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "9 5 12 2 15 5" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "15 19 12 22 9 19" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "19 9 22 12 19 15" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "2",
			y1: "12",
			x2: "22",
			y2: "12"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "2",
			x2: "12",
			y2: "22"
		})
	]
});
var Info = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "10"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "16",
			x2: "12",
			y2: "12"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "8",
			x2: "12.01",
			y2: "8"
		})
	]
});
var Pencil = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M15 5l4 4" })]
});
var Timer = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "13",
			r: "8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "9",
			x2: "12",
			y2: "13"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "12",
			y1: "17",
			x2: "12.01",
			y2: "17"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2v4" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 22v-2" })
	]
});
var ListMusic = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 15V6" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 12H3" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16 6H3" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 18H3" })
	]
});
var Volume2 = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14" })
	]
});
var VolumeX = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "23",
			y1: "9",
			x2: "17",
			y2: "15"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "17",
			y1: "9",
			x2: "23",
			y2: "15"
		})
	]
});
var Keyboard = ({ className, style, size = 24 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	className,
	style,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "2",
			y: "4",
			width: "20",
			height: "16",
			rx: "2",
			ry: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "6",
			y1: "8",
			x2: "6",
			y2: "8.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "10",
			y1: "8",
			x2: "10",
			y2: "8.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "14",
			y1: "8",
			x2: "14",
			y2: "8.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "18",
			y1: "8",
			x2: "18",
			y2: "8.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "6",
			y1: "12",
			x2: "6",
			y2: "12.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "10",
			y1: "12",
			x2: "10",
			y2: "12.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "14",
			y1: "12",
			x2: "14",
			y2: "12.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "18",
			y1: "12",
			x2: "18",
			y2: "12.01"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "6",
			y1: "16",
			x2: "18",
			y2: "16"
		})
	]
});
//#endregion
//#region src/hooks/useNetworkStatus.js
var getNavigatorConnection = () => {
	if (typeof navigator === "undefined") return null;
	return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};
var readStatus = () => {
	if (typeof navigator === "undefined") return {
		isOnline: true,
		saveData: false,
		effectiveType: "unknown"
	};
	const connection = getNavigatorConnection();
	return {
		isOnline: navigator.onLine,
		saveData: Boolean(connection?.saveData),
		effectiveType: connection?.effectiveType || "unknown"
	};
};
function useNetworkStatus() {
	const [status, setStatus] = (0, import_react.useState)(() => readStatus());
	(0, import_react.useEffect)(() => {
		const updateStatus = () => {
			setStatus(readStatus());
		};
		window.addEventListener("online", updateStatus);
		window.addEventListener("offline", updateStatus);
		const connection = getNavigatorConnection();
		connection?.addEventListener?.("change", updateStatus);
		return () => {
			window.removeEventListener("online", updateStatus);
			window.removeEventListener("offline", updateStatus);
			connection?.removeEventListener?.("change", updateStatus);
		};
	}, []);
	return status;
}
//#endregion
//#region src/context/DataSaverContext.jsx
var DataSaverContext = (0, import_react.createContext)({
	isOnline: true,
	saveData: false,
	effectiveType: "unknown",
	offlineForced: false,
	lowPowerMode: false,
	effectiveLowData: false,
	shouldLoadHighRes: true,
	shouldPrefetchImages: true
});
function DataSaverProvider({ children }) {
	const settings = usePlayerStore((state) => state.settings);
	const network = useNetworkStatus();
	const value = (0, import_react.useMemo)(() => {
		const offlineForced = Boolean(settings?.offlineMode);
		const lowPowerMode = Boolean(settings?.lowPowerMode);
		const isOnline = Boolean(network?.isOnline);
		const saveData = Boolean(network?.saveData);
		const effectiveType = network?.effectiveType || "unknown";
		const slowConnection = ["slow-2g", "2g"].includes(effectiveType);
		const effectiveLowData = offlineForced || lowPowerMode || saveData || slowConnection || !isOnline;
		return {
			isOnline,
			saveData,
			effectiveType,
			offlineForced,
			lowPowerMode,
			effectiveLowData,
			shouldLoadHighRes: !effectiveLowData,
			shouldPrefetchImages: !effectiveLowData && isOnline
		};
	}, [
		settings?.offlineMode,
		settings?.lowPowerMode,
		network?.isOnline,
		network?.saveData,
		network?.effectiveType
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataSaverContext.Provider, {
		value,
		children
	});
}
var useDataSaver = () => (0, import_react.useContext)(DataSaverContext);
//#endregion
export { RotateCcw as A, VolumeX as B, Music as C, Plus as D, Play as E, Timer as F, X as H, Trash2 as I, Type as L, Shuffle as M, SkipBack as N, Repeat as O, SkipForward as P, User as R, Move as S, Pencil as T, Zap as U, WifiOff as V, ListMusic as _, ChevronDown as a, MessageSquareText as b, Download as c, Heart as d, Home as f, Layers3 as g, Keyboard as h, Check as i, Search as j, Repeat1 as k, Edit2 as l, Info as m, useDataSaver as n, Clock as o, ImageIcon as p, ArrowLeft as r, Disc3 as s, DataSaverProvider as t, GripVertical as u, ListPlus as v, Pause as w, MoreVertical as x, Loader2 as y, Volume2 as z };
