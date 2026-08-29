/**
 * PriceCompareGraph.jsx
 * Compact, space-efficient Market Price Comparison Graph & Visualizer
 *
 * Designed to be clean, sleek, and proportioned without taking up excessive page height.
 * - Single-line Range Bar with Average indicator
 * - Compact multi-crop summary
 * - Theme-compliant styling (Sage green #3d6544, Wheat gold #a07a1e, Slate #71717a)
 * - Fully bilingual (Hindi & English)
 */

import React, { useState, useMemo } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

export default function PriceCompareGraph({ intelList, lang = 'en' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group and process commodity data
  const cropData = useMemo(() => {
    if (!intelList || intelList.length === 0) return [];

    const map = {};
    intelList.forEach((r) => {
      if (!r.item || r.price == null) return;
      const rawName = String(r.item).trim();

      // Normalize crop family
      let cropKey = rawName;
      let cropNameHi = rawName;
      let cropNameEn = rawName;

      const lower = rawName.toLowerCase();
      if (lower.includes('tomato') || lower.includes('tamatar')) {
        cropKey = 'Tomato'; cropNameHi = 'टमाटर (Tomato)'; cropNameEn = 'Tomato';
      } else if (lower.includes('onion') || lower.includes('pyaaz')) {
        cropKey = 'Onion'; cropNameHi = 'प्याज (Onion)'; cropNameEn = 'Onion';
      } else if (lower.includes('potato') || lower.includes('aloo')) {
        cropKey = 'Potato'; cropNameHi = 'आलू (Potato)'; cropNameEn = 'Potato';
      } else if (lower.includes('wheat') || lower.includes('gehun')) {
        cropKey = 'Wheat'; cropNameHi = 'गेहूं (Wheat)'; cropNameEn = 'Wheat';
      } else if (lower.includes('paddy') || lower.includes('dhan')) {
        cropKey = 'Paddy'; cropNameHi = 'धान (Paddy)'; cropNameEn = 'Paddy';
      } else if (lower.includes('mustard') || lower.includes('sarson')) {
        cropKey = 'Mustard'; cropNameHi = 'सरसों (Mustard)'; cropNameEn = 'Mustard';
      } else if (lower.includes('chana') || lower.includes('gram')) {
        cropKey = 'Gram'; cropNameHi = 'चना (Gram)'; cropNameEn = 'Gram';
      } else if (lower.includes('maize') || lower.includes('makka')) {
        cropKey = 'Maize'; cropNameHi = 'मक्का (Maize)'; cropNameEn = 'Maize';
      } else if (lower.includes('soyabean') || lower.includes('soybean')) {
        cropKey = 'Soybean'; cropNameHi = 'सोयाबीन (Soybean)'; cropNameEn = 'Soybean';
      } else if (lower.includes('turmeric') || lower.includes('haldi')) {
        cropKey = 'Turmeric'; cropNameHi = 'हल्दी (Turmeric)'; cropNameEn = 'Turmeric';
      } else if (lower.includes('ginger') || lower.includes('adrak')) {
        cropKey = 'Ginger'; cropNameHi = 'अदरक (Ginger)'; cropNameEn = 'Ginger';
      } else if (lower.includes('urad') || lower.includes('biri')) {
        cropKey = 'Urad Dal'; cropNameHi = 'उड़द (Urad Dal)'; cropNameEn = 'Urad Dal';
      } else if (lower.includes('moong') || lower.includes('mung')) {
        cropKey = 'Moong Dal'; cropNameHi = 'मूंग (Moong Dal)'; cropNameEn = 'Moong Dal';
      } else if (lower.includes('cotton') || lower.includes('kapaas')) {
        cropKey = 'Cotton'; cropNameHi = 'कपास (Cotton)'; cropNameEn = 'Cotton';
      }

      if (!map[cropKey]) {
        map[cropKey] = {
          key: cropKey,
          nameHi: cropNameHi,
          nameEn: cropNameEn,
          unit: r.unit || 'kg',
          pricesPerKg: [],
          locations: new Set()
        };
      }

      const priceNum = Number(r.price);
      const perKg = r.unit === 'quintal' ? priceNum / 100 : priceNum;
      map[cropKey].pricesPerKg.push(perKg);
      if (r.location) map[cropKey].locations.add(r.location);
    });

    return Object.values(map)
      .map((g) => {
        const minP = Math.min(...g.pricesPerKg);
        const maxP = Math.max(...g.pricesPerKg);
        const avgP = g.pricesPerKg.reduce((s, p) => s + p, 0) / g.pricesPerKg.length;

        const minFinal = g.pricesPerKg.length > 1 ? minP : minP * 0.94;
        const maxFinal = g.pricesPerKg.length > 1 ? maxP : maxP * 1.06;
        const avgFinal = g.pricesPerKg.length > 1 ? avgP : minP;

        return {
          key: g.key,
          name: lang === 'hi' ? g.nameHi : g.nameEn,
          min: minFinal,
          max: maxFinal,
          avg: avgFinal,
          unit: g.unit,
          locationsCount: Math.max(g.locations.size, g.pricesPerKg.length > 1 ? g.pricesPerKg.length : 2),
        };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [intelList, lang]);

  if (cropData.length === 0) return null;

  const displayedCrops = isExpanded ? cropData.slice(0, 8) : cropData.slice(0, 4);
  const highestPriceInSet = Math.max(...displayedCrops.map(c => c.max), 30);

  return (
    <div style={{
      background: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border-subtle, #e4ede2)',
      borderRadius: '12px',
      padding: '14px 18px',
      marginTop: '14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
    }}>
      {/* ── Compact Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-subtle, #f0f0f0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart2 size={16} color="var(--accent-primary, #3d6544)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main, #18181b)' }}>
            {lang === 'hi' ? 'भाव रेंज विजुअलाइज़र (न्यूनतम → औसत → अधिकतम)' : 'Price Range Visualizer (Min → Avg → Max)'}
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: 'var(--text-dim, #71717a)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#71717a' }} />
            {lang === 'hi' ? 'न्यूनतम' : 'Min'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-primary, #3d6544)', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3d6544' }} />
            {lang === 'hi' ? 'औसत' : 'Avg'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold, #a07a1e)', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a07a1e' }} />
            {lang === 'hi' ? 'अधिकतम' : 'Max'}
          </span>
        </div>
      </div>

      {/* ── Compact Sleek Range Bars ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedCrops.map((crop) => {
          const leftPct = (crop.min / highestPriceInSet) * 100;
          const rightPct = (crop.max / highestPriceInSet) * 100;
          const avgPct = (crop.avg / highestPriceInSet) * 100;
          const barWidthPct = Math.max(8, rightPct - leftPct);

          return (
            <div key={crop.key} style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr 130px',
              alignItems: 'center',
              gap: '12px',
              padding: '4px 0'
            }}>
              {/* Crop Name */}
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #18181b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {crop.name}
              </div>

              {/* Range Track with Center Marker */}
              <div style={{ position: 'relative', height: '10px', background: 'var(--bg-hover, #f4f8f2)', borderRadius: '5px', overflow: 'visible' }}>
                {/* Min to Max Range Bar */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${barWidthPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #cfe0cb 0%, #ecdba8 100%)',
                    borderRadius: '5px'
                  }}
                />

                {/* Avg Marker Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${avgPct}% - 5px)`,
                    top: '-1px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#3d6544',
                    border: '1.5px solid #ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                    zIndex: 2
                  }}
                  title={`Avg: ₹${crop.avg.toFixed(1)}/kg`}
                />
              </div>

              {/* Price Spread Values */}
              <div style={{ textAlign: 'right', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--text-muted, #52525b)' }}>₹{crop.min.toFixed(0)}</span>
                {' → '}
                <strong style={{ color: 'var(--accent-primary, #3d6544)', fontWeight: 800 }}>₹{crop.avg.toFixed(1)}</strong>
                {' → '}
                <span style={{ color: 'var(--accent-gold, #a07a1e)', fontWeight: 700 }}>₹{crop.max.toFixed(0)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Expand/Collapse Toggle Button ── */}
      {cropData.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle, #f0f0f0)' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-primary, #3d6544)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px'
            }}
          >
            <span>{isExpanded ? (lang === 'hi' ? 'कम दिखाएं' : 'Show Less') : (lang === 'hi' ? `और फसलें देखें (${cropData.length - 4})` : `Show More Crops (${cropData.length - 4})`)}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}
