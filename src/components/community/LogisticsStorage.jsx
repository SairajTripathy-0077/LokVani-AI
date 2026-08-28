import React, { useState, useId, useEffect } from 'react';
import { 
  Truck, 
  Warehouse, 
  MapPin, 
  Calendar, 
  Phone, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  Package,
  PlusCircle,
  X,
  FileCheck,
  ShieldCheck,
  Inbox,
  MessageSquare,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { t } from './communityTranslations.js';

function getWhatsAppLink(pass, lang) {
  const cleanDigits = (pass.contact || '').replace(/\D/g, '');
  const phone = cleanDigits.length === 10 ? `91${cleanDigits}` : (cleanDigits || '919876543210');
  const text = lang === 'hi'
    ? `नमस्ते! मैंने LokVani AI के माध्यम से आपके वाहन/गोदाम (${pass.itemName}) में ${pass.quantity} ${pass.unit} की जगह बुक की है।\n\n📌 बुकिंग ID: ${pass.bookingId}\n👤 किसान: ${pass.farmerName || 'किसान'}\n📅 दिनांक: ${pass.date}\n\nकृपया पिकअप समय व स्थान की पुष्टि करें। धन्यवाद!`
    : `Hello! I have booked ${pass.quantity} ${pass.unit} space for (${pass.itemName}) via LokVani AI.\n\n📌 Booking ID: ${pass.bookingId}\n👤 Farmer: ${pass.farmerName || 'Farmer'}\n📅 Date: ${pass.date}\n\nPlease confirm dispatch pickup time and location. Thank you!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getPhoneLink(pass) {
  const cleanDigits = (pass.contact || '').replace(/\D/g, '');
  return cleanDigits ? `tel:+${cleanDigits}` : '#';
}

const STATUS_KEY_MAP = { AVAILABLE: 'availableStatus', FILLING: 'fillingStatus', FULL: 'fullStatus' };
const STATUS_COLOR   = { AVAILABLE: { color: 'var(--accent-primary, #15803d)', bg: 'rgba(72,115,79,0.09)' }, FILLING: { color: 'var(--text-main, #18181b)', bg: 'var(--bg-hover, #f4f4f2)' }, FULL: { color: 'var(--text-dim, #71717a)', bg: 'var(--bg-hover, #f4f4f2)' } };

const STORAGE_TYPE_CFG = {
  COLD:      { labelKey: 'coldStorage',  icon: <Thermometer size={13} aria-hidden="true" />, color: 'var(--accent-primary, #15803d)' },
  DRY:       { labelKey: 'dryStorage',   icon: <Package size={13} aria-hidden="true" />,     color: 'var(--text-muted)' },
  WAREHOUSE: { labelKey: 'warehouse',    icon: <Warehouse size={13} aria-hidden="true" />,   color: 'var(--text-muted)' },
};

function CapacityBar({ used, total, label }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const bar = 'var(--accent-primary, #15803d)';
  return (
    <div className="community-int__pool-progress" style={{ margin: '8px 0' }}>
      <div 
        className="community-int__pool-progress__bar" 
        role="progressbar" 
        aria-valuenow={used} 
        aria-valuemin={0} 
        aria-valuemax={total} 
        style={{ height: '6px', background: 'var(--border-subtle, #e5e7eb)', borderRadius: '3px', overflow: 'hidden' }}
      >
        <div className="community-int__pool-progress__fill" style={{ width: `${pct}%`, background: bar, height: '100%', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

function BookingForm({ item, itemType, onBook, onClose, lang }) {
  const formId = useId();
  const [qty, setQty] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [bookingPass, setBookingPass] = useState(null);

  const availableMax = itemType === 'transport' ? item.availableSpace : item.availableCapacity;

  function handleSubmit(e) {
    e.preventDefault();
    const q = Number(qty);
    if (!q || q <= 0) { setError(lang === 'hi' ? 'कृपया सही मात्रा दर्ज करें।' : 'Please enter valid quantity.'); return; }
    if (q > availableMax) { setError(lang === 'hi' ? `उपलब्ध जगह (${availableMax}) से अधिक बुक नहीं कर सकते।` : `Cannot exceed available space (${availableMax}).`); return; }
    if (!name.trim()) { setError(lang === 'hi' ? 'कृपया नाम दर्ज करें।' : 'Please enter your name.'); return; }
    if (!phone.trim()) { setError(lang === 'hi' ? 'कृपया फोन नंबर दर्ज करें।' : 'Please enter contact phone.'); return; }
    if (!date) { setError(lang === 'hi' ? 'कृपया तारीख चुनें।' : 'Please choose date.'); return; }

    setError('');
    const pass = {
      bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId: item.id,
      itemType,
      itemName: itemType === 'transport' ? (lang === 'hi' ? item.route_hi : item.route_en) : (lang === 'hi' ? item.facilityName_hi : item.facilityName_en),
      operator: item.operator,
      contact: item.contact,
      quantity: q,
      unit: itemType === 'transport' ? 'Tonne' : 'Bags',
      farmerName: name.trim(),
      phone: phone.trim(),
      date,
      createdAt: new Date().toISOString(),
    };

    onBook(pass);
    setBookingPass(pass);
  }

  if (bookingPass) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
        <CheckCircle size={32} color="#15803d" style={{ margin: '0 auto 8px' }} />
        <h5 style={{ margin: 0, fontSize: '1rem', color: '#166534', fontWeight: 700 }}>
          {lang === 'hi' ? 'बुकिंग कन्फर्म हो गई!' : 'Booking Confirmed!'}
        </h5>
        <div style={{ background: '#ffffff', borderRadius: '6px', padding: '12px', margin: '12px 0', textAlign: 'left', border: '1px solid #dcfce7', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'बुकिंग आईडी:' : 'Booking ID:'}</span>
            <strong style={{ color: '#15803d' }}>{bookingPass.bookingId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'मात्रा:' : 'Booked Space:'}</span>
            <strong>{bookingPass.quantity} {bookingPass.unit}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'ऑपरेटर संपर्क:' : 'Operator Phone:'}</span>
            <strong>{bookingPass.contact}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'दिनांक:' : 'Date:'}</span>
            <strong>{bookingPass.date}</strong>
          </div>
        </div>

        {/* Action Buttons for Transporter Notification */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
          <a
            href={getWhatsAppLink(bookingPass, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ 
              fontSize: '0.8rem', 
              padding: '6px 12px', 
              background: '#25D366', 
              borderColor: '#25D366', 
              color: '#ffffff', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            <MessageSquare size={13} />
            <span>{lang === 'hi' ? 'WhatsApp पर सूचना भेजें' : 'Send WhatsApp Alert'}</span>
          </a>

          <a
            href={getPhoneLink(bookingPass)}
            className="btn-secondary"
            style={{ 
              fontSize: '0.8rem', 
              padding: '6px 12px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            <PhoneCall size={13} />
            <span>{lang === 'hi' ? 'कॉल करें' : 'Call Operator'}</span>
          </a>
        </div>

        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.78rem', padding: '3px 12px', marginTop: '4px' }}>
          {t('closeBtn', lang)}
        </button>
      </div>
    );
  }

  const qtyLabel = itemType === 'transport' 
    ? (lang === 'hi' ? `मात्रा (टन) - उपलब्ध: ${availableMax}T *` : `Tonnage (T) - Max: ${availableMax}T *`)
    : (lang === 'hi' ? `बोरे की संख्या - उपलब्ध: ${availableMax} *` : `Bags - Max: ${availableMax} *`);

  return (
    <form className="community-int__grievance-form" onSubmit={handleSubmit} noValidate>
      <div className="community-int__input-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-qty`}>{qtyLabel}</label>
          <input 
            id={`${formId}-qty`} 
            type="number" 
            min="0.1" 
            max={availableMax}
            step={itemType === 'transport' ? '0.5' : '1'} 
            className="community-int__input"
            placeholder={itemType === 'transport' ? '2.5' : '100'} 
            value={qty}
            onChange={e => { setQty(e.target.value); setError(''); }} 
            required 
          />
        </div>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-date`}>{t('bookFormDate', lang)} *</label>
          <input 
            id={`${formId}-date`} 
            type="date" 
            className="community-int__input" 
            value={date}
            onChange={e => { setDate(e.target.value); setError(''); }}
            min={new Date().toISOString().split('T')[0]} 
            required 
          />
        </div>
      </div>

      <div className="community-int__input-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-name`}>{t('bookFormName', lang)} *</label>
          <input 
            id={`${formId}-name`} 
            type="text" 
            className="community-int__input"
            placeholder={t('bookFormNamePlaceholder', lang)} 
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }} 
            required 
          />
        </div>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label" htmlFor={`${formId}-phone`}>{lang === 'hi' ? 'फोन नंबर *' : 'Phone Number *'}</label>
          <input 
            id={`${formId}-phone`} 
            type="tel" 
            className="community-int__input"
            placeholder="9876543210" 
            value={phone}
            onChange={e => { setPhone(e.target.value); setError(''); }} 
            required 
          />
        </div>
      </div>

      {error && <p className="community-int__field-error" role="alert" style={{ marginBottom: '10px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>{t('cancelBtn', lang)}</button>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <CheckCircle size={13} aria-hidden="true" /> {t('bookConfirmBtn', lang)}
        </button>
      </div>
    </form>
  );
}

function ListVehicleModal({ isOpen, onClose, onAdd, lang }) {
  const [route, setRoute] = useState('');
  const [vehicleType, setVehicleType] = useState('10T Mini Truck');
  const [operator, setOperator] = useState('');
  const [capacity, setCapacity] = useState('');
  const [rate, setRate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [contact, setContact] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const cap = Number(capacity);
    const item = {
      id: `tr_user_${Date.now()}`,
      operator: operator.trim() || 'Local Transporter',
      route_hi: route.trim(),
      route_en: route.trim(),
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      departureTime: '6:00 AM',
      totalCapacity: cap,
      availableSpace: cap,
      ratePerQtl: Number(rate) || 200,
      vehicleType,
      contact: contact.trim(),
      status: 'AVAILABLE',
    };
    onAdd(item);
    onClose();
  }

  return (
    <div className="community-int__modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="community-int__modal" style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
            {lang === 'hi' ? '🚛 अपना वाहन / ट्रक सूचीबद्ध करें' : '🚛 List Available Transport Vehicle'}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label className="community-int__label">{lang === 'hi' ? 'रूट (स्रोत → मंज़िल) *' : 'Route (Origin → Destination) *'}</label>
            <input type="text" className="community-int__input" placeholder={lang === 'hi' ? 'उदा. आज़मगढ़ → वाराणसी मंडी' : 'e.g. Azamgarh → Varanasi Mandi'} value={route} onChange={e => setRoute(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'वाहन का प्रकार *' : 'Vehicle Type *'}</label>
              <select className="community-int__select" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                <option value="10T Mini Truck">10T Mini Truck</option>
                <option value="12T Tata LPT">12T Tata LPT</option>
                <option value="20T Refrigerated">20T Cold Container</option>
                <option value="Tractor Trolley">Tractor Trolley</option>
              </select>
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'कुल क्षमता (टन) *' : 'Capacity (Tonnes) *'}</label>
              <input type="number" min="1" step="0.5" className="community-int__input" placeholder="10" value={capacity} onChange={e => setCapacity(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'किराया (₹/क्विंटल) *' : 'Rate (₹/Qtl) *'}</label>
              <input type="number" min="50" className="community-int__input" placeholder="250" value={rate} onChange={e => setRate(e.target.value)} required />
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'प्रस्थान तिथि *' : 'Departure Date *'}</label>
              <input type="date" className="community-int__input" value={departureDate} onChange={e => setDepartureDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'मालिक / ट्रांसपोर्टर नाम' : 'Operator Name'}</label>
              <input type="text" className="community-int__input" placeholder="Shree Ram Freight" value={operator} onChange={e => setOperator(e.target.value)} required />
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'फोन नंबर *' : 'Contact Phone *'}</label>
              <input type="tel" className="community-int__input" placeholder="+91 98765 43210" value={contact} onChange={e => setContact(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>{lang === 'hi' ? 'रद्द करें' : 'Cancel'}</button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={14} /> {lang === 'hi' ? 'वाहन जोड़ें' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransportCard({ item, onBook, lang }) {
  const [showForm, setShowForm] = useState(false);
  const s    = STATUS_COLOR[item.status]   || STATUS_COLOR.FULL;
  const sLbl = t(STATUS_KEY_MAP[item.status] || 'fullStatus', lang);
  const route = lang === 'hi' ? item.route_hi : item.route_en;

  return (
    <article className="community-int__logistics-card" style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-subtle, #e5e7eb)', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <header className="community-int__logistics-card__header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="community-int__logistics-icon" style={{ width: '38px', height: '38px', background: 'rgba(72,115,79,0.09)', color: 'var(--accent-primary, #15803d)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Truck size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 className="community-int__logistics-card__name" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{route}</h4>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>{item.vehicleType} · {item.operator}</p>
        </div>
        <span className="community-int__feed-badge" style={{ color: s.color, background: s.bg, fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{sLbl}</span>
      </header>

      <CapacityBar
        used={item.totalCapacity - item.availableSpace}
        total={item.totalCapacity}
        label={`${item.availableSpace}T ${t('available', lang)}`}
      />
      <div className="community-int__pool-progress__labels" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span><strong style={{ color: 'var(--accent-primary, #15803d)' }}>{item.availableSpace}T</strong> {t('available', lang)}</span>
        <span>{item.totalCapacity}T {lang === 'hi' ? 'कुल' : 'total'}</span>
      </div>

      <div className="community-int__pool-card__meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '10px' }}>
        <span><Calendar size={12} aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {t('departure', lang)}: {new Date(item.departureDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}</span>
        <span>₹{item.ratePerQtl}{t('ratePerQtl', lang)}</span>
        <span><Phone size={12} aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {item.contact}</span>
      </div>

      {!showForm ? (
        <button type="button"
          className={item.status === 'FULL' ? 'btn-secondary' : 'btn-primary'}
          style={{ fontSize: '0.85rem', alignSelf: 'flex-start', marginTop: '6px' }}
          onClick={() => setShowForm(true)}
          disabled={item.status === 'FULL'}>
          <Truck size={13} aria-hidden="true" />
          {item.status === 'FULL' ? t('noSpace', lang) : t('bookSpace', lang)}
        </button>
      ) : (
        <div className="community-int__pool-form-wrap" style={{ marginTop: '8px', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '12px' }}>
          <BookingForm item={item} itemType="transport" onBook={onBook} onClose={() => setShowForm(false)} lang={lang} />
        </div>
      )}
    </article>
  );
}

function StorageCard({ item, onBook, lang }) {
  const [showForm, setShowForm] = useState(false);
  const s      = STATUS_COLOR[item.status]           || STATUS_COLOR.FULL;
  const sLbl   = t(STATUS_KEY_MAP[item.status] || 'fullStatus', lang);
  const type   = STORAGE_TYPE_CFG[item.type]         || STORAGE_TYPE_CFG.WAREHOUSE;
  const name   = lang === 'hi' ? item.facilityName_hi : item.facilityName_en;
  const typeLbl = t(type.labelKey, lang);

  return (
    <article className="community-int__logistics-card" style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-subtle, #e5e7eb)', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <header className="community-int__logistics-card__header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="community-int__logistics-icon" style={{ width: '38px', height: '38px', color: type.color, background: 'rgba(72,115,79,0.09)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {type.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4 className="community-int__logistics-card__name" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{name}</h4>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
            <MapPin size={11} aria-hidden="true" style={{ display: 'inline' }} /> {item.location}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <span className="community-int__feed-badge" style={{ color: s.color, background: s.bg, fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{sLbl}</span>
          <span className="community-int__feed-badge" style={{ color: type.color, background: 'rgba(72,115,79,0.09)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>{typeLbl}</span>
        </div>
      </header>

      <CapacityBar
        used={item.totalCapacity - item.availableCapacity}
        total={item.totalCapacity}
        label={`${item.availableCapacity.toLocaleString('en-IN')} ${lang === 'hi' ? 'बोरे उपलब्ध' : 'bags available'}`}
      />
      <div className="community-int__pool-progress__labels" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span><strong style={{ color: 'var(--accent-primary, #15803d)' }}>{item.availableCapacity.toLocaleString('en-IN')}</strong> {lang === 'hi' ? 'बोरे उपलब्ध' : 'bags available'}</span>
        <span>{item.totalCapacity.toLocaleString('en-IN')} {lang === 'hi' ? 'कुल' : 'total'}</span>
      </div>

      <div className="community-int__pool-card__meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '10px' }}>
        <span>{t('ratePerBagDay', lang)}: ₹{item.ratePerBag}</span>
        <span><Clock size={12} aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {t('minDays', lang)}: {item.minDays}</span>
        <span><Phone size={12} aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {item.contact}</span>
      </div>

      {!showForm ? (
        <button type="button"
          className={item.status === 'FULL' ? 'btn-secondary' : 'btn-primary'}
          style={{ fontSize: '0.85rem', alignSelf: 'flex-start', marginTop: '6px' }}
          onClick={() => setShowForm(true)}
          disabled={item.status === 'FULL'}>
          <Warehouse size={13} aria-hidden="true" />
          {item.status === 'FULL' ? t('fullyBooked', lang) : t('bookStorage', lang)}
        </button>
      ) : (
        <div className="community-int__pool-form-wrap" style={{ marginTop: '8px', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '12px' }}>
          <BookingForm item={item} itemType="storage" onBook={onBook} onClose={() => setShowForm(false)} lang={lang} />
        </div>
      )}
    </article>
  );
}

export default function LogisticsStorage({ transportItems: initialTransport = [], storageItems: initialStorage = [], lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('transport');
  const [transportList, setTransportList] = useState(initialTransport);
  const [storageList, setStorageList] = useState(initialStorage);

  const [userBookings, setUserBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('lokvani_user_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  });

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Sync location-optimized transport props when location updates
  useEffect(() => {
    if (initialTransport && initialTransport.length > 0) {
      setTransportList(initialTransport);
    }
  }, [initialTransport]);

  // Sync location-optimized storage props when location updates
  useEffect(() => {
    if (initialStorage && initialStorage.length > 0) {
      setStorageList(initialStorage);
    }
  }, [initialStorage]);

  useEffect(() => {
    localStorage.setItem('lokvani_user_bookings', JSON.stringify(userBookings));
  }, [userBookings]);

  function handleBookPass(pass) {
    setUserBookings(prev => [pass, ...prev]);

    if (pass.itemType === 'transport') {
      setTransportList(prev => prev.map(t => {
        if (t.id !== pass.itemId) return t;
        const newSpace = Math.max(0, t.availableSpace - pass.quantity);
        return {
          ...t,
          availableSpace: newSpace,
          status: newSpace === 0 ? 'FULL' : newSpace <= 2 ? 'FILLING' : 'AVAILABLE',
        };
      }));
    } else {
      setStorageList(prev => prev.map(s => {
        if (s.id !== pass.itemId) return s;
        const newCap = Math.max(0, s.availableCapacity - pass.quantity);
        return {
          ...s,
          availableCapacity: newCap,
          status: newCap === 0 ? 'FULL' : newCap <= 500 ? 'FILLING' : 'AVAILABLE',
        };
      }));
    }
  }

  function handleAddVehicle(item) {
    setTransportList(prev => [item, ...prev]);
  }

  const availTr = transportList.filter(i => i.status !== 'FULL').length;
  const availSt = storageList.filter(i => i.status !== 'FULL').length;

  return (
    <section className="community-int__section" aria-labelledby="ci-logistics-heading">
      <div className="community-int__section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="community-int__section-title" id="ci-logistics-heading">
            <Truck size={20} color="var(--accent-primary, #15803d)" aria-hidden="true" />
            {t('logisticsSectionTitle', lang)}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('logisticsSectionSub', lang)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsVehicleModalOpen(true)}
          className="btn-primary"
          style={{ fontSize: '0.88rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={16} />
          <span>{lang === 'hi' ? 'वाहन सूची में जोड़ें' : 'List Transport Vehicle'}</span>
        </button>
      </div>

      {/* Sub-tab selection: Transport vs Storage vs My Bookings */}
      <div role="tablist" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button role="tab" type="button"
          className={`community-int__pill ${activeTab === 'transport' ? 'community-int__pill--active' : ''}`}
          onClick={() => setActiveTab('transport')}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          {t('tabTransport', lang)} ({availTr} {t('available', lang)})
        </button>
        <button role="tab" type="button"
          className={`community-int__pill ${activeTab === 'storage' ? 'community-int__pill--active' : ''}`}
          onClick={() => setActiveTab('storage')}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          {t('tabStorage', lang)} ({availSt} {t('available', lang)})
        </button>
        {userBookings.length > 0 && (
          <button role="tab" type="button"
            className={`community-int__pill ${activeTab === 'bookings' ? 'community-int__pill--active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            style={{ padding: '8px 18px', fontSize: '0.85rem', color: 'var(--accent-primary, #15803d)', fontWeight: 700 }}>
            <FileCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            {lang === 'hi' ? `मेरी बुकिंग्स (${userBookings.length})` : `My Bookings (${userBookings.length})`}
          </button>
        )}
      </div>

      {/* Transport Tab */}
      {activeTab === 'transport' && (
        transportList.length === 0 ? (
          <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px dashed var(--border-muted, #d1d5db)', borderRadius: '12px', padding: '36px 20px', textAlign: 'center' }}>
            <Truck size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {lang === 'hi' ? 'इस रूट पर अभी कोई साझा वाहन उपलब्ध नहीं है' : 'No Shared Transport Vehicles Listed Yet'}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '6px auto 16px', maxWidth: '420px' }}>
              {lang === 'hi'
                ? 'क्या आप मंडी जा रहे हैं? अपने खाली ट्रक या ट्रैक्टर ट्रॉली की जगह साझा करें और भाड़ा कमाएं।'
                : 'Traveling to the APMC Mandi? List your empty truck or tractor trolley space to share freight costs.'}
            </p>
            <button
              type="button"
              onClick={() => setIsVehicleModalOpen(true)}
              className="btn-primary"
              style={{ fontSize: '0.86rem', padding: '8px 18px' }}
            >
              <PlusCircle size={15} />
              <span>{lang === 'hi' ? 'वाहन सूची में जोड़ें' : 'List Transport Vehicle'}</span>
            </button>
          </div>
        ) : (
          <div className="community-int__logistics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {transportList.map(item => <TransportCard key={item.id} item={item} onBook={handleBookPass} lang={lang} />)}
          </div>
        )
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        storageList.length === 0 ? (
          <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px dashed var(--border-muted, #d1d5db)', borderRadius: '12px', padding: '36px 20px', textAlign: 'center' }}>
            <Warehouse size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {lang === 'hi' ? 'अभी कोई गोदाम या कोल्ड स्टोर सूचीबद्ध नहीं है' : 'No Warehouses or Cold Storage Listed Yet'}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '6px auto 16px', maxWidth: '420px' }}>
              {lang === 'hi'
                ? 'स्थानीय वेयरहाउस, गोदाम या कोल्ड स्टोरेज के संचालक अपनी उपलब्ध क्षमता को यहां साझा कर सकते हैं।'
                : 'Local storage facilities and warehouse operators can list their available capacity here for nearby farmers.'}
            </p>
          </div>
        ) : (
          <div className="community-int__logistics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {storageList.map(item => <StorageCard key={item.id} item={item} onBook={handleBookPass} lang={lang} />)}
          </div>
        )
      )}

      {/* User Bookings Tab */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {userBookings.map(b => (
            <div key={b.bookingId} style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--accent-primary, #15803d)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {b.bookingId}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 style={{ margin: '4px 0', fontSize: '1rem', color: 'var(--text-main)' }}>{b.itemName}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {b.itemType === 'transport' ? '🚛 Truck Booking' : '🏬 Storage Booking'} · <strong>{b.quantity} {b.unit}</strong>
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '8px', fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>{lang === 'hi' ? 'संपर्क:' : 'Contact:'} <strong>{b.contact}</strong></span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <a
                    href={getWhatsAppLink(b, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ 
                      fontSize: '0.74rem', 
                      padding: '4px 8px', 
                      background: '#25D366', 
                      borderColor: '#25D366', 
                      color: '#ffffff', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      textDecoration: 'none',
                      borderRadius: '6px'
                    }}
                  >
                    <MessageSquare size={12} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={getPhoneLink(b)}
                    className="btn-secondary"
                    style={{ 
                      fontSize: '0.74rem', 
                      padding: '4px 8px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      textDecoration: 'none',
                      borderRadius: '6px'
                    }}
                  >
                    <PhoneCall size={12} />
                    <span>{lang === 'hi' ? 'कॉल' : 'Call'}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ListVehicleModal 
        isOpen={isVehicleModalOpen} 
        onClose={() => setIsVehicleModalOpen(false)} 
        onAdd={handleAddVehicle} 
        lang={lang} 
      />
    </section>
  );
}

