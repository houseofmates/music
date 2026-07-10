// Enhanced Voice Control Service
// Integrates speech recognition, wake word detection, smart home integration, and voice feedback

import { voiceRecognition, commandProcessor } from '../utils/voiceRecognition.js';
import { searchTracks } from '../api.js';

export class VoiceControlService {
  constructor(playerStore) {
    this.playerStore = playerStore;
    this.isActive = false;
    this.wakeWordDetector = null;
    this.speechSynthesis = null;
    this.smartHomeIntegrations = {
      googleHome: null,
      alexa: null
    };
    this.feedbackEnabled = true;
    this.wakeWord = 'hey music';
    this.continuousListening = false;
  }

  // Initialize the voice control service
  async initialize() {
    try {
      // Initialize speech synthesis for feedback
      this.initSpeechSynthesis();

      // Initialize wake word detection
      this.initWakeWordDetection();

      // Initialize smart home integrations
      this.initSmartHomeIntegrations();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Initialize text-to-speech for feedback
  initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  // Load available voices for speech synthesis
  loadVoices() {
    const voices = this.speechSynthesis.getVoices();
    // Prefer a natural-sounding voice
    this.selectedVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Alex') ||
      voice.name.includes('Samantha')
    ) || voices[0];
  }

  // Initialize wake word detection using annyang
  initWakeWordDetection() {
    if (window.annyang) {
      const commands = {
        [this.wakeWord]: () => {
          this.onWakeWordDetected();
        }
      };

      window.annyang.addCommands(commands);
      window.annyang.start({ continuous: true, autoRestart: true });
    }
  }

  // Initialize smart home integrations
  async initSmartHomeIntegrations() {
    // Google Home integration
    if (this.isGoogleHomeAvailable()) {
      this.smartHomeIntegrations.googleHome = new GoogleHomeIntegration();
      await this.smartHomeIntegrations.googleHome.initialize();
    }

    // Alexa integration
    if (this.isAlexaAvailable()) {
      this.smartHomeIntegrations.alexa = new AlexaIntegration();
      await this.smartHomeIntegrations.alexa.initialize();
    }
  }

  // Check if Google Home is available
  isGoogleHomeAvailable() {
    return (typeof window !== 'undefined' && typeof window.cast !== 'undefined') || navigator.userAgent.includes('GoogleHome');
  }

  // Check if Alexa is available
  isAlexaAvailable() {
    return typeof alexa !== 'undefined' || navigator.userAgent.includes('Alexa');
  }

  // Handle wake word detection
  onWakeWordDetected() {
    if (!this.isActive) {
      this.activate();
      this.speak('Yes?');
    }
  }

  // Activate voice control
  activate() {
    this.isActive = true;
    this.startContinuousListening();
  }

  // Deactivate voice control
  deactivate() {
    this.isActive = false;
    this.stopContinuousListening();
  }

  // Start continuous listening for commands
  startContinuousListening() {
    if (this.continuousListening) return;

    this.continuousListening = true;

    voiceRecognition.recognition.continuous = true;
    voiceRecognition.recognition.interimResults = true;

    voiceRecognition.recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }

      if (isFinal && transcript.trim()) {
        this.processVoiceCommand(transcript.trim());
      }
    };

    voiceRecognition.recognition.onend = () => {
      if (this.continuousListening && this.isActive) {
        // Restart listening after a short delay
        setTimeout(() => {
          if (this.continuousListening && this.isActive) {
            voiceRecognition.recognition.start();
          }
        }, 1000);
      }
    };

