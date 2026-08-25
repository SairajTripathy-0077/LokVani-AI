/**
 * LogisticsStorage.jsx — Bilingual (Hindi / English)
 * Logistics & Storage Sharing Board with full i18n via communityTranslations.js.
 *
 * Changes from v1: Tabs, card labels, booking form, validation errors,
 * and success messages all switch between Hindi and English via `lang` prop.
 */

import React, { useState, useId } from 'react';
import { Truck, Warehouse, MapPin, Calendar, Phone, CheckCircle, Clock, Thermometer, Package } from 'lucide-react';
import { t } from './communityTranslations.js';

const DEMO_TRANSPORT = [
  { id: 'tr_001', operator: 'Manoj Transport Co.', route_hi: 'आज़मगढ़ → लखनऊ', route_en: 'Azamgarh → Lucknow', departureDate: '2026-08-28', departureTime: '6:00 AM', totalCapacity: 12, availableSpace: 4, ratePerQtl: 280, vehicleType: '12T Tata LPT', contact: '***-***-4421', status: 'AVAILABLE' },
  { id: 'tr_002', operator: 'Singh Freight Lines', route_hi: 'मऊ → वाराणसी APMC', route_en: 'Mau → Varanasi APMC', departureDate: '2026-08-27', departureTime: '5:30 AM', totalCapacity: 8, availableSpace: 1.5, ratePerQtl: 190, vehicleType: '8T Mini Truck', contact: '***-***-7712', status: 'FILLING' },
  { id: 'tr_003', operator: 'Azamgarh Agri Movers', route_hi: 'आज़मगढ़ → दिल्ली (आज़ादपुर)', route_en: 'Azamgarh → Delhi (Azadpur)', departureDate: '2026-08-30', departureTime: '10:00 PM', totalCapacity: 20, availableSpace: 12, ratePerQtl: 420, vehicleType: '20T Refrigerated', contact: '***-***-0093', status: 'AVAILABLE' },
  { id: 'tr_004', operator: 'Purwanchal Goods Carrier', route_hi: 'गोरखपुर → पटना मंडी', route_en: 'Gorakhpur → Patna Mandi', departureDate: '2026-08-29', departureTime: '7:00 AM', totalCapacity: 10, availableSpace: 0, ratePerQtl: 310, vehicleType: '10T Ashok Leyland', contact: '***-***-5588', status: 'FULL' },
];

const DEMO_STORAGE = [
  { id: 'st_001', facilityName_hi: 'आज़मगढ़ कोल्ड चेन हब', facilityName_en: 'Azamgarh Cold Chain Hub', operator: 'UP Govt. Agri Storage', type: 'COLD', location: 'Azamgarh, UP', totalCapacity: 5000, availableCapacity: 1200, ratePerBag: 4.5, minDays: 7, contact: '***-***-2210', status: 'AVAILABLE' },
  { id: 'st_002', facilityName_hi: 'मऊ अनाज गोदाम', facilityName_en: 'Mau Grain Warehouse', operator: 'Sharma & Sons', type: 'DRY', location: 'Mau, UP', totalCapacity: 8000, availableCapacity: 3400, ratePerBag: 2.8, minDays: 14, contact: '***-***-6631', status: 'AVAILABLE' },
  { id: 'st_003', facilityName_hi: 'वाराणसी APMC वेयरहाउस', facilityName_en: 'Varanasi APMC Warehouse', operator: 'APMC Board, Varanasi', type: 'WAREHOUSE', location: 'Varanasi, UP', totalCapacity: 15000, availableCapacity: 200, ratePerBag: 3.2, minDays: 1, contact: '***-***-4401', status: 'FILLING' },
  { id: 'st_004', facilityName_hi: 'गोरखपुर FPO कोल्ड स्टोर', facilityName_en: 'Gorakhpur FPO Cold Store', operator: 'Kisaan Connect Coop', type: 'COLD', location: 'Gorakhpur, UP', totalCapacity: 3000, availableCapacity: 0, ratePerBag: 5.0, minDays: 7, contact: '***-***-9900', status: 'FULL' },
];

