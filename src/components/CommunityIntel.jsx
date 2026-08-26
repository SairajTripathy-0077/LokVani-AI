/**
 * CommunityIntel.jsx  (page-level orchestrator)
 * ──────────────────────────────────────────────────────────────────────────
 * "Local Farming Updates" page — the main hub where farmers can:
 *   • See today's crop prices from nearby markets
 *   • Find trusted buyers in their area
 *   • Get live weather for their region
 *   • Share a price they saw at the market
 *   • Read the latest news and alerts from fellow farmers
 *
 * Architecture:
 *   This component owns page-level state and data fetching.
 *   All rendering is delegated to focused sub-components in ./community/.
 *
 * Sections:
 *   1. Stats Summary Row        — Quick stats: reports, top crop, avg price
 *   2. Best Time to Sell Banner — AI-computed sale window advisory
 *   3. Search + Filter Controls — Find prices by crop name or category
 *   4. Today's Crop Prices Grid — Price cards / loading skeletons / empty state
 *   5. Buyers Near You          — Trusted local buyer contacts
 *   6. Compare Prices Table     — Min / avg / max per crop across markets
 *   7. Latest News Feed         — Crowdsourced alerts from other farmers
 *   8. Sell Together (FPO)      — Group selling to get better rates
 *   9. Transport & Storage      — Share trucks and storage space
 *  10. Trust & Safety           — Buyer ratings and complaint form
 *  11. Weather                  — Live regional weather advisory
 *
 * State is managed with useReducer for predictable, testable transitions.
 *
 * UX/UI Refactor Notes (Hackathon PR):
 *   - Page title changed from "Community Intel" → "Local Farming Updates"
 *   - All jargon removed; terminology rewritten for farmers (Class 5–8 literacy)
 *   - CTAs made action-oriented: "Share a Price", "Share Information"
 *   - Verbose subtitles shortened to one clear sentence
 *   - API provider names hidden from UI (farmers don't need to see them)
 */

import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { t } from './community/communityTranslations.js';
import { fetchLiveMandiRates } from '../services/mandiService';
import { fetchLiveWeatherData } from '../services/realDataService';
import { fetchBuyers }          from '../services/buyerService';
import { fetchTransport, fetchStorage } from '../services/logisticsService';

const REGIONS = ['Azamgarh', 'Gorakhpur', 'Varanasi', 'Lucknow'];

// ── Scoped styles (never touches index.css) ──────────────────────────────────
import '../styles/community.css';

// ── Sub-components ────────────────────────────────────────────────────────────
import PriceCard        from './community/PriceCard.jsx';
import SkeletonCard     from './community/SkeletonCard.jsx';
import BuyerCard        from './community/BuyerCard.jsx';
import SubmitReportModal from './community/SubmitReportModal.jsx';
import Toast            from './community/Toast.jsx';
import SaleWindowBanner     from './community/SaleWindowBanner.jsx';
import IntelFeed           from './community/IntelFeed.jsx';
import TrustSystem         from './community/TrustSystem.jsx';
import FPOPooling          from './community/FPOPooling.jsx';
import LogisticsStorage    from './community/LogisticsStorage.jsx';

// ── Data ──────────────────────────────────────────────────────────────────────
import { DEMO_BUYERS } from './community/buyerData.js';

