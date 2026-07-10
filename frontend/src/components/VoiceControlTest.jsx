import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, SkipForward, SkipBack, Volume2, Settings } from '../icons.jsx';

const VoiceControlTest = () => {
  const [isActive, setIsActive] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [testCommands] = useState([
    'play Bohemian Rhapsody',
    'pause',
    'resume',
    'next',
    'previous',
    'volume up',
    'volume down',
    'status',
    'shuffle on',
    'repeat all',
    'what\'s playing'
  ]);

  const simulateVoiceCommand = async (command) => {
    setLastCommand(command);

    try {
      // Call the backend voice command endpoint
      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
          platform: 'test'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setLastResponse(result.response);
      } else {
        setLastResponse('Error: Failed to process command');
      }
    } catch (error) {
      setLastResponse('Error: Network request failed');
    }
  };

  const getStatus = async () => {
    try {
      const response = await fetch('/api/voice/status');
      if (response.ok) {
        const status = await response.json();
        setLastResponse(`Status: ${status.is_playing ? 'Playing' : 'Paused'}${status.current_track ? ` - ${status.current_track.title} by ${status.current_track.artist}` : ' - No track'}`);
      }
    } catch (error) {
      setLastResponse('Error getting status');
    }
  };

  useEffect(() => {
    // Get initial status
    getStatus();
  }, []);

  return (
    <div className="p-6 bg-vibe-black text-white rounded-lg border border-vibe-gold">
      <h2 className="text-xl font-bold mb-4 text-vibe-gold">Voice Control Test</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Commands */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Test Commands</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => simulateVoiceCommand(command)}
                className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                "{command}"
              </button>
            ))}
          </div>
        </div>

        {/* Voice Control Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Voice Control Status</h3>

          <div className="space-y-4">
            {/* Activation Toggle */}
            <div className="flex items-center justify-between">
              <span>Voice Control Active</span>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isActive ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Status Info */}
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-300">Last Command:</p>
              <p className="text-sm font-mono">{lastCommand || 'None'}</p>
            </div>

            <div className="bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-300">Response:</p>
              <p className="text-sm">{lastResponse || 'None'}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={getStatus}
                className="flex items-center gap-2 px-3 py-2 bg-vibe-gold text-black rounded hover:bg-yellow-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Get Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h4 className="font-semibold mb-2">How to Test:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Click any test command to simulate voice input</li>
          <li>• Check the response to see how the system interprets commands</li>
          <li>• Use "Get Status" to check current playback state</li>
          <li>• Voice control must be active in the main app for wake word detection</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceControlTest;