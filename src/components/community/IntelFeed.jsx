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
    <article className="community-int__feed-card" aria-label={headline} style={{ borderLeft: 'none', paddingTop: '16px' }}>
      <div className="community-int__feed-card__body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <h4 className="community-int__feed-headline" style={{ marginTop: 0 }}>{headline}</h4>
          <time className="community-int__feed-time" dateTime={new Date(item.timestamp).toISOString()} style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
            {timeAgo(item.timestamp, lang)}
          </time>
        </div>
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

export default function IntelFeed({ feedItems = [], onConfirm, onFlag, lang = 'en' }) {
  const filtered = feedItems;

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
