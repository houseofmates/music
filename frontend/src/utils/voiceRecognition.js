// Voice Recognition polyfill and utilities
export class VoiceRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return typeof window !== 'undefined' && 
           (window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  getRecognition() {
    if (!this.isSupported) return null;
    
    if (!this.recognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupDefaults();
    }
    
    return this.recognition;
  }

  setupDefaults() {
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  async startListening(options = {}) {
    const recognition = this.getRecognition();
    if (!recognition) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      recognition.onstart = () => {
        // Voice recognition started
      };

      recognition.onresult = (event) => {
        let transcript = '';
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript = result[0].transcript;
            confidence = result[0].confidence;
            break;
          }
        }

        resolve({ transcript, confidence, isFinal: true });
      };

      recognition.onerror = (event) => {
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        // Voice recognition ended
      };

      // Apply options
      if (options.language) recognition.lang = options.language;
      if (options.continuous !== undefined) recognition.continuous = options.continuous;
      
      recognition.start();
    });
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

// Natural language processing for music commands
export class MusicCommandProcessor {
  static parseCommand(transcript) {
    const command = transcript.toLowerCase().trim();

    // Pause commands
    if (this.isPauseCommand(command)) {
      return {
        type: 'pause',
        action: 'pause'
      };
    }

    // Skip/Next commands
    if (this.isSkipCommand(command)) {
      return {
        type: 'skip',
        action: 'skip'
      };
    }

    // Previous commands
    if (this.isPreviousCommand(command)) {
      return {
        type: 'previous',
        action: 'previous'
      };
    }

    // Volume commands
    if (this.isVolumeCommand(command)) {
      return {
        type: 'volume',
        ...this.extractVolumeCommand(command),
        action: 'volume'
      };
    }

    // Shuffle commands
    if (this.isShuffleCommand(command)) {
      return {
        type: 'shuffle',
        action: 'shuffle'
      };
    }

    // Repeat commands
    if (this.isRepeatCommand(command)) {
      return {
        type: 'repeat',
        ...this.extractRepeatCommand(command),
        action: 'repeat'
      };
    }

    // Status commands
    if (this.isStatusCommand(command)) {
      return {
        type: 'status',
        action: 'status'
      };
    }

    // Play commands
    if (this.isPlayCommand(command)) {
      return {
        type: 'play',
        query: this.extractSearchQuery(command, ['play', 'put on', 'start', 'queue']),
        action: 'play'
      };
    }

    // Search commands
    if (this.isSearchCommand(command)) {
      return {
        type: 'search',
        query: this.extractSearchQuery(command, ['search', 'find', 'show me', 'look for']),
        action: 'search'
      };
    }

    // Radio commands
    if (this.isRadioCommand(command)) {
      return {
        type: 'radio',
        query: this.extractSearchQuery(command, ['radio', 'similar to', 'like', 'station']),
        action: 'radio'
      };
    }

    // Genre commands
    if (this.isGenreCommand(command)) {
      return {
        type: 'genre',
        query: this.extractSearchQuery(command, ['genre', 'style', 'type']),
        action: 'genre'
      };
    }

    // Mood commands
    if (this.isMoodCommand(command)) {
      return {
        type: 'mood',
        query: command,
        mood: this.extractMood(command),
        action: 'mood'
      };
    }

    // Year commands
    if (this.isYearCommand(command)) {
      return {
        type: 'year',
        year: this.extractYear(command),
        action: 'year'
      };
    }

    // Default to search
    return {
      type: 'search',
      query: command,
      action: 'search'
    };
  }

  static isPlayCommand(command) {
    const playKeywords = ['play', 'put on', 'start', 'queue', 'add'];
    return playKeywords.some(keyword => command.includes(keyword));
  }

  static isSearchCommand(command) {
    const searchKeywords = ['search', 'find', 'show me', 'look for', 'get'];
    return searchKeywords.some(keyword => command.includes(keyword));
  }

