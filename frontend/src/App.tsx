import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Player from './components/Player';
import AppWrapper from './components/AppWrapper';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Artists = lazy(() => import('./pages/Artists'));
const Playlists = lazy(() => import('./pages/Playlists'));
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'));
const Search = lazy(() => import('./pages/Search'));

function App() {
  return (
    <AppWrapper>
      <Router>
        <div className="min-h-screen bg-vibe-black text-white">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/:artist" element={<Artists />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </Suspense>
          <BottomNav />
          <Player />
        </div>
      </Router>
    </AppWrapper>
  );
}

export default App;