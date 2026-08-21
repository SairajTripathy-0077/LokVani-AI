import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.GEMINI_API_KEYS?.split(',')[0] || '';
console.log('Testing with key:', key ? `${key.substring(0, 8)}...` : 'None');

async function main() {
  try {
    const genAI = new GoogleGenerativeAI(key);
    // Let's try listing models
    // In @google/generative-ai, listing models is done via the model service or custom fetch.
    // Let's try a simple generation with different model names to see which ones succeed.
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-pro',
      'gemini-1.5-pro'
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent('Hi');
        console.log(`✅ Success with ${modelName}! Response:`, response.response.text());
        return; // Stop on first success
      } catch (err) {
        console.log(`❌ Failed with ${modelName}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

main();
