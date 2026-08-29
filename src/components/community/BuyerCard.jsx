/**
 * BuyerCard.jsx
 * Displays a single verified buyer from the Buyer Network section with
 * automated WhatsApp trade offer generator and direct phone call integration.
 */

import React, { useState } from 'react';
import { MapPin, Store, Phone, CheckCircle, MessageSquare, ExternalLink, X, Send, Calculator } from 'lucide-react';

export default function BuyerCard({
  name,
  location,
  distance,
  commodities = [],
  offerPrice,
  offerUnit = 'quintal',
  badge = 'Verified Buyer',
  contactInfo,
  phone,
  lang = 'en'
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(commodities[0] || 'Paddy');
  const [quantity, setQuantity] = useState(25);
  const [farmerName, setFarmerName] = useState('');

  // Extract clean digits for WhatsApp & Phone
  const rawContact = phone || contactInfo || '9437088211';
  const cleanDigits = rawContact.replace(/\D/g, '');
  const waPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : (cleanDigits || '919437088211');
  const telLink = cleanDigits ? `tel:+${cleanDigits.length === 10 ? '91' + cleanDigits : cleanDigits}` : `tel:+919437088211`;

  // Pre-generate WhatsApp message
  const estTotal = offerPrice ? (quantity * offerPrice).toLocaleString('en-IN') : null;
  const waMessage = lang === 'hi'
    ? `नमस्ते! मैं LokVani AI के माध्यम से आपसे संपर्क कर रहा हूँ।\n\n🏢 खरीदार: ${name}\n📍 स्थान: ${location}\n🌾 फसल: ${selectedCrop}\n📦 उपलब्ध मात्रा: ${quantity} ${offerUnit === 'quintal' ? 'क्विंटल' : 'किलो'}\n💰 अपेक्षित भाव: ₹${offerPrice ? offerPrice + '/' + (offerUnit === 'quintal' ? 'क्विंटल' : 'किलो') : 'बाज़ार भाव'}${estTotal ? `\n💵 अनुमानित मूल्य: ₹${estTotal}` : ''}\n👤 किसान का नाम: ${farmerName.trim() || 'किसान भाई'}\n\nक्या आप इस समय खरीद कर रहे हैं? कृपया उपलब्धता, तौल व भुगतान प्रक्रिया बताएं। धन्यवाद!`
    : `Hello! I am contacting you via LokVani AI.\n\n🏢 Buyer: ${name}\n📍 Location: ${location}\n🌾 Crop: ${selectedCrop}\n📦 Available Quantity: ${quantity} ${offerUnit}\n💰 Expected Rate: ₹${offerPrice ? offerPrice + '/' + offerUnit : 'Market Rate'}${estTotal ? `\n💵 Estimated Value: ₹${estTotal}` : ''}\n👤 Farmer: ${farmerName.trim() || 'Farmer'}\n\nAre you procuring right now? Please confirm pickup, weighing, and delivery terms. Thank you!`;

  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <article
        className="community-int__buyer-card"
        aria-label={`Buyer: ${name} at ${location}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-subtle, #e4ede2)',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        <div>
          {/* ── Header: avatar + name + location ── */}
          <div className="community-int__buyer-card__header" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div className="community-int__buyer-avatar" aria-hidden="true" style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg-hover, #f4f8f2)',
              border: '1px solid var(--border-subtle, #e4ede2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary, #3d6544)',
              flexShrink: 0
            }}>
              <Store size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <h4 className="community-int__buyer-card__name" style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #18181b)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {name}
                  <span title={badge} aria-label={badge} style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                    <CheckCircle size={15} strokeWidth={2.5} color="var(--accent-primary, #3d6544)" />
                  </span>
                </h4>
              </div>
              <p className="community-int__buyer-card__location" style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #52525b)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="var(--accent-primary, #3d6544)" />
                <span>{location}</span>
                {distance && (
                  <span style={{ color: 'var(--accent-primary, #3d6544)', fontWeight: 700 }}>
                    · {distance}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ── Commodities accepted ── */}
          {commodities.length > 0 && (
            <div aria-label="Commodities accepted" style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim, #71717a)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'hi' ? 'खरीद की फसलें' : 'Accepts Crops'}
              </p>
              <div className="community-int__buyer-card__commodities" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {commodities.map((c) => (
                  <span key={c} style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-hover, #f4f8f2)',
                    border: '1px solid var(--border-subtle, #e4ede2)',
                    color: 'var(--accent-primary, #3d6544)'
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: Offer price & Interactive Action Buttons ── */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle, #f0f0f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim, #71717a)', textTransform: 'uppercase' }}>
              {lang === 'hi' ? 'खरीद भाव:' : 'Offer Rate:'}
            </span>
            {offerPrice ? (
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary, #3d6544)' }}>
                ₹{Number(offerPrice).toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>/{offerUnit === 'quintal' ? (lang === 'hi' ? 'क्विंटल' : 'qtl') : 'kg'}</span>
              </span>
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                {lang === 'hi' ? 'संपर्क पर भाव' : 'Contact for price'}
              </span>
            )}
          </div>

          {/* Action Buttons: WhatsApp & Call */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: 'var(--accent-primary, #3d6544)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease'
              }}
              title={lang === 'hi' ? 'व्हाट्सएप पर बेचने का प्रस्ताव भेजें' : 'Send Sell Request on WhatsApp'}
            >
              <MessageSquare size={14} />
              <span>{lang === 'hi' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
            </button>

            <a
              href={telLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: 'var(--bg-hover, #f4f8f2)',
                color: 'var(--accent-primary, #3d6544)',
                border: '1px solid var(--border-subtle, #e4ede2)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              title={contactInfo || rawContact}
            >
              <Phone size={14} />
              <span>{lang === 'hi' ? 'कॉल करें' : 'Call'}</span>
            </a>
          </div>
        </div>
      </article>

      {/* ── Trade Offer Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary, #3d6544)', textTransform: 'uppercase' }}>
                  🌾 {lang === 'hi' ? 'खरीदार को बेचने का प्रस्ताव' : 'Sell Offer Request'}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #18181b)' }}>
                  {name}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted, #52525b)' }}>
                  📍 {location} · {distance}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: 'var(--text-dim, #71717a)',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Crop Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #18181b)', marginBottom: '6px' }}>
                  {lang === 'hi' ? 'फसल चुनें:' : 'Select Crop to Sell:'}
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-subtle, #e4ede2)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main, #18181b)',
                    background: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  {commodities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #18181b)', marginBottom: '6px' }}>
                  {lang === 'hi' ? `मात्रा (${offerUnit === 'quintal' ? 'क्विंटल' : 'किलो'} में):` : `Quantity in ${offerUnit}:`}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-subtle, #e4ede2)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main, #18181b)',
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Farmer Name (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #18181b)', marginBottom: '6px' }}>
                  {lang === 'hi' ? 'आपका नाम (वैकल्पिक):' : 'Your Name (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'जैसे: रमेश कुमार' : 'e.g. Ramesh Kumar'}
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-subtle, #e4ede2)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main, #18181b)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Calculated Value Box */}
              {offerPrice && (
                <div style={{
                  background: 'var(--bg-hover, #f4f8f2)',
                  border: '1px solid var(--border-subtle, #e4ede2)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim, #71717a)', textTransform: 'uppercase' }}>
                      {lang === 'hi' ? 'अनुमानित कुल आय' : 'Estimated Value'}
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary, #3d6544)' }}>
                      ₹{estTotal}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    @ ₹{offerPrice}/{offerUnit === 'quintal' ? (lang === 'hi' ? 'क्विंटल' : 'qtl') : 'kg'}
                  </div>
                </div>
              )}

              {/* Action Buttons inside modal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    background: 'var(--accent-primary, #3d6544)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(61,101,68,0.2)'
                  }}
                >
                  <MessageSquare size={18} />
                  <span>{lang === 'hi' ? 'व्हाट्सएप पर बिक्री प्रस्ताव भेजें' : 'Send Offer on WhatsApp'}</span>
                </a>

                <a
                  href={telLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    background: 'var(--bg-surface, #ffffff)',
                    color: 'var(--accent-primary, #3d6544)',
                    border: '1.5px solid var(--border-subtle, #e4ede2)',
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  <Phone size={16} />
                  <span>{lang === 'hi' ? `सीधा कॉल करें (${rawContact})` : `Call Directly (${rawContact})`}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
