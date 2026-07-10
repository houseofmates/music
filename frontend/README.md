# Vibecode Frontend

## Quick Commands

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Player.jsx   # Main player controls
│   ├── BottomNav.jsx
│   └── TrackList.jsx
├── pages/           # Route components
│   ├── Home.jsx
│   ├── PlayerPage.jsx
│   ├── Artists.jsx
│   └── ...
├── api.js          # API client
├── store.js        # Zustand state management
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Design System

### Colors
```css
--vibe-black: #050505
--vibe-gold: #f6b012
```

### Tailwind Classes
- Background: `bg-vibe-black`
- Primary: `bg-vibe-gold`, `text-vibe-gold`
- Rounded: `rounded-2xl`, `rounded-3xl`
- Touch targets: minimum `p-3` (44px)

### Typography
- Font: Varela Round (loaded from Google Fonts)
- Apply: `font-varela`

## State Management

The app uses Zustand for state management with localStorage persistence.

### Player Store (`store.js`)

Key state:
- `currentTrack` - Currently playing track
- `isPlaying` - Play/pause state
- `queue` - Current playback queue
- `volume` - Volume level (0.0 - 1.0)
- `repeatMode` - 'none', 'one', 'all'
- `shuffle` - Boolean

Key actions:
- `playTrack(track, queueIndex)` - Start playing a track
- `playPause()` - Toggle play/pause
- `nextTrack()` - Skip to next track
- `previousTrack()` - Go to previous track
- `jump(seconds)` - Jump forward/backward
- `addToQueue(track)` - Add track to queue

## Components

### Player
The main player controls component with:
- Track info and cover art
- Progress bar with seek
- Play/Pause, Next/Previous
- -10s/+10s jump buttons
- Repeat, Shuffle controls
- Lyrics toggle

### BottomNav
Bottom navigation bar with dynamic routing:
- Shows "Player" when track is playing, otherwise "Home"
- Playlists, Artists, Albums tabs
- Active state highlighting

### TrackList
Reusable track list component:
- Cover art thumbnails
- Track info (title, artist, album)
- Play on click
- Add to queue button

## Mobile Optimization

- Viewport meta tags for mobile Safari
- Touch-friendly 44px minimum targets
- No pull-to-refresh interference
- Safe area insets for notched devices
- PWA-ready (add manifest.json if needed)

## Troubleshooting

### Styles not applying
```bash
npm run dev
# Tailwind watches for changes automatically
```

### API calls failing
Check VITE_API_URL in .env and verify backend is running

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```
