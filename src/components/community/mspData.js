/**
 * mspData.js
 * Government Minimum Support Price (MSP) reference data for 2024-25 season.
 * Source: Cabinet Committee on Economic Affairs (CCEA), Government of India.
 *
 * UPDATE INSTRUCTIONS:
 * When new MSP rates are announced, update the values in this object only.
 * The keys are lowercase commodity names matching the `item` field in the database.
 *
 * Units:
 *   - 'quintal' → price per quintal (100 kg)
 *   - 'kg'      → price per kg
 *
 * Commit: feat(community): add MSP constants for 2024-25 season
 */

export const MSP_2024_25 = {
  // ── Kharif Crops ────────────────────────────────────────────
  'dhaan (common)':    { msp: 2300, unit: 'quintal', display: 'Paddy (Common)' },
  'dhaan (grade-a)':   { msp: 2320, unit: 'quintal', display: 'Paddy (Grade A)' },
  'dhaan':             { msp: 2300, unit: 'quintal', display: 'Paddy' },
  'paddy':             { msp: 2300, unit: 'quintal', display: 'Paddy' },
  'chawal':            { msp: 2300, unit: 'quintal', display: 'Paddy/Rice' },
  'maize':             { msp: 2090, unit: 'quintal', display: 'Maize' },
  'makka':             { msp: 2090, unit: 'quintal', display: 'Maize' },
  'bajra':             { msp: 2625, unit: 'quintal', display: 'Bajra (Pearl Millet)' },
  'jowar (hybrid)':    { msp: 3371, unit: 'quintal', display: 'Jowar (Hybrid)' },
  'jowar':             { msp: 3371, unit: 'quintal', display: 'Jowar' },
  'cotton (medium staple)': { msp: 7121, unit: 'quintal', display: 'Cotton (Medium Staple)' },
  'cotton (long staple)':   { msp: 7521, unit: 'quintal', display: 'Cotton (Long Staple)' },
  'cotton':            { msp: 7121, unit: 'quintal', display: 'Cotton' },
  'soyabean (yellow)': { msp: 4892, unit: 'quintal', display: 'Soybean' },
  'soyabean':          { msp: 4892, unit: 'quintal', display: 'Soybean' },
  'groundnut':         { msp: 6783, unit: 'quintal', display: 'Groundnut' },
  'moong':             { msp: 8682, unit: 'quintal', display: 'Moong Dal' },
  'urad':              { msp: 7400, unit: 'quintal', display: 'Urad Dal' },
  'tur (arhar)':       { msp: 7550, unit: 'quintal', display: 'Arhar/Tur' },
  'arhar':             { msp: 7550, unit: 'quintal', display: 'Arhar' },
  'sesame':            { msp: 9267, unit: 'quintal', display: 'Sesame (Til)' },
  'til':               { msp: 9267, unit: 'quintal', display: 'Til (Sesame)' },
  'sunflower':         { msp: 7280, unit: 'quintal', display: 'Sunflower Seed' },
  'nigerseed':         { msp: 8717, unit: 'quintal', display: 'Nigerseed' },

  // ── Rabi Crops ──────────────────────────────────────────────
  'gehun':             { msp: 2275, unit: 'quintal', display: 'Wheat' },
  'wheat':             { msp: 2275, unit: 'quintal', display: 'Wheat' },
  'barley':            { msp: 1735, unit: 'quintal', display: 'Barley' },
  'jau':               { msp: 1735, unit: 'quintal', display: 'Barley (Jau)' },
  'chana':             { msp: 5440, unit: 'quintal', display: 'Gram/Chana' },
  'gram':              { msp: 5440, unit: 'quintal', display: 'Gram' },
  'masur':             { msp: 6425, unit: 'quintal', display: 'Lentil (Masur)' },
  'lentil':            { msp: 6425, unit: 'quintal', display: 'Lentil' },
  'mustard':           { msp: 5650, unit: 'quintal', display: 'Mustard' },
  'sarson':            { msp: 5650, unit: 'quintal', display: 'Mustard (Sarson)' },
  'rapeseed':          { msp: 5650, unit: 'quintal', display: 'Rapeseed/Mustard' },
  'safflower':         { msp: 5800, unit: 'quintal', display: 'Safflower' },
};

/**
 * Looks up the MSP for a given commodity item name.
 * Performs a case-insensitive fuzzy match.
 *
 * @param {string} itemName - The commodity name from the community report (e.g. "Gehun", "Tamatar")
 * @param {string} unit     - The unit of the reported price ("kg" or "quintal")
 * @returns {{ msp: number, unit: string, display: string } | null}
 */
export function getMSP(itemName, unit = 'kg') {
  if (!itemName) return null;

  const key = itemName.trim().toLowerCase();

  // Direct match
  if (MSP_2024_25[key]) return MSP_2024_25[key];

  // Partial match — commodity name contains a known key
  const matchedKey = Object.keys(MSP_2024_25).find(
    (k) => key.includes(k) || k.includes(key)
  );

  return matchedKey ? MSP_2024_25[matchedKey] : null;
}

/**
 * Checks whether a reported price is critically below the MSP.
 * Normalizes both to the same unit before comparing.
 *
 * @param {string} itemName     - Commodity name
 * @param {number} reportedPrice - Price reported by the community member
 * @param {string} reportedUnit  - "kg" or "quintal"
 * @returns {boolean}
 */
export function isBelowMSP(itemName, reportedPrice, reportedUnit = 'kg') {
  const mspEntry = getMSP(itemName, reportedUnit);
  if (!mspEntry) return false;

  let priceInQuintals = reportedPrice;
  if (reportedUnit === 'kg') priceInQuintals = reportedPrice * 100;

  let mspInQuintals = mspEntry.msp;
  if (mspEntry.unit === 'kg') mspInQuintals = mspEntry.msp * 100;

  // Flag if reported price is > 5% below MSP
  return priceInQuintals < mspInQuintals * 0.95;
}
