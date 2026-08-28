/**
 * poolService.js
 * ──────────────────────────────────────────────────────────────────────────
 * Service for FPO Bulk Crop Selling Pools (Sell Together, Earn More).
 * Connects to the backend REST API (/api/pools) so all logged-in farmers
 * across different devices and sessions see live updates in real time.
 */

const API_BASE = '/api/pools';

/**
 * Fetch all active crop selling pools.
 * @param {string} [state]
 * @param {string} [district]
 * @param {string} [category]
 * @returns {Promise<Array>}
 */
export async function fetchCropPools(state = '', district = '', category = 'All') {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    if (category && category !== 'All') params.append('category', category);

    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(normalizePool);
    }
    return [];
  } catch (err) {
    console.warn('[poolService] Failed to fetch pools from backend:', err.message);
    return [];
  }
}

/**
 * Create a new FPO Crop Selling Pool.
 * @param {Object} poolData
 * @returns {Promise<Object>}
 */
export async function createCropPool(poolData) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poolData)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create crop pool');
    }
    return normalizePool(json.data);
  } catch (err) {
    console.error('[poolService] createCropPool failed:', err.message);
    throw err;
  }
}

/**
 * Join an existing crop pool by committing quantity.
 * @param {string} poolId
 * @param {Object} commitData { farmerName, phone, village, qtl }
 * @returns {Promise<Object>}
 */
export async function joinCropPool(poolId, commitData) {
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(poolId)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commitData)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to join harvest pool');
    }
    return normalizePool(json.data);
  } catch (err) {
    console.error('[poolService] joinCropPool failed:', err.message);
    throw err;
  }
}

function normalizePool(p) {
  if (!p) return null;
  return {
    id: p.poolId || p._id || p.id,
    poolId: p.poolId || p._id || p.id,
    commodity_hi: p.commodity_hi || p.commodity || 'फसल',
    commodity_en: p.commodity_en || p.commodity || 'Crop',
    category_hi: p.category_hi || 'सब्ज़ी',
    category_en: p.category_en || 'Vegetable',
    targetQtl: Number(p.targetQtl) || 100,
    filledQtl: Number(p.filledQtl) || 0,
    buyerName: p.buyerName || 'Verified Procurement Partner',
    buyerLocation: p.buyerLocation || 'APMC Mandi Hub',
    offerPrice: Number(p.offerPrice) || 2500,
    deadline: p.deadline || new Date().toISOString().split('T')[0],
    qualityRequired: p.qualityRequired || 'Grade A',
    status: p.status || 'OPEN',
    coordinatorName_hi: p.coordinatorName_hi || 'किराना ट्रस्ट नोड (सत्यापित)',
    coordinatorName_en: p.coordinatorName_en || 'Kirana Trust Node (Verified)',
    participants: Number(p.participants) || 1,
    members: Array.isArray(p.members) ? p.members : [],
    createdAt: p.createdAt
  };
}