  static isRadioCommand(command) {
    const radioKeywords = ['radio', 'similar to', 'like', 'station', 'based on'];
    return radioKeywords.some(keyword => command.includes(keyword));
  }

  static isGenreCommand(command) {
    const genreKeywords = ['genre', 'style', 'type', 'category'];
    return genreKeywords.some(keyword => command.includes(keyword));
  }

  static isMoodCommand(command) {
    const moods = ['happy', 'sad', 'upbeat', 'chill', 'energetic', 'relax', 'angry', 'romantic', 'party', 'study', 'workout'];
    return moods.some(mood => command.includes(mood));
  }

  static isYearCommand(command) {
    return /\b(19|20)\d{2}\b/.test(command);
  }

  static extractSearchQuery(command, keywords) {
    for (const keyword of keywords) {
      if (command.includes(keyword)) {
        return command.replace(keyword, '').trim();
      }
    }
    return command;
  }

  static extractMood(command) {
    const moods = ['happy', 'sad', 'upbeat', 'chill', 'energetic', 'relax', 'angry', 'romantic', 'party', 'study', 'workout'];
    return moods.find(mood => command.includes(mood)) || 'unknown';
  }

  static extractYear(command) {
    const match = command.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : null;
  }

  // New command detection methods
  static isPauseCommand(command) {
    const pauseKeywords = ['pause', 'stop', 'halt'];
    return pauseKeywords.some(keyword => command.includes(keyword));
  }

  static isSkipCommand(command) {
    const skipKeywords = ['skip', 'next', 'forward'];
    return skipKeywords.some(keyword => command.includes(keyword));
  }

  static isPreviousCommand(command) {
    const previousKeywords = ['previous', 'back', 'last'];
    return previousKeywords.some(keyword => command.includes(keyword));
  }

  static isVolumeCommand(command) {
    const volumeKeywords = ['volume', 'sound', 'loud', 'quiet', 'mute'];
    return volumeKeywords.some(keyword => command.includes(keyword));
  }

  static extractVolumeCommand(command) {
    const lowerCommand = command.toLowerCase();

    // Check for mute
    if (lowerCommand.includes('mute')) {
      return { action: 'mute' };
    }

    // Check for volume up/down
    if (lowerCommand.includes('up') || lowerCommand.includes('louder') || lowerCommand.includes('increase')) {
      return { action: 'up' };
    }

    if (lowerCommand.includes('down') || lowerCommand.includes('quieter') || lowerCommand.includes('decrease')) {
      return { action: 'down' };
    }

    // Check for specific volume level
    const volumeMatch = command.match(/(\d+)(?:\s*%)?/);
    if (volumeMatch) {
      const level = parseInt(volumeMatch[1]);
      if (level >= 0 && level <= 100) {
        return { level: level };
      }
    }

    return { action: 'unknown' };
  }

  static isShuffleCommand(command) {
    const shuffleKeywords = ['shuffle', 'random', 'mix'];
    return shuffleKeywords.some(keyword => command.includes(keyword));
  }

  static isRepeatCommand(command) {
    const repeatKeywords = ['repeat', 'loop', 'cycle'];
    return repeatKeywords.some(keyword => command.includes(keyword));
  }

  static extractRepeatCommand(command) {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('one') || lowerCommand.includes('single') || lowerCommand.includes('track')) {
      return { mode: 'one' };
    }

    if (lowerCommand.includes('all') || lowerCommand.includes('playlist') || lowerCommand.includes('queue')) {
      return { mode: 'all' };
    }

    if (lowerCommand.includes('off') || lowerCommand.includes('none') || lowerCommand.includes('stop')) {
      return { mode: 'none' };
    }

    return {};
  }

  static isStatusCommand(command) {
    const statusKeywords = ['status', 'what\'s playing', 'now playing', 'current'];
    return statusKeywords.some(keyword => command.includes(keyword));
  }
}

export const voiceRecognition = new VoiceRecognitionManager();
export const commandProcessor = MusicCommandProcessor;