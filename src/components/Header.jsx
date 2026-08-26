import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Mic, FileText, Users, Globe, Home, LogOut, User as UserIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',         icon: Home     },
  { id: 'voice',   label: 'Voice AI',     icon: Mic      },
  { id: 'schemes', label: 'Schemes',      icon: FileText },
  { id: 'intel',   label: 'Market Intel', icon: Users    },
];

export default function Header() {
  const { activeTab, setActiveTab, language, setLanguage, pendingReviewsCount } = useApp();
  const { isSignedIn, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const go = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    setActiveTab('home');
  };

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      {/* ── Floating glass island (Expanded width & responsive rhythm) ─────────────────────────── */}
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-black/[0.06] bg-white/80 pl-4 pr-2.5 shadow-[0_20px_50px_-28px_rgba(24,24,27,0.25)] backdrop-blur-xl sm:pl-5">

        {/* Brand Logo */}
        <button
          onClick={() => go('home')}
          className="group flex shrink-0 cursor-pointer items-center gap-2.5"
          aria-label="LokVani home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform duration-500 ease-premium group-hover:scale-105">
            <Mic size={13} strokeWidth={1.5} />
          </span>
          <span className="hidden font-heading text-lg font-bold tracking-[-0.01em] text-zinc-900 sm:block">
            LokVani
            <span className="ml-1.5 align-middle font-body text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700">Bharat</span>
          </span>
        </button>

        {/* Desktop Navigation Items — Always visible */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className={cn(
                  'relative flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold tracking-tight',
                  'transition-all duration-500 ease-premium active:scale-[0.97]',
                  active
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-900'
                )}
              >
                <Icon size={14} strokeWidth={1.5} className="shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
                {id === 'schemes' && pendingReviewsCount > 0 && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white leading-none ring-2 ring-white">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions Block */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="hidden h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-black/[0.06] bg-white/60 px-3 text-xs font-semibold text-zinc-600 transition-all duration-500 ease-premium hover:border-black/[0.12] hover:bg-white hover:text-zinc-900 sm:flex"
            aria-label="Toggle language"
          >
            <Globe size={13} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
            <span>{language === 'en' ? 'EN' : 'हिं'}</span>
          </button>

          {/* User Profile Pill / Auth Button */}
          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(o => !o)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 py-1 pl-1 pr-3.5 shadow-sm transition-all duration-500 ease-premium hover:border-black/[0.18] hover:bg-white active:scale-[0.98]"
              >
                {user?.photoURL && !imgError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    onError={() => setImgError(true)}
                    className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-black/10"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-inner">
                    {userInitial}
                  </span>
                )}
                <span className="max-w-[100px] truncate text-xs font-bold tracking-tight text-zinc-800 sm:max-w-[130px]">
                  {user?.displayName || user?.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown size={12} className={cn('text-zinc-400 transition-transform duration-300', userDropdownOpen && 'rotate-180')} />
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-black/[0.08] bg-white/95 p-2 shadow-[0_24px_50px_-16px_rgba(24,24,27,0.25)] backdrop-blur-2xl transition-all duration-300">
                  <div className="border-b border-black/[0.06] px-3.5 py-3">
                    <p className="truncate font-heading text-xs font-bold text-zinc-900">
                      {user?.displayName || 'Logged-in User'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-zinc-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="pt-1.5">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut size={14} strokeWidth={1.5} className="shrink-0" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => go('auth')}
              className="h-9 cursor-pointer rounded-full bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm transition-all duration-500 ease-premium hover:bg-zinc-800 active:scale-[0.97]"
            >
              Sign in
            </button>
          )}

          {/* Hamburger — morphs to X for mobile viewports */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-500 hover:bg-black/[0.04] lg:hidden"
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
        </div>
      </div>

      {/* ── Full-screen mobile overlay ────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col justify-center bg-[#fbfbfa]/95 px-8 backdrop-blur-2xl lg:hidden',
          'transition-opacity duration-500 ease-premium',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Top-Right Explicit Close (X) Button */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.10] bg-white text-zinc-900 shadow-md transition-all duration-300 hover:bg-zinc-100 active:scale-95 cursor-pointer z-50"
        >
          <X size={20} strokeWidth={2} />
        </button>

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
                    'text-2xl font-semibold tracking-tight',
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

        <button
          onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
          tabIndex={mobileOpen ? 0 : -1}
          style={{ transitionDelay: mobileOpen ? '420ms' : '0ms' }}
          className={cn(
            'mt-14 flex w-max cursor-pointer items-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700',
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
