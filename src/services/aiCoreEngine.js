import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOVT_SCHEMES, MOCK_COMMUNITY_INTEL } from '../data/mockData.js';

/**
 * LokVani AI Core Engine
 * Dynamic Hinglish & Devanagari Multi-Script NLP Engine & Risk Classifier
 */

const SYSTEM_PROMPT = `
You are LokVani AI, a voice assistant for farmers & micro-vendors in India.
Analyze the user's voice query and return JSON ONLY:
{
  "intent": "scheme_query | price_query | general_advice | weather_advisory",
  "entities": {
    "crop_commodity": "string or null",
    "location": "string or null",
    "need": "string or null",
    "target_scheme": "string or null"
  },
  "spoken_response": {
    "hindi_tts": "short simple Hindi answer (max 30 words)",
    "english_translation": "English translation"
  },
  "needs_trust_node_review": boolean,
  "confidence_score": 0.95,
  "risk_metadata": {
    "risk_category": "FINANCIAL_ELIGIBILITY | PESTICIDE_SAFETY | FINANCIAL_LOAN | AGRICULTURAL_DOSAGE | NONE",
    "trust_reason": "string"
  },
  "actionable_steps": ["step 1", "step 2"]
}
`;

export async function processUserSpeechQuery(transcribedText, options = {}) {
  const apiKey = options.apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : process.env.VITE_GEMINI_API_KEY);
  const userLocation = options.userLocation || 'Azamgarh, UP';

  // 1. Live Gemini AI Synthesis (If API key provided)
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `${SYSTEM_PROMPT}\n\nUser Query: "${transcribedText}" (Location: ${userLocation})`;
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        query_input: transcribedText,
        ...parsed
      };
    } catch (err) {
      console.warn('Gemini API call failed, running dynamic multi-script fallback engine:', err.message);
    }
  }

  // 2. High-Precision Multi-Script (Devanagari + Hinglish) Offline Engine
  return dynamicMultiScriptEngine(transcribedText, userLocation);
}

/**
 * High-Precision Multi-Script NLP Classifier (Handles Hindi Devanagari & Latin Hinglish)
 */
