import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Settings, Volume2, VolumeX } from '../icons.jsx';
import VoiceControlService from '../services/VoiceControlService.js';
import { usePlayerStore } from '../store';

const VoiceControl = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [wakeWord, setWakeWord] = useState('hey music');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceControlService, setVoiceControlService] = useState(null);

  const playerStore = usePlayerStore();

  useEffect(() => {
    // Initialize voice control service
    const service = new VoiceControlService(playerStore);
    service.initialize().then(success => {
      if (success) {
        setVoiceControlService(service);
      }
    });

    return () => {
      if (service) {
        service.deactivate();
      }
    };
  }, [playerStore]);

  const toggleVoiceControl = () => {
    if (!voiceControlService) return;

    if (isActive) {
      voiceControlService.deactivate();
      setIsActive(false);
      setIsListening(false);
    } else {
      voiceControlService.activate();
      setIsActive(true);
    }
  };

  const toggleVoiceFeedback = () => {
    setVoiceFeedback(!voiceFeedback);
    if (voiceControlService) {
      voiceControlService.setVoiceFeedback(!voiceFeedback);
    }
  };

  const updateWakeWord = (newWakeWord) => {
    setWakeWord(newWakeWord);
    if (voiceControlService) {
      voiceControlService.setWakeWord(newWakeWord);
    }
  };

  const testVoiceFeedback = () => {
    if (voiceControlService) {
      voiceControlService.speak('Voice feedback test');
    }
  };

  return (
    <div className="relative">
      {/* Main Voice Control Button */}
      <button
        onClick={toggleVoiceControl}
        disabled={!voiceControlService}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isActive
            ? 'bg-green-500 text-white animate-pulse'
            : 'hover:scale-110 bg-vibe-gold'
        } ${!voiceControlService ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isActive ? "Voice control active" : "Activate voice control"}
      >
        {isActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" style={{ color: '#050505' }} />}
      </button>

      {/* Status Indicator */}
      {isActive && isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
        title="Voice control settings"
      >
        <Settings className="w-3 h-3 text-white" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-vibe-black border border-vibe-gold rounded-lg p-4 z-50 shadow-xl">
          <h3 className="text-white font-semibold mb-4">Voice Control Settings</h3>

          {/* Voice Feedback Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">Voice Feedback</span>
            <button
              onClick={toggleVoiceFeedback}
              className={`w-12 h-6 rounded-full transition-colors ${
                voiceFeedback ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                voiceFeedback ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Wake Word Setting */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">Wake Word</label>
            <input
              type="text"
              value={wakeWord}
              onChange={(e) => updateWakeWord(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-vibe-gold"
              placeholder="Enter wake word"
            />
          </div>

          {/* Test Voice Feedback */}
          <button
            onClick={testVoiceFeedback}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-vibe-gold text-black rounded hover:bg-yellow-600 transition-colors mb-4"
          >
            <Volume2 className="w-4 h-4" />
            Test Voice Feedback
          </button>

          {/* Voice Commands Help */}
          <div className="text-xs text-gray-400">
            <p className="font-semibold mb-2">Voice Commands:</p>
            <ul className="space-y-1">
              <li>• "Play [song/artist]"</li>
              <li>• "Pause/Stop"</li>
              <li>• "Skip/Next"</li>
              <li>• "Previous/Back"</li>
              <li>• "Volume up/down/[level]"</li>
              <li>• "Shuffle on/off"</li>
              <li>• "Repeat [none/one/all]"</li>
              <li>• "What's playing/Status"</li>
            </ul>
          </div>

          {/* Smart Home Integration Status */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <p className="text-xs text-gray-400 mb-2">Smart Home Integration:</p>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                navigator.userAgent.includes('GoogleHome') || typeof cast !== 'undefined'
                  ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                Google Home
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                navigator.userAgent.includes('Alexa') || typeof alexa !== 'undefined'
                  ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                Alexa
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;