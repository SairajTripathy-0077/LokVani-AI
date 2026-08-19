import { processUserSpeechQuery } from './aiCoreEngine.js';

async function testVariety() {
  const testQueries = [
    "आज गोरखपुर मंडी में आलू और प्याज का रेट क्या है?",
    "Main thela lagata hun, PM SVANidhi me bina guarantee loan kaise milega?",
    "गेहूं में कितना DAP और यूरिया खाद डालना चाहिए?",
    "पीएम कुसुम योजना में सोलर पंप पर कितनी सब्सिडी मिलती है?",
    "Tamatar me keeda lag raha hai konsa spray karun?"
  ];

  for (const q of testQueries) {
    const res = await processUserSpeechQuery(q);
    console.log(`\nInput Query: "${q}"`);
    console.log(`Intent: ${res.intent}`);
    console.log(`Commodity/Scheme: ${res.entities?.crop_commodity || res.entities?.target_scheme}`);
    console.log(`Hindi Answer: "${res.spoken_response?.hindi_tts}"`);
    console.log(`Needs Trust Node Review: ${res.needs_trust_node_review} (${res.risk_metadata?.risk_category})`);
    console.log("--------------------------------------------------------------------------------");
  }
}

testVariety();