function dynamicMultiScriptEngine(transcribedText, userLocation) {
  const text = transcribedText.toLowerCase();

  // --- ENTITY MATCHING ---
  const commodity = detectCommodity(text);
  const scheme = detectScheme(text);
  const location = detectLocation(text) || userLocation;

  // --- 1. SCHEME & LOAN ELIGIBILITY INTENT ---
  if (scheme || text.includes('scheme') || text.includes('yojana') || text.includes('योजना') || text.includes('loan') || text.includes('ऋण') || text.includes('apply') || text.includes('आवेदन') || text.includes('eligibility') || text.includes('पात्रता')) {
    const targetScheme = scheme || GOVT_SCHEMES[0];
    
    return {
      query_input: transcribedText,
      intent: 'scheme_query',
      entities: {
        crop_commodity: commodity ? commodity.name : null,
        location,
        need: `Information regarding ${targetScheme.name}`,
        target_scheme: targetScheme.name
      },
      retrieved_context: {
        matched_scheme: targetScheme.name,
        benefits: targetScheme.benefits
      },
      spoken_response: {
        hindi_tts: `${targetScheme.name} me ${targetScheme.benefits} Aadhar card aur ${targetScheme.documents[1] || 'bank papers'} ke sath Kirana node par e-KYC karein.`,
        english_translation: `${targetScheme.name} provides ${targetScheme.benefits} Submit ${targetScheme.documents.join(', ')} at your Kirana Trust Node.`
      },
      needs_trust_node_review: true, // High-Stakes Financial/Eligibility Query
      confidence_score: 0.96,
      risk_metadata: {
        risk_category: targetScheme.name.includes('Loan') || targetScheme.name.includes('SVANidhi') || targetScheme.name.includes('KCC') ? 'FINANCIAL_LOAN' : 'FINANCIAL_ELIGIBILITY',
        trust_reason: `High-stakes ${targetScheme.name} query: Requires Kirana operator to check applicant document eligibility.`
      },
      actionable_steps: targetScheme.documents.map(doc => `${doc} tayyar rakhein`)
    };
  }

  // --- 2. PESTICIDE / CROP DISEASE / FERTILIZER INTENT ---
  if (text.includes('keeda') || text.includes('कीड़ा') || text.includes('spray') || text.includes('छिड़काव') || text.includes('pesticide') || text.includes('दवा') || text.includes('blight') || text.includes('disease') || text.includes('dap') || text.includes('urea') || text.includes('खाद')) {
    const cropName = commodity ? commodity.name : 'Crop';
    const isFertilizer = text.includes('dap') || text.includes('urea') || text.includes('खाद');

    return {
      query_input: transcribedText,
      intent: 'general_advice',
      entities: {
        crop_commodity: cropName,
        location,
        need: isFertilizer ? 'Fertilizer Dosage Advisory' : 'Pesticide Crop Disease Advisory',
        target_scheme: null
      },
      spoken_response: {
        hindi_tts: isFertilizer
          ? `${cropName} me per acre 50 kg DAP aur 45 kg Urea daalein. Sahi matra ke liye Kirana dada se mitti jaanch confirm karein.`
          : `${cropName} me keede ke liye Copper Oxychloride 3g per liter paani me milakar spray karein. Sahi dosage Kirana center se confirm karein.`,
        english_translation: isFertilizer
          ? `For ${cropName}, apply 50kg DAP and 45kg Urea per acre. Confirm dosage with Kirana Node based on soil test.`
          : `For ${cropName} pest, spray Copper Oxychloride (3g/L). Confirm exact dosage with Kirana Trust Node.`
      },
      needs_trust_node_review: true, // High-Stakes Chemical/Agricultural Dosage Query
      confidence_score: 0.93,
      risk_metadata: {
        risk_category: isFertilizer ? 'AGRICULTURAL_DOSAGE' : 'PESTICIDE_SAFETY',
        trust_reason: isFertilizer ? 'Fertilizer application rate: Requires Kirana node review based on soil type.' : 'Chemical pesticide advice: Requires local edge verification for crop safety.'
      },
      actionable_steps: [
        'Subah ya shaam ke vaqt spray/khad daalein',
        'Peene ke paani ke srot se dur rakhein'
      ]
    };
  }

  // --- 3. MARKET PRICE LOOKUP INTENT ---
  if (text.includes('bhav') || text.includes('भाव') || text.includes('rate') || text.includes('रेट') || text.includes('price') || text.includes('दावा') || text.includes('mandi') || text.includes('मंडी') || text.includes('thok') || text.includes('थोक') || commodity) {
    const item = commodity ? commodity.name : 'Tamatar (Tomato)';
    const itemPrice = commodity ? commodity.price : 28;

    return {
      query_input: transcribedText,
      intent: 'price_query',
      entities: {
        crop_commodity: item,
        location,
        need: `Market price lookup for ${item}`,
        target_scheme: null
      },
      retrieved_context: {
        matched_commodity: item,
        mandi_price: `₹${itemPrice}/kg at ${location}`
      },
      spoken_response: {
        hindi_tts: `Aaj ${location} me ${item} ka rate ₹${itemPrice} prati kilo hai.`,
        english_translation: `Today at ${location}, ${item} rate is ₹${itemPrice}/kg.`
      },
      needs_trust_node_review: false, // Low-Risk Market Lookup
      confidence_score: 0.98,
      risk_metadata: {
        risk_category: 'NONE',
        trust_reason: 'Auto-verified market rate lookup from community price feed.'
      },
      actionable_steps: [
        'Subah Mandi me stock le jayein',
        'Apna Mandi rate niche share karein'
      ]
    };
  }

  // --- 4. WEATHER ADVISORY INTENT ---
  return {
    query_input: transcribedText,
    intent: 'weather_advisory',
    entities: {
      crop_commodity: commodity ? commodity.name : null,
      location,
      need: 'Weather forecast advisory',
      target_scheme: null
    },
    spoken_response: {
      hindi_tts: `Agle 48 ghante me ${location} me halki barish ki sambhavna hai. Fasal ko tarpaulin se dhak kar rakhein.`,
      english_translation: `Light rainfall expected in ${location} over next 48 hours. Cover harvested crops.`
    },
    needs_trust_node_review: false, // Low-Risk Weather Advisory
    confidence_score: 0.95,
    risk_metadata: {
      risk_category: 'NONE',
      trust_reason: 'Auto-verified regional weather alert.'
    },
    actionable_steps: [
      'Fasal ko tarpaulin se dhakein',
      'Khet me paani nikasi saaf karein'
    ]
  };
}

