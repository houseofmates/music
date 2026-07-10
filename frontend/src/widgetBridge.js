import { Capacitor, registerPlugin } from '@capacitor/core';

let WidgetBridge = null;
export let isAndroidNative = false;

try {
  isAndroidNative =
    Capacitor &&
    typeof Capacitor.getPlatform === 'function' &&
    Capacitor.getPlatform() === 'android';
  if (isAndroidNative) {
    WidgetBridge = registerPlugin('WidgetBridge');
  }
} catch (e) {
}

export async function syncWidgetState(state) {
  if (!isAndroidNative || !WidgetBridge) return;
  try {
    await WidgetBridge.updateWidgetState(state);
  } catch (error) {
  }
}

export async function consumeWidgetAction() {
  if (!isAndroidNative || !WidgetBridge) return null;
  try {
    const action = await WidgetBridge.consumePendingAction();
    return action?.action ? action : null;
  } catch (error) {
    return null;
  }
}
