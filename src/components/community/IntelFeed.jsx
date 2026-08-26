/**
 * IntelFeed.jsx — Bilingual (Hindi / English)
 * Real-Time Community Intel Feed with full i18n via communityTranslations.js.
 *
 * Changes from v1: All UI strings from t(). Category labels bilingual. Farmer-friendly
 * confirm/flag button labels. lang prop flows from CommunityIntel parent.
 * Design update: Mono sage/zinc theme — no red/yellow/purple/blinking animations.
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Truck, ThumbsUp, Flag, Zap, Megaphone, Clock, Wifi } from 'lucide-react';
import { t } from './communityTranslations.js';

/* ── Mono-theme Category Config ─────────────────────────────────────────── */
const FEED_CATEGORY_KEYS = {
  PRICE_ALERT:  { labelKey: 'feedCatPriceAlert', icon: <TrendingUp size={14} aria-hidden="true" />,    color: 'var(--accent-primary)', bg: 'rgba(72,115,79,0.09)' },
  DEMAND_SPIKE: { labelKey: 'feedCatDemand',      icon: <Zap size={14} aria-hidden="true" />,            color: 'var(--text-main)',      bg: 'var(--bg-hover)' },
  PRICE_DROP:   { labelKey: 'feedCatPriceDrop',   icon: <TrendingDown size={14} aria-hidden="true" />,  color: 'var(--text-muted)',     bg: 'var(--bg-hover)' },
  TRANSPORT:    { labelKey: 'feedCatTransport',   icon: <Truck size={14} aria-hidden="true" />,          color: 'var(--text-muted)',     bg: 'var(--bg-hover)' },
  WARNING:      { labelKey: 'feedCatWarning',     icon: <AlertTriangle size={14} aria-hidden="true" />,  color: 'var(--text-main)',      bg: 'var(--bg-hover)' },
  ANNOUNCEMENT: { labelKey: 'feedCatAnnouncement',icon: <Megaphone size={14} aria-hidden="true" />,     color: 'var(--text-muted)',     bg: 'var(--bg-hover)' },
};

const FEED_FILTER_KEYS = ['feedFilterAll', 'feedCatPriceAlert', 'feedCatDemand', 'feedCatTransport', 'feedCatWarning', 'feedCatAnnouncement'];

