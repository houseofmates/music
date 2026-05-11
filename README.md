# music

A self-hosted, high-performance music streaming server with advanced discovery features.

## Features

- **Local Music Library** - Organize and stream your personal music collection
- **Advanced Search** - Semantic search with embeddings for finding songs by lyrics, mood, or description
- **AI-Powered Discovery** - Discover new music based on your listening habits
- **Collaborative Playlists** - Create and share playlists with friends
- **Offline Access** - Mobile app support with passcode authentication
- **High-Quality Audio** - Supports various audio formats (MP3, FLAC, etc.)
- **Web Interface** - Modern web UI for browsing and playing music
- **API Server** - RESTful API for integration with mobile apps and other services

## Installation

### Prerequisites

- Python 3.10+
- PostgreSQL or SQLite (default)
- OLLAMA (optional, for AI features)
- FFmpeg (for audio processing)

### Step-by-Step

1. **Clone the repository:**
   

2. **Install dependencies:**
   

3. **Configure environment:**
   
   Edit  to set your configuration:
   - : Path to your music collection
   - : (Optional) API key for acoustic fingerprinting
   - : URL of your OLLAMA server (default: http://127.0.0.1:11434)
   -  and : For mobile app offline authentication

4. **Initialize the database:**
   

5. **Start the server:**
   
   The server will be available at http://localhost:8000

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
|  |  | Directory containing your music files |
|  |  | Database connection string |
|  | (empty) | API key for AcoustID fingerprinting |
|  |  | User agent for MusicBrainz API |
|  |  | URL for OLLAMA server (AI features) |
|  | (empty) | Username for mobile app passcode authentication |
|  | (empty) | Bcrypt hash of the passcode password |
|  | (auto-generated) | Secret key for JWT tokens (set for production) |
|  |  | Server host |
|  |  | Server port |

### Passcode Authentication

For mobile app offline access, you can set up passcode authentication:

1. Choose a username and password
2. Generate a bcrypt hash:
   
3. Set  and  in your  file

## Usage

### Web Interface

Navigate to http://localhost:8000 in your browser to access the web UI.

### API

The server provides a RESTful API at . See the [API Documentation](docs/api.md) for details.

### Mobile App

Use the official mobile app with the passcode authentication or JWT tokens.

## Development

### Running Tests

============================= test session starts ==============================
platform linux -- Python 3.14.3, pytest-9.0.3, pluggy-1.6.0
rootdir: /home/house
configfile: pyproject.toml
plugins: anyio-4.13.0, xdist-3.8.0, asyncio-1.3.0
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
created: 8/8 workers
8 workers [0 items]


============================ no tests ran in 0.63s =============================

### Code Style

We use Black for code formatting and Ruff for linting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License (see LICENSE file for details)

## Security

If you discover a security vulnerability, please report it to the project maintainers directly.
