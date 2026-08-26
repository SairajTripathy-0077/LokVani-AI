/**
 * buyerService.js
 * Verified Buyer & FPO Network Service
 *
 * AUTO-ACTIVATES when VITE_ENAM_API_KEY is set in .env
 * Falls back to DEMO_BUYERS if key is blank or API fails.
 *
 * Primary source : eNAM (National Agriculture Market) Trader API
 * Fallback source: data.gov.in FPO directory (uses VITE_DATA_GOV_API_KEY)
 * Static fallback : DEMO_BUYERS below
 */

const ENAM_KEY     = import.meta.env.VITE_ENAM_API_KEY;
const DATA_GOV_KEY = import.meta.env.VITE_DATA_GOV_API_KEY;

// eNAM API base — replace with the actual endpoint from enam.gov.in dashboard
const ENAM_BASE = 'https://enam.gov.in/web/trades/tradeAPI';

// data.gov.in FPO resource ID (Farmer Producer Organisations)
const FPO_RESOURCE = 'fdd07a73-7b70-4a16-9b5a-55fd75fb56d5';

/* ── Static fallback (used when API key is absent or API fails) ───────────── */
export const DEMO_BUYERS = [
  { id: 'buyer_001', name: 'FreshKart Foods Pvt. Ltd.',   location: 'Lucknow, UP',    distance: '62 km',  commodities: ['Tomato', 'Onion', 'Potato', 'Garlic'],   offerPrice: 2400, offerUnit: 'quintal', badge: 'FPO Partner',       contactInfo: '***-***-7890' },
  { id: 'buyer_002', name: 'Azamgarh APMC Warehouse',     location: 'Azamgarh, UP',   distance: '5 km',   commodities: ['Wheat', 'Paddy', 'Maize', 'Bajra'],      offerPrice: 2310, offerUnit: 'quintal', badge: 'APMC Registered',   contactInfo: '***-***-4421' },
  { id: 'buyer_003', name: 'Kisaan Connect Cooperative',  location: 'Varanasi, UP',   distance: '88 km',  commodities: ['Arhar', 'Moong', 'Urad', 'Chana'],       offerPrice: 7600, offerUnit: 'quintal', badge: 'FPO Partner',       contactInfo: '***-***-3312' },
  { id: 'buyer_004', name: 'Spice Route Exports',         location: 'Gorakhpur, UP',  distance: '110 km', commodities: ['Turmeric', 'Chili', 'Coriander', 'Sesame'], offerPrice: null, offerUnit: 'quintal', badge: 'Export Certified',  contactInfo: '***-***-0065' },
  { id: 'buyer_005', name: 'Agro-Nutrient Foods',         location: 'Allahabad, UP',  distance: '145 km', commodities: ['Soybean', 'Mustard', 'Sunflower'],        offerPrice: 4950, offerUnit: 'quintal', badge: 'Verified Buyer',    contactInfo: '***-***-6677' },
  { id: 'buyer_006', name: 'GrainMart Direct',            location: 'Mau, UP',        distance: '28 km',  commodities: ['Wheat', 'Paddy', 'Barley'],              offerPrice: 2290, offerUnit: 'quintal', badge: 'Verified Buyer',    contactInfo: '***-***-9801' },
];

/**
 * Fetch verified buyers from eNAM or data.gov.in FPO registry.
 * Automatically uses VITE_ENAM_API_KEY from .env.
 * Falls back to DEMO_BUYERS if key is missing or fetch fails.
 *
 * @param {string} state  - State to filter (default: Uttar Pradesh)
 */
export async function fetchBuyers(state = 'Uttar Pradesh') {
  // ── Try eNAM API ────────────────────────────────────────────────────────
  if (ENAM_KEY) {
    try {
      const url = `${ENAM_BASE}?key=${ENAM_KEY}&state=${encodeURIComponent(state)}&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`eNAM API responded ${res.status}`);
      const json = await res.json();

      const records = json.data || json.traders || json.records || [];
      if (records.length > 0) {
        return records.map((r, i) => ({
          id:          `enam_${i}`,
          name:        r.traderName || r.name || 'Unknown Trader',
          location:    `${r.market || r.mandi || ''}, ${r.district || ''}, ${r.state || state}`.replace(/^, |, $/, ''),
          distance:    null,
          commodities: (r.commodities || r.commodity || '').split(',').map(c => c.trim()).filter(Boolean),
          offerPrice:  r.offerPrice ? Number(r.offerPrice) : null,
          offerUnit:   'quintal',
          badge:       r.traderType || 'eNAM Registered',
          contactInfo: r.mobileNo ? r.mobileNo.replace(/\d(?=\d{4})/g, '*') : null,
        }));
      }
    } catch (err) {
      console.warn('[buyerService] eNAM fetch failed:', err.message);
    }
  }

  // ── Try data.gov.in FPO directory ────────────────────────────────────
  const govKey = DATA_GOV_KEY || ENAM_KEY;
  if (govKey) {
    try {
      const url = new URL(`https://api.data.gov.in/resource/${FPO_RESOURCE}`);
      url.searchParams.set('api-key', govKey);
      url.searchParams.set('format', 'json');
      url.searchParams.set('filters[state]', state);
      url.searchParams.set('limit', '20');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`data.gov.in FPO responded ${res.status}`);
      const json = await res.json();

      const records = json.records || [];
      if (records.length > 0) {
        return records.map((r, i) => ({
          id:          `fpo_${i}`,
          name:        r.fpo_name || r.name,
          location:    `${r.district || ''}, ${r.state || state}`.replace(/^, /, ''),
          distance:    null,
          commodities: (r.crops || r.commodities || '').split(',').map(c => c.trim()).filter(Boolean),
          offerPrice:  null,
          offerUnit:   'quintal',
          badge:       'FPO (data.gov.in)',
          contactInfo: null,
        }));
      }
    } catch (err) {
      console.warn('[buyerService] data.gov.in FPO fetch failed:', err.message);
    }
  }

  // ── Static fallback ───────────────────────────────────────────────────
  return DEMO_BUYERS;
}
