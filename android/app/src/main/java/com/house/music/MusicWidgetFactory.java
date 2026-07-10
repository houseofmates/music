package com.house.music;

import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

public class MusicWidgetFactory implements RemoteViewsService.RemoteViewsFactory {
    private final Context context;
    private JSONArray queue = new JSONArray();
    private int currentQueueIndex = -1;

    public MusicWidgetFactory(Context context) {
        this.context = context;
    }

    @Override
    public void onCreate() {
        loadState();
    }

    @Override
    public void onDataSetChanged() {
        loadState();
    }

    @Override
    public void onDestroy() {
        queue = new JSONArray();
    }

    @Override
    public int getCount() {
        return queue.length();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position < 0 || position >= queue.length()) {
            return null;
        }

        try {
            JSONObject queueItem = queue.getJSONObject(position);
            JSONObject track = queueItem.optJSONObject("track");
            String title = track != null ? track.optString("title", track.optString("filename", "unknown")) : "unknown";
            String artist = track != null ? track.optString("artist", "unknown artist") : "unknown artist";
            int queueItemId = queueItem.optInt("id", -1);
            boolean isCurrent = position == currentQueueIndex;

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.music_widget_queue_item);
            views.setTextViewText(R.id.widget_queue_item_title, title);
            views.setTextViewText(R.id.widget_queue_item_artist, artist);
            views.setViewVisibility(R.id.widget_queue_item_now, isCurrent ? View.VISIBLE : View.GONE);
            views.setTextColor(R.id.widget_queue_item_title, isCurrent ? 0xFFF6B012 : 0xFFFFFFFF);

            Intent fillInIntent = new Intent();
            fillInIntent.setAction(MusicWidgetProvider.ACTION_PLAY_QUEUE_ITEM);
            fillInIntent.putExtra(MusicWidgetProvider.EXTRA_QUEUE_ITEM_ID, queueItemId);
            views.setOnClickFillInIntent(R.id.widget_queue_item_root, fillInIntent);

            Intent upIntent = new Intent();
            upIntent.setAction(MusicWidgetProvider.ACTION_PLAY_QUEUE_ITEM);
            upIntent.putExtra(MusicWidgetProvider.EXTRA_QUEUE_ITEM_ID, queueItemId);
            upIntent.putExtra(MusicWidgetProvider.EXTRA_ACTION_TYPE, "move_up");
            views.setOnClickFillInIntent(R.id.widget_queue_item_up, upIntent);

            Intent downIntent = new Intent();
            downIntent.setAction(MusicWidgetProvider.ACTION_PLAY_QUEUE_ITEM);
            downIntent.putExtra(MusicWidgetProvider.EXTRA_QUEUE_ITEM_ID, queueItemId);
            downIntent.putExtra(MusicWidgetProvider.EXTRA_ACTION_TYPE, "move_down");
            views.setOnClickFillInIntent(R.id.widget_queue_item_down, downIntent);

            return views;
        } catch (Exception error) {
            return null;
        }
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        try {
            return queue.getJSONObject(position).optLong("id", position);
        } catch (Exception error) {
            return position;
        }
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }

    private void loadState() {
        JSONObject state = WidgetStateStore.getWidgetState(context);
        queue = state.optJSONArray("queue");
        if (queue == null) {
            queue = new JSONArray();
        }
        currentQueueIndex = state.optInt("currentQueueIndex", -1);
    }
}
