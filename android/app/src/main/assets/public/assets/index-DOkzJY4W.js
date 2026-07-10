const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Home-KbBMg39u.js","./store-CF1ZVsO4.js","./dist-DQ47giAv.js","./ImageWithFallback-BHtvC2dU.js","./DataSaverContext-JVn9PKBV.js","./haptics-BGTWm9ug.js","./text-lVkUak4s.js","./PlayerPage-DXp16TeU.js","./Playlists-Csz2C96K.js","./PlaylistDetail-DQpxbAPg.js","./AutoSizeText-CHPk309l.js","./Artists-B0bsD1mB.js","./ArtistDetail-JUxn8D-L.js","./Albums-B5IibksT.js","./AlbumDetail-C1DGl9RR.js","./Favorites-D_LPrZ4r.js","./History-B3uNnE9u.js","./Login-CInayjdK.js","./Profile-ywDcyVgi.js","./Share-B-Xtwq8p.js","./Download-BcCbCm88.js"])))=>i.map(i=>d[i]);
import { D as searchLyrics, E as saveTrackLyrics, F as require_jsx_runtime, I as require_react, L as __commonJSMin, P as uploadTrackCover, R as __toESM, T as saveSyncedLyrics, _ as getTrackStreamUrl, f as getPlaylist, g as getTrackLyrics, j as updateTrack, k as searchTracks, l as getAlbums, p as getPlaylists, r as api, t as usePlayerStore, w as resolveMediaUrl$1 } from "./store-CF1ZVsO4.js";
import { a as Routes, i as Route, l as require_react_dom, o as useLocation, s as useNavigate, t as HashRouter } from "./dist-DQ47giAv.js";
import { A as Shuffle, B as X, C as Pause, D as Repeat, E as Plus, I as User, L as Volume2, M as SkipForward, N as Timer, O as Repeat1, P as Trash2, R as VolumeX, S as Music, T as Play, V as Zap, _ as ListMusic, a as ChevronDown, b as MessageSquareText, c as Disc3, d as Heart, f as Home$1, h as Keyboard, i as Check, j as SkipBack, k as Search, l as Download$1, m as Info, n as useDataSaver, p as ImageIcon, s as Clock, t as DataSaverProvider, u as GripVertical, v as ListPlus, w as Pencil, y as Loader2, z as WifiOff } from "./DataSaverContext-JVn9PKBV.js";
import { t as ImageWithFallback } from "./ImageWithFallback-BHtvC2dU.js";
import { n as triggerSelection, t as triggerImpact } from "./haptics-BGTWm9ug.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/components/VolumeSlider.jsx
var import_client = (/* @__PURE__ */ __commonJSMin(((exports) => {
	var m = require_react_dom();
	exports.createRoot = m.createRoot;
	exports.hydrateRoot = m.hydrateRoot;
})))();
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
//#endregion
//#region node_modules/@dnd-kit/utilities/dist/utilities.esm.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function useCombinedRefs() {
	for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) refs[_key] = arguments[_key];
	return (0, import_react.useMemo)(() => (node) => {
		refs.forEach((ref) => ref(node));
	}, refs);
}
var canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function isWindow(element) {
	const elementString = Object.prototype.toString.call(element);
	return elementString === "[object Window]" || elementString === "[object global]";
}
function isNode(node) {
	return "nodeType" in node;
}
function getWindow(target) {
	var _target$ownerDocument, _target$ownerDocument2;
	if (!target) return window;
	if (isWindow(target)) return target;
	if (!isNode(target)) return window;
	return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
	const { Document } = getWindow(node);
	return node instanceof Document;
}
function isHTMLElement(node) {
	if (isWindow(node)) return false;
	return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
	return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
	if (!target) return document;
	if (isWindow(target)) return target.document;
	if (!isNode(target)) return document;
	if (isDocument(target)) return target;
	if (isHTMLElement(target) || isSVGElement(target)) return target.ownerDocument;
	return document;
}
/**
* A hook that resolves to useEffect on the server and useLayoutEffect on the client
* @param callback {function} Callback function that is invoked when the dependencies of the hook change
*/
var useIsomorphicLayoutEffect = canUseDOM ? import_react.useLayoutEffect : import_react.useEffect;
function useEvent(handler) {
	const handlerRef = (0, import_react.useRef)(handler);
	useIsomorphicLayoutEffect(() => {
		handlerRef.current = handler;
	});
	return (0, import_react.useCallback)(function() {
		for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
		return handlerRef.current == null ? void 0 : handlerRef.current(...args);
	}, []);
}
function useInterval() {
	const intervalRef = (0, import_react.useRef)(null);
	return [(0, import_react.useCallback)((listener, duration) => {
		intervalRef.current = setInterval(listener, duration);
	}, []), (0, import_react.useCallback)(() => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, [])];
}
function useLatestValue(value, dependencies) {
	if (dependencies === void 0) dependencies = [value];
	const valueRef = (0, import_react.useRef)(value);
	useIsomorphicLayoutEffect(() => {
		if (valueRef.current !== value) valueRef.current = value;
	}, dependencies);
	return valueRef;
}
function useLazyMemo(callback, dependencies) {
	const valueRef = (0, import_react.useRef)();
	return (0, import_react.useMemo)(() => {
		const newValue = callback(valueRef.current);
		valueRef.current = newValue;
		return newValue;
	}, [...dependencies]);
}
function useNodeRef(onChange) {
	const onChangeHandler = useEvent(onChange);
	const node = (0, import_react.useRef)(null);
	return [node, (0, import_react.useCallback)((element) => {
		if (element !== node.current) onChangeHandler == null || onChangeHandler(element, node.current);
		node.current = element;
	}, [])];
}
function usePrevious(value) {
	const ref = (0, import_react.useRef)();
	(0, import_react.useEffect)(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}
var ids = {};
function useUniqueId(prefix, value) {
	return (0, import_react.useMemo)(() => {
		if (value) return value;
		const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
		ids[prefix] = id;
		return prefix + "-" + id;
	}, [prefix, value]);
}
function createAdjustmentFn(modifier) {
	return function(object) {
		for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) adjustments[_key - 1] = arguments[_key];
		return adjustments.reduce((accumulator, adjustment) => {
			const entries = Object.entries(adjustment);
			for (const [key, valueAdjustment] of entries) {
				const value = accumulator[key];
				if (value != null) accumulator[key] = value + modifier * valueAdjustment;
			}
			return accumulator;
		}, { ...object });
	};
}
var add = /* @__PURE__ */ createAdjustmentFn(1);
var subtract = /* @__PURE__ */ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
	return "clientX" in event && "clientY" in event;
}
function isKeyboardEvent(event) {
	if (!event) return false;
	const { KeyboardEvent } = getWindow(event.target);
	return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
	if (!event) return false;
	const { TouchEvent } = getWindow(event.target);
	return TouchEvent && event instanceof TouchEvent;
}
/**
* Returns the normalized x and y coordinates for mouse and touch events.
*/
function getEventCoordinates(event) {
	if (isTouchEvent(event)) {
		if (event.touches && event.touches.length) {
			const { clientX: x, clientY: y } = event.touches[0];
			return {
				x,
				y
			};
		} else if (event.changedTouches && event.changedTouches.length) {
			const { clientX: x, clientY: y } = event.changedTouches[0];
			return {
				x,
				y
			};
		}
	}
	if (hasViewportRelativeCoordinates(event)) return {
		x: event.clientX,
		y: event.clientY
	};
	return null;
}
var CSS = /* @__PURE__ */ Object.freeze({
	Translate: { toString(transform) {
		if (!transform) return;
		const { x, y } = transform;
		return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
	} },
	Scale: { toString(transform) {
		if (!transform) return;
		const { scaleX, scaleY } = transform;
		return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
	} },
	Transform: { toString(transform) {
		if (!transform) return;
		return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
	} },
	Transition: { toString(_ref) {
		let { property, duration, easing } = _ref;
		return property + " " + duration + "ms " + easing;
	} }
});
var SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function findFirstFocusableNode(element) {
	if (element.matches(SELECTOR)) return element;
	return element.querySelector(SELECTOR);
}
//#endregion
//#region node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js
var hiddenStyles = { display: "none" };
function HiddenText(_ref) {
	let { id, value } = _ref;
	return import_react.createElement("div", {
		id,
		style: hiddenStyles
	}, value);
}
function LiveRegion(_ref) {
	let { id, announcement, ariaLiveType = "assertive" } = _ref;
	return import_react.createElement("div", {
		id,
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			width: 1,
			height: 1,
			margin: -1,
			border: 0,
			padding: 0,
			overflow: "hidden",
			clip: "rect(0 0 0 0)",
			clipPath: "inset(100%)",
			whiteSpace: "nowrap"
		},
		role: "status",
		"aria-live": ariaLiveType,
		"aria-atomic": true
	}, announcement);
}
function useAnnouncement() {
	const [announcement, setAnnouncement] = (0, import_react.useState)("");
	return {
		announce: (0, import_react.useCallback)((value) => {
			if (value != null) setAnnouncement(value);
		}, []),
		announcement
	};
}
//#endregion
//#region node_modules/@dnd-kit/core/dist/core.esm.js
var DndMonitorContext = /* @__PURE__ */ (0, import_react.createContext)(null);
function useDndMonitor(listener) {
	const registerListener = (0, import_react.useContext)(DndMonitorContext);
	(0, import_react.useEffect)(() => {
		if (!registerListener) throw new Error("useDndMonitor must be used within a children of <DndContext>");
		return registerListener(listener);
	}, [listener, registerListener]);
}
function useDndMonitorProvider() {
	const [listeners] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const registerListener = (0, import_react.useCallback)((listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}, [listeners]);
	return [(0, import_react.useCallback)((_ref) => {
		let { type, event } = _ref;
		listeners.forEach((listener) => {
			var _listener$type;
			return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
		});
	}, [listeners]), registerListener];
}
var defaultScreenReaderInstructions = { draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  " };
var defaultAnnouncements = {
	onDragStart(_ref) {
		let { active } = _ref;
		return "Picked up draggable item " + active.id + ".";
	},
	onDragOver(_ref2) {
		let { active, over } = _ref2;
		if (over) return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
		return "Draggable item " + active.id + " is no longer over a droppable area.";
	},
	onDragEnd(_ref3) {
		let { active, over } = _ref3;
		if (over) return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
		return "Draggable item " + active.id + " was dropped.";
	},
	onDragCancel(_ref4) {
		let { active } = _ref4;
		return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
	}
};
function Accessibility(_ref) {
	let { announcements = defaultAnnouncements, container, hiddenTextDescribedById, screenReaderInstructions = defaultScreenReaderInstructions } = _ref;
	const { announce, announcement } = useAnnouncement();
	const liveRegionId = useUniqueId("DndLiveRegion");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	useDndMonitor((0, import_react.useMemo)(() => ({
		onDragStart(_ref2) {
			let { active } = _ref2;
			announce(announcements.onDragStart({ active }));
		},
		onDragMove(_ref3) {
			let { active, over } = _ref3;
			if (announcements.onDragMove) announce(announcements.onDragMove({
				active,
				over
			}));
		},
		onDragOver(_ref4) {
			let { active, over } = _ref4;
			announce(announcements.onDragOver({
				active,
				over
			}));
		},
		onDragEnd(_ref5) {
			let { active, over } = _ref5;
			announce(announcements.onDragEnd({
				active,
				over
			}));
		},
		onDragCancel(_ref6) {
			let { active, over } = _ref6;
			announce(announcements.onDragCancel({
				active,
				over
			}));
		}
	}), [announce, announcements]));
	if (!mounted) return null;
	const markup = import_react.createElement(import_react.Fragment, null, import_react.createElement(HiddenText, {
		id: hiddenTextDescribedById,
		value: screenReaderInstructions.draggable
	}), import_react.createElement(LiveRegion, {
		id: liveRegionId,
		announcement
	}));
	return container ? (0, import_react_dom.createPortal)(markup, container) : markup;
}
var Action;
(function(Action) {
	Action["DragStart"] = "dragStart";
	Action["DragMove"] = "dragMove";
	Action["DragEnd"] = "dragEnd";
	Action["DragCancel"] = "dragCancel";
	Action["DragOver"] = "dragOver";
	Action["RegisterDroppable"] = "registerDroppable";
	Action["SetDroppableDisabled"] = "setDroppableDisabled";
	Action["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {}
function useSensor(sensor, options) {
	return (0, import_react.useMemo)(() => ({
		sensor,
		options: options != null ? options : {}
	}), [sensor, options]);
}
function useSensors() {
	for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) sensors[_key] = arguments[_key];
	return (0, import_react.useMemo)(() => [...sensors].filter((sensor) => sensor != null), [...sensors]);
}
var defaultCoordinates = /* @__PURE__ */ Object.freeze({
	x: 0,
	y: 0
});
/**
* Returns the distance between two points
*/
function distanceBetween(p1, p2) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
/**
* Sort collisions from smallest to greatest value
*/
function sortCollisionsAsc(_ref, _ref2) {
	let { data: { value: a } } = _ref;
	let { data: { value: b } } = _ref2;
	return a - b;
}
/**
* Sort collisions from greatest to smallest value
*/
function sortCollisionsDesc(_ref3, _ref4) {
	let { data: { value: a } } = _ref3;
	let { data: { value: b } } = _ref4;
	return b - a;
}
/**
* Returns the coordinates of the corners of a given rectangle:
* [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
*/
function cornersOfRectangle(_ref5) {
	let { left, top, height, width } = _ref5;
	return [
		{
			x: left,
			y: top
		},
		{
			x: left + width,
			y: top
		},
		{
			x: left,
			y: top + height
		},
		{
			x: left + width,
			y: top + height
		}
	];
}
function getFirstCollision(collisions, property) {
	if (!collisions || collisions.length === 0) return null;
	const [firstCollision] = collisions;
	return property ? firstCollision[property] : firstCollision;
}
/**
* Returns the coordinates of the center of a given ClientRect
*/
function centerOfRectangle(rect, left, top) {
	if (left === void 0) left = rect.left;
	if (top === void 0) top = rect.top;
	return {
		x: left + rect.width * .5,
		y: top + rect.height * .5
	};
}
/**
* Returns the closest rectangles from an array of rectangles to the center of a given
* rectangle.
*/
var closestCenter = (_ref) => {
	let { collisionRect, droppableRects, droppableContainers } = _ref;
	const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
	const collisions = [];
	for (const droppableContainer of droppableContainers) {
		const { id } = droppableContainer;
		const rect = droppableRects.get(id);
		if (rect) {
			const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
			collisions.push({
				id,
				data: {
					droppableContainer,
					value: distBetween
				}
			});
		}
	}
	return collisions.sort(sortCollisionsAsc);
};
/**
* Returns the closest rectangles from an array of rectangles to the corners of
* another rectangle.
*/
var closestCorners = (_ref) => {
	let { collisionRect, droppableRects, droppableContainers } = _ref;
	const corners = cornersOfRectangle(collisionRect);
	const collisions = [];
	for (const droppableContainer of droppableContainers) {
		const { id } = droppableContainer;
		const rect = droppableRects.get(id);
		if (rect) {
			const rectCorners = cornersOfRectangle(rect);
			const distances = corners.reduce((accumulator, corner, index) => {
				return accumulator + distanceBetween(rectCorners[index], corner);
			}, 0);
			const effectiveDistance = Number((distances / 4).toFixed(4));
			collisions.push({
				id,
				data: {
					droppableContainer,
					value: effectiveDistance
				}
			});
		}
	}
	return collisions.sort(sortCollisionsAsc);
};
/**
* Returns the intersecting rectangle area between two rectangles
*/
function getIntersectionRatio(entry, target) {
	const top = Math.max(target.top, entry.top);
	const left = Math.max(target.left, entry.left);
	const right = Math.min(target.left + target.width, entry.left + entry.width);
	const bottom = Math.min(target.top + target.height, entry.top + entry.height);
	const width = right - left;
	const height = bottom - top;
	if (left < right && top < bottom) {
		const targetArea = target.width * target.height;
		const entryArea = entry.width * entry.height;
		const intersectionArea = width * height;
		const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
		return Number(intersectionRatio.toFixed(4));
	}
	return 0;
}
/**
* Returns the rectangles that has the greatest intersection area with a given
* rectangle in an array of rectangles.
*/
var rectIntersection = (_ref) => {
	let { collisionRect, droppableRects, droppableContainers } = _ref;
	const collisions = [];
	for (const droppableContainer of droppableContainers) {
		const { id } = droppableContainer;
		const rect = droppableRects.get(id);
		if (rect) {
			const intersectionRatio = getIntersectionRatio(rect, collisionRect);
			if (intersectionRatio > 0) collisions.push({
				id,
				data: {
					droppableContainer,
					value: intersectionRatio
				}
			});
		}
	}
	return collisions.sort(sortCollisionsDesc);
};
function adjustScale(transform, rect1, rect2) {
	return {
		...transform,
		scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
		scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
	};
}
function getRectDelta(rect1, rect2) {
	return rect1 && rect2 ? {
		x: rect1.left - rect2.left,
		y: rect1.top - rect2.top
	} : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
	return function adjustClientRect(rect) {
		for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) adjustments[_key - 1] = arguments[_key];
		return adjustments.reduce((acc, adjustment) => ({
			...acc,
			top: acc.top + modifier * adjustment.y,
			bottom: acc.bottom + modifier * adjustment.y,
			left: acc.left + modifier * adjustment.x,
			right: acc.right + modifier * adjustment.x
		}), { ...rect });
	};
}
var getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
function parseTransform(transform) {
	if (transform.startsWith("matrix3d(")) {
		const transformArray = transform.slice(9, -1).split(/, /);
		return {
			x: +transformArray[12],
			y: +transformArray[13],
			scaleX: +transformArray[0],
			scaleY: +transformArray[5]
		};
	} else if (transform.startsWith("matrix(")) {
		const transformArray = transform.slice(7, -1).split(/, /);
		return {
			x: +transformArray[4],
			y: +transformArray[5],
			scaleX: +transformArray[0],
			scaleY: +transformArray[3]
		};
	}
	return null;
}
function inverseTransform(rect, transform, transformOrigin) {
	const parsedTransform = parseTransform(transform);
	if (!parsedTransform) return rect;
	const { scaleX, scaleY, x: translateX, y: translateY } = parsedTransform;
	const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
	const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
	const w = scaleX ? rect.width / scaleX : rect.width;
	const h = scaleY ? rect.height / scaleY : rect.height;
	return {
		width: w,
		height: h,
		top: y,
		right: x + w,
		bottom: y + h,
		left: x
	};
}
var defaultOptions = { ignoreTransform: false };
/**
* Returns the bounding client rect of an element relative to the viewport.
*/
function getClientRect(element, options) {
	if (options === void 0) options = defaultOptions;
	let rect = element.getBoundingClientRect();
	if (options.ignoreTransform) {
		const { transform, transformOrigin } = getWindow(element).getComputedStyle(element);
		if (transform) rect = inverseTransform(rect, transform, transformOrigin);
	}
	const { top, left, width, height, bottom, right } = rect;
	return {
		top,
		left,
		width,
		height,
		bottom,
		right
	};
}
/**
* Returns the bounding client rect of an element relative to the viewport.
*
* @remarks
* The ClientRect returned by this method does not take into account transforms
* applied to the element it measures.
*
*/
function getTransformAgnosticClientRect(element) {
	return getClientRect(element, { ignoreTransform: true });
}
function getWindowClientRect(element) {
	const width = element.innerWidth;
	const height = element.innerHeight;
	return {
		top: 0,
		left: 0,
		right: width,
		bottom: height,
		width,
		height
	};
}
function isFixed(node, computedStyle) {
	if (computedStyle === void 0) computedStyle = getWindow(node).getComputedStyle(node);
	return computedStyle.position === "fixed";
}
function isScrollable(element, computedStyle) {
	if (computedStyle === void 0) computedStyle = getWindow(element).getComputedStyle(element);
	const overflowRegex = /(auto|scroll|overlay)/;
	return [
		"overflow",
		"overflowX",
		"overflowY"
	].some((property) => {
		const value = computedStyle[property];
		return typeof value === "string" ? overflowRegex.test(value) : false;
	});
}
function getScrollableAncestors(element, limit) {
	const scrollParents = [];
	function findScrollableAncestors(node) {
		if (limit != null && scrollParents.length >= limit) return scrollParents;
		if (!node) return scrollParents;
		if (isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
			scrollParents.push(node.scrollingElement);
			return scrollParents;
		}
		if (!isHTMLElement(node) || isSVGElement(node)) return scrollParents;
		if (scrollParents.includes(node)) return scrollParents;
		const computedStyle = getWindow(element).getComputedStyle(node);
		if (node !== element) {
			if (isScrollable(node, computedStyle)) scrollParents.push(node);
		}
		if (isFixed(node, computedStyle)) return scrollParents;
		return findScrollableAncestors(node.parentNode);
	}
	if (!element) return scrollParents;
	return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
	const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
	return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
	if (!canUseDOM || !element) return null;
	if (isWindow(element)) return element;
	if (!isNode(element)) return null;
	if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) return window;
	if (isHTMLElement(element)) return element;
	return null;
}
function getScrollXCoordinate(element) {
	if (isWindow(element)) return element.scrollX;
	return element.scrollLeft;
}
function getScrollYCoordinate(element) {
	if (isWindow(element)) return element.scrollY;
	return element.scrollTop;
}
function getScrollCoordinates(element) {
	return {
		x: getScrollXCoordinate(element),
		y: getScrollYCoordinate(element)
	};
}
var Direction;
(function(Direction) {
	Direction[Direction["Forward"] = 1] = "Forward";
	Direction[Direction["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
	if (!canUseDOM || !element) return false;
	return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
	const minScroll = {
		x: 0,
		y: 0
	};
	const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
		height: window.innerHeight,
		width: window.innerWidth
	} : {
		height: scrollingContainer.clientHeight,
		width: scrollingContainer.clientWidth
	};
	const maxScroll = {
		x: scrollingContainer.scrollWidth - dimensions.width,
		y: scrollingContainer.scrollHeight - dimensions.height
	};
	return {
		isTop: scrollingContainer.scrollTop <= minScroll.y,
		isLeft: scrollingContainer.scrollLeft <= minScroll.x,
		isBottom: scrollingContainer.scrollTop >= maxScroll.y,
		isRight: scrollingContainer.scrollLeft >= maxScroll.x,
		maxScroll,
		minScroll
	};
}
var defaultThreshold = {
	x: .2,
	y: .2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
	let { top, left, right, bottom } = _ref;
	if (acceleration === void 0) acceleration = 10;
	if (thresholdPercentage === void 0) thresholdPercentage = defaultThreshold;
	const { isTop, isBottom, isLeft, isRight } = getScrollPosition(scrollContainer);
	const direction = {
		x: 0,
		y: 0
	};
	const speed = {
		x: 0,
		y: 0
	};
	const threshold = {
		height: scrollContainerRect.height * thresholdPercentage.y,
		width: scrollContainerRect.width * thresholdPercentage.x
	};
	if (!isTop && top <= scrollContainerRect.top + threshold.height) {
		direction.y = Direction.Backward;
		speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
	} else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
		direction.y = Direction.Forward;
		speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
	}
	if (!isRight && right >= scrollContainerRect.right - threshold.width) {
		direction.x = Direction.Forward;
		speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
	} else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
		direction.x = Direction.Backward;
		speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
	}
	return {
		direction,
		speed
	};
}
function getScrollElementRect(element) {
	if (element === document.scrollingElement) {
		const { innerWidth, innerHeight } = window;
		return {
			top: 0,
			left: 0,
			right: innerWidth,
			bottom: innerHeight,
			width: innerWidth,
			height: innerHeight
		};
	}
	const { top, left, right, bottom } = element.getBoundingClientRect();
	return {
		top,
		left,
		right,
		bottom,
		width: element.clientWidth,
		height: element.clientHeight
	};
}
function getScrollOffsets(scrollableAncestors) {
	return scrollableAncestors.reduce((acc, node) => {
		return add(acc, getScrollCoordinates(node));
	}, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
	return scrollableAncestors.reduce((acc, node) => {
		return acc + getScrollXCoordinate(node);
	}, 0);
}
function getScrollYOffset(scrollableAncestors) {
	return scrollableAncestors.reduce((acc, node) => {
		return acc + getScrollYCoordinate(node);
	}, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
	if (measure === void 0) measure = getClientRect;
	if (!element) return;
	const { top, left, bottom, right } = measure(element);
	if (!getFirstScrollableAncestor(element)) return;
	if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) element.scrollIntoView({
		block: "center",
		inline: "center"
	});
}
var properties = [[
	"x",
	["left", "right"],
	getScrollXOffset
], [
	"y",
	["top", "bottom"],
	getScrollYOffset
]];
var Rect = class {
	constructor(rect, element) {
		this.rect = void 0;
		this.width = void 0;
		this.height = void 0;
		this.top = void 0;
		this.bottom = void 0;
		this.right = void 0;
		this.left = void 0;
		const scrollableAncestors = getScrollableAncestors(element);
		const scrollOffsets = getScrollOffsets(scrollableAncestors);
		this.rect = { ...rect };
		this.width = rect.width;
		this.height = rect.height;
		for (const [axis, keys, getScrollOffset] of properties) for (const key of keys) Object.defineProperty(this, key, {
			get: () => {
				const currentOffsets = getScrollOffset(scrollableAncestors);
				const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
				return this.rect[key] + scrollOffsetsDeltla;
			},
			enumerable: true
		});
		Object.defineProperty(this, "rect", { enumerable: false });
	}
};
var Listeners = class {
	constructor(target) {
		this.target = void 0;
		this.listeners = [];
		this.removeAll = () => {
			this.listeners.forEach((listener) => {
				var _this$target;
				return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
			});
		};
		this.target = target;
	}
	add(eventName, handler, options) {
		var _this$target2;
		(_this$target2 = this.target) == null || _this$target2.addEventListener(eventName, handler, options);
		this.listeners.push([
			eventName,
			handler,
			options
		]);
	}
};
function getEventListenerTarget(target) {
	const { EventTarget } = getWindow(target);
	return target instanceof EventTarget ? target : getOwnerDocument(target);
}
function hasExceededDistance(delta, measurement) {
	const dx = Math.abs(delta.x);
	const dy = Math.abs(delta.y);
	if (typeof measurement === "number") return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
	if ("x" in measurement && "y" in measurement) return dx > measurement.x && dy > measurement.y;
	if ("x" in measurement) return dx > measurement.x;
	if ("y" in measurement) return dy > measurement.y;
	return false;
}
var EventName;
(function(EventName) {
	EventName["Click"] = "click";
	EventName["DragStart"] = "dragstart";
	EventName["Keydown"] = "keydown";
	EventName["ContextMenu"] = "contextmenu";
	EventName["Resize"] = "resize";
	EventName["SelectionChange"] = "selectionchange";
	EventName["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
	event.preventDefault();
}
function stopPropagation(event) {
	event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode) {
	KeyboardCode["Space"] = "Space";
	KeyboardCode["Down"] = "ArrowDown";
	KeyboardCode["Right"] = "ArrowRight";
	KeyboardCode["Left"] = "ArrowLeft";
	KeyboardCode["Up"] = "ArrowUp";
	KeyboardCode["Esc"] = "Escape";
	KeyboardCode["Enter"] = "Enter";
	KeyboardCode["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
var defaultKeyboardCodes = {
	start: [KeyboardCode.Space, KeyboardCode.Enter],
	cancel: [KeyboardCode.Esc],
	end: [
		KeyboardCode.Space,
		KeyboardCode.Enter,
		KeyboardCode.Tab
	]
};
var defaultKeyboardCoordinateGetter = (event, _ref) => {
	let { currentCoordinates } = _ref;
	switch (event.code) {
		case KeyboardCode.Right: return {
			...currentCoordinates,
			x: currentCoordinates.x + 25
		};
		case KeyboardCode.Left: return {
			...currentCoordinates,
			x: currentCoordinates.x - 25
		};
		case KeyboardCode.Down: return {
			...currentCoordinates,
			y: currentCoordinates.y + 25
		};
		case KeyboardCode.Up: return {
			...currentCoordinates,
			y: currentCoordinates.y - 25
		};
	}
};
var KeyboardSensor = class {
	constructor(props) {
		this.props = void 0;
		this.autoScrollEnabled = false;
		this.referenceCoordinates = void 0;
		this.listeners = void 0;
		this.windowListeners = void 0;
		this.props = props;
		const { event: { target } } = props;
		this.props = props;
		this.listeners = new Listeners(getOwnerDocument(target));
		this.windowListeners = new Listeners(getWindow(target));
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.attach();
	}
	attach() {
		this.handleStart();
		this.windowListeners.add(EventName.Resize, this.handleCancel);
		this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
		setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
	}
	handleStart() {
		const { activeNode, onStart } = this.props;
		const node = activeNode.node.current;
		if (node) scrollIntoViewIfNeeded(node);
		onStart(defaultCoordinates);
	}
	handleKeyDown(event) {
		if (isKeyboardEvent(event)) {
			const { active, context, options } = this.props;
			const { keyboardCodes = defaultKeyboardCodes, coordinateGetter = defaultKeyboardCoordinateGetter, scrollBehavior = "smooth" } = options;
			const { code } = event;
			if (keyboardCodes.end.includes(code)) {
				this.handleEnd(event);
				return;
			}
			if (keyboardCodes.cancel.includes(code)) {
				this.handleCancel(event);
				return;
			}
			const { collisionRect } = context.current;
			const currentCoordinates = collisionRect ? {
				x: collisionRect.left,
				y: collisionRect.top
			} : defaultCoordinates;
			if (!this.referenceCoordinates) this.referenceCoordinates = currentCoordinates;
			const newCoordinates = coordinateGetter(event, {
				active,
				context: context.current,
				currentCoordinates
			});
			if (newCoordinates) {
				const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
				const scrollDelta = {
					x: 0,
					y: 0
				};
				const { scrollableAncestors } = context.current;
				for (const scrollContainer of scrollableAncestors) {
					const direction = event.code;
					const { isTop, isRight, isLeft, isBottom, maxScroll, minScroll } = getScrollPosition(scrollContainer);
					const scrollElementRect = getScrollElementRect(scrollContainer);
					const clampedCoordinates = {
						x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
						y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
					};
					const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
					const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
					if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
						const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
						const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
						if (canScrollToNewCoordinates && !coordinatesDelta.y) {
							scrollContainer.scrollTo({
								left: newScrollCoordinates,
								behavior: scrollBehavior
							});
							return;
						}
						if (canScrollToNewCoordinates) scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
						else scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
						if (scrollDelta.x) scrollContainer.scrollBy({
							left: -scrollDelta.x,
							behavior: scrollBehavior
						});
						break;
					} else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
						const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
						const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
						if (canScrollToNewCoordinates && !coordinatesDelta.x) {
							scrollContainer.scrollTo({
								top: newScrollCoordinates,
								behavior: scrollBehavior
							});
							return;
						}
						if (canScrollToNewCoordinates) scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
						else scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
						if (scrollDelta.y) scrollContainer.scrollBy({
							top: -scrollDelta.y,
							behavior: scrollBehavior
						});
						break;
					}
				}
				this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
			}
		}
	}
	handleMove(event, coordinates) {
		const { onMove } = this.props;
		event.preventDefault();
		onMove(coordinates);
	}
	handleEnd(event) {
		const { onEnd } = this.props;
		event.preventDefault();
		this.detach();
		onEnd();
	}
	handleCancel(event) {
		const { onCancel } = this.props;
		event.preventDefault();
		this.detach();
		onCancel();
	}
	detach() {
		this.listeners.removeAll();
		this.windowListeners.removeAll();
	}
};
KeyboardSensor.activators = [{
	eventName: "onKeyDown",
	handler: (event, _ref, _ref2) => {
		let { keyboardCodes = defaultKeyboardCodes, onActivation } = _ref;
		let { active } = _ref2;
		const { code } = event.nativeEvent;
		if (keyboardCodes.start.includes(code)) {
			const activator = active.activatorNode.current;
			if (activator && event.target !== activator) return false;
			event.preventDefault();
			onActivation == null || onActivation({ event: event.nativeEvent });
			return true;
		}
		return false;
	}
}];
function isDistanceConstraint(constraint) {
	return Boolean(constraint && "distance" in constraint);
}
function isDelayConstraint(constraint) {
	return Boolean(constraint && "delay" in constraint);
}
var AbstractPointerSensor = class {
	constructor(props, events, listenerTarget) {
		var _getEventCoordinates;
		if (listenerTarget === void 0) listenerTarget = getEventListenerTarget(props.event.target);
		this.props = void 0;
		this.events = void 0;
		this.autoScrollEnabled = true;
		this.document = void 0;
		this.activated = false;
		this.initialCoordinates = void 0;
		this.timeoutId = null;
		this.listeners = void 0;
		this.documentListeners = void 0;
		this.windowListeners = void 0;
		this.props = props;
		this.events = events;
		const { event } = props;
		const { target } = event;
		this.props = props;
		this.events = events;
		this.document = getOwnerDocument(target);
		this.documentListeners = new Listeners(this.document);
		this.listeners = new Listeners(listenerTarget);
		this.windowListeners = new Listeners(getWindow(target));
		this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
		this.handleStart = this.handleStart.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);
		this.removeTextSelection = this.removeTextSelection.bind(this);
		this.attach();
	}
	attach() {
		const { events, props: { options: { activationConstraint, bypassActivationConstraint } } } = this;
		this.listeners.add(events.move.name, this.handleMove, { passive: false });
		this.listeners.add(events.end.name, this.handleEnd);
		if (events.cancel) this.listeners.add(events.cancel.name, this.handleCancel);
		this.windowListeners.add(EventName.Resize, this.handleCancel);
		this.windowListeners.add(EventName.DragStart, preventDefault);
		this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
		this.windowListeners.add(EventName.ContextMenu, preventDefault);
		this.documentListeners.add(EventName.Keydown, this.handleKeydown);
		if (activationConstraint) {
			if (bypassActivationConstraint != null && bypassActivationConstraint({
				event: this.props.event,
				activeNode: this.props.activeNode,
				options: this.props.options
			})) return this.handleStart();
			if (isDelayConstraint(activationConstraint)) {
				this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
				this.handlePending(activationConstraint);
				return;
			}
			if (isDistanceConstraint(activationConstraint)) {
				this.handlePending(activationConstraint);
				return;
			}
		}
		this.handleStart();
	}
	detach() {
		this.listeners.removeAll();
		this.windowListeners.removeAll();
		setTimeout(this.documentListeners.removeAll, 50);
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
	handlePending(constraint, offset) {
		const { active, onPending } = this.props;
		onPending(active, constraint, this.initialCoordinates, offset);
	}
	handleStart() {
		const { initialCoordinates } = this;
		const { onStart } = this.props;
		if (initialCoordinates) {
			this.activated = true;
			this.documentListeners.add(EventName.Click, stopPropagation, { capture: true });
			this.removeTextSelection();
			this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
			onStart(initialCoordinates);
		}
	}
	handleMove(event) {
		var _getEventCoordinates2;
		const { activated, initialCoordinates, props } = this;
		const { onMove, options: { activationConstraint } } = props;
		if (!initialCoordinates) return;
		const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
		const delta = subtract(initialCoordinates, coordinates);
		if (!activated && activationConstraint) {
			if (isDistanceConstraint(activationConstraint)) {
				if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) return this.handleCancel();
				if (hasExceededDistance(delta, activationConstraint.distance)) return this.handleStart();
			}
			if (isDelayConstraint(activationConstraint)) {
				if (hasExceededDistance(delta, activationConstraint.tolerance)) return this.handleCancel();
			}
			this.handlePending(activationConstraint, delta);
			return;
		}
		if (event.cancelable) event.preventDefault();
		onMove(coordinates);
	}
	handleEnd() {
		const { onAbort, onEnd } = this.props;
		this.detach();
		if (!this.activated) onAbort(this.props.active);
		onEnd();
	}
	handleCancel() {
		const { onAbort, onCancel } = this.props;
		this.detach();
		if (!this.activated) onAbort(this.props.active);
		onCancel();
	}
	handleKeydown(event) {
		if (event.code === KeyboardCode.Esc) this.handleCancel();
	}
	removeTextSelection() {
		var _this$document$getSel;
		(_this$document$getSel = this.document.getSelection()) == null || _this$document$getSel.removeAllRanges();
	}
};
var events = {
	cancel: { name: "pointercancel" },
	move: { name: "pointermove" },
	end: { name: "pointerup" }
};
var PointerSensor = class extends AbstractPointerSensor {
	constructor(props) {
		const { event } = props;
		const listenerTarget = getOwnerDocument(event.target);
		super(props, events, listenerTarget);
	}
};
PointerSensor.activators = [{
	eventName: "onPointerDown",
	handler: (_ref, _ref2) => {
		let { nativeEvent: event } = _ref;
		let { onActivation } = _ref2;
		if (!event.isPrimary || event.button !== 0) return false;
		onActivation == null || onActivation({ event });
		return true;
	}
}];
var events$1 = {
	move: { name: "mousemove" },
	end: { name: "mouseup" }
};
var MouseButton;
(function(MouseButton) {
	MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
var MouseSensor = class extends AbstractPointerSensor {
	constructor(props) {
		super(props, events$1, getOwnerDocument(props.event.target));
	}
};
MouseSensor.activators = [{
	eventName: "onMouseDown",
	handler: (_ref, _ref2) => {
		let { nativeEvent: event } = _ref;
		let { onActivation } = _ref2;
		if (event.button === MouseButton.RightClick) return false;
		onActivation == null || onActivation({ event });
		return true;
	}
}];
var events$2 = {
	cancel: { name: "touchcancel" },
	move: { name: "touchmove" },
	end: { name: "touchend" }
};
var TouchSensor = class extends AbstractPointerSensor {
	constructor(props) {
		super(props, events$2);
	}
	static setup() {
		window.addEventListener(events$2.move.name, noop, {
			capture: false,
			passive: false
		});
		return function teardown() {
			window.removeEventListener(events$2.move.name, noop);
		};
		function noop() {}
	}
};
TouchSensor.activators = [{
	eventName: "onTouchStart",
	handler: (_ref, _ref2) => {
		let { nativeEvent: event } = _ref;
		let { onActivation } = _ref2;
		const { touches } = event;
		if (touches.length > 1) return false;
		onActivation == null || onActivation({ event });
		return true;
	}
}];
var AutoScrollActivator;
(function(AutoScrollActivator) {
	AutoScrollActivator[AutoScrollActivator["Pointer"] = 0] = "Pointer";
	AutoScrollActivator[AutoScrollActivator["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder) {
	TraversalOrder[TraversalOrder["TreeOrder"] = 0] = "TreeOrder";
	TraversalOrder[TraversalOrder["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
	let { acceleration, activator = AutoScrollActivator.Pointer, canScroll, draggingRect, enabled, interval = 5, order = TraversalOrder.TreeOrder, pointerCoordinates, scrollableAncestors, scrollableAncestorRects, delta, threshold } = _ref;
	const scrollIntent = useScrollIntent({
		delta,
		disabled: !enabled
	});
	const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
	const scrollSpeed = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const scrollDirection = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const rect = (0, import_react.useMemo)(() => {
		switch (activator) {
			case AutoScrollActivator.Pointer: return pointerCoordinates ? {
				top: pointerCoordinates.y,
				bottom: pointerCoordinates.y,
				left: pointerCoordinates.x,
				right: pointerCoordinates.x
			} : null;
			case AutoScrollActivator.DraggableRect: return draggingRect;
		}
	}, [
		activator,
		draggingRect,
		pointerCoordinates
	]);
	const scrollContainerRef = (0, import_react.useRef)(null);
	const autoScroll = (0, import_react.useCallback)(() => {
		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer) return;
		const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
		const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
		scrollContainer.scrollBy(scrollLeft, scrollTop);
	}, []);
	const sortedScrollableAncestors = (0, import_react.useMemo)(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
	(0, import_react.useEffect)(() => {
		if (!enabled || !scrollableAncestors.length || !rect) {
			clearAutoScrollInterval();
			return;
		}
		for (const scrollContainer of sortedScrollableAncestors) {
			if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) continue;
			const scrollContainerRect = scrollableAncestorRects[scrollableAncestors.indexOf(scrollContainer)];
			if (!scrollContainerRect) continue;
			const { direction, speed } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
			for (const axis of ["x", "y"]) if (!scrollIntent[axis][direction[axis]]) {
				speed[axis] = 0;
				direction[axis] = 0;
			}
			if (speed.x > 0 || speed.y > 0) {
				clearAutoScrollInterval();
				scrollContainerRef.current = scrollContainer;
				setAutoScrollInterval(autoScroll, interval);
				scrollSpeed.current = speed;
				scrollDirection.current = direction;
				return;
			}
		}
		scrollSpeed.current = {
			x: 0,
			y: 0
		};
		scrollDirection.current = {
			x: 0,
			y: 0
		};
		clearAutoScrollInterval();
	}, [
		acceleration,
		autoScroll,
		canScroll,
		clearAutoScrollInterval,
		enabled,
		interval,
		JSON.stringify(rect),
		JSON.stringify(scrollIntent),
		setAutoScrollInterval,
		scrollableAncestors,
		sortedScrollableAncestors,
		scrollableAncestorRects,
		JSON.stringify(threshold)
	]);
}
var defaultScrollIntent = {
	x: {
		[Direction.Backward]: false,
		[Direction.Forward]: false
	},
	y: {
		[Direction.Backward]: false,
		[Direction.Forward]: false
	}
};
function useScrollIntent(_ref2) {
	let { delta, disabled } = _ref2;
	const previousDelta = usePrevious(delta);
	return useLazyMemo((previousIntent) => {
		if (disabled || !previousDelta || !previousIntent) return defaultScrollIntent;
		const direction = {
			x: Math.sign(delta.x - previousDelta.x),
			y: Math.sign(delta.y - previousDelta.y)
		};
		return {
			x: {
				[Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
				[Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
			},
			y: {
				[Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
				[Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
			}
		};
	}, [
		disabled,
		delta,
		previousDelta
	]);
}
function useCachedNode(draggableNodes, id) {
	const draggableNode = id != null ? draggableNodes.get(id) : void 0;
	const node = draggableNode ? draggableNode.node.current : null;
	return useLazyMemo((cachedNode) => {
		var _ref;
		if (id == null) return null;
		return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
	}, [node, id]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
	return (0, import_react.useMemo)(() => sensors.reduce((accumulator, sensor) => {
		const { sensor: Sensor } = sensor;
		const sensorActivators = Sensor.activators.map((activator) => ({
			eventName: activator.eventName,
			handler: getSyntheticHandler(activator.handler, sensor)
		}));
		return [...accumulator, ...sensorActivators];
	}, []), [sensors, getSyntheticHandler]);
}
var MeasuringStrategy;
(function(MeasuringStrategy) {
	MeasuringStrategy[MeasuringStrategy["Always"] = 0] = "Always";
	MeasuringStrategy[MeasuringStrategy["BeforeDragging"] = 1] = "BeforeDragging";
	MeasuringStrategy[MeasuringStrategy["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency) {
	MeasuringFrequency["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
var defaultValue = /* @__PURE__ */ new Map();
function useDroppableMeasuring(containers, _ref) {
	let { dragging, dependencies, config } = _ref;
	const [queue, setQueue] = (0, import_react.useState)(null);
	const { frequency, measure, strategy } = config;
	const containersRef = (0, import_react.useRef)(containers);
	const disabled = isDisabled();
	const disabledRef = useLatestValue(disabled);
	const measureDroppableContainers = (0, import_react.useCallback)(function(ids) {
		if (ids === void 0) ids = [];
		if (disabledRef.current) return;
		setQueue((value) => {
			if (value === null) return ids;
			return value.concat(ids.filter((id) => !value.includes(id)));
		});
	}, [disabledRef]);
	const timeoutId = (0, import_react.useRef)(null);
	const droppableRects = useLazyMemo((previousValue) => {
		if (disabled && !dragging) return defaultValue;
		if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
			const map = /* @__PURE__ */ new Map();
			for (let container of containers) {
				if (!container) continue;
				if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
					map.set(container.id, container.rect.current);
					continue;
				}
				const node = container.node.current;
				const rect = node ? new Rect(measure(node), node) : null;
				container.rect.current = rect;
				if (rect) map.set(container.id, rect);
			}
			return map;
		}
		return previousValue;
	}, [
		containers,
		queue,
		dragging,
		disabled,
		measure
	]);
	(0, import_react.useEffect)(() => {
		containersRef.current = containers;
	}, [containers]);
	(0, import_react.useEffect)(() => {
		if (disabled) return;
		measureDroppableContainers();
	}, [dragging, disabled]);
	(0, import_react.useEffect)(() => {
		if (queue && queue.length > 0) setQueue(null);
	}, [JSON.stringify(queue)]);
	(0, import_react.useEffect)(() => {
		if (disabled || typeof frequency !== "number" || timeoutId.current !== null) return;
		timeoutId.current = setTimeout(() => {
			measureDroppableContainers();
			timeoutId.current = null;
		}, frequency);
	}, [
		frequency,
		disabled,
		measureDroppableContainers,
		...dependencies
	]);
	return {
		droppableRects,
		measureDroppableContainers,
		measuringScheduled: queue != null
	};
	function isDisabled() {
		switch (strategy) {
			case MeasuringStrategy.Always: return false;
			case MeasuringStrategy.BeforeDragging: return dragging;
			default: return !dragging;
		}
	}
}
function useInitialValue(value, computeFn) {
	return useLazyMemo((previousValue) => {
		if (!value) return null;
		if (previousValue) return previousValue;
		return typeof computeFn === "function" ? computeFn(value) : value;
	}, [computeFn, value]);
}
function useInitialRect(node, measure) {
	return useInitialValue(node, measure);
}
/**
* Returns a new MutationObserver instance.
* If `MutationObserver` is undefined in the execution environment, returns `undefined`.
*/
function useMutationObserver(_ref) {
	let { callback, disabled } = _ref;
	const handleMutations = useEvent(callback);
	const mutationObserver = (0, import_react.useMemo)(() => {
		if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") return;
		const { MutationObserver } = window;
		return new MutationObserver(handleMutations);
	}, [handleMutations, disabled]);
	(0, import_react.useEffect)(() => {
		return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
	}, [mutationObserver]);
	return mutationObserver;
}
/**
* Returns a new ResizeObserver instance bound to the `onResize` callback.
* If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
*/
function useResizeObserver(_ref) {
	let { callback, disabled } = _ref;
	const handleResize = useEvent(callback);
	const resizeObserver = (0, import_react.useMemo)(() => {
		if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") return;
		const { ResizeObserver } = window;
		return new ResizeObserver(handleResize);
	}, [disabled]);
	(0, import_react.useEffect)(() => {
		return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
	}, [resizeObserver]);
	return resizeObserver;
}
function defaultMeasure(element) {
	return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
	if (measure === void 0) measure = defaultMeasure;
	const [rect, setRect] = (0, import_react.useState)(null);
	function measureRect() {
		setRect((currentRect) => {
			if (!element) return null;
			if (element.isConnected === false) {
				var _ref;
				return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
			}
			const newRect = measure(element);
			if (JSON.stringify(currentRect) === JSON.stringify(newRect)) return currentRect;
			return newRect;
		});
	}
	const mutationObserver = useMutationObserver({ callback(records) {
		if (!element) return;
		for (const record of records) {
			const { type, target } = record;
			if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
				measureRect();
				break;
			}
		}
	} });
	const resizeObserver = useResizeObserver({ callback: measureRect });
	useIsomorphicLayoutEffect(() => {
		measureRect();
		if (element) {
			resizeObserver == null || resizeObserver.observe(element);
			mutationObserver == null || mutationObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
		} else {
			resizeObserver == null || resizeObserver.disconnect();
			mutationObserver == null || mutationObserver.disconnect();
		}
	}, [element]);
	return rect;
}
function useRectDelta(rect) {
	return getRectDelta(rect, useInitialValue(rect));
}
var defaultValue$1 = [];
function useScrollableAncestors(node) {
	const previousNode = (0, import_react.useRef)(node);
	const ancestors = useLazyMemo((previousValue) => {
		if (!node) return defaultValue$1;
		if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) return previousValue;
		return getScrollableAncestors(node);
	}, [node]);
	(0, import_react.useEffect)(() => {
		previousNode.current = node;
	}, [node]);
	return ancestors;
}
function useScrollOffsets(elements) {
	const [scrollCoordinates, setScrollCoordinates] = (0, import_react.useState)(null);
	const prevElements = (0, import_react.useRef)(elements);
	const handleScroll = (0, import_react.useCallback)((event) => {
		const scrollingElement = getScrollableElement(event.target);
		if (!scrollingElement) return;
		setScrollCoordinates((scrollCoordinates) => {
			if (!scrollCoordinates) return null;
			scrollCoordinates.set(scrollingElement, getScrollCoordinates(scrollingElement));
			return new Map(scrollCoordinates);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const previousElements = prevElements.current;
		if (elements !== previousElements) {
			cleanup(previousElements);
			const entries = elements.map((element) => {
				const scrollableElement = getScrollableElement(element);
				if (scrollableElement) {
					scrollableElement.addEventListener("scroll", handleScroll, { passive: true });
					return [scrollableElement, getScrollCoordinates(scrollableElement)];
				}
				return null;
			}).filter((entry) => entry != null);
			setScrollCoordinates(entries.length ? new Map(entries) : null);
			prevElements.current = elements;
		}
		return () => {
			cleanup(elements);
			cleanup(previousElements);
		};
		function cleanup(elements) {
			elements.forEach((element) => {
				const scrollableElement = getScrollableElement(element);
				scrollableElement == null || scrollableElement.removeEventListener("scroll", handleScroll);
			});
		}
	}, [handleScroll, elements]);
	return (0, import_react.useMemo)(() => {
		if (elements.length) return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
		return defaultCoordinates;
	}, [elements, scrollCoordinates]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
	if (dependencies === void 0) dependencies = [];
	const initialScrollOffsets = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		initialScrollOffsets.current = null;
	}, dependencies);
	(0, import_react.useEffect)(() => {
		const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
		if (hasScrollOffsets && !initialScrollOffsets.current) initialScrollOffsets.current = scrollOffsets;
		if (!hasScrollOffsets && initialScrollOffsets.current) initialScrollOffsets.current = null;
	}, [scrollOffsets]);
	return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
	(0, import_react.useEffect)(() => {
		if (!canUseDOM) return;
		const teardownFns = sensors.map((_ref) => {
			let { sensor } = _ref;
			return sensor.setup == null ? void 0 : sensor.setup();
		});
		return () => {
			for (const teardown of teardownFns) teardown == null || teardown();
		};
	}, sensors.map((_ref2) => {
		let { sensor } = _ref2;
		return sensor;
	}));
}
function useSyntheticListeners(listeners, id) {
	return (0, import_react.useMemo)(() => {
		return listeners.reduce((acc, _ref) => {
			let { eventName, handler } = _ref;
			acc[eventName] = (event) => {
				handler(event, id);
			};
			return acc;
		}, {});
	}, [listeners, id]);
}
function useWindowRect(element) {
	return (0, import_react.useMemo)(() => element ? getWindowClientRect(element) : null, [element]);
}
var defaultValue$2 = [];
function useRects(elements, measure) {
	if (measure === void 0) measure = getClientRect;
	const [firstElement] = elements;
	const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
	const [rects, setRects] = (0, import_react.useState)(defaultValue$2);
	function measureRects() {
		setRects(() => {
			if (!elements.length) return defaultValue$2;
			return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
		});
	}
	const resizeObserver = useResizeObserver({ callback: measureRects });
	useIsomorphicLayoutEffect(() => {
		resizeObserver == null || resizeObserver.disconnect();
		measureRects();
		elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
	}, [elements]);
	return rects;
}
function getMeasurableNode(node) {
	if (!node) return null;
	if (node.children.length > 1) return node;
	const firstChild = node.children[0];
	return isHTMLElement(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
	let { measure } = _ref;
	const [rect, setRect] = (0, import_react.useState)(null);
	const resizeObserver = useResizeObserver({ callback: (0, import_react.useCallback)((entries) => {
		for (const { target } of entries) if (isHTMLElement(target)) {
			setRect((rect) => {
				const newRect = measure(target);
				return rect ? {
					...rect,
					width: newRect.width,
					height: newRect.height
				} : newRect;
			});
			break;
		}
	}, [measure]) });
	const [nodeRef, setRef] = useNodeRef((0, import_react.useCallback)((element) => {
		const node = getMeasurableNode(element);
		resizeObserver == null || resizeObserver.disconnect();
		if (node) resizeObserver == null || resizeObserver.observe(node);
		setRect(node ? measure(node) : null);
	}, [measure, resizeObserver]));
	return (0, import_react.useMemo)(() => ({
		nodeRef,
		rect,
		setRef
	}), [
		rect,
		nodeRef,
		setRef
	]);
}
var defaultSensors = [{
	sensor: PointerSensor,
	options: {}
}, {
	sensor: KeyboardSensor,
	options: {}
}];
var defaultData = { current: {} };
var defaultMeasuringConfiguration = {
	draggable: { measure: getTransformAgnosticClientRect },
	droppable: {
		measure: getTransformAgnosticClientRect,
		strategy: MeasuringStrategy.WhileDragging,
		frequency: MeasuringFrequency.Optimized
	},
	dragOverlay: { measure: getClientRect }
};
var DroppableContainersMap = class extends Map {
	get(id) {
		var _super$get;
		return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
	}
	toArray() {
		return Array.from(this.values());
	}
	getEnabled() {
		return this.toArray().filter((_ref) => {
			let { disabled } = _ref;
			return !disabled;
		});
	}
	getNodeFor(id) {
		var _this$get$node$curren, _this$get;
		return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
	}
};
var defaultPublicContext = {
	activatorEvent: null,
	active: null,
	activeNode: null,
	activeNodeRect: null,
	collisions: null,
	containerNodeRect: null,
	draggableNodes: /* @__PURE__ */ new Map(),
	droppableRects: /* @__PURE__ */ new Map(),
	droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
	over: null,
	dragOverlay: {
		nodeRef: { current: null },
		rect: null,
		setRef: noop
	},
	scrollableAncestors: [],
	scrollableAncestorRects: [],
	measuringConfiguration: defaultMeasuringConfiguration,
	measureDroppableContainers: noop,
	windowRect: null,
	measuringScheduled: false
};
var defaultInternalContext = {
	activatorEvent: null,
	activators: [],
	active: null,
	activeNodeRect: null,
	ariaDescribedById: { draggable: "" },
	dispatch: noop,
	draggableNodes: /* @__PURE__ */ new Map(),
	over: null,
	measureDroppableContainers: noop
};
var InternalContext = /* @__PURE__ */ (0, import_react.createContext)(defaultInternalContext);
var PublicContext = /* @__PURE__ */ (0, import_react.createContext)(defaultPublicContext);
function getInitialState() {
	return {
		draggable: {
			active: null,
			initialCoordinates: {
				x: 0,
				y: 0
			},
			nodes: /* @__PURE__ */ new Map(),
			translate: {
				x: 0,
				y: 0
			}
		},
		droppable: { containers: new DroppableContainersMap() }
	};
}
function reducer(state, action) {
	switch (action.type) {
		case Action.DragStart: return {
			...state,
			draggable: {
				...state.draggable,
				initialCoordinates: action.initialCoordinates,
				active: action.active
			}
		};
		case Action.DragMove:
			if (state.draggable.active == null) return state;
			return {
				...state,
				draggable: {
					...state.draggable,
					translate: {
						x: action.coordinates.x - state.draggable.initialCoordinates.x,
						y: action.coordinates.y - state.draggable.initialCoordinates.y
					}
				}
			};
		case Action.DragEnd:
		case Action.DragCancel: return {
			...state,
			draggable: {
				...state.draggable,
				active: null,
				initialCoordinates: {
					x: 0,
					y: 0
				},
				translate: {
					x: 0,
					y: 0
				}
			}
		};
		case Action.RegisterDroppable: {
			const { element } = action;
			const { id } = element;
			const containers = new DroppableContainersMap(state.droppable.containers);
			containers.set(id, element);
			return {
				...state,
				droppable: {
					...state.droppable,
					containers
				}
			};
		}
		case Action.SetDroppableDisabled: {
			const { id, key, disabled } = action;
			const element = state.droppable.containers.get(id);
			if (!element || key !== element.key) return state;
			const containers = new DroppableContainersMap(state.droppable.containers);
			containers.set(id, {
				...element,
				disabled
			});
			return {
				...state,
				droppable: {
					...state.droppable,
					containers
				}
			};
		}
		case Action.UnregisterDroppable: {
			const { id, key } = action;
			const element = state.droppable.containers.get(id);
			if (!element || key !== element.key) return state;
			const containers = new DroppableContainersMap(state.droppable.containers);
			containers.delete(id);
			return {
				...state,
				droppable: {
					...state.droppable,
					containers
				}
			};
		}
		default: return state;
	}
}
function RestoreFocus(_ref) {
	let { disabled } = _ref;
	const { active, activatorEvent, draggableNodes } = (0, import_react.useContext)(InternalContext);
	const previousActivatorEvent = usePrevious(activatorEvent);
	const previousActiveId = usePrevious(active == null ? void 0 : active.id);
	(0, import_react.useEffect)(() => {
		if (disabled) return;
		if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
			if (!isKeyboardEvent(previousActivatorEvent)) return;
			if (document.activeElement === previousActivatorEvent.target) return;
			const draggableNode = draggableNodes.get(previousActiveId);
			if (!draggableNode) return;
			const { activatorNode, node } = draggableNode;
			if (!activatorNode.current && !node.current) return;
			requestAnimationFrame(() => {
				for (const element of [activatorNode.current, node.current]) {
					if (!element) continue;
					const focusableNode = findFirstFocusableNode(element);
					if (focusableNode) {
						focusableNode.focus();
						break;
					}
				}
			});
		}
	}, [
		activatorEvent,
		disabled,
		draggableNodes,
		previousActiveId,
		previousActivatorEvent
	]);
	return null;
}
function applyModifiers(modifiers, _ref) {
	let { transform, ...args } = _ref;
	return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
		return modifier({
			transform: accumulator,
			...args
		});
	}, transform) : transform;
}
function useMeasuringConfiguration(config) {
	return (0, import_react.useMemo)(() => ({
		draggable: {
			...defaultMeasuringConfiguration.draggable,
			...config == null ? void 0 : config.draggable
		},
		droppable: {
			...defaultMeasuringConfiguration.droppable,
			...config == null ? void 0 : config.droppable
		},
		dragOverlay: {
			...defaultMeasuringConfiguration.dragOverlay,
			...config == null ? void 0 : config.dragOverlay
		}
	}), [
		config == null ? void 0 : config.draggable,
		config == null ? void 0 : config.droppable,
		config == null ? void 0 : config.dragOverlay
	]);
}
function useLayoutShiftScrollCompensation(_ref) {
	let { activeNode, measure, initialRect, config = true } = _ref;
	const initialized = (0, import_react.useRef)(false);
	const { x, y } = typeof config === "boolean" ? {
		x: config,
		y: config
	} : config;
	useIsomorphicLayoutEffect(() => {
		if (!x && !y || !activeNode) {
			initialized.current = false;
			return;
		}
		if (initialized.current || !initialRect) return;
		const node = activeNode == null ? void 0 : activeNode.node.current;
		if (!node || node.isConnected === false) return;
		const rectDelta = getRectDelta(measure(node), initialRect);
		if (!x) rectDelta.x = 0;
		if (!y) rectDelta.y = 0;
		initialized.current = true;
		if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
			const firstScrollableAncestor = getFirstScrollableAncestor(node);
			if (firstScrollableAncestor) firstScrollableAncestor.scrollBy({
				top: rectDelta.y,
				left: rectDelta.x
			});
		}
	}, [
		activeNode,
		x,
		y,
		initialRect,
		measure
	]);
}
var ActiveDraggableContext = /* @__PURE__ */ (0, import_react.createContext)({
	...defaultCoordinates,
	scaleX: 1,
	scaleY: 1
});
var Status;
(function(Status) {
	Status[Status["Uninitialized"] = 0] = "Uninitialized";
	Status[Status["Initializing"] = 1] = "Initializing";
	Status[Status["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
var DndContext = /* @__PURE__ */ (0, import_react.memo)(function DndContext(_ref) {
	var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
	let { id, accessibility, autoScroll = true, children, sensors = defaultSensors, collisionDetection = rectIntersection, measuring, modifiers, ...props } = _ref;
	const [state, dispatch] = (0, import_react.useReducer)(reducer, void 0, getInitialState);
	const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
	const [status, setStatus] = (0, import_react.useState)(Status.Uninitialized);
	const isInitialized = status === Status.Initialized;
	const { draggable: { active: activeId, nodes: draggableNodes, translate }, droppable: { containers: droppableContainers } } = state;
	const node = activeId != null ? draggableNodes.get(activeId) : null;
	const activeRects = (0, import_react.useRef)({
		initial: null,
		translated: null
	});
	const active = (0, import_react.useMemo)(() => {
		var _node$data;
		return activeId != null ? {
			id: activeId,
			data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
			rect: activeRects
		} : null;
	}, [activeId, node]);
	const activeRef = (0, import_react.useRef)(null);
	const [activeSensor, setActiveSensor] = (0, import_react.useState)(null);
	const [activatorEvent, setActivatorEvent] = (0, import_react.useState)(null);
	const latestProps = useLatestValue(props, Object.values(props));
	const draggableDescribedById = useUniqueId("DndDescribedBy", id);
	const enabledDroppableContainers = (0, import_react.useMemo)(() => droppableContainers.getEnabled(), [droppableContainers]);
	const measuringConfiguration = useMeasuringConfiguration(measuring);
	const { droppableRects, measureDroppableContainers, measuringScheduled } = useDroppableMeasuring(enabledDroppableContainers, {
		dragging: isInitialized,
		dependencies: [translate.x, translate.y],
		config: measuringConfiguration.droppable
	});
	const activeNode = useCachedNode(draggableNodes, activeId);
	const activationCoordinates = (0, import_react.useMemo)(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
	const autoScrollOptions = getAutoScrollerOptions();
	const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
	useLayoutShiftScrollCompensation({
		activeNode: activeId != null ? draggableNodes.get(activeId) : null,
		config: autoScrollOptions.layoutShiftCompensation,
		initialRect: initialActiveNodeRect,
		measure: measuringConfiguration.draggable.measure
	});
	const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
	const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
	const sensorContext = (0, import_react.useRef)({
		activatorEvent: null,
		active: null,
		activeNode,
		collisionRect: null,
		collisions: null,
		droppableRects,
		draggableNodes,
		draggingNode: null,
		draggingNodeRect: null,
		droppableContainers,
		over: null,
		scrollableAncestors: [],
		scrollAdjustedTranslate: null
	});
	const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
	const dragOverlay = useDragOverlayMeasuring({ measure: measuringConfiguration.dragOverlay.measure });
	const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
	const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
	const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
	const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
	const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
	const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
	const scrollableAncestorRects = useRects(scrollableAncestors);
	const modifiedTranslate = applyModifiers(modifiers, {
		transform: {
			x: translate.x - nodeRectDelta.x,
			y: translate.y - nodeRectDelta.y,
			scaleX: 1,
			scaleY: 1
		},
		activatorEvent,
		active,
		activeNodeRect,
		containerNodeRect,
		draggingNodeRect,
		over: sensorContext.current.over,
		overlayNodeRect: dragOverlay.rect,
		scrollableAncestors,
		scrollableAncestorRects,
		windowRect
	});
	const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
	const scrollOffsets = useScrollOffsets(scrollableAncestors);
	const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
	const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
	const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
	const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
	const collisions = active && collisionRect ? collisionDetection({
		active,
		collisionRect,
		droppableRects,
		droppableContainers: enabledDroppableContainers,
		pointerCoordinates
	}) : null;
	const overId = getFirstCollision(collisions, "id");
	const [over, setOver] = (0, import_react.useState)(null);
	const transform = adjustScale(usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta), (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
	const activeSensorRef = (0, import_react.useRef)(null);
	const instantiateSensor = (0, import_react.useCallback)((event, _ref2) => {
		let { sensor: Sensor, options } = _ref2;
		if (activeRef.current == null) return;
		const activeNode = draggableNodes.get(activeRef.current);
		if (!activeNode) return;
		const activatorEvent = event.nativeEvent;
		activeSensorRef.current = new Sensor({
			active: activeRef.current,
			activeNode,
			event: activatorEvent,
			options,
			context: sensorContext,
			onAbort(id) {
				if (!draggableNodes.get(id)) return;
				const { onDragAbort } = latestProps.current;
				const event = { id };
				onDragAbort == null || onDragAbort(event);
				dispatchMonitorEvent({
					type: "onDragAbort",
					event
				});
			},
			onPending(id, constraint, initialCoordinates, offset) {
				if (!draggableNodes.get(id)) return;
				const { onDragPending } = latestProps.current;
				const event = {
					id,
					constraint,
					initialCoordinates,
					offset
				};
				onDragPending == null || onDragPending(event);
				dispatchMonitorEvent({
					type: "onDragPending",
					event
				});
			},
			onStart(initialCoordinates) {
				const id = activeRef.current;
				if (id == null) return;
				const draggableNode = draggableNodes.get(id);
				if (!draggableNode) return;
				const { onDragStart } = latestProps.current;
				const event = {
					activatorEvent,
					active: {
						id,
						data: draggableNode.data,
						rect: activeRects
					}
				};
				(0, import_react_dom.unstable_batchedUpdates)(() => {
					onDragStart == null || onDragStart(event);
					setStatus(Status.Initializing);
					dispatch({
						type: Action.DragStart,
						initialCoordinates,
						active: id
					});
					dispatchMonitorEvent({
						type: "onDragStart",
						event
					});
					setActiveSensor(activeSensorRef.current);
					setActivatorEvent(activatorEvent);
				});
			},
			onMove(coordinates) {
				dispatch({
					type: Action.DragMove,
					coordinates
				});
			},
			onEnd: createHandler(Action.DragEnd),
			onCancel: createHandler(Action.DragCancel)
		});
		function createHandler(type) {
			return async function handler() {
				const { active, collisions, over, scrollAdjustedTranslate } = sensorContext.current;
				let event = null;
				if (active && scrollAdjustedTranslate) {
					const { cancelDrop } = latestProps.current;
					event = {
						activatorEvent,
						active,
						collisions,
						delta: scrollAdjustedTranslate,
						over
					};
					if (type === Action.DragEnd && typeof cancelDrop === "function") {
						if (await Promise.resolve(cancelDrop(event))) type = Action.DragCancel;
					}
				}
				activeRef.current = null;
				(0, import_react_dom.unstable_batchedUpdates)(() => {
					dispatch({ type });
					setStatus(Status.Uninitialized);
					setOver(null);
					setActiveSensor(null);
					setActivatorEvent(null);
					activeSensorRef.current = null;
					const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
					if (event) {
						const handler = latestProps.current[eventName];
						handler == null || handler(event);
						dispatchMonitorEvent({
							type: eventName,
							event
						});
					}
				});
			};
		}
	}, [draggableNodes]);
	const activators = useCombineActivators(sensors, (0, import_react.useCallback)((handler, sensor) => {
		return (event, active) => {
			const nativeEvent = event.nativeEvent;
			const activeDraggableNode = draggableNodes.get(active);
			if (activeRef.current !== null || !activeDraggableNode || nativeEvent.dndKit || nativeEvent.defaultPrevented) return;
			const activationContext = { active: activeDraggableNode };
			if (handler(event, sensor.options, activationContext) === true) {
				nativeEvent.dndKit = { capturedBy: sensor.sensor };
				activeRef.current = active;
				instantiateSensor(event, sensor);
			}
		};
	}, [draggableNodes, instantiateSensor]));
	useSensorSetup(sensors);
	useIsomorphicLayoutEffect(() => {
		if (activeNodeRect && status === Status.Initializing) setStatus(Status.Initialized);
	}, [activeNodeRect, status]);
	(0, import_react.useEffect)(() => {
		const { onDragMove } = latestProps.current;
		const { active, activatorEvent, collisions, over } = sensorContext.current;
		if (!active || !activatorEvent) return;
		const event = {
			active,
			activatorEvent,
			collisions,
			delta: {
				x: scrollAdjustedTranslate.x,
				y: scrollAdjustedTranslate.y
			},
			over
		};
		(0, import_react_dom.unstable_batchedUpdates)(() => {
			onDragMove == null || onDragMove(event);
			dispatchMonitorEvent({
				type: "onDragMove",
				event
			});
		});
	}, [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]);
	(0, import_react.useEffect)(() => {
		const { active, activatorEvent, collisions, droppableContainers, scrollAdjustedTranslate } = sensorContext.current;
		if (!active || activeRef.current == null || !activatorEvent || !scrollAdjustedTranslate) return;
		const { onDragOver } = latestProps.current;
		const overContainer = droppableContainers.get(overId);
		const over = overContainer && overContainer.rect.current ? {
			id: overContainer.id,
			rect: overContainer.rect.current,
			data: overContainer.data,
			disabled: overContainer.disabled
		} : null;
		const event = {
			active,
			activatorEvent,
			collisions,
			delta: {
				x: scrollAdjustedTranslate.x,
				y: scrollAdjustedTranslate.y
			},
			over
		};
		(0, import_react_dom.unstable_batchedUpdates)(() => {
			setOver(over);
			onDragOver == null || onDragOver(event);
			dispatchMonitorEvent({
				type: "onDragOver",
				event
			});
		});
	}, [overId]);
	useIsomorphicLayoutEffect(() => {
		sensorContext.current = {
			activatorEvent,
			active,
			activeNode,
			collisionRect,
			collisions,
			droppableRects,
			draggableNodes,
			draggingNode,
			draggingNodeRect,
			droppableContainers,
			over,
			scrollableAncestors,
			scrollAdjustedTranslate
		};
		activeRects.current = {
			initial: draggingNodeRect,
			translated: collisionRect
		};
	}, [
		active,
		activeNode,
		collisions,
		collisionRect,
		draggableNodes,
		draggingNode,
		draggingNodeRect,
		droppableRects,
		droppableContainers,
		over,
		scrollableAncestors,
		scrollAdjustedTranslate
	]);
	useAutoScroller({
		...autoScrollOptions,
		delta: translate,
		draggingRect: collisionRect,
		pointerCoordinates,
		scrollableAncestors,
		scrollableAncestorRects
	});
	const publicContext = (0, import_react.useMemo)(() => {
		return {
			active,
			activeNode,
			activeNodeRect,
			activatorEvent,
			collisions,
			containerNodeRect,
			dragOverlay,
			draggableNodes,
			droppableContainers,
			droppableRects,
			over,
			measureDroppableContainers,
			scrollableAncestors,
			scrollableAncestorRects,
			measuringConfiguration,
			measuringScheduled,
			windowRect
		};
	}, [
		active,
		activeNode,
		activeNodeRect,
		activatorEvent,
		collisions,
		containerNodeRect,
		dragOverlay,
		draggableNodes,
		droppableContainers,
		droppableRects,
		over,
		measureDroppableContainers,
		scrollableAncestors,
		scrollableAncestorRects,
		measuringConfiguration,
		measuringScheduled,
		windowRect
	]);
	const internalContext = (0, import_react.useMemo)(() => {
		return {
			activatorEvent,
			activators,
			active,
			activeNodeRect,
			ariaDescribedById: { draggable: draggableDescribedById },
			dispatch,
			draggableNodes,
			over,
			measureDroppableContainers
		};
	}, [
		activatorEvent,
		activators,
		active,
		activeNodeRect,
		dispatch,
		draggableDescribedById,
		draggableNodes,
		over,
		measureDroppableContainers
	]);
	return import_react.createElement(DndMonitorContext.Provider, { value: registerMonitorListener }, import_react.createElement(InternalContext.Provider, { value: internalContext }, import_react.createElement(PublicContext.Provider, { value: publicContext }, import_react.createElement(ActiveDraggableContext.Provider, { value: transform }, children)), import_react.createElement(RestoreFocus, { disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false })), import_react.createElement(Accessibility, {
		...accessibility,
		hiddenTextDescribedById: draggableDescribedById
	}));
	function getAutoScrollerOptions() {
		const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
		const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
		const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
		if (typeof autoScroll === "object") return {
			...autoScroll,
			enabled
		};
		return { enabled };
	}
});
var NullContext = /* @__PURE__ */ (0, import_react.createContext)(null);
var defaultRole = "button";
var ID_PREFIX$1 = "Draggable";
function useDraggable(_ref) {
	let { id, data, disabled = false, attributes } = _ref;
	const key = useUniqueId(ID_PREFIX$1);
	const { activators, activatorEvent, active, activeNodeRect, ariaDescribedById, draggableNodes, over } = (0, import_react.useContext)(InternalContext);
	const { role = defaultRole, roleDescription = "draggable", tabIndex = 0 } = attributes != null ? attributes : {};
	const isDragging = (active == null ? void 0 : active.id) === id;
	const transform = (0, import_react.useContext)(isDragging ? ActiveDraggableContext : NullContext);
	const [node, setNodeRef] = useNodeRef();
	const [activatorNode, setActivatorNodeRef] = useNodeRef();
	const listeners = useSyntheticListeners(activators, id);
	const dataRef = useLatestValue(data);
	useIsomorphicLayoutEffect(() => {
		draggableNodes.set(id, {
			id,
			key,
			node,
			activatorNode,
			data: dataRef
		});
		return () => {
			const node = draggableNodes.get(id);
			if (node && node.key === key) draggableNodes.delete(id);
		};
	}, [draggableNodes, id]);
	return {
		active,
		activatorEvent,
		activeNodeRect,
		attributes: (0, import_react.useMemo)(() => ({
			role,
			tabIndex,
			"aria-disabled": disabled,
			"aria-pressed": isDragging && role === defaultRole ? true : void 0,
			"aria-roledescription": roleDescription,
			"aria-describedby": ariaDescribedById.draggable
		}), [
			disabled,
			role,
			tabIndex,
			isDragging,
			roleDescription,
			ariaDescribedById.draggable
		]),
		isDragging,
		listeners: disabled ? void 0 : listeners,
		node,
		over,
		setNodeRef,
		setActivatorNodeRef,
		transform
	};
}
function useDndContext() {
	return (0, import_react.useContext)(PublicContext);
}
var ID_PREFIX$1$1 = "Droppable";
var defaultResizeObserverConfig = { timeout: 25 };
function useDroppable(_ref) {
	let { data, disabled = false, id, resizeObserverConfig } = _ref;
	const key = useUniqueId(ID_PREFIX$1$1);
	const { active, dispatch, over, measureDroppableContainers } = (0, import_react.useContext)(InternalContext);
	const previous = (0, import_react.useRef)({ disabled });
	const resizeObserverConnected = (0, import_react.useRef)(false);
	const rect = (0, import_react.useRef)(null);
	const callbackId = (0, import_react.useRef)(null);
	const { disabled: resizeObserverDisabled, updateMeasurementsFor, timeout: resizeObserverTimeout } = {
		...defaultResizeObserverConfig,
		...resizeObserverConfig
	};
	const ids = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
	const resizeObserver = useResizeObserver({
		callback: (0, import_react.useCallback)(() => {
			if (!resizeObserverConnected.current) {
				resizeObserverConnected.current = true;
				return;
			}
			if (callbackId.current != null) clearTimeout(callbackId.current);
			callbackId.current = setTimeout(() => {
				measureDroppableContainers(Array.isArray(ids.current) ? ids.current : [ids.current]);
				callbackId.current = null;
			}, resizeObserverTimeout);
		}, [resizeObserverTimeout]),
		disabled: resizeObserverDisabled || !active
	});
	const [nodeRef, setNodeRef] = useNodeRef((0, import_react.useCallback)((newElement, previousElement) => {
		if (!resizeObserver) return;
		if (previousElement) {
			resizeObserver.unobserve(previousElement);
			resizeObserverConnected.current = false;
		}
		if (newElement) resizeObserver.observe(newElement);
	}, [resizeObserver]));
	const dataRef = useLatestValue(data);
	(0, import_react.useEffect)(() => {
		if (!resizeObserver || !nodeRef.current) return;
		resizeObserver.disconnect();
		resizeObserverConnected.current = false;
		resizeObserver.observe(nodeRef.current);
	}, [nodeRef, resizeObserver]);
	(0, import_react.useEffect)(() => {
		dispatch({
			type: Action.RegisterDroppable,
			element: {
				id,
				key,
				disabled,
				node: nodeRef,
				rect,
				data: dataRef
			}
		});
		return () => dispatch({
			type: Action.UnregisterDroppable,
			key,
			id
		});
	}, [id]);
	(0, import_react.useEffect)(() => {
		if (disabled !== previous.current.disabled) {
			dispatch({
				type: Action.SetDroppableDisabled,
				id,
				key,
				disabled
			});
			previous.current.disabled = disabled;
		}
	}, [
		id,
		key,
		disabled,
		dispatch
	]);
	return {
		active,
		rect,
		isOver: (over == null ? void 0 : over.id) === id,
		node: nodeRef,
		over,
		setNodeRef
	};
}
//#endregion
//#region node_modules/@dnd-kit/sortable/dist/sortable.esm.js
/**
* Move an array item to a different position. Returns a new array with the item moved to the new position.
*/
function arrayMove(array, from, to) {
	const newArray = array.slice();
	newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
	return newArray;
}
function getSortedRects(items, rects) {
	return items.reduce((accumulator, id, index) => {
		const rect = rects.get(id);
		if (rect) accumulator[index] = rect;
		return accumulator;
	}, Array(items.length));
}
function isValidIndex(index) {
	return index !== null && index >= 0;
}
function itemsEqual(a, b) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}
function normalizeDisabled(disabled) {
	if (typeof disabled === "boolean") return {
		draggable: disabled,
		droppable: disabled
	};
	return disabled;
}
var rectSortingStrategy = (_ref) => {
	let { rects, activeIndex, overIndex, index } = _ref;
	const newRects = arrayMove(rects, overIndex, activeIndex);
	const oldRect = rects[index];
	const newRect = newRects[index];
	if (!newRect || !oldRect) return null;
	return {
		x: newRect.left - oldRect.left,
		y: newRect.top - oldRect.top,
		scaleX: newRect.width / oldRect.width,
		scaleY: newRect.height / oldRect.height
	};
};
var defaultScale$1 = {
	scaleX: 1,
	scaleY: 1
};
var verticalListSortingStrategy = (_ref) => {
	var _rects$activeIndex;
	let { activeIndex, activeNodeRect: fallbackActiveRect, index, rects, overIndex } = _ref;
	const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
	if (!activeNodeRect) return null;
	if (index === activeIndex) {
		const overIndexRect = rects[overIndex];
		if (!overIndexRect) return null;
		return {
			x: 0,
			y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
			...defaultScale$1
		};
	}
	const itemGap = getItemGap$1(rects, index, activeIndex);
	if (index > activeIndex && index <= overIndex) return {
		x: 0,
		y: -activeNodeRect.height - itemGap,
		...defaultScale$1
	};
	if (index < activeIndex && index >= overIndex) return {
		x: 0,
		y: activeNodeRect.height + itemGap,
		...defaultScale$1
	};
	return {
		x: 0,
		y: 0,
		...defaultScale$1
	};
};
function getItemGap$1(clientRects, index, activeIndex) {
	const currentRect = clientRects[index];
	const previousRect = clientRects[index - 1];
	const nextRect = clientRects[index + 1];
	if (!currentRect) return 0;
	if (activeIndex < index) return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
	return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}
var ID_PREFIX = "Sortable";
var Context = /* @__PURE__ */ import_react.createContext({
	activeIndex: -1,
	containerId: ID_PREFIX,
	disableTransforms: false,
	items: [],
	overIndex: -1,
	useDragOverlay: false,
	sortedRects: [],
	strategy: rectSortingStrategy,
	disabled: {
		draggable: false,
		droppable: false
	}
});
function SortableContext(_ref) {
	let { children, id, items: userDefinedItems, strategy = rectSortingStrategy, disabled: disabledProp = false } = _ref;
	const { active, dragOverlay, droppableRects, over, measureDroppableContainers } = useDndContext();
	const containerId = useUniqueId(ID_PREFIX, id);
	const useDragOverlay = Boolean(dragOverlay.rect !== null);
	const items = (0, import_react.useMemo)(() => userDefinedItems.map((item) => typeof item === "object" && "id" in item ? item.id : item), [userDefinedItems]);
	const isDragging = active != null;
	const activeIndex = active ? items.indexOf(active.id) : -1;
	const overIndex = over ? items.indexOf(over.id) : -1;
	const previousItemsRef = (0, import_react.useRef)(items);
	const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
	const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
	const disabled = normalizeDisabled(disabledProp);
	useIsomorphicLayoutEffect(() => {
		if (itemsHaveChanged && isDragging) measureDroppableContainers(items);
	}, [
		itemsHaveChanged,
		items,
		isDragging,
		measureDroppableContainers
	]);
	(0, import_react.useEffect)(() => {
		previousItemsRef.current = items;
	}, [items]);
	const contextValue = (0, import_react.useMemo)(() => ({
		activeIndex,
		containerId,
		disabled,
		disableTransforms,
		items,
		overIndex,
		useDragOverlay,
		sortedRects: getSortedRects(items, droppableRects),
		strategy
	}), [
		activeIndex,
		containerId,
		disabled.draggable,
		disabled.droppable,
		disableTransforms,
		items,
		overIndex,
		droppableRects,
		useDragOverlay,
		strategy
	]);
	return import_react.createElement(Context.Provider, { value: contextValue }, children);
}
var defaultNewIndexGetter = (_ref) => {
	let { id, items, activeIndex, overIndex } = _ref;
	return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
var defaultAnimateLayoutChanges = (_ref2) => {
	let { containerId, isSorting, wasDragging, index, items, newIndex, previousItems, previousContainerId, transition } = _ref2;
	if (!transition || !wasDragging) return false;
	if (previousItems !== items && index === newIndex) return false;
	if (isSorting) return true;
	return newIndex !== index && containerId === previousContainerId;
};
var defaultTransition = {
	duration: 200,
	easing: "ease"
};
var transitionProperty = "transform";
var disabledTransition = /* @__PURE__ */ CSS.Transition.toString({
	property: transitionProperty,
	duration: 0,
	easing: "linear"
});
var defaultAttributes = { roleDescription: "sortable" };
function useDerivedTransform(_ref) {
	let { disabled, index, node, rect } = _ref;
	const [derivedTransform, setDerivedtransform] = (0, import_react.useState)(null);
	const previousIndex = (0, import_react.useRef)(index);
	useIsomorphicLayoutEffect(() => {
		if (!disabled && index !== previousIndex.current && node.current) {
			const initial = rect.current;
			if (initial) {
				const current = getClientRect(node.current, { ignoreTransform: true });
				const delta = {
					x: initial.left - current.left,
					y: initial.top - current.top,
					scaleX: initial.width / current.width,
					scaleY: initial.height / current.height
				};
				if (delta.x || delta.y) setDerivedtransform(delta);
			}
		}
		if (index !== previousIndex.current) previousIndex.current = index;
	}, [
		disabled,
		index,
		node,
		rect
	]);
	(0, import_react.useEffect)(() => {
		if (derivedTransform) setDerivedtransform(null);
	}, [derivedTransform]);
	return derivedTransform;
}
function useSortable(_ref) {
	let { animateLayoutChanges = defaultAnimateLayoutChanges, attributes: userDefinedAttributes, disabled: localDisabled, data: customData, getNewIndex = defaultNewIndexGetter, id, strategy: localStrategy, resizeObserverConfig, transition = defaultTransition } = _ref;
	const { items, containerId, activeIndex, disabled: globalDisabled, disableTransforms, sortedRects, overIndex, useDragOverlay, strategy: globalStrategy } = (0, import_react.useContext)(Context);
	const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
	const index = items.indexOf(id);
	const data = (0, import_react.useMemo)(() => ({
		sortable: {
			containerId,
			index,
			items
		},
		...customData
	}), [
		containerId,
		customData,
		index,
		items
	]);
	const itemsAfterCurrentSortable = (0, import_react.useMemo)(() => items.slice(items.indexOf(id)), [items, id]);
	const { rect, node, isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
		id,
		data,
		disabled: disabled.droppable,
		resizeObserverConfig: {
			updateMeasurementsFor: itemsAfterCurrentSortable,
			...resizeObserverConfig
		}
	});
	const { active, activatorEvent, activeNodeRect, attributes, setNodeRef: setDraggableNodeRef, listeners, isDragging, over, setActivatorNodeRef, transform } = useDraggable({
		id,
		data,
		attributes: {
			...defaultAttributes,
			...userDefinedAttributes
		},
		disabled: disabled.draggable
	});
	const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
	const isSorting = Boolean(active);
	const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
	const shouldDisplaceDragSource = !useDragOverlay && isDragging;
	const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
	const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : (localStrategy != null ? localStrategy : globalStrategy)({
		rects: sortedRects,
		activeNodeRect,
		activeIndex,
		overIndex,
		index
	}) : null;
	const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
		id,
		items,
		activeIndex,
		overIndex
	}) : index;
	const activeId = active == null ? void 0 : active.id;
	const previous = (0, import_react.useRef)({
		activeId,
		items,
		newIndex,
		containerId
	});
	const itemsHaveChanged = items !== previous.current.items;
	const shouldAnimateLayoutChanges = animateLayoutChanges({
		active,
		containerId,
		isDragging,
		isSorting,
		id,
		index,
		items,
		newIndex: previous.current.newIndex,
		previousItems: previous.current.items,
		previousContainerId: previous.current.containerId,
		transition,
		wasDragging: previous.current.activeId != null
	});
	const derivedTransform = useDerivedTransform({
		disabled: !shouldAnimateLayoutChanges,
		index,
		node,
		rect
	});
	(0, import_react.useEffect)(() => {
		if (isSorting && previous.current.newIndex !== newIndex) previous.current.newIndex = newIndex;
		if (containerId !== previous.current.containerId) previous.current.containerId = containerId;
		if (items !== previous.current.items) previous.current.items = items;
	}, [
		isSorting,
		newIndex,
		containerId,
		items
	]);
	(0, import_react.useEffect)(() => {
		if (activeId === previous.current.activeId) return;
		if (activeId != null && previous.current.activeId == null) {
			previous.current.activeId = activeId;
			return;
		}
		const timeoutId = setTimeout(() => {
			previous.current.activeId = activeId;
		}, 50);
		return () => clearTimeout(timeoutId);
	}, [activeId]);
	return {
		active,
		activeIndex,
		attributes,
		data,
		rect,
		index,
		newIndex,
		items,
		isOver,
		isSorting,
		isDragging,
		listeners,
		node,
		overIndex,
		over,
		setNodeRef,
		setActivatorNodeRef,
		setDroppableNodeRef,
		setDraggableNodeRef,
		transform: derivedTransform != null ? derivedTransform : finalTransform,
		transition: getTransition()
	};
	function getTransition() {
		if (derivedTransform || itemsHaveChanged && previous.current.newIndex === index) return disabledTransition;
		if (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent) || !transition) return;
		if (isSorting || shouldAnimateLayoutChanges) return CSS.Transition.toString({
			...transition,
			property: transitionProperty
		});
	}
}
function normalizeLocalDisabled(localDisabled, globalDisabled) {
	var _localDisabled$dragga, _localDisabled$droppa;
	if (typeof localDisabled === "boolean") return {
		draggable: localDisabled,
		droppable: false
	};
	return {
		draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
		droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
	};
}
function hasSortableData(entry) {
	if (!entry) return false;
	const data = entry.data.current;
	if (data && "sortable" in data && typeof data.sortable === "object" && "containerId" in data.sortable && "items" in data.sortable && "index" in data.sortable) return true;
	return false;
}
var directions = [
	KeyboardCode.Down,
	KeyboardCode.Right,
	KeyboardCode.Up,
	KeyboardCode.Left
];
var sortableKeyboardCoordinates = (event, _ref) => {
	let { context: { active, collisionRect, droppableRects, droppableContainers, over, scrollableAncestors } } = _ref;
	if (directions.includes(event.code)) {
		event.preventDefault();
		if (!active || !collisionRect) return;
		const filteredContainers = [];
		droppableContainers.getEnabled().forEach((entry) => {
			if (!entry || entry != null && entry.disabled) return;
			const rect = droppableRects.get(entry.id);
			if (!rect) return;
			switch (event.code) {
				case KeyboardCode.Down:
					if (collisionRect.top < rect.top) filteredContainers.push(entry);
					break;
				case KeyboardCode.Up:
					if (collisionRect.top > rect.top) filteredContainers.push(entry);
					break;
				case KeyboardCode.Left:
					if (collisionRect.left > rect.left) filteredContainers.push(entry);
					break;
				case KeyboardCode.Right:
					if (collisionRect.left < rect.left) filteredContainers.push(entry);
					break;
			}
		});
		const collisions = closestCorners({
			active,
			collisionRect,
			droppableRects,
			droppableContainers: filteredContainers,
			pointerCoordinates: null
		});
		let closestId = getFirstCollision(collisions, "id");
		if (closestId === (over == null ? void 0 : over.id) && collisions.length > 1) closestId = collisions[1].id;
		if (closestId != null) {
			const activeDroppable = droppableContainers.get(active.id);
			const newDroppable = droppableContainers.get(closestId);
			const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
			const newNode = newDroppable == null ? void 0 : newDroppable.node.current;
			if (newNode && newRect && activeDroppable && newDroppable) {
				const hasDifferentScrollAncestors = getScrollableAncestors(newNode).some((element, index) => scrollableAncestors[index] !== element);
				const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
				const isAfterActive = isAfter(activeDroppable, newDroppable);
				const offset = hasDifferentScrollAncestors || !hasSameContainer ? {
					x: 0,
					y: 0
				} : {
					x: isAfterActive ? collisionRect.width - newRect.width : 0,
					y: isAfterActive ? collisionRect.height - newRect.height : 0
				};
				const rectCoordinates = {
					x: newRect.left,
					y: newRect.top
				};
				return offset.x && offset.y ? rectCoordinates : subtract(rectCoordinates, offset);
			}
		}
	}
};
function isSameContainer(a, b) {
	if (!hasSortableData(a) || !hasSortableData(b)) return false;
	return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}
function isAfter(a, b) {
	if (!hasSortableData(a) || !hasSortableData(b)) return false;
	if (!isSameContainer(a, b)) return false;
	return a.data.current.sortable.index < b.data.current.sortable.index;
}
//#endregion
//#region src/components/TrackActionSheet.jsx
var ACTION_BUTTON_BASE = "w-full flex items-center justify-between gap-3 rounded-2xl bg-[#111111] px-4 py-3 text-left text-white transition-colors min-h-[44px]";
function TrackActionSheet({ track, onClose, onViewDetails }) {
	const addToQueue = usePlayerStore((state) => state.addToQueue);
	const dataSaver = useDataSaver();
	const [pendingAction, setPendingAction] = (0, import_react.useState)(null);
	const offlineBlocked = Boolean(dataSaver?.offlineForced || !dataSaver?.isOnline);
	const lowDataActive = Boolean(dataSaver?.effectiveLowData);
	const downloadDisabledReason = (() => {
		if (offlineBlocked) return "downloads paused while offline mode is active";
		if (lowDataActive) return "low data mode disabled downloads";
		return "";
	})();
	const downloadDisabled = Boolean(downloadDisabledReason);
	if (!track) return null;
	const handleAddToQueue = async () => {
		if (!track || pendingAction) return;
		try {
			setPendingAction("queue");
			await addToQueue(track);
		} catch (error) {
			console.error("Failed to queue track", error);
		} finally {
			setPendingAction(null);
			onClose();
		}
	};
	const handleDownload = async () => {
		if (!track || downloadDisabled) return;
		try {
			const url = `${getTrackStreamUrl(track.id)}?download=1`;
			const response = await fetch(url);
			if (!response.ok) throw new Error("Download failed");
			const blob = await response.blob();
			const objectUrl = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = objectUrl;
			anchor.download = `${track.title || track.filename || "track"}.mp3`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(objectUrl);
		} catch (error) {
			console.error("Download failed", error);
		} finally {
			onClose();
		}
	};
	const handleViewDetails = () => {
		if (onViewDetails) onViewDetails(track);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col justify-end bg-[#050505]",
		role: "dialog",
		"aria-modal": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "flex-1 w-full",
			onClick: onClose,
			"aria-label": "Close track actions"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-[#050505] border-t-2 border-[#f6b012] rounded-t-3xl px-5 pt-5 pb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 mb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-14 h-14 rounded-2xl overflow-hidden bg-[#111]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
								src: resolveMediaUrl$1(track.cover_art_url),
								alt: track.title || track.filename,
								fallbackText: track.title || track.filename,
								className: "w-full h-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white font-semibold truncate",
								children: track.title || track.filename
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white text-sm truncate",
								children: track.artist || "unknown artist"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "p-2 rounded-full bg-[#111111] text-white min-h-[44px] min-w-[44px] flex items-center justify-center",
							"aria-label": "Close actions",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
						})
					]
				}),
				(offlineBlocked || lowDataActive) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap gap-2",
					children: [offlineBlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full border border-red-900 bg-[#2a1515] px-3 py-1 text-xs lowercase text-red-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-3.5 h-3.5" }), " offline paused"]
					}), !offlineBlocked && lowDataActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full border border-yellow-900 bg-[#2a2515] px-3 py-1 text-xs lowercase text-yellow-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3.5 h-3.5" }), " low data mode"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${ACTION_BUTTON_BASE} ${pendingAction === "queue" ? "opacity-70" : "hover:bg-[#1b1b1b]"}`,
							onClick: handleAddToQueue,
							disabled: Boolean(pendingAction),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-base font-semibold lowercase",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "w-5 h-5 text-[#f6b012]" }), "add to queue"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `${ACTION_BUTTON_BASE} ${downloadDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1b1b1b]"}`,
							onClick: handleDownload,
							disabled: downloadDisabled,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-base font-semibold lowercase",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download$1, { className: "w-5 h-5 text-[#f6b012]" }), "download"]
							}), downloadDisabledReason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-[#888] ml-auto",
								children: downloadDisabledReason
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${ACTION_BUTTON_BASE} hover:bg-[#1b1b1b]`,
							onClick: handleViewDetails,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-base font-semibold lowercase",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-5 h-5 text-[#f6b012]" }), "view details"]
							})
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/CoverSearchModal.jsx
function CoverSearchModal({ track, isOpen, onClose, onCoverApplied }) {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [covers, setCovers] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [selectedCover, setSelectedCover] = (0, import_react.useState)(null);
	const [applying, setApplying] = (0, import_react.useState)(false);
	import_react.useEffect(() => {
		if (track && isOpen) {
			const defaultQuery = `${track.title || ""} ${track.artist || ""}`.trim();
			setSearchQuery(defaultQuery);
			if (defaultQuery) searchCovers(defaultQuery);
		}
	}, [track, isOpen]);
	const searchCovers = (0, import_react.useCallback)(async (query) => {
		if (!query.trim() || !track) return;
		setLoading(true);
		setError(null);
		setCovers([]);
		try {
			const data = (await api.get(`/tracks/${track.id}/search-covers`, { params: {
				query,
				limit: 12
			} })).data;
			setCovers(data.covers || []);
		} catch (err) {
			setError(err.message || "Failed to search covers");
		} finally {
			setLoading(false);
		}
	}, [track]);
	const handleSearch = (e) => {
		e.preventDefault();
		searchCovers(searchQuery);
	};
	const applyCover = async (coverUrl) => {
		if (!track) return;
		setApplying(true);
		setSelectedCover(coverUrl);
		try {
			const formData = new FormData();
			formData.append("cover_url", coverUrl);
			const data = (await api.post(`/tracks/${track.id}/apply-cover`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
			onCoverApplied(data.cover_art_url);
			onClose();
		} catch (err) {
			setError(err.message || "Failed to apply cover");
			setSelectedCover(null);
		} finally {
			setApplying(false);
		}
	};
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0, 0, 0, 0.8)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			zIndex: 1e3,
			padding: "20px"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			style: {
				backgroundColor: "#1a1a1a",
				borderRadius: "12px",
				width: "100%",
				maxWidth: "900px",
				maxHeight: "90vh",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "20px 24px",
						borderBottom: "1px solid #333",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageIcon, { size: 24 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								fontWeight: 600
							},
							children: "Search Cover Art"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "close",
						style: {
							background: "none",
							border: "none",
							color: "#999",
							cursor: "pointer",
							padding: "4px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 24 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "20px 24px",
						borderBottom: "1px solid #333"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSearch,
						style: {
							display: "flex",
							gap: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							placeholder: "Search for album covers...",
							style: {
								flex: 1,
								padding: "12px 16px",
								borderRadius: "8px",
								border: "1px solid #444",
								backgroundColor: "#252525",
								color: "#fff",
								fontSize: "1rem"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: loading || !searchQuery.trim(),
							style: {
								padding: "12px 24px",
								borderRadius: "8px",
								border: "none",
								backgroundColor: "#6366f1",
								color: "#fff",
								fontSize: "1rem",
								cursor: loading || !searchQuery.trim() ? "not-allowed" : "pointer",
								opacity: loading || !searchQuery.trim() ? .6 : 1,
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 20 }), loading ? "Searching..." : "Search"]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						overflow: "auto",
						padding: "20px 24px"
					},
					children: [
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "16px",
								backgroundColor: "#ef444422",
								borderRadius: "8px",
								color: "#ef4444",
								marginBottom: "16px"
							},
							children: error
						}),
						covers.length === 0 && !loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								textAlign: "center",
								color: "#666",
								padding: "40px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageIcon, {
								size: 48,
								style: {
									opacity: .5,
									marginBottom: "16px"
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No covers found. Try a different search." })]
						}),
						covers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
								gap: "16px"
							},
							children: covers.map((cover, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => applyCover(cover.url),
								style: {
									position: "relative",
									cursor: applying ? "not-allowed" : "pointer",
									borderRadius: "8px",
									overflow: "hidden",
									aspectRatio: "1",
									border: selectedCover === cover.url ? "3px solid #6366f1" : "2px solid transparent",
									opacity: applying && selectedCover !== cover.url ? .5 : 1
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: cover.preview_url,
										alt: `${cover.title} - ${cover.artist}`,
										style: {
											width: "100%",
											height: "100%",
											objectFit: "cover"
										}
									}),
									selectedCover === cover.url && applying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											backgroundColor: "rgba(0,0,0,0.7)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
											width: "40px",
											height: "40px",
											border: "3px solid #6366f1",
											borderTopColor: "transparent",
											borderRadius: "50%",
											animation: "spin 1s linear infinite"
										} })
									}),
									selectedCover === cover.url && !applying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											position: "absolute",
											top: "8px",
											right: "8px",
											backgroundColor: "#6366f1",
											borderRadius: "50%",
											padding: "4px"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											size: 20,
											color: "#fff"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											position: "absolute",
											bottom: 0,
											left: 0,
											right: 0,
											padding: "12px",
											background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
											fontSize: "0.875rem"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontWeight: 600,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis"
											},
											children: cover.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												color: "#aaa",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis"
											},
											children: cover.artist
										})]
									})
								]
							}, index))
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` })]
	});
}
//#endregion
//#region src/components/TrackEditModal.jsx
function TrackEditModal({ isOpen, track, onClose, onSave }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [artist, setArtist] = (0, import_react.useState)("");
	const [album, setAlbum] = (0, import_react.useState)("");
	const [cover, setCover] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [showCoverSearch, setShowCoverSearch] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (track) {
			setTitle(track.title || "");
			setArtist(track.artist || "");
			setAlbum(track.album || "");
			setCover(track.cover_art_url || "");
		}
	}, [track]);
	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file || !track) return;
		setUploading(true);
		try {
			setCover((await uploadTrackCover(track.id, file)).data.cover_art_url);
		} catch (err) {
			console.error("cover upload failed:", err);
			const reader = new FileReader();
			reader.onload = () => setCover(reader.result);
			reader.readAsDataURL(file);
		} finally {
			setUploading(false);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			await onSave({
				title,
				artist,
				album
			});
			onClose();
		} catch (err) {
			console.error("error saving track:", err);
		} finally {
			setSaving(false);
		}
	};
	if (!isOpen || !track) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 bg-[#050505] flex items-center justify-center z-50 p-4",
		onClick: onClose,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-[#050505] rounded-3xl p-6 w-full max-w-md border-2 border-[#ffbb20]",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-bold text-vibe-gold mb-4 lowercase",
				children: "edit song"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-white/60 text-sm mb-2 block lowercase",
							children: "title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							className: "w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-white/60 text-sm mb-2 block lowercase",
							children: "artist"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: artist,
							onChange: (e) => setArtist(e.target.value),
							className: "w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/40 border-2 border-transparent focus:border-vibe-gold focus:outline-none transition-colors"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-white/60 text-sm mb-2 block lowercase",
							children: "album"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: album,
							onChange: (e) => setAlbum(e.target.value),
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/*",
									onChange: handleFileChange,
									className: "w-full text-white file:bg-vibe-gold file:text-vibe-black file:border-0 file:rounded-xl file:px-4 file:py-2 file:cursor-pointer file:mr-4 hover:file:bg-vibe-gold/90 cursor-pointer",
									disabled: uploading || saving
								}), uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl pointer-events-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-5 h-5 animate-spin text-vibe-gold" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setShowCoverSearch(true),
								className: "w-full mt-3 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors lowercase flex items-center justify-center gap-2",
								disabled: saving || uploading,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-5 h-5" }), "search for covers"]
							}),
							cover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: cover,
									alt: "preview",
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
							disabled: saving || uploading,
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
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverSearchModal, {
			track,
			isOpen: showCoverSearch,
			onClose: () => setShowCoverSearch(false),
			onCoverApplied: (newCover) => {
				setCover(newCover);
			}
		})]
	});
}
//#endregion
//#region src/components/LyricsPanel.jsx
function parseLRC$1(lrc) {
	if (!lrc) return null;
	const lines = lrc.split("\n");
	const parsed = [];
	for (const line of lines) {
		const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
		if (match) {
			const mins = parseInt(match[1], 10);
			const secs = parseInt(match[2], 10);
			const ms = parseInt(match[3].padEnd(3, "0").slice(0, 3), 10);
			const time = mins * 60 + secs + ms / 1e3;
			const text = match[4].trim();
			if (text) parsed.push({
				time,
				text
			});
		}
	}
	return parsed.length > 0 ? parsed.sort((a, b) => a.time - b.time) : null;
}
function buildLRC(timestamps, lines) {
	return timestamps.map((t, i) => {
		if (t == null) return null;
		const mins = Math.floor(t / 60);
		const secs = Math.floor(t % 60);
		const ms = Math.round(t % 1 * 100);
		return `[${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}]${lines[i]}`;
	}).filter(Boolean).join("\n");
}
function LyricsPanel({ track, embedded }) {
	const [savedLyrics, setSavedLyrics] = (0, import_react.useState)("");
	const [syncedLyricsRaw, setSyncedLyricsRaw] = (0, import_react.useState)("");
	const [draftLyrics, setDraftLyrics] = (0, import_react.useState)("");
	const [draftSynced, setDraftSynced] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("editor");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [syncIndex, setSyncIndex] = (0, import_react.useState)(0);
	const [syncTimestamps, setSyncTimestamps] = (0, import_react.useState)([]);
	const [syncDone, setSyncDone] = (0, import_react.useState)(false);
	const [savingSync, setSavingSync] = (0, import_react.useState)(false);
	const currentPosition = usePlayerStore((s) => s.currentPosition);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const playPause = usePlayerStore((s) => s.playPause);
	const seekTo = usePlayerStore((s) => s.seekTo);
	const lyricsRef = (0, import_react.useRef)(null);
	const linesRef = (0, import_react.useRef)([]);
	const syncLinesRef = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (track?.id) {
			setSavedLyrics("");
			setSyncedLyricsRaw("");
			setDraftLyrics("");
			setDraftSynced("");
			setSearchResults([]);
			setSyncIndex(0);
			setSyncTimestamps([]);
			setSyncDone(false);
			const loadLyrics = async () => {
				setLoading(true);
				try {
					const res = await getTrackLyrics(track.id);
					const l = res.data.lyrics || "";
					const s = res.data.synced_lyrics || "";
					setSavedLyrics(l);
					setSyncedLyricsRaw(s);
					setDraftLyrics(l);
					if (l) setMode("viewer");
					else setMode("editor");
				} catch {
					setSavedLyrics("");
					setSyncedLyricsRaw("");
					setDraftLyrics("");
					setMode("editor");
				} finally {
					setLoading(false);
				}
			};
			loadLyrics();
			setSearchQuery(`${track.artist || ""} ${track.title || ""}`.trim());
		}
	}, [track?.id]);
	const parsedSync = parseLRC$1(syncedLyricsRaw);
	const lines = savedLyrics ? savedLyrics.split("\n") : [];
	const contentLines = lines.filter((l) => l.trim());
	(0, import_react.useEffect)(() => {
		if (mode !== "viewer" || !lyricsRef.current) return;
		if (!parsedSync) return;
		let activeIdx = -1;
		for (let i = parsedSync.length - 1; i >= 0; i--) if (currentPosition >= parsedSync[i].time) {
			activeIdx = i;
			break;
		}
		if (activeIdx >= 0 && linesRef.current[activeIdx]) linesRef.current[activeIdx].scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
	}, [
		currentPosition,
		mode,
		parsedSync
	]);
	(0, import_react.useEffect)(() => {
		if (mode !== "sync") return;
		const el = syncLinesRef.current[syncIndex];
		if (el) el.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
	}, [syncIndex, mode]);
	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		setSearching(true);
		setSearchResults([]);
		try {
			const res = await searchLyrics(searchQuery.trim());
			setSearchResults(Array.isArray(res.data) ? res.data : []);
		} catch (err) {
			console.error("Lyrics search failed:", err);
			setSearchResults([]);
		} finally {
			setSearching(false);
		}
	};
	const handleSearchKeyDown = (e) => {
		if (e.key === "Enter" || e.key === "Search" || e.keyCode === 13) {
			e.preventDefault();
			handleSearch();
		}
	};
	const selectLyrics = (result) => {
		setDraftLyrics((result.plain_lyrics || "").toLowerCase().trim());
		setDraftSynced((result.synced_lyrics || "").toLowerCase());
		setSearchResults([]);
	};
	const handleSave = async () => {
		setSaving(true);
		setSaved(false);
		try {
			console.log("Saving lyrics for track:", track.id);
			const token = window.localStorage.getItem("music_app_token");
			console.log("Auth token present:", !!token);
			console.log("Token prefix:", token ? token.substring(0, 50) + "..." : "none");
			const res = await saveTrackLyrics(track.id, draftLyrics);
			console.log("Save response:", res.data);
			const finalLyrics = res.data.lyrics || draftLyrics;
			setSavedLyrics(finalLyrics);
			setDraftLyrics(finalLyrics);
			if (draftSynced) try {
				await saveSyncedLyrics(track.id, draftSynced);
				setSyncedLyricsRaw(draftSynced);
			} catch (e) {
				console.warn("Failed to save synced lyrics:", e);
			}
			setSaved(true);
			setTimeout(() => {
				setSaved(false);
				if (draftSynced && parseLRC$1(draftSynced)) setMode("viewer");
				else startSyncMode(finalLyrics);
			}, 600);
		} catch (e) {
			console.error("Failed to save lyrics:", e);
			if (e.response?.status === 401) alert("Please log in to save lyrics.");
			else alert("Failed to save lyrics. Please check your connection.");
		} finally {
			setSaving(false);
		}
	};
	const startSyncMode = (lyrics) => {
		const cl = (lyrics || savedLyrics).split("\n").filter((l) => l.trim());
		setSyncIndex(0);
		setSyncTimestamps(new Array(cl.length).fill(null));
		setSyncDone(false);
		setMode("sync");
	};
	const handleSyncTap = () => {
		const cl = contentLines.length > 0 ? contentLines : (savedLyrics || "").split("\n").filter((l) => l.trim());
		setSyncTimestamps((prev) => {
			const next = [...prev];
			next[syncIndex] = currentPosition;
			return next;
		});
		if (syncIndex >= cl.length - 1) setSyncDone(true);
		else setSyncIndex((i) => i + 1);
	};
	const handleSyncLineBacktrack = (lineIndex) => {
		if (lineIndex > syncIndex) return;
		setSyncDone(false);
		setSyncIndex(lineIndex);
		setSyncTimestamps((prev) => {
			const next = [...prev];
			for (let i = lineIndex; i < next.length; i += 1) next[i] = null;
			return next;
		});
	};
	const handleSaveSyncedLyrics = async () => {
		const lrc = buildLRC(syncTimestamps, contentLines.length > 0 ? contentLines : (savedLyrics || "").split("\n").filter((l) => l.trim()));
		setSavingSync(true);
		try {
			await saveSyncedLyrics(track.id, lrc);
			setSyncedLyricsRaw(lrc);
			setMode("viewer");
		} catch {} finally {
			setSavingSync(false);
		}
	};
	const setLineRef = (0, import_react.useCallback)((el, i) => {
		linesRef.current[i] = el;
	}, []);
	const setSyncLineRef = (0, import_react.useCallback)((el, i) => {
		syncLinesRef.current[i] = el;
	}, []);
	const cardClass = embedded ? "h-full flex flex-col" : "rounded-2xl bg-white/5 border border-white/10 p-3";
	const scrollClass = embedded ? "flex-1 min-h-0 overflow-y-auto scroll-smooth px-4 md:px-8 lg:px-12" : "max-h-64 overflow-y-auto scroll-smooth";
	const syncScrollClass = embedded ? "flex-1 min-h-0 overflow-y-auto scroll-smooth mb-3 px-4 md:px-8 lg:px-12" : "max-h-52 overflow-y-auto scroll-smooth mb-3";
	const resultsScrollClass = embedded ? "flex-1 min-h-0 overflow-y-auto space-y-1 px-4 md:px-8 lg:px-12" : "max-h-48 overflow-y-auto space-y-1";
	if (loading) {
		const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `${cardClass} flex items-center justify-center`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-5 h-5 text-vibe-gold animate-spin" })
		});
		return embedded ? inner : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-3",
			children: inner
		});
	}
	if (mode === "sync") {
		const cl = contentLines.length > 0 ? contentLines : (savedLyrics || "").split("\n").filter((l) => l.trim());
		const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cardClass,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-vibe-gold text-xs font-medium",
						children: "tap each line as it is sung (tap a previous line to redo)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMode(savedLyrics ? "viewer" : "editor"),
						className: "text-xs text-white/50 hover:text-white/80",
						children: "cancel"
					})]
				}),
				!isPlaying && syncIndex === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						seekTo(0);
						playPause();
					},
					className: "w-full mb-2 py-2 rounded-xl bg-vibe-gold/20 text-vibe-gold text-sm font-medium flex items-center justify-center gap-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4" }), " start playing to sync"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: syncScrollClass,
					children: cl.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						ref: (el) => setSyncLineRef(el, i),
						onClick: () => handleSyncLineBacktrack(i),
						className: `block w-full text-left text-sm leading-relaxed py-0.5 transition-all duration-200 ${i === syncIndex ? "text-vibe-gold font-semibold scale-105 origin-left" : i < syncIndex ? "text-white/40 hover:text-white/80 cursor-pointer" : "text-white/60"} ${i > syncIndex ? "cursor-default" : ""}`,
						children: [syncTimestamps[i] != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-vibe-gold/50 text-xs mr-1",
							children: [
								Math.floor(syncTimestamps[i] / 60),
								":",
								String(Math.floor(syncTimestamps[i] % 60)).padStart(2, "0")
							]
						}), line.toLowerCase()]
					}, i))
				}),
				!syncDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleSyncTap,
					className: "w-full py-4 rounded-2xl bg-vibe-gold text-vibe-black text-lg font-bold active:scale-95 transition-transform shrink-0",
					children: "tap"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleSaveSyncedLyrics,
					disabled: savingSync,
					className: "w-full py-3 rounded-2xl bg-vibe-gold text-vibe-black text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 shrink-0",
					children: [savingSync ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4" }), "save timing"]
				})
			]
		});
		return embedded ? inner : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-3",
			children: inner
		});
	}
	if (mode === "viewer" && savedLyrics) {
		const PREVIEW_OFFSET = .5;
		let activeLine = -1;
		if (parsedSync) {
			for (let i = parsedSync.length - 1; i >= 0; i--) if (currentPosition >= parsedSync[i].time - PREVIEW_OFFSET) {
				activeLine = i;
				break;
			}
		}
		const displayLines = parsedSync ? parsedSync.map((e) => e.text.toLowerCase()) : lines.map((l) => l.toLowerCase());
		const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cardClass,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-white/50 text-xs",
						style: { display: "none" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => startSyncMode(),
							className: "p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors",
							title: "re-sync timing",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "w-3.5 h-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMode("editor"),
							className: "p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-3.5 h-3.5" })
						})]
					})]
				}),
				!parsedSync && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => startSyncMode(),
					className: "w-full mb-2 py-1.5 rounded-xl bg-vibe-gold/10 text-vibe-gold text-xs font-medium shrink-0",
					children: "tap to sync lyrics to timing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: lyricsRef,
					className: scrollClass,
					children: displayLines.map((line, i) => {
						const time = parsedSync ? parsedSync[i]?.time : null;
						const isClickable = time != null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							ref: (el) => setLineRef(el, i),
							onClick: () => {
								if (isClickable) {
									seekTo(time);
									triggerImpact("light");
								}
							},
							disabled: !isClickable,
							className: `w-full text-center text-sm leading-relaxed py-1.5 px-2 rounded-lg transition-all duration-200 ${i === activeLine ? "text-vibe-gold font-semibold bg-vibe-gold/10" : activeLine >= 0 && Math.abs(i - activeLine) <= 1 ? "text-white/70" : parsedSync ? "text-white/40" : "text-white/60"} ${isClickable ? "active:scale-[0.98] cursor-pointer hover:bg-white/5" : "cursor-default"}`,
							children: line || "\xA0"
						}, i);
					})
				})
			]
		});
		return embedded ? inner : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-3",
			children: inner
		});
	}
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `${cardClass} space-y-3`,
		children: [
			savedLyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setMode("viewer"),
					className: "text-xs text-white/50 hover:text-white/80 transition-colors",
					children: "back to lyrics"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						onKeyDown: (e) => handleSearchKeyDown(e),
						placeholder: "search lyrics...",
						autoFocus: false,
						inputMode: "text",
						enterKeyHint: "search",
						className: "w-full rounded-xl search-opaque text-white placeholder-white/40 pl-9 pr-3 py-2 text-sm border focus:border-[#ffbb20] focus:outline-none"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleSearch,
					disabled: searching,
					className: "px-3 py-2 rounded-xl bg-vibe-gold text-vibe-black hover:bg-vibe-gold/90 transition-colors disabled:opacity-50 flex-shrink-0 flex items-center justify-center",
					"aria-label": "search",
					children: searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4" })
				})]
			}),
			searchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: resultsScrollClass,
				children: searchResults.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => selectLyrics(r),
					className: "w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors touch-manipulation",
					type: "button",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white text-sm font-medium truncate",
							children: r.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-white/60 text-xs truncate",
							children: [r.artist, r.album ? ` — ${r.album}` : ""]
						}),
						r.synced_lyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-vibe-gold/60 text-xs",
							children: "synced"
						})
					]
				}, r.id))
			}),
			draftLyrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: embedded ? "flex-1 min-h-0 overflow-y-auto" : "max-h-48 overflow-y-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "text-white/80 text-sm whitespace-pre-wrap font-[inherit] leading-relaxed",
					children: draftLyrics.toLowerCase()
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/40 text-sm text-center py-4",
				children: "no lyrics yet — search above to find and select lyrics"
			}),
			draftLyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setDraftLyrics("");
						setDraftSynced("");
						setSearchResults([]);
					},
					className: "px-3 py-1.5 rounded-xl bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors touch-manipulation",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: handleSave,
					disabled: saving,
					className: "px-4 py-1.5 rounded-xl bg-vibe-gold text-vibe-black text-sm font-medium hover:bg-vibe-gold/90 transition-colors disabled:opacity-50 flex items-center gap-1 touch-manipulation",
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 animate-spin" }) : saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4" }), "saved"] }) : "save lyrics"
				})]
			})
		]
	});
	return embedded ? inner : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 pb-3",
		children: inner
	});
}
//#endregion
//#region src/components/NowPlaying.jsx
function AudioVisualizer({ audio, isPlaying }) {
	const canvasRef = (0, import_react.useRef)(null);
	const animationRef = (0, import_react.useRef)(null);
	const analyserRef = (0, import_react.useRef)(null);
	const dataArrayRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!audio || !canvasRef.current) return;
		const audioEl = audio;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const resize = () => {
			canvas.width = canvas.offsetWidth * 2;
			canvas.height = canvas.offsetHeight * 2;
			ctx.scale(2, 2);
		};
		resize();
		window.addEventListener("resize", resize);
		try {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const source = audioContext.createMediaElementSource(audioEl);
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			analyser.connect(audioContext.destination);
			analyserRef.current = analyser;
			const bufferLength = analyser.frequencyBinCount;
			dataArrayRef.current = new Uint8Array(bufferLength);
		} catch (e) {
			console.log("audio context not available:", e);
			return () => window.removeEventListener("resize", resize);
		}
		const draw = () => {
			if (!analyserRef.current || !canvasRef.current) return;
			const width = canvas.offsetWidth;
			const height = canvas.offsetHeight;
			analyserRef.current.getByteFrequencyData(dataArrayRef.current);
			ctx.clearRect(0, 0, width, height);
			const barWidth = width / dataArrayRef.current.length * 2.5;
			let barHeight;
			let x = 0;
			for (let i = 0; i < dataArrayRef.current.length; i++) {
				barHeight = dataArrayRef.current[i] / 255 * height * .8;
				const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
				gradient.addColorStop(0, "#f6b012");
				gradient.addColorStop(1, "rgba(246, 176, 18, 0.2)");
				ctx.fillStyle = gradient;
				ctx.fillRect(x, height - barHeight, barWidth, barHeight);
				x += barWidth + 1;
			}
			animationRef.current = requestAnimationFrame(draw);
		};
		if (isPlaying) draw();
		return () => {
			window.removeEventListener("resize", resize);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [audio, isPlaying]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "w-full h-24 opacity-60",
		style: { imageRendering: "crisp-edges" }
	});
}
function KeyboardShortcutsModal({ isOpen, onClose }) {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-[#111] rounded-2xl p-6 max-w-md w-full border border-[#333]",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-bold text-white",
					children: "keyboard shortcuts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "text-white/60 hover:text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-6 h-6" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: [
					{
						key: "space / k",
						action: "play/pause"
					},
					{
						key: "← / j",
						action: "previous track"
					},
					{
						key: "→ / l",
						action: "next track"
					},
					{
						key: "↑",
						action: "volume up"
					},
					{
						key: "↓",
						action: "volume down"
					},
					{
						key: "m",
						action: "mute/unmute"
					},
					{
						key: "f",
						action: "toggle favorite"
					},
					{
						key: "q",
						action: "toggle queue"
					},
					{
						key: "s",
						action: "toggle shuffle"
					},
					{
						key: "r",
						action: "toggle repeat"
					},
					{
						key: "?",
						action: "show/hide shortcuts"
					}
				].map(({ key, action }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between py-2 border-b border-[#222] last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "px-3 py-1 bg-[#222] rounded-lg text-[#f6b012] font-mono text-sm",
						children: key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-white/80 text-sm",
						children: action
					})]
				}, key))
			})]
		})
	});
}
function NowPlaying({ onClose }) {
	const { currentTrack, isPlaying, currentPosition, audioDuration, repeatMode, shuffle, showLyrics, favorites, queue, currentQueueIndex, playPause, nextTrack, previousTrack, seekTo, setRepeatMode, toggleShuffle, toggleLyrics, toggleFavorite, audioRef, volume, setVolume } = usePlayerStore();
	const [showQueue, setShowQueue] = (0, import_react.useState)(false);
	const [showShortcuts, setShowShortcuts] = (0, import_react.useState)(false);
	const [showVolumeSlider, setShowVolumeSlider] = (0, import_react.useState)(false);
	const volumeRef = (0, import_react.useRef)(null);
	const [isDragging, setIsDragging] = (0, import_react.useState)(false);
	const progressRef = (0, import_react.useRef)(null);
	const duration = audioDuration || currentTrack?.duration || 0;
	const isFavorite = favorites.some((f) => f.id === currentTrack?.id);
	const [localVolume, setLocalVolume] = (0, import_react.useState)(volume || .8);
	(0, import_react.useEffect)(() => {
		setLocalVolume(volume);
	}, [volume]);
	(0, import_react.useEffect)(() => {
		const handleGlobalClick = () => {
			if (showVolumeSlider) setShowVolumeSlider(false);
		};
		if (showVolumeSlider) {
			const timer = setTimeout(() => {
				document.addEventListener("click", handleGlobalClick);
			}, 10);
			return () => {
				clearTimeout(timer);
				document.removeEventListener("click", handleGlobalClick);
			};
		}
	}, [showVolumeSlider]);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.key === "?") {
				e.preventDefault();
				setShowShortcuts((v) => !v);
			}
			if (e.key === "escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);
	const formatTime = (seconds) => {
		if (isNaN(seconds)) return "0:00";
		return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
	};
	const handleProgressClick = (e) => {
		if (!progressRef.current || !duration) return;
		const rect = progressRef.current.getBoundingClientRect();
		seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration);
	};
	const handleProgressMouseDown = (e) => {
		e.stopPropagation();
		if (!progressRef.current || !duration) return;
		setIsDragging(true);
		const rect = progressRef.current.getBoundingClientRect();
		seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration);
	};
	const handleProgressMouseMove = (e) => {
		if (!isDragging || !progressRef.current || !duration) return;
		const rect = progressRef.current.getBoundingClientRect();
		seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration);
	};
	const handleProgressMouseUp = () => {
		setIsDragging(false);
	};
	const handleProgressTouchStart = (e) => {
		e.stopPropagation();
		if (!progressRef.current || !duration) return;
		setIsDragging(true);
		const touch = e.touches[0];
		const rect = progressRef.current.getBoundingClientRect();
		seekTo(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)) * duration);
	};
	const handleProgressTouchMove = (e) => {
		if (!isDragging || !progressRef.current || !duration) return;
		e.preventDefault();
		const touch = e.touches[0];
		const rect = progressRef.current.getBoundingClientRect();
		seekTo(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)) * duration);
	};
	const handleProgressTouchEnd = () => {
		setIsDragging(false);
	};
	const handleVolumeChange = (e) => {
		e.stopPropagation();
		const newVol = parseFloat(e.target.value);
		setLocalVolume(newVol);
		setVolume(newVol);
	};
	const isMuted = audioRef?.muted || localVolume === 0;
	(0, import_react.useEffect)(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleProgressMouseMove);
			document.addEventListener("mouseup", handleProgressMouseUp);
		}
		return () => {
			document.removeEventListener("mousemove", handleProgressMouseMove);
			document.removeEventListener("mouseup", handleProgressMouseUp);
		};
	}, [isDragging]);
	if (!currentTrack) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 bg-black z-50 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-center pt-safe py-3 px-4 border-b border-[#222] shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "absolute left-4 p-2 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-6 h-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-white/60 text-sm uppercase tracking-wider",
						children: "now playing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setShowShortcuts(true),
						className: "absolute right-4 p-2 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "w-6 h-6" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col items-center p-4 overflow-hidden min-h-0 relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mb-2 w-full shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-lg md:text-xl font-bold text-white mb-0.5 truncate px-4",
							children: (() => {
								const title = currentTrack.title || currentTrack.filename;
								const formattedArtist = (currentTrack.artist || "unknown artist").split(/(\s*(?:ft\.|feat\.|&|,|and)\s*)/i).map((part, idx) => {
									if (/^(\s*(?:ft\.|feat\.|&|,|and)\s*)$/i.test(part)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, idx);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "italic",
										children: part
									}, idx);
								});
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									title,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/60 font-normal",
										children: " - "
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-white/80 font-normal",
										children: formattedArtist
									})
								] });
							})()
						}), currentTrack.album && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#f6b012]",
							children: currentTrack.album
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-h-0 w-full max-w-sm relative mb-2 flex items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
							src: resolveMediaUrl$1(currentTrack.cover_art_url),
							alt: currentTrack.album || currentTrack.title,
							fallbackText: currentTrack.title,
							className: "max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
						}), isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute -bottom-2 left-0 right-0 px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioVisualizer, {
								audio: audioRef,
								isPlaying
							})
						})]
					}),
					showLyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full max-w-sm shrink-0 h-48 mb-2 rounded-2xl bg-black/80 backdrop-blur border border-white/10 overflow-visible flex flex-col p-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LyricsPanel, {
							track: currentTrack,
							embedded: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 mb-2 shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => toggleFavorite(currentTrack),
								className: `p-2.5 rounded-full transition-colors ${isFavorite ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `w-5 h-5 ${isFavorite ? "fill-current" : ""}` })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowQueue((v) => !v),
								className: `p-2.5 rounded-full transition-colors ${showQueue ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: toggleLyrics,
								className: `p-2.5 rounded-full transition-colors ${showLyrics ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "w-5 h-5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-3 flex-wrap shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: toggleShuffle,
								className: `p-2.5 rounded-full transition-colors ${shuffle ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setRepeatMode(repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none"),
								className: `p-2.5 rounded-full transition-colors ${repeatMode !== "none" ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"}`,
								children: repeatMode === "one" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat1, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: previousTrack,
								className: "p-3.5 rounded-full bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "w-6 h-6 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									triggerImpact("medium");
									playPause();
								},
								className: "p-5 rounded-full bg-[#f6b012] text-black hover:bg-[#ffcc40] transition-colors shadow-lg shadow-[#f6b012]/20",
								children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-8 h-8 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-8 h-8 fill-current pl-1" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: nextTrack,
								className: "p-3.5 rounded-full bg-[#1a1a1a] text-white hover:bg-[#252525] transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "w-6 h-6 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								ref: volumeRef,
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										setShowVolumeSlider((v) => !v);
									},
									className: `p-2.5 rounded-full transition-colors ${showVolumeSlider ? "bg-[#f6b012] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"}`,
									"aria-label": isMuted ? "unmute" : "mute",
									children: isMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-5 h-5" })
								}), showVolumeSlider && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1a1a] border border-[#333] rounded-xl p-3 shadow-lg z-50 min-w-[140px]",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: "0",
										max: "1",
										step: "0.01",
										value: isMuted ? 0 : localVolume,
										onChange: handleVolumeChange,
										onClick: (e) => e.stopPropagation(),
										className: "w-28 h-2 rounded-full appearance-none cursor-pointer",
										style: { background: `linear-gradient(to right, #f6b012 0%, #f6b012 ${isMuted ? 0 : localVolume * 100}%, #333 ${isMuted ? 0 : localVolume * 100}%, #333 100%)` },
										"aria-label": "volume control"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 w-[180px] min-w-[160px] select-none",
								onMouseDown: handleProgressMouseDown,
								onMouseMove: isDragging ? handleProgressMouseMove : void 0,
								onMouseUp: handleProgressMouseUp,
								onTouchStart: handleProgressTouchStart,
								onTouchMove: isDragging ? handleProgressTouchMove : void 0,
								onTouchEnd: handleProgressTouchEnd,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-white/60 w-10 text-right",
										children: formatTime(currentPosition)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										ref: progressRef,
										className: `flex-1 h-2 bg-[#222] rounded-full relative overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`,
										onClick: handleProgressClick,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute left-0 top-0 bottom-0 bg-[#f6b012] rounded-full transition-all duration-100",
											style: { width: `${duration ? currentPosition / duration * 100 : 0}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-white/60 w-10",
										children: formatTime(duration)
									})
								]
							})
						]
					})
				]
			}),
			showQueue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0 bg-[#111] border-t border-[#333] rounded-t-3xl max-h-[50vh] overflow-y-auto z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-white font-semibold mb-4",
							children: [
								"up next (",
								queue.length,
								")"
							]
						}), queue.slice(currentQueueIndex + 1, currentQueueIndex + 11).map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 p-2 rounded-xl bg-[#1a1a1a]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white/40 w-6",
								children: idx + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white text-sm truncate",
									children: item.track.title || item.track.filename
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white/60 text-xs truncate",
									children: item.track.artist
								})]
							})]
						}, item.id))]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutsModal, {
				isOpen: showShortcuts,
				onClose: () => setShowShortcuts(false)
			})
		]
	});
}
//#endregion
//#region src/components/Player.jsx
function queueTrackLabel(queueItem) {
	return queueItem.track.title || queueItem.track.filename || "unknown";
}
function Player({ onHideDesktop, onSwipeDown, searchOverlayActive = false }) {
	const navigate = useNavigate();
	const { currentTrack, isPlaying, currentPosition, volume, repeatMode, shuffle, showLyrics, queue, currentQueueIndex, playPause, nextTrack, previousTrack, jump, seekTo, setVolume, setRepeatMode, toggleShuffle, toggleLyrics, setCurrentPosition, loadQueue, loadPlayerState, playTrack, removeFromQueue, reorderQueueItem, toggleFavorite, startCrossfade, settings } = usePlayerStore();
	const [showQueue, setShowQueue] = (0, import_react.useState)(false);
	const [queueSearch, setQueueSearch] = (0, import_react.useState)("");
	const [queueItems, setQueueItems] = (0, import_react.useState)([]);
	const [actionTrack, setActionTrack] = (0, import_react.useState)(null);
	const [editingTrack, setEditingTrack] = (0, import_react.useState)(null);
	const [showEditModal, setShowEditModal] = (0, import_react.useState)(false);
	const [isMuted, setIsMuted] = (0, import_react.useState)(false);
	const [showVolumePopup, setShowVolumePopup] = (0, import_react.useState)(false);
	const [showNowPlaying, setShowNowPlaying] = (0, import_react.useState)(false);
	const normalizedQueue = Array.isArray(queue) ? queue : [];
	(0, import_react.useRef)(null);
	useSensors(useSensor(PointerSensor, { activationConstraint: {
		delay: 0,
		tolerance: 3
	} }));
	(0, import_react.useEffect)(() => {
		setQueueItems(normalizedQueue);
	}, [normalizedQueue]);
	(0, import_react.useEffect)(() => {
		if ("serviceWorker" in navigator && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({
			type: "SET_PREFETCH_QUEUE",
			data: {
				queue: normalizedQueue,
				currentIndex: currentQueueIndex
			}
		});
	}, [normalizedQueue, currentQueueIndex]);
	const toggleMute = () => {
		setIsMuted(!isMuted);
	};
	(0, import_react.useEffect)(() => {
		if (showQueue) loadQueue();
	}, [showQueue, loadQueue]);
	(0, import_react.useEffect)(() => {
		if (searchOverlayActive) return;
		const handleKeyDown = (e) => {
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
			switch (e.key) {
				case " ":
				case "k":
					e.preventDefault();
					playPause();
					break;
				case "ArrowRight":
				case "l":
					e.preventDefault();
					nextTrack();
					break;
				case "ArrowLeft":
				case "j":
					e.preventDefault();
					previousTrack();
					break;
				case "ArrowUp":
					e.preventDefault();
					setVolume(Math.min(1, volume + .1));
					break;
				case "ArrowDown":
					e.preventDefault();
					setVolume(Math.max(0, volume - .1));
					break;
				case "m":
					e.preventDefault();
					toggleMute();
					break;
				case "f":
					e.preventDefault();
					if (currentTrack) toggleFavorite(currentTrack);
					break;
				case "q":
					e.preventDefault();
					setShowQueue((v) => !v);
					break;
				case "s":
					e.preventDefault();
					toggleShuffle();
					break;
				case "r":
					e.preventDefault();
					setRepeatMode(repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none");
					break;
				case "n":
					e.preventDefault();
					setShowNowPlaying(true);
					break;
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		playPause,
		nextTrack,
		previousTrack,
		volume,
		toggleMute,
		toggleFavorite,
		currentTrack,
		toggleShuffle,
		setRepeatMode,
		repeatMode,
		searchOverlayActive
	]);
	const openTrackDetails = (track) => {
		setEditingTrack(track);
		setShowEditModal(true);
	};
	const saveTrack = async (data) => {
		if (!editingTrack) return;
		try {
			const updated = (await updateTrack(editingTrack.id, data))?.data;
			if (updated) {
				if (currentTrack?.id === updated.id) usePlayerStore.setState({ currentTrack: updated });
				await loadQueue();
				setEditingTrack(updated);
			}
		} catch (error) {
			console.error("Error updating track:", error);
		}
	};
	const audioRef = usePlayerStore((state) => state.audioRef);
	(0, import_react.useEffect)(() => {
		const audio = audioRef;
		if (!audio) return;
		audio.volume = isMuted ? 0 : volume;
	}, [
		audioRef,
		volume,
		isMuted
	]);
	const filteredQueue = (0, import_react.useMemo)(() => {
		const q = queueSearch.trim().toLowerCase();
		if (!q) return queueItems;
		return queueItems.filter((item) => {
			return `${queueTrackLabel(item)} ${item.track.artist || ""} ${item.track.album || ""}`.toLowerCase().includes(q);
		});
	}, [queueItems, queueSearch]);
	(0, import_react.useCallback)((queueItem) => {
		const queueIndex = queueItems.findIndex((item) => item.id === queueItem.id);
		if (queueIndex >= 0) playTrack(queueItem.track, queueIndex);
	}, [queueItems, playTrack]);
	(0, import_react.useCallback)(async (queueItemId) => {
		await removeFromQueue(queueItemId);
		await loadQueue();
	}, [removeFromQueue, loadQueue]);
	(0, import_react.useCallback)(async () => {
		if (!currentTrack) return;
		try {
			const playlists = await (await fetch(`/api/playlists`)).json();
			for (const playlist of playlists) if ((await (await fetch(`/api/playlists/${playlist.id}`)).json()).tracks?.find((t) => t.id === currentTrack.id)) {
				navigate(`/playlists/${playlist.id}`, { state: { highlightTrackId: currentTrack.id } });
				return;
			}
		} catch (err) {
			console.error("Error finding playlist:", err);
		}
	}, [currentTrack, navigate]);
	(0, import_react.useCallback)(() => {
		if (currentTrack?.artist) navigate(`/artists/${encodeURIComponent(currentTrack.artist)}`);
	}, [currentTrack?.artist, navigate]);
	(0, import_react.useCallback)(async ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const activeId = String(active.id);
		const overId = String(over.id);
		const filteredOldIndex = filteredQueue.findIndex((item) => String(item.id) === activeId);
		const filteredNewIndex = filteredQueue.findIndex((item) => String(item.id) === overId);
		if (filteredOldIndex < 0 || filteredNewIndex < 0) return;
		const reorderedFiltered = arrayMove(filteredQueue, filteredOldIndex, filteredNewIndex);
		let reorderedFull;
		if (!queueSearch.trim()) reorderedFull = arrayMove(queueItems, queueItems.findIndex((item) => String(item.id) === activeId), queueItems.findIndex((item) => String(item.id) === overId));
		else {
			const filteredIdSet = new Set(filteredQueue.map((item) => String(item.id)));
			const replacement = [...reorderedFiltered];
			reorderedFull = queueItems.map((item) => {
				if (!filteredIdSet.has(String(item.id))) return item;
				return replacement.shift() || item;
			});
		}
		setQueueItems(reorderedFull);
		const newPosition = reorderedFull.findIndex((item) => String(item.id) === activeId);
		await reorderQueueItem(Number(active.id), newPosition);
		await loadQueue();
	}, [
		filteredQueue,
		queueItems,
		queueSearch,
		setQueueItems,
		reorderQueueItem,
		loadQueue
	]);
	if (!currentTrack) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActionSheet, {
			track: actionTrack,
			onClose: () => setActionTrack(null),
			onViewDetails: openTrackDetails
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackEditModal, {
			isOpen: showEditModal,
			track: editingTrack,
			onClose: () => setShowEditModal(false),
			onSave: saveTrack
		}),
		showNowPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowPlaying, { onClose: () => setShowNowPlaying(false) })
	] });
}
//#endregion
//#region src/components/BottomNav.jsx
function BottomNav({ onRevealPlayer, isPlayerHidden = false }) {
	const location = useLocation();
	const navigate = useNavigate();
	useDataSaver();
	const volumeContainerRef = (0, import_react.useRef)(null);
	const volumeSliderRef = (0, import_react.useRef)(null);
	const { settings, currentTrack, isPlaying, currentPosition, audioDuration, repeatMode, shuffle, showQueue, showLyrics, volume, toggleOfflineMode, toggleLowPowerMode, playPause, nextTrack, previousTrack, jump, seekTo, setRepeatMode, toggleShuffle, toggleLyrics, toggleQueue, setVolume } = usePlayerStore((state) => ({
		settings: state.settings,
		currentTrack: state.currentTrack,
		isPlaying: state.isPlaying,
		currentPosition: state.currentPosition,
		audioDuration: state.audioDuration,
		repeatMode: state.repeatMode,
		shuffle: state.shuffle,
		showQueue: state.showQueue,
		showLyrics: state.showLyrics,
		volume: state.volume,
		toggleOfflineMode: state.toggleOfflineMode,
		toggleLowPowerMode: state.toggleLowPowerMode,
		setVolume: state.setVolume,
		playPause: state.playPause,
		nextTrack: state.nextTrack,
		previousTrack: state.previousTrack,
		jump: state.jump,
		seekTo: state.seekTo,
		setRepeatMode: state.setRepeatMode,
		toggleShuffle: state.toggleShuffle,
		toggleLyrics: state.toggleLyrics,
		toggleQueue: state.toggleQueue
	}));
	const [pendingAction, setPendingAction] = (0, import_react.useState)(null);
	const [touchStartY, setTouchStartY] = (0, import_react.useState)(null);
	const [isDraggingProgress, setIsDraggingProgress] = (0, import_react.useState)(false);
	const [pendingSeek, setPendingSeek] = (0, import_react.useState)(null);
	const [showVolumeSlider, setShowVolumeSlider] = (0, import_react.useState)(false);
	const [isMuted, setIsMuted] = (0, import_react.useState)(false);
	const [isVolumeDragging, setIsVolumeDragging] = (0, import_react.useState)(false);
	const [isDraggingMobileProgress, setIsDraggingMobileProgress] = (0, import_react.useState)(false);
	const mobileProgressRef = (0, import_react.useRef)(null);
	const offlineActive = Boolean(settings?.offlineMode);
	const lowPowerActive = Boolean(settings?.lowPowerMode);
	const duration = audioDuration || currentTrack?.duration || 0;
	const progressPercent = duration > 0 ? currentPosition / duration * 100 : 0;
	const handleToggle = async (type) => {
		try {
			setPendingAction(type);
			if (type === "offline") await toggleOfflineMode?.();
			else if (type === "lowPower") await toggleLowPowerMode?.();
		} finally {
			setPendingAction(null);
		}
	};
	const handleProgressChange = (e) => {
		const val = parseFloat(e.target.value);
		const bounded = Math.max(0, Math.min(duration || val, val));
		setPendingSeek(bounded);
		usePlayerStore.getState().setCurrentPosition(bounded);
	};
	const handleProgressEnd = () => {
		setIsDraggingProgress(false);
		usePlayerStore.getState().setIsDraggingProgress(false);
		const target = pendingSeek ?? currentPosition;
		if (Number.isFinite(target)) seekTo(target);
		setPendingSeek(null);
	};
	const handleProgressClick = (e) => {
		if (!duration) return;
		const rect = e.currentTarget.getBoundingClientRect();
		seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration);
	};
	const handleMobileProgressTouchStart = (e) => {
		if (!duration) return;
		setIsDraggingMobileProgress(true);
		usePlayerStore.getState().setIsDraggingProgress(true);
		handleMobileProgressDrag(e.touches[0]);
	};
	const handleMobileProgressTouchMove = (e) => {
		if (!isDraggingMobileProgress || !duration) return;
		e.preventDefault();
		handleMobileProgressDrag(e.touches[0]);
	};
	const handleMobileProgressTouchEnd = () => {
		if (!isDraggingMobileProgress) return;
		setIsDraggingMobileProgress(false);
		usePlayerStore.getState().setIsDraggingProgress(false);
	};
	const handleMobileProgressDrag = (touch) => {
		if (!mobileProgressRef.current || !duration) return;
		const rect = mobileProgressRef.current.getBoundingClientRect();
		const newPosition = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)) * duration;
		usePlayerStore.getState().seekTo(newPosition);
	};
	const formatTime = (s) => {
		if (!s || isNaN(s) || !isFinite(s)) return "0:00";
		return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
	};
	const navItems = [
		{
			path: "/artists",
			icon: User,
			label: "artists"
		},
		{
			path: "/player",
			icon: Music,
			label: "player"
		},
		{
			path: "/favorites",
			icon: Heart,
			label: "favorites"
		},
		{
			path: "/",
			icon: Home$1,
			label: "home"
		},
		{
			path: "/playlists",
			icon: ListMusic,
			label: "playlists"
		},
		{
			path: "/albums",
			icon: Disc3,
			label: "albums"
		},
		{
			path: "/history",
			icon: Clock,
			label: "history"
		}
	];
	const handleNavClick = (path, isActive) => {
		if (isActive) window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
		else navigate(path);
	};
	const getIsActive = (item) => {
		if (item.path === "/") return location.pathname === "/";
		if (item.path === "/playlists") return location.pathname === "/playlists" || location.pathname.startsWith("/playlists/");
		if (item.path === "/artists") return location.pathname === "/artists" || location.pathname.startsWith("/artists/");
		if (item.path === "/albums") return location.pathname === "/albums" || location.pathname.startsWith("/albums/");
		return location.pathname.startsWith(item.path);
	};
	const handleQuickActionsTouchStart = (e) => {
		if (!isPlayerHidden) return;
		const touch = e.touches?.[0];
		if (touch) setTouchStartY(touch.clientY);
	};
	const handleQuickActionsTouchEnd = (e) => {
		if (!isPlayerHidden || touchStartY === null) return;
		const touch = e.changedTouches?.[0];
		if (!touch) {
			setTouchStartY(null);
			return;
		}
		const delta = touchStartY - touch.clientY;
		setTouchStartY(null);
		if (delta > 40) onRevealPlayer?.();
	};
	const showPlayerControls = Boolean(currentTrack && !isPlayerHidden);
	(0, import_react.useEffect)(() => {
		const handleClickOutside = (e) => {
			const clickedOutsideContainer = volumeContainerRef.current && !volumeContainerRef.current.contains(e.target);
			const clickedOutsideSlider = volumeSliderRef.current && !volumeSliderRef.current.contains(e.target);
			if (clickedOutsideContainer && clickedOutsideSlider) setShowVolumeSlider(false);
		};
		if (showVolumeSlider) {
			document.addEventListener("click", handleClickOutside);
			return () => document.removeEventListener("click", handleClickOutside);
		}
	}, [showVolumeSlider]);
	const handleVolumeButtonClick = (e) => {
		e.stopPropagation();
		setShowVolumeSlider(!showVolumeSlider);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden md:grid fixed bottom-14 xl:bottom-16 left-0 right-0 bg-[#050505] border-t border-[#f6b012] items-center h-14 xl:h-16 z-40 px-4",
		style: {
			fontFamily: "\"Varela Round\", sans-serif",
			gridTemplateColumns: "1fr auto 1fr"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-3 min-w-0",
				style: { minWidth: "200px" },
				children: currentTrack && !isPlayerHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white text-base leading-tight overflow-hidden text-ellipsis whitespace-nowrap",
					title: `${currentTrack.title || currentTrack.filename}${currentTrack.artist ? ` — ${currentTrack.artist}` : ""}`,
					children: (() => {
						const title = currentTrack.title || currentTrack.filename || "";
						const artist = currentTrack.artist || "";
						return artist ? `${title} — ${artist}` : title;
					})()
				})
			}),
			currentTrack && !isPlayerHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							navigate("/player");
						},
						className: "rounded-full p-2 transition-colors bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]",
						"aria-label": "lyrics",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setRepeatMode(repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none"),
						className: `rounded-full p-2 transition-colors ${repeatMode !== "none" ? "bg-[#ffbb20]/20 text-[#ffbb20]" : "bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]"}`,
						"aria-label": repeatMode === "one" ? "repeat one" : repeatMode === "all" ? "repeat all" : "repeat off",
						children: repeatMode === "one" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat1, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: previousTrack,
						className: "rounded-full bg-[#2a1f0f] p-2 text-white hover:bg-[#3a2f1f] transition-colors",
						"aria-label": "previous track",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "h-4 w-4 fill-current" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							triggerImpact("medium");
							playPause();
						},
						className: "rounded-full p-2.5 bg-[#ffbb20] text-black hover:bg-[#ffcc40] active:scale-95 transition-all",
						"aria-label": isPlaying ? "pause" : "play",
						children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-5 w-5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5 fill-current pl-0.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: nextTrack,
						className: "rounded-full bg-[#2a1f0f] p-2 text-white hover:bg-[#3a2f1f] transition-colors",
						"aria-label": "next track",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-4 w-4 fill-current" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: volumeContainerRef,
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleVolumeButtonClick,
							className: `rounded-full p-2 transition-colors ${showVolumeSlider ? "bg-[#ffbb20]/20 text-[#ffbb20]" : "bg-[#2a1f0f] text-white hover:bg-[#3a2f1f]"}`,
							"aria-label": "volume",
							children: isMuted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-4 w-4" })
						}), showVolumeSlider && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: volumeSliderRef,
							className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 bg-[#1a1a1a] rounded-xl border border-[#333] shadow-xl z-50",
							style: {
								width: "280px",
								maxWidth: "90vw"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setIsMuted(!isMuted),
									className: "p-1.5 rounded-full text-white/70 hover:text-[#ffbb20] flex-shrink-0",
									children: isMuted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-4 h-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: "0",
									max: "1",
									step: "0.01",
									value: isMuted ? 0 : volume || .8,
									onChange: (e) => {
										const newVol = parseFloat(e.target.value);
										setVolume(newVol);
										if (newVol > 0 && isMuted) setIsMuted(false);
									},
									className: "flex-1 h-2 rounded-full appearance-none cursor-pointer",
									style: { background: `linear-gradient(to right, #f6b012 0%, #f6b012 ${(isMuted ? 0 : volume || .8) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume || .8) * 100}%, rgba(255,255,255,0.2) 100%)` },
									"aria-label": "volume slider"
								})]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 min-w-0",
				children: [
					currentTrack && !isPlayerHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2 flex-1 justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 w-full max-w-xs lg:max-w-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-white/40 text-xs flex-shrink-0",
									children: formatTime(currentPosition)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: "0",
									max: duration || 100,
									value: isDraggingProgress ? pendingSeek ?? currentPosition : currentPosition,
									onChange: handleProgressChange,
									onMouseDown: () => {
										setIsDraggingProgress(true);
										usePlayerStore.getState().setIsDraggingProgress(true);
									},
									onMouseUp: handleProgressEnd,
									onTouchStart: () => {
										setIsDraggingProgress(true);
										usePlayerStore.getState().setIsDraggingProgress(true);
									},
									onTouchEnd: handleProgressEnd,
									className: "flex-1 h-1 rounded-full appearance-none cursor-pointer",
									style: { "--progress": `${progressPercent}%` }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-white/40 text-xs flex-shrink-0",
									children: formatTime(duration)
								})
							]
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => handleToggle("offline"),
						disabled: pendingAction === "offline",
						className: `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${offlineActive ? "border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]" : "border-white/10 bg-white/5 text-white/70"} ${pendingAction === "offline" ? "opacity-50 cursor-not-allowed" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
							className: "w-4 h-4",
							fill: "none",
							strokeWidth: 2
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "whitespace-nowrap",
							children: offlineActive ? "offline on" : "offline"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => handleToggle("lowPower"),
						disabled: pendingAction === "lowPower",
						className: `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${lowPowerActive ? "border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]" : "border-white/10 bg-white/5 text-white/70"} ${pendingAction === "lowPower" ? "opacity-50 cursor-not-allowed" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
							className: "w-4 h-4",
							fill: "none",
							strokeWidth: 2
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "whitespace-nowrap",
							children: "low data"
						})]
					})
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "fixed bottom-0 left-0 right-0 bg-[#050505] border-t-2 border-[#ffbb20] flex flex-col pb-safe z-40",
		onTouchStart: handleQuickActionsTouchStart,
		onTouchEnd: handleQuickActionsTouchEnd,
		style: { fontFamily: "\"Varela Round\", sans-serif" },
		children: [
			showPlayerControls && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center px-3 pt-0 pb-0",
						style: { minHeight: "32px" },
						children: [currentTrack.cover_art_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: resolveMediaUrl$1(currentTrack.cover_art_url),
							alt: currentTrack.album || currentTrack.title,
							className: "w-7 h-7 rounded-lg object-cover flex-shrink-0"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-7 h-7 rounded-lg bg-[#2a1f0f] flex items-center justify-center flex-shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "w-3 h-3 text-[#ffbb20]" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center pointer-events-none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center px-12",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white text-[11px] font-semibold truncate leading-tight",
									children: currentTrack.title || currentTrack.filename
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white/40 text-[9px] truncate leading-tight",
									children: currentTrack.artist || "unknown artist"
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center justify-center py-1",
						style: { minHeight: "48px" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									navigate("/player");
								},
								className: "w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none text-white",
								style: {
									position: "absolute",
									left: "8px"
								},
								"aria-label": "lyrics",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setRepeatMode(repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none"),
								className: `w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none ${repeatMode !== "none" ? "text-[#ffb10f]" : "text-white"}`,
								style: {
									position: "absolute",
									left: "calc(25% - 32px)"
								},
								"aria-label": repeatMode === "one" ? "repeat one" : repeatMode === "all" ? "repeat all" : "repeat off",
								children: repeatMode === "one" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat1, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: previousTrack,
								className: "w-11 h-11 flex items-center justify-center text-white rounded-full active:scale-90 transition-none",
								style: {
									position: "absolute",
									left: "calc(50% - 72px)"
								},
								"aria-label": "previous",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "w-6 h-6 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									triggerImpact("medium");
									playPause();
								},
								style: {
									width: "56px",
									height: "56px"
								},
								className: "flex items-center justify-center bg-[#ffb10f] text-black rounded-full active:scale-90 transition-none",
								"aria-label": isPlaying ? "pause" : "play",
								children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-7 h-7 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
									className: "w-7 h-7 fill-current",
									style: { marginLeft: "2px" }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: nextTrack,
								className: "w-11 h-11 flex items-center justify-center text-white rounded-full active:scale-90 transition-none",
								style: {
									position: "absolute",
									left: "calc(50% + 28px)"
								},
								"aria-label": "next",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "w-6 h-6 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: toggleShuffle,
								className: `w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none ${shuffle ? "text-[#ffb10f]" : "text-white"}`,
								style: {
									position: "absolute",
									left: "calc(75% - 11px)"
								},
								"aria-label": shuffle ? "shuffle on" : "shuffle off",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: toggleQueue,
								className: `w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-none ${showQueue ? "text-[#ffb10f]" : "text-white"}`,
								style: {
									position: "absolute",
									right: "8px"
								},
								"aria-label": "queue",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "w-5 h-5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 pt-0 pb-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							ref: mobileProgressRef,
							className: "w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full cursor-pointer relative",
							onClick: handleProgressClick,
							onTouchStart: handleMobileProgressTouchStart,
							onTouchMove: handleMobileProgressTouchMove,
							onTouchEnd: handleMobileProgressTouchEnd,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-0 top-0 bottom-0 bg-[#f6b012] rounded-full transition-all duration-100",
								style: { width: `${progressPercent}%` }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f6b012] rounded-full border-2 border-white/80 shadow-sm transition-all duration-100",
								style: { left: `calc(${progressPercent}% - 6px)` }
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white/40 text-[10px]",
								children: formatTime(currentPosition)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white/40 text-[10px]",
								children: formatTime(duration)
							})]
						})]
					})
				]
			}),
			!showPlayerControls && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:hidden px-4 pt-2 pb-1 flex justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => handleToggle("offline"),
					disabled: pendingAction === "offline",
					className: `flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${offlineActive ? "border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]" : "border-white/10 bg-white/5 text-white/70"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
						className: "w-3.5 h-3.5",
						fill: "none",
						strokeWidth: 2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: offlineActive ? "offline on" : "offline" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => handleToggle("lowPower"),
					disabled: pendingAction === "lowPower",
					className: `flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${lowPowerActive ? "border-[#ffbb20] bg-[#ffbb20]/10 text-[#ffbb20]" : "border-white/10 bg-white/5 text-white/70"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
						className: "w-3.5 h-3.5",
						fill: "none",
						strokeWidth: 2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "low data" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-around items-center h-14 xl:h-16",
				children: navItems.map((item) => {
					const Icon = item.icon;
					const isActive = getIsActive(item);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => handleNavClick(item.path, isActive),
						className: `flex flex-col items-center justify-center flex-1 h-full transition-none ${isActive ? "text-[#f6b012]" : "text-white"} hover:text-[#ffd86a]`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "w-6 h-6 xl:w-10 xl:h-10 stroke-current",
							fill: "none",
							strokeWidth: 2
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden md:block text-xs xl:text-sm lowercase leading-none mt-0.5 xl:mt-1",
							children: item.label
						})]
					}, item.path);
				})
			})
		]
	})] });
}
//#endregion
//#region src/components/QueueModal.jsx
function SortableQueueItem({ queueItem, isCurrent, onPlay, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(queueItem.id) });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? "none" : "transform 50ms ease-out",
		opacity: isDragging ? .9 : 1,
		zIndex: isDragging ? 50 : void 0
	};
	const label = queueItem.track.title || queueItem.track.filename || "unknown";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style,
		className: `flex items-center gap-2 px-2 py-1.5 rounded-xl ${isCurrent ? "bg-[#2a1f0f] border border-[#f6b012]" : "bg-[#111] hover:bg-[#181818]"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				...attributes,
				...listeners,
				className: "p-1.5 text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none",
				"aria-label": "drag to reorder",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "w-4 h-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onPlay(queueItem),
				className: "flex items-center gap-2.5 flex-1 min-w-0 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
					src: resolveMediaUrl$1(queueItem.track.cover_art_url),
					alt: queueItem.track.album || label,
					fallbackText: label,
					className: "w-9 h-9 rounded-lg object-cover flex-shrink-0",
					eager: isCurrent
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-sm font-medium truncate ${isCurrent ? "text-[#f6b012]" : "text-white"}`,
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-white/40 truncate",
						children: [queueItem.track.artist || "unknown", queueItem.track.album && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-white/25",
							children: [" · ", queueItem.track.album]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onRemove(queueItem.id),
				className: "p-1.5 text-white/25 hover:text-red-400 flex-shrink-0",
				"aria-label": "remove",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
			})
		]
	});
}
function QueueModal({ onClose }) {
	const { queue, currentQueueIndex, playTrack, removeFromQueue, reorderQueueItem, addToQueue, loadQueue, clearQueue } = usePlayerStore((state) => ({
		queue: state.queue,
		currentQueueIndex: state.currentQueueIndex,
		playTrack: state.playTrack,
		removeFromQueue: state.removeFromQueue,
		reorderQueueItem: state.reorderQueueItem,
		addToQueue: state.addToQueue,
		loadQueue: state.loadQueue,
		clearQueue: state.clearQueue
	}));
	const [queueItems, setQueueItems] = (0, import_react.useState)([]);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [searchResults, setSearchResults] = (0, import_react.useState)(null);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [adding, setAdding] = (0, import_react.useState)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)("queue");
	const normalizedQueue = (0, import_react.useMemo)(() => Array.isArray(queue) ? queue : [], [queue]);
	(0, import_react.useEffect)(() => {
		setQueueItems(normalizedQueue);
	}, [normalizedQueue]);
	(0, import_react.useEffect)(() => {
		loadQueue();
	}, [loadQueue]);
	(0, import_react.useEffect)(() => {
		if (!searchQuery.trim()) {
			setSearchResults(null);
			return;
		}
		const timer = setTimeout(async () => {
			setSearching(true);
			try {
				const [tracksRes, playlistsRes, albumsRes] = await Promise.allSettled([
					searchTracks(searchQuery),
					getPlaylists(),
					getAlbums()
				]);
				const tracks = tracksRes.status === "fulfilled" ? Array.isArray(tracksRes.value?.data) ? tracksRes.value.data : [] : [];
				const allPlaylists = playlistsRes.status === "fulfilled" ? Array.isArray(playlistsRes.value?.data) ? playlistsRes.value.data : [] : [];
				const allAlbums = albumsRes.status === "fulfilled" ? Array.isArray(albumsRes.value?.data) ? albumsRes.value.data : [] : [];
				const q = searchQuery.toLowerCase();
				const playlists = allPlaylists.filter((p) => p.name?.toLowerCase().includes(q));
				const albums = allAlbums.filter((a) => (a.album || a.name || "").toLowerCase().includes(q) || (a.artist || "").toLowerCase().includes(q));
				setSearchResults({
					tracks: tracks.slice(0, 20),
					playlists,
					albums: albums.slice(0, 10)
				});
			} catch {
				setSearchResults({
					tracks: [],
					playlists: [],
					albums: []
				});
			} finally {
				setSearching(false);
			}
		}, 280);
		return () => clearTimeout(timer);
	}, [searchQuery]);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: {
		delay: 0,
		tolerance: 3
	} }));
	const handleDragEnd = (0, import_react.useCallback)(async ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const oldIdx = queueItems.findIndex((i) => String(i.id) === String(active.id));
		const newIdx = queueItems.findIndex((i) => String(i.id) === String(over.id));
		if (oldIdx < 0 || newIdx < 0) return;
		setQueueItems(arrayMove(queueItems, oldIdx, newIdx));
		await reorderQueueItem(Number(active.id), newIdx);
		await loadQueue();
	}, [
		queueItems,
		reorderQueueItem,
		loadQueue
	]);
	const handlePlay = (0, import_react.useCallback)((queueItem) => {
		const idx = queueItems.findIndex((i) => i.id === queueItem.id);
		if (idx >= 0) playTrack(queueItem.track, idx);
	}, [queueItems, playTrack]);
	const handleRemove = (0, import_react.useCallback)(async (id) => {
		await removeFromQueue(id);
		await loadQueue();
	}, [removeFromQueue, loadQueue]);
	const handleAddTrack = (0, import_react.useCallback)(async (track) => {
		setAdding(`track-${track.id}`);
		try {
			await addToQueue(track);
			await loadQueue();
		} finally {
			setAdding(null);
		}
	}, [addToQueue, loadQueue]);
	const handleAddPlaylist = (0, import_react.useCallback)(async (playlist) => {
		setAdding(`playlist-${playlist.id}`);
		try {
			const res = await getPlaylist(playlist.id);
			const tracks = Array.isArray(res?.data?.tracks) ? res.data.tracks : [];
			for (const track of tracks) await addToQueue(track);
			await loadQueue();
		} finally {
			setAdding(null);
		}
	}, [addToQueue, loadQueue]);
	const handleAddAlbum = (0, import_react.useCallback)(async (album) => {
		setAdding(`album-${album.album || album.name}`);
		try {
			const res = await searchTracks(album.album || album.name || "");
			const albumTracks = (Array.isArray(res?.data) ? res.data : []).filter((t) => (t.album || "").toLowerCase() === (album.album || album.name || "").toLowerCase());
			for (const track of albumTracks) await addToQueue(track);
			await loadQueue();
		} finally {
			setAdding(null);
		}
	}, [addToQueue, loadQueue]);
	const hasResults = searchResults && (searchResults.tracks.length > 0 || searchResults.playlists.length > 0 || searchResults.albums.length > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[60] flex flex-col justify-end",
		onClick: (e) => {
			if (e.target === e.currentTarget) onClose();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-black/70 backdrop-blur-sm",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative bg-[#0a0a0a] border-t-2 border-[#f6b012] rounded-t-3xl max-h-[85vh] flex flex-col z-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-2.5 pb-0 flex-shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-1 rounded-full bg-white/20" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-4 pt-2 pb-2 flex-shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "w-5 h-5 text-[#f6b012] flex-shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-white font-semibold flex-1 text-base",
							children: "queue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-white/30 text-xs mr-2",
							children: [queueItems.length, " tracks"]
						}),
						queueItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: async () => {
								await clearQueue();
							},
							className: "p-1.5 text-white/30 hover:text-red-400",
							"aria-label": "clear queue",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "p-1.5 text-white/40 hover:text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pb-2 flex-shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" }),
							searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-3.5 h-3.5 text-[#f6b012] absolute right-3 top-1/2 -translate-y-1/2 animate-spin" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value),
								placeholder: "search to add songs, albums, playlists…",
								className: "w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#f6b012] focus:outline-none"
							}),
							searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSearchQuery(""),
								className: "absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto px-4 pb-4 min-h-0",
					children: searchQuery.trim() && searchResults !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							!hasResults && !searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-white/30 text-sm py-6",
								children: "no results"
							}),
							searchResults.playlists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-white/30 uppercase tracking-widest mb-1.5",
								children: "playlists"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: searchResults.playlists.map((pl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#111] hover:bg-[#181818]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "w-4 h-4 text-[#f6b012]" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-white truncate",
												children: pl.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-white/30",
												children: [pl.track_count || "?", " tracks"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleAddPlaylist(pl),
											disabled: adding === `playlist-${pl.id}`,
											className: "p-2 rounded-full bg-[#f6b012]/10 text-[#f6b012] hover:bg-[#f6b012]/20 disabled:opacity-40",
											"aria-label": `add playlist ${pl.name}`,
											children: adding === `playlist-${pl.id}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" })
										})
									]
								}, pl.id))
							})] }),
							searchResults.albums.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-white/30 uppercase tracking-widest mb-1.5",
								children: "albums"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: searchResults.albums.map((al, idx) => {
									const name = al.album || al.name || "unknown album";
									const key = `album-${name}-${idx}`;
									const addKey = `album-${name}`;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#111] hover:bg-[#181818]",
										children: [
											al.cover_art_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: resolveMediaUrl$1(al.cover_art_url),
												alt: name,
												className: "w-9 h-9 rounded-lg object-cover flex-shrink-0"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc3, { className: "w-4 h-4 text-[#f6b012]" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-white truncate",
													children: name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-white/30 truncate",
													children: al.artist || "unknown artist"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => handleAddAlbum(al),
												disabled: adding === addKey,
												className: "p-2 rounded-full bg-[#f6b012]/10 text-[#f6b012] hover:bg-[#f6b012]/20 disabled:opacity-40",
												"aria-label": `add album ${name}`,
												children: adding === addKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" })
											})
										]
									}, key);
								})
							})] }),
							searchResults.tracks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-white/30 uppercase tracking-widest mb-1.5",
								children: "tracks"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: searchResults.tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-[#111] hover:bg-[#181818]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageWithFallback, {
											src: resolveMediaUrl$1(track.cover_art_url),
											alt: track.album || track.title,
											fallbackText: track.title || track.filename,
											className: "w-9 h-9 rounded-lg object-cover flex-shrink-0"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-white truncate",
												children: track.title || track.filename
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-white/30 truncate",
												children: [track.artist || "unknown", track.album && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-white/20",
													children: [" · ", track.album]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleAddTrack(track),
											disabled: adding === `track-${track.id}`,
											className: "p-2 rounded-full bg-[#f6b012]/10 text-[#f6b012] hover:bg-[#f6b012]/20 disabled:opacity-40",
											"aria-label": `add ${track.title}`,
											children: adding === `track-${track.id}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" })
										})
									]
								}, track.id))
							})] })
						]
					}) : queueItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "w-10 h-10 text-white/10 mx-auto mb-3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white/30 text-sm",
								children: "queue is empty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-white/20 text-xs mt-1",
								children: "search above to add songs"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
						sensors,
						collisionDetection: closestCenter,
						onDragEnd: handleDragEnd,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
							items: queueItems.map((i) => String(i.id)),
							strategy: verticalListSortingStrategy,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: queueItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableQueueItem, {
									queueItem: item,
									isCurrent: queueItems.indexOf(item) === currentQueueIndex,
									onPlay: handlePlay,
									onRemove: handleRemove
								}, item.id))
							})
						})
					})
				})
			]
		})]
	});
}
//#endregion
//#region src/components/ErrorBoundary.jsx
var ErrorBoundary$1 = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null
		};
	}
	static getDerivedStateFromError(error) {
		return { hasError: true };
	}
	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({
			error,
			errorInfo
		});
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-screen bg-vibe-black flex items-center justify-center p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl text-vibe-gold mb-4",
						children: "something went wrong"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-white/60 mb-4",
						children: "The app encountered an error. Please refresh the page to try again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => window.location.reload(),
						className: "bg-vibe-gold text-vibe-black px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-colors",
						children: "refresh page"
					}),
					false
				]
			})
		});
		return this.props.children;
	}
};
//#endregion
//#region src/components/PasscodeLock.jsx
var PASSCODE_KEY = "music_app_passcode";
var AUTH_TOKEN_KEY = "music_app_token";
var hashPasscode = (code) => {
	let hash = 0;
	for (let i = 0; i < code.length; i++) {
		const char = code.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return hash.toString(16);
};
var getStoredPasscode = () => {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(PASSCODE_KEY);
};
var setStoredPasscode = (code) => {
	if (typeof window === "undefined") return;
	if (code) window.localStorage.setItem(PASSCODE_KEY, hashPasscode(code));
	else window.localStorage.removeItem(PASSCODE_KEY);
};
var verifyPasscode = (code) => {
	const stored = getStoredPasscode();
	if (!stored) return true;
	return hashPasscode(code) === stored;
};
var hasPasscode = () => {
	return !!getStoredPasscode();
};
var generateToken = (code) => {
	const base = hashPasscode(code);
	return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
		sub: "user",
		exp: Date.now() + 31536e6
	}))}.${base.substring(0, 16)}`;
};
function PasscodeLock({ onUnlock, hasStoredPasscode = false }) {
	const [passcode, setPasscode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [isFirstSetup, setIsFirstSetup] = (0, import_react.useState)(!hasStoredPasscode);
	const [confirmCode, setConfirmCode] = (0, import_react.useState)("");
	const { setAuthToken } = usePlayerStore();
	const handleSubmit = (e) => {
		e.preventDefault();
		setError(null);
		if (isFirstSetup) {
			if (passcode.length < 4) {
				setError("passcode must be at least 4 digits");
				return;
			}
			if (passcode !== confirmCode) {
				setError("passcodes do not match");
				return;
			}
			setStoredPasscode(passcode);
			const token = generateToken(passcode);
			console.log("Generated token:", token);
			console.log("Token parts:", token.split("."));
			window.localStorage.setItem(AUTH_TOKEN_KEY, token);
			setAuthToken(token);
			onUnlock?.();
		} else if (verifyPasscode(passcode)) {
			const token = generateToken(passcode);
			console.log("Generated token (verify):", token);
			window.localStorage.setItem(AUTH_TOKEN_KEY, token);
			setAuthToken(token);
			onUnlock?.();
		} else {
			setError("incorrect passcode");
			setPasscode("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-vibe-black flex items-center justify-center p-4 z-50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-white text-center mb-2",
					children: isFirstSetup ? "create passcode" : "enter passcode"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white/60 text-center mb-6 text-sm",
					children: isFirstSetup ? "set a passcode to protect your music" : "enter your passcode to continue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-sm text-white/70 mb-1",
							children: isFirstSetup ? "passcode" : "passcode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							inputMode: "numeric",
							pattern: "[0-9]*",
							maxLength: 6,
							value: passcode,
							onChange: (e) => setPasscode(e.target.value.replace(/[^0-9]/g, "")),
							className: "w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-vibe-gold",
							placeholder: "••••",
							autoFocus: true
						})] }),
						isFirstSetup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-sm text-white/70 mb-1",
							children: "confirm passcode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							inputMode: "numeric",
							pattern: "[0-9]*",
							maxLength: 6,
							value: confirmCode,
							onChange: (e) => setConfirmCode(e.target.value.replace(/[^0-9]/g, "")),
							className: "w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-vibe-gold",
							placeholder: "••••"
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-red-400 text-center",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "w-full rounded-xl bg-vibe-gold py-3 text-black font-semibold hover:bg-yellow-500 transition",
							children: isFirstSetup ? "create" : "unlock"
						})
					]
				}),
				!isFirstSetup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-xs text-white/40",
					children: "reinstall? use the same passcode to access your data"
				})
			]
		})
	});
}
//#endregion
//#region node_modules/@capacitor/core/dist/index.js
/*! Capacitor: https://capacitorjs.com/ - MIT License */
var createCapacitorPlatforms = (win) => {
	const defaultPlatformMap = /* @__PURE__ */ new Map();
	defaultPlatformMap.set("web", { name: "web" });
	const capPlatforms = win.CapacitorPlatforms || {
		currentPlatform: { name: "web" },
		platforms: defaultPlatformMap
	};
	const addPlatform = (name, platform) => {
		capPlatforms.platforms.set(name, platform);
	};
	const setPlatform = (name) => {
		if (capPlatforms.platforms.has(name)) capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
	};
	capPlatforms.addPlatform = addPlatform;
	capPlatforms.setPlatform = setPlatform;
	return capPlatforms;
};
var initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
/**
* @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
*/
var CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
CapacitorPlatforms.addPlatform;
CapacitorPlatforms.setPlatform;
var ExceptionCode;
(function(ExceptionCode) {
	/**
	* API is not implemented.
	*
	* This usually means the API can't be used because it is not implemented for
	* the current platform.
	*/
	ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
	/**
	* API is not available.
	*
	* This means the API can't be used right now because:
	*   - it is currently missing a prerequisite, such as network connectivity
	*   - it requires a particular platform or browser version
	*/
	ExceptionCode["Unavailable"] = "UNAVAILABLE";
})(ExceptionCode || (ExceptionCode = {}));
var CapacitorException = class extends Error {
	constructor(message, code, data) {
		super(message);
		this.message = message;
		this.code = code;
		this.data = data;
	}
};
var getPlatformId = (win) => {
	var _a, _b;
	if (win === null || win === void 0 ? void 0 : win.androidBridge) return "android";
	else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) return "ios";
	else return "web";
};
var createCapacitor = (win) => {
	var _a, _b, _c, _d, _e;
	const capCustomPlatform = win.CapacitorCustomPlatform || null;
	const cap = win.Capacitor || {};
	const Plugins = cap.Plugins = cap.Plugins || {};
	/**
	* @deprecated Use `capCustomPlatform` instead, default functions like registerPlugin will function with the new object.
	*/
	const capPlatforms = win.CapacitorPlatforms;
	const defaultGetPlatform = () => {
		return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
	};
	const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
	const defaultIsNativePlatform = () => getPlatform() !== "web";
	const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
	const defaultIsPluginAvailable = (pluginName) => {
		const plugin = registeredPlugins.get(pluginName);
		if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) return true;
		if (getPluginHeader(pluginName)) return true;
		return false;
	};
	const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
	const defaultGetPluginHeader = (pluginName) => {
		var _a;
		return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
	};
	const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
	const handleError = (err) => win.console.error(err);
	const pluginMethodNoop = (_target, prop, pluginName) => {
		return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
	};
	const registeredPlugins = /* @__PURE__ */ new Map();
	const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
		const registeredPlugin = registeredPlugins.get(pluginName);
		if (registeredPlugin) {
			console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
			return registeredPlugin.proxy;
		}
		const platform = getPlatform();
		const pluginHeader = getPluginHeader(pluginName);
		let jsImplementation;
		const loadPluginImplementation = async () => {
			if (!jsImplementation && platform in jsImplementations) jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
			else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
			return jsImplementation;
		};
		const createPluginMethod = (impl, prop) => {
			var _a, _b;
			if (pluginHeader) {
				const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
				if (methodHeader) if (methodHeader.rtype === "promise") return (options) => cap.nativePromise(pluginName, prop.toString(), options);
				else return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
				else if (impl) return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
			} else if (impl) return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
			else throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
		};
		const createPluginMethodWrapper = (prop) => {
			let remove;
			const wrapper = (...args) => {
				const p = loadPluginImplementation().then((impl) => {
					const fn = createPluginMethod(impl, prop);
					if (fn) {
						const p = fn(...args);
						remove = p === null || p === void 0 ? void 0 : p.remove;
						return p;
					} else throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
				});
				if (prop === "addListener") p.remove = async () => remove();
				return p;
			};
			wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
			Object.defineProperty(wrapper, "name", {
				value: prop,
				writable: false,
				configurable: false
			});
			return wrapper;
		};
		const addListener = createPluginMethodWrapper("addListener");
		const removeListener = createPluginMethodWrapper("removeListener");
		const addListenerNative = (eventName, callback) => {
			const call = addListener({ eventName }, callback);
			const remove = async () => {
				removeListener({
					eventName,
					callbackId: await call
				}, callback);
			};
			const p = new Promise((resolve) => call.then(() => resolve({ remove })));
			p.remove = async () => {
				console.warn(`Using addListener() without 'await' is deprecated.`);
				await remove();
			};
			return p;
		};
		const proxy = new Proxy({}, { get(_, prop) {
			switch (prop) {
				case "$$typeof": return;
				case "toJSON": return () => ({});
				case "addListener": return pluginHeader ? addListenerNative : addListener;
				case "removeListener": return removeListener;
				default: return createPluginMethodWrapper(prop);
			}
		} });
		Plugins[pluginName] = proxy;
		registeredPlugins.set(pluginName, {
			name: pluginName,
			proxy,
			platforms: new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
		});
		return proxy;
	};
	const registerPlugin = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
	if (!cap.convertFileSrc) cap.convertFileSrc = (filePath) => filePath;
	cap.getPlatform = getPlatform;
	cap.handleError = handleError;
	cap.isNativePlatform = isNativePlatform;
	cap.isPluginAvailable = isPluginAvailable;
	cap.pluginMethodNoop = pluginMethodNoop;
	cap.registerPlugin = registerPlugin;
	cap.Exception = CapacitorException;
	cap.DEBUG = !!cap.DEBUG;
	cap.isLoggingEnabled = !!cap.isLoggingEnabled;
	cap.platform = cap.getPlatform();
	cap.isNative = cap.isNativePlatform();
	return cap;
};
var initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
var Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
var registerPlugin = Capacitor.registerPlugin;
Capacitor.Plugins;
/**
* Base class web plugins should extend.
*/
var WebPlugin = class {
	constructor(config) {
		this.listeners = {};
		this.windowListeners = {};
		if (config) {
			console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
			this.config = config;
		}
	}
	addListener(eventName, listenerFunc) {
		if (!this.listeners[eventName]) this.listeners[eventName] = [];
		this.listeners[eventName].push(listenerFunc);
		const windowListener = this.windowListeners[eventName];
		if (windowListener && !windowListener.registered) this.addWindowListener(windowListener);
		const remove = async () => this.removeListener(eventName, listenerFunc);
		const p = Promise.resolve({ remove });
		Object.defineProperty(p, "remove", { value: async () => {
			console.warn(`Using addListener() without 'await' is deprecated.`);
			await remove();
		} });
		return p;
	}
	async removeAllListeners() {
		this.listeners = {};
		for (const listener in this.windowListeners) this.removeWindowListener(this.windowListeners[listener]);
		this.windowListeners = {};
	}
	notifyListeners(eventName, data) {
		const listeners = this.listeners[eventName];
		if (listeners) listeners.forEach((listener) => listener(data));
	}
	hasListeners(eventName) {
		return !!this.listeners[eventName].length;
	}
	registerWindowListener(windowEventName, pluginEventName) {
		this.windowListeners[pluginEventName] = {
			registered: false,
			windowEventName,
			pluginEventName,
			handler: (event) => {
				this.notifyListeners(pluginEventName, event);
			}
		};
	}
	unimplemented(msg = "not implemented") {
		return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
	}
	unavailable(msg = "not available") {
		return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
	}
	async removeListener(eventName, listenerFunc) {
		const listeners = this.listeners[eventName];
		if (!listeners) return;
		const index = listeners.indexOf(listenerFunc);
		this.listeners[eventName].splice(index, 1);
		if (!this.listeners[eventName].length) this.removeWindowListener(this.windowListeners[eventName]);
	}
	addWindowListener(handle) {
		window.addEventListener(handle.windowEventName, handle.handler);
		handle.registered = true;
	}
	removeWindowListener(handle) {
		if (!handle) return;
		window.removeEventListener(handle.windowEventName, handle.handler);
		handle.registered = false;
	}
};
/******** END WEB VIEW PLUGIN ********/
/******** COOKIES PLUGIN ********/
/**
* Safely web encode a string value (inspired by js-cookie)
* @param str The string value to encode
*/
var encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
/**
* Safely web decode a string value (inspired by js-cookie)
* @param str The string value to decode
*/
var decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
var CapacitorCookiesPluginWeb = class extends WebPlugin {
	async getCookies() {
		const cookies = document.cookie;
		const cookieMap = {};
		cookies.split(";").forEach((cookie) => {
			if (cookie.length <= 0) return;
			let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
			key = decode(key).trim();
			value = decode(value).trim();
			cookieMap[key] = value;
		});
		return cookieMap;
	}
	async setCookie(options) {
		try {
			const encodedKey = encode(options.key);
			const encodedValue = encode(options.value);
			const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
			const path = (options.path || "/").replace("path=", "");
			const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
			document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async deleteCookie(options) {
		try {
			document.cookie = `${options.key}=; Max-Age=0`;
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async clearCookies() {
		try {
			const cookies = document.cookie.split(";") || [];
			for (const cookie of cookies) document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async clearAllCookies() {
		try {
			await this.clearCookies();
		} catch (error) {
			return Promise.reject(error);
		}
	}
};
registerPlugin("CapacitorCookies", { web: () => new CapacitorCookiesPluginWeb() });
/**
* Read in a Blob value and return it as a base64 string
* @param blob The blob value to convert to a base64 string
*/
var readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => {
		const base64String = reader.result;
		resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
	};
	reader.onerror = (error) => reject(error);
	reader.readAsDataURL(blob);
});
/**
* Normalize an HttpHeaders map by lowercasing all of the values
* @param headers The HttpHeaders object to normalize
*/
var normalizeHttpHeaders = (headers = {}) => {
	const originalKeys = Object.keys(headers);
	return Object.keys(headers).map((k) => k.toLocaleLowerCase()).reduce((acc, key, index) => {
		acc[key] = headers[originalKeys[index]];
		return acc;
	}, {});
};
/**
* Builds a string of url parameters that
* @param params A map of url parameters
* @param shouldEncode true if you should encodeURIComponent() the values (true by default)
*/
var buildUrlParams = (params, shouldEncode = true) => {
	if (!params) return null;
	return Object.entries(params).reduce((accumulator, entry) => {
		const [key, value] = entry;
		let encodedValue;
		let item;
		if (Array.isArray(value)) {
			item = "";
			value.forEach((str) => {
				encodedValue = shouldEncode ? encodeURIComponent(str) : str;
				item += `${key}=${encodedValue}&`;
			});
			item.slice(0, -1);
		} else {
			encodedValue = shouldEncode ? encodeURIComponent(value) : value;
			item = `${key}=${encodedValue}`;
		}
		return `${accumulator}&${item}`;
	}, "").substr(1);
};
/**
* Build the RequestInit object based on the options passed into the initial request
* @param options The Http plugin options
* @param extra Any extra RequestInit values
*/
var buildRequestInit = (options, extra = {}) => {
	const output = Object.assign({
		method: options.method || "GET",
		headers: options.headers
	}, extra);
	const type = normalizeHttpHeaders(options.headers)["content-type"] || "";
	if (typeof options.data === "string") output.body = options.data;
	else if (type.includes("application/x-www-form-urlencoded")) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(options.data || {})) params.set(key, value);
		output.body = params.toString();
	} else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
		const form = new FormData();
		if (options.data instanceof FormData) options.data.forEach((value, key) => {
			form.append(key, value);
		});
		else for (const key of Object.keys(options.data)) form.append(key, options.data[key]);
		output.body = form;
		const headers = new Headers(output.headers);
		headers.delete("content-type");
		output.headers = headers;
	} else if (type.includes("application/json") || typeof options.data === "object") output.body = JSON.stringify(options.data);
	return output;
};
var CapacitorHttpPluginWeb = class extends WebPlugin {
	/**
	* Perform an Http request given a set of options
	* @param options Options to build the HTTP request
	*/
	async request(options) {
		const requestInit = buildRequestInit(options, options.webFetchExtra);
		const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
		const url = urlParams ? `${options.url}?${urlParams}` : options.url;
		const response = await fetch(url, requestInit);
		const contentType = response.headers.get("content-type") || "";
		let { responseType = "text" } = response.ok ? options : {};
		if (contentType.includes("application/json")) responseType = "json";
		let data;
		let blob;
		switch (responseType) {
			case "arraybuffer":
			case "blob":
				blob = await response.blob();
				data = await readBlobAsBase64(blob);
				break;
			case "json":
				data = await response.json();
				break;
			default: data = await response.text();
		}
		const headers = {};
		response.headers.forEach((value, key) => {
			headers[key] = value;
		});
		return {
			data,
			headers,
			status: response.status,
			url: response.url
		};
	}
	/**
	* Perform an Http GET request given a set of options
	* @param options Options to build the HTTP request
	*/
	async get(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
	}
	/**
	* Perform an Http POST request given a set of options
	* @param options Options to build the HTTP request
	*/
	async post(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
	}
	/**
	* Perform an Http PUT request given a set of options
	* @param options Options to build the HTTP request
	*/
	async put(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
	}
	/**
	* Perform an Http PATCH request given a set of options
	* @param options Options to build the HTTP request
	*/
	async patch(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
	}
	/**
	* Perform an Http DELETE request given a set of options
	* @param options Options to build the HTTP request
	*/
	async delete(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
	}
};
registerPlugin("CapacitorHttp", { web: () => new CapacitorHttpPluginWeb() });
//#endregion
//#region src/widgetBridge.js
var WidgetBridge = null;
var isAndroidNative = false;
try {
	isAndroidNative = Capacitor && typeof Capacitor.getPlatform === "function" && Capacitor.getPlatform() === "android";
	if (isAndroidNative) WidgetBridge = registerPlugin("WidgetBridge");
} catch (e) {
	console.warn("Capacitor widget bridge init failed:", e);
}
async function syncWidgetState(state) {
	if (!isAndroidNative || !WidgetBridge) return;
	try {
		await WidgetBridge.updateWidgetState(state);
	} catch (error) {
		console.warn("syncWidgetState failed:", error);
	}
}
async function consumeWidgetAction() {
	if (!isAndroidNative || !WidgetBridge) return null;
	try {
		const action = await WidgetBridge.consumePendingAction();
		return action?.action ? action : null;
	} catch (error) {
		console.warn("consumeWidgetAction failed:", error);
		return null;
	}
}
//#endregion
//#region src/hooks/useSwipeBack.js
var EDGE_THRESHOLD = 48;
var MIN_DISTANCE = 72;
var MAX_VERTICAL_SLOPE = .75;
var isCoarsePointer = () => {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
	return window.matchMedia("(pointer: coarse)").matches;
};
var isTouchDevice = () => {
	if (typeof window === "undefined") return false;
	return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};
function useSwipeBack({ enabled = true, onBack } = {}) {
	const stateRef = (0, import_react.useRef)({
		active: false,
		startX: 0,
		startY: 0,
		progress: 0
	});
	const indicatorRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!enabled || typeof document === "undefined" || typeof window === "undefined") return;
		if (!isTouchDevice() && !isCoarsePointer()) return;
		const state = stateRef.current;
		const reset = () => {
			state.active = false;
			state.startX = 0;
			state.startY = 0;
			state.progress = 0;
			hideIndicator();
		};
		const showIndicator = (progress) => {
			if (!indicatorRef.current) {
				const el = document.createElement("div");
				el.id = "swipe-back-indicator";
				el.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 4px;
          height: 100vh;
          background: linear-gradient(to bottom, #f6b012, #ffcc40);
          transform: translateX(-100%);
          transition: transform 0.1s ease-out, opacity 0.2s;
          opacity: 0;
          z-index: 9999;
          pointer-events: none;
        `;
				document.body.appendChild(el);
				indicatorRef.current = el;
			}
			const opacity = Math.min(progress / MIN_DISTANCE, 1) * .8;
			const translate = Math.min(progress / MIN_DISTANCE * 4, 4);
			indicatorRef.current.style.opacity = opacity;
			indicatorRef.current.style.transform = `translateX(${translate - 4}px)`;
		};
		const hideIndicator = () => {
			if (indicatorRef.current) {
				indicatorRef.current.style.opacity = "0";
				indicatorRef.current.style.transform = "translateX(-100%)";
			}
		};
		const shouldStartGesture = (x) => {
			return x <= EDGE_THRESHOLD;
		};
		const handleTouchStart = (event) => {
			if (event.touches.length !== 1) {
				reset();
				return;
			}
			const touch = event.touches[0];
			if (!shouldStartGesture(touch.clientX)) {
				reset();
				return;
			}
			if (event.target.closest("button, a, input, textarea, select, [role=\"button\"], .no-swipe-back")) {
				reset();
				return;
			}
			state.active = true;
			state.startX = touch.clientX;
			state.startY = touch.clientY;
			state.progress = 0;
		};
		const handleTouchMove = (event) => {
			if (!state.active) return;
			const touch = event.touches[0];
			const deltaX = touch.clientX - state.startX;
			const deltaY = touch.clientY - state.startY;
			if (deltaX <= 0) {
				reset();
				return;
			}
			if (Math.abs(deltaY) > deltaX * MAX_VERTICAL_SLOPE) {
				reset();
				return;
			}
			state.progress = deltaX;
			showIndicator(deltaX);
			if (deltaX > 30 && Math.abs(deltaY) < deltaX * .5) try {
				event.preventDefault();
			} catch (err) {}
			if (deltaX > MIN_DISTANCE) {
				triggerSelection();
				reset();
				if (typeof onBack === "function") onBack();
			}
		};
		const handleTouchEnd = () => {
			reset();
		};
		const handleTouchCancel = () => {
			reset();
		};
		document.addEventListener("touchstart", handleTouchStart, {
			passive: true,
			capture: true
		});
		document.addEventListener("touchmove", handleTouchMove, {
			passive: false,
			capture: true
		});
		document.addEventListener("touchend", handleTouchEnd, {
			passive: true,
			capture: true
		});
		document.addEventListener("touchcancel", handleTouchCancel, {
			passive: true,
			capture: true
		});
		return () => {
			document.removeEventListener("touchstart", handleTouchStart, { capture: true });
			document.removeEventListener("touchmove", handleTouchMove, { capture: true });
			document.removeEventListener("touchend", handleTouchEnd, { capture: true });
			document.removeEventListener("touchcancel", handleTouchCancel, { capture: true });
			if (indicatorRef.current && indicatorRef.current.parentNode) {
				indicatorRef.current.parentNode.removeChild(indicatorRef.current);
				indicatorRef.current = null;
			}
		};
	}, [enabled, onBack]);
}
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep, importerUrl) {
	return new URL(dep, importerUrl).href;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (!!importerUrl) for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region node_modules/@capacitor/app/dist/esm/index.js
var App$1 = registerPlugin("App", { web: () => __vitePreload(() => import("./web-Cda0zSTb.js").then((m) => new m.AppWeb()), [], import.meta.url) });
//#endregion
//#region node_modules/@capacitor/status-bar/dist/esm/definitions.js
var Style;
(function(Style) {
	/**
	* Light text for dark backgrounds.
	*
	* @since 1.0.0
	*/
	Style["Dark"] = "DARK";
	/**
	* Dark text for light backgrounds.
	*
	* @since 1.0.0
	*/
	Style["Light"] = "LIGHT";
	/**
	* The style is based on the device appearance.
	* If the device is using Dark mode, the statusbar text will be light.
	* If the device is using Light mode, the statusbar text will be dark.
	* On Android the default will be the one the app was launched with.
	*
	* @since 1.0.0
	*/
	Style["Default"] = "DEFAULT";
})(Style || (Style = {}));
var Animation;
(function(Animation) {
	/**
	* No animation during show/hide.
	*
	* @since 1.0.0
	*/
	Animation["None"] = "NONE";
	/**
	* Slide animation during show/hide.
	* It doesn't work on iOS 15+.
	*
	* @deprecated Use Animation.Fade or Animation.None instead.
	*
	* @since 1.0.0
	*/
	Animation["Slide"] = "SLIDE";
	/**
	* Fade animation during show/hide.
	*
	* @since 1.0.0
	*/
	Animation["Fade"] = "FADE";
})(Animation || (Animation = {}));
//#endregion
//#region node_modules/@capacitor/status-bar/dist/esm/index.js
var StatusBar = registerPlugin("StatusBar");
//#endregion
//#region src/App.jsx
var Home = (0, import_react.lazy)(() => __vitePreload(() => import("./Home-KbBMg39u.js"), __vite__mapDeps([0,1,2,3,4,5,6]), import.meta.url));
var PlayerPage = (0, import_react.lazy)(() => __vitePreload(() => import("./PlayerPage-DXp16TeU.js"), __vite__mapDeps([7,1,3,4,5]), import.meta.url));
var Playlists = (0, import_react.lazy)(() => __vitePreload(() => import("./Playlists-Csz2C96K.js"), __vite__mapDeps([8,1,2,3,4,5,6]), import.meta.url));
var PlaylistDetail = (0, import_react.lazy)(() => __vitePreload(() => import("./PlaylistDetail-DQpxbAPg.js"), __vite__mapDeps([9,1,2,10,3,4,5]), import.meta.url));
var Artists = (0, import_react.lazy)(() => __vitePreload(() => import("./Artists-B0bsD1mB.js"), __vite__mapDeps([11,1,2,4,5]), import.meta.url));
var ArtistDetail = (0, import_react.lazy)(() => __vitePreload(() => import("./ArtistDetail-JUxn8D-L.js"), __vite__mapDeps([12,1,2,10,3,4,5]), import.meta.url));
var Albums = (0, import_react.lazy)(() => __vitePreload(() => import("./Albums-B5IibksT.js"), __vite__mapDeps([13,1,2,3,4,5,6]), import.meta.url));
var AlbumDetail = (0, import_react.lazy)(() => __vitePreload(() => import("./AlbumDetail-C1DGl9RR.js"), __vite__mapDeps([14,1,2,10,3,4,5]), import.meta.url));
var Favorites = (0, import_react.lazy)(() => __vitePreload(() => import("./Favorites-D_LPrZ4r.js"), __vite__mapDeps([15,1,4]), import.meta.url));
var History = (0, import_react.lazy)(() => __vitePreload(() => import("./History-B3uNnE9u.js"), __vite__mapDeps([16,1,4]), import.meta.url));
var Login = (0, import_react.lazy)(() => __vitePreload(() => import("./Login-CInayjdK.js"), __vite__mapDeps([17,1,2]), import.meta.url));
var Profile = (0, import_react.lazy)(() => __vitePreload(() => import("./Profile-ywDcyVgi.js"), __vite__mapDeps([18,1,2]), import.meta.url));
var Share = (0, import_react.lazy)(() => __vitePreload(() => import("./Share-B-Xtwq8p.js"), __vite__mapDeps([19,1,2]), import.meta.url));
var Download = (0, import_react.lazy)(() => __vitePreload(() => import("./Download-BcCbCm88.js"), __vite__mapDeps([20,1,2,4,5]), import.meta.url));
var PageLoader = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "min-h-screen bg-vibe-black flex items-center justify-center",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-8 border-2 border-vibe-gold border-t-transparent rounded-full animate-spin" })
});
function getBackgroundModePlugin() {
	if (typeof window === "undefined") return null;
	return window.cordova?.plugins?.backgroundMode || null;
}
function parseLRC(lrc) {
	if (!lrc) return [];
	const lines = lrc.split("\n");
	const parsed = [];
	for (const line of lines) {
		const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
		if (!match) continue;
		const mins = Number(match[1]);
		const secs = Number(match[2]);
		const hundredths = Number(match[3].slice(0, 2));
		const text = (match[4] || "").trim();
		if (!text) continue;
		parsed.push({
			time: mins * 60 + secs + hundredths / 100,
			text
		});
	}
	return parsed.sort((a, b) => a.time - b.time);
}
function AppContent() {
	const audioRef = (0, import_react.useRef)(null);
	const { setAudioRef, loadPlayerState, loadQueue, currentTrack, isPlaying, currentPosition, showLyrics, showQueue, setShowQueue, queue, currentQueueIndex, searchOverlayActive } = usePlayerStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [appError, setAppError] = (0, import_react.useState)(null);
	const [isInitialized, setIsInitialized] = (0, import_react.useState)(false);
	const [plainLyrics, setPlainLyrics] = (0, import_react.useState)("");
	const [syncedLines, setSyncedLines] = (0, import_react.useState)([]);
	const [isDesktopViewport, setIsDesktopViewport] = (0, import_react.useState)(false);
	const [isPlayerHidden, setIsPlayerHidden] = (0, import_react.useState)(false);
	const [keyboardVisible, setKeyboardVisible] = (0, import_react.useState)(false);
	const [inputFocusActive, setInputFocusActive] = (0, import_react.useState)(false);
	const [isUnlocked, setIsUnlocked] = (0, import_react.useState)(false);
	const [isLockChecked, setIsLockChecked] = (0, import_react.useState)(false);
	const [hasPasscodeStorage, setHasPasscodeStorage] = (0, import_react.useState)(false);
	useSwipeBack({
		enabled: true,
		onBack: (0, import_react.useCallback)(() => {
			window.dispatchEvent(new CustomEvent("clearSearch"));
			if (location.pathname === "/" && searchOverlayActive) {
				const store = usePlayerStore.getState();
				if (store && typeof store.setSearchOverlayActive === "function") store.setSearchOverlayActive(false);
				return;
			}
			const activeElement = document.activeElement;
			const isSearchFocused = activeElement?.tagName === "INPUT" && (activeElement.type === "text" || activeElement.type === "search");
			if (isSearchFocused && activeElement.value?.trim() || isSearchFocused) return;
			if (location.pathname === "/") return;
			if (window.history.length > 1) window.history.back();
			else navigate("/", { replace: true });
		}, [
			navigate,
			location.pathname,
			searchOverlayActive
		])
	});
	(0, import_react.useEffect)(() => {
		const setupStatusBar = async () => {
			try {
				await StatusBar.setOverlaysWebView({ overlay: true });
			} catch (e) {}
		};
		setupStatusBar();
	}, []);
	(0, import_react.useEffect)(() => {
		const checkPasscode = () => {
			const stored = hasPasscode();
			setHasPasscodeStorage(stored);
			const existingToken = typeof window !== "undefined" ? window.localStorage.getItem("music_app_token") : null;
			setIsUnlocked(stored && existingToken ? true : false);
			setIsLockChecked(true);
		};
		setTimeout(checkPasscode, 100);
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && (window.Capacitor?.isNativePlatform?.() || /android|iphone|ipad|ipod/i.test(navigator.userAgent) && window.location.protocol === "capacitor:")) document.body.classList.add("native-app");
		else document.body.classList.remove("native-app");
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
		const mediaQuery = window.matchMedia("(min-width: 768px)");
		const updateViewport = (event) => {
			setIsDesktopViewport(event.matches);
		};
		setIsDesktopViewport(mediaQuery.matches);
		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", updateViewport);
			return () => mediaQuery.removeEventListener("change", updateViewport);
		}
		mediaQuery.addListener(updateViewport);
		return () => mediaQuery.removeListener(updateViewport);
	}, []);
	(0, import_react.useEffect)(() => {
		setIsPlayerHidden(false);
	}, [currentTrack?.id]);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey && e.key === "f") {
				const activeElement = document.activeElement;
				const isInputFocused = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";
				const path = location.pathname;
				if (!(path === "/" || path === "/albums" || path === "/artists" || path === "/playlists" || path.startsWith("/album/") || path.startsWith("/artists/") || path.startsWith("/playlists/")) && !isInputFocused) {
					e.preventDefault();
					navigate("/", { state: { focusSearch: true } });
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [location.pathname, navigate]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || typeof window.visualViewport === "undefined") return;
		const viewport = window.visualViewport;
		const detectKeyboard = () => {
			setKeyboardVisible(window.innerHeight - viewport.height > 120);
		};
		viewport.addEventListener("resize", detectKeyboard);
		viewport.addEventListener("scroll", detectKeyboard);
		detectKeyboard();
		return () => {
			viewport.removeEventListener("resize", detectKeyboard);
			viewport.removeEventListener("scroll", detectKeyboard);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || typeof document === "undefined") return;
		const editableSelector = "input, textarea, select, [contenteditable=\"true\"]";
		const matchesEditable = (el) => Boolean(el?.matches?.(editableSelector));
		const handleFocusIn = (event) => {
			if (isDesktopViewport) {
				setInputFocusActive(false);
				return;
			}
			if (matchesEditable(event.target)) setInputFocusActive(true);
		};
		const handleFocusOut = () => {
			if (isDesktopViewport) {
				setInputFocusActive(false);
				return;
			}
			const activeElement = document.activeElement;
			if (!matchesEditable(activeElement)) setInputFocusActive(false);
		};
		window.addEventListener("focusin", handleFocusIn);
		window.addEventListener("focusout", handleFocusOut);
		return () => {
			window.removeEventListener("focusin", handleFocusIn);
			window.removeEventListener("focusout", handleFocusOut);
		};
	}, [isDesktopViewport]);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const init = async () => {
			try {
				console.log("Step 2: create audio...");
				const audio = document.createElement("audio");
				audio.preload = "metadata";
				audio.setAttribute("playsinline", "true");
				audio.setAttribute("webkit-playsinline", "true");
				audio.crossOrigin = "anonymous";
				audio.id = "background-audio-player";
				audio.style.display = "none";
				document.body.appendChild(audio);
				audioRef.current = audio;
				console.log("Step 3: setAudioRef...");
				const store = usePlayerStore.getState();
				if (store && typeof store.setAudioRef === "function") store.setAudioRef(audio);
				else console.warn("setAudioRef is not a function");
				console.log("Step 3b: initAudioContext...");
				if (store && typeof store.initAudioContext === "function") store.initAudioContext();
				console.log("Step 4: loading states...");
				Promise.allSettled([
					store && typeof store.loadPlayerState === "function" ? store.loadPlayerState() : Promise.resolve(),
					store && typeof store.loadQueue === "function" ? store.loadQueue() : Promise.resolve(),
					store && typeof store.loadUser === "function" ? store.loadUser() : Promise.resolve(),
					store && typeof store.loadSettings === "function" ? store.loadSettings() : Promise.resolve()
				]).catch(() => {});
				console.log("Step 5: done!");
			} catch (error) {
				console.error("App initialization error:", error);
				console.error("Error stack:", error.stack);
				if (mounted) setAppError(error.message + " (check console for details)");
			} finally {
				if (mounted) setIsInitialized(true);
			}
		};
		init();
		return () => {
			mounted = false;
			const audio = audioRef.current;
			if (audio) {
				try {
					audio.pause();
					audio.src = "";
					audio.removeAttribute("src");
					audio.load();
				} catch (e) {}
				if (audio.parentNode) audio.parentNode.removeChild(audio);
				audioRef.current = null;
				const store = usePlayerStore.getState();
				if (store && typeof store.setAudioRef === "function") store.setAudioRef(null);
			}
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const handleTimeUpdate = () => {
			const store = usePlayerStore.getState();
			if (store.isDraggingProgress) return;
			const currentTime = audio.currentTime;
			if (currentTime === 0 && store.currentPosition > 5) return;
			store.setCurrentPosition(currentTime);
		};
		const handleLoadedMetadata = () => {
			const store = usePlayerStore.getState();
			if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) store.setAudioDuration(audio.duration);
		};
		const handleDurationChange = () => {
			const store = usePlayerStore.getState();
			if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) store.setAudioDuration(audio.duration);
		};
		const handleCanPlay = () => {
			const store = usePlayerStore.getState();
			if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) store.setAudioDuration(audio.duration);
		};
		const handleLoadedData = () => {
			const store = usePlayerStore.getState();
			if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) store.setAudioDuration(audio.duration);
		};
		const handleEnded = () => {
			const store = usePlayerStore.getState();
			if (store.startCrossfade) {
				if (store.startCrossfade()) return;
			}
			store.nextTrack();
		};
		const handleError = () => {
			console.error("Audio error:", audio.error);
			const store = usePlayerStore.getState();
			if (audio.error && audio.error.code === 2 && store.isPlaying && audio.src) setTimeout(() => {
				if (store.isPlaying && audio.paused) audio.play().catch(() => {});
			}, 1e3);
		};
		const handleStalled = () => {
			const store = usePlayerStore.getState();
			if (store.isPlaying && audio.paused) setTimeout(() => {
				if (store.isPlaying && audio.paused) audio.play().catch(() => {});
			}, 500);
		};
		const handleWaiting = () => {
			const store = usePlayerStore.getState();
			if (store.isPlaying && audio.paused) {
				const resumeOnCanPlay = () => {
					if (store.isPlaying) audio.play().catch(() => {});
					audio.removeEventListener("canplay", resumeOnCanPlay);
				};
				audio.addEventListener("canplay", resumeOnCanPlay, { once: true });
			}
		};
		const handleSuspend = () => {
			if (usePlayerStore.getState().isPlaying && audio.paused) audio.play().catch(() => {});
		};
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("durationchange", handleDurationChange);
		audio.addEventListener("canplay", handleCanPlay);
		audio.addEventListener("loadeddata", handleLoadedData);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);
		audio.addEventListener("stalled", handleStalled);
		audio.addEventListener("waiting", handleWaiting);
		audio.addEventListener("suspend", handleSuspend);
		if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) usePlayerStore.getState().setAudioDuration(audio.duration);
		const durationCheckInterval = setInterval(() => {
			if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
				const store = usePlayerStore.getState();
				if (store.audioDuration !== audio.duration) store.setAudioDuration(audio.duration);
			}
		}, 1e3);
		return () => {
			clearInterval(durationCheckInterval);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("durationchange", handleDurationChange);
			audio.removeEventListener("canplay", handleCanPlay);
			audio.removeEventListener("loadeddata", handleLoadedData);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);
			audio.removeEventListener("stalled", handleStalled);
			audio.removeEventListener("waiting", handleWaiting);
			audio.removeEventListener("suspend", handleSuspend);
		};
	}, [isInitialized]);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (!audio || !currentTrack) return;
		if (isPlaying) audio.play().catch((err) => console.error("Play failed:", err));
		else audio.pause();
	}, [isPlaying, currentTrack]);
	(0, import_react.useEffect)(() => {
		if (!isInitialized) return;
		if (getBackgroundModePlugin()) return;
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				const store = usePlayerStore.getState();
				const audio = audioRef.current;
				if (!audio) return;
				const actuallyPlaying = !audio.paused && !audio.ended;
				if (store.isPlaying !== actuallyPlaying) store.setIsPlaying(actuallyPlaying);
				if (Number.isFinite(audio.currentTime)) store.setCurrentPosition(audio.currentTime);
				if (audio.duration && Number.isFinite(audio.duration)) store.setAudioDuration(audio.duration);
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [isInitialized]);
	(0, import_react.useEffect)(() => {
		syncWidgetState({
			currentTrack,
			queue,
			currentQueueIndex,
			isPlaying
		});
	}, [
		currentTrack,
		queue,
		currentQueueIndex,
		isPlaying
	]);
	(0, import_react.useEffect)(() => {
		if (!isInitialized) return;
		let cancelled = false;
		const processWidgetAction = async () => {
			try {
				const pendingAction = await consumeWidgetAction();
				if (cancelled || !pendingAction) return;
				const action = pendingAction?.action;
				if (!action) return;
				if (pendingAction.route) window.location.hash = pendingAction.route;
				const store = usePlayerStore.getState();
				if (action === "playPause") {
					if (store && typeof store.playPause === "function") await store.playPause();
					return;
				}
				if (action === "nextTrack") {
					if (store && typeof store.nextTrack === "function") store.nextTrack();
					return;
				}
				if (action === "previousTrack") {
					if (store && typeof store.previousTrack === "function") store.previousTrack();
					return;
				}
				if (action === "playQueueItem") {
					if (store && typeof store.queue === "object" && Array.isArray(store.queue)) {
						if (!store.queue.length) {
							if (typeof store.loadQueue === "function") await store.loadQueue();
						}
						const latestStore = usePlayerStore.getState();
						const queueItemId = Number(pendingAction.queueItemId);
						const queueIndex = latestStore.queue.findIndex((item) => Number(item.id) === queueItemId);
						if (queueIndex >= 0 && typeof latestStore.playTrack === "function") await latestStore.playTrack(latestStore.queue[queueIndex].track, queueIndex);
					}
				}
				if (action === "reorderQueueItem") {
					const queueItemId = Number(pendingAction.queueItemId);
					const newPosition = Number(pendingAction.newPosition);
					if (queueItemId >= 0 && newPosition >= 0 && store && typeof store.reorderQueueItem === "function") await store.reorderQueueItem(queueItemId, newPosition);
				}
			} catch (err) {
				console.error("Error processing widget action:", err);
			}
		};
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") processWidgetAction();
		};
		processWidgetAction();
		window.addEventListener("focus", processWidgetAction);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			cancelled = true;
			window.removeEventListener("focus", processWidgetAction);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isInitialized]);
	(0, import_react.useEffect)(() => {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
		let positionUpdateInterval = null;
		let wakeLock = null;
		const requestWakeLock = async () => {
			if ("wakeLock" in navigator && isPlaying) try {
				wakeLock = await navigator.wakeLock.request("screen");
			} catch (err) {}
		};
		const releaseWakeLock = () => {
			if (wakeLock) {
				wakeLock.release().catch(() => {});
				wakeLock = null;
			}
		};
		const updatePositionState = () => {
			if (!audioRef.current || !currentTrack) return;
			try {
				const duration = Number(audioRef.current.duration || 0);
				const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
				const safePosition = Math.max(0, Math.min(currentPosition || 0, safeDuration || Number.MAX_VALUE));
				if (typeof navigator.mediaSession.setPositionState === "function") navigator.mediaSession.setPositionState({
					duration: safeDuration,
					playbackRate: 1,
					position: safePosition
				});
			} catch (e) {}
		};
		try {
			if (!currentTrack) {
				navigator.mediaSession.metadata = null;
				navigator.mediaSession.playbackState = "none";
				releaseWakeLock();
				return;
			}
			let artwork = [];
			if (currentTrack.cover_art_url) {
				const absoluteUrl = resolveMediaUrl$1(currentTrack.cover_art_url);
				artwork = [
					{
						src: absoluteUrl,
						sizes: "96x96"
					},
					{
						src: absoluteUrl,
						sizes: "128x128"
					},
					{
						src: absoluteUrl,
						sizes: "256x256"
					},
					{
						src: absoluteUrl,
						sizes: "512x512"
					}
				];
			}
			const title = currentTrack.title || currentTrack.filename || "Unknown Track";
			const artist = currentTrack.artist || "Unknown Artist";
			const album = currentTrack.album || "Unknown Album";
			if (typeof MediaMetadata !== "undefined") navigator.mediaSession.metadata = new MediaMetadata({
				title,
				artist,
				album,
				artwork
			});
			navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
			updatePositionState();
			if (isPlaying) {
				positionUpdateInterval = setInterval(updatePositionState, 1e3);
				requestWakeLock();
			}
			const safeSetActionHandler = (action, handler) => {
				try {
					navigator.mediaSession.setActionHandler(action, handler);
				} catch (error) {
					console.warn(`Media Session action not supported: ${action}`);
				}
			};
			safeSetActionHandler("play", () => {
				const store = usePlayerStore.getState();
				if (store && typeof store.playPause === "function") store.playPause();
			});
			safeSetActionHandler("pause", () => {
				const store = usePlayerStore.getState();
				if (store && typeof store.playPause === "function") store.playPause();
			});
			safeSetActionHandler("previoustrack", () => {
				const store = usePlayerStore.getState();
				if (store && typeof store.previousTrack === "function") store.previousTrack();
			});
			safeSetActionHandler("nexttrack", () => {
				const store = usePlayerStore.getState();
				if (store && typeof store.nextTrack === "function") store.nextTrack();
			});
			safeSetActionHandler("seekbackward", (details) => {
				const offset = details?.seekOffset || 10;
				const store = usePlayerStore.getState();
				if (store && typeof store.jump === "function") store.jump(-offset);
			});
			safeSetActionHandler("seekforward", (details) => {
				const offset = details?.seekOffset || 10;
				const store = usePlayerStore.getState();
				if (store && typeof store.jump === "function") store.jump(offset);
			});
			safeSetActionHandler("seekto", (details) => {
				if (typeof details?.seekTime === "number") {
					const store = usePlayerStore.getState();
					if (store && typeof store.seekTo === "function") store.seekTo(details.seekTime);
				}
			});
			safeSetActionHandler("stop", () => {
				const store = usePlayerStore.getState();
				if (store && typeof store.playPause === "function") store.playPause();
			});
		} catch (error) {
			console.error("Media Session setup failed:", error);
		}
		return () => {
			if (positionUpdateInterval) clearInterval(positionUpdateInterval);
			releaseWakeLock();
		};
	}, [
		currentTrack,
		isPlaying,
		currentPosition,
		showLyrics,
		plainLyrics,
		syncedLines
	]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const loadLyricsForMedia = async () => {
			if (!currentTrack?.id) {
				setPlainLyrics("");
				setSyncedLines([]);
				return;
			}
			try {
				const res = await getTrackLyrics(currentTrack.id);
				if (cancelled) return;
				const lyrics = res?.data?.lyrics || "";
				const syncedRaw = res?.data?.synced_lyrics || "";
				setPlainLyrics(lyrics);
				setSyncedLines(parseLRC(syncedRaw));
			} catch {
				if (!cancelled) {
					setPlainLyrics("");
					setSyncedLines([]);
				}
			}
		};
		loadLyricsForMedia();
		return () => {
			cancelled = true;
		};
	}, [currentTrack?.id]);
	(0, import_react.useEffect)(() => {
		const bgMode = getBackgroundModePlugin();
		if (!bgMode) return;
		let heartbeatInterval = null;
		let wasPlayingWhenBackgrounded = false;
		const startHeartbeat = () => {
			if (heartbeatInterval) clearInterval(heartbeatInterval);
			heartbeatInterval = setInterval(() => {
				const store = usePlayerStore.getState();
				const audio = audioRef.current;
				if (audio && store.isPlaying && audio.paused) audio.play().catch(() => {});
				if (store && typeof store.resumeAudioContext === "function") store.resumeAudioContext();
			}, 1e3);
		};
		const stopHeartbeat = () => {
			if (heartbeatInterval) {
				clearInterval(heartbeatInterval);
				heartbeatInterval = null;
			}
		};
		try {
			bgMode.setDefaults({
				title: currentTrack?.title || currentTrack?.filename || "Music",
				text: currentTrack?.artist || "Playing audio",
				resume: true,
				silent: false,
				hidden: false,
				bigText: true
			});
			bgMode.disableBatteryOptimizations?.();
			bgMode.disableWebViewOptimizations?.();
			if (currentTrack) {
				bgMode.enable();
				bgMode.disableWebViewOptimizations?.();
				startHeartbeat();
			} else {
				bgMode.disable();
				stopHeartbeat();
			}
		} catch (error) {
			console.error("Background mode update failed:", error);
		}
		const handleVisibilityChange = () => {
			const store = usePlayerStore.getState();
			const audio = audioRef.current;
			if (document.visibilityState === "hidden") {
				wasPlayingWhenBackgrounded = store.isPlaying;
				if (wasPlayingWhenBackgrounded) {
					startHeartbeat();
					if (audio && audio.paused) audio.play().catch(() => {});
				}
			} else {
				stopHeartbeat();
				const currentState = usePlayerStore.getState();
				if (audio && currentState.isPlaying && audio.paused) audio.play().catch((err) => {
					console.error("Failed to resume audio after background:", err);
				});
				if (audio) {
					const ctx = audio.context || audio.mozAudioContext || audio.webkitAudioContext;
					if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
				}
				if (typeof currentState.resumeAudioContext === "function") currentState.resumeAudioContext();
				setTimeout(() => {
					const store = usePlayerStore.getState();
					const currentAudio = audioRef.current;
					if (!currentAudio || !store.currentTrack) return;
					const trackDuration = store.currentTrack.duration;
					const audioDuration = currentAudio.duration;
					if (audioDuration && Number.isFinite(audioDuration) && audioDuration > 0) {
						if (store.audioDuration !== audioDuration) store.setAudioDuration(audioDuration);
					} else if (trackDuration) store.setAudioDuration(trackDuration);
				}, 100);
			}
		};
		const handleAudioPause = () => {
			const store = usePlayerStore.getState();
			const audio = audioRef.current;
			if (store.isPlaying && audio && audio.paused && document.visibilityState === "hidden") setTimeout(() => {
				audio.play().catch(() => {});
			}, 100);
		};
		const handleAudioError = () => {
			const store = usePlayerStore.getState();
			const audio = audioRef.current;
			if (store.isPlaying && store.currentTrack && document.visibilityState === "hidden") setTimeout(() => {
				if (audio && store.currentTrack) {
					audio.src = store.currentTrack.id ? `${window.location.origin}/api/tracks/${store.currentTrack.id}/stream` : audio.src;
					audio.load();
					audio.play().catch(() => {});
				}
			}, 500);
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		if (audioRef.current) {
			audioRef.current.addEventListener("pause", handleAudioPause);
			audioRef.current.addEventListener("error", handleAudioError);
		}
		return () => {
			stopHeartbeat();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			if (audioRef.current) {
				audioRef.current.removeEventListener("pause", handleAudioPause);
				audioRef.current.removeEventListener("error", handleAudioError);
			}
		};
	}, [
		currentTrack?.id,
		currentTrack?.title,
		currentTrack?.filename,
		currentTrack?.artist
	]);
	(0, import_react.useEffect)(() => {
		if (typeof App$1?.addListener !== "function") return;
		const bgMode = getBackgroundModePlugin();
		const subscription = App$1.addListener("appStateChange", ({ isActive }) => {
			const store = usePlayerStore.getState();
			const audio = audioRef.current;
			if (!isActive) {
				if (store && store.currentTrack) try {
					bgMode?.enable();
					bgMode?.disableWebViewOptimizations?.();
				} catch (error) {
					console.error("Failed to enable background mode on pause:", error);
				}
				if (audio && store.isPlaying && audio.paused) audio.play().catch(() => {});
			} else {
				if (store && typeof store.resumeAudioContext === "function") store.resumeAudioContext();
				setTimeout(() => {
					const currentStore = usePlayerStore.getState();
					const currentAudio = audioRef.current;
					if (!currentAudio || !currentStore.currentTrack) return;
					const savedPosition = currentStore.currentPosition;
					if (savedPosition > 0 && currentAudio.currentTime === 0) currentAudio.currentTime = savedPosition;
					const trackDuration = currentStore.currentTrack?.duration;
					if (trackDuration && (!currentAudio.duration || !Number.isFinite(currentAudio.duration))) currentStore.setAudioDuration(trackDuration);
					if (currentStore.isPlaying && currentAudio.paused) currentAudio.play().catch(() => {});
				}, 100);
				setTimeout(() => {
					const currentStore = usePlayerStore.getState();
					const currentAudio = audioRef.current;
					if (currentAudio && currentStore.currentTrack) {
						if (currentAudio.duration && Number.isFinite(currentAudio.duration) && currentAudio.duration > 0) {
							if (currentStore.audioDuration !== currentAudio.duration) currentStore.setAudioDuration(currentAudio.duration);
						}
						if (currentStore.isPlaying && currentAudio.paused) currentAudio.play().catch(() => {});
					}
				}, 500);
			}
		});
		return () => {
			subscription?.remove?.();
		};
	}, []);
	if (appError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl text-vibe-gold mb-4",
				children: "error loading app"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-white/60",
				children: appError
			})]
		})
	});
	const anyModalOpen = typeof document !== "undefined" && !!document.querySelector(".fixed.inset-0.z-50");
	const forceHideForSearch = !isDesktopViewport && !anyModalOpen && (searchOverlayActive || keyboardVisible || inputFocusActive);
	const mainPadding = (() => {
		if (!currentTrack || isPlayerHidden || forceHideForSearch) return "pb-24 md:pb-16 xl:pb-20";
		if (searchOverlayActive) return "pb-64 md:pb-16 xl:pb-20";
		return "pb-96 md:pb-16 xl:pb-20";
	})();
	const shouldShowPlayer = Boolean(currentTrack && !isPlayerHidden && !forceHideForSearch);
	if (!isLockChecked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-vibe-black flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-8 border-2 border-vibe-gold border-t-transparent rounded-full animate-spin" })
	});
	if (!isUnlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasscodeLock, {
		onUnlock: () => setIsUnlocked(true),
		hasStoredPasscode: hasPasscodeStorage
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-vibe-black font-varela lowercase ",
		style: { fontFamily: "'Varela Round', sans-serif" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: mainPadding,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageLoader, {}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Routes, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Home, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/player",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerPage, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/favorites",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Favorites, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/history",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/profile",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Profile, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/login",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Login, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/share/:token",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/playlists",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Playlists, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/playlists/:id",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistDetail, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/artists",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Artists, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/artists/:artist",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtistDetail, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/albums",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Albums, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/albums/:album",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumDetail, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
							path: "/download",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {})
						})
					] })
				})
			}),
			shouldShowPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
				onHideDesktop: () => setIsPlayerHidden(true),
				onSwipeDown: () => setIsPlayerHidden(true),
				searchOverlayActive
			}),
			currentTrack && isPlayerHidden && !forceHideForSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setIsPlayerHidden(false),
				className: "fixed bottom-20 xl:bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-[#333] bg-vibe-black px-3 py-2 text-white hover:bg-[#1a1a1a]",
				"aria-label": "Show player",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-4 w-4 text-vibe-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-white",
						children: "show player"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 text-white rotate-45" })
				]
			}),
			!forceHideForSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {
				onRevealPlayer: () => setIsPlayerHidden(false),
				isPlayerHidden
			}),
			showQueue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueModal, { onClose: () => setShowQueue(false) })
		]
	});
}
function App() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HashRouter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppContent, {}) }) });
}
//#endregion
//#region src/main.jsx
var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, info) {
		console.error("React error boundary caught:", error, info);
		console.error("Error stack:", error.stack);
		console.error("Component stack:", info.componentStack);
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				minHeight: "100vh",
				background: "#050505",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					textAlign: "center",
					color: "#fff",
					fontFamily: "sans-serif"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						style: {
							color: "#F6B012",
							fontSize: "1.5rem",
							marginBottom: "1rem"
						},
						children: "something went wrong"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							color: "rgba(255,255,255,0.6)",
							marginBottom: "1rem"
						},
						children: String(this.state.error)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => window.location.reload(),
						style: {
							background: "#F6B012",
							color: "#050505",
							border: "none",
							padding: "0.75rem 2rem",
							borderRadius: "1rem",
							fontSize: "1rem",
							cursor: "pointer"
						},
						children: "reload"
					})
				]
			})
		});
		return this.props.children;
	}
};
var container = document.getElementById("root");
(0, import_client.createRoot)(container).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataSaverProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}) }) }));
if ("serviceWorker" in navigator && !window.location.protocol.startsWith("file")) window.addEventListener("load", () => {
	navigator.serviceWorker.register("/sw.js").catch((err) => {
		console.warn("Service worker registration failed:", err);
	});
});
//#endregion
export { useSensor as _, TrackActionSheet as a, rectSortingStrategy as c, DndContext as d, KeyboardSensor as f, closestCenter as g, TouchSensor as h, CoverSearchModal as i, sortableKeyboardCoordinates as l, PointerSensor as m, LyricsPanel as n, SortableContext as o, MouseSensor as p, TrackEditModal as r, arrayMove as s, WebPlugin as t, useSortable as u, useSensors as v, CSS as y };
