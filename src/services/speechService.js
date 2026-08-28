/**
 * LokVani AI — Browser-Native Web Speech API Service
 * Handles STT (Speech-to-Text) and TTS (Text-to-Speech) with multi-dialect support.
 *
 * Voice Enhancements:
 * - Prioritizes natural female voices (Google UK/US Female, Microsoft Zira/Heera/Swara, Samantha, Victoria, Veena)
 * - Pitch tuned to 1.18 for natural female voice synthesis
 * - Continuous STT multi-sentence accumulation with auto-restart on browser pause
 * - Natural 2.5s silence gate to capture complete sentences before submitting to AI
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

    // Voice recognition session management
    this._isListening = false;
    this._manualStop = false;
    this._silenceTimer = null;
    this._accumulatedFinal = '';
    this._lastFullTranscript = '';
    this._activeOnEnd = null;

    if (this.recognitionSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
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
    if (typeof window === 'undefined' || !this.synthesisSupported) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this._cachedVoices = voices;
      this._voicesLoaded = true;
    }
  }

  getVoices() {
    if (typeof window === 'undefined' || !this.synthesisSupported) return [];
    if (!this._voicesLoaded || this._cachedVoices.length === 0) {
      this._loadVoices();
    }
    return this._cachedVoices;
  }

  selectVoice(langCode, preferredGender = 'female') {
    const voices = this.getVoices();
    if (!voices || !voices.length) return null;

    const langPrefix = langCode.split('-')[0].toLowerCase();
    const isEnglish = langPrefix === 'en';

    const femaleKeywords = [
      'female', 'zira', 'hazel', 'susan', 'heera', 'veena', 'swara', 'samantha',
      'victoria', 'karen', 'moira', 'fiona', 'neerja', 'kalpana', 'google uk english female',
      'google us english', 'natural'
    ];

    const candidates = voices.filter(v =>
      v.lang.toLowerCase() === langCode.toLowerCase() ||
      v.lang.toLowerCase().startsWith(langPrefix)
    );

    if (preferredGender === 'female') {
      const bestFemale = candidates.find(v =>
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (bestFemale) return bestFemale;

      if (isEnglish) {
        const engFemale = voices.find(v =>
          v.lang.toLowerCase().startsWith('en') &&
          femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
        );
        if (engFemale) return engFemale;
      }

      const anyFemale = voices.find(v =>
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (anyFemale && isEnglish) return anyFemale;
    }

    const exactMatch = candidates.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (exactMatch) return exactMatch;

    const prefixMatch = candidates.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    return prefixMatch || candidates[0] || null;
  }

  _splitIntoChunks(text) {
    if (!text) return [];
    const rawSentences = text.split(/(?<=[।.!?])\s+/);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of rawSentences) {
      if ((currentChunk + ' ' + sentence).trim().length > 200) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks.length > 0 ? chunks : [text];
  }

  onSpeakingStateChange(fn) {
    this._speakingListeners.add(fn);
    fn(this._isSpeaking);
    return () => this._speakingListeners.delete(fn);
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

  // ── STT (Speech-to-Text) ────────────────────────────────────────────────
  startListening(onResult, onError, onEnd = null, langCode = 'hi-IN') {
    if (typeof onEnd === 'string') {
      langCode = onEnd;
      onEnd = null;
    }

    if (!this.recognitionSupported) {
      if (onError) onError(
        'Voice recognition not supported in this browser. Please use Chrome or Edge, or use Text Input.'
      );
      return;
    }

    this.stopSpeaking();
    this.stopListening(); // Clear active session & timers

    this._isListening = true;
    this._manualStop = false;
    this._accumulatedFinal = '';
    this._lastFullTranscript = '';
    this._activeOnEnd = onEnd;

    const SILENCE_TIMEOUT_MS = 2500; // 2.5 seconds natural silence timeout

    const resetSilenceTimer = (fullText) => {
      if (this._silenceTimer) clearTimeout(this._silenceTimer);
      this._silenceTimer = setTimeout(() => {
        if (this._isListening && !this._manualStop) {
          console.log('[SpeechService] 2.5s natural silence reached. Submitting complete sentence.');
          this.stopListeningAndSubmit(fullText);
        }
      }, SILENCE_TIMEOUT_MS);
    };

    try {
      // Ensure language is valid (default to Hindi 'hi-IN')
      this.recognition.lang = langCode || 'hi-IN';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }
        }

        if (finalText.trim()) {
          this._accumulatedFinal = finalText.trim();
        }

        const fullTranscript = (this._accumulatedFinal + ' ' + interimText).trim();
        this._lastFullTranscript = fullTranscript;

        if (onResult && fullTranscript) {
          onResult({
            transcript: fullTranscript,
            finalTranscript: this._accumulatedFinal,
            interimTranscript: interimText,
            isFinal: false
          });
        }

        resetSilenceTimer(fullTranscript);
      };

      this.recognition.onerror = (event) => {
        console.warn('[SpeechService] STT error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this._isListening = false;
          if (onError) onError('Microphone access busy or denied. Please check browser microphone permissions.');
          if (this._activeOnEnd) this._activeOnEnd('');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          if (onError) onError(`Voice recognition event: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this._manualStop) {
          const finalTx = (this._lastFullTranscript || this._accumulatedFinal).trim();
          if (this._activeOnEnd) this._activeOnEnd(finalTx);
          return;
        }

        if (this._isListening) {
          try {
            console.log('[SpeechService] Auto-restarting Web Speech recognition to capture complete sentence...');
            this.recognition.start();
          } catch (err) {
            console.warn('[SpeechService] Auto-restart failed:', err.message);
            const finalTx = (this._lastFullTranscript || this._accumulatedFinal).trim();
            if (this._activeOnEnd) this._activeOnEnd(finalTx);
          }
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn('[SpeechService] Failed to start recognition:', err.message);
      if (onError) onError('Microphone access busy or denied. Please check browser microphone permissions.');
      if (onEnd) onEnd('');
    }
  }

  stopListeningAndSubmit(overrideText = null) {
    this._isListening = false;
    this._manualStop = true;
    if (this._silenceTimer) {
      clearTimeout(this._silenceTimer);
      this._silenceTimer = null;
    }
    if (this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }
    const finalTx = (overrideText !== null ? overrideText : (this._lastFullTranscript || this._accumulatedFinal)).trim();
    if (this._activeOnEnd) {
      const callback = this._activeOnEnd;
      this._activeOnEnd = null;
      callback(finalTx);
    }
  }

  stopListening() {
    this._isListening = false;
    this._manualStop = true;
    if (this._silenceTimer) {
      clearTimeout(this._silenceTimer);
      this._silenceTimer = null;
    }
    if (this.recognition) {
      try { this.recognition.abort(); } catch (_) {}
    }
  }

  // ── TTS (Text-to-Speech) ────────────────────────────────────────────────
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

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (_) {}

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (_) {}

      const voice = this.selectVoice(langCode, this.voiceGender);
      const chunks = this._splitIntoChunks(text);
      let index = 0;

      this._setSpeaking(true);

      const speakNextChunk = () => {
        if (index >= chunks.length || !this._isSpeaking) {
          this._setSpeaking(false);
          if (onEnd) onEnd();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.lang = langCode;
        utterance.rate = Math.min(Math.max(rate, 0.5), 2.0);
        utterance.pitch = pitch;
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          index++;
          speakNextChunk();
        };

        utterance.onerror = (err) => {
          if (err.error !== 'interrupted') {
            console.warn('[SpeechService] TTS error on chunk:', err.error);
          }
          this._setSpeaking(false);
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    }, 60);
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
