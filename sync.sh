#!/bin/bash
set -euo pipefail
cd /home/house/music

export GIT_TERMINAL_PROMPT=0
git config user.email "house@houseofmates.space" >/dev/null 2>&1 || true
git config user.name "pkm-sync" >/dev/null 2>&1 || true
git config pull.rebase true >/dev/null 2>&1 || true

# avoid cron collision if another run is still going
if kill -0 "$(cat /tmp/music-sync.lock 2>/dev/null)" 2>/dev/null; then
    echo "[sync] another run in progress, exiting"
    exit 0
fi
echo $$ > /tmp/music-sync.lock
trap 'rm -f /tmp/music-sync.lock' EXIT

# 1) pull remote → local
if git pull --no-edit origin main 2>/tmp/music-sync-pull.log; then
    echo "[sync] pulled main"
else
    echo "[sync] pull failed (likely conflict); see /tmp/music-sync-pull.log"
    cat /tmp/music-sync-pull.log
    exit 0
fi

# 2) auto-commit any local changes (new, modified, deleted)
if ! git diff --quiet || ! git diff --cached --quiet; then
    git add -A
    git commit -m "auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" || true
fi

# 3) push local → main
git push origin main >> /tmp/music-sync-push.log 2>&1 && echo "[sync] pushed main" || {
    echo "[sync] push failed; see /tmp/music-sync-push.log"
    cat /tmp/music-sync-push.log
    exit 0
}
