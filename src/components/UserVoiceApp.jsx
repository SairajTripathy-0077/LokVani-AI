import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { processUserSpeechQuery } from '../services/aiCoreEngine';
import {
  Mic, MicOff, Volume2, VolumeX, ShieldAlert, Sparkles, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, Wheat, Bug, TrendingUp, Send, X,
  ChevronDown, ChevronUp, MessageSquare, Gauge, Type, Clock, MapPin,
  ThumbsUp, ThumbsDown, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ─── Dialect Map ────────────────────────────────────────────────────────────
const DIALECT_MAP = {
  hi:  { label: 'हिंदी',       locale: 'hi-IN',  promptName: 'Hindi' },
  en:  { label: 'English',     locale: 'en-IN',  promptName: 'English' },
  bho: { label: 'भोजपुरी',    locale: 'hi-IN',  promptName: 'Bhojpuri dialect of Hindi' },
  awa: { label: 'अवधी',       locale: 'hi-IN',  promptName: 'Awadhi dialect of Hindi' },
  mai: { label: 'मैथिली',     locale: 'hi-IN',  promptName: 'Maithili' },
  mr:  { label: 'मराठी',      locale: 'mr-IN',  promptName: 'Marathi' },
  bn:  { label: 'বাংলা',      locale: 'bn-IN',  promptName: 'Bengali' },
  ta:  { label: 'தமிழ்',      locale: 'ta-IN',  promptName: 'Tamil' },
  te:  { label: 'తెలుగు',     locale: 'te-IN',  promptName: 'Telugu' },
  pa:  { label: 'ਪੰਜਾਬੀ',     locale: 'pa-IN',  promptName: 'Punjabi' },
  gu:  { label: 'ગુજરાતી',    locale: 'gu-IN',  promptName: 'Gujarati' },
  kn:  { label: 'ಕನ್ನಡ',       locale: 'kn-IN',  promptName: 'Kannada' },
  or:  { label: 'ଓଡ଼ିଆ',       locale: 'or-IN',  promptName: 'Odia' },
};

const DEMO_PRESETS = [
  { label_en: 'PM-Kisan & Mandi', label_hi: 'पीएम-किसान व मंडी',
    query_en: 'How to apply for PM-Kisan scheme and what is tomato mandi rate?',
    query_hi: 'Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav janna hai.',
    icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
  { label_en: 'Crop Disease', label_hi: 'फसल रोग',
    query_en: 'Insects on tomatoes, which pesticide should I spray?',
    query_hi: 'Tamatar me keede lag rahe hain, konsa pesticide spray karna chahiye?',
    icon: Bug, color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100 border-red-200' },
  { label_en: 'Mandi Rates', label_hi: 'मंडी भाव',
    query_en: 'What is today wholesale price of onion in Gorakhpur Mandi?',
    query_hi: 'Aaj Gorakhpur Mandi me pyaaz ka thoke rate kya hai?',
    icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConfidenceBadge({ level }) {
  const map = {
    HIGH:   { cls: 'badge-high',   icon: '✓', label: 'High Confidence' },
    MEDIUM: { cls: 'badge-medium', icon: '~', label: 'Medium' },
    LOW:    { cls: 'badge-low',    icon: '⚠', label: 'Low — Verify' },
  };
  const c = map[level];
  if (!c) return null;
  return <span className={c.cls}>{c.icon} {c.label}</span>;
}

function SkeletonCard() {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardContent className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="skeleton w-6 h-6 rounded-full" />
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-5 w-24 rounded-full ml-auto" />
        </div>
        <div className="space-y-3 p-5 rounded-xl bg-muted/40">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-9 w-32 rounded-xl" />
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserVoiceApp() {
  const { language, setActiveTab, dialect, setDialect } = useApp();

  const [appState, setAppState]             = useState('IDLE');
  const [transcript, setTranscript]         = useState('');
  const [activeResult, setActiveResult]     = useState(null);
  const [queryHistory, setQueryHistory]     = useState([]);
  const [showDetailed, setShowDetailed]     = useState(false);
  const [ttsRate, setTtsRate]               = useState(1.0);
  const [largeText, setLargeText]           = useState(() => localStorage.getItem('lokvani_large_text') === 'true');
  const [showModal, setShowModal]           = useState(false);
  const [reportItem,     setReportItem]     = useState('Tamatar (Tomato)');
  const [reportPrice,    setReportPrice]    = useState('30');
  const [reportLocation, setReportLocation] = useState('Azamgarh Mandi');

  const abortRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
    localStorage.setItem('lokvani_large_text', String(largeText));
  }, [largeText]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/user/queries/user_demo_1');
      if (res.ok) { const j = await res.json(); if (j.data?.length) setQueryHistory(j.data); }
    } catch (_) {}
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const dialectInfo = DIALECT_MAP[dialect] || DIALECT_MAP.hi;
  const sttLocale   = dialectInfo.locale;
  const ttsLocale   = dialect === 'en' ? 'en-IN' : sttLocale;
  const isProcessing = appState === 'THINKING';

  const primaryAnswer = (r) =>
    (dialect === 'en') ? (r?.shortAnswerEn || r?.shortAnswerHi) : (r?.shortAnswerHi || r?.shortAnswerEn);
  const detailedAnswer = (r) =>
    (dialect === 'en') ? (r?.detailedAnswerEn || r?.detailedAnswerHi) : (r?.detailedAnswerHi || r?.detailedAnswerEn);

  // ── Query processing ────────────────────────────────────────────────
  const handleProcessQuery = useCallback(async (queryText) => {
    const trimmed = queryText.trim().slice(0, 500);
    if (!trimmed) { setAppState('IDLE'); return; }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setAppState('THINKING');
    setShowDetailed(false);

    try {
      let data = null;
      try {
        const res = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            transcribed_text: trimmed,
            user_location: 'Azamgarh, UP',
            userId: 'user_demo_1',
            userName: 'Ramesh Kumar (Farmer)',
            dialect: dialectInfo.promptName,
          })
        });
        if (res.ok) { const j = await res.json(); data = j.data; }
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.warn('Backend offline — using local fallback');
      }

      if (!data || (!data.shortAnswerHi && !data.shortAnswerEn)) {
        const local = processUserSpeechQuery(trimmed, { userLocation: 'Azamgarh, UP' });
        data = {
          _id: `local_${Date.now()}`,
          transcribedText: trimmed,
          userLocation: 'Azamgarh, UP',
          shortAnswerHi: local.shortAnswerHi   || '',
          shortAnswerEn: local.shortAnswerEn   || '',
          detailedAnswerHi: local.detailedAnswerHi || local.shortAnswerHi || '',
          detailedAnswerEn: local.detailedAnswerEn || local.shortAnswerEn || '',
          confidence: local.confidence || 'LOW',
          followUpQuestions: local.follow_up_questions || [],
          domain: local.domain || 'AGRI_ADVISORY',
          isHighStakes: local.isHighStakes || false,
          riskCategory: local.riskCategory || 'NONE',
          trustNote: local.trustNote || '',
          actionableSteps: local.actionableSteps || [],
          status: local.isHighStakes ? 'PENDING_TRUST_REVIEW' : 'AUTO_VERIFIED (Offline)',
          engineSource: 'LOCAL_NLP_FALLBACK',
          createdAt: new Date(),
        };
      }

      setActiveResult(data);
      setQueryHistory(prev => [data, ...prev.filter(h => h._id !== data._id)]);
      setTranscript('');
      setAppState('IDLE');

      const ttsText = dialect === 'en'
        ? (data.shortAnswerEn || data.shortAnswerHi)
        : (data.shortAnswerHi || data.shortAnswerEn);
      handlePlayTTS(ttsText);
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error(e);
      setAppState('IDLE');
    }
  }, [dialect, dialectInfo.promptName]);

  const handleStartListening = useCallback(() => {
    if (isProcessing) return;
    setAppState('LISTENING');
    setTranscript('');
    speechService.startListening(
      (r) => { setTranscript(r.transcript); if (r.isFinal) handleProcessQuery(r.transcript); },
      (e) => { console.error(e); setAppState('IDLE'); },
      sttLocale
    );
  }, [isProcessing, sttLocale, handleProcessQuery]);

  const handleStopListening = useCallback(() => {
    speechService.stopListening();
    if (transcript.trim()) handleProcessQuery(transcript);
    else setAppState('IDLE');
  }, [transcript, handleProcessQuery]);

  const handlePlayTTS = useCallback((text) => {
    if (appState === 'SPEAKING') { speechService.stopSpeaking(); setAppState('IDLE'); return; }
    if (!text) return;
    setAppState('SPEAKING');
    speechService.speakText(text, ttsLocale, () => setAppState('IDLE'), ttsRate);
  }, [appState, ttsLocale, ttsRate]);

  const handlePresetSelect = useCallback((p) => {
    if (isProcessing) return;
    const q = language === 'hi' ? p.query_hi : p.query_en;
    setTranscript(q);
    handleProcessQuery(q);
  }, [isProcessing, language, handleProcessQuery]);

  const handlePriceReport = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/intel', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: reportItem, price: reportPrice, unit: 'kg', location: reportLocation, reportedBy: 'Local Farmer' }) });
    } catch (_) {}
    setShowModal(false);
    alert('Thank you! Your market price report has been shared with neighboring farmers.');
  };

  return (
    <TooltipProvider>
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-5 items-start', largeText && 'large-text')}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
        {/* New query */}
        <Button
          className="w-full gap-2 font-bold"
          disabled={isProcessing}
          onClick={() => { setActiveResult(null); setTranscript(''); setShowDetailed(false); }}
        >
          <Mic size={15} />
          {language === 'hi' ? '+ नई पूछताछ' : '+ New Voice Query'}
        </Button>

        {/* Dialect */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe size={11} /> {language === 'hi' ? 'भाषा / बोली' : 'Language / Dialect'}
            </p>
          </div>
          <div className="px-3 pb-3">
            <Select value={dialect} onValueChange={setDialect}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIALECT_MAP).map(([code, info]) => (
                  <SelectItem key={code} value={code} className="text-sm">{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* TTS Speed */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Gauge size={11} /> {language === 'hi' ? 'बोलने की गति' : 'Speech Speed'}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {[0.75, 1.0, 1.25].map(r => (
                <Button
                  key={r}
                  size="sm"
                  variant={ttsRate === r ? 'default' : 'outline'}
                  onClick={() => setTtsRate(r)}
                  className="h-8 text-xs font-semibold tabular-nums"
                >
                  {r}×
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Large text toggle */}
        <Button
          variant={largeText ? 'secondary' : 'outline'}
          className="w-full gap-2 text-sm font-semibold justify-start"
          onClick={() => setLargeText(p => !p)}
        >
          <Type size={14} />
          {largeText
            ? (language === 'hi' ? 'सामान्य आकार' : 'Normal Size')
            : (language === 'hi' ? 'बड़ा टेक्स्ट A+' : 'Large Text A+')}
        </Button>

        <Separator />

        {/* History */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
            <Clock size={11} /> {language === 'hi' ? 'पिछले सवाल' : 'Recent Queries'}
          </p>
          <ScrollArea className="max-h-52 lg:max-h-[calc(100vh-580px)]">
            <div className="flex flex-col gap-1.5 pr-2">
              {queryHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground italic px-2 py-2">
                  {language === 'hi' ? 'कोई इतिहास नहीं' : 'No history yet'}
                </p>
              ) : queryHistory.map((h) => (
                <button
                  key={h._id}
                  onClick={() => { setActiveResult(h); setTranscript(''); setShowDetailed(false); }}
                  className={cn(
                    'text-left p-3 rounded-xl transition-all flex flex-col gap-1 w-full text-xs border',
                    activeResult?._id === h._id
                      ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted/60 border-transparent hover:border-border/50'
                  )}
                >
                  <span className="truncate w-full font-semibold text-foreground">{h.transcribedText}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full italic">
                    {primaryAnswer(h)?.slice(0, 55)}…
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={9} />
                    {h.createdAt ? new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* ── Main Panel ──────────────────────────────────────────── */}
      <div className="flex-1 w-full min-w-0 space-y-4">

        {/* Hero / Mic section */}
        <div className="relative overflow-hidden rounded-3xl hero-bg shadow-[0_32px_80px_-40px_rgba(24,24,27,0.4)]">
          {/* Bg blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.04] pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-[#a3b86b]/[0.06] pointer-events-none" />

          <div className="relative z-10 text-center p-6 sm:p-10">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/90 text-xs font-medium mb-5">
              {appState === 'IDLE'      && <><Sparkles size={12} className="text-[#d6a83a]" /> {language === 'hi' ? 'तैयार है' : 'Ready'}</>}
              {appState === 'LISTENING' && <><Mic size={12} className="text-orange-300 animate-pulse" /> {language === 'hi' ? 'सुन रहे हैं…' : 'Listening…'}</>}
              {appState === 'THINKING'  && <><RefreshCw size={12} className="animate-spin" /> {language === 'hi' ? 'उत्तर तैयार हो रहा है…' : 'Processing…'}</>}
              {appState === 'SPEAKING'  && <><Volume2 size={12} className="text-emerald-300 animate-bounce" /> {language === 'hi' ? 'ऑडियो चल रहा है…' : 'Speaking…'}</>}
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-white mb-2">
              {language === 'hi' ? 'बोलकर सवाल पूछें' : 'Ask with Your Voice'}
            </h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              {language === 'hi'
                ? 'मंडी भाव, सरकारी योजनाएं, फसल सलाह — अपनी भाषा में'
                : 'Mandi rates, schemes, crop advisory — in your own dialect'}
            </p>

            {/* Mic Button */}
            <div className="flex justify-center mb-6">
              <div className={cn('mic-wrap', appState === 'LISTENING' && 'listening')}>
                {(appState === 'LISTENING') && (
                  <>
                    <div className="mic-ring" />
                    <div className="mic-ring-2" />
                  </>
                )}
                <button
                  id="mic-btn"
                  onClick={appState === 'LISTENING' ? handleStopListening : handleStartListening}
                  disabled={isProcessing}
                  className={cn(
                    'mic-btn',
                    appState === 'LISTENING'  && 'listening',
                    appState === 'SPEAKING'   && 'speaking',
                    isProcessing              && 'processing'
                  )}
                  aria-label={appState === 'LISTENING' ? 'Stop listening' : 'Start listening'}
                >
                  {appState === 'SPEAKING' ? (
                    <div className="waveform text-white">
                      {[...Array(5)].map((_, i) => <div key={i} className="waveform-bar" />)}
                    </div>
                  ) : isProcessing ? (
                    <RefreshCw size={32} className="animate-spin" />
                  ) : appState === 'LISTENING' ? (
                    <MicOff size={32} />
                  ) : (
                    <Mic size={32} />
                  )}
                </button>
              </div>
            </div>

            {/* Live transcript */}
            {transcript && (
              <p className="text-white/90 text-sm font-semibold italic mb-6 animate-pulse px-4 max-w-md mx-auto">
                "{transcript}"
              </p>
            )}

            {/* Demo Presets */}
            <div className="border-t border-white/[0.1] pt-5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                {language === 'hi' ? 'त्वरित उदाहरण' : 'Quick Examples'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {DEMO_PRESETS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={i}
                      id={`preset-${i}`}
                      onClick={() => handlePresetSelect(p)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.07] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.12] transition-all duration-500 ease-premium active:scale-[0.97] disabled:opacity-40"
                    >
                      <Icon size={12} className="text-[#d6a83a]" />
                      {language === 'hi' ? p.label_hi : p.label_en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton while thinking */}
        {isProcessing && <SkeletonCard />}

        {/* Result Card */}
        {!isProcessing && activeResult && (
          <Card className="response-card overflow-hidden border-border/60 shadow-md">
            {/* Header strip */}
            <div className={cn(
              'px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 border-b',
              activeResult.isHighStakes
                ? 'bg-amber-50 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            )}>
              <div className="flex items-center gap-2">
                {activeResult.isHighStakes
                  ? <AlertTriangle size={15} className="text-amber-600" />
                  : <CheckCircle2 size={15} className="text-emerald-600" />
                }
                <span className={cn('text-xs font-bold uppercase tracking-wider',
                  activeResult.isHighStakes ? 'text-amber-700' : 'text-emerald-700'
                )}>
                  {activeResult.isHighStakes
                    ? (language === 'hi' ? 'समीक्षा आवश्यक' : 'Needs Review')
                    : (language === 'hi' ? 'स्वत: सत्यापित' : 'Auto Verified')}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <ConfidenceBadge level={activeResult.confidence} />
                {activeResult.domain && (
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                    {activeResult.domain.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-5 sm:p-7 space-y-5">
              {/* Query */}
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <MessageSquare size={11} />
                "{activeResult.transcribedText}"
              </p>

              {/* Short Answer */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#f4f8f2] border border-[#c8dcc4] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-[10px] font-bold text-[#48734f] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={11} />
                    {language === 'hi' ? 'त्वरित उत्तर' : 'Quick Answer'}
                  </p>
                  <Button
                    id="play-answer-btn"
                    size="sm"
                    variant={appState === 'SPEAKING' ? 'destructive' : 'default'}
                    className="h-7 text-xs gap-1.5 px-3"
                    onClick={() => handlePlayTTS(primaryAnswer(activeResult))}
                  >
                    {appState === 'SPEAKING'
                      ? <><VolumeX size={12} /> {language === 'hi' ? 'रोकें' : 'Stop'}</>
                      : <><Volume2 size={12} /> {language === 'hi' ? 'सुनें' : 'Play'}</>}
                  </Button>
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {primaryAnswer(activeResult)}
                </p>
                {activeResult.shortAnswerEn && activeResult.shortAnswerHi && (
                  <p className="text-xs text-muted-foreground italic">
                    {dialect !== 'en' ? `EN: ${activeResult.shortAnswerEn}` : `HI: ${activeResult.shortAnswerHi}`}
                  </p>
                )}
              </div>

              {/* Detailed Answer (expandable) */}
              {detailedAnswer(activeResult) && detailedAnswer(activeResult) !== primaryAnswer(activeResult) && (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <button
                    id="toggle-detailed"
                    onClick={() => setShowDetailed(p => !p)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-semibold text-foreground"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare size={14} />
                      {language === 'hi' ? 'विस्तृत उत्तर' : 'Detailed Answer'}
                    </span>
                    {showDetailed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showDetailed && (
                    <div className="p-5 border-t border-border/40 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">
                        {detailedAnswer(activeResult)}
                      </p>
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs gap-1.5 px-3"
                        onClick={() => handlePlayTTS(detailedAnswer(activeResult))}
                      >
                        <Volume2 size={12} />
                        {language === 'hi' ? 'विस्तृत सुनें' : 'Play Detailed'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* High-stakes warning */}
              {activeResult.isHighStakes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                    {language === 'hi' ? 'मानव सत्यापन आवश्यक है' : 'Human Verification Required'}
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">{activeResult.trustNote}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-bold text-[#48734f] gap-1"
                    onClick={() => setActiveTab('schemes')}
                  >
                    {language === 'hi' ? 'योजनाएं डैशबोर्ड खोलें' : 'Open Schemes Dashboard'}
                    <ArrowRight size={12} />
                  </Button>
                </div>
              )}

              {/* Actionable steps */}
              {activeResult.actionableSteps?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {language === 'hi' ? 'अनुशंसित कदम' : 'Recommended Steps'}
                  </p>
                  <div className="space-y-2">
                    {activeResult.actionableSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up questions */}
              {activeResult.followUpQuestions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {language === 'hi' ? 'आगे पूछें' : 'Follow-up Questions'}
                  </p>
                  <div className="flex flex-col gap-2">
                    {activeResult.followUpQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleProcessQuery(q)}
                        disabled={isProcessing}
                        className="text-left flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-sm font-medium text-primary transition-all disabled:opacity-50"
                      >
                        <ArrowRight size={13} className="shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={10} /> {activeResult.userLocation}
                </span>
                <div className="flex items-center gap-2">
                  {activeResult.engineSource && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                      {activeResult.engineSource.replace('_', ' ')}
                    </Badge>
                  )}
                  {/* Feedback buttons */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-emerald-600">
                        <ThumbsUp size={12} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Helpful</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500">
                        <ThumbsDown size={12} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Not helpful</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Price Report Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full shadow-2xl">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <h3 className="text-base font-bold">Report Local Mandi Rate</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowModal(false)}>
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePriceReport} className="space-y-3">
                {[
                  { label: 'Commodity', value: reportItem, set: setReportItem, type: 'text' },
                  { label: 'Rate (₹/kg)', value: reportPrice, set: setReportPrice, type: 'number' },
                  { label: 'Mandi Location', value: reportLocation, set: setReportLocation, type: 'text' },
                ].map(({ label, value, set, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</label>
                    <input
                      type={type} value={value} onChange={e => set(e.target.value)} required
                      className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" size="sm" className="gap-1.5"><Send size={13} /> Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