// ── Icons ─────────────────────────────────────────────────────────────────────
import {
  Globe,
  TrendingUp,
  PlusCircle,
  RefreshCw,
  Search,
  CloudSun,
  Users,
  BarChart2,
  Inbox,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════════
   State Management — useReducer
   ══════════════════════════════════════════════════════════════════════════════ */

const INITIAL_STATE = {
  intelList:    [],
  buyers:       [],
  transport:    [],
  storage:      [],
  loading:      true,
  submitting:   false,
  showModal:    false,
  toast:        null,       // { message, type } | null
  searchQuery:  '',
  activeCategory: 'All',
  selectedRegion: 'Azamgarh',
  regionWeather: null,
};

const CATEGORIES_CONFIG = [
  { key: 'All',       hi: 'सभी',    en: 'All' },
  { key: 'Vegetable', hi: 'सब्ज़ी',  en: 'Vegetable' },
  { key: 'Grain',     hi: 'अनाज',  en: 'Grain' },
  { key: 'Pulse',     hi: 'दाल',    en: 'Pulse' },
  { key: 'Spice',     hi: 'मसाले', en: 'Spice' },
  { key: 'Fruit',     hi: 'फल',    en: 'Fruit' },
  { key: 'Oilseed',   hi: 'तिलहन', en: 'Oilseed' },
  { key: 'Other',     hi: 'अन्य',  en: 'Other' },
];
const CATEGORIES = CATEGORIES_CONFIG.map(c => c.key);

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, intelList: action.payload };
    case 'SET_BUYERS':
      return { ...state, buyers: action.payload };
    case 'SET_TRANSPORT':
      return { ...state, transport: action.payload };
    case 'SET_STORAGE':
      return { ...state, storage: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false };
    case 'PREPEND_ITEM':
      return { ...state, intelList: [action.payload, ...state.intelList] };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'OPEN_MODAL':
      return { ...state, showModal: true };
    case 'CLOSE_MODAL':
      return { ...state, showModal: false, submitting: false };
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, type: action.toastType } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_REGION_WEATHER':
      return { ...state, selectedRegion: action.region, regionWeather: action.weather };
    default:
      return state;
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   Derived Stats Helper
   ══════════════════════════════════════════════════════════════════════════════ */

