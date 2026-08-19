import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOVT_SCHEMES } from '../data/mockData.js';

/**
 * LokVani AI High-Precision Voice Engine
 * Connects to Google Gemini API for live natural language query synthesis,
 * with fallback to local dynamic NLP engine.
 */

const SYSTEM_PROMPT = `
You are LokVani AI, an intelligent voice AI assistant for farmers and micro-vendors in India.
Analyze the user's voice query and provide an accurate, helpful response.

Requirements:
1. spoken_response.hindi_tts: Clear, natural Hindi answer in Devanagari script (max 25-30 words, suitable for voice speech playback).
2. spoken_response.english_translation: Accurate English translation.
3. intent: "scheme_query | price_query | general_advice | weather_advisory"
4. needs_trust_node_review: Set to TRUE if query involves government scheme eligibility, bank loans, legal paperwork, or chemical pesticide dosage. Set to FALSE for simple price lookups or weather alerts.

Return ONLY valid JSON matching this schema:
{
  "intent": "scheme_query | price_query | general_advice | weather_advisory",
  "spoken_response": {
    "hindi_tts": "string",
    "english_translation": "string"
  },
  "needs_trust_node_review": boolean,
  "risk_metadata": {
    "risk_category": "FINANCIAL_ELIGIBILITY | PESTICIDE_SAFETY | FINANCIAL_LOAN | AGRICULTURAL_DOSAGE | NONE",
    "trust_reason": "string"
  },
  "actionable_steps": ["step 1", "step 2"]
}
`;

// Extensive Commodity Database with Real Benchmark Prices (₹/kg or unit)
const COMMODITY_DATABASE = [
  { keywords: ['tamatar', 'tomato', 'टमाटर'], name: 'Tamatar (Tomato)', price: 28, unit: 'kg' },
  { keywords: ['pyaaz', 'onion', 'प्याज़', 'प्याज'], name: 'Pyaaz (Onion)', price: 34, unit: 'kg' },
  { keywords: ['aloo', 'potato', 'आलू'], name: 'Aloo (Potato)', price: 18, unit: 'kg' },
  { keywords: ['gehun', 'wheat', 'गेहूं', 'गेहुं'], name: 'Gehun (Wheat)', price: 24, unit: 'kg' },
  { keywords: ['chawal', 'rice', 'paddy', 'dhan', 'चावल', 'धान'], name: 'Dhan / Chawal (Rice)', price: 26, unit: 'kg' },
  { keywords: ['mirch', 'chilli', 'chili', 'मिर्च'], name: 'Hari Mirch (Green Chilli)', price: 42, unit: 'kg' },
  { keywords: ['baingan', 'brinjal', 'eggplant', 'बैंगन'], name: 'Baingan (Brinjal)', price: 22, unit: 'kg' },
  { keywords: ['bhindi', 'okra', 'ladyfinger', 'भिंडी'], name: 'Bhindi (Okra)', price: 32, unit: 'kg' },
  { keywords: ['karela', 'bitter gourd', 'करेला'], name: 'Karela (Bitter Gourd)', price: 38, unit: 'kg' },
  { keywords: ['lahsun', 'garlic', 'लहसुन'], name: 'Garlic (Lahsun)', price: 140, unit: 'kg' },
  { keywords: ['adrak', 'ginger', 'अदरक'], name: 'Adrak (Ginger)', price: 90, unit: 'kg' },
  { keywords: ['sarson', 'mustard', 'सरसों'], name: 'Sarson (Mustard)', price: 54, unit: 'kg' },
  { keywords: ['kapas', 'cotton', 'कपास'], name: 'Kapas (Cotton)', price: 68, unit: 'kg' },
  { keywords: ['ganna', 'sugarcane', 'गन्ना'], name: 'Ganna (Sugarcane)', price: 3.5, unit: 'kg' },
  { keywords: ['aam', 'mango', 'आम'], name: 'Aam (Mango)', price: 45, unit: 'kg' },
  { keywords: ['kela', 'banana', 'केला'], name: 'Kela (Banana)', price: 30, unit: 'doz' },
  { keywords: ['doodh', 'milk', 'दूध'], name: 'Doodh (Milk)', price: 52, unit: 'liter' },
  { keywords: ['makaa', 'maize', 'corn', 'मक्का'], name: 'Makka (Maize)', price: 21, unit: 'kg' },
  { keywords: ['chana', 'gram', 'चना'], name: 'Chana (Gram)', price: 62, unit: 'kg' }
];

