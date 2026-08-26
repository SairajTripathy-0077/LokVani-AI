import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * GeminiKeyRotator — Handles API key rotation across server and browser environments.
 */
class GeminiKeyRotator {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.keyCooldowns = new Map(); // key -> cooldown expiry timestamp
    this.initializeKeys();
  }

  initializeKeys() {
    let rawKeys = '';
    if (typeof process !== 'undefined' && process && process.env) {
      rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    }
    if (!rawKeys && typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      rawKeys = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEYS || '';
    }

    if (rawKeys) {
      this.keys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
    }

    console.log(`[GeminiKeyRotator] Initialized with ${this.keys.length} API key(s).`);
  }

  setKeys(keysArray) {
    if (Array.isArray(keysArray) && keysArray.length > 0) {
      this.keys = keysArray.map(k => k.trim()).filter(Boolean);
      this.currentIndex = 0;
      this.keyCooldowns.clear();
      console.log(`[GeminiKeyRotator] Keys updated: ${this.keys.length} key(s) available.`);
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

      // Key is in cooldown, try next
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    // All keys in cooldown — return key with earliest expiring cooldown
    let bestIndex = 0;
    let minCooldown = Infinity;
    this.keys.forEach((k, idx) => {
      const cd = this.keyCooldowns.get(k) || 0;
      if (cd < minCooldown) {
        minCooldown = cd;
        bestIndex = idx;
      }
    });

    this.currentIndex = bestIndex;
    return { key: this.keys[bestIndex], index: bestIndex };
  }

  markKeyFailed(key, errorMessage) {
    const isRateLimitOrQuota =
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('QUOTA_EXCEEDED') ||
      errorMessage.includes('403');

    // 45s cooldown for rate limits, 15s for general errors
    const cooldownMs = isRateLimitOrQuota ? 45000 : 15000;
    this.keyCooldowns.set(key, Date.now() + cooldownMs);

    const maskedKey = key.length > 8
      ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
      : '***';
    console.warn(
      `[GeminiKeyRotator] Key ${maskedKey} (Index ${this.currentIndex}) failed (${errorMessage.slice(0, 80)}). ` +
      `Rotated. Cooldown: ${cooldownMs / 1000}s.`
    );

    if (this.keys.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }
  }

  async executeWithRotation(systemPrompt, userPrompt) {
    if (this.keys.length === 0) {
      this.initializeKeys();
    }

    if (this.keys.length === 0) {
      console.log('[GeminiKeyRotator] No API keys configured. Returning null.');
      return null;
    }

    let attempts = 0;
    const maxAttempts = Math.min(this.keys.length, 5);

    while (attempts < maxAttempts) {
      const active = this.getActiveKey();
      if (!active || !active.key) break;

      const { key, index } = active;
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ model: modelName });
          const fullPrompt = `${systemPrompt}\n\nUser Query: "${userPrompt}"`;

          const response = await model.generateContent(fullPrompt);
          const text = response.response.text();

          return {
            text,
            keyIndexUsed: index,
            totalKeys: this.keys.length,
            modelUsed: modelName
          };
        } catch (err) {
          lastError = err;
          console.warn(`[GeminiKeyRotator] Key ${index} model ${modelName} notice:`, err.message ? err.message.slice(0, 90) : err);
          // Continue trying next model for this key (e.g. gemini-3.5-flash-lite has separate quota)
          continue;
        }
      }

      attempts++;
      this.markKeyFailed(key, lastError ? lastError.message : 'All model generation endpoints failed');
    }

    console.warn('[GeminiKeyRotator] All available keys or model endpoints failed.');
    return null;
  }

}

export const geminiRotator = new GeminiKeyRotator();
