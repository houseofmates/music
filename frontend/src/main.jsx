import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { DataSaverProvider } from './context/DataSaverContext.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#F6B012', fontSize: '1.5rem', marginBottom: '1rem' }}>something went wrong</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>{String(this.state.error)}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#F6B012', color: '#050505', border: 'none', padding: '0.75rem 2rem', borderRadius: '1rem', fontSize: '1rem', cursor: 'pointer' }}
            >reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <DataSaverProvider>
      <App />
    </DataSaverProvider>
  </ErrorBoundary>
);

// Register Service Worker for offline support (only on HTTP/HTTPS, not file://)
if ('serviceWorker' in navigator && !window.location.protocol.startsWith('file')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
    });
  });
}
