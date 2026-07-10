#!/bin/bash

echo "🎵 starting Music Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed (either v2 plugin or standalone)
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine which docker compose command to use
# prefer docker compose (v2 plugin) if available, otherwise fall back to docker-compose
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' is available."
    exit 1
fi

# Create music directory if it doesn't exist
MUSIC_DIR="/mnt/nextcloud/house/files/media/music"
if [ ! -d "$MUSIC_DIR" ]; then
    echo "⚠️  Music directory does not exist: $MUSIC_DIR"
    echo "   Creating directory..."
    sudo mkdir -p "$MUSIC_DIR"
    echo "✓ Music directory created"
fi

# Copy .env.example to .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "✓ Please edit backend/.env with your settings (especially ACOUSTID_API_KEY)"
fi

# Build and start containers
echo "🐳 Building Docker containers..."
$DOCKER_COMPOSE build

echo "🚀 Starting Music..."
$DOCKER_COMPOSE up -d

echo ""
echo "✓ Music is starting!"
echo ""
echo "📱 Access the application at:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📊 Check logs with:"
echo "   $DOCKER_COMPOSE logs -f"
echo ""
echo "🛑 Stop with:"
echo "   $DOCKER_COMPOSE down"
echo ""
echo "🎵 Enjoy your music! 🎵"
