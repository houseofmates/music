package com.house.music;

import android.os.Build;
import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Music")
public class MusicPlugin extends Plugin {

    private static final String EVENT_STATE_CHANGE = "onPlaybackStateChange";

    private static int lastState = MusicService.STATE_IDLE;
    private static double lastPosition = 0;
    private static double lastDuration = 0;

    @Override
    public void load() {
        super.load();
        MusicService.setStateListener((state, positionMs, durationMs) -> {
            lastState = state;
            lastPosition = positionMs / 1000.0;
            lastDuration = durationMs / 1000.0;

            JSObject data = new JSObject();
            data.put("state", lastState);
            data.put("position", lastPosition);
            data.put("duration", lastDuration);
            notifyListeners(EVENT_STATE_CHANGE, data);
        });
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        MusicService.setStateListener(null);
    }

    @PluginMethod
    public void play(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("url is required");
            return;
        }

        JSObject track = call.getObject("track", new JSObject());

        Intent intent = new Intent(getActivity(), MusicService.class);
        intent.setAction(MusicService.ACTION_PLAY_URL);
        intent.putExtra(MusicService.EXTRA_URL, url);
        intent.putExtra(MusicService.EXTRA_TRACK_ID, track.optString("id", ""));
        intent.putExtra(MusicService.EXTRA_TITLE, track.optString("title", ""));
        intent.putExtra(MusicService.EXTRA_ARTIST, track.optString("artist", ""));
        intent.putExtra(MusicService.EXTRA_ALBUM, track.optString("album", ""));
        intent.putExtra(MusicService.EXTRA_DURATION, track.optInt("duration", 0));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getActivity().startForegroundService(intent);
        } else {
            getActivity().startService(intent);
        }

        call.resolve();
    }

    @PluginMethod
    public void pause(PluginCall call) {
        sendAction(MusicService.ACTION_PAUSE);
        call.resolve();
    }

    @PluginMethod
    public void resume(PluginCall call) {
        sendAction(MusicService.ACTION_RESUME);
        call.resolve();
    }

    @PluginMethod
    public void seekTo(PluginCall call) {
        Double seconds = call.getDouble("position", 0.0);
        int ms = (int) (seconds * 1000);

        Intent intent = new Intent(getActivity(), MusicService.class);
        intent.setAction(MusicService.ACTION_SEEK_TO);
        intent.putExtra(MusicService.EXTRA_POSITION, ms);
        getActivity().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        sendAction(MusicService.ACTION_STOP);
        call.resolve();
    }

    @PluginMethod
    public void getPlaybackState(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("isPlaying", lastState == MusicService.STATE_PLAYING);
        ret.put("state", lastState);
        ret.put("position", lastPosition);
        ret.put("duration", lastDuration);
        call.resolve(ret);
    }

    private void sendAction(String action) {
        Intent intent = new Intent(getActivity(), MusicService.class);
        intent.setAction(action);
        getActivity().startService(intent);
    }
}
