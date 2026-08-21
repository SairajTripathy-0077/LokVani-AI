import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiKeyRotator {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.keyCooldowns = new Map(); // key -> cooldown expiry timestamp
    this.initializeKeys();
  }

  initializeKeys() {
    let rawKeys = '';

    if (typeof process !== 'undefined' && process.env) {
      rawKeys = process.env.GEMINI_API_KEYS || process.env.VITE_GEMINI_API_KEY || '';
    }
    
    // Also check Vite import.meta.env if in browser context
    if (!rawKeys && typeof import.meta !== 'undefined' && import.meta.env) {
      rawKeys = import.meta.env.VITE_GEMINI_API_KEYS || import.meta.env.VITE_GEMINI_API_KEY || '';
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

      // Key is in cooldown, move to next
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    // All keys in cooldown, return the first one anyway
    return { key: this.keys[0], index: 0 };
  }

  markKeyFailed(key, errorMessage) {
    const isRateLimitOrQuota = 
      errorMessage.includes('429') || 
      errorMessage.includes('RESOURCE_EXHAUSTED') || 
      errorMessage.includes('QUOTA_EXCEEDED') ||
      errorMessage.includes('403');

    // 2-minute cooldown for rate limits, 30s for general errors
    const cooldownMs = isRateLimitOrQuota ? 120000 : 30000;
    this.keyCooldowns.set(key, Date.now() + cooldownMs);

    const maskedKey = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***';
    console.warn(`[GeminiKeyRotator] Key ${maskedKey} (Index ${this.currentIndex}) failed (${errorMessage}). Rotated key. Cooldown set for ${cooldownMs / 1000}s.`);

    // Advance to next key
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
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];
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
          // If the error is 404 (model not found), try the next model immediately
          if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
            continue;
          }
          break; // Stop trying models if there's a different API error (e.g. rate limit, bad key)
        }
      }

      attempts++;
      this.markKeyFailed(key, lastError ? lastError.message : 'Model generation failed');
    }

    console.warn('[GeminiKeyRotator] All available keys or model endpoints failed.');
    return null;
  }
}

export const geminiRotator = new GeminiKeyRotator();
