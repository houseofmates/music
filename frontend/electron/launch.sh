#!/bin/bash
# Music App Launcher - handles common launch issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="music"

echo "Music App Launcher"
echo "=================="

# Check if running from extracted tar.gz or AppImage
if [ -f "$SCRIPT_DIR/$APP_NAME" ]; then
    echo "Running from extracted archive..."
    "$SCRIPT_DIR/$APP_NAME" "$@"
elif [ -f "$SCRIPT_DIR/music.AppImage" ]; then
    echo "Running AppImage..."
    # Try to run AppImage, handle FUSE issues
    if ! ./music.AppImage --appimage-version &>/dev/null; then
        echo "WARNING: FUSE not available. Extracting and running..."
        # Extract and run
        TEMP_DIR=$(mktemp -d)
        ./music.AppImage --appimage-extract >/dev/null 2>&1
        if [ -d "squashfs-root" ]; then
            mv squashfs-root "$TEMP_DIR/"
            "$TEMP_DIR/squashfs-root/AppRun" "$@" &
            APP_PID=$!
            echo "App started (PID: $APP_PID)"
            wait $APP_PID
            rm -rf "$TEMP_DIR"
        else
            echo "ERROR: Failed to extract AppImage"
            exit 1
        fi
    else
        ./music.AppImage "$@"
    fi
else
    echo "ERROR: Cannot find music binary or AppImage"
    exit 1
fi
