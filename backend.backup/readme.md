# Vibecode Backend API

## Quick Commands

### Run Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Run File Watcher
```bash
python file_watcher.py
```

### Manual Library Scan
```bash
python -c "from database import Session, engine; from services import LibraryService; from config import settings; session = Session(engine); LibraryService.scan_directory(session, settings.music_dir, full_scan=True)"
```

### Database Management
```bash
# Reset database (WARNING: Deletes all data)
rm vibecode.db

# View database with SQLite CLI
sqlite3 vibecode.db
```

## API Testing with curl

### Get All Tracks
```bash
curl http://localhost:8000/api/tracks
```

### Search Tracks
```bash
curl -X POST http://localhost:8000/api/tracks/search \
  -H "Content-Type: application/json" \
  -d '{"query": "artist name", "search_in": ["artist", "title"]}'
```

### Get Player State
```bash
curl http://localhost:8000/api/player/state
```

### Add Track to Queue
```bash
curl -X POST http://localhost:8000/api/queue \
  -H "Content-Type: application/json" \
  -d '{"track_id": 1}'
```

### Create Playlist
```bash
curl -X POST http://localhost:8000/api/playlists \
  -H "Content-Type: application/json" \
  -d '{"name": "My Playlist", "description": "Awesome music"}'
```

## Development Tips

1. **Hot Reload:** Use `--reload` flag with uvicorn for auto-restart on code changes
2. **API Docs:** Visit http://localhost:8000/docs for interactive API documentation
3. **Debug Mode:** Set `DEBUG=True` in `.env` for detailed error messages
4. **SQL Queries:** Set `echo=True` in database.py to see SQL queries in console

## Troubleshooting

### Import Errors
```bash
pip install -r requirements.txt
```

### Permission Errors
```bash
sudo chown -R $USER:$USER /run/media/house/nextcloud/house/files/media/music
```

### Database Locked
```bash
# Close all connections and restart
pkill -f "python main.py"
rm vibecode.db-shm vibecode.db-wal
```
