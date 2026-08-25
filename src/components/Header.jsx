import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, FileText, Users, Globe, LogIn, UserPlus, Home, Menu, X, Zap, VolumeX } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function Header() {
  const { activeTab, setActiveTab, language, changeLanguage, pendingReviewsCount, isSpeaking, stopSpeaking } = useApp();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isClerkAvailable = typeof window !== 'undefined' &&
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const showNav = !isClerkAvailable || isSignedIn;

  const NAV_ITEMS = [
    { id: 'home',    label: language === 'hi' ? 'होम' : 'Home',           icon: Home    },
    { id: 'voice',   label: language === 'hi' ? 'आवाज़ AI' : 'Voice AI',    icon: Mic     },
    { id: 'schemes', label: language === 'hi' ? 'सरकारी योजनाएं' : 'Gov Schemes', icon: FileText },
    { id: 'intel',   label: language === 'hi' ? 'मंडी भाव' : 'Market Intel', icon: Users   },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Brand ─────────────────────────────────────── */}
          <button
            onClick={() => { setActiveTab('home'); setMobileOpen(false); }}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700" />
              <Mic className="relative w-4.5 h-4.5 z-10" size={18} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-foreground leading-none">
                  LokVani
                </span>
                <span className="text-base font-black tracking-tight text-primary leading-none">
                  AI
                </span>
                <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0 h-4 tracking-wide uppercase hidden sm:flex">
                  Bharat
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                {language === 'hi' ? 'समावेशी आवाज बुद्धिमत्ता' : 'Inclusive Voice Intelligence'}
              </p>
            </div>
          </button>

          {/* ── Desktop Nav ───────────────────────────────── */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-0.5 p-1 rounded-xl bg-muted/60 border border-border/40">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                    )}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                    {id === 'schemes' && pendingReviewsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        {pendingReviewsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* ── Right Actions ─────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* STOP VOICE OUTPUT BUTTON (Visible when AI is speaking) */}
            {isSpeaking && (
              <Button
                size="sm"
                variant="destructive"
                onClick={stopSpeaking}
                className="h-8 px-3 text-xs font-bold gap-1.5 animate-pulse shadow-md shadow-red-500/20"
                title="Stop AI voice output"
              >
                <VolumeX size={14} />
                <span className="hidden sm:inline">
                  {language === 'hi' ? 'आवाज़ रोकें' : 'Stop AI Voice'}
                </span>
                <span className="sm:hidden">Stop</span>
              </Button>
            )}

            {/* ── Language Switcher Segmented Control ──────────────── */}
            <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border text-xs font-bold shadow-inner">
              <button
                type="button"
                onClick={() => changeLanguage('hi')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer',
                  language === 'hi'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Switch to Hindi"
              >
                <span>🇮🇳</span>
                <span>हिंदी</span>
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer',
                  language === 'en'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Switch to English"
              >
                <span>🌐</span>
                <span>English</span>
              </button>
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Auth */}
            {isClerkAvailable ? (
              <>
                <SignedOut>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('auth')} className="h-8 text-xs">
                      <LogIn size={13} /> {language === 'hi' ? 'साइन इन' : 'Sign In'}
                    </Button>
                    <Button size="sm" onClick={() => setActiveTab('auth')} className="h-8 text-xs gap-1.5">
                      <UserPlus size={13} /> {language === 'hi' ? 'साइन अप' : 'Sign Up'}
                    </Button>
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-2">
                    <div className="p-0.5 rounded-full ring-2 ring-primary/20">
                      <UserButton showName={false} />
                    </div>
                  </div>
                </SignedIn>
              </>
            ) : (
              <Button size="sm" onClick={() => setActiveTab('auth')} className="h-8 text-xs gap-1.5">
                <Zap size={13} /> {language === 'hi' ? 'गेस्ट मोड' : 'Guest Mode'}
              </Button>
            )}

            {/* Mobile hamburger */}
            {showNav && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setMobileOpen(o => !o)}
              >
                {mobileOpen ? <X size={17} /> : <Menu size={17} />}
              </Button>
            )}
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────── */}
        {mobileOpen && showNav && (
          <div className="md:hidden border-t border-border/40 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon size={15} />
                  {label}
                  {id === 'schemes' && pendingReviewsCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-[9px] h-4 px-1.5">
                      {pendingReviewsCount}
                    </Badge>
                  )}
                </button>
              );
            })}
            <Separator className="my-1" />
            <div className="flex items-center justify-between gap-2 px-2 py-1">
              <span className="text-xs text-muted-foreground font-semibold">
                {language === 'hi' ? 'भाषा (Language):' : 'Language:'}
              </span>
              <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border text-xs font-bold">
                <button
                  onClick={() => changeLanguage('hi')}
                  className={cn('px-2 py-1 rounded-md', language === 'hi' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                >
                  🇮🇳 हिंदी
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={cn('px-2 py-1 rounded-md', language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                >
                  🌐 English
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
