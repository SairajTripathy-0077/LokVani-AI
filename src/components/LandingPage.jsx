import React, { useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Mic, Landmark, Users, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

/* ── Parallax — one shared rAF loop, damped lerp toward target ──
   Soft-chases its target instead of snapping to scroll, so layers
   feel weighty rather than mechanically glued to the scrollbar.   */
const _pxItems = new Set();
let _pxRaf = null;

function _pxTick() {
  const vh = window.innerHeight || 800;
  _pxItems.forEach((item) => {
    if (!item.outer.isConnected) return;
    const r = item.outer.getBoundingClientRect();
    if (r.bottom < -300 || r.top > vh + 300) return; // off-screen: rest
    const target = (r.top + r.height / 2 - vh / 2) * item.speed;
    item.current += (target - item.current) * 0.08; // ease toward target
    if (Math.abs(target - item.current) < 0.1) item.current = target;
    item.inner.style.transform = `translate3d(0, ${item.current.toFixed(2)}px, 0)`;
  });
  _pxRaf = requestAnimationFrame(_pxTick);
}

function Parallax({ speed = 0.1, className = '', innerClassName = '', children }) {
  const outer = useRef(null);
  const inner = useRef(null);

  useEffect(() => {
    if (!outer.current || !inner.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const item = { outer: outer.current, inner: inner.current, speed, current: 0 };
    _pxItems.add(item);
    if (!_pxRaf) _pxRaf = requestAnimationFrame(_pxTick);

    return () => {
      _pxItems.delete(item);
      if (_pxItems.size === 0 && _pxRaf) {
        cancelAnimationFrame(_pxRaf);
        _pxRaf = null;
      }
    };
  }, [speed]);

  return (
    <div ref={outer} className={`relative ${className}`}>
      <div ref={inner} className={`will-change-transform ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
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

/* ── Section eyebrow tag ─────────────────────────────────────── */
function Eyebrow({ tone = 'bg-[#48734f]', children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 py-1 shadow-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
      <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
        {children}
      </span>
    </span>
  );
}

/* ── High-end Double-Bezel card ───────────────────────────────── */
function Bezel({ children, className = '' }) {
  return (
    <div className={`rounded-[1.75rem] bg-zinc-200/40 p-1.5 ring-1 ring-black/[0.06] shadow-[0_20px_50px_-24px_rgba(24,24,27,0.12)] ${className}`}>
      <div className="relative h-full overflow-hidden rounded-[calc(1.75rem-6px)] bg-white">
        {children}
      </div>
    </div>
  );
}

/* ── Organic hillside contour lines SVG ──────────────────────── */
function Contours({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1200 600"
      fill="none"
      className={`pointer-events-none stroke-black/[0.04] ${className}`}
      style={{ strokeWidth: 1.25 }}
    >
      <path d="M-100 120 C 150 180, 350 40, 600 110 C 850 180, 1050 60, 1300 140" />
      <path d="M-100 220 C 200 140, 450 300, 700 200 C 950 100, 1100 260, 1300 210" />
      <path d="M-100 340 C 120 400, 380 260, 650 350 C 920 440, 1080 300, 1300 360" />
      <path d="M-100 460 C 240 380, 480 520, 750 430 C 1020 340, 1150 480, 1300 450" />
    </svg>
  );
}

/* ── Terraced Ridge Bands — dissolution gradients top & bottom ── */
function RidgeBand({ layers }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 98%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 98%)',
      }}
    >
      <svg
        viewBox="0 0 1440 280"
        fill="none"
        preserveAspectRatio="none"
        className="block h-28 w-full sm:h-36 lg:h-44"
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

const RIDGE_DUSK = [
  { d: 'M0 70 Q 380 140 760 60 T 1440 110 V280 H0 Z', fill: '#2e4231', opacity: 0.22 },
  { d: 'M0 110 Q 340 50 700 120 T 1440 80 V280 H0 Z', fill: '#1a271c', opacity: 0.35 },
];

/* ── Single Wheat Stalk motif ────────────────────────────────── */
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

/* ── Pill Button component ───────────────────────────────────── */
function PillButton({ onClick, dark = true, children }) {
  return (
    <button
      onClick={onClick}
      className={`group flex cursor-pointer items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-medium transition-all duration-500 ease-premium active:scale-[0.98] ${
        dark
          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
          : 'border border-black/[0.08] bg-white text-zinc-900 hover:border-black/[0.16] hover:bg-zinc-50'
      }`}
    >
      <span>{children}</span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-premium group-hover:translate-x-0.5 ${
          dark ? 'bg-white/10' : 'bg-black/[0.05]'
        }`}
      >
        <ArrowRight size={14} strokeWidth={1.5} />
      </span>
    </button>
  );
}

/* ── Micro line-art motifs (scattered across the field) ─────── */
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
        <svg viewBox="0 0 22 26" width="19" height="23" {...p}>
          <path d="M3 1 H14 L19 6 V25 H3 Z" />
          <path d="M14 1 V6 H19" />
          <path d="M6.5 11 H15.5 M6.5 14.5 H15.5 M6.5 18 H12.5" />
        </svg>
      );
    case 'waves':
      return (
        <svg viewBox="0 0 30 24" width="27" height="21" {...p}>
          <circle cx="4" cy="12" r="1.2" fill="currentColor" strokeWidth="0" />
          <path d="M9 7 C11.5 9.5 11.5 14.5 9 17" />
          <path d="M14 4 C18 8 18 16 14 20" />
          <path d="M19 1.5 C24.5 7 24.5 17 19 22.5" />
        </svg>
      );
    default:
      return null;
  }
}

