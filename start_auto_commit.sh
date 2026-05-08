#!/bin/bash
# Start the auto-commit system in the background

cd "$(dirname "$0")"
python3 auto_commit.py &
echo "Auto-commit system started in background (PID: $!)"