/**
 * Browser-Native Web Speech API Service
 * Handles Speech-To-Text (STT) and Text-To-Speech (TTS) with multi-language support (Hindi & English).
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognitionSupported = !!SpeechRecognition;
    this.synthesisSupported = 'speechSynthesis' in window;
    this.recognition = null;
    
    if (this.recognitionSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  /**
   * Start listening for voice input
   * @param {function} onResult - Callback with text transcript and final status
   * @param {function} onError - Error callback
   * @param {string} langCode - 'hi-IN' or 'en-IN'
   */
  startListening(onResult, onError, langCode = 'hi-IN') {
    if (!this.recognitionSupported) {
      if (onError) onError('Web Speech Recognition is not supported in this browser. Please use Chrome/Edge or use the Demo Presets.');
      return;
    }

    try {
      this.recognition.lang = langCode;

      this.recognition.onresult = (event) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        if (onResult) onResult({ transcript, isFinal });
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (onError && event.error !== 'no-speech') {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      this.recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      if (onError) onError('Microphone access denied or busy.');
    }
  }

  /**
   * Stop active listening
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored if already stopped
      }
    }
  }

  /**
   * Speak text using Web SpeechSynthesis API
   * @param {string} text 
   * @param {string} langCode - 'hi-IN' or 'en-IN'
   * @param {function} onEnd - Callback when speech finishes
   */
  speakText(text, langCode = 'hi-IN', onEnd = null) {
    if (!this.synthesisSupported) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech synthesis
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95; // Slightly slower pace for clear Hindi comprehension
    utterance.pitch = 1.0;

    // Pick best regional voice if available
    const voices = window.speechSynthesis.getVoices();
    const regionalVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (regionalVoice) {
      utterance.voice = regionalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop any current speech playback
   */
  stopSpeaking() {
    if (this.synthesisSupported) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
