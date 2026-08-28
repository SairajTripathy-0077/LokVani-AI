import React, { useMemo } from 'react';

/**
 * Organic hillside contour lines SVG
 */
function Contours({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 600"
      fill="none"
      className={`pointer-events-none stroke-black/[0.04] dark:stroke-white/[0.03] ${className}`}
      style={{ strokeWidth: 1.25 }}
    >
      <path d="M-100 120 C 150 180, 350 40, 600 110 C 850 180, 1050 60, 1300 140" />
      <path d="M-100 220 C 200 140, 450 300, 700 200 C 950 100, 1100 260, 1300 210" />
      <path d="M-100 340 C 120 400, 380 260, 650 350 C 920 440, 1080 300, 1300 360" />
      <path d="M-100 460 C 240 380, 480 520, 750 430 C 1020 340, 1150 480, 1300 450" />
    </svg>
  );
}

/**
 * Terraced Ridge Bands from Home Page
 */
function RidgeBand({ layers, className = '' }) {
  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 98%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 98%)',
      }}
    >
      <svg
        viewBox="0 0 1440 280"
        fill="none"
        preserveAspectRatio="none"
        className="block h-24 w-full sm:h-32 opacity-40"
      >
        {layers.map((l, i) => (
          <path key={i} d={l.d} fill={l.fill} opacity={l.opacity} />
        ))}
      </svg>
    </div>
  );
}

const RIDGE_FAR = [
  { d: 'M0 110 Q 360 40 720 90 T 1440 60 V280 H0 Z', fill: '#48734f', opacity: 0.08 },
  { d: 'M0 140 Q 400 80 800 130 T 1440 100 V280 H0 Z', fill: '#c49a2a', opacity: 0.06 },
];

const RIDGE_MID = [
  { d: 'M0 90 Q 320 150 720 80 T 1440 120 V280 H0 Z', fill: '#3f5d3b', opacity: 0.12 },
  { d: 'M0 130 Q 420 70 840 140 T 1440 90 V280 H0 Z', fill: '#5a7d54', opacity: 0.16 },
];

/**
 * Single Wheat Stalk motif
 */
