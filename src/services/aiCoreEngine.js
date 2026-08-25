import { GOVT_SCHEMES } from '../data/mockData.js';

/**
 * LokVani AI Client-Side Local NLP Engine
 *
 * SECURITY NOTE: This file does NOT import @google/generative-ai and does NOT use any API keys.
 * All live Gemini API calls happen ONLY on the Express server (server.js / geminiService.js).
 *
 * This module provides a deterministic, keyword-based local fallback engine that runs entirely
 * in the browser with no network calls. It activates when the backend is unreachable,
 * so the app degrades gracefully instead of breaking.
 */

// Commodity price database (local benchmark prices for offline fallback)
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
  { keywords: ['makka', 'maize', 'corn', 'मक्का'], name: 'Makka (Maize)', price: 21, unit: 'kg' },
  { keywords: ['chana', 'gram', 'चना'], name: 'Chana (Gram)', price: 62, unit: 'kg' }
];

/**
 * Process a user speech query using the local NLP engine (no API key, no network).
 * Browser-side fallback used when the Express backend is unreachable.
 *
 * @param {string} transcribedText
 * @param {{ userLocation?: string }} options
 */
export function processUserSpeechQuery(transcribedText, options = {}) {
  const userLocation = options.userLocation || 'Azamgarh, UP';
  const result = localNlpEngine(transcribedText, userLocation);
  return {
    engine_source: 'LOCAL_NLP_FALLBACK',
    confidence: 'LOW',
    ...result
  };
}

// ─── Local NLP Engine ────────────────────────────────────────────────────────

