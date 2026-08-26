/**
 * logisticsService.js
 * Transport & Storage Board Service
 *
 * AUTO-ACTIVATES when VITE_DATA_GOV_API_KEY or VITE_NWR_API_KEY is set in .env
 * Falls back to DEMO_TRANSPORT / DEMO_STORAGE if keys are blank or API fails.
 *
 * Primary source : data.gov.in — Warehousing & Storage Facilities dataset
 * Secondary      : NWR (National Warehousing Corporation) open data
 * Static fallback: DEMO_TRANSPORT / DEMO_STORAGE below
 */

const DATA_GOV_KEY = import.meta.env.VITE_DATA_GOV_API_KEY;
const NWR_KEY      = import.meta.env.VITE_NWR_API_KEY || DATA_GOV_KEY;

// data.gov.in resource IDs
const WAREHOUSE_RESOURCE  = '5986de9b-74c6-4c80-a538-59fd0e613e5e'; // Warehousing capacity
const COLD_STORE_RESOURCE = '5c8f7a5e-bf44-4c1f-8e9f-4a00cd2d26a3'; // Cold storage

/* ── Static fallback data ─────────────────────────────────────────────────── */
export const DEMO_TRANSPORT = [
  { id: 'tr_001', operator: 'Manoj Transport Co.',       route_hi: 'आज़मगढ़ → लखनऊ',           route_en: 'Azamgarh → Lucknow',       departureDate: '2026-08-28', departureTime: '6:00 AM',  totalCapacity: 12, availableSpace: 4,    ratePerQtl: 280, vehicleType: '12T Tata LPT',        contact: '***-***-4421', status: 'AVAILABLE' },
  { id: 'tr_002', operator: 'Singh Freight Lines',       route_hi: 'मऊ → वाराणसी APMC',         route_en: 'Mau → Varanasi APMC',      departureDate: '2026-08-27', departureTime: '5:30 AM',  totalCapacity: 8,  availableSpace: 1.5,  ratePerQtl: 190, vehicleType: '8T Mini Truck',        contact: '***-***-7712', status: 'FILLING' },
  { id: 'tr_003', operator: 'Azamgarh Agri Movers',     route_hi: 'आज़मगढ़ → दिल्ली (आज़ादपुर)', route_en: 'Azamgarh → Delhi (Azadpur)',departureDate: '2026-08-30', departureTime: '10:00 PM', totalCapacity: 20, availableSpace: 12,   ratePerQtl: 420, vehicleType: '20T Refrigerated',    contact: '***-***-0093', status: 'AVAILABLE' },
  { id: 'tr_004', operator: 'Purwanchal Goods Carrier',  route_hi: 'गोरखपुर → पटना मंडी',       route_en: 'Gorakhpur → Patna Mandi',  departureDate: '2026-08-29', departureTime: '7:00 AM',  totalCapacity: 10, availableSpace: 0,    ratePerQtl: 310, vehicleType: '10T Ashok Leyland',   contact: '***-***-5588', status: 'FULL' },
];

export const DEMO_STORAGE = [
  { id: 'st_001', facilityName_hi: 'आज़मगढ़ कोल्ड चेन हब',    facilityName_en: 'Azamgarh Cold Chain Hub',    operator: 'UP Govt. Agri Storage',      type: 'COLD',      location: 'Azamgarh, UP',  totalCapacity: 5000,  availableCapacity: 1200, ratePerBag: 4.5, minDays: 7,  contact: '***-***-2210', status: 'AVAILABLE' },
  { id: 'st_002', facilityName_hi: 'मऊ अनाज गोदाम',           facilityName_en: 'Mau Grain Warehouse',        operator: 'Sharma & Sons',               type: 'DRY',       location: 'Mau, UP',       totalCapacity: 8000,  availableCapacity: 3400, ratePerBag: 2.8, minDays: 14, contact: '***-***-6631', status: 'AVAILABLE' },
  { id: 'st_003', facilityName_hi: 'वाराणसी APMC वेयरहाउस',  facilityName_en: 'Varanasi APMC Warehouse',    operator: 'APMC Board, Varanasi',        type: 'WAREHOUSE', location: 'Varanasi, UP',  totalCapacity: 15000, availableCapacity: 200,  ratePerBag: 3.2, minDays: 1,  contact: '***-***-4401', status: 'FILLING' },
  { id: 'st_004', facilityName_hi: 'गोरखपुर FPO कोल्ड स्टोर', facilityName_en: 'Gorakhpur FPO Cold Store',  operator: 'Kisaan Connect Coop',         type: 'COLD',      location: 'Gorakhpur, UP', totalCapacity: 3000,  availableCapacity: 0,    ratePerBag: 5.0, minDays: 7,  contact: '***-***-9900', status: 'FULL' },
];

/**
 * Fetch storage facilities from data.gov.in warehousing dataset.
 * Uses VITE_DATA_GOV_API_KEY or VITE_NWR_API_KEY from .env.
 * Falls back to DEMO_STORAGE if key is missing or fetch fails.
 *
 * @param {string} state - State to filter (default: Uttar Pradesh)
 */
export async function fetchStorage(state = 'Uttar Pradesh') {
  if (!NWR_KEY) return DEMO_STORAGE;

  // Try cold storage dataset first
  for (const resourceId of [COLD_STORE_RESOURCE, WAREHOUSE_RESOURCE]) {
    try {
      const url = new URL(`https://api.data.gov.in/resource/${resourceId}`);
      url.searchParams.set('api-key', NWR_KEY);
      url.searchParams.set('format', 'json');
      url.searchParams.set('filters[state]', state);
      url.searchParams.set('limit', '20');

      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const json = await res.json();
      const records = json.records || [];

      if (records.length > 0) {
        return records.map((r, i) => {
          const total     = Number(r.total_capacity || r.capacity || 5000);
          const available = Number(r.available_capacity || total * 0.4);
          return {
            id:               `gov_st_${i}`,
            facilityName_hi:  r.name_hindi || r.facility_name || r.name,
            facilityName_en:  r.facility_name || r.name,
            operator:         r.operator || r.agency || 'Government',
            type:             (r.type || '').toUpperCase().includes('COLD') ? 'COLD'
                              : (r.type || '').toUpperCase().includes('WARE') ? 'WAREHOUSE'
                              : 'DRY',
            location:         `${r.district || r.city || ''}, ${r.state || state}`.replace(/^, /, ''),
            totalCapacity:    total,
            availableCapacity: available,
            ratePerBag:       Number(r.rate_per_bag || r.rate || 3.5),
            minDays:          Number(r.min_days || 7),
            contact:          r.contact ? r.contact.replace(/\d(?=\d{4})/g, '*') : '***-***-0000',
            status:           available === 0 ? 'FULL' : available < total * 0.15 ? 'FILLING' : 'AVAILABLE',
          };
        });
      }
    } catch (err) {
      console.warn('[logisticsService] Storage fetch failed:', err.message);
    }
  }

  return DEMO_STORAGE;
}

/**
 * Fetch transport listings.
 * Note: No government open API for transport exists yet.
 * Returns DEMO_TRANSPORT until eNAM/NWR transport API is available.
 */
export async function fetchTransport() {
  // Future: integrate eNAM vehicle booking API when available
  return DEMO_TRANSPORT;
}
