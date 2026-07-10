# 🚀 Deployment Guide

Complete guide for deploying **Music** to production with Docker, Systemd, and Nginx.

---

## Architecture Overview

```
┌─────────────────┐
│  Nginx :80/443  │  ← Entry point (reverse proxy)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐  ┌──────────┐
│Frontend │  │ Backend  │
│  :3006  │  │  :8000   │
└─────────┘  └──────────┘
    │            │
    └────┬───────┘
         ▼
  ┌──────────────┐
  │ Docker       │
  │ Compose      │
  └──────────────┘
         │
         ▼
  ┌──────────────┐
  │ Systemd      │
  │ (auto-start) │
  └──────────────┘
```

---

## Prerequisites

- Linux server (Ubuntu 22.04+ recommended)
- Docker & Docker Compose installed
- Sudo/root access
- Domain name (optional, for HTTPS)

---

## Part 1: Docker Installation

### Install Docker
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### Install Docker Compose
```bash
# Docker Compose v2 (plugin)
sudo apt install docker-compose-plugin

# Verify installation
docker compose version
```

---

## Part 2: Clone & Configure Project

### Clone Repository
```bash
cd /home/house/Documents/docker/
git clone <your-repo-url> music_app
cd music_app
```

Or if already exists, pull latest:
```bash
cd /home/house/Documents/docker/music_app
git pull
```

### Configure Backend

**Edit `.env` file:**
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

**Required settings:**
```env
APP_NAME=Music
DATABASE_URL=sqlite:///./music.db
MUSICBRAINZ_USER_AGENT=Music/1.0.0 (your-email@example.com)

# Optional: AcoustID for advanced fingerprinting
ACOUSTID_API_KEY=your_acoustid_api_key_here
```

### Configure Music Directory

**Option 1: Mount Existing Directory**
Edit `docker-compose.yml`:
```yaml
volumes:
  - /run/media/house/nextcloud/house/files/media/music:/app/music:ro  # Your music path (updated)
  - music-data:/app/data
```

**Option 2: Copy Music Files**
```bash
mkdir -p ./music
cp -r /path/to/your/music/* ./music/
```

Supported formats: MP3, FLAC, M4A, OGG, WAV

---

## Part 3: Build & Run with Docker

### Production Deployment

```bash
cd /home/house/Documents/docker/music_app

# Build images
docker compose build

# Start containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Development Mode (Hot Reload)

```bash
# Use dev compose file
docker compose -f docker-compose.dev.yml up
```

### Verify Services

```bash
# Check frontend
curl http://localhost:3006

# Check backend
curl http://localhost:8000/health

# Check API
curl http://localhost:8000/api/tracks
```

---

## Part 4: Systemd Service (Auto-Start on Boot)

### Install Service

```bash
cd /home/house/Documents/docker/music_app

# Copy service file
sudo cp music.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable music

# Start service now
sudo systemctl start music

# Check status
sudo systemctl status music
```

### Service Commands

```bash
# Start
sudo systemctl start music

# Stop
sudo systemctl stop music

# Restart
sudo systemctl restart music

# Status
sudo systemctl status music

# View logs
sudo journalctl -u music -f

# Disable auto-start
sudo systemctl disable music
```

### Verify Auto-Start

```bash
# Reboot system
sudo reboot

# After reboot, check if containers are running
docker compose ps
```

---

## Part 5: Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Configure Reverse Proxy

```bash
cd /home/house/Documents/docker/music_app

# Copy config
sudo cp music.nginx.conf /etc/nginx/sites-available/music

# Create symlink
sudo ln -s /etc/nginx/sites-available/music /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Access Application

**Without domain:**
- http://your-server-ip/ (frontend)
- http://your-server-ip/api (backend)

**With domain:**
Edit `/etc/nginx/sites-available/music`:
```nginx
server {
    listen 80;
    server_name music.yourdomain.com;
    # ... rest of config
}
```

---

## Part 6: HTTPS with Let's Encrypt (Optional)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
# Get certificate and auto-configure Nginx
sudo certbot --nginx -d music.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)
```

### Auto-Renewal

Certbot installs a cron job automatically. Test renewal:
```bash
sudo certbot renew --dry-run
```

### Update Capacitor Config (Android)

Edit `frontend/capacitor.config.ts`:
```typescript
export default {
  // ...
  server: {
    url: 'https://music.yourdomain.com',
    cleartext: false
  }
};
```

Rebuild Android app:
```bash
cd frontend
npm run build
npx cap sync android
```

---

## Part 7: Firewall Configuration

### UFW (Ubuntu Firewall)

```bash
# Allow SSH (don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Docker Ports (Optional)

