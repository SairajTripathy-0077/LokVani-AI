/**
 * TrustSystem.jsx — Bilingual (Hindi / English)
 * Buyer & Transporter Trust System with full i18n via communityTranslations.js.
 *
 * Changes from v1: All labels, grievance form, and review text now language-aware.
 * Review quotes and names remain in their original language (authentic peer data).
 */

import React, { useState } from 'react';
import { Star, ShieldCheck, ShieldAlert, Shield, Flag, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { t, tArr } from './communityTranslations.js';

const DEMO_TRUST_PROFILES = [
  {
    id: 'trust_001',
    name: 'FreshKart Foods Pvt. Ltd.',
    type_hi: 'खरीदार',
    type_en: 'Buyer',
    avgRating: 4.7,
    totalReviews: 38,
    credibility: 'TRUSTED',
    paymentReliability: '98%',
    avgPaymentDays: 3,
    reviews: [
      { id: 'r1', reviewer: 'रमेश कुमार', rating: 5, comment_hi: 'समय पर पैसे मिले, अच्छा व्यवहार। फिर बेचूंगा।', comment_en: 'Paid on time, good communication. Will sell again.', date_hi: '3 दिन पहले', date_en: '3 days ago' },
      { id: 'r2', reviewer: 'Anita Devi', rating: 4, comment_hi: 'थोड़ी देर से पैसे मिले लेकिन किराना नोड से संपर्क के बाद ठीक हो गया।', comment_en: 'Slightly delayed payment but resolved after Kirana Node contact.', date_hi: '1 हफ्ते पहले', date_en: '1 week ago' },
      { id: 'r3', reviewer: 'सुरेश पटेल', rating: 5, comment_hi: 'इस सीजन टमाटर का सबसे अच्छा भाव। तौल भी सही था।', comment_en: 'Best price for tomatoes this season. Transparent weighing.', date_hi: '2 हफ्ते पहले', date_en: '2 weeks ago' },
    ],
  },
  {
    id: 'trust_002',
    name: 'Manoj Transport Co.',
    type_hi: 'ट्रांसपोर्टर',
    type_en: 'Transporter',
    avgRating: 4.2,
    totalReviews: 21,
    credibility: 'TRUSTED',
    paymentReliability: '90%',
    avgPaymentDays: null,
    reviews: [
      { id: 'r4', reviewer: 'रवि सिंह', rating: 4, comment_hi: 'ट्रक समय पर आया। गाड़ी साफ थी। मंज़िल पर वजन में थोड़ा फर्क था।', comment_en: 'Truck arrived on time. Clean vehicle. Slight weight difference at destination.', date_hi: '5 दिन पहले', date_en: '5 days ago' },
      { id: 'r5', reviewer: 'Priya Devi', rating: 5, comment_hi: 'लखनऊ सुरक्षित पहुंचाया। सिफारिश करती हूं।', comment_en: 'Delivered to Lucknow safely. Recommended.', date_hi: '2 हफ्ते पहले', date_en: '2 weeks ago' },
    ],
  },
  {
    id: 'trust_003',
    name: 'GrainMart Direct',
    type_hi: 'खरीदार',
    type_en: 'Buyer',
    avgRating: 3.1,
    totalReviews: 9,
    credibility: 'CAUTIOUS',
    paymentReliability: '72%',
    avgPaymentDays: 12,
    reviews: [
      { id: 'r6', reviewer: 'मोहन लाल', rating: 2, comment_hi: '3 हफ्ते बाद पैसे मिले। कई बार फॉलो-अप करना पड़ा।', comment_en: 'Payment delayed by 3 weeks. Had to follow up multiple times.', date_hi: '1 महीने पहले', date_en: '1 month ago' },
      { id: 'r7', reviewer: 'सीमा देवी', rating: 4, comment_hi: 'भाव ठीक था। पैसे आखिरकार आ गए।', comment_en: 'Offer price was fair. Payment eventually came.', date_hi: '3 हफ्ते पहले', date_en: '3 weeks ago' },
    ],
  },
];

const CREDIBILITY_CONFIG = {
  TRUSTED:  { icon: <ShieldCheck size={14} aria-hidden="true" />, labelKey: 'trusted',  color: '#15803d', bg: '#f0fdf4' },
  CAUTIOUS: { icon: <ShieldAlert size={14} aria-hidden="true" />, labelKey: 'caution',  color: '#b45309', bg: '#fffbeb' },
  NEW:      { icon: <Shield size={14} aria-hidden="true" />,      labelKey: 'newEntity', color: '#475569', bg: '#f8fafc' },
};

function StarRating({ value, max = 5, size = 14 }) {
  return (
    <span className="community-int__stars" role="img" aria-label={`${value} / ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={size} aria-hidden="true" fill={i < Math.round(value) ? '#f59e0b' : 'none'} color={i < Math.round(value) ? '#f59e0b' : '#cbd5e1'} />
      ))}
      <span className="community-int__stars-value">{value.toFixed(1)}</span>
    </span>
  );
}

function GrievanceForm({ targetName, onClose, lang }) {
  const [issueType, setIssueType]     = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState('');

  const issueOptions = tArr('grievanceTypes', lang);

  function handleSubmit(e) {
    e.preventDefault();
    if (!issueType)                    { setError(t('errorSelectIssue', lang));   return; }
    if (description.trim().length < 20) { setError(t('errorDescTooShort', lang)); return; }
    setError('');
    console.log('[Grievance]', { targetName, issueType, description });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="community-int__grievance-success" role="status" aria-live="polite">
        <ShieldCheck size={32} color="var(--ci-trend-up)" aria-hidden="true" />
        <h5>{t('grievanceSuccessTitle', lang)}</h5>
        <p>{t('grievanceSuccessMsg', lang)}</p>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '12px', fontSize: '0.85rem' }}>
          {t('closeBtn', lang)}
        </button>
      </div>
    );
  }

  return (
    <form className="community-int__grievance-form" onSubmit={handleSubmit} noValidate aria-label={`${t('reportGrievance', lang)} — ${targetName}`}>
      <div className="community-int__field">
        <label className="community-int__label" htmlFor={`gi-type-${targetName}`}>
          {t('grievanceIssueLabel', lang)} <span style={{ color: 'var(--ci-trend-down)' }}>*</span>
        </label>
        <select
          id={`gi-type-${targetName}`}
          className="community-int__select"
          value={issueType}
          onChange={e => { setIssueType(e.target.value); setError(''); }}
          aria-required="true"
          style={{ fontSize: lang === 'hi' ? '0.9rem' : '0.88rem' }}
        >
          <option value="">{lang === 'hi' ? 'समस्या चुनें…' : 'Select issue type…'}</option>
          {issueOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="community-int__field">
        <label className="community-int__label" htmlFor={`gi-desc-${targetName}`}>
          {t('grievanceDescLabel', lang)} <span style={{ color: 'var(--ci-trend-down)' }}>*</span>
        </label>
        <textarea
          id={`gi-desc-${targetName}`}
          className="community-int__input"
          style={{ resize: 'vertical', minHeight: '80px', fontSize: lang === 'hi' ? '0.9rem' : '0.88rem' }}
          placeholder={t('grievanceDescPlaceholder', lang)}
          value={description}
          onChange={e => { setDescription(e.target.value); setError(''); }}
          aria-required="true"
        />
      </div>

      {error && <p className="community-int__field-error" role="alert">{error}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>{t('cancelBtn', lang)}</button>
        <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem', background: 'var(--ci-trend-down)' }}>
          <Send size={13} aria-hidden="true" /> {t('grievanceSubmitBtn', lang)}
        </button>
      </div>
    </form>
  );
}

function TrustProfileCard({ profile, lang }) {
  const [expanded, setExpanded]           = useState(false);
  const [showGrievance, setShowGrievance] = useState(false);
  const cred = CREDIBILITY_CONFIG[profile.credibility] || CREDIBILITY_CONFIG.NEW;
  const typeName = lang === 'hi' ? profile.type_hi : profile.type_en;

  return (
    <article className="community-int__trust-card" aria-label={`${lang === 'hi' ? 'विश्वास प्रोफ़ाइल' : 'Trust profile'}: ${profile.name}`}>
      <header className="community-int__trust-card__header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h4 className="community-int__trust-card__name">{profile.name}</h4>
            <span className="community-int__feed-badge" style={{ color: cred.color, background: cred.bg }}>
              {cred.icon} {t(cred.labelKey, lang)}
            </span>
            <span className="community-int__tag">{typeName}</span>
          </div>
          <StarRating value={profile.avgRating} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '5px' }}>
            {profile.totalReviews} {t('reviews', lang)}
            {profile.paymentReliability && ` · ${profile.paymentReliability} ${t('paymentReliability', lang)}`}
            {profile.avgPaymentDays && ` · ${t('avgPaymentDays', lang)}: ${profile.avgPaymentDays}`}
          </p>
        </div>
      </header>

      <div className="community-int__trust-card__actions">
        <button
          type="button"
          className="community-int__trust-toggle"
          onClick={() => { setExpanded(v => !v); setShowGrievance(false); }}
          aria-expanded={expanded}
          aria-controls={`reviews-${profile.id}`}
        >
          {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
          {expanded ? t('hideReviews', lang) : `${t('seeReviews', lang)} (${profile.reviews.length})`}
        </button>

        <button
          type="button"
          className="community-int__trust-grievance-btn"
          onClick={() => { setShowGrievance(v => !v); setExpanded(false); }}
          aria-expanded={showGrievance}
        >
          <Flag size={13} aria-hidden="true" />
          {t('reportGrievance', lang)}
        </button>
      </div>

      {expanded && (
        <ul id={`reviews-${profile.id}`} className="community-int__review-list">
          {profile.reviews.map(rev => (
            <li key={rev.id} className="community-int__review-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <StarRating value={rev.rating} size={12} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {lang === 'hi' ? rev.date_hi : rev.date_en}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                "{lang === 'hi' ? rev.comment_hi : rev.comment_en}"
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>— {rev.reviewer}</p>
            </li>
          ))}
        </ul>
      )}

      {showGrievance && (
        <GrievanceForm targetName={profile.name} onClose={() => setShowGrievance(false)} lang={lang} />
      )}
    </article>
  );
}

export default function TrustSystem({ profiles = DEMO_TRUST_PROFILES, lang = 'en' }) {
  return (
    <section className="community-int__section" aria-labelledby="ci-trust-heading">
      <div className="community-int__section-header">
        <div>
          <h3 className="community-int__section-title" id="ci-trust-heading">
            <ShieldCheck size={18} color="var(--ci-trend-up)" aria-hidden="true" />
            {t('trustSectionTitle', lang)}
            <span className="community-int__demo-label">{t('demoLabel', lang)}</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('trustSectionSub', lang)}
          </p>
        </div>
      </div>
      <div className="community-int__trust-grid">
        {profiles.map(p => <TrustProfileCard key={p.id} profile={p} lang={lang} />)}
      </div>
    </section>
  );
}
