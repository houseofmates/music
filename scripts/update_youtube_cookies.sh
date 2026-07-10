#!/bin/bash

# YouTube Cookie Update Script
# This script updates YouTube cookies from Chrome for the music app backend

echo "🍪 Updating YouTube cookies..."
echo "================================"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Run the Python extractor
python3 "$SCRIPT_DIR/extract_youtube_cookies.py"

# Check if extraction was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Cookie update completed successfully!"
    echo "📄 Cookies saved to: $PROJECT_DIR/backend/data/youtube_cookies.json"
    echo ""
    echo "💡 Make sure your .env file contains:"
    echo "   YT_COOKIES_PATH=$PROJECT_DIR/backend/data/youtube_cookies.json"
else
    echo "❌ Cookie update failed!"
    exit 1
fi
