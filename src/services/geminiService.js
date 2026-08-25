import { geminiRotator } from './geminiKeyRotator.js';

/**
 * Gemini AI Query Engine — SERVER-SIDE ONLY.
 * Evaluates voice queries with optimized token context & concise prompt engineering.
 */

function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, 350);
}

// Compact, token-optimized system prompt
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
 * Filter intel context to only relevant or top 4 entries to minimize token consumption.
 */
function buildTokenOptimizedIntelContext(query, communityIntel) {
  if (!Array.isArray(communityIntel) || communityIntel.length === 0) {
    return '';
  }

  const lowerQuery = query.toLowerCase();

  // 1. Filter items matching query words
  const relevant = communityIntel.filter(i =>
    i.item && lowerQuery.includes(i.item.toLowerCase().split(' ')[0])
  );

  // 2. If relevant items found, use them (max 4); otherwise take top 3 overall
  const selected = relevant.length > 0 ? relevant.slice(0, 4) : communityIntel.slice(0, 3);

  const formatted = selected.map(i => `${i.item}: ₹${i.price}/${i.unit || 'kg'} (${i.location || 'Mandi'})`).join('; ');
  return `Market Data: ${formatted}`;
}

export async function processVoiceQuery(queryText, communityIntel = [], weatherData = null, dialect = null) {
  const safeQuery = sanitizeInput(queryText);
  if (!safeQuery) {
    throw new Error('Invalid or empty query after sanitization.');
  }

  // Token-optimized context generation
  const intelContext = buildTokenOptimizedIntelContext(safeQuery, communityIntel);

  const weatherContext = weatherData
    ? `Weather (${weatherData.city || 'Azamgarh'}): ${weatherData.temp}°C, ${weatherData.condition}, Rain: ${weatherData.precipitation}mm.`
    : '';

  const dialectContext = dialect && dialect !== 'hi' && dialect !== 'en'
    ? `Dialect: ${dialect}.`
    : '';

  const contextBlocks = [intelContext, weatherContext, dialectContext].filter(Boolean).join(' ');
  const fullSystemContext = `${SYSTEM_PROMPT.trim()}\n${contextBlocks ? 'Context: ' + contextBlocks : ''}`;

  const rotatedResult = await geminiRotator.executeWithRotation(fullSystemContext, safeQuery);

  if (rotatedResult && rotatedResult.text) {
    try {
      const cleanJson = rotatedResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        ...parsed,
        apiKeyIndexUsed: rotatedResult.keyIndexUsed,
        modelUsed: rotatedResult.modelUsed
      };
    } catch (_) {
      throw new Error('AI response formatting error. Please try again.');
    }
  }

  throw new Error('AI service temporarily unavailable.');
}
