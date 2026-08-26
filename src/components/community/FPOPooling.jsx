/**
 * FPOPooling.jsx — Bilingual (Hindi / English)
 * FPO Aggregation & Harvest Pooling with full i18n via communityTranslations.js.
 *
 * Changes from v1: All labels, form fields, validation messages, and status
 * badges switch between Hindi and English via the `lang` prop.
 * Pool commodity names carry both _hi and _en variants.
 */

import React, { useState, useId } from 'react';
import { Users, Package, MapPin, Calendar, CheckCircle, PlusCircle, X } from 'lucide-react';
import { t } from './communityTranslations.js';

const INITIAL_POOLS = [
  {
    id: 'pool_001',
    commodity_hi: 'टमाटर',
    commodity_en: 'Tamatar (Tomato)',
    category_hi: 'सब्ज़ी',
    category_en: 'Vegetable',
    targetQtl: 100,
    filledQtl: 67,
    buyerName: 'FreshKart Foods Pvt. Ltd.',
    buyerLocation: 'Lucknow',
    offerPrice: 2400,
    deadline: '2026-08-29',
    qualityRequired: 'Grade A',
    status: 'OPEN',
    coordinatorName_hi: 'किराना नोड — आज़मगढ़',
    coordinatorName_en: 'Kirana Node — Azamgarh',
    participants: 8,
  },
  {
    id: 'pool_002',
    commodity_hi: 'गेहूं',
    commodity_en: 'Gehun (Wheat)',
    category_hi: 'अनाज',
    category_en: 'Grain',
    targetQtl: 500,
    filledQtl: 490,
    buyerName: 'Azamgarh APMC Warehouse',
    buyerLocation: 'Azamgarh',
    offerPrice: 2310,
    deadline: '2026-08-27',
    qualityRequired: 'Grade A / B',
    status: 'FILLING',
    coordinatorName_hi: 'किराना नोड — आज़मगढ़',
    coordinatorName_en: 'Kirana Node — Azamgarh',
    participants: 22,
  },
  {
    id: 'pool_003',
    commodity_hi: 'अरहर दाल',
    commodity_en: 'Arhar Dal (Tur)',
    category_hi: 'दाल',
    category_en: 'Pulse',
    targetQtl: 200,
    filledQtl: 30,
    buyerName: 'Kisaan Connect Cooperative',
    buyerLocation: 'Varanasi',
    offerPrice: 7600,
    deadline: '2026-09-05',
    qualityRequired: 'Grade A',
    status: 'OPEN',
    coordinatorName_hi: 'किराना नोड — मऊ',
    coordinatorName_en: 'Kirana Node — Mau',
    participants: 4,
  },
  {
    id: 'pool_004',
    commodity_hi: 'सरसों',
    commodity_en: 'Sarson (Mustard)',
    category_hi: 'तिलहन',
    category_en: 'Oilseed',
    targetQtl: 150,
    filledQtl: 150,
    buyerName: 'Agro-Nutrient Foods',
    buyerLocation: 'Allahabad',
    offerPrice: 5650,
    deadline: '2026-08-25',
    qualityRequired: 'Grade A',
    status: 'CLOSED',
    coordinatorName_hi: 'किराना नोड — इलाहाबाद',
    coordinatorName_en: 'Kirana Node — Allahabad',
    participants: 14,
  },
];

const STATUS_KEY_MAP = {
  OPEN:    'poolStatusOpen',
  FILLING: 'poolStatusFilling',
  CLOSED:  'poolStatusClosed',
};

const STATUS_COLOR = {
  OPEN:    { color: 'var(--accent-primary)', bg: 'rgba(72,115,79,0.09)' },
  FILLING: { color: 'var(--text-main)',      bg: 'var(--bg-hover)' },
  CLOSED:  { color: 'var(--text-dim)',       bg: 'var(--bg-hover)' },
};

