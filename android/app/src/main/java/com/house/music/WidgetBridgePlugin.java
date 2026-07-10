package com.house.music;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void updateWidgetState(PluginCall call) {
        WidgetStateStore.saveWidgetState(getContext(), call.getData().toString());
        MusicWidgetProvider.updateAllWidgets(getContext());
        call.resolve();
    }

    @PluginMethod
    public void consumePendingAction(PluginCall call) {
        JSONObject action = WidgetStateStore.consumePendingAction(getContext());
        JSObject result = new JSObject();

        if (action != null) {
            result.put("action", action.optString("action", null));
            result.put("route", action.optString("route", null));
            if (action.has("queueItemId")) {
                result.put("queueItemId", action.optInt("queueItemId"));
            }
        }

        call.resolve(result);
    }
}
