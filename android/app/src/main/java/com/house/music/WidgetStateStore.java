package com.house.music;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

public class WidgetStateStore {
    private static final String PREFS_NAME = "music_widget_prefs";
    private static final String KEY_WIDGET_STATE = "widget_state";
    private static final String KEY_PENDING_ACTION = "pending_action";

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static void saveWidgetState(Context context, String widgetStateJson) {
        prefs(context).edit().putString(KEY_WIDGET_STATE, widgetStateJson).apply();
    }

    public static JSONObject getWidgetState(Context context) {
        String raw = prefs(context).getString(KEY_WIDGET_STATE, null);
        if (raw == null || raw.isEmpty()) {
            return new JSONObject();
        }

        try {
            return new JSONObject(raw);
        } catch (Exception error) {
            return new JSONObject();
        }
    }

    public static void savePendingAction(Context context, String action, String route, Integer queueItemId) {
        savePendingAction(context, action, route, queueItemId, null);
    }

    public static void savePendingAction(Context context, String action, String route, Integer queueItemId, Integer newPosition) {
        try {
            JSONObject payload = new JSONObject();
            payload.put("action", action);
            payload.put("route", route);
            if (queueItemId != null) {
                payload.put("queueItemId", queueItemId);
            }
            if (newPosition != null) {
                payload.put("newPosition", newPosition);
            }
            prefs(context).edit().putString(KEY_PENDING_ACTION, payload.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    public static JSONObject consumePendingAction(Context context) {
        String raw = prefs(context).getString(KEY_PENDING_ACTION, null);
        prefs(context).edit().remove(KEY_PENDING_ACTION).apply();
        if (raw == null || raw.isEmpty()) {
            return null;
        }

        try {
            return new JSONObject(raw);
        } catch (Exception error) {
            return null;
        }
    }
}