const PILLARS = [
  {
    icon: Mic,
    title_en: 'Multilingual Voice Engine',
    title_hi: 'बहुभाषी वॉयस इंजन',
    desc_en: 'Spoken queries in Hindi, Bhojpuri, Marathi, Tamil and nine more regional dialects — with instant transcription and natural speech synthesis in reply.',
    desc_hi: 'हिंदी, भोजपुरी, मैथिली, मराठी और अन्य क्षेत्रीय बोलियों में बोलकर सवाल पूछें — त्वरित प्रतिलेखन और प्राकृतिक वाक् प्रतिक्रिया के साथ।',
    span: 'md:col-span-7',
    accent: 'group-hover:border-[#c8dcc4] group-hover:text-[#48734f] group-hover:bg-[#f4f8f2]',
  },
  {
    icon: Landmark,
    title_en: 'Public Schemes Engine',
    title_hi: 'सरकारी योजना इंजन',
    desc_en: 'Instant eligibility matching across 100+ government schemes, with document checklists and step-by-step application guidance.',
    desc_hi: '१००+ से अधिक सरकारी योजनाओं में तत्काल योग्यता मिलान, आवश्यक दस्तावेजों की सूची और आवेदन प्रक्रिया के साथ।',
    span: 'md:col-span-5',
    accent: 'group-hover:border-[#ecdcb6] group-hover:text-[#a07a1e] group-hover:bg-[#faf6ec]',
  },
  {
    icon: Users,
    title_en: 'Community Intel Network',
    title_hi: 'सामुदायिक खुफिया नेटवर्क',
    desc_en: 'Crowdsourced mandi price tracking from local Kirana trust nodes, cross-checked against live Agmarknet government feeds — so no farmer trades on stale numbers.',
    desc_hi: 'स्थानीय किराना ट्रस्ट नोड्स से लाइव मंडी भाव ट्रैकिंग, एगमार्कनेट सरकारी डेटा के साथ सत्यापित — ताकि कोई भी किसान पुराने दामों पर व्यापार न करे।',
    span: 'md:col-span-12',
    accent: 'group-hover:border-[#d3d7f7] group-hover:text-indigo-600 group-hover:bg-[#f5f5fd]',
  },
];

