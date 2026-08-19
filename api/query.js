import { processUserSpeechQuery } from '../src/services/aiCoreEngine.js';

/**
 * Vercel Serverless API Route: POST /api/query
 * Receives transcribed voice input, calls AI Core Engine, evaluates high-stakes risk,
 * saves/formats response payload, and returns result to client.
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { transcribed_text, user_location, api_key } = req.body || {};

    if (!transcribed_text || typeof transcribed_text !== 'string') {
      return res.status(400).json({ error: 'Missing required field: transcribed_text string.' });
    }

    // Process Voice Query through LokVani AI Engine
    const result = await processUserSpeechQuery(transcribed_text, {
      userLocation: user_location || 'Azamgarh, UP',
      apiKey: api_key
    });

    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Serverless API Error:', error);
    return res.status(500).json({
      error: 'Internal server error processing voice query.',
      details: error.message
    });
  }
}
