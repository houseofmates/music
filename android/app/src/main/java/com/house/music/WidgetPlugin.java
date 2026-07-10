package com.house.music;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void updateTrackInfo(PluginCall call) {
        try {
            String title = call.getString("title", "");
            String artist = call.getString("artist", "");
            String queueJson = call.getString("queueJson", "[]");
            Boolean isPlaying = call.getBoolean("isPlaying", false);

            JSONObject state = new JSONObject();
            JSONObject currentTrack = new JSONObject();
            currentTrack.put("title", title);
            currentTrack.put("artist", artist);
            state.put("currentTrack", currentTrack);
            state.put("queue", new JSONArray(queueJson));
            state.put("currentQueueIndex", -1);
            state.put("isPlaying", Boolean.TRUE.equals(isPlaying));

            WidgetStateStore.saveWidgetState(getContext(), state.toString());
            MusicWidgetProvider.updateAllWidgets(getContext());
            call.resolve();
        } catch (Exception error) {
            call.reject("Failed to update widget state", error);
        }
    }
}
