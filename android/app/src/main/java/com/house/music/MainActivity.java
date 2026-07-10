package com.house.music;

import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String PREFS_NAME = "music_prefs";
    private static final String TAG = "MusicMainActivity";
    
    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;
    private boolean isWebViewInitialized = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);

        // Configure WebView before super.onCreate completes
        configureWebView();

        // Acquire a wake lock to keep the CPU running during playback
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MusicApp::WakeLock");
            wakeLock.setReferenceCounted(false);
            try {
                wakeLock.acquire();
            } catch (Exception e) {
                // Ignore if already held
            }
        }

        // Acquire a wifi lock to keep the network active during streaming
        WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
        if (wm != null) {
            wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "MusicApp::WifiLock");
            wifiLock.setReferenceCounted(false);
            try {
                wifiLock.acquire();
            } catch (Exception e) {
                // Ignore if already held
            }
        }

        // Keep app active over lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }
        
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Enable WebView debugging for Chrome DevTools (debug builds only)
        if (BuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // Let content draw under status bar
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        );
        
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );

        MusicWidgetProvider.updateAllWidgets(this);
        requestBatteryOptimizationExemption();
    }

    private void configureWebView() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }
        
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        
        // Allow autoplay without user gesture for background playback
        settings.setMediaPlaybackRequiresUserGesture(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
        
        // Allow mixed content for artwork/streams
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        
        // Enable DOM storage for offline caching
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Allow file access for local assets
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // JavaScript settings
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        
        // Cache settings
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Viewport settings
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        
        // Hardware acceleration for smoother animations
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
        
        // Prevent WebView from being destroyed during config changes
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                // Don't crash on web errors
            }
        });
        
        isWebViewInitialized = true;
    }

    private void requestBatteryOptimizationExemption() {
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm == null) return;

            String packageName = getPackageName();
            if (pm.isIgnoringBatteryOptimizations(packageName)) return;

            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            if (prefs.getBoolean("battery_opt_asked", false)) return;

            prefs.edit().putBoolean("battery_opt_asked", true).apply();

            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + packageName));
            // Add flag to handle if no activity can handle the intent
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception e) {
            // Silently ignore
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        MusicWidgetProvider.updateAllWidgets(this);
        
        // Re-apply WebView settings in case they were reset
        if (isWebViewInitialized && getBridge() != null && getBridge().getWebView() != null) {
            configureWebView();
        }
        
        // Refresh locks if needed
        if (wakeLock != null && !wakeLock.isHeld()) {
            try { wakeLock.acquire(); } catch (Exception e) {}
        }
        if (wifiLock != null && !wifiLock.isHeld()) {
            try { wifiLock.acquire(); } catch (Exception e) {}
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        
        // CRITICAL: Keep WebView alive so HTML5 audio continues playing
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.resumeTimers();
            webView.onResume();
            // Don't pause the WebView - we need audio to keep playing
            // webView.onPause(); // COMMENTED OUT - breaks background audio
        }
        
        // Ensure the locks are held when paused to prevent CPU/Network sleep
        if (wakeLock != null && !wakeLock.isHeld()) {
            try { wakeLock.acquire(); } catch (Exception e) {}
        }
        if (wifiLock != null && !wifiLock.isHeld()) {
            try { wifiLock.acquire(); } catch (Exception e) {}
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        
        // Also ensure WebView stays alive through onStop for background playback
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.resumeTimers();
            webView.onResume();
            // webView.onPause(); // COMMENTED OUT - breaks background audio
        }
    }

    @Override
    public void onDestroy() {
        // Release wake lock
        if (wakeLock != null) {
            try {
                if (wakeLock.isHeld()) {
                    wakeLock.release();
                }
            } catch (Exception e) {
                Log.w(TAG, "WakeLock release failed: " + e.getMessage());
            }
            wakeLock = null;
        }
        
        // Release wifi lock
        if (wifiLock != null) {
            try {
                if (wifiLock.isHeld()) {
                    wifiLock.release();
                }
            } catch (Exception e) {
                Log.w(TAG, "WifiLock release failed: " + e.getMessage());
            }
            wifiLock = null;
        }
        
        // Clean up WebView
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.stopLoading();
            webView.clearHistory();
            webView.clearCache(true);
            webView.destroy();
        }
        isWebViewInitialized = false;
        
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // Let the web app handle back navigation first
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            if (webView.canGoBack()) {
                webView.goBack();
                return;
            }
        }
        super.onBackPressed();
    }
}