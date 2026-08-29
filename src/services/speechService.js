/**
 * LokVani AI — Browser-Native Web Speech API Service
 * Handles STT (Speech-to-Text) and TTS (Text-to-Speech) with multi-dialect support.
 *
 * Improvements:
 * - Fixes the Chrome/Edge getVoices() empty-list bug via voiceschanged event + caching
 * - Splits long TTS text into sentence-sized chunks queued sequentially (avoids truncation)
 * - Smarter voice selection: exact locale → language-family → default
 * - Exposes playback speed (rate) control
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognitionSupported = !!SpeechRecognition;
    this.synthesisSupported = 'speechSynthesis' in window;
    this.recognition = null;

    // Cached voices — populated on first getVoices() call or voiceschanged event
    this._cachedVoices = [];
    this._voicesLoaded = false;

    if (this.recognitionSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }

    if (this.synthesisSupported) {
      this._loadVoices();
      // Chrome loads voices asynchronously — listen for the event
      window.speechSynthesis.onvoiceschanged = () => {
        this._loadVoices();
      };
    }
  }

  _loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this._cachedVoices = voices;
      this._voicesLoaded = true;
    }
  }

  getVoices() {
    if (!this._voicesLoaded || this._cachedVoices.length === 0) {
      this._loadVoices();
    }
    return this._cachedVoices;
  }

  /**
   * Select the best available voice for a given BCP-47 locale.
   * Priority: exact locale match → language prefix match → default
   * @param {string} langCode  e.g. 'hi-IN'
   */
  selectVoice(langCode) {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const langPrefix = langCode.split('-')[0].toLowerCase();

    // 1. Exact locale match
    const exact = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (exact) return exact;

    // 2. Language-family match (e.g. 'hi' for 'hi-IN', 'hi-IN-x-something')
    const family = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (family) return family;

    // 3. Default — let the browser decide
    return null;
  }

  /**
   * Split text into sentence-sized chunks to avoid TTS truncation.
   * @param {string} text
   * @returns {string[]}
   */
  _splitIntoChunks(text) {
    if (!text) return [];
    // Split on sentence-ending punctuation + optional whitespace
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
   * @param {function} onResult  Called with { transcript, isFinal }
   * @param {function} onError   Called with error string
   * @param {string} langCode    BCP-47 locale, e.g. 'hi-IN'
   */
  startListening(onResult, onError, langCode = 'hi-IN') {
    if (!this.recognitionSupported) {
      if (onError) onError(
        'Voice recognition not supported in this browser. Please use Chrome or Edge, or use Demo Presets.'
      );
      return;
    }

    try {
      this.recognition.lang = langCode;
      this.recognition.continuous = true;

      this.recognition.onresult = (event) => {
        let fullTranscript = '';
        let isFinal = false;

        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript + ' ';
          if (event.results[i].isFinal) isFinal = true;
        }
        if (onResult) onResult({ transcript: fullTranscript.trim(), isFinal });
      };

      this.recognition.onerror = (event) => {
        console.warn('[SpeechService] STT error:', event.error);
        if (onError && event.error !== 'no-speech') {
          onError(`Voice recognition error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // If recognition ends without a final result (e.g. user paused), it just stops.
        // The component handles the state based on whether transcript is present.
      };

      this.recognition.start();
    } catch (err) {
      console.error('[SpeechService] Failed to start recognition:', err);
      if (onError) onError('Microphone access denied or busy. Please allow microphone access.');
    }
  }

  stopListening() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch (_) { /* already stopped */ }
    }
  }

  // ─── TTS ─────────────────────────────────────────────────────────────────

  /**
   * Speak text using Web SpeechSynthesis API.
   * Long text is split into chunks and queued sequentially.
   *
   * @param {string} text
   * @param {string} langCode    BCP-47 locale, e.g. 'hi-IN'
   * @param {function} onEnd     Called when all chunks finish
   * @param {number} rate        Playback speed (0.5–2.0); default 0.92
   */
  speakText(text, langCode = 'hi-IN', onEnd = null, rate = 0.92) {
    if (!this.synthesisSupported) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

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
        // 'interrupted' fires when user cancels — not a real error
        if (e.error !== 'interrupted') {
          console.warn('[SpeechService] TTS error on chunk:', e.error);
        }
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  stopSpeaking() {
    if (this.synthesisSupported) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Check if TTS and STT are supported.
   * @returns {{ stt: boolean, tts: boolean }}
   */
  getSupportStatus() {
    return {
      stt: this.recognitionSupported,
      tts: this.synthesisSupported
    };
  }
}

export const speechService = new SpeechService();
