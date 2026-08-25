import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { Mic, Landmark, Users, ArrowRight, Sparkles, CheckCircle2, Volume2, VolumeX, Play, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const PILLARS = [
  {
    icon: Mic,
    color: 'from-indigo-500 to-indigo-700',
    shadow: 'shadow-indigo-500/25',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    title: 'Multilingual Voice Engine',
    desc: 'Supports spoken queries in Hindi, Bhojpuri, Marathi, Tamil and 9 more regional dialects with instant STT and AI TTS synthesis.'
  },
  {
    icon: Landmark,
    color: 'from-amber-500 to-amber-700',
    shadow: 'shadow-amber-500/25',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    title: 'Public Schemes Engine',
    desc: 'Instant eligibility matching for 25+ government schemes with required document checklists and CSC center guidance.'
  },
  {
    icon: Users,
    color: 'from-emerald-500 to-emerald-700',
    shadow: 'shadow-emerald-500/25',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    title: 'Community Intel Network',
    desc: 'Crowdsourced live Mandi commodity price tracking combined with real-time Agmarknet government API feeds.'
  },
];

const SAMPLE_QUERIES = [
  {
    title_hi: 'PM Kisan 17th kisht kab aayegi?',
    title_en: 'When is PM Kisan 17th installment coming?',
    ans_hi: 'PM-Kisan 17th kisht ke liye Aadhar e-KYC verified hona zaroori hai. Aapke nazdiki Gupta Kirana CSC node se Khasra document verify karayein.',
    ans_en: 'PM-Kisan 17th installment requires Aadhar e-KYC. Get land documents verified at your nearest Kirana CSC center.',
    domain: 'GOVT_SCHEME',
  },
  {
    title_hi: 'Azamgarh Mandi me aaj Gehun ka bhav kya hai?',
    title_en: "Today's wheat price in Azamgarh Mandi?",
    ans_hi: 'Aaj Azamgarh Mandi me Gehun ka dam ₹2,400 per quintal hai. Pichle hafte se ₹50 ki barhotari hui hai.',
    ans_en: 'Today in Azamgarh Mandi, wheat is ₹2,400/quintal — up ₹50 from last week.',
    domain: 'MARKET_PRICE',
  },
  {
    title_hi: 'Dhan me patti peeli pad rahi hai, kya karein?',
    title_en: 'Paddy leaves turning yellow — what to do?',
    ans_hi: 'Dhan me peelapan Zinc aur Nitrogen ki kami se hota hai. 5kg Zinc Sulphate per acre chhidkav karein.',
    ans_en: 'Yellowing in paddy is caused by Zinc & Nitrogen deficiency. Apply 5kg Zinc Sulphate per acre.',
    domain: 'AGRI_ADVISORY',
  },
];

const DOMAIN_COLORS = {
  GOVT_SCHEME:   'bg-indigo-100 text-indigo-700',
  MARKET_PRICE:  'bg-amber-100 text-amber-700',
  AGRI_ADVISORY: 'bg-emerald-100 text-emerald-700',
};

const STATS = [
  { value: '25+',  label: 'Government Schemes' },
  { value: '13',   label: 'Dialects Supported' },
  { value: '100%', label: 'Free for Farmers' },
  { value: '24/7', label: 'AI Availability' },
];

export default function LandingPage() {
  const { setActiveTab, language, isSpeaking, stopSpeaking } = useApp();
  const { isSignedIn } = useUser();
  const [activeDemo, setActiveDemo] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const isClerkAvailable = typeof window !== 'undefined' &&
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const handleLaunch = () => {
    if (isSpeaking) stopSpeaking();
    setActiveTab(isClerkAvailable && !isSignedIn ? 'auth' : 'voice');
  };

  const handleDemo = (q) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    setIsSimulating(true);
    setActiveDemo(null);
    setTimeout(() => {
      setActiveDemo(q);
      setIsSimulating(false);
      const text = language === 'hi' ? q.ans_hi : q.ans_en;
      const lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      speechService.speakText(text, lang);
    }, 1100);
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-bg">
        {/* Decorative blobs */}
        <div className="hero-blob w-96 h-96 bg-indigo-500/20 -top-24 -right-24" style={{ animationDelay: '0s' }} />
        <div className="hero-blob w-72 h-72 bg-purple-500/15 bottom-0 -left-20" style={{ animationDelay: '3s' }} />
        <div className="hero-blob w-64 h-64 bg-blue-400/10 top-1/2 left-1/2" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-300" />
            AI for Public Good — India 2024
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-5xl mx-auto mb-6">
            Voice AI for{' '}
            <span className="relative inline-block">
              <span className="text-amber-300">Bharat's</span>
            </span>
            {' '}Farmers &{' '}
            <span className="text-indigo-300">Micro-Vendors</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Speak in your dialect. Get instant Mandi rates, government scheme eligibility, and crop advisory — verified by your local Kirana Trust Node.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <SignedOut>
              <Button
                size="lg"
                onClick={() => { if (isSpeaking) stopSpeaking(); setActiveTab('auth'); }}
                className="gap-2 text-base px-7 bg-white text-indigo-700 hover:bg-white/90 shadow-xl shadow-black/20 font-bold"
              >
                Get Started Free <ArrowRight size={18} />
              </Button>
            </SignedOut>
            <SignedIn>
              <Button
                size="lg"
                onClick={() => { if (isSpeaking) stopSpeaking(); setActiveTab('voice'); }}
                className="gap-2 text-base px-7 bg-white text-indigo-700 hover:bg-white/90 shadow-xl shadow-black/20 font-bold"
              >
                Launch Dashboard <ArrowRight size={18} />
              </Button>
            </SignedIn>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLaunch}
              className="gap-2 text-base px-7 border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm font-semibold"
            >
              <Mic size={18} /> Try Voice App
            </Button>
          </div>

          {/* Stats row */}
          <div className="inline-flex flex-wrap justify-center gap-8 px-8 py-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
                <div className="text-xs text-white/60 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 mb-20">
        <Card className="shadow-2xl shadow-black/10 border-0 overflow-hidden">
          {/* Card header strip */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Interactive Live Demo</h3>
                <p className="text-indigo-200 text-xs">Click any query to simulate AI response</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={stopSpeaking}
                  className="h-7 text-xs font-bold gap-1 px-3 animate-pulse shadow-md"
                >
                  <VolumeX size={13} />
                  {language === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}
                </Button>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-indigo-200 text-xs font-medium">Live</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Query chips */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 mb-5">
              {SAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleDemo(q)}
                  disabled={isSimulating}
                  className="flex items-start gap-2.5 px-4 py-3 bg-muted/60 hover:bg-accent/60 border border-border rounded-xl text-sm font-medium text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50 group flex-1 min-w-[220px]"
                >
                  <Play size={14} className="text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-foreground">{language === 'hi' ? q.title_hi : q.title_en}</span>
                </button>
              ))}
            </div>

            {/* Output area */}
            {isSimulating && (
              <div className="p-5 rounded-xl border border-dashed border-amber-300 bg-amber-50 flex items-center gap-3">
                <Mic size={18} className="text-amber-600 animate-bounce shrink-0" />
                <p className="text-amber-800 text-sm font-medium animate-pulse">Processing voice query…</p>
                <div className="waveform ml-auto text-amber-500">
                  {[...Array(5)].map((_, i) => <div key={i} className="waveform-bar" />)}
                </div>
              </div>
            )}

            {activeDemo && !isSimulating && (
              <div className="p-5 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge className={DOMAIN_COLORS[activeDemo.domain]} variant="secondary">
                    {activeDemo.domain.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Auto-Verified
                  </span>
                </div>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {language === 'hi' ? activeDemo.ans_hi : activeDemo.ans_en}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <Volume2 size={13} className={cn(isSpeaking && 'animate-bounce')} />
                    <span>{isSpeaking ? 'Audio response playing...' : 'Audio complete'}</span>
                  </div>
                  {isSpeaking && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={stopSpeaking}
                      className="h-6 text-[11px] font-bold gap-1 px-2.5"
                    >
                      <VolumeX size={12} />
                      {language === 'hi' ? 'रोकें' : 'Stop'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 rounded-2xl bg-muted/50 border border-border/50">
          {[
            { icon: ShieldCheck, label: 'Kirana Trust Node Verified', color: 'text-emerald-600' },
            { icon: Sparkles,    label: 'Google Gemini AI Powered',   color: 'text-indigo-600'  },
            { icon: TrendingUp,  label: 'Live Agmarknet Price Feeds', color: 'text-amber-600'   },
            { icon: Users,       label: 'Community Crowdsourced',     color: 'text-blue-600'    },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Icon size={16} className={color} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Pillars ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-wider uppercase">Platform Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            Built for Real Impact
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Combining state-of-the-art AI language models with ground-level Kirana community verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map(({ icon: Icon, color, shadow, bgLight, textColor, title, desc }) => (
            <Card key={title} className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border/60">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${color} -z-10`} style={{ opacity: 0.03 }} />
              <CardContent className="p-7">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg ${shadow}`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-10 sm:p-16 text-center">
          {/* bg blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <Badge className="mb-5 bg-white/20 text-white border-0 text-xs font-bold tracking-wider uppercase">
              Start Today — 100% Free
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
              Ready to Transform How
              <br className="hidden sm:block" /> Rural India Accesses Information?
            </h2>
            <p className="text-indigo-200 text-base max-w-lg mx-auto mb-8">
              No smartphone needed. Just speak. LokVani AI answers in your own dialect.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <SignedOut>
                <Button size="lg" onClick={() => { if (isSpeaking) stopSpeaking(); setActiveTab('auth'); }} className="gap-2 text-base px-8 bg-white text-indigo-700 hover:bg-white/90 font-bold shadow-xl">
                  Sign Up Free <ArrowRight size={18} />
                </Button>
              </SignedOut>
              <Button size="lg" variant="outline" onClick={handleLaunch}
                className="gap-2 text-base px-8 border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Mic size={18} /> Try Without Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
