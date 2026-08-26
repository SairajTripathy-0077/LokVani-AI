import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Landmark, CheckCircle2, Mic, ArrowLeft, Users, Lock, LogIn, UserPlus, AlertCircle, LogOut
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

export default function AuthPage() {
  const { setActiveTab } = useApp();
  const { isSignedIn, user, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useAuth();
  
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (res.success) {
      setActiveTab('schemes');
    } else {
      setErrorMessage(res.error || 'Failed to sign in with Google');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    let res;
    if (authMode === 'signup') {
      res = await signUpWithEmail(email, password, name);
    } else {
      res = await signInWithEmail(email, password);
    }
    setIsSubmitting(false);

    if (res.success) {
      setActiveTab('schemes');
    } else {
      setErrorMessage(res.error ? res.error.replace('Firebase: ', '') : 'Authentication failed.');
    }
  };

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
            {isSignedIn ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Signed In Successfully</h3>
                <p className="mt-1 text-xs text-zinc-500">{user?.email}</p>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => setActiveTab('schemes')}
                    className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800"
                  >
                    Go to Schemes Dashboard
                    <ArrowLeft size={14} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => logout()}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Segmented toggle */}
                <div className="mb-6 flex rounded-full border border-black/[0.06] bg-white p-1">
                  {[
                    ['signup', 'Create account'],
                    ['signin', 'Sign in'],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => { setAuthMode(mode); setErrorMessage(''); }}
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

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="mb-5 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-black/[0.08] bg-white py-2.5 text-xs font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative mb-5 flex items-center justify-center">
                  <div className="w-full border-t border-black/[0.06]" />
                  <span className="absolute bg-zinc-50 px-3 text-[10px] uppercase tracking-wider text-zinc-400">or email</span>
                </div>

                {errorMessage && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Full Name</label>
                      <input
                        type="text"
                        placeholder="Ramesh Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="farmer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {authMode === 'signup' ? <UserPlus size={14} /> : <LogIn size={14} />}
                    <span>{isSubmitting ? 'Processing...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
