import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SignIn, SignUp, SignedIn, UserButton } from '@clerk/clerk-react';
import { Landmark, CheckCircle2, Mic, ArrowLeft, Users, Lock } from 'lucide-react';

export default function AuthPage() {
  const { setActiveTab } = useApp();
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'

  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50">
        
        {/* Left Side: Brand & Benefits Summary */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <button
              onClick={() => setActiveTab('home')}
              className="btn-secondary !py-1.5 !px-3 !text-xs mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Homepage
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Mic className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">LokVani AI Account</h2>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Join the community-driven voice intelligence network for rural India and public government schemes matching.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Verified Community Status</h4>
                  <p className="text-xs text-slate-500">Submit local Mandi prices & voice queries with priority verification.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Landmark className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Public Scheme Eligibility Dashboard</h4>
                  <p className="text-xs text-slate-500">Discover all eligible government schemes (PM-Kisan, Ayushman Bharat, PM Awas) tailored to your personal details.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Personalized Query History</h4>
                  <p className="text-xs text-slate-500">Access past advisory voice responses & Mandi alert history anywhere.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('schemes')}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium inline-flex items-center gap-1"
            >
              <span>Skip for now and continue as Guest</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Right Side: Clerk Authentication Card */}
        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
          {isClerkAvailable ? (
            <div className="w-full">
              {/* Toggle Mode Switcher */}
              <div className="flex bg-slate-200/80 p-1 rounded-xl w-full mb-6">
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
                <button
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Clerk Render */}
              <SignedIn>
                <div className="text-center space-y-4 py-4">
                  <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You are signed in!</span>
                  </p>
                  <div className="flex justify-center">
                    <UserButton showName={true} />
                  </div>
                  <button
                    onClick={() => setActiveTab('schemes')}
                    className="btn-primary w-full justify-center !py-2.5 mt-4"
                  >
                    Go to Schemes Dashboard
                  </button>
                </div>
              </SignedIn>

              {authMode === 'signup' ? (
                <SignUp routing="hash" signInUrl="#/signin" redirectUrl="/" />
              ) : (
                <SignIn routing="hash" signUpUrl="#/signup" redirectUrl="/" />
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 py-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Guest Mode Enabled</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Clerk publishable key has not been initialized in `.env`. You can explore all application features in Guest Mode.
              </p>
              <button
                onClick={() => setActiveTab('schemes')}
                className="btn-primary w-full justify-center !py-2.5"
              >
                Launch Guest Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
