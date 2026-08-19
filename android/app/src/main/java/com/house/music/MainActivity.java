package com.house.music;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import com.house.music.BuildConfig;

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

        // Enable WebView debugging for Chrome DevTools
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // Show status bar statically (no fullscreen, no immersive mode)
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);

        // Make webview content extend into the status bar area (no inset padding)
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);

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
        // CRITICAL: Enable file:// access for ES module loading under file:// protocol.
        // Without these, <script type="module"> and dynamic import() fail silently in WebView.
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        
        // JavaScript settings
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        
        // Cache settings (AppCache deprecated in API 18, removed in API 21+ - skip entirely)
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
            private boolean isRedirecting = false;
            
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                // If the WebView navigates away from local assets (e.g. Capacitor
                // or react-router tries to load http://localhost after startup),
                // immediately cancel the load and return to the bundled index.html.
                if (url != null && !url.startsWith("file://") && !startsProdUrl(url)) {
                    if (!isRedirecting) {
                        isRedirecting = true;
                        view.stopLoading();
                        view.loadUrl("file:///android_asset/public/index.html");
                        // Reset flag after a short delay to allow the reload to complete
                        view.postDelayed(() -> isRedirecting = false, 1000);
                    }
                    return;
                }
                isRedirecting = false;
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Only allow file:// and the production server.
                // Block everything else (localhost, 127.0.0.1, http://, https://)
                // to prevent the app from navigating away from bundled assets.
                if (url == null) return true;
                if (url.startsWith("file://")) return false;
                if (startsProdUrl(url)) return false;
                
                // Block any other URL and reload local assets
                view.loadUrl("file:///android_asset/public/index.html");
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // If we get an error loading a non-file URL, reload local assets
                if (failingUrl != null && !failingUrl.startsWith("file://")) {
                    view.loadUrl("file:///android_asset/public/index.html");
                    return;
                }
                super.onReceivedError(view, errorCode, description, failingUrl);
            }
        });
        
        isWebViewInitialized = true;
    }

    private boolean startsProdUrl(String url) {
        if (url == null) return false;
        if (BuildConfig.API_DOMAIN.isEmpty()) return false;
        return url.startsWith("https://" + BuildConfig.API_DOMAIN);
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
        
        // Re-apply WebView settings
        if (getBridge() != null && getBridge().getWebView() != null) {
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
        
        // Also check WebView stays alive through onStop for background playback
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