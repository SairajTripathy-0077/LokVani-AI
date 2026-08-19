import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  console.log("Testing Gemini API Key presence:", key ? "Key Present" : "No Key in process.env");
  
  if (!key) {
    console.log("To test Gemini API via CLI, run: $env:VITE_GEMINI_API_KEY='your_key'; node src/services/testGeminiApiCall.js");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent("Hello, answer in Hindi: What is LokVani AI?");
    console.log("Gemini Response Text:\n", res.response.text());
  } catch (err) {
    console.error("Gemini Error:", err.message);
  }
}

testGemini();
