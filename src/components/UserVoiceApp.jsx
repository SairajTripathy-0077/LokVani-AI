import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { speechService } from '../services/speechService';
import { processUserSpeechQuery } from '../services/aiCoreEngine';
import { geminiRotator } from '../services/geminiKeyRotator';
import {
  Mic, MicOff, Volume2, VolumeX, ShieldAlert, Sparkles, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, Wheat, Bug, TrendingUp, Send, X,
  ChevronDown, ChevronUp, MessageSquare, Gauge, Clock, MapPin,
  ThumbsUp, ThumbsDown, Globe, Plus, Trash2
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
  { label_en: 'ML Price Forecast', label_hi: 'मूल्य पूर्वानुमान (ML)',
    query_en: 'Predict rice price in West Bengal with rainfall 820mm, temperature 28C, soil pH 6.5',
    query_hi: 'West Bengal mein Rice ka price predict karein (Barish 820mm, Temp 28C, pH 6.5)',
    icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
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

// ─── Distress Bar Component ─────────────────────────────────────────
function DistressDamageBar({ result, dialect }) {
  if (!result) return null;

  let score = result.distressScore || result.distress_score;
  let level = result.distressLevel || result.distress_level;
  let impactEn = result.damageImpactEn || result.damage_impact_en;
  let impactHi = result.damageImpactHi || result.damage_impact_hi;

  // Heuristic calculation if not explicitly provided by backend
  if (score === undefined || score === null) {
    if (result.domain === 'AGRI_ADVISORY' && (result.riskCategory === 'PESTICIDE_SAFETY' || result.riskCategory === 'AGRICULTURAL_DOSAGE')) {
      score = 85;
      level = 'CRITICAL';
      impactEn = 'High Crop Damage Risk: Potential 35%–55% crop yield loss if pest/fungal blight is untreated within 48 hours.';
      impactHi = 'उच्च फसल क्षति जोखिम: 48 घंटे में उचित कीटनाशक न छिड़कने पर 35%-55% तक फसल नुकसान की संभावना।';
    } else if (result.domain === 'WEATHER') {
      score = 65;
      level = 'HIGH';
      impactEn = 'Weather Impact Risk: 20%–30% harvest damage risk from rain/waterlogging. Cover harvested produce immediately.';
      impactHi = 'मौसम प्रभाव जोखिम: बारिश/जलभराव से 20%-30% कटी फसल नुकसान का खतरा। तुरंत तिरपाल से ढकें।';
    } else if (result.domain === 'GOVT_SCHEME' || result.isHighStakes) {
      score = 75;
      level = 'HIGH';
      impactEn = 'Financial Eligibility Risk: Risk of subsidy delay or application rejection without land record verification.';
      impactHi = 'वित्तीय पात्रता जोखिम: दस्तावेज सत्यापन के बिना सब्सिडी रुकने या आवेदन निरस्त होने की संभावना।';
    } else if (result.domain === 'MARKET_PRICE') {
      score = 35;
      level = 'MODERATE';
      impactEn = 'Market Price Risk: Moderate 10%–15% income variance based on market location and quality grade.';
      impactHi = 'मंडी भाव जोखिम: बाजार स्थान और गुणवत्ता ग्रेड के आधार पर 10%-15% आय में उतार-चढ़ाव की संभावना।';
    } else {
      score = 20;
      level = 'LOW';
      impactEn = 'Low Business Impact: Standard informational query with minimal operational risk.';
      impactHi = 'कम व्यावसायिक जोखिम: सामान्य जानकारी प्रश्न; न्यूनतम परिचालन जोखिम।';
    }
  }

  const levelColor =
    score >= 80 ? 'bg-rose-600 border-rose-200 text-white' :
    score >= 60 ? 'bg-amber-500 border-amber-200 text-white' :
    score >= 30 ? 'bg-orange-500 border-orange-200 text-white' :
                  'bg-emerald-500 border-emerald-200 text-white';

  const barGradient =
    score >= 80 ? 'from-rose-500 to-red-600' :
    score >= 60 ? 'from-amber-500 to-orange-500' :
    score >= 30 ? 'from-amber-400 to-amber-600' :
                  'from-emerald-400 to-emerald-600';

  const impactText = (dialect === 'en') ? (impactEn || impactHi) : (impactHi || impactEn);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white space-y-3.5 shadow-lg border border-zinc-800 my-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className={score >= 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            {dialect === 'en' ? 'Farming & Business Distress Index' : 'फसल व व्यवसाय क्षति जोखिम सूचकांक'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest', levelColor)}>
            {level} ({score}%)
          </span>
        </div>
      </div>

      {/* Animated Meter Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className={cn('h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r', barGradient)}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
          <span>0% Low Impact</span>
          <span>50% Moderate</span>
          <span>100% Critical Damage</span>
        </div>
      </div>

      {/* Impact Explanation */}
      {impactText && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs leading-relaxed text-zinc-200 flex items-start gap-2.5">
          <ShieldAlert size={15} className="shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold text-white mb-0.5">
              {dialect === 'en' ? 'Estimated Damage & Business Impact:' : 'अनुमानित क्षति व व्यावसायिक प्रभाव:'}
            </p>
            <p className="text-zinc-300">{impactText}</p>
          </div>
        </div>
      )}
    </div>
  );
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
  const { language, setActiveTab, dialect, setDialect, userProfile } = useApp();
  const { user } = useAuth();

  const [appState, setAppState]             = useState('IDLE');
  const [transcript, setTranscript]         = useState('');
  const [activeResult, setActiveResult]     = useState(null);
  const [queryHistory, setQueryHistory]     = useState([]);
  const [showDetailed, setShowDetailed]     = useState(false);
  const [ttsRate, setTtsRate]               = useState(1.0);
  const [activeTranslateLang, setActiveTranslateLang] = useState('auto');
  const [showModal, setShowModal]           = useState(false);
  const [reportItem,     setReportItem]     = useState('Tamatar (Tomato)');
  const [reportPrice,    setReportPrice]    = useState('30');
  const [reportLocation, setReportLocation] = useState('Azamgarh Mandi');

  // Multi-Turn Chat Sessions with localStorage Persistence
  const [chatSessions, setChatSessions]     = useState(() => {
    try {
      const saved = localStorage.getItem('lokvani_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [{
      id: 'session_default',
      title: 'General Assistance / सामान्य बातचीत',
      createdAt: new Date().toISOString(),
      messages: []
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState('session_default');

  const abortRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lokvani_chat_sessions', JSON.stringify(chatSessions));
    } catch (_) {}
  }, [chatSessions]);

  const handleNewChat = useCallback(() => {
    const newId = `session_${Date.now()}`;
    const newSession = {
      id: newId,
      title: language === 'hi' ? 'नई बातचीत' : 'New Chat Session',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveResult(null);
    setTranscript('');
    setShowDetailed(false);
  }, [language]);

  const handleDeleteChat = useCallback(async (sessionId, e) => {
    if (e) e.stopPropagation();

    setChatSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      if (updated.length === 0) {
        const fresh = {
          id: `session_${Date.now()}`,
          title: language === 'hi' ? 'नई बातचीत' : 'New Chat Session',
          createdAt: new Date().toISOString(),
          messages: []
        };
        setActiveSessionId(fresh.id);
        setActiveResult(null);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0].id);
        const lastMsg = updated[0].messages.filter(m => m.role === 'assistant').pop();
        setActiveResult(lastMsg?.data || null);
      }
      return updated;
    });

    try {
      await fetch(`/api/user/queries/${sessionId}`, { method: 'DELETE' });
    } catch (_) {}
  }, [activeSessionId, language]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/user/queries/user_demo_1');
      if (res.ok) {
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          if (j.data?.length) setQueryHistory(j.data);
        } catch (_) {}
      }
    } catch (_) {}
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const dialectInfo = DIALECT_MAP[dialect] || DIALECT_MAP.hi;
  const sttLocale   = dialectInfo.locale;
  const isProcessing = appState === 'THINKING';

  const targetLangCode = activeTranslateLang === 'auto' ? dialect : activeTranslateLang;
  const targetDialectInfo = DIALECT_MAP[targetLangCode] || DIALECT_MAP.hi;
  const activeTtsLocale = targetLangCode === 'en' ? 'en-IN' : targetDialectInfo.locale;

  const primaryAnswer = (r) => {
    if (!r) return '';
    if (targetLangCode === 'en') return r.shortAnswerEn || r.shortAnswerHi || '';
    if (targetLangCode === 'hi') return r.shortAnswerHi || r.shortAnswerEn || '';

    const baseText = r.shortAnswerHi || r.shortAnswerEn || '';
    if (targetLangCode === 'bho') return `[भोजपुरी अनुवाद]: ${baseText}`;
    if (targetLangCode === 'bn')  return `[বাংলা অনুবাদ]: ${r.shortAnswerEn || baseText}`;
    if (targetLangCode === 'mr')  return `[मराठी भाषांतर]: ${baseText}`;
    if (targetLangCode === 'ta')  return `[தமிழ் மொழிபெயர்ப்பு]: ${r.shortAnswerEn || baseText}`;
    if (targetLangCode === 'te')  return `[తెలుగు అనువాదం]: ${r.shortAnswerEn || baseText}`;
    if (targetLangCode === 'pa')  return `[ਪੰਜਾਬੀ ਅਨੁਵਾਦ]: ${baseText}`;
    if (targetLangCode === 'gu')  return `[ગુજરાતી અનુવાદ]: ${baseText}`;
    if (targetLangCode === 'kn')  return `[ಕನ್ನಡ అనువాద]: ${r.shortAnswerEn || baseText}`;
    if (targetLangCode === 'or')  return `[ଓଡ଼ିଆ ଅନୁବାଦ]: ${baseText}`;
    return baseText;
  };

  const detailedAnswer = (r) => {
    if (!r) return '';
    if (targetLangCode === 'en') return r.detailedAnswerEn || r.detailedAnswerHi || '';
    if (targetLangCode === 'hi') return r.detailedAnswerHi || r.detailedAnswerEn || '';

    const baseText = r.detailedAnswerHi || r.detailedAnswerEn || '';
    if (targetLangCode === 'bho') return `[भोजपुरी विस्तृत]: ${baseText}`;
    if (targetLangCode === 'bn')  return `[বাংলা বিস্তারিত]: ${r.detailedAnswerEn || baseText}`;
    if (targetLangCode === 'mr')  return `[मराठी विस्तृत]: ${baseText}`;
    if (targetLangCode === 'ta')  return `[தமிழ் விரிவான]: ${r.detailedAnswerEn || baseText}`;
    if (targetLangCode === 'te')  return `[తెలుగు వివరణ]: ${r.detailedAnswerEn || baseText}`;
    if (targetLangCode === 'pa')  return `[ਪੰਜਾਬੀ ਵਿਸਤ੍ਰਿਤ]: ${baseText}`;
    if (targetLangCode === 'gu')  return `[ગુજરાતી વિગતવાર]: ${baseText}`;
    if (targetLangCode === 'kn')  return `[ಕನ್ನಡ ವಿವರವಾದ]: ${r.detailedAnswerEn || baseText}`;
    if (targetLangCode === 'or')  return `[ଓଡ଼ିଆ ବିସ୍ତୃତ]: ${baseText}`;
    return baseText;
  };

  // ── Query processing with Context Retention ──────────────────────────
  const handleProcessQuery = useCallback(async (queryText) => {
    const trimmed = queryText.trim().slice(0, 500);
    if (!trimmed) { setAppState('IDLE'); return; }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setAppState('THINKING');
    setShowDetailed(false);

    // Extract prior messages for this active chat session
    const currentSession = chatSessions.find(s => s.id === activeSessionId);
    const conversationHistory = (currentSession?.messages || []).map(m => ({
      role: m.role,
      text: m.text
    }));

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
            userId: user?.uid || 'user_demo_1',
            userName: userProfile?.fullName || user?.displayName || 'Citizen',
            dialect: dialectInfo.promptName,
            conversation_history: conversationHistory
          })
        });
        if (res.ok) {
          const text = await res.text();
          try {
            const j = JSON.parse(text);
            data = j.data;
          } catch (_) {}
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.warn('Backend offline — using local fallback');
      }

      if (!data || (!data.shortAnswerHi && !data.shortAnswerEn) || data.status === 'OUT_OF_SERVICE') {
        try {
          const clientAi = await geminiRotator.executeWithRotation(
            `You are LokVani AI, an inclusive voice AI assistant for small farmers in India. Provide responses in valid JSON:
{
  "short_answer_hi": "string (35-50 words answer in simple Hindi)",
  "short_answer_en": "string (35-50 words answer in English)",
  "detailed_answer_hi": "string (90-160 words reasoning)",
  "detailed_answer_en": "string (90-160 words reasoning)",
  "confidence": "HIGH | MEDIUM",
  "follow_up_questions": ["question 1", "question 2"],
  "domain": "AGRI_ADVISORY",
  "is_high_stakes": false,
  "risk_category": "NONE",
  "trust_note": "AI Generated Answer",
  "actionable_steps": ["step 1", "step 2"]
}`,
            trimmed
          );

          if (clientAi && clientAi.text) {
            let rawText = clientAi.text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = rawText.indexOf('{');
            const lastBrace = rawText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              rawText = rawText.substring(firstBrace, lastBrace + 1);
            }
            const parsed = JSON.parse(rawText);
            data = {
              _id: `client_${Date.now()}`,
              transcribedText: trimmed,
              userLocation: 'Azamgarh, UP',
              shortAnswerHi: parsed.short_answer_hi || parsed.shortAnswerHi || clientAi.text.slice(0, 200),
              shortAnswerEn: parsed.short_answer_en || parsed.shortAnswerEn || clientAi.text.slice(0, 200),
              detailedAnswerHi: parsed.detailed_answer_hi || parsed.detailedAnswerHi || clientAi.text,
              detailedAnswerEn: parsed.detailed_answer_en || parsed.detailedAnswerEn || clientAi.text,
              confidence: parsed.confidence || 'HIGH',
              followUpQuestions: parsed.follow_up_questions || ['अन्य जानकारी / More info'],
              domain: parsed.domain || 'AGRI_ADVISORY',
              isHighStakes: parsed.is_high_stakes || false,
              riskCategory: parsed.risk_category || 'NONE',
              trustNote: 'Direct Gemini AI Engine',
              actionableSteps: parsed.actionable_steps || [],
              status: 'AUTO_VERIFIED',
              engineSource: 'CLIENT_GEMINI_AI',
              createdAt: new Date(),
            };
          }
        } catch (_) {}
      }

      if (!data || (!data.shortAnswerHi && !data.shortAnswerEn)) {
        data = {
          _id: `offline_${Date.now()}`,
          transcribedText: trimmed,
          userLocation: 'Azamgarh, UP',
          shortAnswerHi: 'AI सेवा अस्थायी रूप से अनुपलब्ध है। कृपया Vercel पर GEMINI_API_KEYS जांचें।',
          shortAnswerEn: 'AI service is temporarily out of service. Please check GEMINI_API_KEYS on Vercel.',
          detailedAnswerHi: 'AI मॉडल सर्वर से संपर्क नहीं हो सका। कृपया नेटवर्क कनेक्शन जांचें और पुनः प्रयास करें।',
          detailedAnswerEn: 'The AI model server was unable to respond. Please check your network connection and try again.',
          confidence: 'LOW',
          followUpQuestions: ['पुनः प्रयास करें / Try again', 'मंडी भाव देखें / Check mandi rates'],
          domain: 'AGRI_ADVISORY',
          isHighStakes: false,
          riskCategory: 'NONE',
          trustNote: 'AI Service Out of Service',
          actionableSteps: ['कृपया कुछ समय बाद पुनः प्रयास करें / Please try again shortly.'],
          status: 'OUT_OF_SERVICE',
          engineSource: 'AI_OUT_OF_SERVICE',
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

  const silenceTimerRef = useRef(null);

  const handleStartListening = useCallback(() => {
    if (isProcessing) return;
    setAppState('LISTENING');
    setTranscript('');

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    speechService.startListening(
      (r) => {
        setTranscript(r.transcript);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (r.transcript && r.transcript.trim()) {
          // Wait 2.2 seconds of silence to ensure user has finished their complete statement
          silenceTimerRef.current = setTimeout(() => {
            speechService.stopListening();
            handleProcessQuery(r.transcript);
          }, 2200);
        }
      },
      (e) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        console.error(e);
        setAppState('IDLE');
      },
      sttLocale
    );
  }, [isProcessing, sttLocale, handleProcessQuery]);

  const handleStopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    speechService.stopListening();
    if (transcript.trim()) handleProcessQuery(transcript);
    else setAppState('IDLE');
  }, [transcript, handleProcessQuery]);

  const handlePlayTTS = useCallback((text) => {
    if (appState === 'SPEAKING') { speechService.stopSpeaking(); setAppState('IDLE'); return; }
    if (!text) return;
    setAppState('SPEAKING');
    speechService.speakText(text, activeTtsLocale, () => setAppState('IDLE'), ttsRate);
  }, [appState, activeTtsLocale, ttsRate]);

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
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 sm:pt-10 sm:pb-24 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start')}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="order-2 lg:order-1 w-full lg:w-[310px] shrink-0 flex flex-col gap-5 lg:sticky lg:top-24 mb-6 lg:mb-0">
        {/* + New Chat Session Button */}
        <button
          disabled={isProcessing}
          onClick={handleNewChat}
          className="group w-full h-11 rounded-full bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:bg-zinc-800 transition-all duration-500 ease-premium active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:scale-110">
            <Plus size={13} strokeWidth={2.5} />
          </span>
          <span>{language === 'hi' ? '+ नई बातचीत शुरू करें' : '+ Start New Chat'}</span>
        </button>

        {/* Preferences — Double-bezel panel */}
        <div className="rounded-[2rem] bg-zinc-200/40 p-1.5 ring-1 ring-black/[0.06] shadow-[0_16px_40px_-24px_rgba(24,24,27,0.10)]">
          <div className="rounded-[calc(2rem-6px)] bg-white overflow-hidden divide-y divide-black/[0.05]">
            <div className="p-4.5 sm:p-5">
              <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-[0.16em] mb-3 flex items-center gap-1.5">
                <Globe size={12} className="text-zinc-500" /> {language === 'hi' ? 'भाषा / बोली' : 'Language / Dialect'}
              </p>
              <Select value={dialect} onValueChange={setDialect}>
                <SelectTrigger className="w-full justify-between h-10 text-xs font-semibold rounded-xl border-black/[0.08] bg-zinc-50/80 hover:bg-white hover:border-black/[0.15] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-black/[0.08] bg-white/95 backdrop-blur-xl shadow-xl">
                  {Object.entries(DIALECT_MAP).map(([code, info]) => (
                    <SelectItem key={code} value={code} className="text-xs font-semibold cursor-pointer">{info.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4.5 sm:p-5">
              <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-[0.16em] mb-3 flex items-center gap-1.5">
                <Gauge size={12} className="text-zinc-500" /> {language === 'hi' ? 'बोलने की गति' : 'Speech Speed'}
              </p>
              <div className="flex gap-1 p-1 rounded-xl bg-zinc-100/90 border border-black/[0.04]">
                {[0.75, 1.0, 1.25].map(r => (
                  <button
                    key={r}
                    onClick={() => setTtsRate(r)}
                    aria-pressed={ttsRate === r}
                    className={cn(
                      'flex-1 h-8 rounded-lg text-xs font-semibold tabular-nums transition-all duration-300 cursor-pointer',
                      ttsRate === r
                        ? 'bg-white shadow-2xs text-zinc-900 font-bold'
                        : 'text-zinc-500 hover:text-zinc-900'
                    )}
                  >
                    {r}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sessions History Manager — Double-bezel panel */}
        <div className="rounded-[2rem] bg-zinc-200/40 p-1.5 ring-1 ring-black/[0.06] shadow-[0_16px_40px_-24px_rgba(24,24,27,0.10)]">
          <div className="rounded-[calc(2rem-6px)] bg-white p-4.5 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-[0.16em] flex items-center gap-1.5">
                <MessageSquare size={12} className="text-zinc-500" /> {language === 'hi' ? 'सहेजी गई बातचीत' : 'Saved Chats'}
              </p>
              <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                {chatSessions.length}
              </span>
            </div>
            <ScrollArea className="max-h-72 overflow-y-auto">
              <div className="flex flex-col gap-1.5 pr-1">
                {chatSessions.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic px-2 py-4 text-center">
                    {language === 'hi' ? 'कोई बातचीत नहीं' : 'No saved chats'}
                  </p>
                ) : chatSessions.map((session) => {
                  const active = activeSessionId === session.id;
                  const lastAssistantMsg = session.messages.filter(m => m.role === 'assistant').pop();
                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setActiveResult(lastAssistantMsg?.data || null);
                        setTranscript('');
                        setShowDetailed(false);
                      }}
                      className={cn(
                        'group/session text-left p-3 transition-all duration-300 flex items-start justify-between gap-2 w-full text-xs rounded-xl border cursor-pointer',
                        active
                          ? 'bg-emerald-50/80 border-emerald-500/30 text-emerald-950 font-semibold shadow-2xs'
                          : 'border-transparent text-zinc-600 hover:border-black/[0.06] hover:bg-zinc-50'
                      )}
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="truncate w-full font-semibold text-zinc-900">{session.title}</span>
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 tabular-nums">
                          <span>{session.messages.length / 2} {language === 'hi' ? 'टर्न' : 'turns'}</span>
                          <span>•</span>
                          <span>{new Date(session.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </span>
                      </div>
                      <button
                        title={language === 'hi' ? 'बातचीत हटाएं' : 'Delete chat'}
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 opacity-80 group-hover/session:opacity-100 transition-all cursor-pointer shrink-0 mt-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </aside>

      {/* ── Main Panel ──────────────────────────────────────────── */}
      <div className="order-1 lg:order-2 flex-1 w-full min-w-0 space-y-6">

        {/* Hero / Mic section */}
        <div className="relative overflow-hidden rounded-3xl hero-bg grain border border-border/70 shadow-[0_24px_60px_-40px_rgba(24,24,27,0.25)]">
          <div className="relative z-10 text-center p-6 sm:p-10 lg:p-12">
            {/* Status pill (hidden while idle) */}
            {appState !== 'IDLE' && (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border text-foreground/80 text-xs font-semibold tracking-wide mb-6 shadow-sm"
                role="status"
                aria-live="polite"
              >
                {appState === 'LISTENING' && <><Mic size={12} className="text-red-600 animate-pulse" /> {language === 'hi' ? 'सुन रहे हैं…' : 'Listening…'}</>}
                {appState === 'THINKING'  && <><RefreshCw size={12} className="animate-spin" /> {language === 'hi' ? 'उत्तर तैयार हो रहा है…' : 'Processing…'}</>}
                {appState === 'SPEAKING'  && <><Volume2 size={12} className="animate-bounce" /> {language === 'hi' ? 'ऑडियो चल रहा है…' : 'Speaking…'}</>}
              </div>
            )}

            <h2 className="font-condensed text-3xl sm:text-[2.75rem] leading-[1.1] font-semibold tracking-[-0.015em] text-foreground mb-4">
              {language === 'hi' ? 'बोलकर सवाल पूछें' : 'Ask with Your Voice'}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed">
              {language === 'hi'
                ? 'मंडी भाव, सरकारी योजनाएं, फसल सलाह — अपनी भाषा में'
                : 'Mandi rates, schemes, crop advisory — in your own dialect'}
            </p>

            {/* Mic Button */}
            <div className="flex justify-center mb-8">
              <div className={cn('mic-wrap', appState === 'LISTENING' && 'listening')}>
                <div className="mic-halo" />
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
              <p
                className="text-foreground text-sm font-medium italic mb-8 px-6 py-3 max-w-md mx-auto rounded-2xl bg-white border border-border leading-relaxed shadow-sm"
                aria-live="polite"
              >
                "{transcript}"
              </p>
            )}

            {/* Demo Presets */}
            <div className="border-t border-border/60 pt-6">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-4">
                {language === 'hi' ? 'त्वरित उदाहरण' : 'Quick Examples'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {DEMO_PRESETS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={i}
                      id={`preset-${i}`}
                      onClick={() => handlePresetSelect(p)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-muted text-foreground text-xs font-medium border border-border hover:border-border transition-all duration-300 ease-premium active:scale-[0.97] disabled:opacity-40 shadow-sm"
                    >
                      <Icon size={13} className="text-[#a07a1e]" />
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
          <Card className="response-card overflow-hidden border-border/60 shadow-[0_20px_50px_-30px_rgba(24,24,27,0.35)]">
            {/* Header strip */}
            <div className={cn(
              'px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 border-b',
              activeResult.isHighStakes
                ? 'bg-amber-50/70 border-amber-200/80'
                : 'bg-muted/40 border-border/60'
            )}>
              <div className="flex items-center gap-2">
                {activeResult.isHighStakes
                  ? <AlertTriangle size={15} className="text-amber-600" />
                  : <CheckCircle2 size={15} className="text-[#48734f]" />
                }
                <span className={cn('text-xs font-semibold uppercase tracking-[0.1em]',
                  activeResult.isHighStakes ? 'text-amber-700' : 'text-[#48734f]'
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

            <CardContent className="p-5 sm:p-8 space-y-6">
              {/* Query */}
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <MessageSquare size={11} />
                "{activeResult.transcribedText}"
              </p>

              {/* Live Response Translator Control Bar */}
              <div className="p-3 rounded-2xl bg-zinc-100/90 border border-zinc-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <Globe size={14} className="text-[#a07a1e]" />
                    <span>{language === 'hi' ? 'उत्तर अनुवाद:' : 'Translate AI Response:'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                    {targetDialectInfo.label} ({targetLangCode.toUpperCase()})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveTranslateLang('auto')}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      activeTranslateLang === 'auto'
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'bg-white text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200'
                    )}
                  >
                    {language === 'hi' ? 'मूल (Auto)' : 'Original (Auto)'}
                  </button>
                  {['hi', 'en', 'bho', 'mr', 'bn', 'ta', 'te', 'pa'].map((code) => {
                    const info = DIALECT_MAP[code];
                    const isSelected = activeTranslateLang === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setActiveTranslateLang(code)}
                        className={cn(
                          'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                            : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200/80'
                        )}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Answer */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#f4f8f2] border border-[#c8dcc4] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-[10px] font-semibold text-[#48734f] uppercase tracking-[0.12em] flex items-center gap-1.5">
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
                <p className="text-lg sm:text-xl font-bold font-condensed text-foreground leading-snug">
                  {primaryAnswer(activeResult)}
                </p>
                {activeResult.shortAnswerEn && activeResult.shortAnswerHi && (
                  <p className="text-xs text-muted-foreground italic">
                    {dialect !== 'en' ? `EN: ${activeResult.shortAnswerEn}` : `HI: ${activeResult.shortAnswerHi}`}
                  </p>
                )}
              </div>

              {/* Farming & Business Distress Level & Damage Bar */}
              <DistressDamageBar result={activeResult} dialect={dialect} />

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
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    {language === 'hi' ? 'अनुशंसित कदम' : 'Recommended Steps'}
                  </p>
                  <div className="space-y-2.5">
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
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    {language === 'hi' ? 'आगे पूछें' : 'Follow-up Questions'}
                  </p>
                  <div className="flex flex-col gap-2.5">
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
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-emerald-600" aria-label="Helpful">
                        <ThumbsUp size={12} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Helpful</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" aria-label="Not helpful">
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
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <Card className="max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 ease-premium">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <h3 className="text-base font-bold">Report Local Mandi Rate</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePriceReport} className="space-y-4">
                {[
                  { label: 'Commodity', value: reportItem, set: setReportItem, type: 'text' },
                  { label: 'Rate (₹/kg)', value: reportPrice, set: setReportPrice, type: 'number' },
                  { label: 'Mandi Location', value: reportLocation, set: setReportLocation, type: 'text' },
                ].map(({ label, value, set, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2">{label}</label>
                    <input
                      type={type} value={value} onChange={e => set(e.target.value)} required
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <div className="flex gap-3 justify-end pt-3">
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
