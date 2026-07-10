#!/bin/bash
# Setup systemd service for music app

set -euo pipefail

# Enhanced logging
LOG_FILE="/var/log/music-app-systemd-setup.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "❌ Systemd setup failed at line $line_number with exit code $exit_code"
    echo "Check log file: $LOG_FILE"
    exit $exit_code
}
trap 'handle_error $LINENO' ERR

# Determine repository root (script may be run from any directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

echo "Setting up systemd service for music app..."
echo "Repository root: $REPO_ROOT"

# Check for the service file in expected locations
SERVICE_FILE="$REPO_ROOT/music.service"
if [ ! -f "$SERVICE_FILE" ]; then
    echo "❌ music.service not found"
    echo "   Looked in: $REPO_ROOT/music.service"
    echo "   and: /home/house/Documents/docker/music_app/music.service"
    exit 1
fi

echo "Using service file: $SERVICE_FILE"

# Copy service file
sudo cp "$SERVICE_FILE" /etc/systemd/system/music.service

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable music.service

# Start service
sudo systemctl start music.service

# Check status
sudo systemctl status music.service

echo ""
echo "✓ Music app systemd service installed and started"
echo "✓ Will automatically start on system boot"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status music.service   - Check service status"
echo "  sudo systemctl restart music.service  - Restart the service"
echo "  sudo systemctl stop music.service     - Stop the service"
echo "  sudo journalctl -u music.service      - View logs"