export default function LandingPage() {
  const { setActiveTab, language } = useApp();
  const { isSignedIn } = useAuth();

  const isHindi = language === 'hi';

  const handleLaunch = () => setActiveTab('voice');

  /* Quiet scatter of farm + product motifs — jittered grid so it
     spreads evenly across every screen, seeded to stay put */
  const scatter = useMemo(() => {
    const rnd = mulberry32(11);
    const types = [
      'sprout', 'leaf', 'furrow', 'seeds', 'wheat',
      'bubble', 'mic', 'coin', 'doc', 'waves',
    ];
    const cols = 4, rows = 3;
    return Array.from({ length: cols * rows }, (_, i) => {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      return {
        type: types[Math.floor(rnd() * types.length)],
        left: ((cx + 0.18 + rnd() * 0.64) / cols) * 100,
        top: ((cy + 0.18 + rnd() * 0.64) / rows) * 100,
        rot: (rnd() - 0.5) * 64,
        scale: (1.2 + rnd() * 1.1).toFixed(2),
        opacity: (0.14 + rnd() * 0.12).toFixed(3),
        dur: (9 + rnd() * 9).toFixed(1),
        delay: (-rnd() * 12).toFixed(1),
      };
    });
  }, []);

  return (
    <div className={`relative overflow-x-clip ${isHindi ? 'font-devanagari' : ''}`}>

      {/* ══ Ambient sky layer — one continuous atmosphere ═════ */}
      <div aria-hidden className="grain pointer-events-none absolute inset-0">
        {/* base gradient wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #fbfbfa 0%, #f8f7f0 20%, #f3f5ec 46%, #edf1e6 72%, #e8ede0 100%)',
          }}
        />

        {/* morning sun + halo rings (slow parallax drift) */}
        <Parallax speed={0.05} className="absolute right-[5%] top-[1%] h-[520px] w-[520px]">
          <div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(214,168,54,0.24), transparent 65%)' }}
          />
          <div className="absolute inset-[-70px] rounded-full ring-1 ring-[#d6a83a]/10" />
          <div className="absolute inset-[-150px] rounded-full ring-1 ring-[#d6a83a]/[0.06]" />
        </Parallax>

        {/* drifting clouds */}
        <Parallax speed={0.09} className="absolute left-[8%] top-[7%] h-20 w-72">
          <div className="h-full w-full rounded-full bg-white/60 blur-2xl" />
        </Parallax>
        <Parallax speed={0.12} className="absolute left-[48%] top-[12%] h-16 w-96">
          <div className="h-full w-full rounded-full bg-white/45 blur-2xl" />
        </Parallax>

        {/* sage field glow, mid left */}
        <div
          className="absolute -left-48 top-[26%] h-[600px] w-[600px] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(90,125,84,0.15), transparent 65%)' }}
        />
        {/* wheat warmth drifting through the pillars */}
        <div
          className="absolute right-[-8%] top-[42%] h-[460px] w-[460px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(196,154,42,0.13), transparent 65%)' }}
        />
        {/* indigo dusk settling before the final panel */}
        <div
          className="absolute -right-32 bottom-[3%] h-[540px] w-[540px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(79,90,160,0.12), transparent 65%)' }}
        />
        {/* deep green valley floor */}
        <div
          className="absolute left-[-10%] bottom-[-5%] h-[480px] w-[600px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(63,93,59,0.17), transparent 65%)' }}
        />

        {/* pollen drifting through the middle air */}
        {[
          ['6%', '30%', '#c49a2a'], ['30%', '24%', '#a3b86b'], ['58%', '33%', '#c49a2a'],
          ['82%', '27%', '#a3b86b'], ['14%', '47%', '#a3b86b'], ['46%', '55%', '#c49a2a'],
          ['74%', '49%', '#a3b86b'], ['92%', '58%', '#c49a2a'], ['22%', '63%', '#c49a2a'],
        ].map(([left, top, color], i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left, top, background: color, opacity: 0.5,
              boxShadow: `0 0 10px 2px ${color}40`,
              animation: `floatBlob ${8 + i * 1.9}s ease-in-out ${i * 0.9}s infinite`,
            }}
          />
        ))}

        {/* fireflies waking at the field's edge */}
        {[
          ['8%', '88%', '#d6a83a'], ['17%', '95%', '#d6a83a'], ['84%', '90%', '#a3b86b'],
          ['93%', '82%', '#d6a83a'], ['70%', '97%', '#a3b86b'], ['27%', '80%', '#a3b86b'],
        ].map(([left, top, color], i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left, top, background: color,
              boxShadow: `0 0 14px 3px ${color}55`,
              animation: `floatBlob ${7 + i * 1.7}s ease-in-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ══ Fixed doodle layer — evenly spread across the screen ══ */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden md:block">
        <div className="absolute inset-0 text-[#48734f]">
          {scatter.map((m, i) => (
            <span key={i} className="absolute block" style={{ left: `${m.left}%`, top: `${m.top}%` }}>
              <span
                className="block"
                style={{ opacity: m.opacity, animation: `floatBlob ${m.dur}s ease-in-out ${m.delay}s infinite` }}
              >
                <span className="block" style={{ transform: `rotate(${m.rot}deg) scale(${m.scale})` }}>
                  <MotifSvg type={m.type} />
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ Content — above the doodle layer ══════════════════ */}
      <div className="relative z-10">

      {/* ══ Hero — dawn over the fields ═══════════════════════ */}
      <section className="relative">
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-24 text-center sm:px-6 sm:pt-36 lg:pt-40">
          <Reveal delay={90}>
            {isHindi ? (
              <h1 className="mx-auto max-w-3xl text-balance text-[2.5rem] font-bold leading-[1.2] tracking-[-0.01em] text-zinc-900 sm:text-5xl lg:text-[4rem]">
                ग्रामीण भारत के लिए उत्तर,{' '}
                <span className="italic text-[#48734f]">उसकी अपनी आवाज में।</span>
              </h1>
            ) : (
              <h1 className="mx-auto max-w-3xl text-balance text-[2.75rem] font-semibold leading-[1.06] tracking-[-0.01em] text-zinc-900 sm:text-6xl lg:text-[4.5rem]">
                Answers for rural India,{' '}
                <span className="italic text-[#48734f]">in its own voice.</span>
              </h1>
            )}
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg">
              {isHindi
                ? 'लोकवाणी १३ भारतीय बोलियों में आपकी बात सुनती है और सत्यापित मंडी भाव, सरकारी योजनाएं एवं फसल सलाह — तुरंत और मुफ्त प्रदान करती है।'
                : 'LokVani listens in thirteen Indian dialects and returns verified mandi prices, scheme eligibility and crop advisory — instantly, and free.'}
            </p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {!isSignedIn ? (
                <PillButton onClick={() => setActiveTab('auth')}>
                  {isHindi ? 'मुफ्त में शुरू करें' : 'Get started free'}
                </PillButton>
              ) : (
                <PillButton onClick={() => setActiveTab('voice')}>
                  {isHindi ? 'डैशबोर्ड खोलें' : 'Launch dashboard'}
                </PillButton>
              )}
              <PillButton onClick={handleLaunch} dark={false}>
                <span className="inline-flex items-center gap-2">
                  <Mic size={14} strokeWidth={1.5} />
                  {isHindi ? 'वॉयस ऐप आजमाएं' : 'Try the voice app'}
                </span>
              </PillButton>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <p className="mt-16 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
              {isHindi
                ? 'किसानों के लिए मुफ्त · 24x7 उपलब्ध · समुदाय के साथ निर्मित'
                : 'Free for farmers · Always available · Built with the community'}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ First ridges — static composition, perfectly aligned ══ */}
      <div aria-hidden className="relative -my-10">
        <RidgeBand layers={RIDGE_FAR} />
        <div className="-mt-24">
          <RidgeBand layers={RIDGE_MID} />
        </div>
      </div>

      {/* ══ Trust strip — walking the field rows ══════════════ */}
      <section className="relative py-20 sm:py-28">
        <WheatStalk className="absolute left-[5%] top-1/2 hidden h-32 -translate-y-1/2 text-[#5a7d54]/30 lg:block" />
        <WheatStalk className="absolute right-[5%] top-1/2 hidden h-32 -translate-y-1/2 scale-x-[-1] text-[#5a7d54]/25 lg:block" />
        <WheatStalk className="absolute left-[13%] top-1/2 hidden h-24 -translate-y-[60%] text-[#c49a2a]/30 xl:block" />
        <WheatStalk className="absolute right-[13%] top-1/2 hidden h-24 -translate-y-[42%] scale-x-[-1] text-[#c49a2a]/25 xl:block" />

        <Reveal className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              [isHindi ? 'किराना ट्रस्ट नोड द्वारा सत्यापित' : 'Kirana Trust Node verified', 'bg-emerald-600'],
              [isHindi ? 'गूगल जेमिनी एआई संचालित' : 'Google Gemini powered',      'bg-indigo-500'],
              [isHindi ? 'लाइव एगमार्कनेट मंडी भाव' : 'Live Agmarknet feeds',       'bg-[#c49a2a]'],
              [isHindi ? 'समुदाय द्वारा संकलित' : 'Community crowdsourced',     'bg-sky-500'],
            ].map(([label, dot]) => (
              <span key={label} className="flex items-center gap-2.5 text-[13px] font-semibold text-zinc-600">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ Pillars — terraced across the hillside ════════════ */}
      <section className="relative pb-24 pt-8 sm:pb-32">
        <Contours className="pointer-events-none absolute left-1/2 top-1/2 w-[1300px] max-w-none -translate-x-1/2 -translate-y-1/2" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Eyebrow tone="bg-[#c49a2a]">
                {isHindi ? 'हमारा मंच' : 'The platform'}
              </Eyebrow>
              <h2 className="mt-7 text-balance text-3xl font-bold tracking-[-0.01em] text-zinc-900 sm:text-[2.6rem] sm:leading-[1.15]">
                {isHindi ? 'दिखावे के लिए नहीं, वास्तविक प्रभाव के लिए निर्मित।' : 'Built for real impact, not demos.'}
              </h2>
              <p className="mt-5 text-pretty text-[15px] leading-relaxed text-zinc-600">
                {isHindi
                  ? 'जमीनी स्तर पर सामुदायिक सत्यापन से सशक्त अत्याधुनिक भाषा मॉडल।'
                  : 'State-of-the-art language models grounded by ground-level community verification.'}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
            {PILLARS.map(({ icon: Icon, title_en, title_hi, desc_en, desc_hi, span, accent }, i) => (
              <Reveal key={title_en} delay={i * 110} className={`${span} w-full`}>
                <Bezel className="group h-full transition-transform duration-700 ease-premium hover:-translate-y-1">
                  <div className="flex h-full flex-col rounded-[calc(1.75rem-6px)] p-8 sm:p-10">
                    <span className={`flex h-11 w-11 items-center justify-center self-start rounded-full border border-black/[0.07] bg-zinc-50 text-zinc-700 transition-all duration-700 ease-premium ${accent}`}>
                      <Icon size={18} strokeWidth={1.25} />
                    </span>
                    <h3 className="mt-7 text-xl font-bold text-zinc-900">
                      {isHindi ? title_hi : title_en}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600">
                      {isHindi ? desc_hi : desc_en}
                    </p>
                  </div>
                </Bezel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Final CTA — clean minimal light layout ════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pb-28">
        <Reveal>
          <div className="rounded-[2.5rem] bg-zinc-200/40 p-2 ring-1 ring-black/[0.06] shadow-[0_24px_60px_-28px_rgba(24,24,27,0.08)]">
            <div className="relative overflow-hidden rounded-[calc(2.5rem-0.5rem)] bg-white/95 px-6 py-16 text-center sm:px-16 sm:py-24">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(600px 300px at 50% 0%, rgba(72,115,79,0.07), transparent 70%), radial-gradient(400px 240px at 85% 100%, rgba(196,154,42,0.05), transparent 70%)',
                }}
              />

              <div className="relative mx-auto max-w-2xl">
                {isHindi ? (
                  <h2 className="text-balance text-3xl font-bold leading-[1.25] tracking-[-0.01em] text-zinc-900 sm:text-5xl">
                    स्मार्टफोन चलाने की कोई मजबूरी नहीं।
                    <span className="block italic text-[#48734f]">बस अपनी भाषा में बोलें।</span>
                  </h2>
                ) : (
                  <h2 className="text-balance text-3xl font-semibold leading-[1.18] tracking-[-0.01em] text-zinc-900 sm:text-5xl">
                    No smartphone fluency required.
                    <span className="block italic text-[#48734f]">Just speak.</span>
                  </h2>
                )}

                <p className="mx-auto mt-6 max-w-md text-pretty text-[15px] leading-relaxed text-zinc-600">
                  {isHindi
                    ? 'लोकवाणी आपकी अपनी बोली में उत्तर देती है — हमेशा के लिए मुफ्त, भारत के हर किसान और विक्रेता के लिए।'
                    : 'LokVani answers in your own dialect — free, forever, for every farming household and micro-vendor in India.'}
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  {!isSignedIn && (
                    <button
                      onClick={() => setActiveTab('auth')}
                      className="group inline-flex items-center gap-3 rounded-full bg-zinc-900 py-2.5 pl-6 pr-2 text-sm font-semibold text-white transition-all duration-500 ease-premium hover:bg-zinc-800 active:scale-[0.98] cursor-pointer"
                    >
                      {isHindi ? 'मुफ्त खाता बनाएं' : 'Create free account'}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                        <ArrowRight size={14} strokeWidth={1.5} />
                      </span>
                    </button>
                  )}
                  <button
                    onClick={handleLaunch}
                    className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-700 transition-all duration-500 ease-premium hover:bg-zinc-100 hover:border-black/[0.12] active:scale-[0.98] cursor-pointer"
                  >
                    <Mic size={14} strokeWidth={1.5} />
                    {isHindi ? 'बिना अकाउंट के आजमाएं' : 'Try without account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
      </div>
    </div>
  );
}
