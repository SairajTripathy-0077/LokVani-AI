import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, FileText, Users, Globe, Home, LogIn } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',         icon: Home     },
  { id: 'voice',   label: 'Voice AI',     icon: Mic      },
  { id: 'schemes', label: 'Schemes',      icon: FileText },
  { id: 'intel',   label: 'Market Intel', icon: Users    },
];

export default function Header() {
  const { activeTab, setActiveTab, language, setLanguage, pendingReviewsCount } = useApp();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isClerkAvailable =
    typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const showNav = !isClerkAvailable || isSignedIn;

  const go = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-4 sm:px-4">
      {/* ── Floating glass island ─────────────────────────── */}
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-black/[0.06] bg-white/75 pl-5 pr-2 shadow-[0_20px_50px_-28px_rgba(24,24,27,0.3)] backdrop-blur-xl">

        {/* Brand */}
        <button
          onClick={() => go('home')}
          className="group flex shrink-0 cursor-pointer items-center gap-2.5"
          aria-label="LokVani home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform duration-500 ease-premium group-hover:scale-105">
            <Mic size={13} strokeWidth={1.5} />
          </span>
          <span className="hidden font-heading text-lg font-semibold tracking-[-0.01em] text-zinc-900 sm:block">
            LokVani
            <span className="ml-1.5 align-middle font-body text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700/80">Bharat</span>
          </span>
        </button>

        {/* Desktop nav */}
        {showNav && (
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium',
                    'transition-all duration-500 ease-premium active:scale-[0.97]',
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-900'
                  )}
                >
                  <Icon size={13} strokeWidth={1.5} />
                  <span>{label}</span>
                  {id === 'schemes' && pendingReviewsCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-semibold text-white leading-none ring-2 ring-white">
                      {pendingReviewsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium text-zinc-500 transition-all duration-500 ease-premium hover:bg-black/[0.04] hover:text-zinc-900 sm:flex"
            aria-label="Toggle language"
          >
            <Globe size={12} strokeWidth={1.5} />
            {language === 'hi' ? 'हिं' : 'EN'}
          </button>

          {/* Auth */}
          {isClerkAvailable ? (
            <>
              <SignedOut>
                <button
                  onClick={() => go('auth')}
                  className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-zinc-600 transition-all duration-500 ease-premium hover:bg-black/[0.04] hover:text-zinc-900 sm:flex"
                >
                  <LogIn size={12} strokeWidth={1.5} /> Sign in
                </button>
                <button
                  onClick={() => go('auth')}
                  className="flex h-9 cursor-pointer items-center rounded-full bg-zinc-900 px-4 text-xs font-medium text-white transition-all duration-500 ease-premium hover:bg-zinc-800 active:scale-[0.96]"
                >
                  Get started
                </button>
              </SignedOut>
              <SignedIn>
                <div className="rounded-full p-0.5 ring-1 ring-black/[0.08]">
                  <UserButton showName={false} />
                </div>
              </SignedIn>
            </>
          ) : (
            <button
              onClick={() => go('auth')}
              className="flex h-9 cursor-pointer items-center rounded-full bg-zinc-900 px-4 text-xs font-medium text-white transition-all duration-500 ease-premium hover:bg-zinc-800 active:scale-[0.96]"
            >
              Guest mode
            </button>
          )}

          {/* Hamburger — morphs to X */}
          {showNav && (
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-500 hover:bg-black/[0.04] md:hidden"
            >
              <span
                className={cn(
                  'absolute h-[1.5px] w-[16px] rounded-full bg-zinc-800',
                  'transition-all duration-500 ease-premium',
                  mobileOpen ? 'rotate-45' : '-translate-y-[3px]'
                )}
              />
              <span
                className={cn(
                  'absolute h-[1.5px] w-[16px] rounded-full bg-zinc-800',
                  'transition-all duration-500 ease-premium',
                  mobileOpen ? '-rotate-45' : 'translate-y-[3px]'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Full-screen mobile overlay ────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-40 flex flex-col justify-center bg-[#fbfbfa]/90 px-8 backdrop-blur-2xl md:hidden',
          'transition-opacity duration-500 ease-premium',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!mobileOpen}
      >
        {showNav && (
          <nav className="flex flex-col gap-7" aria-label="Mobile">
            {NAV_ITEMS.map(({ id, label, icon: Icon }, i) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  tabIndex={mobileOpen ? 0 : -1}
                  style={{ transitionDelay: mobileOpen ? `${120 + i * 70}ms` : '0ms' }}
                  className={cn(
                    'group flex w-max cursor-pointer items-center gap-4 text-left',
                    'transition-all duration-700 ease-premium',
                    mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500',
                      active
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-black/[0.08] bg-white text-zinc-500 group-hover:border-emerald-200 group-hover:text-emerald-800'
                    )}
                  >
                    <Icon size={17} strokeWidth={1.25} />
                  </span>
                  <span
                    className={cn(
                      'text-2xl font-medium tracking-tight',
                      active ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-900'
                    )}
                  >
                    {label}
                  </span>
                  {id === 'schemes' && pendingReviewsCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      {pendingReviewsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <button
          onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
          tabIndex={mobileOpen ? 0 : -1}
          style={{ transitionDelay: mobileOpen ? '420ms' : '0ms' }}
          className={cn(
            'mt-14 flex w-max cursor-pointer items-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 py-2.5 text-sm font-medium text-zinc-700',
            'transition-all duration-700 ease-premium',
            mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}
        >
          <Globe size={14} strokeWidth={1.5} />
          {language === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
        </button>
      </div>
    </header>
  );
}