/* ── Demo Seed Data ───────────────────────────────────────────────────────── */
export const DEMO_FEED_ITEMS = [
  {
    id: 'feed_001',
    category: 'PRICE_ALERT',
    headline_hi: 'आज़मगढ़ मंडी में टमाटर के भाव तेज़ी से बढ़े',
    headline_en: 'Tamatar prices surging at Azamgarh Mandi',
    detail_hi: 'टमाटर का भाव रातों-रात ₹22/kg से ₹38/kg हो गया — MP से आवक कम होने के कारण। 3-4 दिन यही भाव रह सकते हैं।',
    detail_en: 'Tomato rates jumped from ₹22/kg to ₹38/kg overnight due to reduced arrivals from MP. Expected to hold for 3–4 days.',
    reporter_hi: 'रमेश कुमार (किसान)',
    reporter_en: 'Ramesh Kumar (Farmer)',
    location: 'Azamgarh, UP',
    timestamp: new Date(Date.now() - 12 * 60000),
    confirms: 14,
    flags: 0,
    urgent: true,
  },
  {
    id: 'feed_002',
    category: 'DEMAND_SPIKE',
    headline_hi: 'FreshKart Foods को तुरंत 80 क्विंटल प्याज चाहिए',
    headline_en: 'FreshKart Foods seeking 80 quintal Pyaaz urgently',
    detail_hi: 'FreshKart Foods को शुक्रवार तक ग्रेड A प्याज चाहिए। एकत्रीकरण के लिए किराना नोड ऑपरेटर से संपर्क करें।',
    detail_en: 'Institutional buyer FreshKart Foods requires 80 quintals of Grade A onion by Friday. Contact Kirana Node for aggregation.',
    reporter_hi: 'किराना नोड ऑपरेटर',
    reporter_en: 'Kirana Node Operator',
    location: 'Lucknow Buyer Hub',
    timestamp: new Date(Date.now() - 35 * 60000),
    confirms: 27,
    flags: 1,
    urgent: true,
  },
  {
    id: 'feed_003',
    category: 'PRICE_DROP',
    headline_hi: 'आलू के भाव गिर रहे हैं — शुक्रवार से पहले बेच दें',
    headline_en: 'Aloo (Potato) rates declining — sell before Friday',
    detail_hi: 'वाराणसी APMC में आलू का भाव इस हफ्ते 18% गिरा — बंपर फसल आने के कारण। बिक्री की खिड़की गुरुवार को बंद हो जाएगी।',
    detail_en: 'Potato prices fell 18% this week at Varanasi APMC due to bumper harvest arrivals. Sale window closes by Thursday.',
    reporter_hi: 'सुरेश पटेल (व्यापारी)',
    reporter_en: 'Suresh Patel (Vendor)',
    location: 'Varanasi, UP',
    timestamp: new Date(Date.now() - 2 * 3600000),
    confirms: 9,
    flags: 0,
    urgent: false,
  },
  {
    id: 'feed_004',
    category: 'TRANSPORT',
    headline_hi: 'साझा ट्रक: आज़मगढ़ → लखनऊ, शनिवार सुबह 6 बजे',
    headline_en: 'Shared truck available: Azamgarh → Lucknow, Sat 6 AM',
    detail_hi: '12 टन क्षमता, 4 टन उपलब्ध। दर: ₹280/क्विंटल। संपर्क: मनोज ट्रांसपोर्ट (किराना नोड के ज़रिए)।',
    detail_en: '12-tonne capacity, 4 tonnes available. Rate: ₹280/quintal. Contact: Manoj Transport (via Kirana Node).',
    reporter_hi: 'मनोज ट्रांसपोर्ट कंपनी',
    reporter_en: 'Manoj Transport Co.',
    location: 'Azamgarh → Lucknow',
    timestamp: new Date(Date.now() - 4 * 3600000),
    confirms: 6,
    flags: 0,
    urgent: false,
  },
  {
    id: 'feed_005',
    category: 'WARNING',
    headline_hi: 'फर्जी खरीदार अलर्ट — "AgriPremium Traders" असत्यापित',
    headline_en: 'Fake buyer alert — "AgriPremium Traders" unverified',
    detail_hi: 'कई किसानों ने "AgriPremium Traders" द्वारा अग्रिम भुगतान घोटाले की शिकायत की है। पैसे न भेजें। किराना नोड को रिपोर्ट करें।',
    detail_en: 'Multiple farmers report advance payment scam from "AgriPremium Traders". Do not transfer money. Report to Kirana Node.',
    reporter_hi: 'ट्रस्ट नोड मॉडरेटर',
    reporter_en: 'Trust Node Moderator',
    location: 'Regional Alert',
    timestamp: new Date(Date.now() - 6 * 3600000),
    confirms: 43,
    flags: 0,
    urgent: true,
  },
  {
    id: 'feed_006',
    category: 'ANNOUNCEMENT',
    headline_hi: 'PM-KISAN 18वीं किस्त: e-KYC की अंतिम तारीख 15 सितंबर',
    headline_en: 'PM-KISAN 18th installment: e-KYC deadline extended to Sept 15',
    detail_hi: 'सरकार ने PM-KISAN 18वीं किस्त के लिए e-KYC की तारीख बढ़ा दी है। CSC केंद्र या mKisan ऐप पर जाएं।',
    detail_en: 'The government has extended the e-KYC deadline for PM-KISAN 18th installment. Visit CSC center or use mKisan app.',
    reporter_hi: 'सरकारी सलाह (AI-सत्यापित)',
    reporter_en: 'Govt. Advisory (AI-Verified)',
    location: 'All India',
    timestamp: new Date(Date.now() - 12 * 3600000),
    confirms: 89,
    flags: 2,
    urgent: false,
  },
];

