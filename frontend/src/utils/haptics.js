const hasNavigatorVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

const getCapacitorHaptics = () => {
  if (typeof window === 'undefined') return null;
  return window.Capacitor?.Haptics || window.Capacitor?.Plugins?.Haptics || null;
};

export const triggerImpact = (style = 'light') => {
  try {
    const haptics = getCapacitorHaptics();
    if (haptics?.impact) {
      haptics.impact({ style: style.toUpperCase?.() || style });
      return;
    }
  } catch (error) {
    // ignore haptics errors
  }

  if (hasNavigatorVibrate()) {
    navigator.vibrate(10);
  }
};

export const triggerSelection = () => {
  try {
    const haptics = getCapacitorHaptics();
    if (haptics?.selectionChanged) {
      haptics.selectionChanged();
      return;
    }
  } catch (error) {
    // ignore
  }

  if (hasNavigatorVibrate()) {
    navigator.vibrate(5);
  }
};

export const triggerNotification = (type = 'success') => {
  try {
    const haptics = getCapacitorHaptics();
    if (haptics?.notification) {
      haptics.notification({ type });
      return;
    }
  } catch (error) {
    // ignore
  }

  if (hasNavigatorVibrate()) {
    navigator.vibrate([10, 40, 10]);
  }
};
