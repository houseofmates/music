#!/bin/bash
# Update Cloudflare tunnel configuration for music app

set -euo pipefail

# Enhanced logging
LOG_FILE="/var/log/cloudflare-tunnel-update.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "❌ Cloudflare tunnel update failed at line $line_number with exit code $exit_code"
    echo "Check log file: $LOG_FILE"
    exit $exit_code
}
trap 'handle_error $LINENO' ERR

# Determine repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default target port (nginx proxy)
TARGET_PORT="${TARGET_PORT:-3006}"
SOURCE_PORT="${SOURCE_PORT:-3004}"

echo "Updating Cloudflare tunnel configuration..."

# Check if cloudflared config exists
if [ ! -f /etc/cloudflared/config.yml ]; then
    echo "❌ Cloudflared config not found at /etc/cloudflared/config.yml"
    echo "   Please ensure cloudflared is installed and configured."
    exit 1
fi

# Backup current config
sudo cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.backup.$(date +%Y%m%d_%H%M%S)

# Update the music.houseofmates.space line to point to target port
sudo sed -i "s|service: http://127.0.0.1:${SOURCE_PORT}|service: http://127.0.0.1:${TARGET_PORT}|g" /etc/cloudflared/config.yml

echo "Restarting cloudflared service..."
sudo systemctl restart cloudflared

echo ""
echo "✓ Updated music.houseofmates.space to use port $TARGET_PORT (nginx proxy)"
echo "✓ Port $TARGET_PORT now properly proxies /api requests to backend"
echo ""
echo "Verify with: sudo systemctl status cloudflared"
