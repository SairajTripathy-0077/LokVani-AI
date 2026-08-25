/**
 * LokVani AI — Browser-Native Web Speech API Service
 * Handles STT (Speech-to-Text) and TTS (Text-to-Speech) with multi-dialect support.
 *
 * Improvements:
 * - Fixes Chrome/Edge getVoices() empty-list bug via voiceschanged event + caching
 * - Splits long TTS text into sentence-sized chunks queued sequentially (avoids truncation)
 * - Smarter voice selection: exact locale → language-family → default
 * - Exposes playback speed (rate) control
 * - Pub/Sub speaking state listeners for instant UI sync & stopping voice playback
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognitionSupported = !!SpeechRecognition;
    this.synthesisSupported = 'speechSynthesis' in window;
    this.recognition = null;

    this._cachedVoices = [];
    this._voicesLoaded = false;
    this._isSpeaking = false;
    this._speakingListeners = new Set();

    if (this.recognitionSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }

    if (this.synthesisSupported) {
      this._loadVoices();
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

  selectVoice(langCode) {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const langPrefix = langCode.split('-')[0].toLowerCase();
    const exact = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (exact) return exact;

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

  // ── Listener Subscription ──────────────────────────────────────────────
  onSpeakingStateChange(listener) {
    this._speakingListeners.add(listener);
    // Send initial state
    listener(this._isSpeaking);
    return () => this._speakingListeners.delete(listener);
  }

  _setSpeaking(val) {
    if (this._isSpeaking !== val) {
      this._isSpeaking = val;
      this._speakingListeners.forEach(fn => fn(val));
    }
  }

  isSpeaking() {
    return this._isSpeaking || (this.synthesisSupported && window.speechSynthesis.speaking);
  }

  // ── STT ─────────────────────────────────────────────────────────────────
  startListening(onResult, onError, langCode = 'hi-IN') {
    if (!this.recognitionSupported) {
      if (onError) onError(
        'Voice recognition not supported in this browser. Please use Chrome or Edge, or use Demo Presets.'
      );
      return;
    }

    // Stop speaking if currently outputting voice
    this.stopSpeaking();

    try {
      this.recognition.lang = langCode;

      this.recognition.onresult = (event) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        if (onResult) onResult({ transcript, isFinal });
      };

      this.recognition.onerror = (event) => {
        console.warn('[SpeechService] STT error:', event.error);
        if (onError && event.error !== 'no-speech') {
          onError(`Voice recognition error: ${event.error}`);
        }
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

  // ── TTS ─────────────────────────────────────────────────────────────────
  speakText(text, langCode = 'hi-IN', onEnd = null, rate = 0.92) {
    if (!this.synthesisSupported) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    const voice = this.selectVoice(langCode);
    const chunks = this._splitIntoChunks(text);
    let chunkIndex = 0;

    this._setSpeaking(true);

    const speakNext = () => {
      if (chunkIndex >= chunks.length || !this._isSpeaking) {
        this._setSpeaking(false);
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
        if (e.error !== 'interrupted') {
          console.warn('[SpeechService] TTS error on chunk:', e.error);
        }
        this._setSpeaking(false);
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
    this._setSpeaking(false);
  }

  getSupportStatus() {
    return {
      stt: this.recognitionSupported,
      tts: this.synthesisSupported
    };
  }
}

export const speechService = new SpeechService();