If you need direct access to Docker containers:
```bash
# Allow frontend
sudo ufw allow 3006/tcp

# Allow backend
sudo ufw allow 8000/tcp
```

---

## Part 8: Monitoring & Maintenance

### Check Logs

**Docker Compose:**
```bash
docker compose logs -f --tail=100

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f file-watcher
```

**Systemd:**
```bash
sudo journalctl -u music -f
```

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart Docker containers
docker compose restart

# Restart Nginx
sudo systemctl restart nginx

# Restart systemd service
sudo systemctl restart music
```

### Update Application

```bash
cd /home/house/Documents/docker/music_app

# Pull latest code
git pull

# Rebuild containers
docker compose build

# Restart (systemd will auto-restart if enabled)
docker compose down
docker compose up -d

# Or use systemd
sudo systemctl restart music
```

### Backup Database

```bash
# Create backup directory
mkdir -p ./backups

# Copy database
docker compose exec backend cp /app/music.db /tmp/music.db
docker compose cp backend:/tmp/music.db ./backups/music-$(date +%Y%m%d).db

# Or directly from volume
docker run --rm -v music-data:/data -v $(pwd)/backups:/backup alpine \
  cp /data/music.db /backup/music-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Stop containers
docker compose down

# Restore database
docker run --rm -v music-data:/data -v $(pwd)/backups:/backup alpine \
  cp /backup/music-20240315.db /data/music.db

# Start containers
docker compose up -d
```

---

## Part 9: Performance Tuning

### Increase Upload Limits

Edit `/etc/nginx/sites-available/music`:
```nginx
server {
    # ...
    client_max_body_size 100M;  # Increase for large file uploads
}
```

### Enable Gzip Compression

Already enabled in `music.nginx.conf`:
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript;
```

### Nginx Worker Processes

Edit `/etc/nginx/nginx.conf`:
```nginx
worker_processes auto;  # Use all CPU cores
worker_connections 1024;
```

### Docker Resource Limits

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    # ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## Part 10: Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check Docker status
sudo systemctl status docker
```

### Can't Access Frontend

```bash
# Test directly
curl http://localhost:3006

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify upstream
curl http://localhost:3006
curl http://localhost:8000/health
```

### Backend Errors

```bash
# Check backend logs
docker compose logs backend

# Check database
docker compose exec backend ls -la /app/music.db

# Test database connection
docker compose exec backend python -c "from backend.config import get_settings; print(get_settings())"
```

### File Watcher Not Scanning

```bash
# Check logs
docker compose logs file-watcher

# Verify music directory
docker compose exec file-watcher ls -la /app/music

# Manually trigger scan
docker compose exec file-watcher python -c "from backend.services.audio_processor import scan_music_directory; scan_music_directory('/app/music')"
```

### Port Conflicts

```bash
# Check what's using port 3006
sudo lsof -i :3006

# Check what's using port 8000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

---

## Part 11: Security Hardening

### Run as Non-Root

Already configured in Dockerfiles:
```dockerfile
RUN addgroup --system app && adduser --system --group app
USER app
```

### Environment Variables

Never commit sensitive data:
```bash
# Add to .gitignore
echo "backend/.env" >> .gitignore
echo "*.keystore" >> .gitignore
echo "android/key.properties" >> .gitignore
```

### Restrict Nginx Access

Edit `/etc/nginx/sites-available/music`:
```nginx
# Allow only specific IPs
location /api/admin {
    allow 192.168.1.0/24;
    deny all;
}
```

### Enable Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## Part 12: Scaling (Optional)

### Multiple Workers

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    # ...
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Load Balancing

Use Nginx upstream with multiple backend instances:
```nginx
upstream music_backend {
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}
```

---

## Quick Reference

### Essential Commands

```bash
# Start everything
sudo systemctl start music

# Stop everything
sudo systemctl stop music

# Restart everything
sudo systemctl restart music

# View logs
docker compose logs -f

# Update and restart
git pull && docker compose build && sudo systemctl restart music

# Backup database
docker compose cp backend:/app/music.db ./backups/music-$(date +%Y%m%d).db
```

### File Locations

- **Docker Compose:** `/home/house/Documents/docker/music_app`
- **Systemd Service:** `/etc/systemd/system/music.service`
- **Nginx Config:** `/etc/nginx/sites-available/music`
- **Nginx Logs:** `/var/log/nginx/`
- **SSL Certificates:** `/etc/letsencrypt/live/music.yourdomain.com/`

---

## Support

For issues, check:
1. Docker logs: `docker compose logs -f`
2. Systemd logs: `sudo journalctl -u music -f`
3. Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**Your Music app is now running 24/7!** 🎵
