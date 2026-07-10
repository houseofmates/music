// Absolute minimal test - no imports except React
import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050505', 
      color: '#F6B012',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1>Hello World - Minimal Test</h1>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
