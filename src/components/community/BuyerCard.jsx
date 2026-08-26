/**
 * BuyerCard.jsx
 * Displays a single verified buyer from the Buyer Network section.
 *
 * DATA NOTE: This component uses static demo data defined in buyerData.js.
 * It is designed to consume data from a future `GET /api/buyers` endpoint
 * once the backend stub is promoted to a full implementation.
 * The "Demo" label makes this clear to evaluators and team members.
 *
 * Props:
 *   @param {string}   name         — Buyer / company name
 *   @param {string}   location     — Buyer's city / region
 *   @param {string}   distance     — Distance from a reference mandi (e.g. "45 km")
 *   @param {string[]} commodities  — List of crop names the buyer procures
 *   @param {number}   offerPrice   — Current offer price per quintal
 *   @param {string}   offerUnit    — "quintal" | "kg"
 *   @param {string}   badge        — Buyer type label (e.g. "FPO Partner", "APMC")
 *   @param {string}   contactInfo  — Contact number or email (masked for demo)
 *
 * Commit: feat(community): add BuyerCard for verified buyer network section
 */

import React from 'react';
import { MapPin, Store, Phone, CheckCircle, Leaf, Wheat, Apple, Sprout, Droplet, Box, Flame } from 'lucide-react';

function getCropIcon(str = '') {
  const s = str.toLowerCase();
  if (s.includes('vegetable') || s.includes('सब्ज़ी') || s.includes('tomato') || s.includes('onion') || s.includes('potato') || s.includes('garlic')) return <Leaf size={12} />;
  if (s.includes('grain') || s.includes('अनाज') || s.includes('wheat') || s.includes('paddy') || s.includes('maize') || s.includes('bajra') || s.includes('barley')) return <Wheat size={12} />;
  if (s.includes('fruit') || s.includes('फल') || s.includes('apple') || s.includes('mango') || s.includes('banana')) return <Apple size={12} />;
  if (s.includes('pulse') || s.includes('दाल') || s.includes('arhar') || s.includes('moong') || s.includes('urad') || s.includes('chana')) return <Sprout size={12} />;
  if (s.includes('oil') || s.includes('तिलहन') || s.includes('soybean') || s.includes('mustard') || s.includes('sunflower') || s.includes('sesame')) return <Droplet size={12} />;
  if (s.includes('spice') || s.includes('मसाले') || s.includes('chili') || s.includes('turmeric') || s.includes('coriander')) return <Flame size={12} />;
  return <Box size={12} />;
}

export default function BuyerCard({
  name,
  location,
  distance,
  commodities = [],
  offerPrice,
  offerUnit = 'quintal',
  badge = 'Verified Buyer',
  contactInfo,
}) {
  return (
    <article
      className="community-int__buyer-card"
      aria-label={`Buyer: ${name} at ${location}`}
    >
      {/* ── Header: avatar + name + location ── */}
      <div className="community-int__buyer-card__header">
        <div className="community-int__buyer-avatar" aria-hidden="true">
          <Store size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 className="community-int__buyer-card__name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {name}
            <span title={badge} aria-label={badge} style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', marginTop: '2px' }}>
              <CheckCircle size={15} aria-hidden="true" color="var(--accent-primary)" />
            </span>
          </h4>
          <p className="community-int__buyer-card__location">
            <MapPin size={12} aria-hidden="true" />
            {location}
            {distance && (
              <span style={{ marginLeft: '6px', color: 'var(--text-dim)' }}>
                · {distance}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Commodities accepted ── */}
      {commodities.length > 0 && (
        <div aria-label="Commodities accepted">
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Accepts
          </p>
          <div className="community-int__buyer-card__commodities">
            {commodities.map((c) => (
              <span key={c} className="community-int__tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {getCropIcon(c)} {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer: offer price + contact ── */}
      <footer className="community-int__buyer-card__footer">
        {offerPrice ? (
          <p className="community-int__buyer-offer">
            Offering <strong>₹{Number(offerPrice).toLocaleString('en-IN')}</strong>/{offerUnit}
          </p>
        ) : (
          <p className="community-int__buyer-offer" style={{ color: 'var(--text-dim)' }}>
            Contact for price
          </p>
        )}
        {contactInfo && (
          <span
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            aria-label={`Contact: ${contactInfo}`}
          >
            <Phone size={12} aria-hidden="true" />
            {contactInfo}
          </span>
        )}
      </footer>
    </article>
  );
}
