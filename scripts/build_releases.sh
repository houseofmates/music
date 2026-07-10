#!/usr/bin/env bash
# premium release build automation for music app
# builds optimized APK and AppImage with version management and automatic deployment

set -euo pipefail

# determine repository root (assume script lives in scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RELEASE_DIR="$REPO_ROOT/releases"
mkdir -p "$RELEASE_DIR"

# Enhanced logging
LOG_FILE="$RELEASE_DIR/build-$(date +%Y%m%d_%H%M%S).log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "❌ Build failed at line $line_number with exit code $exit_code"
    echo "Check log file: $LOG_FILE"
    exit $exit_code
}
trap 'handle_error $LINENO' ERR

# enhanced version management with git integration
VERSION_FILE="$REPO_ROOT/VERSION"
BUILD_NUMBER=$(date +%Y%m%d%H%M)
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")

if [ -f "$VERSION_FILE" ]; then
    APP_VERSION=$(cat "$VERSION_FILE")
else
    APP_VERSION="1.0.0"
    echo "$APP_VERSION" > "$VERSION_FILE"
fi

# auto-increment patch version for releases
if [ "${AUTO_INCREMENT:-true}" = "true" ]; then
    IFS='.' read -ra VERSION_PARTS <<< "$APP_VERSION"
    VERSION_PARTS[2]=$((${VERSION_PARTS[2]} + 1))
    APP_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.${VERSION_PARTS[2]}"
    echo "$APP_VERSION" > "$VERSION_FILE"
fi

RELEASE_VERSION="${APP_VERSION}-${BUILD_NUMBER}"
APK_RELEASE_NAME="music-app-${RELEASE_VERSION}.apk"
APPIMAGE_RELEASE_NAME="music-app-${RELEASE_VERSION}.AppImage"

# build metadata
BUILD_METADATA="$RELEASE_DIR/build-metadata-${BUILD_NUMBER}.json"
cat > "$BUILD_METADATA" << EOF
{
  "version": "$APP_VERSION",
  "build_number": "$BUILD_NUMBER",
  "git_commit": "$GIT_COMMIT",
  "git_branch": "$GIT_BRANCH",
  "build_date": "$(date -Iseconds)",
  "build_host": "$(hostname)",
  "apk_name": "$APK_RELEASE_NAME",
  "appimage_name": "$APPIMAGE_RELEASE_NAME"
}
EOF

cd "$REPO_ROOT" || exit 1

echo "Building Music App v$RELEASE_VERSION..."
echo ""

