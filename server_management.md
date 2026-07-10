# Music App Server Management Guide

## Architecture

The music app uses **systemd** (`music.service`) to manage both:
1. **Backend**: Docker container (`backend` + `file-watcher` services) on port 8000
2. **Frontend**: Vite dev server on port 3006

## Service File Location

```
/etc/systemd/system/music.service
```

## Common Commands

### Restart Everything (Backend + Frontend)
```bash
sudo systemctl restart music.service
```

### Stop the Server
```bash
sudo systemctl stop music.service
```

### Start the Server
```bash
sudo systemctl start music.service
```

### Check Status
```bash
sudo systemctl status music.service
```

### View Logs (follow mode)
```bash
sudo journalctl -u music.service -f
```

## Restarting Just the Backend (for code changes)

Since the backend runs in Docker, you have two options:

### Option 1: Restart everything via systemd (Recommended)
```bash
sudo systemctl restart music.service
```

### Option 2: Restart just the backend container (faster)
```bash
# While the service is running
cd /home/house/Documents/docker/music_app
docker compose restart backend
```

### Option 3: Stop systemd and run backend manually for debugging
```bash
# Stop the service
sudo systemctl stop music.service

# Start backend in foreground for debugging
cd /home/house/Documents/docker/music_app
docker compose up backend

# Or run Python directly without Docker:
cd /home/house/Documents/docker/music_app/backend
python3 main.py
```

## Making Code Changes Take Effect

### Backend Changes (main.py, routes.py, etc.)
1. Edit the file
2. Restart: `sudo systemctl restart music.service`
3. Or restart just container: `docker compose restart backend`

### Frontend Changes (React/Vite)
1. Edit the file
2. Changes are hot-reloaded automatically
3. If needed, restart: `sudo systemctl restart music.service`

## Database Migrations

If you get "no such column" errors:

```bash
# Stop the service first
sudo systemctl stop music.service

# Run migration
cd /home/house/Documents/docker/music_app/backend
python3 migrate_all.py

# Restart
sudo systemctl start music.service
```

## Rate Limiting Issues (429 errors)

The rate limit was increased from 60 to 300 requests/minute in `backend/main.py`:
- Line 126: `RATE_LIMIT_REQUESTS = 300`

After changing rate limits, restart:
```bash
sudo systemctl restart music.service
```

## Troubleshooting

### Port 8000 already in use
```bash
# Find what's using port 8000
sudo ss -tlnp | grep 8000
sudo lsof -i :8000

# Kill all Python/uvicorn processes
sudo pkill -9 -f "python3|uvicorn|main.py"

# Then restart properly via systemd
sudo systemctl restart music.service
```

### Check which process holds the port
```bash
sudo ss -tlnp | grep 8000
```

### Force kill zombie processes
```bash
sudo fuser -k 8000/tcp
sudo systemctl restart music.service
```

## Quick Restart Checklist

1. Made changes to `backend/main.py`? 
   → `sudo systemctl restart music.service`

2. Database migration needed?
   → Stop → Run migrate_all.py → Start

3. Port conflict?
   → `sudo pkill -9 -f python3` then restart

4. Just want to refresh?
   → `sudo systemctl restart music.service`
