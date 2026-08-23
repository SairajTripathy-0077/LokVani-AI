import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Landmark, Users, ArrowRight, Sparkles, CheckCircle2, Volume2, Play } from 'lucide-react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';

export default function LandingPage() {
  const { setActiveTab, language } = useApp();
  const { isSignedIn } = useUser();
  const [demoQuery, setDemoQuery] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const handleLaunchDashboard = () => {
    if (isClerkAvailable && !isSignedIn) {
      setActiveTab('auth');
    } else {
      setActiveTab('voice');
    }
  };

  const sampleQueries = [
    {
      title_hi: 'PM Kisan 17th kisht kab aayegi?',
      title_en: 'When is PM Kisan 17th installment coming?',
      ans_hi: 'PM-Kisan 17th kisht ke liye Aadhar e-KYC verified hona zaroori hai. Aapke nazdiki Gupta Kirana CSC node se Khasra document verify karayein.',
      ans_en: 'PM-Kisan 17th installment requires Aadhar e-KYC verification. Get your land documents verified at your nearest Kirana CSC center.',
      domain: 'GOVT_SCHEME',
      trust: 'VERIFIED_BY_TRUST_NODE'
    },
    {
      title_hi: 'Azamgarh Mandi me aaj Gehun (Wheat) ka bhav kya hai?',
      title_en: 'What is today\'s wheat price in Azamgarh Mandi?',
      ans_hi: 'Aaj Azamgarh Mandi me Gehun (Wheat) ka dam ₹2,400 per quintal hai. Pichle hafte se ₹50 ki barhotari hui hai.',
      ans_en: 'Today in Azamgarh Mandi, wheat is priced at ₹2,400 per quintal, showing a ₹50 increase from last week.',
      domain: 'MANDI_PRICE',
      trust: 'AUTO_VERIFIED'
    },
    {
      title_hi: 'Dhan ki fasal me patti peeli pad rahi hai, kya karein?',
      title_en: 'Paddy leaves turning yellow, what treatment is needed?',
      ans_hi: 'Dhan me peelapan Zinc aur Nitrogen ki kami se hota hai. 5kg Zinc Sulphate per acre chhidkav karein aur paani ka santulan banaye rakhein.',
      ans_en: 'Yellowing in paddy is caused by Zinc & Nitrogen deficiency. Apply 5kg Zinc Sulphate per acre and maintain water levels.',
      domain: 'AGRI_ADVISORY',
      trust: 'VERIFIED_BY_TRUST_NODE'
    }
  ];

  const handleRunDemo = (queryObj) => {
    setDemoQuery(queryObj.title_hi);
    setIsSimulating(true);
    setDemoResult(null);

    setTimeout(() => {
      setDemoResult(queryObj);
      setIsSimulating(false);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = language === 'hi' ? queryObj.ans_hi : queryObj.ans_en;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-6xl mx-auto text-center relative">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 inline-flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>AI for Public Good Track</span>
        </p>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight sm:leading-none max-w-4xl mx-auto mb-6 tracking-tight">
          Inclusive Voice Intelligence for <span className="text-blue-600">Bharat</span> & Underserved Communities
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Speak naturally in your local dialect. LokVani AI connects rural citizens directly with verified Mandi prices, instant Public Government Scheme eligibility matching, and community market intelligence.
        </p>

        {/* Dual Hero CTA Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <SignedOut>
            <button
              onClick={() => setActiveTab('auth')}
              className="btn-primary !px-6 !py-3.5 !text-base"
            >
              <span>Get Started / Sign Up</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => setActiveTab('voice')}
              className="btn-primary !px-6 !py-3.5 !text-base"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </SignedIn>

          <button
            onClick={handleLaunchDashboard}
            className="btn-secondary !px-6 !py-3.5 !text-base"
          >
            <Mic className="w-5 h-5 text-blue-600" />
            <span>Launch Voice App</span>
          </button>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE VOICE DEMO SIMULATOR */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Interactive Live Voice Simulator</h3>
                <p className="text-xs text-slate-500">Test AI speech transcription & response synthesis in real-time</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Click any sample voice query below to simulate instant speech transcription & AI response synthesis:
          </p>

          {/* Sample Clickable Query Chips */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleRunDemo(q)}
                disabled={isSimulating}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs sm:text-sm font-medium transition-colors text-left disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>{language === 'hi' ? q.title_hi : q.title_en}</span>
              </button>
            ))}
          </div>

          {/* Simulation Output Area */}
          {isSimulating && (
            <div className="p-6 bg-amber-50/50 border border-dashed border-amber-400 rounded-xl text-center">
              <p className="text-amber-800 font-semibold text-sm animate-pulse flex items-center justify-center gap-2">
                <Mic className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>Synthesizing Voice Query: "{demoQuery}"...</span>
              </p>
            </div>
          )}

          {demoResult && !isSimulating && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Domain: {demoResult.domain}
                </span>
                <span className="text-xs font-bold text-sky-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto Verified
                </span>
              </div>
              <p className="text-base font-bold text-slate-900 mb-3">
                {language === 'hi' ? demoResult.ans_hi : demoResult.ans_en}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Audio Response Playing...</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. THREE CORE PLATFORM PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Built for Real Impact at Scale
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Combining state-of-the-art AI language models with ground-level community verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Multilingual Voice Engine</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Supports spoken queries in Hindi, Hinglish, Bhojpuri, and regional dialects with instant speech-to-text and AI text-to-speech audio synthesis.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Public Schemes Engine</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Input personal details (age, state, land holding, income) to get instant eligibility match scores and required document checklists for 25+ government schemes.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Community Intel Network</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Live crowdsourced Mandi commodity price tracking combined with real-time Agmarknet government API feeds for transparent crop trading.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM CALL TO ACTION */}
      <section className="px-4 sm:px-6 py-16 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4">
          Ready to Experience LokVani AI?
        </h2>
        <p className="text-slate-600 text-base mb-8">
          Sign up with your account or enter directly into the dashboard to test voice queries, check eligible schemes, or track local Mandi prices.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <SignedOut>
            <button
              onClick={() => setActiveTab('auth')}
              className="btn-primary !px-8 !py-3.5 !text-base"
            >
              <span>Sign Up / Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </SignedOut>

          <button
            onClick={handleLaunchDashboard}
            className="btn-secondary !px-7 !py-3.5 !text-base"
          >
            Enter Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