function computeStats(intelList) {
  if (!intelList || intelList.length === 0) {
    return { total: 0, topCommodity: '—', avgPriceKg: '—' };
  }

  // Top commodity by number of reports
  const counts = {};
  intelList.forEach((r) => {
    const k = r.item?.trim() || 'Unknown';
    counts[k] = (counts[k] || 0) + 1;
  });
  const topCommodity = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Average price per kg (normalise quintal → kg)
  const kgPrices = intelList.map((r) =>
    r.unit === 'quintal' ? r.price / 100 : r.price
  ).filter(Boolean);
  const avgPriceKg = kgPrices.length
    ? `₹${(kgPrices.reduce((s, p) => s + p, 0) / kgPrices.length).toFixed(0)}/kg`
    : '—';

  return { total: intelList.length, topCommodity, avgPriceKg };
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════════════ */

export default function CommunityIntel() {
  const { liveWeather, language } = useApp();
  const lang = language || 'hi'; // default hi for farmers
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const { intelList, buyers, transport, storage, loading, submitting, showModal, toast, searchQuery, activeCategory, selectedRegion, regionWeather } = state;

  const handleRegionChange = async (city) => {
    dispatch({ type: 'SET_REGION_WEATHER', region: city, weather: regionWeather });
    const w = await fetchLiveWeatherData(city);
    dispatch({ type: 'SET_REGION_WEATHER', region: city, weather: w });
  };

  /* ── Data Fetching ───────────────────────────────────────────────────────── */
  const fetchIntel = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchLiveMandiRates();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      console.error('Error loading intel dataset:', err);
      dispatch({ type: 'FETCH_ERROR' });
    }
  }, []);

  useEffect(() => {
    fetchIntel();

    // Fetch buyers from buyerService (eNAM / data.gov.in / fallback)
    fetchBuyers().then(data => dispatch({ type: 'SET_BUYERS', payload: data })).catch(() => {});

    // Fetch transport & storage from logisticsService
    fetchTransport().then(data => dispatch({ type: 'SET_TRANSPORT', payload: data })).catch(() => {});
    fetchStorage().then(data  => dispatch({ type: 'SET_STORAGE',   payload: data })).catch(() => {});
  }, [fetchIntel]);

  /* ── Form Submission ─────────────────────────────────────────────────────── */
  const handleSubmit = useCallback(async (formData) => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      const res = await fetch('/api/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const text = await res.text();
      let json = {};
      try { json = JSON.parse(text); } catch (_) {}
      if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
      dispatch({ type: 'PREPEND_ITEM', payload: json.data });
      dispatch({ type: 'CLOSE_MODAL' });
      dispatch({ type: 'SHOW_TOAST', message: 'Price report submitted successfully!', toastType: 'success' });
    } catch (err) {
      console.error('[CommunityIntel] POST /api/intel failed:', err.message);
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      dispatch({ type: 'SHOW_TOAST', message: 'Failed to submit report. Please try again.', toastType: 'error' });
    }
  }, []);

  /* ── Filtered / Searched Intel List ─────────────────────────────────────── */
  const filteredList = useMemo(() => {
    let list = intelList;

    // Category filter
    if (activeCategory !== 'All') {
      list = list.filter(
        (r) => r.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Text search — matches item name or location (case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.item?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [intelList, searchQuery, activeCategory]);

  /* ── Derived Stats ───────────────────────────────────────────────────────── */
  const stats = useMemo(() => computeStats(intelList), [intelList]);

  /* ══════════════════════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    // UX Change: aria-label updated to use plain language for screen readers
    <main className="community-int__page" aria-label={lang === 'hi' ? 'सामुदायिक मंडी जानकारी' : 'Local Farming Updates'}>

      {/* ── SECTION 1 — Page Header + Stats ── */}
      <section className="community-int__section" aria-labelledby="ci-page-heading">
        <div className="community-int__section-header">
          <div>
            <p className="community-int__eyebrow">
              <Globe size={13} aria-hidden="true" />
              {t('pageEyebrow', lang)}
            </p>
            <h2 id="ci-page-heading" style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: '4px 0' }}>
              {t('pageTitle', lang)}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '560px', marginTop: '4px', lineHeight: 1.55 }}>
              {t('pageSubtitle', lang)}
            </p>
          </div>

          <button
            onClick={() => dispatch({ type: 'OPEN_MODAL' })}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            aria-label={t('reportBtn', lang)}
          >
            <PlusCircle size={16} aria-hidden="true" />
            {t('reportBtn', lang)}
          </button>
        </div>

        {/* Stats row — shows quick totals at a glance */}
        <div className="community-int__stats-row" role="list" aria-label={lang === 'hi' ? 'बाज़ार सारांश' : 'Quick stats'}>
          <div className="community-int__stat-card" role="listitem">
            <p className="community-int__stat-label">{t('statTotalLabel', lang)}</p>
            <p className="community-int__stat-value">{stats.total}</p>
            <p className="community-int__stat-sub">{t('statTotalSub', lang)}</p>
          </div>
          <div className="community-int__stat-card" role="listitem">
            <p className="community-int__stat-label">{t('statTopLabel', lang)}</p>
            <p className="community-int__stat-value" style={{ fontSize: '1.1rem', paddingTop: '4px' }}>{stats.topCommodity}</p>
            <p className="community-int__stat-sub">{t('statTopSub', lang)}</p>
          </div>
          <div className="community-int__stat-card" role="listitem">
            <p className="community-int__stat-label">{t('statAvgLabel', lang)}</p>
            <p className="community-int__stat-value" style={{ fontSize: '1.2rem', paddingTop: '2px' }}>{stats.avgPriceKg}</p>
            <p className="community-int__stat-sub">{t('statAvgSub', lang)}</p>
          </div>
          <div className="community-int__stat-card" role="listitem">
            <p className="community-int__stat-label">{t('statBuyersLabel', lang)}</p>
            <p className="community-int__stat-value">{buyers.length || '—'}</p>
            <p className="community-int__stat-sub">{t('statBuyersSub', lang)}</p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 2 — Price Intelligence Board
          ──────────────────────────────────────────────────────────────────── */}
      <section className="community-int__section" aria-labelledby="ci-prices-heading">
        <div className="community-int__section-header">
          <h3 className="community-int__section-title" id="ci-prices-heading">
            <TrendingUp size={18} color="var(--accent-cyan)" aria-hidden="true" />
            {t('pricesSectionTitle', lang)}
            {!loading && (
              <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>
                ({filteredList.length} / {intelList.length})
              </span>
            )}
          </h3>
          <button onClick={fetchIntel} className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
            aria-label={t('refreshBtn', lang)} disabled={loading}>
            <RefreshCw size={13} aria-hidden="true" /> {t('refreshBtn', lang)}
          </button>
        </div>

        {/* Sale Window Advisory Banner */}
        {!loading && intelList.length > 0 && (
          <SaleWindowBanner intelList={intelList} />
        )}

        {/* ── Search + Category Filter Controls */}
        <div className="community-int__controls" role="search" aria-label={t('searchAriaLabel', lang)}>
          <div className="community-int__search-wrap">
            <Search size={15} className="community-int__search-icon" aria-hidden="true" />
            <input type="search" id="ci-search" className="community-int__search-input"
              placeholder={t('searchPlaceholder', lang)}
              value={searchQuery}
              onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              aria-label={t('searchAriaLabel', lang)}
            />
          </div>
          {/* UX Change: Filter pills use translated labels — no hardcoded English */}
          <ul className="community-int__filter-pills" role="group" aria-label={lang === 'hi' ? 'श्रेणी से फ़िल्टर करें' : 'Filter by crop type'}>
            {CATEGORIES_CONFIG.map(cat => (
              <li key={cat.key}>
                <button type="button"
                  className={`community-int__pill ${activeCategory === cat.key ? 'community-int__pill--active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat.key })}
                  aria-pressed={activeCategory === cat.key}>
                  {lang === 'hi' ? cat.hi : cat.en}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Grid — Skeleton | PriceCards | Empty State */}
        <div className="community-int__grid" aria-busy={loading} aria-live="polite" aria-label={t('pricesSectionTitle', lang)}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
          ) : filteredList.length > 0 ? (
            filteredList.map(ci => (
              <PriceCard key={ci._id || ci.id}
                item={ci.item} price={ci.price} unit={ci.unit}
                location={ci.location} trend={ci.trend}
                reportedBy={ci.reportedBy} category={ci.category}
                createdAt={ci.createdAt} lang={lang}
              />
            ))
          ) : (
            <div className="community-int__empty" role="status">
              <Inbox size={30} strokeWidth={1.25} style={{ color: 'var(--text-dim)', marginBottom: 12 }} aria-hidden="true" />
              <h4 className="community-int__empty-title">{t('emptyTitle', lang)}</h4>
              <p className="community-int__empty-sub">
                {searchQuery || activeCategory !== 'All'
                  ? t('emptySubFilter', lang)
                  : t('emptySubDefault', lang)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 3 — Verified Buyer Network
          ──────────────────────────────────────────────────────────────────── */}
      <section className="community-int__section" aria-labelledby="ci-buyers-heading">
        <div className="community-int__section-header">
          <div>
            <h3 className="community-int__section-title" id="ci-buyers-heading">
              <Users size={18} color="var(--accent-primary)" aria-hidden="true" />
              {t('buyersSectionTitle', lang)}
              <span className="community-int__demo-label" aria-label={t('demoLabel', lang)}>{t('demoLabel', lang)}</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
              {t('buyersSectionSub', lang)}
            </p>
          </div>
        </div>
        <div className="community-int__buyer-grid">
          {(buyers.length > 0 ? buyers : []).map((buyer, i) => (
            <BuyerCard key={buyer.id || `b_${i}`} {...buyer} lang={lang} />
          ))}
          {buyers.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1/-1', padding: '16px 0' }}>
              {lang === 'hi' ? 'खरीदार लोड हो रहे हैं…' : 'Loading buyers…'}
            </p>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 4 — Compare Prices Across Markets
          UX Change: Section title now uses t() so it respects language setting
          ──────────────────────────────────────────────────────────────────── */}
      {!loading && intelList.length > 1 && (
        <section className="community-int__section" aria-labelledby="ci-compare-heading">
          <div className="community-int__section-header">
            <h3 className="community-int__section-title" id="ci-compare-heading">
              <BarChart2 size={18} color="var(--accent-gold)" aria-hidden="true" />
              {t('compareSectionTitle', lang)}
            </h3>
          </div>

          {/* Compare min / avg / max prices per crop across mandis */}
          <ComparisonTable intelList={intelList} lang={lang} />
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 5 — Real-Time Intel Feed
          ──────────────────────────────────────────────────────────────────── */}
      <IntelFeed lang={lang} />

      {/* ── SECTION 6 — FPO Pooling ── */}
      <FPOPooling lang={lang} />

      {/* ── SECTION 7 — Logistics ── */}
      <LogisticsStorage lang={lang} transportItems={transport.length > 0 ? transport : undefined} storageItems={storage.length > 0 ? storage : undefined} />

      {/* ── SECTION 8 — Trust System ── */}
      <TrustSystem lang={lang} />

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 9 — Live Regional Weather
          UX Change: Section title uses t() to hide API name from farmers
          ──────────────────────────────────────────────────────────────────── */}
      <section className="community-int__section" aria-labelledby="ci-weather-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px', gap: '8px' }}>
          <h3 className="community-int__section-title" id="ci-weather-heading" style={{ marginBottom: 0 }}>
            <CloudSun size={18} color="var(--accent-gold)" aria-hidden="true" />
            {t('weatherTitle', lang)}
          </h3>
          {/* UX Change: Region selector pills labelled clearly for screen readers */}
          <div style={{ display: 'flex', gap: '4px' }} role="group" aria-label={lang === 'hi' ? 'अपना क्षेत्र चुनें' : 'Choose your area'}>
            {REGIONS.map(reg => (
              <button type="button" key={reg} onClick={() => handleRegionChange(reg)}
                className={`community-int__pill ${selectedRegion === reg ? 'community-int__pill--active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                aria-pressed={selectedRegion === reg}>
                {reg}
              </button>
            ))}
          </div>
        </div>
        <div className="community-int__weather-box">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {regionWeather ? regionWeather.advisory_en : (liveWeather ? liveWeather.advisory_en : t('weatherDefault', lang))}
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          MODALS & OVERLAYS
          ──────────────────────────────────────────────────────────────────── */}

      {/* Accessible Submit Modal */}
      <SubmitReportModal
        isOpen={showModal}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />

      {/* ── Toast Notification ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => dispatch({ type: 'CLEAR_TOAST' })}
        />
      )}
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ComparisonTable — inline sub-component (used only in this file)
   Groups intelList by crop and shows lowest / average / highest price per kg.

   UX Change: Column headers now use the translation dictionary (t()) so they
   display in the correct language (Hindi / English) based on user preference.
   Heading text changed: "Commodity" → "Crop", "Min" → "Lowest", "Max" → "Highest".
   ══════════════════════════════════════════════════════════════════════════════ */

function ComparisonTable({ intelList, lang = 'en' }) {
  // Build grouped data
  const groups = useMemo(() => {
    const map = {};
    intelList.forEach((r) => {
      if (!r.item || r.price == null) return;
      const key = r.item.trim();
      if (!map[key]) map[key] = { name: key, prices: [] };
      // Normalise to per-kg for consistent display
      const pricePerKg = r.unit === 'quintal' ? r.price / 100 : r.price;
      map[key].prices.push(pricePerKg);
    });

    return Object.values(map)
      .filter((g) => g.prices.length >= 2) // Only show crops with multiple data points
      .map((g) => ({
        name: g.name,
        min:  Math.min(...g.prices),
        max:  Math.max(...g.prices),
        avg:  g.prices.reduce((s, p) => s + p, 0) / g.prices.length,
        count: g.prices.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 crops by number of reports
  }, [intelList]);

  if (groups.length === 0) return null;

  // UX Change: Column headers resolved via t() — correct language, no hardcoded English
  const columns = [
    { key: 'colCommodity', align: 'left'  },
    { key: 'colMin',       align: 'right' },
    { key: 'colAvg',       align: 'right' },
    { key: 'colMax',       align: 'right' },
    { key: 'colReports',   align: 'right' },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}
        aria-label={t('compareSectionTitle', lang)}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  padding: '8px 12px',
                  textAlign: col.align,
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t(col.key, lang)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr
              key={g.name}
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                {g.name}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--ci-trend-down)' }}>
                ₹{g.min.toFixed(1)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                ₹{g.avg.toFixed(1)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--ci-trend-up)' }}>
                ₹{g.max.toFixed(1)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-dim)' }}>
                {g.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
