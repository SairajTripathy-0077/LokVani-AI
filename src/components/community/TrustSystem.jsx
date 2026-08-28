import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Flag, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  MessageSquarePlus, 
  X,
  CheckCircle,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { t, tArr } from './communityTranslations.js';

const DEFAULT_TRUST_PROFILES = [
  {
    id: 'trust_001',
    name: 'FreshKart Foods Pvt. Ltd.',
    type_hi: 'खरीदार (Buyer)',
    type_en: 'Buyer',
    avgRating: 4.7,
    totalReviews: 38,
    credibility: 'TRUSTED',
    paymentReliability: '98%',
    avgPaymentDays: 3,
    reviews: [
      { id: 'r1', reviewer: 'रमेश कुमार (आजमगढ़)', rating: 5, comment_hi: 'समय पर सीधे बैंक में पैसे मिले, अच्छा व्यवहार। फिर बेचूंगा।', comment_en: 'Paid on time directly to bank account. Will sell again.', date_hi: '3 दिन पहले', date_en: '3 days ago' },
      { id: 'r2', reviewer: 'Anita Devi (Mau)', rating: 4, comment_hi: 'थोड़ी देर से पैसे मिले लेकिन किराना नोड से संपर्क के बाद 24 घंटे में भुगतान हो गया।', comment_en: 'Slightly delayed payment but resolved within 24h after Kirana Node contact.', date_hi: '1 हफ्ते पहले', date_en: '1 week ago' },
      { id: 'r3', reviewer: 'सुरेश पटेल (वाराणसी)', rating: 5, comment_hi: 'इस सीजन टमाटर का सबसे अच्छा भाव ₹2400 मिला। तौल भी डिजिटल और पारदर्शी था।', comment_en: 'Best price for tomatoes this season (₹2400). Digital weighing was 100% transparent.', date_hi: '2 हफ्ते पहले', date_en: '2 weeks ago' },
    ],
  },
  {
    id: 'trust_002',
    name: 'Manoj Transport Co.',
    type_hi: 'ट्रांसपोर्टर (Transporter)',
    type_en: 'Transporter',
    avgRating: 4.2,
    totalReviews: 21,
    credibility: 'TRUSTED',
    paymentReliability: '90%',
    avgPaymentDays: null,
    reviews: [
      { id: 'r4', reviewer: 'रवि सिंह (आजमगढ़)', rating: 4, comment_hi: 'ट्रक समय पर आया। माल सुरक्षित लखनऊ मंडी पहुंचाया।', comment_en: 'Truck arrived on time. Safely delivered produce to Lucknow Mandi.', date_hi: '5 दिन पहले', date_en: '5 days ago' },
      { id: 'r5', reviewer: 'Priya Devi (Gorakhpur)', rating: 5, comment_hi: 'किराया उचित था और ड्राइवर ने लोड करने में मदद की।', comment_en: 'Fair freight charges and driver helped with loading bags.', date_hi: '2 हफ्ते पहले', date_en: '2 weeks ago' },
    ],
  },
  {
    id: 'trust_003',
    name: 'GrainMart Direct',
    type_hi: 'खरीदार (Buyer)',
    type_en: 'Buyer',
    avgRating: 3.1,
    totalReviews: 9,
    credibility: 'CAUTIOUS',
    paymentReliability: '72%',
    avgPaymentDays: 12,
    reviews: [
      { id: 'r6', reviewer: 'मोहन लाल (इलाहाबाद)', rating: 2, comment_hi: 'भुगतान में 2 हफ्ते की देरी हुई। कई बार फॉलो-अप करना पड़ा।', comment_en: 'Payment delayed by 2 weeks. Had to follow up multiple times.', date_hi: '1 महीने पहले', date_en: '1 month ago' },
      { id: 'r7', reviewer: 'सीमा देवी (मऊ)', rating: 4, comment_hi: 'भाव ठीक था। पैसे अंततः प्राप्त हुए।', comment_en: 'Offer price was fair. Payment eventually came.', date_hi: '3 हफ्ते पहले', date_en: '3 weeks ago' },
    ],
  },
];

const CREDIBILITY_CONFIG = {
  TRUSTED:  { icon: <ShieldCheck size={14} aria-hidden="true" />, labelKey: 'trusted',  color: 'var(--accent-primary, #15803d)', bg: 'rgba(72,115,79,0.09)' },
  CAUTIOUS: { icon: <ShieldAlert size={14} aria-hidden="true" />, labelKey: 'caution',  color: '#b45309', bg: '#fef3c7' },
  NEW:      { icon: <Shield size={14} aria-hidden="true" />,      labelKey: 'newEntity', color: 'var(--text-muted)',     bg: 'var(--bg-hover)' },
};

