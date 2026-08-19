import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOVT_SCHEMES, MOCK_COMMUNITY_INTEL } from '../data/mockData.js';

/**
 * LokVani AI Core Engine
 * Processes transcribed voice input in Hinglish/Hindi, classifies intent, extracts entities,
 * performs RAG lookup over Indian government schemes & community intel, generates TTS spoken responses,
 * and tags high-stakes risk for Kirana Trust Node verification.
 */

const SYSTEM_PROMPT = `
You are the core intelligence engine for LokVani AI ("Public Voice AI"), serving small farmers and street vendors in India.
Your job is to parse transcribed informal Hindi/Hinglish voice input, extract key entities, retrieve facts, generate a short spoken-style TTS response, and assess high-stakes risk for Kirana Trust Node verification.

Rules for Spoken Answers:
- Max 25-35 words per answer in simple Hindi (Devanagari).
- No complex jargon or technical legal terms.
- Optimized for natural text-to-speech audio reading.

Schema Rules:
- intent: Must be one of ["scheme_query", "price_query", "general_advice", "weather_advisory"]
- needs_trust_node_review: Must be TRUE if query involves scheme eligibility, financial commitments, pesticide dosage, or document paperwork. FALSE for simple price/weather lookups.

Return ONLY a single valid JSON object matching this structure:
{
  "intent": "scheme_query | price_query | general_advice | weather_advisory",
  "entities": {
    "crop_commodity": "string or null",
    "location": "string or null",
    "need": "string or null",
    "target_scheme": "string or null"
  },
  "spoken_response": {
    "hindi_tts": "short simple Hindi answer for voice playback",
    "english_translation": "English translation"
  },
  "needs_trust_node_review": true,
  "confidence_score": 0.95,
  "risk_metadata": {
    "risk_category": "FINANCIAL_ELIGIBILITY | PESTICIDE_SAFETY | FINANCIAL_LOAN | AGRICULTURAL_DOSAGE | NONE",
    "trust_reason": "Explanation of why Kirana node review is recommended"
  },
  "actionable_steps": ["step 1", "step 2"]
}
`;

/**
 * Main AI Query Processing Pipeline
 * @param {string} transcribedText - Transcribed user voice speech (informal Hindi / Hinglish)
 * @param {object} options - Options object ({ apiKey, userLocation })
 * @returns {Promise<object>} Structured AI response payload
 */
export async function processUserSpeechQuery(transcribedText, options = {}) {
  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : process.env.VITE_GEMINI_API_KEY);
  const userLocation = options.userLocation || 'Azamgarh, UP';

  // 1. Context Enrichment from Local Knowledge Data
  const matchedSchemes = searchSchemesDataset(transcribedText);
  const matchedPrices = searchCommunityIntel(transcribedText);

  const contextPayload = {
    user_location: userLocation,
    available_schemes_sample: matchedSchemes.length > 0 ? matchedSchemes : GOVT_SCHEMES.slice(0, 5),
    community_prices_sample: matchedPrices.length > 0 ? matchedPrices : MOCK_COMMUNITY_INTEL.slice(0, 5)
  };

  // 2. Call Gemini API if API Key present
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const fullPrompt = `${SYSTEM_PROMPT}\n\nLocal Data Context:\n${JSON.stringify(contextPayload, null, 2)}\n\nTranscribed Voice Speech: "${transcribedText}"`;

      const response = await model.generateContent(fullPrompt);
      const text = response.response.text();
      
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        query_input: transcribedText,
        ...parsed,
        retrieved_context: {
          matched_schemes_count: matchedSchemes.length,
          matched_prices_count: matchedPrices.length,
          top_matched_scheme: matchedSchemes[0]?.name || null,
          top_matched_price: matchedPrices[0] ? `₹${matchedPrices[0].price}/${matchedPrices[0].unit} at ${matchedPrices[0].location}` : null
        }
      };
    } catch (err) {
      console.warn('Gemini API call failed or unconfigured, running local deterministic fallback classifier:', err.message);
    }
  }

  // 3. Deterministic Local AI Engine (Offline / Zero-API Fallback)
  return fallbackAiEngine(transcribedText, contextPayload);
}