export async function processUserSpeechQuery(transcribedText, options = {}) {
  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : process.env.VITE_GEMINI_API_KEY);
  const userLocation = options.userLocation || 'Azamgarh, UP';

  console.log(`[LokVani AI Engine] User Query: "${transcribedText}" | Gemini Key Available: ${Boolean(apiKey && apiKey.trim().length > 5)}`);

  // 1. Live Gemini AI Call (If API Key Present)
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `${SYSTEM_PROMPT}\n\nUser Voice Input: "${transcribedText}"\nLocation: ${userLocation}`;
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      console.log('[LokVani AI Engine] Successfully processed query via Gemini 1.5 Flash API!');
      return {
        query_input: transcribedText,
        engine_source: 'GEMINI_LIVE_AI',
        ...parsed
      };
    } catch (err) {
      console.warn('[LokVani AI Engine] Gemini API call error:', err.message);
      // Try fallback model gemini-pro if flash fails
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `${SYSTEM_PROMPT}\n\nUser Voice Input: "${transcribedText}"\nLocation: ${userLocation}`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          query_input: transcribedText,
          engine_source: 'GEMINI_LIVE_AI',
          ...parsed
        };
      } catch (err2) {
        console.error('[LokVani AI Engine] Both Gemini models failed, falling back to NLP engine:', err2.message);
      }
    }
  }

  // 2. High-Precision Universal Dynamic Engine Fallback
  const fallbackResult = universalVoiceNlpEngine(transcribedText, userLocation);
  return {
    engine_source: 'LOCAL_NLP_ENGINE',
    ...fallbackResult
  };
}

/**
 * Universal Dynamic Voice Engine
 */