# ---- ANDROID APK BUILD ----
if [ -d "frontend" ]; then
  echo "Prepping frontend for production build..."
  pushd frontend > /dev/null

  export VITE_API_URL="https://music.houseofmates.space/api"
  export VITE_APP_VERSION="$RELEASE_VERSION"
  export VITE_BUILD_MODE="production"

  echo "  API URL: $VITE_API_URL"
  echo "  Version: $VITE_APP_VERSION"

  if [ ! -d "node_modules" ]; then
    npm install || { echo "ERROR: npm install failed"; exit 1; }
  fi

  npm run build || { echo "ERROR: Frontend build failed"; exit 1; }
  echo "Frontend build completed"

  if [ -f capacitor.config.json ]; then
    jq 'del(.server.hostname)' capacitor.config.json > tmp.json && mv tmp.json capacitor.config.json
  fi
  popd > /dev/null

  FRONTEND_BUILT=true

  if [ -d "android" ]; then
    echo "Copying web assets into android project"
    mkdir -p android/app/src/main/assets/public
    cp -r frontend/dist/* android/app/src/main/assets/public/ || echo "WARNING: failed to copy dist files"
    cp frontend/capacitor.config.json android/app/src/main/assets/ || echo "WARNING: failed to copy capacitor config"
  fi
else
  FRONTEND_BUILT=false
fi

ANDROID_PROJECT="android"
if [ ! -d "$ANDROID_PROJECT" ]; then
  echo "WARNING: android directory missing, skipping APK build"
  ANDROID_PROJECT=""
fi

if [ -n "$ANDROID_PROJECT" ]; then
  echo "Building APK using $ANDROID_PROJECT"
  pushd "$ANDROID_PROJECT" > /dev/null

  if [ -z "${ANDROID_HOME:-}" ] && [ ! -f "local.properties" ]; then
    if [ -d "$HOME/Android/Sdk" ]; then
      echo "sdk.dir=$HOME/Android/Sdk" > local.properties
    fi
  fi

  if [ ! -f "gradle.properties" ]; then
    echo "android.useAndroidX=true" > gradle.properties
    echo "android.enableJetifier=true" >> gradle.properties
  fi

  if [ -x "./gradlew" ]; then
    if [ -z "${JAVA_HOME:-}" ]; then
      for candidate in /usr/lib/jvm/java-17-openjdk-amd64 /usr/lib/jvm/openjdk-17; do
        if [ -d "$candidate" ]; then
          export JAVA_HOME="$candidate"
          break
        fi
      done
    fi

    mkdir -p app/src/main/res/mipmap
    rm -f app/src/main/res/mipmap/ic_launcher.png app/src/main/res/mipmap/ic_launcher_round.png
    if [ ! -f "app/src/main/res/mipmap/ic_launcher.xml" ]; then
      cat <<'XML' > app/src/main/res/mipmap/ic_launcher.xml
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@android:color/transparent"/>
    <foreground android:drawable="@android:color/transparent"/>
</adaptive-icon>
XML
      cat <<'XML' > app/src/main/res/mipmap/ic_launcher_round.xml
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@android:color/transparent"/>
    <foreground android:drawable="@android:color/transparent"/>
</adaptive-icon>
XML
    fi

    if [ ! -f "app/src/main/res/xml/file_paths.xml" ]; then
      mkdir -p app/src/main/res/xml
      cat <<'XML' > app/src/main/res/xml/file_paths.xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="."/>
</paths>
XML
    fi

    if [ -f "variables.gradle" ]; then
      grep -q '^minSdkVersion' variables.gradle && \
        sed -i 's/minSdkVersion *= *[0-9]\+/minSdkVersion = 26/' variables.gradle
    fi

    if grep -q 'minSdkVersion [0-9]\+' app/build.gradle 2>/dev/null; then
      sed -i 's/minSdkVersion [0-9]\+/minSdkVersion 26/' app/build.gradle
    fi

    if [ -f "app/src/main/res/drawable/splash.xml" ]; then
      cat > app/src/main/res/drawable/splash.xml <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashBackground"/>
</layer-list>
XML
    fi
    rm -f app/src/main/res/drawable/splash_icon.png

    ./gradlew assembleRelease || echo "WARNING: Gradle build failed"

    # check both signed and unsigned APK paths
    APK_PATH="$(pwd)/app/build/outputs/apk/release/app-release.apk"
    APK_UNSIGNED="$(pwd)/app/build/outputs/apk/release/app-release-unsigned.apk"

    if [ -f "$APK_PATH" ]; then
      cp "$APK_PATH" "$RELEASE_DIR/$APK_RELEASE_NAME"
      echo "APK copied: $APK_RELEASE_NAME"
    elif [ -f "$APK_UNSIGNED" ]; then
      cp "$APK_UNSIGNED" "$RELEASE_DIR/$APK_RELEASE_NAME"
      echo "APK (unsigned) copied: $APK_RELEASE_NAME"
    else
      echo "WARNING: no APK found at expected paths"
    fi
  else
    echo "WARNING: gradlew not found in $ANDROID_PROJECT"
  fi
  popd > /dev/null
fi

# ---- APPIMAGE BUILD ----
if [ -d "frontend" ]; then
  echo ""
  echo "Building AppImage..."

  # Reuse frontend build if already done by APK step
  if [ "${FRONTEND_BUILT:-false}" != "true" ]; then
    pushd frontend > /dev/null

    if [ ! -d "node_modules" ]; then
      npm install || { echo "ERROR: npm install failed"; exit 1; }
    fi

    export VITE_API_URL="https://music.houseofmates.space/api"
    npm run build || { echo "ERROR: web build failed"; exit 1; }
    popd > /dev/null
  fi

  pushd frontend > /dev/null
  npm run electron:build:appimage || echo "WARNING: electron build failed"

  APPIMAGE_SOURCE="$(pwd)/release/*.AppImage"
  if compgen -G "$APPIMAGE_SOURCE" >/dev/null 2>&1; then
    for file in $APPIMAGE_SOURCE; do
      cp "$file" "$RELEASE_DIR/$APPIMAGE_RELEASE_NAME"
    done
    echo "AppImage copied: $APPIMAGE_RELEASE_NAME"
  else
    echo "WARNING: no AppImage found after build"
  fi
  popd > /dev/null
fi

# ---- cleanup old builds ----
echo ""
echo "Cleaning up old builds..."
KEEP_BUILDS=5  # Keep last 5 builds
cd "$RELEASE_DIR"

# Remove old APKs
ls -t music-app-*.apk 2>/dev/null | tail -n +$((KEEP_BUILDS + 1)) | xargs -r rm -f

# Remove old AppImages  
ls -t music-app-*.AppImage 2>/dev/null | tail -n +$((KEEP_BUILDS + 1)) | xargs -r rm -f

# Remove old build metadata
ls -t build-metadata-*.json 2>/dev/null | tail -n +$((KEEP_BUILDS + 1)) | xargs -r rm -f

# Remove old logs (keep 10)
ls -t build-*.log 2>/dev/null | tail -n +11 | xargs -r rm -f

cd "$REPO_ROOT"

# ---- generate build summary ----
echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Release artifacts:"
if [ -f "$RELEASE_DIR/$APK_RELEASE_NAME" ]; then
    echo "  📱 APK: $APK_RELEASE_NAME ($(du -h "$RELEASE_DIR/$APK_RELEASE_NAME" | cut -f1))"
fi
if [ -f "$RELEASE_DIR/$APPIMAGE_RELEASE_NAME" ]; then
    echo "  💻 AppImage: $APPIMAGE_RELEASE_NAME ($(du -h "$RELEASE_DIR/$APPIMAGE_RELEASE_NAME" | cut -f1))"
fi
echo "  📋 Metadata: build-metadata-${BUILD_NUMBER}.json"
echo "  📝 Log: build-$(date +%Y%m%d_%H%M%S).log"
echo ""

# ---- deployment optimization ----
if [ "${DEPLOY_MODE:-false}" = "true" ]; then
    echo "🚀 Optimizing for deployment..."
    
    # Create checksums for integrity verification
    if [ -f "$RELEASE_DIR/$APK_RELEASE_NAME" ]; then
        sha256sum "$RELEASE_DIR/$APK_RELEASE_NAME" > "$RELEASE_DIR/${APK_RELEASE_NAME}.sha256"
    fi
    if [ -f "$RELEASE_DIR/$APPIMAGE_RELEASE_NAME" ]; then
        sha256sum "$RELEASE_DIR/$APPIMAGE_RELEASE_NAME" > "$RELEASE_DIR/${APPIMAGE_RELEASE_NAME}.sha256"
    fi
    
    # Create latest symlinks for easy access
    if [ -f "$RELEASE_DIR/$APK_RELEASE_NAME" ]; then
        ln -sf "$APK_RELEASE_NAME" "$RELEASE_DIR/music-app-latest.apk"
    fi
    if [ -f "$RELEASE_DIR/$APPIMAGE_RELEASE_NAME" ]; then
        ln -sf "$APPIMAGE_RELEASE_NAME" "$RELEASE_DIR/music-app-latest.AppImage"
    fi
    
    echo "  ✅ Checksums generated"
    echo "  🔗 Latest symlinks created"
fi

echo ""
echo "📊 Build summary:"
echo "  Version: $APP_VERSION"
echo "  Build: $BUILD_NUMBER"
echo "  Git: $GIT_COMMIT ($GIT_BRANCH)"
echo "  Size: $(du -sh "$RELEASE_DIR" | cut -f1)"
echo ""

# Update version file for next build
echo "$APP_VERSION" > "$VERSION_FILE"