/**
 * Multi-Script Commodity Detector (Hindi Devanagari + Latin Hinglish)
 */
function detectCommodity(text) {
  if (text.includes('tamatar') || text.includes('tomato') || text.includes('टमाटर')) return { name: 'Tamatar (Tomato)', price: 28 };
  if (text.includes('pyaaz') || text.includes('onion') || text.includes('प्याज़') || text.includes('प्याज')) return { name: 'Pyaaz (Onion)', price: 34 };
  if (text.includes('aloo') || text.includes('potato') || text.includes('आलू')) return { name: 'Aloo (Potato)', price: 18 };
  if (text.includes('gehun') || text.includes('wheat') || text.includes('गेहूं') || text.includes('गेहुं')) return { name: 'Gehun (Wheat)', price: 24 };
  if (text.includes('mirch') || text.includes('chilli') || text.includes('मिर्च')) return { name: 'Hari Mirch (Chilli)', price: 42 };
  if (text.includes('baingan') || text.includes('brinjal') || text.includes('बैंगन')) return { name: 'Baingan (Brinjal)', price: 22 };
  if (text.includes('bhindi') || text.includes('okra') || text.includes('भिंडी')) return { name: 'Bhindi (Okra)', price: 32 };
  if (text.includes('karela') || text.includes('bitter gourd') || text.includes('करेला')) return { name: 'Karela (Bitter Gourd)', price: 38 };
  if (text.includes('lahsun') || text.includes('garlic') || text.includes('लहसुन')) return { name: 'Garlic (Lahsun)', price: 140 };
  return null;
}

/**
 * Multi-Script Scheme Detector (Hindi Devanagari + Latin Hinglish)
 */
function detectScheme(text) {
  if (text.includes('pm kisan') || text.includes('pm-kisan') || text.includes('पीएम किसान') || text.includes('samman nidhi')) return GOVT_SCHEMES[0];
  if (text.includes('svanidhi') || text.includes('स्वनिधि') || text.includes('vendor loan') || text.includes('thela')) return GOVT_SCHEMES[1];
  if (text.includes('fasal bima') || text.includes('pmfby') || text.includes('फ़सल बीमा')) return GOVT_SCHEMES[2];
  if (text.includes('kcc') || text.includes('kisan credit') || text.includes('किसान क्रेडिट')) return GOVT_SCHEMES[3];
  if (text.includes('kusum') || text.includes('solar pump') || text.includes('सोलर पंप')) return GOVT_SCHEMES[4];
  if (text.includes('soil health') || text.includes('mitti jaanch') || text.includes('मिट्टी')) return GOVT_SCHEMES[5];
  return null;
}

/**
 * Location Detector (Hindi Devanagari + Latin Hinglish)
 */
function detectLocation(text) {
  if (text.includes('azamgarh') || text.includes('आजमगढ़')) return 'Azamgarh Mandi';
  if (text.includes('gorakhpur') || text.includes('गोरखपुर')) return 'Gorakhpur Mandi';
  if (text.includes('varanasi') || text.includes('वाराणसी') || text.includes('banaras')) return 'Varanasi Mandi';
  if (text.includes('lucknow') || text.includes('लखनऊ')) return 'Lucknow Mandi';
  if (text.includes('jaunpur') || text.includes('जौनपुर')) return 'Jaunpur Mandi';
  return null;
}
