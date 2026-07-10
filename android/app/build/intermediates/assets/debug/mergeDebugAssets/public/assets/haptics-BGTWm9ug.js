//#region src/utils/haptics.js
var hasNavigatorVibrate = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
var getCapacitorHaptics = () => {
	if (typeof window === "undefined") return null;
	return window.Capacitor?.Haptics || window.Capacitor?.Plugins?.Haptics || null;
};
var triggerImpact = (style = "light") => {
	try {
		const haptics = getCapacitorHaptics();
		if (haptics?.impact) {
			haptics.impact({ style: style.toUpperCase?.() || style });
			return;
		}
	} catch (error) {}
	if (hasNavigatorVibrate()) navigator.vibrate(10);
};
var triggerSelection = () => {
	try {
		const haptics = getCapacitorHaptics();
		if (haptics?.selectionChanged) {
			haptics.selectionChanged();
			return;
		}
	} catch (error) {}
	if (hasNavigatorVibrate()) navigator.vibrate(5);
};
//#endregion
export { triggerSelection as n, triggerImpact as t };