function StarRating({ value, max = 5, size = 14, interactive = false, onSelect }) {
  return (
    <span className="community-int__stars" role="img" aria-label={`${value} / ${max} stars`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            aria-hidden="true"
            fill={filled ? '#eab308' : 'none'}
            color={filled ? '#eab308' : 'var(--border-muted, #d1d5db)'}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && onSelect?.(i + 1)}
          />
        );
      })}
      {!interactive && <span className="community-int__stars-value" style={{ marginLeft: '4px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{value.toFixed(1)}</span>}
    </span>
  );
}

function AddReviewModal({ profile, isOpen, onClose, onAddReview, lang }) {
  const [rating, setRating] = useState(5);
  const [reviewer, setReviewer] = useState('');
  const [crop, setCrop] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!reviewer.trim()) { setError(lang === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.'); return; }
    if (!comment.trim() || comment.trim().length < 10) { setError(lang === 'hi' ? 'कृपया कम से कम 10 अक्षरों की समीक्षा लिखें।' : 'Please write at least 10 characters.'); return; }

    const newRev = {
      id: `rev_${Date.now()}`,
      reviewer: `${reviewer.trim()}${crop ? ` (${crop.trim()})` : ''}`,
      rating,
      comment_hi: comment.trim(),
      comment_en: comment.trim(),
      date_hi: 'अभी-अभी',
      date_en: 'Just now',
    };

    onAddReview(profile.id, newRev);
    onClose();
  }

  return (
    <div className="community-int__modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="community-int__modal" style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>
            ⭐ {profile.name} {lang === 'hi' ? 'की समीक्षा करें' : 'Write a Review'}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px', textAlign: 'center', background: 'var(--bg-hover, #f9fafb)', padding: '12px', borderRadius: '8px' }}>
            <label className="community-int__label" style={{ display: 'block', marginBottom: '6px' }}>{lang === 'hi' ? 'रेटिंग चुनें (स्टार पर क्लिक करें):' : 'Select Rating:'}</label>
            <StarRating value={rating} size={24} interactive onSelect={setRating} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'आपका नाम *' : 'Your Name *'}</label>
              <input type="text" className="community-int__input" placeholder={lang === 'hi' ? 'उदा. राकेश यादव' : 'e.g. Rakesh Yadav'} value={reviewer} onChange={e => setReviewer(e.target.value)} required />
            </div>
            <div>
              <label className="community-int__label">{lang === 'hi' ? 'बेची गई फसल / स्थान' : 'Crop Sold / Village'}</label>
              <input type="text" className="community-int__input" placeholder={lang === 'hi' ? 'उदा. गेहूं (आजमगढ़)' : 'e.g. Wheat (Azamgarh)'} value={crop} onChange={e => setCrop(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="community-int__label">{lang === 'hi' ? 'समीक्षा / अनुभव *' : 'Feedback / Experience *'}</label>
            <textarea className="community-int__input" style={{ minHeight: '80px' }} placeholder={lang === 'hi' ? 'भुगतान, तौल और व्यवहार के बारे में लिखें...' : 'Write about payment speed, weighing accuracy, behavior...'} value={comment} onChange={e => setComment(e.target.value)} required />
          </div>

          {error && <p className="community-int__field-error" style={{ marginBottom: '10px' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>{lang === 'hi' ? 'रद्द करें' : 'Cancel'}</button>
            <button type="submit" className="btn-primary">
              <CheckCircle size={14} /> {lang === 'hi' ? 'समीक्षा सबमिट करें' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GrievanceForm({ targetName, onGrievanceFiled, onClose, lang }) {
  const [issueType, setIssueType]     = useState('');
  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone]             = useState('');
  const [ticket, setTicket]           = useState(null);
  const [error, setError]             = useState('');

  const issueOptions = [
    lang === 'hi' ? 'भुगतान में अनुचित देरी (Delayed Payment)' : 'Delayed Payment',
    lang === 'hi' ? 'तौल में गड़बड़ी (Under-weighing)' : 'Under-weighing Discrepancy',
    lang === 'hi' ? 'भाव में अचानक कटौती (Price renegotiation)' : 'Price Renegotiation',
    lang === 'hi' ? 'गुणवत्ता पर विवाद (Quality dispute)' : 'Quality Dispute',
  ];

  function handleSubmit(e) {
    e.preventDefault();
    if (!issueType) { setError(lang === 'hi' ? 'कृपया समस्या का प्रकार चुनें।' : 'Please select issue type.'); return; }
    if (description.trim().length < 15) { setError(lang === 'hi' ? 'कृपया कम से कम 15 अक्षरों में विवरण लिखें।' : 'Please describe the issue in at least 15 characters.'); return; }

    setError('');
    const newTicket = {
      ticketId: `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      targetName,
      issueType,
      amount: amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'N/A',
      description: description.trim(),
      phone: phone.trim() || 'Recorded',
      status: 'UNDER_INVESTIGATION',
      filedAt: new Date().toISOString(),
      assignedNode: 'Kirana Trust Node — Azamgarh (Escalated)',
    };

    onGrievanceFiled(newTicket);
    setTicket(newTicket);
  }

  if (ticket) {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', textAlign: 'center', marginTop: '12px' }}>
        <ShieldCheck size={32} color="#dc2626" style={{ margin: '0 auto 8px' }} />
        <h5 style={{ margin: 0, color: '#991b1b', fontSize: '1rem', fontWeight: 700 }}>
          {lang === 'hi' ? 'शिकायत सफलतापूर्वक दर्ज हुई!' : 'Grievance Ticket Created!'}
        </h5>
        <div style={{ background: '#ffffff', borderRadius: '6px', padding: '10px', margin: '12px 0', textAlign: 'left', border: '1px solid #fee2e2', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'शिकायत टिकट:' : 'Ticket ID:'}</span>
            <strong style={{ color: '#dc2626' }}>{ticket.ticketId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'संबंधित खरीदार/ट्रांसपोर्टर:' : 'Entity:'}</span>
            <strong>{ticket.targetName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'जांचकर्ता:' : 'Assigned Node:'}</span>
            <strong>{ticket.assignedNode}</strong>
          </div>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#991b1b', margin: '4px 0 10px' }}>
          {lang === 'hi' ? 'स्थानीय किराना ट्रस्ट नोड 48 घंटे के भीतर खरीदार से संपर्क कर समाधान करेगा।' : 'Your local Kirana Trust Node will investigate and contact the buyer within 48h.'}
        </p>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.82rem', padding: '4px 14px' }}>
          {t('closeBtn', lang)}
        </button>
      </div>
    );
  }

  return (
    <form className="community-int__grievance-form" onSubmit={handleSubmit} noValidate style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label">{t('grievanceIssueLabel', lang)} *</label>
          <select className="community-int__select" value={issueType} onChange={e => { setIssueType(e.target.value); setError(''); }} required>
            <option value="">{lang === 'hi' ? 'समस्या का प्रकार चुनें…' : 'Select issue type…'}</option>
            {issueOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="community-int__field" style={{ marginBottom: 0 }}>
          <label className="community-int__label">{lang === 'hi' ? 'विवादित राशि (₹)' : 'Dispute Amount (₹)'}</label>
          <input type="number" className="community-int__input" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
      </div>

      <div className="community-int__field" style={{ marginBottom: '10px' }}>
        <label className="community-int__label">{t('grievanceDescLabel', lang)} *</label>
        <textarea
          className="community-int__input"
          style={{ resize: 'vertical', minHeight: '70px' }}
          placeholder={t('grievanceDescPlaceholder', lang)}
          value={description}
          onChange={e => { setDescription(e.target.value); setError(''); }}
          required
        />
      </div>

      {error && <p className="community-int__field-error" style={{ marginBottom: '10px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.82rem' }}>{t('cancelBtn', lang)}</button>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.82rem', background: '#dc2626', borderColor: '#dc2626' }}>
          <Send size={12} aria-hidden="true" /> {t('grievanceSubmitBtn', lang)}
        </button>
      </div>
    </form>
  );
}

function TrustProfileCard({ profile, onAddReview, onGrievanceFiled, lang }) {
  const [expanded, setExpanded] = useState(false);
  const [showGrievance, setShowGrievance] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const cred = CREDIBILITY_CONFIG[profile.credibility] || CREDIBILITY_CONFIG.NEW;
  const typeName = lang === 'hi' ? profile.type_hi : profile.type_en;

  return (
    <article className="community-int__trust-card" style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-subtle, #e5e7eb)', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <header className="community-int__trust-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h4 className="community-int__trust-card__name" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{profile.name}</h4>
            <span className="community-int__feed-badge" style={{ color: cred.color, background: cred.bg, fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {cred.icon} {t(cred.labelKey, lang)}
            </span>
            <span className="community-int__tag" style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-hover, #f3f4f6)' }}>{typeName}</span>
          </div>
          <StarRating value={profile.avgRating} />
          <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '5px 0 0 0' }}>
            {profile.totalReviews} {t('reviews', lang)}
            {profile.paymentReliability && ` · ${profile.paymentReliability} ${t('paymentReliability', lang)}`}
            {profile.avgPaymentDays && ` · ${t('avgPaymentDays', lang)}: ${profile.avgPaymentDays} ${lang === 'hi' ? 'दिन' : 'days'}`}
          </p>
        </div>
      </header>

      <div className="community-int__trust-card__actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle, #f3f4f6)', paddingTop: '10px' }}>
        <button
          type="button"
          className="community-int__trust-toggle"
          onClick={() => { setExpanded(v => !v); setShowGrievance(false); }}
          style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle, #e5e7eb)', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? t('hideReviews', lang) : `${t('seeReviews', lang)} (${profile.reviews.length})`}
        </button>

        <button
          type="button"
          onClick={() => setShowReviewModal(true)}
          style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent-primary, #15803d)', color: 'var(--accent-primary, #15803d)', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <MessageSquarePlus size={13} />
          {lang === 'hi' ? 'समीक्षा लिखें' : 'Write Review'}
        </button>

        <button
          type="button"
          className="community-int__trust-grievance-btn"
          onClick={() => { setShowGrievance(v => !v); setExpanded(false); }}
          style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5', color: '#dc2626', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Flag size={13} />
          {t('reportGrievance', lang)}
        </button>
      </div>

      {expanded && (
        <ul className="community-int__review-list" style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {profile.reviews.map(rev => (
            <li key={rev.id} className="community-int__review-item" style={{ background: 'var(--bg-hover, #f9fafb)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border-subtle, #f3f4f6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <StarRating value={rev.rating} size={12} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {lang === 'hi' ? rev.date_hi : rev.date_en}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4, margin: '4px 0' }}>
                "{lang === 'hi' ? rev.comment_hi : rev.comment_en}"
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0 }}>— {rev.reviewer}</p>
            </li>
          ))}
        </ul>
      )}

      {showGrievance && (
        <GrievanceForm targetName={profile.name} onGrievanceFiled={onGrievanceFiled} onClose={() => setShowGrievance(false)} lang={lang} />
      )}

      <AddReviewModal
        profile={profile}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onAddReview={onAddReview}
        lang={lang}
      />
    </article>
  );
}

export default function TrustSystem({ profiles: initialProfiles = DEFAULT_TRUST_PROFILES, lang = 'en' }) {
  const [profileList, setProfileList] = useState(() => {
    try {
      const saved = localStorage.getItem('lokvani_trust_profiles');
      return saved ? JSON.parse(saved) : initialProfiles;
    } catch (_) { return initialProfiles; }
  });

  const [grievanceTickets, setGrievanceTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('lokvani_grievance_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  });

  const [showTicketsTab, setShowTicketsTab] = useState(false);

  useEffect(() => {
    localStorage.setItem('lokvani_trust_profiles', JSON.stringify(profileList));
  }, [profileList]);

  useEffect(() => {
    localStorage.setItem('lokvani_grievance_tickets', JSON.stringify(grievanceTickets));
  }, [grievanceTickets]);

  function handleAddReview(profileId, newReview) {
    setProfileList(prev => prev.map(p => {
      if (p.id !== profileId) return p;
      const updatedReviews = [newReview, ...p.reviews];
      const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      return {
        ...p,
        totalReviews: p.totalReviews + 1,
        avgRating: Math.round(newAvg * 10) / 10,
        reviews: updatedReviews,
      };
    }));
  }

  function handleGrievanceFiled(ticket) {
    setGrievanceTickets(prev => [ticket, ...prev]);
  }

  return (
    <section className="community-int__section" aria-labelledby="ci-trust-heading">
      <div className="community-int__section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="community-int__section-title" id="ci-trust-heading">
            <ShieldCheck size={20} color="var(--accent-primary, #15803d)" aria-hidden="true" />
            {t('trustSectionTitle', lang)}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('trustSectionSub', lang)}
          </p>
        </div>

        {grievanceTickets.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTicketsTab(!showTicketsTab)}
            className="community-int__pill"
            style={{ fontSize: '0.82rem', padding: '6px 14px', color: '#dc2626', borderColor: '#fca5a5' }}
          >
            <Flag size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            {lang === 'hi' ? `मेरी दर्ज शिकायतें (${grievanceTickets.length})` : `My Grievances (${grievanceTickets.length})`}
          </button>
        )}
      </div>

      {showTicketsTab && grievanceTickets.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> {lang === 'hi' ? 'आपकी सक्रिय शिकायतें व स्थिति' : 'Active Grievance Tickets'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {grievanceTickets.map(t => (
              <div key={t.ticketId} style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '8px', padding: '12px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#dc2626' }}>{t.ticketId}</strong>
                  <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {t.status}
                  </span>
                </div>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>{t.targetName} — {t.issueType}</p>
                <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>"{t.description}"</p>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', borderTop: '1px solid #f3f4f6', paddingTop: '6px', marginTop: '6px' }}>
                  {t.assignedNode}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="community-int__trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {profileList.map(p => (
          <TrustProfileCard 
            key={p.id} 
            profile={p} 
            onAddReview={handleAddReview}
            onGrievanceFiled={handleGrievanceFiled}
            lang={lang} 
          />
        ))}
      </div>
    </section>
  );
}

