#!/bin/bash

# Setup cron job for automatic YouTube cookie updates
# This will update cookies daily at 2 AM

echo "⏰ Setting up automatic YouTube cookie updates..."
echo "=============================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATE_SCRIPT="$SCRIPT_DIR/update_youtube_cookies.sh"

# Create cron job entry
CRON_ENTRY="0 2 * * * $UPDATE_SCRIPT >> $SCRIPT_DIR/cookie_update.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "update_youtube_cookies.sh"; then
    echo "✅ Cron job already exists"
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✅ Cron job added successfully"
fi

echo ""
echo "📋 Cron job details:"
echo "   Schedule: Daily at 2:00 AM"
echo "   Command: $UPDATE_SCRIPT"
echo "   Log file: $SCRIPT_DIR/cookie_update.log"
echo ""
echo "💡 To view logs: tail -f $SCRIPT_DIR/cookie_update.log"
echo "💡 To edit cron jobs: crontab -e"
echo "💡 To list cron jobs: crontab -l"
