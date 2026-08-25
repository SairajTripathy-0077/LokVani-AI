import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ArrowUpRight, Heart } from 'lucide-react';
import Reveal from './Reveal';

/* ── Night footer — the valley settles under the stars ─────── */
export default function Footer() {
  const { setActiveTab } = useApp();

  const productLinks = [
    { label: 'Voice AI', tab: 'voice' },
    { label: 'Gov Schemes', tab: 'schemes' },
    { label: 'Market Intel', tab: 'intel' },
    { label: 'Sign in', tab: 'auth' },
  ];

  const stars = [
    ['6%', '52%'], ['14%', '60%'], ['22%', '50%'], ['31%', '58%'], ['40%', '49%'],
    ['49%', '61%'], ['57%', '51%'], ['66%', '63%'], ['74%', '48%'], ['83%', '59%'],
    ['91%', '53%'], ['96%', '64%'], ['11%', '70%'], ['45%', '72%'], ['88%', '73%'],
  ];

  const fireflies = [
    ['12%', '58%', '#d6a83a'], ['30%', '70%', '#a3b86b'], ['55%', '62%', '#d6a83a'],
    ['78%', '72%', '#a3b86b'], ['90%', '56%', '#d6a83a'],
  ];

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* ── Seamless day → night merge ─────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,27,17,0) 0%, rgba(20,27,17,0.04) 7%, rgba(20,27,17,0.22) 18%, rgba(20,27,17,0.72) 32%, #141b11 46%, #10160d 100%)',
        }}
      />

      {/* ridge silhouette fading up into the dusk */}
      <svg
        aria-hidden
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 w-full"
      >
        <defs>
          <linearGradient id="ftr-ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e4630" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2e4630" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,120 C220,80 440,132 660,112 C900,92 1120,56 1440,92 L1440,201 L0,201 Z" fill="url(#ftr-ridge)" />
      </svg>

      {/* moon glow */}
      <div
        aria-hidden
        className="absolute right-[12%] top-[16%] h-44 w-44 rounded-full opacity-70 blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(226,232,214,0.20), transparent 65%)' }}
      />
      <div aria-hidden className="absolute right-[15.5%] top-[21%] h-3.5 w-3.5 rounded-full bg-[#eef2e4]/80 shadow-[0_0_24px_6px_rgba(238,242,228,0.25)]" />

      {/* stars */}
      {stars.map(([left, top], i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-[2px] w-[2px] rounded-full bg-white"
          style={{
            left, top,
            boxShadow: '0 0 6px 1px rgba(255,255,255,0.3)',
            animation: `twinkle ${3 + (i % 5)}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* fireflies over the dark fields */}
      {fireflies.map(([left, top, color], i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-1 w-1 rounded-full"
          style={{
            left, top, background: color,
            boxShadow: `0 0 14px 3px ${color}55`,
            animation: `floatBlob ${7 + i * 1.4}s ease-in-out ${i * 0.7}s infinite`,
          }}
        />
      ))}

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-44 sm:px-6 sm:pt-52">
        <div className="flex flex-col justify-between gap-14 md:flex-row md:items-start">
          {/* Brand */}
          <Reveal className="max-w-sm">
            <button
              onClick={() => setActiveTab('home')}
              className="group flex cursor-pointer items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] text-[#e8ede0] transition-all duration-500 ease-premium group-hover:bg-white/[0.12] group-hover:scale-105">
                <Mic size={14} strokeWidth={1.25} />
              </span>
              <span className="font-heading text-2xl font-semibold tracking-[-0.01em] text-[#f2f4ec]">
                LokVani AI
              </span>
            </button>
            <p className="mt-5 font-heading text-xl italic leading-relaxed text-[#a3b86b]/90">
              Kisan ka apna saathi<span className="not-italic text-[#c49a2a]">.</span>
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-zinc-400/80">
              Inclusive voice intelligence — government schemes, mandi prices and crop
              advisory, spoken in every Indian dialect.
            </p>
          </Reveal>

          {/* Link columns */}
          <div className="flex gap-16 sm:gap-24">
            <Reveal delay={110}>
              <nav aria-label="Product">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Product
                </h3>
                <ul className="mt-6 space-y-4">
                  {productLinks.map(({ label, tab }) => (
                    <li key={label}>
                      <button
                        onClick={() => setActiveTab(tab)}
                        className="group cursor-pointer text-[13px] font-medium text-zinc-400 transition-colors duration-500 ease-premium hover:text-[#f2f4ec]"
                      >
                        <span className="bg-gradient-to-r from-[#a3b86b] to-[#a3b86b] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-premium group-hover:bg-[length:100%_1px]">
                          {label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>

            <Reveal delay={200}>
              <nav aria-label="Project">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Project
                </h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <a
                      href="https://github.com/SairajTripathy-0077/OOSC-Hackathon.git"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors duration-500 ease-premium hover:text-[#f2f4ec]"
                    >
                      <span className="bg-gradient-to-r from-[#a3b86b] to-[#a3b86b] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-premium group-hover:bg-[length:100%_1px]">
                        GitHub
                      </span>
                      <ArrowUpRight
                        size={12}
                        strokeWidth={1.5}
                        className="text-zinc-600 transition-all duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#a3b86b]"
                      />
                    </a>
                  </li>
                  <li>
                    <span className="text-[13px] font-medium text-zinc-500">
                      AI for Public Good Track
                    </span>
                  </li>
                </ul>
              </nav>
            </Reveal>
          </div>
        </div>

        {/* Bottom bar */}
        <Reveal delay={260}>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-7 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} LokVani AI. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5">
              Crafted with
              <Heart size={11} strokeWidth={1.5} className="animate-pulse text-[#c9825a]" fill="currentColor" />
              for Bharat's underserved communities
            </span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
