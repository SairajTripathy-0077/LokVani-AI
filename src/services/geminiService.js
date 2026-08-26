import { geminiRotator } from './geminiKeyRotator.js';
import { calculateDistressScore } from '../engine/distressEngine.js';

/**
 * Gemini AI Query Engine & RAG Pipeline — SERVER-SIDE ONLY.
 * High-performance RAG pipeline with in-memory caching, synonym mapping,
 * and integrated Distress Engine context enrichment.
 */

// In-memory LRU / TTL Query Cache (10-minute expiry)
const RESPONSE_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedResponse(key) {
  const cached = RESPONSE_CACHE.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    RESPONSE_CACHE.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedResponse(key, data) {
  if (RESPONSE_CACHE.size > 200) {
    const oldestKey = RESPONSE_CACHE.keys().next().value;
    RESPONSE_CACHE.delete(oldestKey);
  }
  RESPONSE_CACHE.set(key, { data, timestamp: Date.now() });
}

function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, 350);
}

// Multilingual Synonym Dictionary for RAG Retrieval
const CROP_SYNONYMS = {
  tomato: ['tamatar', 'tomato', 'टमाटर'],
  onion: ['pyaaz', 'onion', 'प्याज़', 'प्याज'],
  potato: ['aloo', 'potato', 'आलू'],
  wheat: ['gehun', 'wheat', 'गेहूं', 'गेहुं'],
  rice: ['chawal', 'rice', 'paddy', 'dhan', 'चावल', 'धान'],
  mustard: ['sarson', 'mustard', 'सरसों'],
  cotton: ['kapas', 'cotton', 'कपास']
};

function normalizeQueryCommodity(queryText) {
  const lower = queryText.toLowerCase();
  for (const [key, aliases] of Object.entries(CROP_SYNONYMS)) {
    if (aliases.some(alias => lower.includes(alias))) {
      return key;
    }
  }
  return null;
}

// System prompt with strict JSON output contract
const SYSTEM_PROMPT = `
You are LokVani AI for Indian farmers, street vendors & artisans.
Respond in valid JSON only (no markdown fences, no extra text):

Schema:
{
  "short_answer_hi": "35-50 words TTS Hindi in Devanagari",
  "short_answer_en": "35-50 words English translation",
  "detailed_answer_hi": "80-140 words detailed Hindi",
  "detailed_answer_en": "80-140 words detailed English",
  "confidence": "HIGH | MEDIUM | LOW",
  "follow_up_questions": ["q1", "q2"],
  "domain": "GOVT_SCHEME | MARKET_PRICE | AGRI_ADVISORY | WEATHER",
  "is_high_stakes": boolean (true for loans, scheme apps, chemical pesticides, medical/legal),
  "risk_category": "FINANCIAL_ELIGIBILITY | PESTICIDE_SAFETY | FINANCIAL_LOAN | NONE",
  "trust_note": "string explaining trust/verification need",
  "actionable_steps": ["step 1", "step 2"]
}
If a dialect is requested, use that dialect/script where possible.
`;

/**
 * Filter and format RAG intel context with semantic synonym matching.
 */
function buildTokenOptimizedIntelContext(query, communityIntel) {
  if (!Array.isArray(communityIntel) || communityIntel.length === 0) {
    return '';
  }

  const normalizedCrop = normalizeQueryCommodity(query);
  const lowerQuery = query.toLowerCase();

  // Filter items matching query words or normalized crop synonym
  const relevant = communityIntel.filter(i => {
    if (!i.item) return false;
    const itemLower = i.item.toLowerCase();
    if (normalizedCrop && itemLower.includes(normalizedCrop)) return true;
    return lowerQuery.includes(itemLower.split(' ')[0]);
  });

  const selected = relevant.length > 0 ? relevant.slice(0, 4) : communityIntel.slice(0, 3);
  const formatted = selected.map(i => `${i.item}: ₹${i.price}/${i.unit || 'kg'} (${i.location || 'Mandi'})`).join('; ');
  return `Market Data: ${formatted}`;
}

/**
 * RAG Context Builder incorporating Distress Engine calculations when applicable.
 */
function buildDistressContext(queryText) {
  const lower = queryText.toLowerCase();
  const mentionsDistress = lower.includes('loan') || lower.includes('karja') || lower.includes('drought') ||
    lower.includes('sookha') || lower.includes('barish kam') || lower.includes('kharab') || lower.includes('nuksan');

  if (!mentionsDistress) return '';

  const crop = normalizeQueryCommodity(queryText) || 'wheat';
  const scoreResult = calculateDistressScore({
    rainfallDeviationPct: lower.includes('sookha') || lower.includes('barish kam') ? -35 : -15,
    priceDropPct: lower.includes('bhav') || lower.includes('rate') ? -20 : -10,
    daysToLoanDue: lower.includes('loan') || lower.includes('karja') ? 14 : null,
    cropType: crop,
    cropStage: 'vegetative'
  });

  return `Distress Model Assessment: Risk Score=${scoreResult.score}/100 (${scoreResult.tier} TIER). Key Reasons: ${scoreResult.reasons.join('; ')}.`;
}

export async function processVoiceQuery(queryText, communityIntel = [], weatherData = null, dialect = null) {
  const safeQuery = sanitizeInput(queryText);
  if (!safeQuery) {
    throw new Error('Invalid or empty query after sanitization.');
  }

  // 1. Check in-memory response cache
  const cacheKey = `${safeQuery.toLowerCase()}_${dialect || 'hi'}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return {
      ...cached,
      isCached: true,
      latencyMs: 3
    };
  }

  // 2. Build RAG Context blocks
  const intelContext = buildTokenOptimizedIntelContext(safeQuery, communityIntel);

  const weatherContext = weatherData
    ? `Weather (${weatherData.city || 'Azamgarh'}): ${weatherData.temp}°C, ${weatherData.condition}, Rain: ${weatherData.precipitation}mm.`
    : '';

  const dialectContext = dialect && dialect !== 'hi' && dialect !== 'en'
    ? `Dialect: ${dialect}.`
    : '';

  const distressContext = buildDistressContext(safeQuery);

  const contextBlocks = [intelContext, weatherContext, dialectContext, distressContext].filter(Boolean).join(' ');
  const fullSystemContext = `${SYSTEM_PROMPT.trim()}\n${contextBlocks ? 'Context: ' + contextBlocks : ''}`;

  const startTime = Date.now();
  const rotatedResult = await geminiRotator.executeWithRotation(fullSystemContext, safeQuery);

  if (rotatedResult && rotatedResult.text) {
    try {
      const cleanJson = rotatedResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      const finalResult = {
        ...parsed,
        apiKeyIndexUsed: rotatedResult.keyIndexUsed,
        modelUsed: rotatedResult.modelUsed,
        latencyMs: Date.now() - startTime
      };

      // Cache successful response
      setCachedResponse(cacheKey, finalResult);
      return finalResult;
    } catch (_) {
      throw new Error('AI response formatting error. Please try again.');
    }
  }

  throw new Error('AI service temporarily unavailable.');
}
