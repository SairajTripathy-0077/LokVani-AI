/**
 * PriceCard.jsx — Bilingual (Hindi / English)
 * Renders a single commodity price entry from the Community Mandi network.
 *
 * Changes from v1: All strings now sourced from communityTranslations.js via `t()`.
 * The `lang` prop is passed from the parent (CommunityIntel.jsx).
 *
 * Props: same as before + { lang: 'hi' | 'en' }
 */

import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle } from 'lucide-react';
import { isBelowMSP } from './mspData.js';
import { t } from './communityTranslations.js';

function relativeTime(date, lang) {
  if (!date) return t('justNow', lang);
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

export default function PriceCard({
  item, price, unit = 'kg', location, trend = 'stable',
  reportedBy, category, createdAt, showMSP = true, lang = 'en',
}) {
  const belowMSP     = showMSP && isBelowMSP(item, price, unit);
  const displayPrice = `₹${Number(price).toLocaleString('en-IN')}`;

  const TREND_CONFIG = {
    up:     { icon: <TrendingUp size={13} aria-hidden="true" />,   label: t('trendLabelUp', lang),     cssClass: 'community-int__trend--up',     text: t('trendUp', lang) },
    down:   { icon: <TrendingDown size={13} aria-hidden="true" />, label: t('trendLabelDown', lang),   cssClass: 'community-int__trend--down',   text: t('trendDown', lang) },
    stable: { icon: <Minus size={13} aria-hidden="true" />,        label: t('trendLabelStable', lang), cssClass: 'community-int__trend--stable', text: t('trendStable', lang) },
  };
  const trendCfg = TREND_CONFIG[trend] || TREND_CONFIG.stable;

  return (
    <article className="community-int__price-card" aria-label={`${item} ${location}: ${displayPrice}/${unit}`}>
      <div className="community-int__price-card__top">
        <div>
          <h4 className="community-int__price-card__name">{item}</h4>
          <p className="community-int__price-card__location">
            <MapPin size={12} color="var(--accent-primary)" aria-hidden="true" />
            {location}
          </p>
        </div>
        <div className="community-int__price-card__price-block">
          <span className="community-int__price-card__price">{displayPrice}</span>
          <span className="community-int__price-card__unit">/{unit}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {category && <span className="community-int__tag">{category}</span>}
        <span className={`community-int__trend ${trendCfg.cssClass}`} aria-label={trendCfg.label}>
          {trendCfg.icon} {trendCfg.text}
        </span>
      </div>

      {belowMSP && (
        <div className="community-int__msp-warning" role="alert" aria-label={t('mspWarning', lang)}>
          <AlertTriangle size={13} aria-hidden="true" />
          {t('mspWarning', lang)}
        </div>
      )}

      <footer className="community-int__price-card__footer">
        <span>{t('reportedBy', lang)} {reportedBy || (lang === 'hi' ? 'स्थानीय किसान' : 'Local Farmer')} · {relativeTime(createdAt, lang)}</span>
        <span className="community-int__verified-badge">
          <CheckCircle size={11} aria-hidden="true" />
          {t('verifiedBadge', lang)}
        </span>
      </footer>
    </article>
  );
}
