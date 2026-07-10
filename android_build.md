# 🤖 Android Build & Deployment Guide

## Prerequisites

### Required Software
- **Node.js 18+** and npm
- **Java Development Kit (JDK) 17**
- **Android Studio** (latest version)
- **Android SDK** (API 34)
- **Gradle** (included with Android Studio)

### Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install Android SDK Platform 34
3. Install Android SDK Build-Tools 34.0.0
4. Install Android SDK Command-line Tools

### Configure Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Adjust path as needed
```

---

## Initial Setup

### 1. Install Dependencies
```bash
cd /home/house/Documents/docker/music_app/frontend
npm install
```

### 2. Build the Web App
```bash
npm run build
```

### 3. Initialize Capacitor (First Time Only)
```bash
# Add Android platform
npx cap add android

# This creates the android/ directory with native project
```

### 4. Sync Web Assets to Android
```bash
npm run android:sync
```

---

## Development Workflow

### Open in Android Studio
```bash
npm run android
# Or manually:
npx cap open android
```

This opens the Android project in Android Studio where you can:
- Build the app
- Run on emulator
- Run on physical device
- Debug
- Generate signed APK

---

## Building Signed APK for Production

### Step 1: Generate Keystore (First Time Only)

```bash
cd /home/house/Documents/docker/music_app/frontend

# Generate release keystore
keytool -genkey -v -keystore release-key.keystore \
  -alias music-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (remember this!)
# - Your name/organization details
```

**IMPORTANT:** Store the keystore file and passwords securely! You'll need them for all future updates.

### Step 2: Configure Gradle Signing

Create `android/key.properties`:
```properties
storeFile=/home/house/Documents/docker/music_app/frontend/release-key.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=music-key
keyPassword=YOUR_KEY_PASSWORD
```

**Add to `.gitignore`:**
```
android/key.properties
*.keystore
```

### Step 3: Update build.gradle

Edit `android/app/build.gradle`:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Release APK

```bash
cd /home/house/Documents/docker/music_app/frontend

# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleRelease

# Or use Android Studio:
# Build > Generate Signed Bundle / APK > APK
```

### Step 5: Locate APK

The signed APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```
(when you run `./scripts/build_releases.sh` the APK is also copied
into the top‑level `releases/` directory for easier tracking)

---

## Installing APK on Device

### Via ADB (USB Debugging)
```bash
# Enable USB Debugging on your Android device
# Connect device via USB

# Check device is connected
adb devices

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Or reinstall (overwrite existing)
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Via File Transfer
1. Copy `app-release.apk` to your Android device
2. Open file manager on device
3. Tap the APK file
4. Allow "Install from unknown sources" if prompted
5. Tap "Install"

---

## Audio Focus Configuration (Concurrent Playback)

The app is configured to allow **concurrent audio playback** with other apps (YouTube, Spotify, etc.).

### Implementation

**MainActivity.java:**
```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Don't request audio focus - allow concurrent playback
        AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setStreamVolume(
                AudioManager.STREAM_MUSIC,
                audioManager.getStreamVolume(AudioManager.STREAM_MUSIC),
                0
            );
        }
    }
}
```

**AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

This configuration:
- ✅ Does NOT pause other apps when Music starts playing
- ✅ Does NOT pause Music when other apps start playing
- ✅ Allows audio mixing (both apps play simultaneously)
- ✅ User can control both apps independently

---

## Connecting to Backend

### Development (Local Network)

Edit `capacitor.config.ts`:
```typescript
server: {
  url: 'http://192.168.1.100:3006',  // Your PC's local IP
  cleartext: true
}
```

Find your local IP:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### Production (Remote Server)

Edit `capacitor.config.ts`:
```typescript
server: {
  url: 'https://music.yourdomain.com',
  cleartext: false  // Use HTTPS
}
```

Don't forget to rebuild and sync after changes:
```bash
npm run build
npx cap sync android
```

---

## Testing

### Run on Emulator
1. Open Android Studio
2. Click "Device Manager"
3. Create a virtual device (Pixel 7, API 34)
4. Click Run (▶️)

### Run on Physical Device
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect via USB
4. Click Run (▶️) in Android Studio
5. Select your device

---

## Troubleshooting

### Build Fails
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleDebug
```

### App Crashes on Launch
Check logs:
```bash
adb logcat | grep -i "music"
```

### Can't Connect to Backend
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check firewall allows port 3006 and 8000
3. Verify device is on same network (for local development)
4. Check `capacitor.config.ts` has correct URL

### Keystore Issues
If you lose your keystore, you cannot update your app on Google Play Store. You'll need to publish as a new app.

---

## Publishing to Google Play Store

### 1. Create App Bundle (AAB)
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 2. Create Google Play Console Account
- Visit: https://play.google.com/console
- Pay $25 one-time registration fee

### 3. Upload AAB
1. Create new application
2. Fill in store listing details
3. Upload AAB to Production/Beta/Alpha track
4. Submit for review

---

## App Icon & Splash Screen

### Generate Icons

Use a tool like: https://icon.kitchen

Required sizes:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

Place in: `android/app/src/main/res/`

### Custom Splash Screen

Create `android/app/src/main/res/drawable/splash_icon.png`:
- 512x512px
- Golden music note on transparent background
- Will be centered on #050505 background

---

## Version Management

Update version in three places:

**1. package.json:**
```json
"version": "1.0.1"
```

**2. android/app/build.gradle:**
```gradle
defaultConfig {
    versionCode 2  // Increment by 1 for each release
    versionName "1.0.1"
}
```

**3. capacitor.config.ts** (optional):
```typescript
// Add version info in comments
```

---

## Quick Commands

```bash
# Full build pipeline
npm run build && npx cap sync android && cd android && ./gradlew assembleRelease

# Install on connected device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# View logs
adb logcat | grep -E "Music|Capacitor"

# Open in Android Studio
npm run android
```

---

## Security Best Practices

1. ✅ Never commit `key.properties` or `*.keystore` files
2. ✅ Store keystore securely (encrypted backup)
3. ✅ Use HTTPS for production backend
4. ✅ Implement authentication if needed
5. ✅ Keep dependencies updated
6. ✅ Test on multiple devices before release

---

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Signing Your App](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)

---

**Ready to build your first APK?**

```bash
cd /home/house/Documents/docker/music_app/frontend
npm install
npm run build
npx cap add android
npm run android
```

🎵 **Enjoy Music on Android!** 🎵