const STATUS_KEY_MAP = { AVAILABLE: 'availableStatus', FILLING: 'fillingStatus', FULL: 'fullStatus' };
const STATUS_COLOR   = { AVAILABLE: { color: '#15803d', bg: '#f0fdf4' }, FILLING: { color: '#b45309', bg: '#fffbeb' }, FULL: { color: '#64748b', bg: '#f1f5f9' } };

const STORAGE_TYPE_CFG = {
  COLD:      { labelKey: 'coldStorage',  icon: <Thermometer size={13} aria-hidden="true" />, color: '#0284c7' },
  DRY:       { labelKey: 'dryStorage',   icon: <Package size={13} aria-hidden="true" />,     color: '#d97706' },
  WAREHOUSE: { labelKey: 'warehouse',    icon: <Warehouse size={13} aria-hidden="true" />,   color: '#7c3aed' },
};

function CapacityBar({ used, total, label }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const bar = pct >= 80 ? '#d97706' : '#2563eb';
  return (
    <div className="community-int__pool-progress">
      <div className="community-int__pool-progress__bar" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={total} aria-label={label}>
        <div className="community-int__pool-progress__fill" style={{ width: `${pct}%`, background: bar }} />
      </div>
    </div>
  );
}

function BookingForm({ itemName, itemType, onClose, lang }) {
  const formId           = useId();
  const [qty, setQty]    = useState('');
  const [name, setName]  = useState('');
  const [date, setDate]  = useState('');
  const [error, setError] = useState('');
  const [done, setDone]  = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!qty || Number(qty) <= 0) { setError(t('errorQtyInvalid', lang));    return; }
    if (!name.trim())              { setError(t('errorNameRequired', lang));   return; }
    if (!date)                     { setError(t('errorDateRequired', lang));   return; }
    setError('');
    console.log('[Booking]', { itemName, itemType, qty, name, date });
    setDone(true);
  }

  if (done) {
    return (
      <div className="community-int__grievance-success" role="status" aria-live="polite">
        <CheckCircle size={28} color="var(--ci-trend-up)" aria-hidden="true" />
        <h5 style={{ margin: '8px 0 4px' }}>{t('bookSuccessTitle', lang)}</h5>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t('bookSuccessMsg', lang)}</p>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '12px', fontSize: '0.85rem' }}>{t('closeBtn', lang)}</button>
      </div>
    );
  }

  const qtyLabel = itemType === 'transport' ? t('bookFormTonnage', lang) : t('bookFormBags', lang);

  return (
    <form className="community-int__grievance-form" onSubmit={handleSubmit} noValidate>
      <div className="community-int__input-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-qty`}>{qtyLabel} *</label>
          <input id={`${formId}-qty`} type="number" min="0.1" step="0.5" className="community-int__input"
            placeholder={itemType === 'transport' ? '2.5' : '100'} value={qty}
            onChange={e => { setQty(e.target.value); setError(''); }} aria-required="true" />
        </div>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-date`}>{t('bookFormDate', lang)} *</label>
          <input id={`${formId}-date`} type="date" className="community-int__input" value={date}
            onChange={e => { setDate(e.target.value); setError(''); }}
            aria-required="true" min={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <div className="community-int__field">
        <label className="community-int__label" htmlFor={`${formId}-name`}>{t('bookFormName', lang)} *</label>
        <input id={`${formId}-name`} type="text" className="community-int__input"
          placeholder={t('bookFormNamePlaceholder', lang)} value={name}
          onChange={e => { setName(e.target.value); setError(''); }} aria-required="true"
          style={{ fontSize: lang === 'hi' ? '0.9rem' : '0.88rem' }} />
      </div>
      {error && <p className="community-int__field-error" role="alert">{error}</p>}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>{t('cancelBtn', lang)}</button>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <CheckCircle size={13} aria-hidden="true" /> {t('bookConfirmBtn', lang)}
        </button>
      </div>
    </form>
  );
}

function TransportCard({ item, lang }) {
  const [showForm, setShowForm] = useState(false);
  const s    = STATUS_COLOR[item.status]   || STATUS_COLOR.FULL;
  const sLbl = t(STATUS_KEY_MAP[item.status] || 'fullStatus', lang);
  const route = lang === 'hi' ? item.route_hi : item.route_en;
  const pct = Math.round(((item.totalCapacity - item.availableSpace) / item.totalCapacity) * 100);

  return (
    <article className="community-int__logistics-card" aria-label={`${lang === 'hi' ? 'ट्रांसपोर्ट' : 'Transport'}: ${route}`}>
      <header className="community-int__logistics-card__header">
        <div className="community-int__logistics-icon"><Truck size={18} /></div>
        <div style={{ flex: 1 }}>
          <h4 className="community-int__logistics-card__name">{route}</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>{item.vehicleType} · {item.operator}</p>
        </div>
        <span className="community-int__feed-badge" style={{ color: s.color, background: s.bg }}>{sLbl}</span>
      </header>

      <CapacityBar
        used={item.totalCapacity - item.availableSpace}
        total={item.totalCapacity}
        label={`${item.availableSpace}T ${t('available', lang)}`}
      />
      <div className="community-int__pool-progress__labels" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span><strong style={{ color: 'var(--ci-trend-up)' }}>{item.availableSpace}T</strong> {t('available', lang)}</span>
        <span>{item.totalCapacity}T {lang === 'hi' ? 'कुल' : 'total'}</span>
      </div>

      <div className="community-int__pool-card__meta">
        <span><Calendar size={12} aria-hidden="true" /> {t('departure', lang)}: {new Date(item.departureDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })} · {item.departureTime}</span>
        <span>₹{item.ratePerQtl}{t('ratePerQtl', lang)}</span>
        <span><Phone size={12} aria-hidden="true" /> {item.contact}</span>
      </div>

      {!showForm ? (
        <button type="button"
          className={item.status === 'FULL' ? 'btn-secondary' : 'btn-primary'}
          style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }}
          onClick={() => setShowForm(true)}
          disabled={item.status === 'FULL'}>
          <Truck size={13} aria-hidden="true" />
          {item.status === 'FULL' ? t('noSpace', lang) : t('bookSpace', lang)}
        </button>
      ) : (
        <div className="community-int__pool-form-wrap">
          <BookingForm itemName={route} itemType="transport" onClose={() => setShowForm(false)} lang={lang} />
        </div>
      )}
    </article>
  );
}

function StorageCard({ item, lang }) {
  const [showForm, setShowForm] = useState(false);
  const s      = STATUS_COLOR[item.status]           || STATUS_COLOR.FULL;
  const sLbl   = t(STATUS_KEY_MAP[item.status] || 'fullStatus', lang);
  const type   = STORAGE_TYPE_CFG[item.type]         || STORAGE_TYPE_CFG.WAREHOUSE;
  const name   = lang === 'hi' ? item.facilityName_hi : item.facilityName_en;
  const typeLbl = t(type.labelKey, lang);

  return (
    <article className="community-int__logistics-card" aria-label={`${lang === 'hi' ? 'भंडारण' : 'Storage'}: ${name}`}>
      <header className="community-int__logistics-card__header">
        <div className="community-int__logistics-icon" style={{ color: type.color, background: type.color + '18' }}>
          {type.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4 className="community-int__logistics-card__name">{name}</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
            <MapPin size={11} aria-hidden="true" style={{ display: 'inline' }} /> {item.location}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <span className="community-int__feed-badge" style={{ color: s.color, background: s.bg }}>{sLbl}</span>
          <span className="community-int__feed-badge" style={{ color: type.color, background: type.color + '15' }}>{type.icon} {typeLbl}</span>
        </div>
      </header>

      <CapacityBar
        used={item.totalCapacity - item.availableCapacity}
        total={item.totalCapacity}
        label={`${item.availableCapacity.toLocaleString('en-IN')} ${lang === 'hi' ? 'बोरे उपलब्ध' : 'bags available'}`}
      />
      <div className="community-int__pool-progress__labels" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        <span><strong style={{ color: 'var(--ci-trend-up)' }}>{item.availableCapacity.toLocaleString('en-IN')}</strong> {lang === 'hi' ? 'बोरे उपलब्ध' : 'bags available'}</span>
        <span>{item.totalCapacity.toLocaleString('en-IN')} {lang === 'hi' ? 'कुल' : 'total'}</span>
      </div>

      <div className="community-int__pool-card__meta">
        <span>{t('ratePerBagDay', lang)}: ₹{item.ratePerBag}</span>
        <span><Clock size={12} aria-hidden="true" /> {t('minDays', lang)}: {item.minDays}</span>
        <span><Phone size={12} aria-hidden="true" /> {item.contact}</span>
      </div>

      {!showForm ? (
        <button type="button"
          className={item.status === 'FULL' ? 'btn-secondary' : 'btn-primary'}
          style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }}
          onClick={() => setShowForm(true)}
          disabled={item.status === 'FULL'}>
          <Warehouse size={13} aria-hidden="true" />
          {item.status === 'FULL' ? t('fullyBooked', lang) : t('bookStorage', lang)}
        </button>
      ) : (
        <div className="community-int__pool-form-wrap">
          <BookingForm itemName={name} itemType="storage" onClose={() => setShowForm(false)} lang={lang} />
        </div>
      )}
    </article>
  );
}

export default function LogisticsStorage({ transportItems = DEMO_TRANSPORT, storageItems = DEMO_STORAGE, lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('transport');
  const availTr = transportItems.filter(i => i.status !== 'FULL').length;
  const availSt = storageItems.filter(i => i.status !== 'FULL').length;

  return (
    <section className="community-int__section" aria-labelledby="ci-logistics-heading">
      <div className="community-int__section-header">
        <div>
          <h3 className="community-int__section-title" id="ci-logistics-heading">
            <Truck size={18} color="var(--accent-primary)" aria-hidden="true" />
            {t('logisticsSectionTitle', lang)}
            <span className="community-int__demo-label">{t('demoLabel', lang)}</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('logisticsSectionSub', lang)}
          </p>
        </div>
      </div>

      <div role="tablist" aria-label={lang === 'hi' ? 'परिवहन या भंडारण' : 'Logistics or Storage'} style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button role="tab" type="button" id="tab-transport" aria-selected={activeTab === 'transport'} aria-controls="panel-transport"
          className={`community-int__pill ${activeTab === 'transport' ? 'community-int__pill--active' : ''}`}
          onClick={() => setActiveTab('transport')}
          style={{ borderRadius: 'var(--radius-sm)', padding: '8px 18px', fontSize: '0.85rem' }}>
          {t('tabTransport', lang)} ({availTr} {t('available', lang)})
        </button>
        <button role="tab" type="button" id="tab-storage" aria-selected={activeTab === 'storage'} aria-controls="panel-storage"
          className={`community-int__pill ${activeTab === 'storage' ? 'community-int__pill--active' : ''}`}
          onClick={() => setActiveTab('storage')}
          style={{ borderRadius: 'var(--radius-sm)', padding: '8px 18px', fontSize: '0.85rem' }}>
          {t('tabStorage', lang)} ({availSt} {t('available', lang)})
        </button>
      </div>

      <div id="panel-transport" role="tabpanel" aria-labelledby="tab-transport" hidden={activeTab !== 'transport'}>
        <div className="community-int__logistics-grid">
          {transportItems.map(item => <TransportCard key={item.id} item={item} lang={lang} />)}
        </div>
      </div>

      <div id="panel-storage" role="tabpanel" aria-labelledby="tab-storage" hidden={activeTab !== 'storage'}>
        <div className="community-int__logistics-grid">
          {storageItems.map(item => <StorageCard key={item.id} item={item} lang={lang} />)}
        </div>
      </div>
    </section>
  );
}
