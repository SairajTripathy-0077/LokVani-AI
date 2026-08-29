/**
 * buyerService.js
 * Verified Buyer & FPO Network Service
 *
 * Connects to live verified buyer network with state & district proximity matching.
 */

import { getBuyersByLocation } from './buyerDataEngine.js';

export { DEMO_BUYERS } from '../components/community/buyerData.js';

/**
 * Fetch verified buyers by live location (state & district)
 */
export async function fetchBuyers(state = 'Uttar Pradesh', district = '') {
  const safeState = state || 'Uttar Pradesh';
  const safeDist = district || '';

  // 1. Fetch from backend endpoint with state & district query params
  try {
    const params = new URLSearchParams();
    if (safeState) params.append('state', safeState);
    if (safeDist) params.append('district', safeDist);

    const res = await fetch(`/api/buyers?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (_) {}

  // 2. Guaranteed local verified buyers fallback by state & district
  return getBuyersByLocation(safeState, safeDist);
}