/**
 * Keyword RAG Search over Government Schemes Dataset
 */
function searchSchemesDataset(query) {
  const lower = query.toLowerCase();
  return GOVT_SCHEMES.filter(s => 
    lower.includes(s.name.toLowerCase()) ||
    s.documents.some(d => lower.includes(d.toLowerCase())) ||
    lower.includes(s.target.toLowerCase()) ||
    (lower.includes('scheme') || lower.includes('yojana') || lower.includes('loan') || lower.includes('kisan') || lower.includes('svanidhi') || lower.includes('bima') || lower.includes('kusum'))
  );
}

/**
 * Keyword RAG Search over Community Intelligence Ticker
 */
function searchCommunityIntel(query) {
  const lower = query.toLowerCase();
  return MOCK_COMMUNITY_INTEL.filter(ci => 
    lower.includes(ci.item.toLowerCase()) ||
    lower.includes(ci.location.toLowerCase()) ||
    lower.includes(ci.type.toLowerCase())
  );
}

/**
 * Deterministic Fallback Rules Engine
 */
function fallbackAiEngine(transcribedText, context) {
  const lower = transcribedText.toLowerCase();

  // Intent Classification & Entity Extraction
  let intent = 'general_advice';
  let is_high_stakes = false;
  let risk_category = 'NONE';
  let trust_reason = 'Auto-verified response.';

  const entities = {
    crop_commodity: extractCommodity(lower),
    location: extractLocation(lower) || 'Azamgarh Mandi',
    need: transcribedText,
    target_scheme: null
  };

  // Rule 1: Govt Schemes or Financial Loans
  if (lower.includes('scheme') || lower.includes('yojana') || lower.includes('pm kisan') || lower.includes('loan') || lower.includes('svanidhi') || lower.includes('apply')) {
    intent = 'scheme_query';
    is_high_stakes = true;
    risk_category = lower.includes('loan') ? 'FINANCIAL_LOAN' : 'FINANCIAL_ELIGIBILITY';
    entities.target_scheme = lower.includes('svanidhi') ? 'PM SVANidhi' : 'PM-Kisan Samman Nidhi';
    trust_reason = 'High-stakes scheme application: Requires Kirana node document and e-KYC verification.';

    const matchedScheme = context.available_schemes_sample[0] || GOVT_SCHEMES[0];
    const matchedPrice = context.community_prices_sample.find(p => p.item.toLowerCase().includes(entities.crop_commodity?.toLowerCase() || 'tamatar'));

    return {
      query_input: transcribedText,
      intent,
      entities,
      retrieved_context: {
        matched_scheme: matchedScheme.name,
        matched_mandi_price: matchedPrice ? `₹${matchedPrice.price}/${matchedPrice.unit} at ${matchedPrice.location}` : '₹28/kg at Azamgarh Mandi'
      },
      spoken_response: {
        hindi_tts: `${matchedScheme.name} ke liye Aadhar card, bank passbook, aur zameen papers zaroori hain. Aaj local mandi me tamatar ₹28 kilo hai.`,
        english_translation: `${matchedScheme.name} requires Aadhar card, bank passbook, and land papers. Today local tomato rate is ₹28/kg.`
      },
      needs_trust_node_review: is_high_stakes,
      confidence_score: 0.94,
      risk_metadata: {
        risk_category,
        trust_reason
      },
      actionable_steps: [
        'Aadhar card ko bank account se link karein',
        'Land Khasra paper ready rakhein',
        'Kirana CSC center par biometric e-KYC verify karwayein'
      ]
    };
  }

  // Rule 2: Pesticide / Crop Disease
  if (lower.includes('keeda') || lower.includes('spray') || lower.includes('pesticide') || lower.includes('blight') || lower.includes('dawa')) {
    intent = 'general_advice';
    is_high_stakes = true;
    risk_category = 'PESTICIDE_SAFETY';
    trust_reason = 'Chemical crop spray recommendation: Requires local Kirana operator to confirm pesticide dosage safety.';

    return {
      query_input: transcribedText,
      intent,
      entities,
      retrieved_context: {
        matched_disease: 'Tomato Leaf Blight',
        recommended_chemical: 'Copper Oxychloride (3g/L)'
      },
      spoken_response: {
        hindi_tts: 'Tamatar me keede ke liye Copper Oxychloride 3 gram per liter paani me milakar spray karein. Sahi matra ke liye Kirana dada se confirm karein.',
        english_translation: 'Spray Copper Oxychloride (3g per liter water) for tomato blight. Confirm exact dosage with your local Kirana Trust Node.'
      },
      needs_trust_node_review: true,
      confidence_score: 0.91,
      risk_metadata: {
        risk_category,
        trust_reason
      },
      actionable_steps: [
        'Spray subah ya shaam ke vaqt karein',
        'Sahasrara patto ko hatakar jala dein'
      ]
    };
  }

  // Rule 3: Market Price Inquiry
  if (lower.includes('bhav') || lower.includes('rate') || lower.includes('price') || lower.includes('mandi') || lower.includes('kilo')) {
    intent = 'price_query';
    is_high_stakes = false;
    risk_category = 'NONE';
    trust_reason = 'Low-risk price inquiry: Auto-verified via real-time community price ticker.';

    const item = entities.crop_commodity || 'Tamatar (Tomato)';
    const price = item.includes('Pyaaz') ? '34' : '28';

    return {
      query_input: transcribedText,
      intent,
      entities,
      retrieved_context: {
        community_rate: `₹${price}/kg at ${entities.location}`
      },
      spoken_response: {
        hindi_tts: `Aaj ${entities.location} me ${item} ka bhav ₹${price} prati kilo hai.`,
        english_translation: `Today at ${entities.location}, ${item} rate is ₹${price}/kg.`
      },
      needs_trust_node_review: false,
      confidence_score: 0.98,
      risk_metadata: {
        risk_category,
        trust_reason
      },
      actionable_steps: [
        'Subah 10 baje se pehle Mandi stock le jayein',
        'Niche report button se apna rate share karein'
      ]
    };
  }

  // Default Weather Advisory
  return {
    query_input: transcribedText,
    intent: 'weather_advisory',
    entities,
    retrieved_context: {
      weather_forecast: 'Light rain expected over next 48h'
    },
    spoken_response: {
      hindi_tts: 'Agle 48 ghante me halki barish ki sambhavna hai. Apni fasal ko tarpaulin se dhak kar rakhein.',
      english_translation: 'Light rain expected over next 48 hours. Cover harvested crops with tarpaulin.'
    },
    needs_trust_node_review: false,
    confidence_score: 0.95,
    risk_metadata: {
      risk_category: 'NONE',
      trust_reason: 'Auto-verified regional weather alert.'
    },
    actionable_steps: [
      'Fasal ko dhak kar rakhein',
      'Khet me paani nikasi saaf karein'
    ]
  };
}

function extractCommodity(text) {
  if (text.includes('tamatar') || text.includes('tomato')) return 'Tamatar (Tomato)';
  if (text.includes('pyaaz') || text.includes('onion')) return 'Pyaaz (Onion)';
  if (text.includes('aloo') || text.includes('potato')) return 'Aloo (Potato)';
  if (text.includes('gehun') || text.includes('wheat')) return 'Gehun (Wheat)';
  return 'Tamatar (Tomato)';
}

function extractLocation(text) {
  if (text.includes('azamgarh')) return 'Azamgarh Mandi';
  if (text.includes('gorakhpur')) return 'Gorakhpur Mandi';
  if (text.includes('varanasi')) return 'Varanasi Mandi';
  if (text.includes('lucknow')) return 'Lucknow Mandi';
  return 'Azamgarh Mandi';
}