    voiceRecognition.recognition.start();
  }

  // Stop continuous listening
  stopContinuousListening() {
    this.continuousListening = false;
    voiceRecognition.stopListening();
  }

  // Process voice commands
  async processVoiceCommand(transcript) {
    const command = commandProcessor.parseCommand(transcript);

    try {
      switch (command.type) {
        case 'play':
          await this.handlePlayCommand(command);
          break;
        case 'pause':
          await this.handlePauseCommand();
          break;
        case 'skip':
        case 'next':
          await this.handleSkipCommand();
          break;
        case 'previous':
          await this.handlePreviousCommand();
          break;
        case 'search':
          await this.handleSearchCommand(command);
          break;
        case 'volume':
          await this.handleVolumeCommand(command);
          break;
        case 'shuffle':
          await this.handleShuffleCommand(command);
          break;
        case 'repeat':
          await this.handleRepeatCommand(command);
          break;
        case 'status':
          await this.handleStatusCommand();
          break;
        default:
          this.speak("Sorry, I didn't understand that command");
      }
    } catch (error) {
      this.speak('Sorry, there was an error processing your command');
    }
  }

  // Handle play commands
  async handlePlayCommand(command) {
    const { playTrack } = this.playerStore.getState();

    if (command.query) {
      // Search and play specific track
      const results = await this.searchTracks(command.query);
      if (results.length > 0) {
        await playTrack(results[0]);
        this.speak(`Playing ${results[0].title} by ${results[0].artist}`);
      } else {
        this.speak('Sorry, I couldn\'t find that track');
      }
    } else {
      // Resume playback
      const { playPause, isPlaying } = this.playerStore.getState();
      if (!isPlaying) {
        await playPause();
        this.speak('Resuming playback');
      } else {
        this.speak('Already playing');
      }
    }
  }

  // Handle pause command
  async handlePauseCommand() {
    const { playPause, isPlaying } = this.playerStore.getState();
    if (isPlaying) {
      await playPause();
      this.speak('Playback paused');
    } else {
      this.speak('Already paused');
    }
  }

  // Handle skip/next command
  async handleSkipCommand() {
    const { nextTrack } = this.playerStore.getState();
    await nextTrack();
    const newCurrentTrack = this.playerStore.getState().currentTrack;
    if (newCurrentTrack) {
      this.speak(`Now playing ${newCurrentTrack.title} by ${newCurrentTrack.artist}`);
    }
  }

  // Handle previous command
  async handlePreviousCommand() {
    const { previousTrack } = this.playerStore.getState();
    await previousTrack();
    const newCurrentTrack = this.playerStore.getState().currentTrack;
    if (newCurrentTrack) {
      this.speak(`Now playing ${newCurrentTrack.title} by ${newCurrentTrack.artist}`);
    }
  }

  // Handle search command
  async handleSearchCommand(command) {
    const results = await this.searchTracks(command.query);
    if (results.length > 0) {
      this.speak(`Found ${results.length} results for ${command.query}`);
      // Could play the first result or show search results
    } else {
      this.speak('No results found');
    }
  }

  // Handle volume commands
  async handleVolumeCommand(command) {
    const { setVolume, volume } = this.playerStore.getState();

    if (command.level !== undefined) {
      await setVolume(command.level / 100);
      this.speak(`Volume set to ${command.level} percent`);
    } else if (command.action === 'up') {
      const newVolume = Math.min(1, volume + 0.1);
      await setVolume(newVolume);
      this.speak(`Volume increased`);
    } else if (command.action === 'down') {
      const newVolume = Math.max(0, volume - 0.1);
      await setVolume(newVolume);
      this.speak(`Volume decreased`);
    } else if (command.action === 'mute') {
      await setVolume(0);
      this.speak('Muted');
    }
  }

  // Handle shuffle command
  async handleShuffleCommand() {
    const { setShuffle, shuffle } = this.playerStore.getState();
    await setShuffle(!shuffle);
    this.speak(shuffle ? 'Shuffle turned off' : 'Shuffle turned on');
  }

  // Handle repeat command
  async handleRepeatCommand(command) {
    const { setRepeatMode, repeatMode } = this.playerStore.getState();

    if (command.mode) {
      await setRepeatMode(command.mode);
      this.speak(`Repeat mode set to ${command.mode}`);
    } else {
      // Cycle through modes
      const modes = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      await setRepeatMode(nextMode);
      this.speak(`Repeat mode set to ${nextMode}`);
    }
  }

  // Handle status command
  async handleStatusCommand() {
    const { currentTrack, isPlaying, volume, shuffle, repeatMode } = this.playerStore.getState();

    if (currentTrack) {
      const status = `${isPlaying ? 'Playing' : 'Paused'}: ${currentTrack.title} by ${currentTrack.artist}. Volume: ${Math.round(volume * 100)}%. Shuffle: ${shuffle ? 'on' : 'off'}. Repeat: ${repeatMode}.`;
      this.speak(status);
    } else {
      this.speak('No track is currently loaded');
    }
  }

  // Search tracks using the existing API
  async searchTracks(query) {
    try {
      return await searchTracks(query);
    } catch (error) {
      return [];
    }
  }

  // Speak feedback
  speak(text) {
    if (!this.feedbackEnabled || !this.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    this.speechSynthesis.speak(utterance);
  }

  // Enable/disable voice feedback
  setVoiceFeedback(enabled) {
    this.feedbackEnabled = enabled;
  }

  // Set wake word
  setWakeWord(word) {
    this.wakeWord = word.toLowerCase();

    // Update annyang commands
    if (window.annyang) {
      window.annyang.removeCommands();
      const commands = {
        [this.wakeWord]: () => this.onWakeWordDetected()
      };
      window.annyang.addCommands(commands);
    }
  }

  // Smart home integration methods
  sendToGoogleHome(command, data) {
    if (this.smartHomeIntegrations.googleHome) {
      this.smartHomeIntegrations.googleHome.sendCommand(command, data);
    }
  }

  sendToAlexa(command, data) {
    if (this.smartHomeIntegrations.alexa) {
      this.smartHomeIntegrations.alexa.sendCommand(command, data);
    }
  }
}

// Google Home Integration Class
class GoogleHomeIntegration {
  async initialize() {
    // Initialize Google Cast API
    if (typeof window !== 'undefined' && typeof window.cast !== 'undefined') {
      window.cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      });
    }
  }

  sendCommand(command, data) {
    // Send commands to Google Home devices
    // Implementation would depend on Google Cast SDK
  }
}

// Alexa Integration Class
class AlexaIntegration {
  async initialize() {
    // Initialize Alexa integration
    // This would typically use Alexa Skills Kit or similar
  }

  sendCommand(command, data) {
    // Send commands to Alexa devices
  }
}

export default VoiceControlService;