function timeAgo(date, lang) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60)    return t('justNow', lang);
  if (lang === 'hi') {
    if (seconds < 3600)  return `${Math.floor(seconds / 60)} ${t('minsAgo', lang)}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${t('hoursAgo', lang)}`;
    return `${Math.floor(seconds / 86400)} ${t('daysAgo', lang)}`;
  }
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}${t('minsAgo', lang)}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${t('hoursAgo', lang)}`;
  return `${Math.floor(seconds / 86400)}${t('daysAgo', lang)}`;
}

function IntelCard({ item, onConfirm, onFlag, lang }) {
  const [localConfirms, setLocalConfirms] = useState(item.confirms || 0);
  const [confirmed, setConfirmed]         = useState(false);
  const [flagged, setFlagged]             = useState(false);

  const catCfg = FEED_CATEGORY_KEYS[item.category] || FEED_CATEGORY_KEYS.ANNOUNCEMENT;
  const headline = lang === 'hi' ? item.headline_hi : item.headline_en;
  const detail   = lang === 'hi' ? item.detail_hi   : item.detail_en;
  const reporter = lang === 'hi' ? item.reporter_hi : item.reporter_en;

  return (
    <article className="community-int__feed-card" aria-label={headline} data-urgent={item.urgent}>
      <header className="community-int__feed-card__header">
        <span className="community-int__feed-badge" style={{ color: catCfg.color, background: catCfg.bg }}>
          {catCfg.icon} {t(catCfg.labelKey, lang)}
        </span>
        {item.urgent && (
          <span className="community-int__feed-urgent" aria-label={t('urgent', lang)}>
            {t('urgent', lang)}
          </span>
        )}
        <time className="community-int__feed-time" dateTime={new Date(item.timestamp).toISOString()}>
          <Clock size={11} aria-hidden="true" /> {timeAgo(item.timestamp, lang)}
        </time>
      </header>

      <div className="community-int__feed-card__body">
        <h4 className="community-int__feed-headline">{headline}</h4>
        <p className="community-int__feed-detail">{detail}</p>
      </div>

      <footer className="community-int__feed-card__footer">
        <span className="community-int__feed-reporter">
          {t('reportedBy', lang)} <strong>{reporter}</strong> · {item.location}
        </span>
        <div className="community-int__feed-actions" role="group" aria-label="Feedback">
          <button
            type="button"
            className={`community-int__feed-action-btn ${confirmed ? 'community-int__feed-action-btn--active' : ''}`}
            onClick={() => { if (!confirmed) { setConfirmed(true); setLocalConfirms(n => n + 1); onConfirm?.(item.id); } }}
            disabled={confirmed}
            aria-pressed={confirmed}
            aria-label={`${t('confirmBtn', lang)} · ${localConfirms}`}
          >
            <ThumbsUp size={13} aria-hidden="true" />
            <span>{localConfirms}</span>
          </button>
          <button
            type="button"
            className={`community-int__feed-action-btn community-int__feed-action-btn--flag ${flagged ? 'community-int__feed-action-btn--flagged' : ''}`}
            onClick={() => { if (!flagged) { setFlagged(true); onFlag?.(item.id); } }}
            disabled={flagged}
            aria-pressed={flagged}
          >
            <Flag size={13} aria-hidden="true" />
            <span>{flagged ? t('flaggedBtn', lang) : t('flagBtn', lang)}</span>
          </button>
        </div>
      </footer>
    </article>
  );
}

export default function IntelFeed({ feedItems = DEMO_FEED_ITEMS, onConfirm, onFlag, lang = 'en' }) {
  const [activeFilter, setActiveFilter] = useState('feedFilterAll');

  const filtered = activeFilter === 'feedFilterAll'
    ? feedItems
    : feedItems.filter(item => {
        const catCfg = FEED_CATEGORY_KEYS[item.category];
        if (!catCfg) return false;
        return catCfg.labelKey === activeFilter;
      });

  return (
    <section className="community-int__section" aria-labelledby="ci-feed-heading">
      <div className="community-int__section-header">
        <div>
          <h3 className="community-int__section-title" id="ci-feed-heading">
            <Zap size={18} color="var(--accent-primary)" aria-hidden="true" />
            {t('feedSectionTitle', lang)}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            {t('feedSectionSub', lang)}
          </p>
        </div>
      </div>

      <nav aria-label={lang === 'hi' ? 'श्रेणी से फ़िल्टर करें' : 'Filter by category'}>
        <ul className="community-int__filter-pills" style={{ marginBottom: '20px' }}>
          {FEED_FILTER_KEYS.map(key => (
            <li key={key}>
              <button
                type="button"
                className={`community-int__pill ${activeFilter === key ? 'community-int__pill--active' : ''}`}
                onClick={() => setActiveFilter(key)}
                aria-pressed={activeFilter === key}
              >
                {t(key, lang)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="community-int__feed-list" aria-live="polite">
        {filtered.length === 0 ? (
          <div className="community-int__empty" role="status">
            <Wifi size={30} strokeWidth={1.25} style={{ color: 'var(--text-dim)', marginBottom: 12 }} aria-hidden="true" />
            <h4 className="community-int__empty-title">{t('feedEmptyTitle', lang)}</h4>
            <p className="community-int__empty-sub">{t('feedEmptySub', lang)}</p>
          </div>
        ) : (
          filtered.map(item => (
            <IntelCard key={item.id} item={item} onConfirm={onConfirm} onFlag={onFlag} lang={lang} />
          ))
        )}
      </div>
    </section>
  );
}
