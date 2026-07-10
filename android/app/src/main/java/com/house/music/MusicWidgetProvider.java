package com.house.music;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class MusicWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_OPEN_PLAYER = "com.house.music.widget.OPEN_PLAYER";
    public static final String ACTION_PLAY_PAUSE = "com.house.music.widget.PLAY_PAUSE";
    public static final String ACTION_NEXT = "com.house.music.widget.NEXT";
    public static final String ACTION_PREVIOUS = "com.house.music.widget.PREVIOUS";
    public static final String ACTION_PLAY_QUEUE_ITEM = "com.house.music.widget.PLAY_QUEUE_ITEM";
    public static final String EXTRA_QUEUE_ITEM_ID = "queue_item_id";
    public static final String EXTRA_ACTION_TYPE = "action_type";

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName componentName = new ComponentName(context, MusicWidgetProvider.class);
        int[] widgetIds = appWidgetManager.getAppWidgetIds(componentName);
        for (int widgetId : widgetIds) {
            updateWidget(context, appWidgetManager, widgetId);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();

        if (ACTION_OPEN_PLAYER.equals(action)) {
            WidgetStateStore.savePendingAction(context, "openPlayer", "/player", null);
            launchMainActivity(context);
        } else if (ACTION_PLAY_PAUSE.equals(action)) {
            WidgetStateStore.savePendingAction(context, "playPause", "/player", null);
            launchMainActivity(context);
        } else if (ACTION_NEXT.equals(action)) {
            WidgetStateStore.savePendingAction(context, "nextTrack", "/player", null);
            launchMainActivity(context);
        } else if (ACTION_PREVIOUS.equals(action)) {
            WidgetStateStore.savePendingAction(context, "previousTrack", "/player", null);
            launchMainActivity(context);
        } else if (ACTION_PLAY_QUEUE_ITEM.equals(action)) {
            int queueItemId = intent.getIntExtra(EXTRA_QUEUE_ITEM_ID, -1);
            String actionType = intent.getStringExtra(EXTRA_ACTION_TYPE);
            if ("move_up".equals(actionType)) {
                int newPos = reorderQueue(context, queueItemId, -1);
                if (newPos >= 0) {
                    WidgetStateStore.savePendingAction(context, "reorderQueueItem", null, queueItemId, newPos);
                }
                updateAllWidgets(context);
            } else if ("move_down".equals(actionType)) {
                int newPos = reorderQueue(context, queueItemId, +1);
                if (newPos >= 0) {
                    WidgetStateStore.savePendingAction(context, "reorderQueueItem", null, queueItemId, newPos);
                }
                updateAllWidgets(context);
            } else {
                WidgetStateStore.savePendingAction(context, "playQueueItem", "/player", queueItemId);
                launchMainActivity(context);
            }
        }

        if (action != null && action.startsWith("com.house.music.widget.")) {
            updateAllWidgets(context);
        }
    }

    private static int reorderQueue(Context context, int queueItemId, int direction) {
        try {
            JSONObject state = WidgetStateStore.getWidgetState(context);
            org.json.JSONArray queue = state.optJSONArray("queue");
            if (queue == null) return -1;

            int pos = -1;
            for (int i = 0; i < queue.length(); i++) {
                JSONObject item = queue.optJSONObject(i);
                if (item != null && item.optInt("id", -1) == queueItemId) {
                    pos = i;
                    break;
                }
            }
            if (pos == -1) return -1;

            int newPos = pos + direction;
            if (newPos < 0 || newPos >= queue.length()) return -1;

            JSONObject a = queue.getJSONObject(pos);
            JSONObject b = queue.getJSONObject(newPos);
            queue.put(pos, b);
            queue.put(newPos, a);

            int currentIndex = state.optInt("currentQueueIndex", -1);
            if (currentIndex == pos) {
                state.put("currentQueueIndex", newPos);
            } else if (currentIndex == newPos) {
                state.put("currentQueueIndex", pos);
            }

            state.put("queue", queue);
            WidgetStateStore.saveWidgetState(context, state.toString());
            return newPos;
        } catch (Exception e) {
            return -1;
        }
    }

    private static void launchMainActivity(Context context) {
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        context.startActivity(openIntent);
    }

    private static PendingIntent createBroadcastIntent(Context context, int widgetId, String action) {
        Intent intent = new Intent(context, MusicWidgetProvider.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        return PendingIntent.getBroadcast(
            context,
            (widgetId * 31) + action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.music_widget);
        JSONObject state = WidgetStateStore.getWidgetState(context);
        JSONObject currentTrack = state.optJSONObject("currentTrack");
        String title = currentTrack != null
            ? currentTrack.optString("title", currentTrack.optString("filename", "nothing playing"))
            : "nothing playing";
        String subtitle = currentTrack != null
            ? currentTrack.optString("artist", "unknown artist")
            : "tap open to start playback";
        boolean isPlaying = state.optBoolean("isPlaying", false);

        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_subtitle, subtitle);
        views.setTextViewText(R.id.widget_action_play_pause, isPlaying ? "pause" : "play");

        views.setOnClickPendingIntent(R.id.widget_root, createBroadcastIntent(context, appWidgetId, ACTION_OPEN_PLAYER));
        views.setOnClickPendingIntent(R.id.widget_action_open, createBroadcastIntent(context, appWidgetId, ACTION_OPEN_PLAYER));
        views.setOnClickPendingIntent(R.id.widget_action_previous, createBroadcastIntent(context, appWidgetId, ACTION_PREVIOUS));
        views.setOnClickPendingIntent(R.id.widget_action_play_pause, createBroadcastIntent(context, appWidgetId, ACTION_PLAY_PAUSE));
        views.setOnClickPendingIntent(R.id.widget_action_next, createBroadcastIntent(context, appWidgetId, ACTION_NEXT));

        Intent serviceIntent = new Intent(context, MusicWidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.widget_queue_list, serviceIntent);
        views.setEmptyView(R.id.widget_queue_list, R.id.widget_empty);

        Intent templateIntent = new Intent(context, MusicWidgetProvider.class);
        templateIntent.setAction(ACTION_PLAY_QUEUE_ITEM);
        PendingIntent templatePendingIntent = PendingIntent.getBroadcast(
            context,
            appWidgetId * 97,
            templateIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setPendingIntentTemplate(R.id.widget_queue_list, templatePendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_queue_list);
    }
}
