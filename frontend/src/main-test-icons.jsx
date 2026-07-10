import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Music, X } from '../icons.jsx';

function Home() {
  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <Music style={{ width: 48, height: 48, color: '#F6B012' }} />
      <X style={{ width: 48, height: 48, color: '#F6B012' }} />
      <h1>Test with lucide-react icons</h1>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#050505' }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
