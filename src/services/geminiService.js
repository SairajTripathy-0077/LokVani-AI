import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiRotator } from './geminiKeyRotator.js';

/**
 * Gemini AI Query Engine & Risk Classifier Service
 * Evaluates queries, retrieves domain knowledge, and tags high-stakes responses for Kirana Trust Node review.
 */

const SYSTEM_PROMPT = `
You are LokVani AI, an inclusive voice AI assistant for small farmers, street vendors, and artisans in India.
Analyze the user's voice query and provide a clear, concise response in simple Hindi (Devanagari script) and English translation.

Rules:
1. Provide a short_answer_hi (max 25-35 words, suitable for voice TTS playback).
2. Provide a short_answer_en (English translation).
3. Classify domain: "GOVT_SCHEME", "MARKET_PRICE", "AGRI_ADVISORY", or "WEATHER".
4. Determine is_high_stakes (boolean):
   - Set to TRUE if query involves government scheme eligibility, document application, pesticide/chemical dosage, or loan/financial commitments.
   - Set to FALSE if query is simple market price lookup, general weather forecast, or general crop care tips.
5. Provide actionable_steps (array of 2-3 short bullet points).

Return ONLY valid JSON matching this schema:
{
  "short_answer_hi": "string",
  "short_answer_en": "string",
  "domain": "GOVT_SCHEME | MARKET_PRICE | AGRI_ADVISORY | WEATHER",
  "is_high_stakes": boolean,
  "risk_category": "FINANCIAL_ELIGIBILITY | PESTICIDE_SAFETY | FINANCIAL_LOAN | NONE",
  "trust_note": "string explaining why review is suggested",
  "actionable_steps": ["step 1", "step 2"]
}
`;

export async function processVoiceQuery(queryText, communityIntel = [], weatherData = null, customApiKey = null) {
  // Build context string from community intelligence feed
  const intelContext = Array.isArray(communityIntel) && communityIntel.length > 0
    ? `Recent community reports: ${communityIntel.map(i => `${i.item}: ₹${i.price}/${i.unit || 'kg'} at ${i.location}`).join(', ')}.`
    : 'No recent community reports.';

  const weatherContext = weatherData
    ? `Current Live Weather for ${weatherData.city || 'Azamgarh'}: Temperature: ${weatherData.temp}°C, Condition: ${weatherData.condition}, Precipitation sum: ${weatherData.precipitation}mm. Advisory: ${weatherData.advisory_en || ''}`
    : 'No live weather telemetry available.';

  const systemContext = `${SYSTEM_PROMPT}\n\nContext:\n${intelContext}\n${weatherContext}`;

  if (customApiKey) {
    geminiRotator.setKeys([customApiKey]);
  }

  // Attempt processing with Rotator Pool
  const rotatedResult = await geminiRotator.executeWithRotation(systemContext, queryText);

  if (rotatedResult && rotatedResult.text) {
    try {
      const cleanJson = rotatedResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        ...parsed,
        apiKeyIndexUsed: rotatedResult.keyIndexUsed,
        modelUsed: rotatedResult.modelUsed
      };
    } catch (err) {
      throw new Error(`[GeminiService] Failed to parse JSON response from Gemini API: ${err.message}`);
    }
  }

  throw new Error('[GeminiService] All Gemini API keys in the rotator pool failed or returned empty response.');
}
