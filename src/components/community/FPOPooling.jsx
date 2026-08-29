import React, { useState, useEffect, useCallback, useMemo, useId } from 'react';
import { 
  Users, 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  PlusCircle, 
  X, 
  RefreshCw,
  Edit3,
  Trash2,
  Inbox,
  Award
} from 'lucide-react';
import { t } from './communityTranslations.js';
import { 
  fetchCropPools, 
  createCropPool, 
  joinCropPool, 
  updateCropPool, 
  deleteCropPool, 
  getOrCreateUserId, 
  normalizePool, 
  subscribeCropPools 
} from '../../services/poolService.js';

const STATUS_COLOR = {
  OPEN:    { color: 'var(--accent-primary, #15803d)', bg: 'rgba(72,115,79,0.09)', labelEn: 'Open', labelHi: 'खुला है' },
  FILLING: { color: '#d97706',                         bg: '#fef3c7',             labelEn: 'Almost Full', labelHi: 'लगभग भर गया' },
  CLOSED:  { color: 'var(--text-dim, #71717a)',       bg: 'var(--bg-hover, #f4f4f2)', labelEn: 'Full', labelHi: 'भर गया' },
};

function PoolProgressBar({ filled, target, status, lang }) {
  const pct = Math.min(100, Math.round((filled / target) * 100));
  const barColor = status === 'CLOSED' ? 'var(--text-dim)' : 'var(--accent-primary, #15803d)';

  return (
    <div className="community-int__pool-progress" style={{ margin: '12px 0' }}>
      <div
        className="community-int__pool-progress__bar"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={target}
        style={{ height: '8px', background: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', overflow: 'hidden' }}
      >
        <div 
          className="community-int__pool-progress__fill" 
          style={{ width: `${pct}%`, background: barColor, height: '100%', transition: 'width 0.3s ease' }} 
        />
      </div>
      <div className="community-int__pool-progress__labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent-primary, #15803d)' }}>{filled}</strong> / {target} {lang === 'hi' ? 'क्विंटल' : 'qtl'}
        </span>
        <span style={{ color: 'var(--accent-primary, #15803d)', fontWeight: 700, fontSize: '0.78rem' }}>
          {pct}% {t('poolFilled', lang)}
        </span>
      </div>
    </div>
  );
}

function CreatePoolModal({ isOpen, onClose, onCreate, lang }) {
  const [commodity, setCommodity] = useState('');
  const [category, setCategory] = useState('Vegetable');
  const [targetQtl, setTargetQtl] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [qualityRequired, setQualityRequired] = useState('Grade A');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!commodity.trim()) { setError(lang === 'hi' ? 'कृपया फसल का नाम दर्ज करें।' : 'Please enter crop name.'); return; }
    if (!targetQtl || Number(targetQtl) <= 0) { setError(lang === 'hi' ? 'कृपया लक्ष्य मात्रा दर्ज करें।' : 'Please enter target quantity.'); return; }
    if (!offerPrice || Number(offerPrice) <= 0) { setError(lang === 'hi' ? 'कृपया न्यूनतम भाव दर्ज करें।' : 'Please enter offer price.'); return; }
    if (!buyerLocation.trim()) { setError(lang === 'hi' ? 'कृपया मंडी/स्थान दर्ज करें।' : 'Please enter market location.'); return; }
    if (!deadline) { setError(lang === 'hi' ? 'कृपया अंतिम तिथि चुनें।' : 'Please select deadline date.'); return; }

    const creatorId = getOrCreateUserId();
    const newPool = {
      poolId: `pool_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      commodity_hi: commodity.trim(),
      commodity_en: commodity.trim(),
      category_hi: category === 'Vegetable' ? 'सब्ज़ी' : (category === 'Grain' ? 'अनाज' : (category === 'Pulse' ? 'दाल' : 'तिलहन')),
      category_en: category,
      targetQtl: Number(targetQtl),
      filledQtl: 0,
      buyerName: buyerName.trim() || (lang === 'hi' ? 'स्थानीय मंडी समूह' : 'Local APMC Procurement'),
      buyerLocation: buyerLocation.trim(),
      offerPrice: Number(offerPrice),
      deadline,
      qualityRequired,
      status: 'OPEN',
      coordinatorName_hi: 'किराना ट्रस्ट नोड (सत्यापित)',
      coordinatorName_en: 'Kirana Trust Node (Verified)',
      participants: 1,
      createdByUserId: creatorId,
    };

    onCreate(newPool);
    onClose();
  }

  return (
    <div className="community-int__modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="community-int__modal" style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
            {lang === 'hi' ? '🌾 नया फसल समूह (FPO Pool) बनाएं' : '🌾 Start a Selling Pool'}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'फसल का नाम *' : 'Crop Name *'}</label>
              <input type="text" className="community-int__input" placeholder={lang === 'hi' ? 'उदा. टमाटर / गेहूं' : 'e.g. Tomato / Wheat'} value={commodity} onChange={e => setCommodity(e.target.value)} required />
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'श्रेणी *' : 'Category *'}</label>
              <select className="community-int__select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Vegetable">{lang === 'hi' ? 'सब्ज़ी (Vegetable)' : 'Vegetable'}</option>
                <option value="Grain">{lang === 'hi' ? 'अनाज (Grain)' : 'Grain'}</option>
                <option value="Pulse">{lang === 'hi' ? 'दाल (Pulse)' : 'Pulse'}</option>
                <option value="Oilseed">{lang === 'hi' ? 'तिलहन (Oilseed)' : 'Oilseed'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'कुल लक्ष्य (क्विंटल) *' : 'Target Volume (Qtl) *'}</label>
              <input type="number" min="5" className="community-int__input" placeholder="100" value={targetQtl} onChange={e => setTargetQtl(e.target.value)} required />
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'भाव (₹/क्विंटल) *' : 'Offer Price (₹/Qtl) *'}</label>
              <input type="number" min="100" className="community-int__input" placeholder="2500" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'मंडी / स्थान *' : 'Destination Market *'}</label>
              <input type="text" className="community-int__input" placeholder={lang === 'hi' ? 'उदा. लखनऊ APMC' : 'e.g. Lucknow APMC'} value={buyerLocation} onChange={e => setBuyerLocation(e.target.value)} required />
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'अंतिम तिथि *' : 'Deadline Date *'}</label>
              <input type="date" className="community-int__input" value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="community-int__label">{lang === 'hi' ? 'खरीदार / कंपनी (वैकल्पिक)' : 'Buyer / Aggregator Name'}</label>
            <input type="text" className="community-int__input" placeholder={lang === 'hi' ? 'उदा. मदर डेयरी / ITC' : 'e.g. Mother Dairy / ITC'} value={buyerName} onChange={e => setBuyerName(e.target.value)} />
          </div>

          {error && <p className="community-int__field-error" style={{ marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>{lang === 'hi' ? 'रद्द करें' : 'Cancel'}</button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={15} /> {lang === 'hi' ? 'समूह शुरू करें' : 'Create Pool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinPoolForm({ pool, onJoin, onClose, lang }) {
  const formId = useId();
  const [volume, setVolume] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const remaining = Math.max(0, pool.targetQtl - pool.filledQtl);
  const commodity = lang === 'hi' ? pool.commodity_hi : pool.commodity_en;

  function handleSubmit(e) {
    e.preventDefault();
    const vol = Number(volume);
    if (!vol || vol <= 0) { setError(t('errorVolumeInvalid', lang)); return; }
    if (vol > remaining && remaining > 0) { setError(t('errorVolumeExceed', lang)); return; }
    if (!farmerName.trim()) { setError(t('errorNameRequired', lang)); return; }
    setError('');
    onJoin({ poolId: pool.id, volume: vol, farmerName: farmerName.trim(), phone: phone.trim() });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '8px', textAlign: 'center' }}>
        <CheckCircle size={28} color="var(--accent-primary, #15803d)" style={{ margin: '0 auto' }} />
        <h5 style={{ margin: '8px 0 4px', fontSize: '1rem', color: 'var(--text-main)' }}>
          {lang === 'hi' ? 'सफलतापूर्वक जुड़ गए!' : 'Joined Pool Successfully!'}
        </h5>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>
          {lang === 'hi'
            ? `आपकी ${volume} क्विंटल ${commodity} दर्ज हो गई है।`
            : `Your ${volume} qtl of ${commodity} has been registered.`}
        </p>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '10px', fontSize: '0.82rem', padding: '5px 14px' }}>
          {t('closeBtn', lang)}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {t('poolDeadline', lang)}: <strong>{new Date(pool.deadline).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}</strong>
        &nbsp;·&nbsp;{remaining} {t('remaining', lang)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label className="community-int__label" htmlFor={`${formId}-vol`}>
            {t('joinVolLabel', lang)} *
          </label>
          <input
            id={`${formId}-vol`}
            type="number"
            min="0.5"
            max={remaining || pool.targetQtl}
            step="0.5"
            className="community-int__input"
            placeholder={`${lang === 'hi' ? 'मात्रा' : 'Volume'} (qtl)`}
            value={volume}
            onChange={e => { setVolume(e.target.value); setError(''); }}
            required
          />
        </div>
        <div>
          <label className="community-int__label" htmlFor={`${formId}-name`}>
            {t('joinNameLabel', lang)} *
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            className="community-int__input"
            placeholder={t('joinNamePlaceholder', lang)}
            value={farmerName}
            onChange={e => { setFarmerName(e.target.value); setError(''); }}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label className="community-int__label" htmlFor={`${formId}-phone`}>
          {lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
        </label>
        <input
          id={`${formId}-phone`}
          type="tel"
          className="community-int__input"
          placeholder="9876543210"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>

      {error && <p className="community-int__field-error" style={{ marginBottom: '10px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>{t('cancelBtn', lang)}</button>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <CheckCircle size={13} /> {t('joinConfirmBtn', lang)}
        </button>
      </div>
    </form>
  );
}

function PoolCard({ pool, onJoin, onDelete, isJoined, userQuantity, currentUserId, lang }) {
  const [showForm, setShowForm] = useState(false);
  const stCfg = STATUS_COLOR[pool.status] || STATUS_COLOR.OPEN;
  const statusLbl = lang === 'hi' ? stCfg.labelHi : stCfg.labelEn;
  const commodity = lang === 'hi' ? pool.commodity_hi : pool.commodity_en;
  const category = lang === 'hi' ? pool.category_hi : pool.category_en;

  const isCreator = Boolean(
    (pool.createdByUserId && pool.createdByUserId === currentUserId) ||
    (pool.id && String(pool.id).includes('pool_custom_'))
  );

  return (
    <article className="community-int__pool-card" style={{ background: 'var(--bg-surface, #ffffff)', border: isJoined ? '2px solid var(--accent-primary, #15803d)' : '1px solid var(--border-subtle, #e5e7eb)', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{commodity}</h4>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-hover, #f3f4f6)', fontWeight: 600 }}>{category}</span>
            <span style={{ color: stCfg.color, background: stCfg.bg, fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>{statusLbl}</span>
            {isJoined && (
              <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Award size={12} /> {lang === 'hi' ? `जुड़े हैं (${userQuantity} Qtl)` : `Joined (${userQuantity} Qtl)`}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            <Package size={13} style={{ color: 'var(--accent-primary, #15803d)', display: 'inline', verticalAlign: 'middle' }} />
            &nbsp;{pool.buyerName}
            <span style={{ marginLeft: '8px', color: 'var(--text-dim)' }}>
              <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {pool.buyerLocation}
            </span>
          </p>
        </div>
        
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary, #15803d)', margin: 0, lineHeight: 1 }}>
            ₹{pool.offerPrice?.toLocaleString('en-IN')}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0 }}>{t('perQtl', lang)}</p>

          {isCreator && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === 'hi' ? 'क्या आप इस समूह को हटाना चाहते हैं?' : 'Delete this pool?')) {
                  onDelete?.(pool.id);
                }
              }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '3px 6px',
                cursor: 'pointer',
                color: '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.7rem',
                fontWeight: 600,
                marginTop: '4px'
              }}
            >
              <Trash2 size={11} />
              <span>{lang === 'hi' ? 'हटाएं' : 'Delete'}</span>
            </button>
          )}
        </div>
      </header>

      <PoolProgressBar filled={pool.filledQtl} target={pool.targetQtl} status={pool.status} lang={lang} />

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '10px' }}>
        <span><Users size={12} style={{ verticalAlign: 'middle' }} /> {pool.participants} {t('poolFarmers', lang)}</span>
        <span>
          <Calendar size={12} style={{ verticalAlign: 'middle' }} />
          &nbsp;{t('poolDeadline', lang)}: {new Date(pool.deadline).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span>{t('poolQuality', lang)}: {pool.qualityRequired}</span>
      </div>

      {!showForm ? (
        <button
          type="button"
          className={pool.status === 'CLOSED' ? 'btn-secondary' : 'btn-primary'}
          style={{ fontSize: '0.85rem', alignSelf: 'flex-start', marginTop: '6px' }}
          onClick={() => setShowForm(true)}
          disabled={pool.status === 'CLOSED'}
        >
          <PlusCircle size={14} />
          {pool.status === 'CLOSED' ? t('poolFull', lang) : (isJoined ? (lang === 'hi' ? 'और मात्रा जोड़ें' : 'Add More Volume') : t('addVolumeBtn', lang))}
        </button>
      ) : (
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{t('joinFormTitle', lang)}</p>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
              <X size={16} />
            </button>
          </div>
          <JoinPoolForm pool={pool} onJoin={data => { onJoin?.(data); setShowForm(false); }} onClose={() => setShowForm(false)} lang={lang} />
        </div>
      )}
    </article>
  );
}

export default function FPOPooling({ pools: initialPools = [], lang = 'en' }) {
  const currentUserId = useMemo(() => getOrCreateUserId(), []);
  const [poolList, setPoolList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  const [joinedPools, setJoinedPools] = useState(() => {
    try {
      const saved = localStorage.getItem('lokvani_user_joined_pools');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const loadPools = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await fetchCropPools();
      if (Array.isArray(data) && data.length > 0) {
        setPoolList(data);
      }
    } catch (err) {
      console.warn('[FPOPooling] Fetch error:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // MongoDB Real-time live synchronization (polls API & listens to Firestore)
  useEffect(() => {
    setIsSyncing(true);
    const unsubscribe = subscribeCropPools((livePools) => {
      if (Array.isArray(livePools) && livePools.length > 0) {
        setPoolList(livePools);
      }
      setIsSyncing(false);
    });

    return () => {
      try { unsubscribe(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('lokvani_user_joined_pools', JSON.stringify(joinedPools));
  }, [joinedPools]);

  async function handleJoin({ poolId, volume, farmerName, phone }) {
    // 1. Optimistic update
    setPoolList(prev => prev.map(p => {
      if (p.id !== poolId && p.poolId !== poolId) return p;
      const newFilled = Math.min(p.targetQtl, p.filledQtl + volume);
      return {
        ...p,
        filledQtl: newFilled,
        participants: p.participants + 1,
        status: newFilled >= p.targetQtl ? 'CLOSED' : 'FILLING',
      };
    }));

    setJoinedPools(prev => ({
      ...prev,
      [poolId]: (prev[poolId] || 0) + volume,
    }));

    // 2. Persist to MongoDB backend
    try {
      setIsSyncing(true);
      await joinCropPool(poolId, { farmerName, phone, qtl: volume });
      await loadPools();
    } catch (err) {
      console.error('[FPOPooling] Failed to join pool:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleCreatePool(newPool) {
    // 1. Optimistic update
    const normalized = normalizePool(newPool);
    setPoolList(prev => [normalized, ...prev]);

    // 2. Persist to MongoDB backend
    try {
      setIsSyncing(true);
      const saved = await createCropPool(newPool);
      if (saved) {
        setPoolList(prev => [saved, ...prev.filter(p => p.id !== normalized.id && p.poolId !== normalized.id)]);
      }
      await loadPools();
    } catch (err) {
      console.error('[FPOPooling] Failed to create pool:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDeletePool(poolId) {
    setPoolList(prev => prev.filter(p => p.id !== poolId && p.poolId !== poolId));
    try {
      setIsSyncing(true);
      await deleteCropPool(poolId);
      await loadPools();
    } catch (err) {
      console.error('[FPOPooling] Failed to delete pool:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  const filteredPools = poolList.filter(p => {
    if (filterCategory === 'ALL') return true;
    return p.category_en?.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <section className="community-int__section" aria-labelledby="ci-fpo-heading">
      {/* Header */}
      <div className="community-int__section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="community-int__section-title" id="ci-fpo-heading" style={{ margin: 0 }}>
              <Users size={20} color="var(--accent-primary, #15803d)" />
              {t('fpoSectionTitle', lang)}
            </h3>
            
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px', 
              fontSize: '0.72rem', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              background: 'rgba(72,115,79,0.12)', 
              color: 'var(--accent-primary, #15803d)', 
              fontWeight: 700 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSyncing ? '#eab308' : '#16a34a' }} />
              {isSyncing ? (lang === 'hi' ? 'सिंक हो रहा है…' : 'Syncing…') : (lang === 'hi' ? 'लाइव सिंक' : 'Live Sync')}
            </span>

            <button
              type="button"
              onClick={loadPools}
              title={lang === 'hi' ? 'ताज़ा करें' : 'Refresh Pools'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px' }}
            >
              <RefreshCw size={13} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('fpoSectionSub', lang)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ fontSize: '0.88rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={16} />
          <span>{lang === 'hi' ? 'नया समूह बनाएं' : 'Start a Selling Pool'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {[
          { key: 'ALL', label_hi: 'सभी समूह', label_en: 'All Pools' },
          { key: 'Vegetable', label_hi: 'सब्जियां', label_en: 'Vegetables' },
          { key: 'Grain', label_hi: 'अनाज', label_en: 'Grains' },
          { key: 'Pulse', label_hi: 'दालें', label_en: 'Pulses' },
          { key: 'Oilseed', label_hi: 'तिलहन', label_en: 'Oilseeds' },
        ].map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setFilterCategory(cat.key)}
            className={`community-int__pill ${filterCategory === cat.key ? 'community-int__pill--active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '4px 14px' }}
          >
            {lang === 'hi' ? cat.label_hi : cat.label_en}
          </button>
        ))}
      </div>

      {/* Pools Grid or Empty State */}
      {filteredPools.length === 0 ? (
        <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px dashed var(--border-muted, #d1d5db)', borderRadius: '12px', padding: '36px 20px', textAlign: 'center' }}>
          <Inbox size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {lang === 'hi' ? 'इस श्रेणी में अभी कोई सक्रिय फसल समूह नहीं है' : 'No Active Selling Pools in this Category'}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '6px auto 16px', maxWidth: '420px' }}>
            {lang === 'hi'
              ? 'फसलों का सामूहिक एकत्रीकरण करके मंडी व्यापारियों से बेहतर थोक भाव प्राप्त करने के लिए पहला समूह बनाएं।'
              : 'Start the first selling pool in your district to negotiate higher bulk prices with buyers.'}
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.86rem', padding: '8px 18px' }}
          >
            <PlusCircle size={15} />
            <span>{lang === 'hi' ? 'पहला समूह शुरू करें' : 'Create First Pool'}</span>
          </button>
        </div>
      ) : (
        <div className="community-int__pool-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredPools.map(pool => (
            <PoolCard 
              key={pool.id || pool.poolId} 
              pool={pool} 
              onJoin={handleJoin} 
              onDelete={handleDeletePool}
              isJoined={Boolean(joinedPools[pool.id] || joinedPools[pool.poolId])} 
              userQuantity={joinedPools[pool.id] || joinedPools[pool.poolId] || 0}
              currentUserId={currentUserId}
              lang={lang} 
            />
          ))}
        </div>
      )}

      {/* Start Pool Modal */}
      <CreatePoolModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreatePool} 
        lang={lang} 
      />
    </section>
  );
}