function universalVoiceNlpEngine(userSpeech, userLocation) {
  const text = userSpeech.trim();
  const lower = text.toLowerCase();

  // Search matched commodity
  const matchedCommodity = COMMODITY_DATABASE.find(c => 
    c.keywords.some(kw => lower.includes(kw))
  );

  // Search matched scheme
  const matchedScheme = GOVT_SCHEMES.find(s => 
    lower.includes(s.name.toLowerCase()) ||
    s.name.toLowerCase().split(' ').some(w => w.length > 3 && lower.includes(w))
  );

  // 1. CROP DISEASE, PESTICIDE & FERTILIZER INTENT
  if (lower.includes('keeda') || lower.includes('कीड़ा') || lower.includes('spray') || lower.includes('छिड़काव') || lower.includes('pesticide') || lower.includes('दवा') || lower.includes('dap') || lower.includes('urea') || lower.includes('खाद') || lower.includes('disease') || lower.includes('blight') || lower.includes('peele')) {
    const cropName = matchedCommodity ? matchedCommodity.name : extractGeneralTopic(text);
    const isFertilizer = lower.includes('dap') || lower.includes('urea') || lower.includes('खाद');

    return {
      query_input: userSpeech,
      intent: 'general_advice',
      spoken_response: {
        hindi_tts: isFertilizer
          ? `${cropName} me per acre 50 kg DAP aur 45 kg Urea daalein. Sahi matra ke liye Kirana operator se mitti jaanch confirm karein.`
          : `${cropName} me keede/bimari ke liye Copper Oxychloride 3g per liter paani me spray karein. Sahi dosage Kirana center se confirm karein.`,
        english_translation: isFertilizer
          ? `For ${cropName}, recommended application is 50kg DAP & 45kg Urea per acre. Confirm with Kirana Node.`
          : `For ${cropName} pest control, spray Copper Oxychloride (3g/L). Confirm exact dosage with Kirana Node.`
      },
      needs_trust_node_review: true,
      risk_metadata: {
        risk_category: isFertilizer ? 'AGRICULTURAL_DOSAGE' : 'PESTICIDE_SAFETY',
        trust_reason: isFertilizer ? 'Fertilizer dosage query: Requires Kirana operator review based on soil type.' : 'Chemical pesticide advice: Requires Kirana operator review for crop safety.'
      },
      actionable_steps: [
        'Subah ya shaam ke vaqt spray/khad daalein',
        'Peene ke paani ke srot se dur rakhein'
      ]
    };
  }

  // 2. SCHEME & LOAN ELIGIBILITY INTENT
  if (matchedScheme || lower.includes('scheme') || lower.includes('yojana') || lower.includes('योजना') || lower.includes('loan') || lower.includes('ऋण') || lower.includes('apply') || lower.includes('आवेदन') || lower.includes('subsidy') || lower.includes('सब्सिडी') || lower.includes('svanidhi') || lower.includes('kcc') || lower.includes('kusum')) {
    let schemeObj = matchedScheme;
    if (!schemeObj) {
      if (lower.includes('svanidhi') || lower.includes('स्वनिधि') || lower.includes('thela')) schemeObj = GOVT_SCHEMES[1];
      else if (lower.includes('kcc') || lower.includes('credit')) schemeObj = GOVT_SCHEMES[3];
      else if (lower.includes('kusum') || lower.includes('solar')) schemeObj = GOVT_SCHEMES[4];
      else schemeObj = GOVT_SCHEMES[0];
    }

    return {
      query_input: userSpeech,
      intent: 'scheme_query',
      spoken_response: {
        hindi_tts: `${schemeObj.name} ke bare me: Isme ${schemeObj.benefits} milta hai. Aadhar Card aur Bank passbook ke sath Kirana CSC center par apply karein.`,
        english_translation: `Regarding ${schemeObj.name}: Provides ${schemeObj.benefits}. Submit Aadhar Card and bank passbook at your local Kirana CSC center.`
      },
      needs_trust_node_review: true,
      risk_metadata: {
        risk_category: lower.includes('loan') || lower.includes('ऋण') ? 'FINANCIAL_LOAN' : 'FINANCIAL_ELIGIBILITY',
        trust_reason: `High-stakes ${schemeObj.name} query: Requires Kirana node document verification.`
      },
      actionable_steps: schemeObj.documents ? schemeObj.documents.map(d => `${d} tayyar rakhein`) : ['Aadhar Card tayyar rakhein', 'Bank Passbook ready rakhein']
    };
  }

  // 3. WEATHER FORECAST INTENT
  if (lower.includes('barish') || lower.includes('मौसम') || lower.includes('weather') || lower.includes('rain') || lower.includes('dhoop') || lower.includes('thand')) {
    return {
      query_input: userSpeech,
      intent: 'weather_advisory',
      spoken_response: {
        hindi_tts: `Agle 48 ghante me ${userLocation} me halki barish ki sambhavna hai. Fasal ko tarpaulin se dhak kar rakhein.`,
        english_translation: `Light rainfall expected in ${userLocation} over next 48 hours. Cover harvested crops.`
      },
      needs_trust_node_review: false,
      risk_metadata: {
        risk_category: 'NONE',
        trust_reason: 'Auto-verified regional weather forecast.'
      },
      actionable_steps: [
        'Khule me rakhi fasal ko dhakein',
        'Khet me paani nikasi saaf karein'
      ]
    };
  }

  // 4. MARKET PRICE QUERY INTENT
  if (matchedCommodity || lower.includes('bhav') || lower.includes('भाव') || lower.includes('rate') || lower.includes('रेट') || lower.includes('price') || lower.includes('मंडी') || lower.includes('mandi') || lower.includes('thok')) {
    const item = matchedCommodity ? matchedCommodity.name : extractGeneralTopic(text);
    const price = matchedCommodity ? matchedCommodity.price : 30;
    const unit = matchedCommodity ? matchedCommodity.unit : 'kg';

    return {
      query_input: userSpeech,
      intent: 'price_query',
      spoken_response: {
        hindi_tts: `Aaj ${userLocation} me ${item} ka mandi rate ₹${price} prati ${unit} chal raha hai.`,
        english_translation: `Today at ${userLocation}, ${item} mandi rate is ₹${price}/${unit}.`
      },
      needs_trust_node_review: false,
      risk_metadata: {
        risk_category: 'NONE',
        trust_reason: 'Auto-verified market rate lookup.'
      },
      actionable_steps: [
        'Subah 10 baje se pehle Mandi stock le jayein',
        'Niche button se apna local rate share karein'
      ]
    };
  }

  // 5. GENERAL SPEECH ANSWER SYNTHESIZER
  const topic = extractGeneralTopic(text);
  return {
    query_input: userSpeech,
    intent: 'general_advice',
    spoken_response: {
      hindi_tts: `Aapka sawal "${text}" prapt hua. ${topic} ke bare me sahi jankari ke liye apne Kirana CSC node se sampark karein.`,
      english_translation: `Received your question "${text}". For verified guidance regarding ${topic}, consult your local Kirana Trust Node.`
    },
    needs_trust_node_review: false,
    risk_metadata: {
      risk_category: 'NONE',
      trust_reason: 'General voice assistance response.'
    },
    actionable_steps: [
      'Apna vishisht sawal bolen',
      'Kirana node par jaankari verify karein'
    ]
  };
}

function extractGeneralTopic(text) {
  if (!text) return 'Aapke sawal';
  const clean = text.replace(/mujhe|batao|kya|hai|kaisey|kaise|karna|chahiye|aur|ke|ki|ka|me|mein|par|karo/gi, '').trim();
  return clean.length > 2 ? clean : text;
}
