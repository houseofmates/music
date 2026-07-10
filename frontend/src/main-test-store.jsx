// Test with store-simple only
import React from 'react';
import ReactDOM from 'react-dom';
import { usePlayerStore } from './store-simple';

function App() {
  const store = usePlayerStore();
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050505', 
      color: '#F6B012',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1>Test with store-simple</h1>
      <p style={{color: 'white'}}>Store loaded: {store ? 'YES' : 'NO'}</p>
      <p style={{color: 'white'}}>isPlaying: {store.isPlaying ? 'true' : 'false'}</p>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