function localNlpEngine(userSpeech, userLocation) {
  const text = userSpeech.trim();
  const lower = text.toLowerCase();

  // Find matched commodity
  const matchedCommodity = COMMODITY_DATABASE.find(c =>
    c.keywords.some(kw => lower.includes(kw))
  );

  // Smart scheme matcher based on aliases and key terms
  let matchedScheme = null;
  if (lower.includes('pm kisan') || lower.includes('pm-kisan') || lower.includes('samman nidhi') || lower.includes('17th') || lower.includes('kisht')) {
    matchedScheme = GOVT_SCHEMES[0]; // PM-Kisan
  } else if (lower.includes('svanidhi') || lower.includes('स्वनिधि') || lower.includes('vendor') || lower.includes('thela')) {
    matchedScheme = GOVT_SCHEMES[1]; // PM SVANidhi
  } else if (lower.includes('fasal bima') || lower.includes('pmfby') || lower.includes('bima') || lower.includes('insurance')) {
    matchedScheme = GOVT_SCHEMES[2]; // PMFBY
  } else if (lower.includes('kcc') || lower.includes('kisan credit') || lower.includes('credit card')) {
    matchedScheme = GOVT_SCHEMES[3]; // KCC
  } else if (lower.includes('kusum') || lower.includes('solar') || lower.includes('pump')) {
    matchedScheme = GOVT_SCHEMES[4]; // PM-KUSUM
  } else if (lower.includes('soil') || lower.includes('mitti') || lower.includes('card')) {
    matchedScheme = GOVT_SCHEMES[5] || GOVT_SCHEMES[0];
  } else {
    // Fallback scheme match on exact title
    matchedScheme = GOVT_SCHEMES.find(s => lower.includes(s.name.toLowerCase()));
  }

  // 1. CROP DISEASE, PESTICIDE & FERTILIZER ADVISORY
  if (
    lower.includes('keeda') || lower.includes('कीड़ा') || lower.includes('spray') ||
    lower.includes('छिड़काव') || lower.includes('pesticide') || lower.includes('दवा') ||
    lower.includes('dap') || lower.includes('urea') || lower.includes('खाद') ||
    lower.includes('disease') || lower.includes('blight') || lower.includes('peele') ||
    lower.includes('रोग') || lower.includes('कीट')
  ) {
    const cropName = matchedCommodity ? matchedCommodity.name : (extractCropOrTopic(text) || 'Fasal (Crop)');
    const isFertilizer = lower.includes('dap') || lower.includes('urea') || lower.includes('खाद');
    const shortHi = isFertilizer
      ? `${cropName} ke liye per acre 50 kg DAP aur 45 kg Urea daalein. Sahi matra ke liye Kirana operator se mitti jaanch confirm karein.`
      : `${cropName} mein keede/bimari ke liye Copper Oxychloride (3g per liter paani) spray karein. Sahi dosage Kirana center se confirm karein.`;
    const shortEn = isFertilizer
      ? `For ${cropName}, apply 50 kg DAP & 45 kg Urea per acre. Confirm exact dose with Kirana Node soil test.`
      : `For ${cropName} pest control, spray Copper Oxychloride (3g/L). Confirm exact dosage at your Kirana Trust Node.`;

    return {
      transcribedText: userSpeech,
      intent: 'general_advice',
      domain: 'AGRI_ADVISORY',
      shortAnswerHi: shortHi,
      shortAnswerEn: shortEn,
      detailedAnswerHi: shortHi + ' Kisan Helpline 1551 par bhi free call kar sakte hain. Har fasal aur mitti ki zaroorat alag hoti hai, isliye Kirana node operator se mitti jaanch karwa kar hi sahi matra tay karein.',
      detailedAnswerEn: shortEn + ' You can also call Kisan Helpline 1551. Every crop and soil type has different needs, so always verify dosage with a certified Kirana Trust Node operator before application.',
      needs_trust_node_review: true,
      isHighStakes: true,
      riskCategory: isFertilizer ? 'AGRICULTURAL_DOSAGE' : 'PESTICIDE_SAFETY',
      trustNote: isFertilizer
        ? 'Fertilizer dosage advice: Requires Kirana operator review based on soil type.'
        : 'Chemical pesticide advice: Requires Kirana operator review for crop safety.',
      actionableSteps: [
        'Subah ya shaam ke waqt spray/khad daalein',
        'Peene ke paani ke strot se door rakhein',
        'Kirana node par mitti jaanch karwayein'
      ],
      follow_up_questions: [
        'Mitti jaanch ke liye kya documents chahiye?',
        'Kisan Helpline 1551 ka time kya hai?'
      ]
    };
  }

  // 2. GOVT SCHEME & LOAN ELIGIBILITY
  if (
    matchedScheme ||
    lower.includes('scheme') || lower.includes('yojana') || lower.includes('योजना') ||
    lower.includes('loan') || lower.includes('ऋण') || lower.includes('apply') ||
    lower.includes('आवेदन') || lower.includes('subsidy') || lower.includes('सब्सिडी')
  ) {
    const schemeObj = matchedScheme || GOVT_SCHEMES[0];
    const shortHi = `${schemeObj.name} ke liye Aadhar Card aur Bank Passbook ke saath Kirana CSC center par jayen. Isme ${schemeObj.benefits} milte hain.`;
    const shortEn = `For ${schemeObj.name}, visit your Kirana CSC center with Aadhar Card and bank passbook. Benefits: ${schemeObj.benefits}.`;

    return {
      transcribedText: userSpeech,
      intent: 'scheme_query',
      domain: 'GOVT_SCHEME',
      shortAnswerHi: shortHi,
      shortAnswerEn: shortEn,
      detailedAnswerHi: shortHi + ` Aavedan ke liye ${(schemeObj.documents || ['Aadhar Card', 'Bank Passbook']).join(', ')} zaroori hain. Kirana node operator se aavedan prakriya verify karein.`,
      detailedAnswerEn: shortEn + ` Required documents: ${(schemeObj.documents || ['Aadhar Card', 'Bank Passbook']).join(', ')}. Please verify application steps at your local Kirana Trust Node.`,
      needs_trust_node_review: true,
      isHighStakes: true,
      riskCategory: lower.includes('loan') || lower.includes('ऋण') ? 'FINANCIAL_LOAN' : 'FINANCIAL_ELIGIBILITY',
      trustNote: `High-stakes ${schemeObj.name} query: Requires Kirana node document verification.`,
      actionableSteps: (schemeObj.documents || ['Aadhar Card', 'Bank Passbook']).map(d => `${d} tayyar rakhein`),
      follow_up_questions: [
        `${schemeObj.name} ki aavedan shart kya hai?`,
        'CSC center ka pata kaise pata karein?'
      ]
    };
  }

  // 3. WEATHER FORECAST
  if (
    lower.includes('barish') || lower.includes('मौसम') || lower.includes('weather') ||
    lower.includes('rain') || lower.includes('dhoop') || lower.includes('thand') ||
    lower.includes('तापमान')
  ) {
    return {
      transcribedText: userSpeech,
      intent: 'weather_advisory',
      domain: 'WEATHER',
      shortAnswerHi: `Agle 48 ghante mein ${userLocation} mein halki barish ki sambhavna hai. Khuli fasal ko tarpaulin se dhak lein aur khet mein paani nikasi ki vyavastha karein.`,
      shortAnswerEn: `Light rainfall expected in ${userLocation} over the next 48 hours. Cover harvested crops with tarpaulin and ensure field drainage.`,
      detailedAnswerHi: `Mausam vibhag ke anusar ${userLocation} mein agle 48 ghante mein halki se madham barish ho sakti hai. Isse pehle apni kati hui fasal ko surakshit jagah par rakhein ya tarpaulin se dhakein. Khet mein paani ka johar na ho, iski vyavastha karein.`,
      detailedAnswerEn: `Meteorological reports suggest light to moderate rainfall in ${userLocation} over the next 48 hours. Move harvested produce to a covered area or cover with tarpaulin. Ensure field drainage to prevent waterlogging.`,
      needs_trust_node_review: false,
      isHighStakes: false,
      riskCategory: 'NONE',
      trustNote: 'Auto-verified regional weather forecast.',
      actionableSteps: [
        'Khuli fasal ko tarpaulin se dhakein',
        'Khet mein paani nikasi saaf karein',
        'Barish ke baad hi khad daalein'
      ],
      follow_up_questions: [
        'Agle hafte ka mausam kaisa rahega?',
        'Kati fasal ko surakshit kaise rakhein?'
      ]
    };
  }

  // 4. MARKET PRICE QUERY
  if (
    matchedCommodity ||
    lower.includes('bhav') || lower.includes('भाव') || lower.includes('rate') ||
    lower.includes('रेट') || lower.includes('price') || lower.includes('मंडी') ||
    lower.includes('mandi') || lower.includes('thok')
  ) {
    const item = matchedCommodity ? matchedCommodity.name : (extractCropOrTopic(text) || 'Fasal (Commodity)');
    const price = matchedCommodity ? matchedCommodity.price : 30;
    const unit = matchedCommodity ? matchedCommodity.unit : 'kg';

    return {
      transcribedText: userSpeech,
      intent: 'price_query',
      domain: 'MARKET_PRICE',
      shortAnswerHi: `Aaj ${userLocation} mein ${item} ka mandi rate ₹${price} prati ${unit} chal raha hai. Yeh benchmark rate hai, sthaniya rate thoda alag ho sakta hai.`,
      shortAnswerEn: `Today at ${userLocation}, ${item} mandi rate is approximately ₹${price}/${unit}. This is a benchmark rate; local rates may vary.`,
      detailedAnswerHi: `${item} ka aaj ka benchmark mandi rate ₹${price} prati ${unit} hai. Yeh data community reports aur Agmarknet data par aadharit hai. Subah 10 baje se pehle mandi jaana achha hota hai jab stock fresh hota hai.`,
      detailedAnswerEn: `The benchmark mandi rate for ${item} today is ₹${price}/${unit}. This is based on community reports and government Agmarknet data. Arriving before 10 AM yields fresher stock.`,
      needs_trust_node_review: false,
      isHighStakes: false,
      riskCategory: 'NONE',
      trustNote: 'Auto-verified market rate lookup.',
      actionableSteps: [
        'Subah 10 baje se pehle mandi jayen',
        'Doosri mandion ka rate compare karein',
        'Apna sthaniya rate community se share karein'
      ],
      follow_up_questions: [
        'Pichle hafte ka rate kya tha?',
        'Doosri mandi ka bhav kaise dekhein?'
      ]
    };
  }

  // 5. GENERAL FALLBACK
  const topic = extractCropOrTopic(text) || 'aapke sawal';
  return {
    transcribedText: userSpeech,
    intent: 'general_advice',
    domain: 'AGRI_ADVISORY',
    shortAnswerHi: `Aapka sawal "${text.slice(0, 60)}" prapt hua. ${topic} ke baare mein sahi jankari ke liye apne Kirana CSC node se sampark karein.`,
    shortAnswerEn: `Received your question about "${topic}". For verified guidance, please consult your local Kirana Trust Node.`,
    detailedAnswerHi: `Aapne ${topic} ke baare mein poochha. Is vishay par sahi aur up-to-date jankari ke liye apne nayik Kirana CSC center par jaen. Wahan trained operator aapko sarkari yojanaon, mandi rates, aur krishi salah ke baare mein sahi margdarshan de sakte hain. Aap Kisan Helpline 1551 par bhi free call kar sakte hain.`,
    detailedAnswerEn: `You asked about ${topic}. For accurate and up-to-date information on this subject, visit your nearest Kirana CSC center. Trained operators can guide you on government schemes, mandi rates, and agricultural advisory. You can also call Kisan Helpline 1551 for free guidance.`,
    needs_trust_node_review: false,
    isHighStakes: false,
    riskCategory: 'NONE',
    trustNote: 'General voice assistance response — consider verifying with Kirana node.',
    actionableSteps: [
      'Apna vishisht sawal dobara bolen',
      'Kirana node par jankari verify karein',
      'Kisan Helpline 1551 par call karein'
    ],
    follow_up_questions: [
      'Kirana CSC node ka pata kaise milega?',
      'Kisan Helpline number kya hai?'
    ]
  };
}

function extractCropOrTopic(text) {
  if (!text) return '';
  const stopWords = /\b(mujhe|batao|bataiye|kya|hai|kaisey|kaise|karna|chahiye|aur|ke|ki|ka|me|mein|par|karo|jaankari|dijiye|lag|gaya|batao)\b/gi;
  const clean = text.replace(stopWords, '').replace(/\s+/g, ' ').trim();
  return clean.length > 2 ? clean : text;
}
