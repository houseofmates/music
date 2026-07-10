import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Search, Loader2 } from '../icons.jsx';
import { searchTracks } from '../api';
import { usePlayerStore } from '../store';

const VoiceSearch = ({ onResults, setSearchQuery, placeholder = "Tap to search with voice..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    // Initialize speech recognition with multiple fallback strategies
    if (typeof window !== 'undefined') {
      initSpeechRecognition();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initSpeechRecognition = () => {
    // Strategy 1: Try native speech recognition (Chrome, Edge, Safari)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      setIsSupported(true);
      setupSpeechRecognitionEvents();
      return;
    }

    // Strategy 2: Try to enable speech recognition in Firefox
    // Firefox has the API but it's often disabled by default
    tryEnableFirefoxSpeech();
  };

  const tryEnableFirefoxSpeech = () => {
    // Check if Firefox has hidden speech recognition
    if (navigator.userAgent.includes('Firefox')) {
      // Try to access speech recognition through different methods
      try {
        // Some Firefox builds have it under different names
        const speechRecognition = window.SpeechRecognition || 
                                 window.webkitSpeechRecognition ||
                                 window.mozSpeechRecognition ||
                                 window.msSpeechRecognition;
        
        if (speechRecognition) {
          recognitionRef.current = new speechRecognition();
          setIsSupported(true);
          setupSpeechRecognitionEvents();
          return;
        }
      } catch (e) {
      }
    }

    // Strategy 3: Use WebRTC-based speech recognition
    initWebRTCSpeechRecognition();
  };

  const initWebRTCSpeechRecognition = () => {
    // Create a WebRTC-based speech recognition fallback
    // This uses the browser's audio capabilities and sends to a speech service
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsSupported(true);
      setupWebRTCSpeechRecognition();
    } else {
      // Final fallback: text input
      setIsSupported(false);
    }
  };

  const setupSpeechRecognitionEvents = () => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };
    
    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      setIsProcessing(false);
      
      // If Firefox gives an error, try the WebRTC approach
      if (navigator.userAgent.includes('Firefox') && !isSupported) {
        initWebRTCSpeechRecognition();
      }
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        processVoiceCommand(transcript);
      }
    };
  };

  const setupWebRTCSpeechRecognition = () => {
    // Create a WebRTC-based speech recognition using local Whisper server
    recognitionRef.current = {
      start: () => {
        setIsListening(true);
        setTranscript('');
        
        // Request microphone access and record audio
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
              audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              
              try {
                // Send audio to local Whisper server
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');
                
                const response = await fetch('http://192.168.4.250:5000/transcribe', {
                  method: 'POST',
                  body: formData,
                });
                
                if (response.ok) {
                  const result = await response.json();
                  const transcribedText = result.text || result.transcript || '';
                  
                  if (transcribedText.trim()) {
                    setTranscript(transcribedText);
                    setTimeout(() => {
                      processVoiceCommand(transcribedText);
                    }, 1000);
                  }
                } else {
                  setShowFallback(true);
                }
              } catch (error) {
                setShowFallback(true);
              }
              
              // Stop the stream
              stream.getTracks().forEach(track => track.stop());
              setIsListening(false);
            };
            
            // Record for 5 seconds max
            mediaRecorder.start();
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, 5000);
            
          })
          .catch(err => {
            setIsListening(false);
            setShowFallback(true);
          });
      },
      stop: () => {
        setIsListening(false);
      }
    };
  };

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    try {
      // Parse natural language commands
      const lowerCommand = command.toLowerCase();
      let searchQuery = '';
      
      // Play commands
      if (lowerCommand.includes('play') || lowerCommand.includes('put on')) {
        searchQuery = command.replace(/play|put on/gi, '').trim();
        if (searchQuery) {
          const results = await searchTracks(searchQuery);
          if (results.length > 0) {
            playTrack(results[0]);
            onResults(results, `Playing: ${results[0].title}`);
          }
        }
      }
      
      // Search commands
      else if (lowerCommand.includes('search') || lowerCommand.includes('find') || lowerCommand.includes('show me')) {
        searchQuery = command.replace(/search|find|show me/gi, '').trim();
      }
      
      // Genre-based commands
      else if (lowerCommand.includes('genre') || lowerCommand.includes('style')) {
        searchQuery = command.replace(/genre|style/gi, '').trim();
      }
      
      // Year-based commands
      else if (/\b(19|20)\d{2}\b/.test(command)) {
        searchQuery = command.match(/\b(19|20)\d{2}\b/)[0];
      }
      
      // Mood/feeling commands
      else if (lowerCommand.includes('happy') || lowerCommand.includes('upbeat') || 
               lowerCommand.includes('sad') || lowerCommand.includes('chill') ||
               lowerCommand.includes('energetic') || lowerCommand.includes('relax')) {
        searchQuery = command;
      }
      
      // Artist radio
      else if (lowerCommand.includes('radio') || lowerCommand.includes('similar to')) {
        searchQuery = command.replace(/radio|similar to/gi, '').trim();
      }
      
      // Default search
      else {
        searchQuery = command;
      }
      
      // Set the search query in the main search bar
      if (searchQuery && setSearchQuery) {
        setSearchQuery(searchQuery);
      }
      
      // Get search results
      if (searchQuery) {
        const results = await searchTracks(searchQuery);
        onResults(results, searchQuery ? `Results for: ${searchQuery}` : '');
      }
      
    } catch (error) {
      onResults([], 'Sorry, I couldn\'t process that command');
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Voice search not supported - do nothing or show a subtle message
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        id="voice-search-button"
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'hover:scale-110 lowercase'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
        style={{ backgroundColor: isListening ? undefined : '#f6b012' }}
        title={isSupported ? "Voice search" : "Voice search not available"}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#050505' }} />
        ) : (
          <Mic className="w-4 h-4" style={{ color: '#050505' }} />
        )}
      </button>
      
      {transcript && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-vibe-black border border-vibe-gold rounded-lg text-white text-sm z-50 whitespace-nowrap">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;