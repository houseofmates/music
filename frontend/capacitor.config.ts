import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.house.music',
  appName: 'Music',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'music-key',
      releaseType: 'APK'
    },
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#050505',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050505',
      overlaysWebView: true
    },
    // Enhanced offline capabilities
    App: {
      appendUserAgent: 'MusicApp/1.0.0'
    },
    // Background mode for continuous playback
    BackgroundMode: {
      title: 'Music Playing',
      text: 'Your music continues playing',
      icon: 'icon',
      color: '#f6b012',
      silent: false,
      visible: true
    }
  }
};

export default config;
