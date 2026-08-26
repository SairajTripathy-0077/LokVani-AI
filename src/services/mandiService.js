/**
 * mandiService.js
 * Live Mandi Price & Commodity Intelligence Service
 *
 * AUTO-ACTIVATES when VITE_DATA_GOV_API_KEY is set in .env
 * Falls back to static demo data if key is blank or API fails.
 *
 * Data source: data.gov.in
 * Dataset: Current Daily Price of Various Commodities from Various Markets (Mandi)
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 */

const DATA_GOV_KEY   = import.meta.env.VITE_DATA_GOV_API_KEY;
const MANDI_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';

/* ── Category mapping by commodity name ──────────────────────────────────── */
const CATEGORY_MAP = {
  tomato: 'Vegetable', onion: 'Vegetable', potato: 'Vegetable',
  tamatar: 'Vegetable', pyaaz: 'Vegetable', aloo: 'Vegetable',
  garlic: 'Vegetable', cauliflower: 'Vegetable', cabbage: 'Vegetable',
  wheat: 'Grain', gehun: 'Grain', paddy: 'Grain', rice: 'Grain',
  maize: 'Grain', bajra: 'Grain', jowar: 'Grain',
  arhar: 'Pulse', moong: 'Pulse', urad: 'Pulse', chana: 'Pulse',
  lentil: 'Pulse', masoor: 'Pulse',
  mustard: 'Oilseed', sarson: 'Oilseed', soybean: 'Oilseed',
  sunflower: 'Oilseed', groundnut: 'Oilseed',
  mango: 'Fruit', banana: 'Fruit', guava: 'Fruit', apple: 'Fruit',
  turmeric: 'Spice', chili: 'Spice', coriander: 'Spice', ginger: 'Spice',
};

function detectCategory(commodityName) {
  const lower = (commodityName || '').toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return 'Other';
}

/* ── Static fallback data (used when API key is absent or API fails) ──────── */
export const INITIAL_MANDI_RATES = [
  { id: 'm1', item: 'Tamatar (Tomato)', price: 28, unit: 'kg',      location: 'Azamgarh Mandi',  state: 'Uttar Pradesh', trend: 'down',   category: 'Vegetable', reportedBy: 'Mandi Board', createdAt: new Date().toISOString() },
  { id: 'm2', item: 'Pyaaz (Onion)',    price: 34, unit: 'kg',      location: 'Gorakhpur Mandi', state: 'Uttar Pradesh', trend: 'stable', category: 'Vegetable', reportedBy: 'Local Farmer', createdAt: new Date().toISOString() },
  { id: 'm3', item: 'Aloo (Potato)',    price: 18, unit: 'kg',      location: 'Varanasi Mandi',  state: 'Uttar Pradesh', trend: 'up',     category: 'Vegetable', reportedBy: 'Mandi Board', createdAt: new Date().toISOString() },
  { id: 'm4', item: 'Gehun (Wheat)',    price: 2275, unit: 'quintal', location: 'Kanpur Mandi',  state: 'Uttar Pradesh', trend: 'stable', category: 'Grain',     reportedBy: 'MSP Portal', createdAt: new Date().toISOString() },
  { id: 'm5', item: 'Dhan (Paddy)',     price: 2183, unit: 'quintal', location: 'Patna Mandi',   state: 'Bihar',         trend: 'up',     category: 'Grain',     reportedBy: 'MSP Portal', createdAt: new Date().toISOString() },
  { id: 'm6', item: 'Sarson (Mustard)', price: 5450, unit: 'quintal', location: 'Jaipur Mandi',  state: 'Rajasthan',     trend: 'stable', category: 'Oilseed',   reportedBy: 'Mandi Board', createdAt: new Date().toISOString() },
  { id: 'm7', item: 'Chana (Gram)',     price: 5800, unit: 'quintal', location: 'Indore Mandi',  state: 'Madhya Pradesh', trend: 'down',  category: 'Pulse',     reportedBy: 'Mandi Board', createdAt: new Date().toISOString() },
  { id: 'm8', item: 'Kapaas (Cotton)',  price: 7120, unit: 'quintal', location: 'Rajkot Mandi',  state: 'Gujarat',       trend: 'up',     category: 'Other',     reportedBy: 'Mandi Board', createdAt: new Date().toISOString() },
];

/**
 * Fetch live mandi rates from data.gov.in.
 * Automatically uses the API key from VITE_DATA_GOV_API_KEY in .env.
 * Falls back to INITIAL_MANDI_RATES if key is missing or fetch fails.
 *
 * @param {string} state    - State to filter (default: Uttar Pradesh)
 * @param {number} limit    - Max records to fetch (default: 50)
 */
export async function fetchLiveMandiRates(state = 'Uttar Pradesh', limit = 50) {
  // ── Try data.gov.in live API first ─────────────────────────────────────
  if (DATA_GOV_KEY) {
    try {
      const url = new URL(`https://api.data.gov.in/resource/${MANDI_RESOURCE}`);
      url.searchParams.set('api-key', DATA_GOV_KEY);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('filters[state]', state);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`data.gov.in responded ${res.status}`);
      const json = await res.json();

      if (json.records && json.records.length > 0) {
        return json.records.map((r, i) => ({
          id:          `gov_${i}_${r.commodity}_${r.market}`,
          item:        r.commodity,
          price:       Number(r.modal_price) || Number(r.min_price) || 0,
          unit:        'quintal',
          location:    `${r.market}, ${r.district}`,
          state:       r.state,
          trend:       'stable',                        // live API doesn't provide trend
          category:    detectCategory(r.commodity),
          reportedBy:  'data.gov.in (Mandi Board)',
          createdAt: (() => {
            if (r.arrival_date && r.arrival_date.includes('/')) {
              const [dd, mm, yyyy] = r.arrival_date.split('/');
              if (dd && mm && yyyy) return new Date(`${yyyy}-${mm}-${dd}`).toISOString();
            }
            return new Date().toISOString();
          })(),
        }));
      }
    } catch (err) {
      console.warn('[mandiService] data.gov.in fetch failed, using fallback:', err.message);
    }
  }

  // ── Try backend /api/intel endpoint ───────────────────────────────────
  try {
    const res = await fetch('/api/intel');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) return json.data;
    }
  } catch (_) {}

  // ── Static fallback ───────────────────────────────────────────────────
  return INITIAL_MANDI_RATES;
}
