<h1 align="center">music</h1>

a self-hosted music player and library manager with a backend, a frontend, and a persistent local library database. it handles playback, queue management, metadata, and a clean, opinionated ui — and it does the things that annoy you about every other music app without the subscription or the telemetry.

made for house so the music system is yours and not someone else's product roadmap.

<h2 align="center">what makes it personal</h2>


existing music players fall into two buckets: streaming services that do not own your library, and desktop players that stop at 2020 user interface conventions. this one was built to scratch a specific itch — the ability to serve your own music collection through a web interface, manage it with real metadata, and queue tracks the way the work actually needs them queued, not the way a convention says they should be queued.

the backend tracks the full library in a local sqlite database. the frontend handles queue state, play state, and search. together they give you a music experience that belongs to you and does not have to care about what a label or a company thinks.

<h2 align="center">features</h2>


- **music library** — manage a full local music library with metadata extracted from file tags
- **queue system** — add, reorder, remove, and manage playback queue; smart queue integration included
- **backend + frontend** — node.js / express backend with a clean api, vue or react frontend depending on the build
- **persistent library database** — music_library.db tracks track metadata, play state, and queue history across sessions
- **nginx reverse proxy** — optional nginx config for production deployment with static asset serving
- **docker support** — docker-compose separately for dev and production environments
- **systemd service** — managed via systemd --user for auto-start and recovery
- **cloudflare tunnel** — optional distant access without opening ports (update-cloudflare-tunnel.sh)
- **voice control** — voice_control_readme.md documents the voice command integration
- **sleep features** — sleep_features_implementation.md documents the sleep timer and fade-out pipeline

<h2 align="center">what it is not for</h2>


- **not a streaming service** — there is no catalog, no recommendations engine, no "radio" mode. you work with the files you already have on your filesystem.
- **not a lyrics integration** — there is no lyrics display, no lyrics database lookup, no automatic lyric sync. those live in other apps and the codebase acknowledges that.
- **not a multi-user service** — the backend is a local service. if you want multiple simultaneous listeners with separate queues, that is not built in. you would need to add user sessions and queue isolation.
- **not an automated library manager** — there is no beets-style auto-tagging, no last.fm integration, no musicbrainz lookup. your library quality depends on the files you put in.

<h2 align="center">installation</h2>


```bash
<h1 align="center">clone the repo</h1>

git clone <music-app-repo-url>
cd music-app

<h1 align="center">install backend dependencies</h1>

cd backend
npm install

<h1 align="center">install frontend dependencies</h1>

cd ../frontend
npm install

<h1 align="center">run the dev stack</h1>

cd ..
docker-compose up            # if using docker compose
<h1 align="center">or:</h1>

npm run dev                   # if using npm scripts

<h1 align="center">build for release</h1>

npm run build-all
npm run build:releases
```

the frontend runs on the serve port defined in docker-compose.yml or your .env file. the backend runs on the api port. both are configured in docker-compose.yml for the production stack and in package.json scripts for development.

the production nginx config is at music.nginx.conf. point your domain at it, make sure api proxy rules are correct, and certbot handles the rest.

<h1 align="center">self-hosted signals</h1>

this is a home system running at home. the cloudflare tunnel option (update-cloudflare-tunnel.sh) exists for when you are away from the local network. systemd --user manages the auto-start so music does not stop when the machine reboots.

<h1 align="center">license</h1>

<a href="file:///home/house/license_templates/mates_license.md">the mates license</a>
