import tunedParams from './tunedParams.json' with { type: 'json' };
import stageSensitivity from './stageSensitivity.json' with { type: 'json' };
import advisoryTemplates from './advisoryTemplates.json' with { type: 'json' };

/**
 * Utility math functions
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function clamp01(val) {
  return clamp(val, 0, 1);
}

/**
 * Computes velocity factor based on rate of deterioration in rainfall and mandi prices.
 * Returns a normalized velocity value (-1 to 1).
 * Positive velocity indicates worsening distress.
 */
export function computeVelocity(rainfallTrend = [], priceTrend = []) {
  let rainVelocity = 0;
  let priceVelocity = 0;

  if (Array.isArray(rainfallTrend) && rainfallTrend.length >= 2) {
    const last = rainfallTrend[rainfallTrend.length - 1];
    const prev = rainfallTrend[0];
    const diff = prev - last; // worsening if rainfall decreased
    rainVelocity = diff / (Math.max(Math.abs(prev), 1));
  }

  if (Array.isArray(priceTrend) && priceTrend.length >= 2) {
    const last = priceTrend[priceTrend.length - 1];
    const prev = priceTrend[0];
    const diff = prev - last; // worsening if price dropped
    priceVelocity = diff / (Math.max(Math.abs(prev), 1));
  }

  const combined = (rainVelocity * 0.6) + (priceVelocity * 0.4);
  return clamp(combined, -1, 1);
}

/**
 * Jargon Blocklist for farmer-facing voice and spoken outputs
 */
export const JARGON_BLOCKLIST = ['%', 'deviation', 'multiplier', 'score', 'threshold', 'factor'];

export function containsJargon(text = '') {
  if (typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return JARGON_BLOCKLIST.some(term => lower.includes(term.toLowerCase()));
}

/**
 * Core Distress Prediction Scoring Engine
 * Pure, dependency-free function taking normalized inputs and returning explainable result object.
 */
export function calculateDistressScore(inputs = {}, customParams = {}) {
  const params = { ...tunedParams, ...customParams };
  const {
    W_RAIN = 0.45,
    W_PRICE = 0.35,
    K_INTERACT = 0.25,
    PROXIMITY_K = 10,
    V_K = 0.5,
    ADVISORY_THRESHOLD = 35,
    URGENT_THRESHOLD = 65
  } = params;

  const {
    rainfallDeviationPct = 0,
    rainfallTrend = [],
    priceDropPct = 0,
    priceTrend = [],
    daysToLoanDue = null,
    cropStage = 'vegetative',
    cropType = 'default'
  } = inputs;

  // 1. Raw signal severities (deficit & price drop only)
  const rainSeverity = clamp01(-rainfallDeviationPct / 100);
  const priceSeverity = clamp01(-priceDropPct / 100);

  // 2. Crop stage multiplier lookup
  const cropKey = (cropType || 'default').toLowerCase();
  const stageKey = (cropStage || 'vegetative').toLowerCase();
  const cropTable = stageSensitivity[cropKey] || stageSensitivity.default;
  const stageMultiplier = cropTable[stageKey] || stageSensitivity.default[stageKey] || 1.0;

  // 3. Base weighted distress score
  const base = (W_RAIN * rainSeverity * stageMultiplier) + (W_PRICE * priceSeverity);

  // 4. Non-linear interaction bonus
  const interactionBonus = K_INTERACT * rainSeverity * priceSeverity;

  // 5. Loan proximity factor
  const proximityFactor = daysToLoanDue == null
    ? 1
    : 1 + Math.min(1.5, PROXIMITY_K / Math.max(Number(daysToLoanDue), 1));

  // 6. Velocity adjustment
  const velocity = computeVelocity(rainfallTrend, priceTrend);
  const velocityFactor = 1 + clamp(velocity * V_K, -0.3, 0.5);

  // 7. Calculate raw score & final score (0–100 scale)
  const rawScore = (base + interactionBonus) * proximityFactor * velocityFactor;
  const finalScore = Math.round(clamp01(rawScore) * 100);

  // Determine tier
  let tier = 'LOW';
  if (finalScore >= URGENT_THRESHOLD) {
    tier = 'URGENT';
  } else if (finalScore >= ADVISORY_THRESHOLD) {
    tier = 'ADVISORY';
  }

  // 8. Generate technical reasons (for internal debug / tests)
  const reasons = [];
  if (rainSeverity > 0) {
    reasons.push(`Rainfall ${Math.abs(rainfallDeviationPct)}% below normal for growth stage`);
  }
  if (priceSeverity > 0) {
    reasons.push(`Mandi price down ${Math.abs(priceDropPct)}% vs baseline`);
  }
  if (daysToLoanDue !== null && daysToLoanDue <= 30) {
    reasons.push(`Loan due in ${daysToLoanDue} days`);
  }

  // 9. Generate farmer-plain spoken reasons (zero jargon, TTS friendly)
  const spokenReasons = [];
  const cropNameStr = cropType && cropType !== 'default' ? cropType : 'Fasal';

  if (rainSeverity > 0.15) {
    spokenReasons.push(`Is mausam mein ${cropNameStr} ke liye baarish kafi kam hui hai.`);
  }
  if (priceSeverity > 0.15) {
    spokenReasons.push(`Mandi mein ${cropNameStr} ka bhav pichle mahine se gir gaya hai.`);
  }
  if (daysToLoanDue !== null && daysToLoanDue <= 30) {
    spokenReasons.push(`Aapka bank loan agle kuch dino mein jama karna hai.`);
  }

  // Fallback spoken reason if score is above advisory but no single signal triggered
  if (spokenReasons.length === 0 && finalScore >= ADVISORY_THRESHOLD) {
    spokenReasons.push('Khet aur mandi ke halat par dhyan dene ki zaroorat hai.');
  }

  // Filter out any spoken reasons that contain jargon terms
  const safeSpokenReasons = spokenReasons.filter(reason => !containsJargon(reason));

  // 10. Select ICAR advisory template based on dominant contribution
  let dominantSignal = 'rainfall';
  if (rainSeverity > 0.2 && priceSeverity > 0.2) {
    dominantSignal = 'combined';
  } else if (priceSeverity * W_PRICE > rainSeverity * W_RAIN) {
    dominantSignal = 'price';
  } else if (daysToLoanDue !== null && daysToLoanDue <= 15) {
    dominantSignal = 'loan';
  }

  const advisory = advisoryTemplates[dominantSignal] || advisoryTemplates.rainfall;

  return {
    score: finalScore,
    tier,
    reasons,
    spokenReasons: safeSpokenReasons,
    advisory,
    contributions: {
      rainSeverity,
      priceSeverity,
      stageMultiplier,
      interactionBonus,
      proximityFactor,
      velocityFactor
    }
  };
}

export default calculateDistressScore;
