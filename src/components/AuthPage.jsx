import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SignIn, SignUp, SignedIn, UserButton } from '@clerk/clerk-react';
import {
  Landmark, CheckCircle2, Mic, ArrowLeft, Users, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BENEFITS = [
  {
    icon: CheckCircle2,
    title: 'Verified community status',
    desc: 'Submit local mandi prices and voice queries with priority verification.',
  },
  {
    icon: Landmark,
    title: 'Scheme eligibility dashboard',
    desc: 'Every government scheme you qualify for — PM-Kisan, Ayushman Bharat, PM Awas.',
  },
  {
    icon: Users,
    title: 'Personal query history',
    desc: 'Past advisory responses and mandi alerts, available anywhere.',
  },
];

const clerkAppearance = {
  variables: {
    colorPrimary: '#18181b',
    colorBackground: '#ffffff',
    borderRadius: '0.75rem',
    fontFamily: "'Instrument Sans', ui-sans-serif, sans-serif",
  },
  elements: {
    card: 'shadow-none border border-black/[0.06]',
    socialButtonsBlockButton: 'border-black/[0.08] text-[13px]',
    formButtonPrimary: 'bg-zinc-900',
  },
};

export default function AuthPage() {
  const { setActiveTab } = useApp();
  const [authMode, setAuthMode] = useState('signup');

  const isClerkAvailable =
    typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full max-w-4xl rounded-[2rem] bg-zinc-200/50 p-1.5 ring-1 ring-black/[0.06] shadow-[0_40px_100px_-48px_rgba(24,24,27,0.25)]">
        <div className="grid grid-cols-1 overflow-hidden rounded-[calc(2rem-6px)] bg-white lg:grid-cols-2">

          {/* ── Left: brand & benefits ─────────────────────── */}
          <div className="flex flex-col p-8 sm:p-12">
            <button
              onClick={() => setActiveTab('home')}
              className="group inline-flex w-max cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors duration-500 ease-premium hover:text-zinc-700"
            >
              <ArrowLeft size={13} strokeWidth={1.5} className="transition-transform duration-500 ease-premium group-hover:-translate-x-0.5" />
              Back to home
            </button>

            <span className="mt-10 flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.07] bg-zinc-50 text-zinc-800">
              <Mic size={16} strokeWidth={1.25} />
            </span>

            <h1 className="mt-7 text-3xl font-semibold tracking-[-0.02em] text-zinc-900">
              Join LokVani<span className="text-zinc-400">.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              The community-driven voice intelligence network for rural India.
            </p>

            <div className="mt-10 space-y-7">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <Icon size={17} strokeWidth={1.25} className="mt-0.5 shrink-0 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <button
                onClick={() => setActiveTab('schemes')}
                className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 underline decoration-black/[0.15] underline-offset-4 transition-colors duration-500 ease-premium hover:text-zinc-700"
              >
                Continue as guest
                <ArrowLeft size={12} strokeWidth={1.5} className="rotate-180 transition-transform duration-500 ease-premium group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* ── Right: auth panel ──────────────────────────── */}
          <div className="flex flex-col justify-center border-t border-black/[0.05] bg-zinc-50/60 p-8 sm:p-12 lg:border-l lg:border-t-0">
            {isClerkAvailable ? (
              <>
                {/* Segmented toggle */}
                <div className="mb-8 flex rounded-full border border-black/[0.06] bg-white p-1">
                  {[
                    ['signup', 'Create account'],
                    ['signin', 'Sign in'],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setAuthMode(mode)}
                      className={cn(
                        'flex-1 cursor-pointer rounded-full py-2 text-xs font-medium transition-all duration-500 ease-premium active:scale-[0.98]',
                        authMode === mode
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <SignedIn>
                  <div className="py-6 text-center">
                    <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 size={14} strokeWidth={1.5} />
                      You're signed in
                    </p>
                    <div className="mt-5 flex justify-center">
                      <UserButton showName />
                    </div>
                    <button
                      onClick={() => setActiveTab('schemes')}
                      className="group mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-zinc-900 py-2 pl-6 pr-2 text-sm font-medium text-white transition-all duration-500 ease-premium hover:bg-zinc-800 active:scale-[0.98]"
                    >
                      Go to dashboard
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                        <ArrowLeft size={14} strokeWidth={1.5} className="rotate-180" />
                      </span>
                    </button>
                  </div>
                </SignedIn>

                {authMode === 'signup' ? (
                  <SignUp routing="hash" signInUrl="#/signin" redirectUrl="/" appearance={clerkAppearance} />
                ) : (
                  <SignIn routing="hash" signUpUrl="#/signup" redirectUrl="/" appearance={clerkAppearance} />
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.07] bg-white text-zinc-600">
                  <Lock size={16} strokeWidth={1.25} />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-zinc-900">Guest mode enabled</h3>
                <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                  Authentication isn't configured yet — explore every feature as a guest.
                </p>
                <button
                  onClick={() => setActiveTab('schemes')}
                  className="group mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-zinc-900 py-2 pl-6 pr-2 text-sm font-medium text-white transition-all duration-500 ease-premium hover:bg-zinc-800 active:scale-[0.98]"
                >
                  Launch guest dashboard
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                    <ArrowLeft size={14} strokeWidth={1.5} className="rotate-180" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
