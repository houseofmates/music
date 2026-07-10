// Type declarations for .jsx/.js modules imported in .tsx files
declare module '*.jsx' {
  const content: any;
  export default content;
}

declare module '*.js' {
  const content: any;
  export default content;
}

// Global type declarations
declare global {
  interface Window {
    Capacitor?: any;
    webkitAudioContext?: typeof AudioContext;
    AudioContext?: typeof AudioContext;
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export {};