function PoolProgressBar({ filled, target, status, lang }) {
  const pct = Math.min(100, Math.round((filled / target) * 100));
  const barColor = status === 'CLOSED' ? 'var(--text-dim)' : 'var(--accent-primary)';

  return (
    <div className="community-int__pool-progress">
      <div
        className="community-int__pool-progress__bar"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${filled} ${lang === 'hi' ? 'में से' : 'of'} ${target} ${t('perQtl', lang).replace('/', '')} ${t('poolFilled', lang)} (${pct}%)`}
      >
        <div className="community-int__pool-progress__fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="community-int__pool-progress__labels">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent-primary)' }}>{filled}</strong> / {target} {lang === 'hi' ? 'क्विंटल' : 'qtl'}
        </span>
        <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.75rem' }}>{pct}% {t('poolFilled', lang)}</span>
      </div>
    </div>
  );
}

function JoinPoolForm({ pool, onJoin, onClose, lang }) {
  const formId                      = useId();
  const [volume, setVolume]         = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [error, setError]           = useState('');
  const [submitted, setSubmitted]   = useState(false);

  const remaining = pool.targetQtl - pool.filledQtl;
  const coordName = lang === 'hi' ? pool.coordinatorName_hi : pool.coordinatorName_en;
  const commodity = lang === 'hi' ? pool.commodity_hi : pool.commodity_en;

  function handleSubmit(e) {
    e.preventDefault();
    const vol = Number(volume);
    if (!vol || vol <= 0)   { setError(t('errorVolumeInvalid', lang)); return; }
    if (vol > remaining)     { setError(t('errorVolumeExceed', lang));  return; }
    if (!farmerName.trim())  { setError(t('errorNameRequired', lang));  return; }
    setError('');
    onJoin({ poolId: pool.id, volume: vol, farmerName: farmerName.trim() });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="community-int__grievance-success" role="status" aria-live="polite">
        <CheckCircle size={28} color="var(--accent-primary)" aria-hidden="true" />
        <h5 style={{ margin: '8px 0 4px' }}>{t('joinSuccessTitle', lang)}</h5>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {lang === 'hi'
            ? `आपकी ${volume} क्विंटल ${commodity} इस पूल में जोड़ी गई। ${coordName} जल्द संपर्क करेंगे।`
            : `Your ${volume} qtl of ${commodity} has been added. ${coordName} will contact you before the deadline.`}
        </p>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '12px', fontSize: '0.85rem' }}>
          {t('closeBtn', lang)}
        </button>
      </div>
    );
  }

  return (
    <form className="community-int__grievance-form" onSubmit={handleSubmit} noValidate>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {t('poolDeadline', lang)}: <strong>{new Date(pool.deadline).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long' })}</strong>
        &nbsp;·&nbsp;{remaining} {t('remaining', lang)}
      </p>

      <div className="community-int__input-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-vol`}>
            {t('joinVolLabel', lang)} <span style={{ color: 'var(--ci-trend-down)' }}>*</span>
          </label>
          <input
            id={`${formId}-vol`}
            type="number"
            min="1"
            max={remaining}
            className="community-int__input"
            placeholder={`${lang === 'hi' ? 'अधिकतम' : 'Max'} ${remaining}`}
            value={volume}
            onChange={e => { setVolume(e.target.value); setError(''); }}
            aria-required="true"
          />
        </div>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-name`}>
            {t('joinNameLabel', lang)} <span style={{ color: 'var(--ci-trend-down)' }}>*</span>
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            className="community-int__input"
            placeholder={t('joinNamePlaceholder', lang)}
            value={farmerName}
            onChange={e => { setFarmerName(e.target.value); setError(''); }}
            aria-required="true"
            style={{ fontSize: lang === 'hi' ? '0.88rem' : '0.88rem' }}
          />
        </div>
      </div>

      {error && <p className="community-int__field-error" role="alert">{error}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>{t('cancelBtn', lang)}</button>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <CheckCircle size={13} aria-hidden="true" /> {t('joinConfirmBtn', lang)}
        </button>
      </div>
    </form>
  );
}

function PoolCard({ pool, onJoin, lang }) {
  const [showForm, setShowForm] = useState(false);
  const stCfg    = STATUS_COLOR[pool.status]   || STATUS_COLOR.OPEN;
  const statusLbl = t(STATUS_KEY_MAP[pool.status] || 'poolStatusOpen', lang);
  const commodity = lang === 'hi' ? pool.commodity_hi : pool.commodity_en;
  const category  = lang === 'hi' ? pool.category_hi  : pool.category_en;

  return (
    <article className="community-int__pool-card" aria-label={`${lang === 'hi' ? 'पूल' : 'Pool'}: ${commodity}`}>
      <header className="community-int__pool-card__header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h4 className="community-int__pool-card__name">{commodity}</h4>
            <span className="community-int__tag">{category}</span>
            <span className="community-int__feed-badge" style={{ color: stCfg.color, background: stCfg.bg }}>{statusLbl}</span>
          </div>
          <p className="community-int__pool-card__buyer">
            <Package size={12} aria-hidden="true" style={{ color: 'var(--accent-primary)', display: 'inline' }} />
            &nbsp;{pool.buyerName}
            <span style={{ marginLeft: '6px', color: 'var(--text-dim)' }}>
              <MapPin size={11} aria-hidden="true" style={{ display: 'inline' }} /> {pool.buyerLocation}
            </span>
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1 }}>
            ₹{pool.offerPrice.toLocaleString('en-IN')}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t('perQtl', lang)}</p>
        </div>
      </header>

      <PoolProgressBar filled={pool.filledQtl} target={pool.targetQtl} status={pool.status} lang={lang} />

      <div className="community-int__pool-card__meta">
        <span><Users size={12} aria-hidden="true" /> {pool.participants} {t('poolFarmers', lang)}</span>
        <span>
          <Calendar size={12} aria-hidden="true" />
          {t('poolDeadline', lang)}: {new Date(pool.deadline).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span>{t('poolQuality', lang)}: {pool.qualityRequired}</span>
      </div>

      {!showForm ? (
        <button
          type="button"
          className={pool.status === 'CLOSED' ? 'btn-secondary' : 'btn-primary'}
          style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }}
          onClick={() => setShowForm(true)}
          disabled={pool.status === 'CLOSED'}
        >
          <PlusCircle size={14} aria-hidden="true" />
          {pool.status === 'CLOSED' ? t('poolFull', lang) : t('addVolumeBtn', lang)}
        </button>
      ) : (
        <div className="community-int__pool-form-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{t('joinFormTitle', lang)}</p>
            <button type="button" onClick={() => setShowForm(false)} aria-label={t('closeBtn', lang)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={16} />
            </button>
          </div>
          <JoinPoolForm pool={pool} onJoin={data => { onJoin?.(data); }} onClose={() => setShowForm(false)} lang={lang} />
        </div>
      )}
    </article>
  );
}

export default function FPOPooling({ pools = INITIAL_POOLS, lang = 'en' }) {
  const [poolList, setPoolList] = useState(pools);

  function handleJoin({ poolId, volume }) {
    setPoolList(prev => prev.map(p => {
      if (p.id !== poolId) return p;
      const newFilled = Math.min(p.targetQtl, p.filledQtl + volume);
      return {
        ...p,
        filledQtl:    newFilled,
        participants: p.participants + 1,
        status:       newFilled >= p.targetQtl ? 'CLOSED' : newFilled >= p.targetQtl * 0.8 ? 'FILLING' : 'OPEN',
      };
    }));
  }

  return (
    <section className="community-int__section" aria-labelledby="ci-fpo-heading">
      <div className="community-int__section-header">
        <div>
          <h3 className="community-int__section-title" id="ci-fpo-heading">
            <Users size={18} color="var(--accent-primary)" aria-hidden="true" />
            {t('fpoSectionTitle', lang)}
            <span className="community-int__demo-label">{t('demoLabel', lang)}</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('fpoSectionSub', lang)}
          </p>
        </div>
      </div>
      <div className="community-int__pool-grid">
        {poolList.map(pool => <PoolCard key={pool.id} pool={pool} onJoin={handleJoin} lang={lang} />)}
      </div>
    </section>
  );
}