function WheatStalk({ className = '' }) {
  return (
    <svg viewBox="0 0 40 120" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M20 115 V 15" strokeLinecap="round" />
      <path d="M20 40 C 12 35 8 25 10 15 C 18 20 20 30 20 40 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M20 40 C 28 35 32 25 30 15 C 22 20 20 30 20 40 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M20 60 C 10 55 5 43 8 32 C 17 38 20 50 20 60 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M20 60 C 30 55 35 43 32 32 C 23 38 20 50 20 60 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M20 80 C 8 75 3 60 7 48 C 17 55 20 68 20 80 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M20 80 C 32 75 37 60 33 48 C 23 55 20 68 20 80 Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

/**
 * Micro line-art motifs from Home Page
 * (sprout, leaf, wheat, furrow, seeds, bubble, mic, coin, doc, sun)
 */
function MotifSvg({ type }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'sprout':
      return (
        <svg viewBox="0 0 24 28" width="20" height="23" {...p}>
          <path d="M12 26 V12" />
          <path d="M12 18 C 6 16 4 9 7 4 C 13 7 12 14 12 18 Z" />
          <path d="M12 14 C 18 12 20 5 17 1 C 11 4 12 11 12 14 Z" />
        </svg>
      );
    case 'leaf':
      return (
        <svg viewBox="0 0 26 24" width="22" height="20" {...p}>
          <path d="M3 21 C 3 21 7 8 22 3 C 22 3 18 16 3 21 Z" />
          <path d="M3 21 L 12 12" />
        </svg>
      );
    case 'wheat':
      return (
        <svg viewBox="0 0 20 30" width="16" height="24" {...p}>
          <path d="M10 29 V 3" />
          <path d="M10 10 C 5 8 4 4 6 2 C 9 4 10 7 10 10 Z" />
          <path d="M10 10 C 15 8 16 4 14 2 C 11 4 10 7 10 10 Z" />
          <path d="M10 17 C 4 15 3 10 5 8 C 9 10 10 13 10 17 Z" />
          <path d="M10 17 C 16 15 17 10 15 8 C 11 10 10 13 10 17 Z" />
        </svg>
      );
    case 'furrow':
      return (
        <svg viewBox="0 0 32 16" width="28" height="14" {...p}>
          <path d="M2 4 Q 8 12 16 4 T 30 4" />
          <path d="M2 11 Q 8 19 16 11 T 30 11" opacity="0.6" />
        </svg>
      );
    case 'seeds':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
          <ellipse cx="6" cy="14" rx="2.5" ry="4" transform="rotate(-20 6 14)" />
          <ellipse cx="14" cy="8" rx="2.5" ry="4" transform="rotate(25 14 8)" />
          <ellipse cx="18" cy="17" rx="2" ry="3.5" transform="rotate(-15 18 17)" />
        </svg>
      );
    case 'bubble':
      return (
        <svg viewBox="0 0 26 24" width="22" height="20" {...p}>
          <path d="M4 18 V 6 C4 4 5.5 2.5 7.5 2.5 H 18.5 C 20.5 2.5 22 4 22 6 V 14 C 22 16 20.5 17.5 18.5 17.5 H 9 Z" />
          <path d="M7 11 H 15 M7 14.5 H 12" />
        </svg>
      );
    case 'mic':
      return (
        <svg viewBox="0 0 22 26" width="18" height="22" {...p}>
          <rect x="7" y="2" width="8" height="13" rx="4" />
          <path d="M4 11 C 4 16 7 19 11 19 C 15 19 18 16 18 11" />
          <path d="M11 19 V 24 M7 24 H 15" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7 V 17 M9.5 9.5 H 14.5 M9.5 14.5 H 14.5" />
        </svg>
      );
    case 'doc':
      return (
        <svg viewBox="0 0 22 26" width="18" height="22" {...p}>
          <path d="M4 3 H 14 L 18 7 V 23 H 4 Z" />
          <path d="M14 3 V 7 H 18" />
          <path d="M7 12 H 15 M7 16 H 13" />
        </svg>
      );
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2 V 5 M12 19 V 22 M2 12 H 5 M19 12 H 22 M4.9 4.9 L 7 7 M17 17 L 19.1 19.1 M4.9 19.1 L 7 17 M17 7 L 19.1 4.9" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── PRNG for deterministic seed scatter ─────────────────────── */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * All Home Page Background Elements:
 * - Topographic contour lines SVG
 * - Terraced ridge bands
 * - All 10 micro line-art agricultural & voice motifs (sprout, leaf, wheat, furrow, seeds, bubble, mic, coin, doc, sun)
 * - Corner wheat stalk SVG motifs
 * - Multi-layer ambient mesh glowing orbs
 */
export default function BackgroundElements() {
  const motifs = useMemo(() => {
    const types = ['sprout', 'leaf', 'wheat', 'furrow', 'seeds', 'bubble', 'mic', 'coin', 'doc', 'sun'];
    const rng = mulberry32(108);
    const result = [];
    for (let i = 0; i < 24; i++) {
      result.push({
        id: i,
        type: types[i % types.length],
        left: (5 + rng() * 90).toFixed(1),
        top: (8 + rng() * 84).toFixed(1),
        rot: (rng() * 360 - 180).toFixed(0),
        scale: (0.75 + rng() * 0.5).toFixed(2),
        opacity: (0.12 + rng() * 0.16).toFixed(2),
        color: i % 3 === 0 ? 'text-[#48734f]' : i % 3 === 1 ? 'text-[#c49a2a]' : 'text-zinc-600'
      });
    }
    return result;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Top Left Soft Emerald Mesh Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl" />

      {/* Top Right Amber Sunset Warm Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-bl from-amber-500/10 via-amber-200/5 to-transparent blur-3xl" />

      {/* Bottom Center Soft Teal Glow */}
      <div className="absolute -bottom-40 left-1/3 w-full max-w-xl h-96 rounded-full bg-gradient-to-t from-emerald-600/5 via-teal-500/5 to-transparent blur-3xl" />

      {/* Terraced Ridge Band Top Overlay */}
      <div className="absolute top-0 inset-x-0">
        <RidgeBand layers={RIDGE_FAR} />
      </div>

      {/* Terraced Ridge Band Mid Overlay */}
      <div className="absolute top-48 inset-x-0">
        <RidgeBand layers={RIDGE_MID} />
      </div>

      {/* Organic Topographic Contour Lines */}
      <Contours className="absolute inset-0 w-full h-full object-cover opacity-60" />

      {/* Micro Line-Art Motifs (All 10 types: sprout, leaf, wheat, furrow, seeds, bubble, mic, coin, doc, sun) */}
      <div className="absolute inset-0">
        {motifs.map((m) => (
          <div
            key={m.id}
            className={`absolute ${m.color} transition-transform duration-1000`}
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              transform: `rotate(${m.rot}deg) scale(${m.scale})`,
              opacity: m.opacity,
            }}
          >
            <MotifSvg type={m.type} />
          </div>
        ))}
      </div>

      {/* Corner Wheat Stalk SVG Motifs */}
      <WheatStalk className="absolute top-24 left-6 w-12 h-36 text-emerald-800/15 -rotate-12" />
      <WheatStalk className="absolute top-44 right-8 w-16 h-48 text-amber-700/15 rotate-12" />
      <WheatStalk className="absolute bottom-32 left-10 w-14 h-40 text-emerald-900/15 rotate-45" />
      <WheatStalk className="absolute bottom-20 right-12 w-16 h-44 text-amber-800/15 -rotate-20" />
    </div>
  );
}
