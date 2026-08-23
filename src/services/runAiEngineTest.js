import { processUserSpeechQuery } from './aiCoreEngine.js';

/**
 * Execution Test Suite for LokVani AI Core Engine
 */

async function runTests() {
  console.log("================================================================================");
  console.log("[LOKVANI AI] CORE INTELLIGENCE MODULE - EXECUTION TEST SUITE");
  console.log("================================================================================\n");

  const sampleInputs = [
    {
      title: "Test 1: Scheme Application + Mandi Price (High Stakes)",
      query: "Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav jan-na hai."
    },
    {
      title: "Test 2: Pesticide Crop Advisory (High Stakes)",
      query: "Tamatar me keede lag rahe hain aur patte peele ho rahe hain, konsa spray karun?"
    },
    {
      title: "Test 3: Onion Market Price Inquiry (Low Risk - Auto Verified)",
      query: "Aaj Gorakhpur Mandi me pyaaz ka thoke rate kya chal raha hai?"
    },
    {
      title: "Test 4: Weather Alert Inquiry (Low Risk - Auto Verified)",
      query: "Agle do din me barish hogi kya? Wheat stock khule me pada hai."
    }
  ];

  for (const item of sampleInputs) {
    console.log(`[TEST] ${item.title}`);
    console.log(`Input Speech Transcript: "${item.query}"`);
    
    const result = await processUserSpeechQuery(item.query, { userLocation: "Azamgarh, UP" });
    
    console.log("Structured Output Result:");
    console.log(JSON.stringify(result, null, 2));
    console.log("--------------------------------------------------------------------------------\n");
  }
}

runTests();
