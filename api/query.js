/**
 * Vercel Serverless API Route: POST /api/query
 * Proxies voice queries to the AI engine. All API key handling is server-side only.
 *
 * SECURITY NOTE: api_key is never accepted from the request body.
 * Keys are read exclusively from server environment variables.
 */
import { processUserSpeechQuery } from '../src/services/aiCoreEngine.js';

// Strip control characters and cap length
function sanitize(text) {
  if (typeof text !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, 500);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // NOTE: api_key intentionally NOT accepted from request body
    const { transcribed_text, user_location } = req.body || {};

    const safeText = sanitize(transcribed_text);
    if (!safeText) {
      return res.status(400).json({ error: 'Missing or invalid transcribed_text (max 500 chars).' });
    }

    const result = await processUserSpeechQuery(safeText, {
      userLocation: sanitize(user_location) || 'Azamgarh, UP'
    });

    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Never leak stack traces or internal error messages
    console.error('[Serverless /api/query Error]:', error);
    return res.status(500).json({ error: 'Internal server error processing voice query.' });
  }
}
