import React, { useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Landmark, Users, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import Reveal from './Reveal';

/* ── Parallax (rAF-throttled, transform-only, reduced-motion safe) ── */
function Parallax({ speed = 0.1, className = '', innerClassName = '', children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const o = outer.current, i = inner.current;
      if (!o || !i) return;
      const r = o.getBoundingClientRect();
      const delta = r.top + r.height / 2 - window.innerHeight / 2;
      i.style.transform = `translate3d(0, ${(-delta * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed]);
  return (
    <div ref={outer} className={className}>
      <div ref={inner} className={`will-change-transform ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}

/* ── Eyebrow tag ───────────────────────────────────────────── */
function Eyebrow({ children, tone = 'bg-emerald-700' }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
      <span className={`h-1 w-1 rounded-full ${tone}`} />
      {children}
    </span>
  );
}

/* ── Double-bezel card shell ───────────────────────────────── */
function Bezel({ children, className = '', innerClassName = '' }) {
  return (
    <div
      className={`rounded-[1.75rem] bg-zinc-200/40 p-1.5 ring-1 ring-black/[0.06] shadow-[0_32px_80px_-40px_rgba(24,24,27,0.18)] ${className}`}
    >
      <div className={`h-full rounded-[calc(1.75rem-6px)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}

/* ── Pill button with nested trailing icon ─────────────────── */
function PillButton({ children, onClick, dark = true, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={[
        'group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-medium',
        'transition-all duration-500 ease-premium active:scale-[0.98] cursor-pointer',
        dark
          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
          : 'border border-black/[0.08] bg-white/70 text-zinc-900 hover:bg-white hover:border-black/[0.14]',
        className,
      ].join(' ')}
    >
      <span>{children}</span>
      <span
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          'transition-transform duration-500 ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-[1px]',
          dark ? 'bg-white/10' : 'bg-black/[0.05]',
        ].join(' ')}
      >
        <ArrowRight size={14} strokeWidth={1.5} />
      </span>
    </button>
  );
}

/* ── Decorative: ridge band — gradient-faded so it melts into the page ── */
let ridgeId = 0;
function RidgeBand({ layers, className = '' }) {
  const uid = useRef(`rg${ridgeId++}`);
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 240"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-auto w-full ${className}`}
    >
      <defs>
        {layers.map((l, i) => (
          <linearGradient key={i} id={`${uid.current}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={l.color} stopOpacity={l.opacity} />
            <stop offset="72%" stopColor={l.color} stopOpacity={l.opacity * 0.35} />
            <stop offset="100%" stopColor={l.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {layers.map((l, i) => (
        <path key={i} d={l.d} fill={`url(#${uid.current}-${i})`} />
      ))}
    </svg>
  );
}

const RIDGE_FAR = [
  { color: '#5a7d54', opacity: 0.11, d: 'M0,96 C190,52 380,118 570,98 C780,76 950,26 1160,52 C1280,66 1370,56 1440,44 L1440,241 L0,241 Z' },
];
const RIDGE_MID = [
  { color: '#c49a2a', opacity: 0.08, d: 'M0,120 C230,90 430,136 670,116 C910,96 1100,68 1440,94 L1440,241 L0,241 Z' },
  { color: '#3f5d3b', opacity: 0.09, d: 'M0,150 C260,126 520,162 790,152 C1050,142 1250,118 1440,138 L1440,241 L0,241 Z' },
];
const RIDGE_DUSK = [
  { color: '#3f5d3b', opacity: 0.10, d: 'M0,84 C220,50 440,96 660,80 C900,62 1120,32 1440,64 L1440,241 L0,241 Z' },
  { color: '#2e4630', opacity: 0.11, d: 'M0,124 C280,98 520,132 800,118 C1080,104 1260,86 1440,106 L1440,241 L0,241 Z' },
];

/* ── Decorative: wheat stalk line-art ──────────────────────── */
function WheatStalk({ className = '' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 140"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M24 138 C24 100 24 56 24 14" />
      {[38, 52, 66].map((y, i) => (
        <g key={i}>
          <path d={`M24 ${y} C15 ${y - 4} 11 ${y - 12} 12 ${y - 20} C20 ${y - 17} 24 ${y - 9} 24 ${y}`} />
          <path d={`M24 ${y} C33 ${y - 4} 37 ${y - 12} 36 ${y - 20} C28 ${y - 17} 24 ${y - 9} 24 ${y}`} />
        </g>
      ))}
      <path d="M24 16 C18 12 16 6 18 0" />
      <path d="M24 16 C30 12 32 6 30 0" />
      <path d="M24 34 C19 31 18 26 19 21" />
      <path d="M24 34 C29 31 30 26 29 21" />
    </svg>
  );
}

/* ── Decorative: contour rings ─────────────────────────────── */
function Contours({ className = '' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 900 480"
      fill="none"
      stroke="#5a7d54"
      strokeWidth="1"
      className={className}
    >
      {[...Array(7)].map((_, i) => (
        <ellipse
          key={i}
          cx="450"
          cy="240"
          rx={70 + i * 62}
          ry={36 + i * 33}
          opacity={0.07 - i * 0.006}
        />
      ))}
    </svg>
  );
}



/* ── Decorative: birds in flight ───────────────────────────── */
function Birds({ className = '' }) {
  return (
    <svg aria-hidden viewBox="0 0 160 60" fill="none" stroke="#48734f" strokeWidth="1.3" strokeLinecap="round" className={className}>
      <path d="M18 26 C23 19 28 19 32 25 C36 19 41 19 46 26" opacity="0.5" />
      <path d="M74 14 C79 8 83 8 87 13 C91 8 95 8 100 14" opacity="0.38" />
      <path d="M118 34 C122 29 126 29 129 33 C132 29 136 29 140 34" opacity="0.28" />
    </svg>
  );
}

/* ── Deterministic PRNG — same quiet scatter on every visit ── */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Farming motifs — single-colour line art ───────────────── */
function MotifSvg({ type }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' };
  switch (type) {
    case 'sprout':
      return (
        <svg viewBox="0 0 24 26" width="26" height="28" {...p}>
          <path d="M12 24 V12" />
          <path d="M12 12 C12 8 9 5 4 5 C4 10 8 12 12 12 Z" />
          <path d="M12 12 C12 8 15 5 20 5 C20 10 16 12 12 12 Z" />
        </svg>
      );
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
          <path d="M4 20 C4 10 10 4 20 4 C20 14 14 20 4 20 Z" />
          <path d="M6 18 C10 13 14 9 18 6" />
        </svg>
      );
    case 'furrow':
      return (
        <svg viewBox="0 0 48 32" width="44" height="30" {...p}>
          <path d="M2 29 C14 21 34 21 46 29" />
          <path d="M6 22 C16 15 32 15 42 22" />
          <path d="M13 15 C20 11 28 11 35 15" />
        </svg>
      );
    case 'seeds':
      return (
        <svg viewBox="0 0 32 24" width="30" height="22" {...p}>
          <ellipse cx="8" cy="9" rx="3" ry="1.8" transform="rotate(-25 8 9)" />
          <ellipse cx="21" cy="6" rx="3" ry="1.8" transform="rotate(18 21 6)" />
          <ellipse cx="14" cy="17" rx="3" ry="1.8" transform="rotate(-42 14 17)" />
          <ellipse cx="27" cy="16" rx="3" ry="1.8" transform="rotate(30 27 16)" />
        </svg>
      );
    case 'wheat':
      return (
        <svg viewBox="0 0 20 34" width="20" height="34" {...p}>
          <path d="M10 33 V14" />
          <path d="M10 20 C6 18 4.5 15 5 12 C8.5 13.5 10 16 10 20 Z" />
          <path d="M10 20 C14 18 15.5 15 15 12 C11.5 13.5 10 16 10 20 Z" />
          <path d="M10 13 C6.5 11 5.5 8.5 6 6 C9 7.5 10 9.5 10 13 Z" />
          <path d="M10 13 C13.5 11 14.5 8.5 14 6 C11 7.5 10 9.5 10 13 Z" />
          <path d="M10 7 C8 5.5 7.5 3.5 8 1.5" />
          <path d="M10 7 C12 5.5 12.5 3.5 12 1.5" />
        </svg>
      );
    case 'bubble':
      return (
        <svg viewBox="0 0 28 24" width="26" height="22" {...p}>
          <path d="M3 4 H21 A3 3 0 0 1 24 7 V13 A3 3 0 0 1 21 16 H11 L6 21 V16 H3 A1 1 0 0 1 2 15 V7 A3 3 0 0 1 3 4 Z" transform="translate(1,0)" />
          <circle cx="9" cy="10" r="0.8" fill="currentColor" strokeWidth="0" />
          <circle cx="13.5" cy="10" r="0.8" fill="currentColor" strokeWidth="0" />
          <circle cx="18" cy="10" r="0.8" fill="currentColor" strokeWidth="0" />
        </svg>
      );
    case 'mic':
      return (
        <svg viewBox="0 0 20 30" width="17" height="26" {...p}>
          <rect x="6.5" y="2" width="7" height="13" rx="3.5" />
          <path d="M3 12 C3 17 6 20 10 20 C14 20 17 17 17 12" />
          <path d="M10 20 V25 M6 27 H14" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M9 7.5 H14 M9 10.5 H14 M13.5 7.5 C11.5 8 10.5 9 10.5 10.5 C10.5 12.5 12 13.5 14 13.5 L9 17.5" />
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
    title: 'Multilingual Voice Engine',
    desc: 'Spoken queries in Hindi, Bhojpuri, Marathi, Tamil and nine more regional dialects — with instant transcription and natural speech synthesis in reply.',
    span: 'md:col-span-7',
    accent: 'group-hover:border-[#c8dcc4] group-hover:text-[#48734f] group-hover:bg-[#f4f8f2]',
  },
  {
    icon: Landmark,
    title: 'Public Schemes Engine',
    desc: 'Instant eligibility matching across 25+ government schemes, with document checklists and nearby CSC guidance.',
    span: 'md:col-span-5',
    accent: 'group-hover:border-[#ecdcb6] group-hover:text-[#a07a1e] group-hover:bg-[#faf6ec]',
  },
  {
    icon: Users,
    title: 'Community Intel Network',
    desc: 'Crowdsourced mandi price tracking from local Kirana trust nodes, cross-checked against live Agmarknet government feeds — so no farmer trades on stale numbers.',
    span: 'md:col-span-12',
    accent: 'group-hover:border-[#d3d7f7] group-hover:text-indigo-600 group-hover:bg-[#f5f5fd]',
  },
];

export default function LandingPage() {
  const { setActiveTab } = useApp();
  const { isSignedIn } = useUser();
  const isClerkAvailable =
    typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const handleLaunch = () => setActiveTab(isClerkAvailable && !isSignedIn ? 'auth' : 'voice');

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
    <div className="relative overflow-x-clip">

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
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-28 text-center sm:px-6 sm:pt-36 lg:pt-44">
          <Reveal delay={90}>
            <h1 className="mx-auto max-w-3xl text-balance text-[2.75rem] font-semibold leading-[1.06] tracking-[-0.01em] text-zinc-900 sm:text-6xl lg:text-[4.5rem]">
              Answers for rural India,{' '}
              <span className="italic text-[#48734f]">in its own voice.</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-zinc-500 sm:text-lg">
              LokVani listens in thirteen Indian dialects and returns verified mandi prices,
              scheme eligibility and crop advisory — instantly, and free.
            </p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <SignedOut>
                <PillButton onClick={() => setActiveTab('auth')}>Get started free</PillButton>
              </SignedOut>
              <SignedIn>
                <PillButton onClick={() => setActiveTab('voice')}>Launch dashboard</PillButton>
              </SignedIn>
              <PillButton onClick={handleLaunch} dark={false}>
                <span className="inline-flex items-center gap-2">
                  <Mic size={14} strokeWidth={1.5} /> Try the voice app
                </span>
              </PillButton>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <p className="mt-16 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
              Free for farmers · Always available · Built with the community
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ First ridges — far & near, dissolving both ways ═══ */}
      <div aria-hidden className="relative -my-10">
        <Parallax speed={0.04}>
          <RidgeBand layers={RIDGE_FAR} />
        </Parallax>
        <div className="-mt-24">
          <Parallax speed={0.09}>
            <RidgeBand layers={RIDGE_MID} />
          </Parallax>
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
              ['Kirana Trust Node verified', 'bg-emerald-600'],
              ['Google Gemini powered',      'bg-indigo-500'],
              ['Live Agmarknet feeds',       'bg-[#c49a2a]'],
              ['Community crowdsourced',     'bg-sky-500'],
            ].map(([label, dot]) => (
              <span key={label} className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-500">
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
              <Eyebrow tone="bg-[#c49a2a]">The platform</Eyebrow>
              <h2 className="mt-7 text-balance text-3xl font-semibold tracking-[-0.01em] text-zinc-900 sm:text-[2.6rem] sm:leading-[1.15]">
                Built for real impact, not demos.
              </h2>
              <p className="mt-5 text-pretty text-[15px] leading-relaxed text-zinc-500">
                State-of-the-art language models grounded by ground-level community verification.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
            {PILLARS.map(({ icon: Icon, title, desc, span, accent }, i) => (
              <Reveal key={title} delay={i * 110} className={`${span} w-full`}>
                <Bezel className="group h-full transition-transform duration-700 ease-premium hover:-translate-y-1">
                  <div className="flex h-full flex-col rounded-[calc(1.75rem-6px)] p-8 sm:p-10">
                    <span className={`flex h-11 w-11 items-center justify-center self-start rounded-full border border-black/[0.07] bg-zinc-50 text-zinc-700 transition-all duration-700 ease-premium ${accent}`}>
                      <Icon size={18} strokeWidth={1.25} />
                    </span>
                    <h3 className="mt-7 text-xl font-semibold text-zinc-900">{title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">{desc}</p>
                  </div>
                </Bezel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Dusk ridges — the land folds toward evening ═══════ */}
      <div aria-hidden className="relative -my-12">
        <Parallax speed={0.05}>
          <RidgeBand layers={RIDGE_DUSK} />
        </Parallax>
      </div>

      {/* ══ Final CTA — dusk in the valley ════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-20 text-center sm:px-16 sm:py-28">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(520px 300px at 50% 0%, rgba(90,125,84,0.30), transparent 70%), radial-gradient(340px 220px at 84% 100%, rgba(196,154,42,0.16), transparent 70%), radial-gradient(280px 200px at 8% 90%, rgba(99,102,241,0.14), transparent 70%)',
              }}
            />
            {/* stars coming out */}
            {[
              ['14%', '18%'], ['78%', '12%'], ['88%', '34%'], ['8%', '44%'], ['62%', '8%'],
            ].map(([left, top], i) => (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-white/60"
                style={{
                  left, top,
                  boxShadow: '0 0 8px 1px rgba(255,255,255,0.35)',
                  animation: `floatBlob ${6 + i}s ease-in-out ${i * 0.6}s infinite`,
                }}
              />
            ))}

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-semibold leading-[1.18] tracking-[-0.01em] text-white sm:text-5xl">
                No smartphone fluency required.
                <span className="block italic text-[#a3b86b]">Just speak.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-pretty text-[15px] leading-relaxed text-zinc-400">
                LokVani answers in your own dialect — free, forever, for every farming
                household and micro-vendor in India.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <SignedOut>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-medium text-zinc-900 transition-all duration-500 ease-premium hover:bg-zinc-100 active:scale-[0.98] cursor-pointer"
                  >
                    Create free account
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/[0.06] transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </span>
                  </button>
                </SignedOut>
                <button
                  onClick={handleLaunch}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-all duration-500 ease-premium hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
                >
                  <Mic size={14} strokeWidth={1.5} /> Try without account
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ Valley floor — grass line into the footer ════════ */}
      <div aria-hidden className="relative -mb-px pb-2">
        <Grass className="block h-16 w-full" />
      </div>

      <Reveal delay={100} className="relative pb-16">
        <p className="text-center font-heading text-xl italic text-zinc-400">
          Kisan ka apna saathi<span className="not-italic text-[#c49a2a]">.</span>
        </p>
      </Reveal>
      </div>
    </div>
  );
}

