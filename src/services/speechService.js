/**
 * LokVani AI — Browser-Native Web Speech API Service
 * Handles STT (Speech-to-Text) and TTS (Text-to-Speech) with multi-dialect support.
 *
 * Voice Enhancements:
 * - Prioritizes natural female voices (Google UK/US Female, Microsoft Zira/Heera/Swara, Samantha, Victoria, Veena)
 * - Pitch tuned to 1.18 for natural female voice synthesis
 * - Splits long TTS text into sentence-sized chunks queued sequentially
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
    this.voiceGender = 'female'; // Default to female voice

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

  /**
   * Select a high-quality female voice matching the target language.
   * Priority: explicit female voice in target locale → female voice in lang family → fallback
   */
  selectVoice(langCode, preferredGender = 'female') {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const langPrefix = langCode.split('-')[0].toLowerCase();
    const isEnglish = langPrefix === 'en';

    // Female voice identifiers across Windows, macOS, iOS, Android, and Chrome
    const femaleKeywords = [
      'female', 'zira', 'hazel', 'susan', 'heera', 'veena', 'swara', 'samantha',
      'victoria', 'karen', 'moira', 'fiona', 'neerja', 'kalpana', 'google uk english female',
      'google us english', 'natural'
    ];

    // Filter candidate voices for requested locale or language family
    const candidates = voices.filter(v =>
      v.lang.toLowerCase() === langCode.toLowerCase() ||
      v.lang.toLowerCase().startsWith(langPrefix)
    );

    if (preferredGender === 'female') {
      // 1. Look for explicit female voice in requested language candidates
      const femaleMatch = candidates.find(v =>
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (femaleMatch) return femaleMatch;

      // 2. If English, search all English female voices across regions (UK, US, IN, AU)
      if (isEnglish) {
        const enFemale = voices.find(v =>
          v.lang.toLowerCase().startsWith('en') &&
          femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
        );
        if (enFemale) return enFemale;
      }

      // 3. Look for any voice with 'female' in description/name anywhere
      const anyFemale = voices.find(v =>
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (anyFemale && isEnglish) return anyFemale;
    }

    // Fallback: exact locale match → language prefix match → first candidate
    const exact = candidates.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (exact) return exact;

    const family = candidates.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (family) return family;

    return candidates[0] || null;
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
  speakText(text, langCode = 'hi-IN', onEnd = null, rate = 0.92, pitch = 1.18) {
    if (!this.synthesisSupported) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    // Select female voice for speech synthesis
    const voice = this.selectVoice(langCode, this.voiceGender);
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
      // Pitch tuned to 1.18 for female voice tone
      utterance.pitch = pitch;

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

  speak(text, langCode = 'hi-IN', onEnd = null, rate = 0.92, pitch = 1.18) {
    return this.speakText(text, langCode, onEnd, rate, pitch);
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
