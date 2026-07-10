package com.house.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import java.io.IOException;

public class MusicService extends Service
        implements MediaPlayer.OnPreparedListener,
        MediaPlayer.OnCompletionListener,
        MediaPlayer.OnErrorListener,
        MediaPlayer.OnInfoListener,
        AudioManager.OnAudioFocusChangeListener {

    private static final String TAG = "MusicService";
    private static final String CHANNEL_ID = "music-playback";
    private static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_PLAY_URL = "com.house.music.PLAY_URL";
    public static final String ACTION_PAUSE   = "com.house.music.PAUSE";
    public static final String ACTION_RESUME  = "com.house.music.RESUME";
    public static final String ACTION_SEEK_TO = "com.house.music.SEEK_TO";
    public static final String ACTION_STOP    = "com.house.music.STOP";

    public static final String EXTRA_URL      = "url";
    public static final String EXTRA_POSITION = "positionMs";
    public static final String EXTRA_TRACK_ID = "trackId";
    public static final String EXTRA_TITLE    = "title";
    public static final String EXTRA_ARTIST   = "artist";
    public static final String EXTRA_ALBUM    = "album";
    public static final String EXTRA_DURATION = "durationMs";

    public static final String STATE_CHANGED_ACTION = "com.house.music.STATE_CHANGED";
    public static final String EXTRA_STATE           = "playState";
    public static final String EXTRA_CURRENT_POS     = "currentPositionMs";

    public static final int STATE_IDLE      = 0;
    public static final int STATE_PLAYING   = 1;
    public static final int STATE_PAUSED    = 2;
    public static final int STATE_COMPLETED = 3;
    public static final int STATE_ERROR     = 4;

    public interface StateListener {
        void onStateChanged(int state, long positionMs, int durationMs);
    }

    private static StateListener stateListener;

    public static void setStateListener(StateListener listener) {
        stateListener = listener;
    }

    private MediaPlayer mediaPlayer;
    private MediaSession mediaSession;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;

    private int currentState = STATE_IDLE;
    private String currentUrl;
    private String currentTrackId;
    private String currentTitle = "";
    private String currentArtist = "";
    private String currentAlbum = "";
    private int currentDurationMs = 0;
    private boolean isPreparing = false;
    private boolean isServiceStarted = false;

    @Override
    public void onCreate() {
        super.onCreate();
        // Ensure notification channel exists before any startForeground call
        createNotificationChannel();
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        initMediaSession();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) {
            return START_STICKY;
        }
        
        // Prevent multiple simultaneous start commands
        if (!isServiceStarted) {
            isServiceStarted = true;
        }
        
        handleAction(intent);
        return START_STICKY;
    }

    private void handleAction(Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        try {
            switch (action) {
                case ACTION_PLAY_URL:
                    String url = intent.getStringExtra(EXTRA_URL);
                    if (url != null) {
                        currentTrackId = intent.getStringExtra(EXTRA_TRACK_ID);
                        currentTitle   = intent.getStringExtra(EXTRA_TITLE) != null ? intent.getStringExtra(EXTRA_TITLE) : "";
                        currentArtist  = intent.getStringExtra(EXTRA_ARTIST) != null ? intent.getStringExtra(EXTRA_ARTIST) : "";
                        currentAlbum   = intent.getStringExtra(EXTRA_ALBUM) != null ? intent.getStringExtra(EXTRA_ALBUM) : "";
                        currentDurationMs = intent.getIntExtra(EXTRA_DURATION, 0);
                        playUrl(url);
                    }
                    break;
                case ACTION_PAUSE:
                    pause();
                    break;
                case ACTION_RESUME:
                    resume();
                    break;
                case ACTION_SEEK_TO:
                    long pos = intent.getLongExtra(EXTRA_POSITION, 0);
                    seekTo((int) pos);
                    break;
                case ACTION_STOP:
                    stopPlayback();
                    stopForeground(true);
                    stopSelf();
                    isServiceStarted = false;
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling action: " + action, e);
            notifyState(STATE_ERROR, 0);
        }
    }

    private void playUrl(String url) {
        if (url == null) return;
        
        // Validate URL scheme
        if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("file://")) {
            Log.e(TAG, "Invalid URL scheme: " + url);
            notifyState(STATE_ERROR, 0);
            return;
        }

        currentUrl = url;
        releaseMediaPlayer();

        try {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
            mediaPlayer.setOnPreparedListener(this);
            mediaPlayer.setOnCompletionListener(this);
            mediaPlayer.setOnErrorListener(this);
            mediaPlayer.setOnInfoListener(this);

            mediaPlayer.setDataSource(url);
            isPreparing = true;
            mediaPlayer.prepareAsync();

            requestAudioFocus();
            // Notification channel guaranteed to exist from onCreate()
            startForeground(NOTIFICATION_ID, buildNotification(false));
            updateMediaSessionState();
        } catch (IOException e) {
            Log.e(TAG, "setDataSource failed: " + e.getMessage());
            notifyState(STATE_ERROR, 0);
            releaseMediaPlayer();
        } catch (IllegalArgumentException | SecurityException | IllegalStateException e) {
            Log.e(TAG, "MediaPlayer setup failed: " + e.getMessage());
            notifyState(STATE_ERROR, 0);
            releaseMediaPlayer();
        }
    }

    private void pause() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            try {
                mediaPlayer.pause();
                currentState = STATE_PAUSED;
                updateNotification(false);
                updateMediaSessionState();
                notifyState(STATE_PAUSED, mediaPlayer.getCurrentPosition());
            } catch (IllegalStateException e) {
                Log.w(TAG, "Pause failed: " + e.getMessage());
            }
        }
    }

    private void resume() {
        if (mediaPlayer != null && !mediaPlayer.isPlaying() && !isPreparing) {
            try {
                requestAudioFocus();
                mediaPlayer.start();
                currentState = STATE_PLAYING;
                updateNotification(true);
                updateMediaSessionState();
                notifyState(STATE_PLAYING, mediaPlayer.getCurrentPosition());
            } catch (IllegalStateException e) {
                Log.w(TAG, "Resume failed: " + e.getMessage());
            }
        }
    }

    private void seekTo(int positionMs) {
        if (mediaPlayer != null) {
            try {
                // Clamp position to valid range
                int duration = mediaPlayer.getDuration();
                if (duration > 0) {
                    positionMs = Math.max(0, Math.min(positionMs, duration));
                }
                mediaPlayer.seekTo(positionMs);
            } catch (IllegalStateException e) {
                Log.w(TAG, "Seek failed: " + e.getMessage());
            }
        }
    }

    public int getCurrentPosition() {
        if (mediaPlayer != null && !isPreparing) {
            try {
                return mediaPlayer.getCurrentPosition();
            } catch (IllegalStateException e) {
                return 0;
            }
        }
        return 0;
    }

    public int getDuration() {
        if (mediaPlayer != null && !isPreparing) {
            try {
                int dur = mediaPlayer.getDuration();
                return dur > 0 ? dur : currentDurationMs;
            } catch (IllegalStateException e) {
                return currentDurationMs;
            }
        }
        return currentDurationMs;
    }

    public boolean isPlaying() {
        if (mediaPlayer != null) {
            try {
                return mediaPlayer.isPlaying();
            } catch (IllegalStateException e) {
                return false;
            }
        }
        return false;
    }

    private void stopPlayback() {
        releaseMediaPlayer();
        currentState = STATE_IDLE;
        isPreparing = false;
        abandonAudioFocus();
        notifyState(STATE_IDLE, 0);
    }

    private void releaseMediaPlayer() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) mediaPlayer.stop();
                mediaPlayer.reset();
            } catch (Exception e) {
                Log.e(TAG, "Error releasing MediaPlayer: " + e.getMessage());
            }
            try {
                mediaPlayer.release();
            } catch (Exception e) {
                Log.e(TAG, "Error in mediaPlayer.release(): " + e.getMessage());
            }
            mediaPlayer = null;
        }
    }

    @Override
    public void onPrepared(MediaPlayer mp) {
        if (mediaPlayer != mp) return; // Stale callback
        
        isPreparing = false;
        try {
            mp.start();
            currentState = STATE_PLAYING;
            currentDurationMs = mp.getDuration();
            updateNotification(true);
            updateMediaSessionState();
            notifyState(STATE_PLAYING, 0);
        } catch (IllegalStateException e) {
            Log.e(TAG, "Start after prepare failed: " + e.getMessage());
            notifyState(STATE_ERROR, 0);
        }
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        if (mediaPlayer != mp) return; // Stale callback
        
        currentState = STATE_COMPLETED;
        notifyState(STATE_COMPLETED, getDuration());
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {
        if (mediaPlayer != mp) return true; // Stale callback
        
        Log.e(TAG, "MediaPlayer error: what=" + what + " extra=" + extra);
        currentState = STATE_ERROR;
        isPreparing = false;
        notifyState(STATE_ERROR, 0);
        releaseMediaPlayer();
        return true;
    }

    @Override
    public boolean onInfo(MediaPlayer mp, int what, int extra) {
        if (mediaPlayer != mp) return false;
        
        // Handle buffering info
        if (what == MediaPlayer.MEDIA_INFO_BUFFERING_START) {
            // Could notify buffering state
        } else if (what == MediaPlayer.MEDIA_INFO_BUFFERING_END) {
            // Buffering ended
        }
        return false;
    }

    @Override
    public void onAudioFocusChange(int focusChange) {
        switch (focusChange) {
            case AudioManager.AUDIOFOCUS_LOSS:
                pause();
                break;
            case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                pause();
                break;
            case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                if (mediaPlayer != null) {
                    try {
                        mediaPlayer.setVolume(0.3f, 0.3f);
                    } catch (IllegalStateException e) {
                        // Ignore
                    }
                }
                break;
            case AudioManager.AUDIOFOCUS_GAIN:
                if (mediaPlayer != null) {
                    try {
                        mediaPlayer.setVolume(1.0f, 1.0f);
                    } catch (IllegalStateException e) {
                        // Ignore
                    }
                }
                resume();
                break;
        }
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(attrs)
                    .setOnAudioFocusChangeListener(this)
                    .build();
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(this, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            try {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            } catch (Exception e) {
                Log.w(TAG, "Abandon audio focus failed: " + e.getMessage());
            }
        } else {
            try {
                audioManager.abandonAudioFocus(this);
            } catch (Exception e) {
                Log.w(TAG, "Abandon audio focus (legacy) failed: " + e.getMessage());
            }
        }
        audioFocusRequest = null;
    }

    private void initMediaSession() {
        mediaSession = new MediaSession(this, TAG);
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override
            public void onPlay() { resume(); }
            @Override
            public void onPause() { pause(); }
            @Override
            public void onSkipToNext() {
                notifyState(STATE_COMPLETED, getDuration());
            }
            @Override
            public void onSkipToPrevious() {
                notifyState(STATE_IDLE, 0);
            }
            @Override
            public void onSeekTo(long pos) { seekTo((int) pos); }
            @Override
            public void onStop() { stopPlayback(); }
        });
        mediaSession.setActive(true);
    }

    private void updateMediaSessionState() {
        if (mediaSession == null) return;

        int pbState = PlaybackState.STATE_NONE;
        long pos = 0;

        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    pbState = PlaybackState.STATE_PLAYING;
                    pos = mediaPlayer.getCurrentPosition();
                } else if (currentState == STATE_PAUSED) {
                    pbState = PlaybackState.STATE_PAUSED;
                    pos = mediaPlayer.getCurrentPosition();
                }
            } catch (IllegalStateException e) {
                // MediaPlayer in invalid state
            }
        }

        PlaybackState.Builder builder = new PlaybackState.Builder()
                .setState(pbState, pos, 1.0f)
                .setActions(PlaybackState.ACTION_PLAY
                        | PlaybackState.ACTION_PAUSE
                        | PlaybackState.ACTION_SKIP_TO_NEXT
                        | PlaybackState.ACTION_SKIP_TO_PREVIOUS
                        | PlaybackState.ACTION_SEEK_TO
                        | PlaybackState.ACTION_STOP);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            builder.setBufferedPosition(mediaPlayer != null ? getDuration() : 0);
        }

        mediaSession.setPlaybackState(builder.build());

        android.media.MediaMetadata.Builder metaBuilder = new android.media.MediaMetadata.Builder();
        if (currentTitle != null && !currentTitle.isEmpty())  
            metaBuilder.putString(android.media.MediaMetadata.METADATA_KEY_TITLE, currentTitle);
        if (currentArtist != null && !currentArtist.isEmpty()) 
            metaBuilder.putString(android.media.MediaMetadata.METADATA_KEY_ARTIST, currentArtist);
        if (currentAlbum != null && !currentAlbum.isEmpty())  
            metaBuilder.putString(android.media.MediaMetadata.METADATA_KEY_ALBUM, currentAlbum);
        metaBuilder.putLong(android.media.MediaMetadata.METADATA_KEY_DURATION, getDuration());
        mediaSession.setMetadata(metaBuilder.build());
    }

    private Notification buildNotification(boolean isPlaying) {
        String pkgName = getPackageName();
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(pkgName);
        PendingIntent contentIntent = PendingIntent.getActivity(
                this, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder builder = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle != null && !currentTitle.isEmpty() ? currentTitle : "Music")
                .setContentText(isPlaying ? (currentArtist != null ? currentArtist : "Playing") : "Paused")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .setShowWhen(false)
                .setCategory(Notification.CATEGORY_TRANSPORT);

        Notification.MediaStyle mediaStyle = new Notification.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2);
        builder.setStyle(mediaStyle);

        int prevIcon = android.R.drawable.ic_media_previous;
        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        int nextIcon = android.R.drawable.ic_media_next;

        builder.addAction(new Notification.Action.Builder(prevIcon, "Previous",
                PendingIntent.getService(this, 1,
                        new Intent(ACTION_STOP, null, this, MusicService.class)
                                .setPackage(pkgName),
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE)).build());
        builder.addAction(new Notification.Action.Builder(playPauseIcon,
                isPlaying ? "Pause" : "Play",
                PendingIntent.getService(this, 2,
                        new Intent(isPlaying ? ACTION_PAUSE : ACTION_RESUME, null, this, MusicService.class)
                                .setPackage(pkgName),
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE)).build());
        builder.addAction(new Notification.Action.Builder(nextIcon, "Next",
                PendingIntent.getService(this, 3,
                        new Intent(ACTION_STOP, null, this, MusicService.class)
                                .setPackage(pkgName),
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE)).build());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            builder.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE);
        }

        return builder.build();
    }

    private void updateNotification(boolean isPlaying) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, buildNotification(isPlaying));
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Music Playback", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Notification for music playback controls");
            channel.setShowBadge(false);
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void notifyState(int state, long positionMs) {
        if (stateListener != null) {
            stateListener.onStateChanged(state, positionMs, getDuration());
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        stopPlayback();
        stopForeground(true);
        stopSelf();
        isServiceStarted = false;
    }

    @Override
    public void onDestroy() {
        stopForeground(true);
        stopPlayback();
        stateListener = null;
        isServiceStarted = false;
        
        if (mediaSession != null) {
            try {
                mediaSession.setActive(false);
                mediaSession.release();
            } catch (Exception e) {
                Log.w(TAG, "MediaSession release failed: " + e.getMessage());
            }
            mediaSession = null;
        }
        
        abandonAudioFocus();
        super.onDestroy();
    }
}