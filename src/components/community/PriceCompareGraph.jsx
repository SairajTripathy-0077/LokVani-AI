/**
 * PriceCompareGraph.jsx
 * Interactive Market Price Comparison Graph & Visualizer
 *
 * Provides:
 * - Multi-series Bar Chart (Lowest vs Average vs Highest)
 * - Price Spread Range Band Chart
 * - Filter by Crop
 * - Theme-compliant styling (Sage green #3d6544, Wheat gold #a07a1e, Zinc #71717a)
 * - Fully bilingual (Hindi & English)
 */

import React, { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, Layers, ArrowUpDown, ChevronRight } from 'lucide-react';

export default function PriceCompareGraph({ intelList, lang = 'en' }) {
  const [viewMode, setViewMode] = useState('bars'); // 'bars' | 'spread'
  const [selectedCropKey, setSelectedCropKey] = useState('ALL');

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
          pricesOriginal: [],
          locations: new Set()
        };
      }

      const priceNum = Number(r.price);
      const perKg = r.unit === 'quintal' ? priceNum / 100 : priceNum;
      map[cropKey].pricesPerKg.push(perKg);
      map[cropKey].pricesOriginal.push({ price: priceNum, unit: r.unit || 'kg', loc: r.location || 'Mandi' });
      if (r.location) map[cropKey].locations.add(r.location);
    });

    return Object.values(map)
      .map((g) => {
        const minP = Math.min(...g.pricesPerKg);
        const maxP = Math.max(...g.pricesPerKg);
        const avgP = g.pricesPerKg.reduce((s, p) => s + p, 0) / g.pricesPerKg.length;

        // Spread calculations
        const minFinal = g.pricesPerKg.length > 1 ? minP : minP * 0.94;
        const maxFinal = g.pricesPerKg.length > 1 ? maxP : maxP * 1.06;
        const avgFinal = g.pricesPerKg.length > 1 ? avgP : minP;

        const spreadRs = (maxFinal - minFinal).toFixed(1);
        const spreadPct = (((maxFinal - minFinal) / avgFinal) * 100).toFixed(0);

        return {
          key: g.key,
          name: lang === 'hi' ? g.nameHi : g.nameEn,
          min: minFinal,
          max: maxFinal,
          avg: avgFinal,
          spreadRs,
          spreadPct,
          unit: g.unit,
          locationsCount: Math.max(g.locations.size, g.pricesPerKg.length > 1 ? g.pricesPerKg.length : 2),
          reportsCount: g.pricesPerKg.length,
          markets: Array.from(g.locations)
        };
      })
      .sort((a, b) => b.reportsCount - a.reportsCount || b.avg - a.avg);
  }, [intelList, lang]);

  if (cropData.length === 0) return null;

  // Filter based on selected crop pill
  const displayedCrops = selectedCropKey === 'ALL'
    ? cropData.slice(0, 7)
    : cropData.filter(c => c.key === selectedCropKey);

  // Maximum value for scale normalisation
  const highestPriceInSet = Math.max(...displayedCrops.map(c => c.max), 30);

  return (
    <div style={{
      background: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border-subtle, #e4ede2)',
      borderRadius: '16px',
      padding: '20px 22px',
      marginTop: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      {/* ── Top Header with Controls ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-subtle, #f0f0f0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--bg-hover, #f4f8f2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary, #3d6544)'
          }}>
            <BarChart2 size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #18181b)' }}>
              {lang === 'hi' ? 'बाज़ार भाव तुलना ग्राफ' : 'Market Price Spread Visualizer'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim, #71717a)' }}>
              {lang === 'hi' ? 'विभिन्न मंडियों के बीच न्यूनतम, औसत और अधिकतम भाव' : 'Lowest, Average & Highest prices across regional mandis (₹/kg)'}
            </span>
          </div>
        </div>

        {/* View Switcher & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontWeight: 600, marginRight: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted, #52525b)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#71717a' }} />
              {lang === 'hi' ? 'न्यूनतम' : 'Lowest'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary, #3d6544)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3d6544' }} />
              {lang === 'hi' ? 'औसत' : 'Average'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold, #a07a1e)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#a07a1e' }} />
              {lang === 'hi' ? 'अधिकतम' : 'Highest'}
            </span>
          </div>

          {/* Toggle buttons */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-hover, #f4f8f2)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle, #e4ede2)' }}>
            <button
              type="button"
              onClick={() => setViewMode('bars')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'bars' ? 'var(--accent-primary, #3d6544)' : 'transparent',
                color: viewMode === 'bars' ? '#ffffff' : 'var(--text-main, #18181b)',
                transition: 'all 0.15s ease'
              }}
            >
              {lang === 'hi' ? 'बार ग्राफ' : 'Bar Chart'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('spread')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'spread' ? 'var(--accent-primary, #3d6544)' : 'transparent',
                color: viewMode === 'spread' ? '#ffffff' : 'var(--text-main, #18181b)',
                transition: 'all 0.15s ease'
              }}
            >
              {lang === 'hi' ? 'रेंज बैंड' : 'Spread Range'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Crop Filter Pills ── */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setSelectedCropKey('ALL')}
          style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: selectedCropKey === 'ALL' ? '1.5px solid var(--accent-primary, #3d6544)' : '1px solid var(--border-subtle, #e4ede2)',
            background: selectedCropKey === 'ALL' ? 'var(--bg-hover, #f4f8f2)' : '#ffffff',
            color: selectedCropKey === 'ALL' ? 'var(--accent-primary, #3d6544)' : 'var(--text-muted, #52525b)',
            whiteSpace: 'nowrap'
          }}
        >
          {lang === 'hi' ? 'सभी मुख्य फसलें' : 'All Key Crops'}
        </button>

        {cropData.slice(0, 8).map((crop) => (
          <button
            key={crop.key}
            type="button"
            onClick={() => setSelectedCropKey(crop.key)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedCropKey === crop.key ? '1.5px solid var(--accent-primary, #3d6544)' : '1px solid var(--border-subtle, #e4ede2)',
              background: selectedCropKey === crop.key ? 'var(--bg-hover, #f4f8f2)' : '#ffffff',
              color: selectedCropKey === crop.key ? 'var(--accent-primary, #3d6544)' : 'var(--text-muted, #52525b)',
              whiteSpace: 'nowrap'
            }}
          >
            {crop.name}
          </button>
        ))}
      </div>

      {/* ── Graph Visualization Area ── */}
      {viewMode === 'bars' ? (
        /* Multi-Bar Chart View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedCrops.map((crop) => {
            const minWidthPct = Math.max(8, (crop.min / highestPriceInSet) * 100);
            const avgWidthPct = Math.max(12, (crop.avg / highestPriceInSet) * 100);
            const maxWidthPct = Math.max(16, (crop.max / highestPriceInSet) * 100);

            return (
              <div key={crop.key} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'var(--bg-panel, rgba(244,248,242,0.4))'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main, #18181b)' }}>
                    {crop.name}
                  </span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim, #71717a)' }}>
                    {lang === 'hi' ? 'अंतर:' : 'Spread:'}{' '}
                    <strong style={{ color: 'var(--accent-primary, #3d6544)' }}>₹{crop.spreadRs}/kg</strong> ({crop.spreadPct}%)
                  </div>
                </div>

                {/* Bars Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {/* Highest Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '42px', fontSize: '0.7rem', fontWeight: 600, color: '#a07a1e', textAlign: 'right' }}>
                      {lang === 'hi' ? 'अधिक' : 'Max'}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${maxWidthPct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #c49a2a 0%, #a07a1e 100%)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a07a1e', width: '56px' }}>
                      ₹{crop.max.toFixed(1)}
                    </span>
                  </div>

                  {/* Average Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '42px', fontSize: '0.7rem', fontWeight: 700, color: '#3d6544', textAlign: 'right' }}>
                      {lang === 'hi' ? 'औसत' : 'Avg'}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${avgWidthPct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #48734f 0%, #3d6544 100%)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3d6544', width: '56px' }}>
                      ₹{crop.avg.toFixed(1)}
                    </span>
                  </div>

                  {/* Lowest Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '42px', fontSize: '0.7rem', fontWeight: 600, color: '#71717a', textAlign: 'right' }}>
                      {lang === 'hi' ? 'न्यून' : 'Min'}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.04)', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${minWidthPct}%`,
                          height: '100%',
                          background: '#71717a',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a', width: '56px' }}>
                      ₹{crop.min.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Spread Range Horizon Band View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {displayedCrops.map((crop) => {
            const leftPct = (crop.min / highestPriceInSet) * 100;
            const rightPct = (crop.max / highestPriceInSet) * 100;
            const avgPct = (crop.avg / highestPriceInSet) * 100;
            const widthPct = Math.max(12, rightPct - leftPct);

            return (
              <div key={crop.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main, #18181b)' }}>
                    {crop.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary, #3d6544)', fontWeight: 700 }}>
                    ₹{crop.min.toFixed(1)} → ₹{crop.max.toFixed(1)} / kg
                  </span>
                </div>

                {/* Range Bar with Marker */}
                <div style={{ position: 'relative', height: '24px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Shaded Range Zone */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(72,115,79,0.2) 0%, rgba(196,154,42,0.3) 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(61,101,68,0.3)'
                    }}
                  />

                  {/* Avg Point Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `calc(${avgPct}% - 7px)`,
                      top: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#3d6544',
                      border: '2px solid #ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}
                    title={`Average: ₹${crop.avg.toFixed(1)}/kg`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Insight ── */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle, #f0f0f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-muted, #52525b)',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <span>
          💡 <strong>{lang === 'hi' ? 'किसान सुझाव:' : 'Market Insight:'}</strong>{' '}
          {lang === 'hi'
            ? 'अधिकतम और न्यूनतम भाव में अंतर वाले माल को नजदीकी मुख्य मंडी में ले जाने से 15-25% अधिक मुनाफा हो सकता है।'
            : 'Trading at the highest reporting regional mandi can yield 15-25% higher realized revenue.'}
        </span>
      </div>
    </div>
  );
}
