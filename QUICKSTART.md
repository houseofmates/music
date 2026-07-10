# 🚀 Vibecode Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- Music files at `/mnt/nextcloud/house/files/media/music`
- (Optional) AcoustID API key from https://acoustid.org/api-key

---

## Installation (3 Steps)

### 1. Navigate to Project
```bash
cd /home/house/Documents/docker/music_app
```

### 2. Configure (Optional but Recommended)
```bash
# Backend
cd backend
cp .env.example .env
nano .env  # Add your ACOUSTID_API_KEY

# Frontend
cd ../frontend
cp .env.example .env
```

### 3. Start Application
```bash
# From project root
cd /home/house/Documents/docker/music_app

# Quick start (automated)
./setup.sh

# OR manual start
docker-compose up -d
```

---

## Access Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f file-watcher
docker-compose logs -f frontend
```

### Stop Application
```bash
docker-compose down
```

### Restart Application
```bash
docker-compose restart
```

### Rebuild After Changes
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### View Running Containers
```bash
docker-compose ps
```

---

## Development Mode

If you want to develop with hot-reload:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py  # Terminal 1

# In another terminal
python file_watcher.py  # Terminal 2
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev  # Opens on http://localhost:5173
```

---

## Usage Guide

### Adding Music
1. Copy music files to `/mnt/nextcloud/house/files/media/music`
2. File watcher automatically:
   - Lowercases filenames
   - Reads ID3 tags
   - Organizes into artist/album/song structure
   - Adds to library

### Playing Music
1. Open http://localhost in browser
2. Browse tracks/artists/albums
3. Click any track to play
4. Use player controls at bottom

### Creating Playlists
1. Go to Playlists tab
2. Click + button
3. Enter playlist name
4. Add tracks using + button on any track

### Managing Queue
1. Add tracks to queue with + button
2. View queue on Player page
3. Reorder by dragging (UI ready)
4. Remove with X button

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port 8000 in use: Stop other services
# - Permission denied: Check music directory permissions
```

### Frontend Won't Load
```bash
# Check logs
docker-compose logs frontend

# Try rebuild
docker-compose down
docker-compose build frontend
docker-compose up -d
```

### Music Not Appearing
```bash
# Check file watcher logs
docker-compose logs file-watcher

# Verify music directory
ls /mnt/nextcloud/house/files/media/music

# Check permissions
sudo chown -R $USER:$USER /mnt/nextcloud/house/files/media/music
```

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
docker-compose down
docker volume rm music_app_vibecode-data
docker-compose up -d
```

### Audio Won't Play
- Check browser console (F12)
- Verify audio file format is supported
- Try different browser
- Check CORS settings in backend/.env

---

## Configuration

### Backend Environment Variables
Edit `backend/.env`:

```env
# Required
MUSIC_DIR=/mnt/nextcloud/house/files/media/music

# Recommended
ACOUSTID_API_KEY=your_key_here  # For fingerprinting

# Optional
DEBUG=True  # Set to False in production
CORS_ORIGINS=http://localhost:5173,http://localhost:80
```

### Frontend Environment Variables
Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## File Structure Quick Reference

```
music_app/
├── backend/          # Python FastAPI
│   ├── main.py      # API server
│   └── file_watcher.py  # Background worker
│
├── frontend/         # React app
│   └── src/
│       ├── pages/   # Route pages
│       └── components/  # UI components
│
└── docker-compose.yml  # Deployment config
```

---

## API Examples

### Get All Tracks
```bash
curl http://localhost:8000/api/tracks
```

### Search
```bash
curl -X POST http://localhost:8000/api/tracks/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Beatles"}'
```

### Add to Queue
```bash
curl -X POST http://localhost:8000/api/queue \
  -H "Content-Type: application/json" \
  -d '{"track_id": 1}'
```

---

## Updates & Maintenance

### Update Application
```bash
git pull  # If using git
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup Database
```bash
docker cp vibecode-backend:/app/data/vibecode.db ./backup-$(date +%Y%m%d).db
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: Deletes database)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## Performance Tips

1. **Large Libraries:** Initial scan may take time for 10,000+ tracks
2. **Caching:** Cover art and metadata are cached in database
3. **Network:** Use local network for best streaming performance
4. **Docker:** Allocate sufficient memory (2GB+ recommended)

---

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify configuration in `.env` files
3. Check API docs: http://localhost:8000/docs
4. Review [README.md](README.md) for detailed documentation
5. Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for overview

---

## Quick Commands Cheat Sheet

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose build

# Status
docker-compose ps

# Clean restart
docker-compose down && docker-compose up -d
```

---

**🎵 Enjoy your music! 🎵**
