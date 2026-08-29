import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Timeout wrapper helper for sub-second AI responses.
 */
function withTimeout(promise, ms = 3500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI response timeout (3.5s limit)')), ms))
  ]);
}

/**
 * GeminiKeyRotator — Ultra-fast multi-key rotation and model failover engine.
 */
class GeminiKeyRotator {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.keyCooldowns = new Map();
    this.initializeKeys();
  }

  initializeKeys() {
    let rawKeys = '';

    if (typeof process !== 'undefined' && process && process.env) {
      rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    }

    if (!rawKeys && typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      rawKeys = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEYS || '';
    }

    if (rawKeys) {
      this.keys = rawKeys
        .split(',')
        .map(k => k.replace(/["']/g, '').trim())
        .filter(k => k.length > 10);
    }

    this.keys = [...new Set(this.keys)];
    console.log(`[GeminiKeyRotator] Initialized with ${this.keys.length} valid API key(s).`);
  }

  setKeys(keysArray) {
    if (Array.isArray(keysArray) && keysArray.length > 0) {
      this.keys = [...new Set(keysArray.map(k => k.replace(/["']/g, '').trim()).filter(k => k.length > 10))];
      this.currentIndex = 0;
      this.keyCooldowns.clear();
    }
  }

  getActiveKey() {
    if (this.keys.length === 0) {
      this.initializeKeys();
    }
    if (this.keys.length === 0) return null;

    const now = Date.now();
    let attempts = 0;

    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex];
      const cooldownUntil = this.keyCooldowns.get(key) || 0;

      if (now >= cooldownUntil) {
        return { key, index: this.currentIndex };
      }

      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    this.keyCooldowns.clear();
    return { key: this.keys[0], index: 0 };
  }

  markKeyFailed(key, errorMessage) {
    const msg = (errorMessage || '').toLowerCase();
    const isRateLimitOrQuota =
      msg.includes('429') ||
      msg.includes('resource_exhausted') ||
      msg.includes('quota_exceeded') ||
      msg.includes('403') ||
      msg.includes('api_key_invalid');

    const cooldownMs = isRateLimitOrQuota ? 30000 : 10000;
    this.keyCooldowns.set(key, Date.now() + cooldownMs);

    if (this.keys.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }
  }

  async executeWithRotation(systemPrompt, userPrompt) {
    if (this.keys.length === 0) {
      this.initializeKeys();
    }

    if (this.keys.length === 0) {
      console.warn('[GeminiKeyRotator] No API keys configured.');
      return null;
    }

    let attempts = 0;
    const maxAttempts = Math.min(this.keys.length, 3);

    // Fast working Gemini models
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest'
    ];

    while (attempts < maxAttempts) {
      const active = this.getActiveKey();
      if (!active || !active.key) break;

      const { key, index } = active;
      let keySuccess = false;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ model: modelName });
          const fullPrompt = `${systemPrompt}\n\nUser Query: "${userPrompt}"`;

          const response = await withTimeout(model.generateContent(fullPrompt), 3500);
          const text = response.response.text();

          if (text && text.trim()) {
            keySuccess = true;
            return {
              text,
              keyIndexUsed: index,
              totalKeys: this.keys.length,
              modelUsed: modelName
            };
          }
        } catch (err) {
          lastError = err;
          const errStr = (err.message || '').toLowerCase();

          if (errStr.includes('404') || errStr.includes('not found') || errStr.includes('timeout')) {
            continue;
          }

          if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('403')) {
            break;
          }
        }
      }

      if (!keySuccess) {
        attempts++;
        this.markKeyFailed(key, lastError ? lastError.message : 'Model generation failed');
      }
    }

    console.warn('[GeminiKeyRotator] All available Gemini keys/models failed or timed out.');
    return null;
  }
}

export const geminiRotator = new GeminiKeyRotator();
