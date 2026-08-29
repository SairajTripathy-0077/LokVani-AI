/**
 * LokVani AI — Browser-Native Web Speech API Service
 * Handles STT (Speech-to-Text) and TTS (Text-to-Speech) with multi-dialect support.
 *
 * Improvements:
 * - Creates fresh SpeechRecognition instance on start to avoid InvalidStateError in Chrome/Edge
 * - Fixes Chrome/Edge getVoices() empty-list bug via voiceschanged event + caching
 * - Splits long TTS text into sentence-sized chunks queued sequentially (avoids truncation)
 * - Smarter voice selection: exact locale → language-family → default
 * - Exposes playback speed (rate) control
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    this.recognitionSupported = !!SpeechRecognition;
    this.synthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.activeRecognition = null;

    // Cached voices — populated on first getVoices() call or voiceschanged event
    this._cachedVoices = [];
    this._voicesLoaded = false;

    if (this.synthesisSupported) {
      this._loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this._loadVoices();
      };
    }
  }

  _loadVoices() {
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this._cachedVoices = voices;
        this._voicesLoaded = true;
      }
    } catch (_) {}
  }

  getVoices() {
    if (!this._voicesLoaded || this._cachedVoices.length === 0) {
      this._loadVoices();
    }
    return this._cachedVoices;
  }

  /**
   * Select the best available voice for a given BCP-47 locale.
   */
  selectVoice(langCode) {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const langPrefix = langCode.split('-')[0].toLowerCase();

    // 1. Exact locale match
    const exact = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (exact) return exact;

    // 2. Language-family match
    const family = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (family) return family;

    return null;
  }

  _splitIntoChunks(text) {
    if (!text) return [];
    const raw = text.split(/(?<=[।.!?])\s+/);
    const chunks = [];
    let current = '';

    for (const part of raw) {
      if ((current + ' ' + part).trim().length > 200) {
        if (current) chunks.push(current.trim());
        current = part;
      } else {
        current = current ? `${current} ${part}` : part;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : [text];
  }

  // ─── STT ─────────────────────────────────────────────────────────────────

  /**
   * Start listening for voice input.
   */
  startListening(onResult, onError, langCode = 'hi-IN') {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      if (onError) onError(
        'Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari, or click quick options.'
      );
      return;
    }

    // Stop any existing active recognition instance before starting fresh
    this.stopListening();

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = langCode;

      let fullTranscript = '';

      rec.onresult = (event) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript + ' ';
          if (event.results[i].isFinal) isFinal = true;
        }
        fullTranscript = currentTranscript.trim();
        if (onResult) onResult({ transcript: fullTranscript, isFinal });
      };

      rec.onerror = (event) => {
        console.warn('[SpeechService] STT error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          if (onError) onError(`Voice recognition notice: ${event.error}`);
        }
      };

      rec.onend = () => {
        if (this.activeRecognition === rec) {
          this.activeRecognition = null;
        }
      };

      this.activeRecognition = rec;
      rec.start();
    } catch (err) {
      console.error('[SpeechService] Failed to start recognition:', err);
      if (onError) onError('Microphone access denied or busy. Please check browser microphone permissions.');
    }
  }

  stopListening() {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch (_) {}
      this.activeRecognition = null;
    }
  }

  // ─── TTS ─────────────────────────────────────────────────────────────────

  speakText(text, langCode = 'hi-IN', onEnd = null, rate = 0.92) {
    if (!this.synthesisSupported) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    const voice = this.selectVoice(langCode);
    const chunks = this._splitIntoChunks(text);

    let chunkIndex = 0;

    const speakNext = () => {
      if (chunkIndex >= chunks.length) {
        if (onEnd) onEnd();
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
        utterance.lang = langCode;
        utterance.rate = Math.min(Math.max(rate, 0.5), 2.0);
        utterance.pitch = 1.0;

        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          chunkIndex++;
          speakNext();
        };

        utterance.onerror = (e) => {
          if (e.error !== 'interrupted') {
            console.warn('[SpeechService] TTS chunk notice:', e.error);
          }
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      } catch (_) {
        if (onEnd) onEnd();
      }
    };

    speakNext();
  }

  stopSpeaking() {
    if (this.synthesisSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  }

  getSupportStatus() {
    return {
      stt: this.recognitionSupported,
      tts: this.synthesisSupported
    };
  }
}

export const speechService = new SpeechService();
