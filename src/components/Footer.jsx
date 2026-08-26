import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ArrowUpRight, Heart } from 'lucide-react';
import Reveal from './Reveal';

export default function Footer() {
  const { setActiveTab } = useApp();

  const productLinks = [
    { label: 'Voice AI', tab: 'voice' },
    { label: 'Gov Schemes', tab: 'schemes' },
    { label: 'Market Intel', tab: 'intel' },
    { label: 'Sign in', tab: 'auth' },
  ];

  return (
    <footer className="relative mt-auto border-t border-zinc-200/80 bg-[#121611] text-zinc-300">
      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start">
          {/* Brand */}
          <Reveal className="max-w-sm">
            <button
              onClick={() => setActiveTab('home')}
              className="group flex cursor-pointer items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#e8ede0] transition-all duration-300 ease-premium group-hover:bg-white/10 group-hover:scale-105">
                <Mic size={15} strokeWidth={1.5} />
              </span>
              <span className="font-heading text-2xl font-semibold tracking-tight text-white">
                LokVani AI
              </span>
            </button>
            <p className="mt-4 font-heading text-lg italic text-[#a3b86b]">
              Kisan ka apna saathi<span className="not-italic text-[#c49a2a]">.</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Inclusive voice intelligence — government schemes, mandi prices and crop
              advisory, spoken in every Indian dialect.
            </p>
          </Reveal>

          {/* Link columns */}
          <div className="flex gap-16 sm:gap-24">
            <Reveal delay={110}>
              <nav aria-label="Product">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Product
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {productLinks.map(({ label, tab }) => (
                    <li key={label}>
                      <button
                        onClick={() => setActiveTab(tab)}
                        className="cursor-pointer text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>

            <Reveal delay={200}>
              <nav aria-label="Project">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Project
                </h3>
                <ul className="mt-5 space-y-3.5">
                  <li>
                    <a
                      href="https://github.com/SairajTripathy-0077/OOSC-Hackathon.git"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
                    >
                      <span>GitHub</span>
                      <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                        className="text-zinc-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#a3b86b]"
                      />
                    </a>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-400">
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
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-400">
            <span>© {new Date().getFullYear()} LokVani AI. All rights reserved.</span>
            <span className="inline-flex items-center gap-1.5">
              Crafted with
              <Heart size={12} strokeWidth={1.5} className="text-[#c9825a] fill-[#c9825a]/20" />
              for Bharat's underserved communities
            </span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
