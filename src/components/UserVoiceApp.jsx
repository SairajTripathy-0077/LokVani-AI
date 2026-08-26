import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { processUserSpeechQuery } from '../services/aiCoreEngine';
import {
  Mic, MicOff, Volume2, VolumeX, ShieldAlert, Sparkles, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, Wheat, Bug, TrendingUp, Send, X,
  ChevronDown, ChevronUp, MessageSquare, Gauge, Type, Zap, Clock, MapPin,
  ThumbsUp, ThumbsDown, MessageSquarePlus, Trash2, Edit2, Check, User,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import DistressCard from './DistressCard';

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
  kn:  { label: 'कन्नड',       locale: 'kn-IN',  promptName: 'Kannada' },
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

function ConfidenceBadge({ level }) {
  const map = {
    HIGH:   { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✓', label_en: 'High Confidence', label_hi: 'उच्च विश्वास' },
    MEDIUM: { cls: 'bg-blue-100 text-blue-800 border-blue-300',       icon: '✓', label_en: 'Verified Standard', label_hi: 'मानक सत्यापित' },
    LOW:    { cls: 'bg-amber-100 text-amber-800 border-amber-300',    icon: 'ℹ', label_en: 'Community Sourced', label_hi: 'समुदाय स्रोत' },
  };
  const c = map[level] || map['HIGH'];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border', c.cls)}>
      <span>{c.icon}</span>
      <span>{c.label_en}</span>
    </span>
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
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserVoiceApp() {
  const {
    language, setActiveTab, dialect, setDialect, isSpeaking, stopSpeaking,
    conversations, activeConvId, activeConversation, createConversation,
    selectConversation, deleteConversation, deleteMessageFromActiveConv, clearAllConversations,
    renameConversation, addMessageToActiveConv
  } = useApp();

  const [appState, setAppState]             = useState('IDLE');
  const [transcript, setTranscript]         = useState('');
  const [typedQuery, setTypedQuery]         = useState('');
  const [showDetailedMap, setShowDetailedMap] = useState({});
  const [ttsRate, setTtsRate]               = useState(1.0);
  const [largeText, setLargeText]           = useState(() => localStorage.getItem('lokvani_large_text') === 'true');
  const [showModal, setShowModal]           = useState(false);
  const [reportItem,     setReportItem]     = useState('Tamatar (Tomato)');
  const [reportPrice,    setReportPrice]    = useState('30');
  const [reportLocation, setReportLocation] = useState('Azamgarh Mandi');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleText, setEditTitleText]   = useState('');

  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  // Sync appState with global speaking status
  useEffect(() => {
    if (isSpeaking) {
      setAppState('SPEAKING');
    } else if (appState === 'SPEAKING') {
      setAppState('IDLE');
    }
  }, [isSpeaking, appState]);

  // Keyboard shortcut: Press Escape to stop AI voice output anytime
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSpeaking) {
        stopSpeaking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, stopSpeaking]);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
    localStorage.setItem('lokvani_large_text', String(largeText));
  }, [largeText]);

  // Auto-scroll to bottom of conversation thread when new message is added
  useEffect(() => {
    if (activeConversation?.messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages?.length]);

  const dialectInfo = DIALECT_MAP[dialect] || DIALECT_MAP.hi;
  const sttLocale   = dialectInfo.locale;
  const ttsLocale   = dialect === 'en' ? 'en-IN' : sttLocale;
  const isProcessing = appState === 'THINKING';

  const primaryAnswer = (r) =>
    (dialect === 'en') ? (r?.shortAnswerEn || r?.shortAnswerHi) : (r?.shortAnswerHi || r?.shortAnswerEn);
  const detailedAnswer = (r) =>
    (dialect === 'en') ? (r?.detailedAnswerEn || r?.detailedAnswerHi) : (r?.detailedAnswerHi || r?.detailedAnswerEn);

  const handlePlayTTS = useCallback((text) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (!text) return;
    setAppState('SPEAKING');
    speechService.speakText(text, ttsLocale, () => setAppState('IDLE'), ttsRate);
  }, [isSpeaking, stopSpeaking, ttsLocale, ttsRate]);

  // ── Query processing ────────────────────────────────────────────────
  const handleProcessQuery = useCallback(async (queryText) => {
    const trimmed = queryText.trim().slice(0, 500);
    if (!trimmed) { setAppState('IDLE'); return; }

    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (_) { /* ignore */ }
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setAppState('THINKING');

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
        if (res.ok) {
          const j = await res.json();
          if (j.data) {
            data = {
              ...j.data,
              shortAnswerHi: j.data.shortAnswerHi || j.data.short_answer_hi || '',
              shortAnswerEn: j.data.shortAnswerEn || j.data.short_answer_en || '',
              detailedAnswerHi: j.data.detailedAnswerHi || j.data.detailed_answer_hi || '',
              detailedAnswerEn: j.data.detailedAnswerEn || j.data.detailed_answer_en || '',
              followUpQuestions: j.data.followUpQuestions || j.data.follow_up_questions || [],
              isHighStakes: j.data.isHighStakes ?? j.data.is_high_stakes ?? false,
              riskCategory: j.data.riskCategory || j.data.risk_category || 'NONE',
              trustNote: j.data.trustNote || j.data.trust_note || '',
              actionableSteps: j.data.actionableSteps || j.data.actionable_steps || [],
            };
          }
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          console.log('[UserVoiceApp] Query fetch aborted by new user action.');
          return;
        }
        console.warn('[UserVoiceApp] Backend offline or unreachable — using local fallback engine');
      }

      // If network call failed or returned empty payload, use deterministic local NLP engine
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

      addMessageToActiveConv(data);
      setTranscript('');

      const ttsText = dialect === 'en'
        ? (data.shortAnswerEn || data.shortAnswerHi)
        : (data.shortAnswerHi || data.shortAnswerEn);
      handlePlayTTS(ttsText);
    } catch (err) {
      console.error('[UserVoiceApp] Error processing query:', err);
    } finally {
      setAppState('IDLE');
    }
  }, [dialect, dialectInfo.promptName, addMessageToActiveConv, handlePlayTTS]);

  const handleStartListening = useCallback(() => {
    if (isProcessing) return;
    if (isSpeaking) stopSpeaking();
    setAppState('LISTENING');
    setTranscript('');

    speechService.startListening(
      (r) => {
        setTranscript(r.transcript);
      },
      (e) => {
        console.warn('[UserVoiceApp] STT Error:', e);
        setAppState('IDLE');
      },
      (capturedText) => {
        // onEnd callback when speech recognition completes naturally
        setAppState('IDLE');
        if (capturedText && capturedText.trim()) {
          handleProcessQuery(capturedText.trim());
        }
      },
      sttLocale
    );
  }, [isProcessing, isSpeaking, stopSpeaking, sttLocale, handleProcessQuery]);

  const handleStopListening = useCallback(() => {
    speechService.stopListening();
    if (transcript.trim()) {
      handleProcessQuery(transcript);
    } else {
      setAppState('IDLE');
    }
  }, [transcript, handleProcessQuery]);

  const handlePresetSelect = useCallback((p) => {
    if (isProcessing) return;
    if (isSpeaking) stopSpeaking();
    const q = language === 'hi' ? p.query_hi : p.query_en;
    setTranscript(q);
    handleProcessQuery(q);
  }, [isProcessing, isSpeaking, stopSpeaking, language, handleProcessQuery]);

  const handlePriceReport = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/intel', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: reportItem, price: reportPrice, unit: 'kg', location: reportLocation, reportedBy: 'Local Farmer' }) });
    } catch (_) {}
    setShowModal(false);
    alert('Thank you! Your market price report has been shared with neighboring farmers.');
  };

  const handleSaveTitle = () => {
    if (editTitleText.trim()) {
      renameConversation(activeConvId, editTitleText.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleDetailed = (msgId) => {
    setShowDetailedMap(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <TooltipProvider>
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-5 items-start', largeText && 'large-text')}>

      {/* ── Floating Sticky Stop Voice Banner (when AI is speaking) ──────────────── */}
      {isSpeaking && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3.5 px-5 py-3 rounded-full bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-white/20">
            <div className="waveform text-emerald-400">
              {[...Array(5)].map((_, i) => <div key={i} className="waveform-bar" />)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">
                {language === 'hi' ? 'एआई आवाज़ चालू है' : 'AI Speaking...'}
              </span>
              <span className="text-[10px] text-slate-300">
                {language === 'hi' ? 'रोकने के लिए दबाएं (या Esc दबाएं)' : 'Press to stop (or Esc key)'}
              </span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={stopSpeaking}
              className="h-8 text-xs font-extrabold gap-1.5 rounded-full px-4 shadow-md shadow-red-500/30"
            >
              <VolumeX size={14} />
              {language === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Sidebar (Conversations Sessions List) ───────────────── */}
      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
        {/* + New Chat Session Button */}
        <Button
          className="w-full gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
          disabled={isProcessing}
          onClick={() => {
            if (isSpeaking) stopSpeaking();
            createConversation();
          }}
        >
          <MessageSquarePlus size={16} />
          {language === 'hi' ? '+ नई बातचीत (New Chat)' : '+ New Chat Session'}
        </Button>

        {/* Dialect Selection */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🌐</span> {language === 'hi' ? 'भाषा / बोली (Dialect)' : 'Dialect / Accent'}
            </p>
          </div>
          <div className="px-3 pb-3">
            <Select value={dialect} onValueChange={setDialect}>
              <SelectTrigger className="h-9 text-sm font-medium">
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

        {/* Speech Speed */}
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
                  className="h-8 text-xs font-bold"
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

        {/* Conversations Sessions List */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={11} />
              {language === 'hi' ? 'आपकी बातचीत (Chat Sessions)' : 'Chat Conversations'}
            </p>
            <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-bold">
              {(conversations || []).length}
            </Badge>
          </div>

          <ScrollArea className="max-h-60 lg:max-h-[calc(100vh-620px)]">
            <div className="flex flex-col gap-1.5 pr-2">
              {(conversations || []).map((conv) => {
                const isActive = conv.id === activeConvId;
                const msgCount = conv.messages?.length || 0;
                const lastMsg = conv.messages?.[conv.messages.length - 1];

                return (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border text-xs',
                      isActive
                        ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/60 border-transparent hover:border-border/50'
                    )}
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      selectConversation(conv.id);
                    }}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="truncate font-semibold text-foreground">{conv.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate italic">
                        {lastMsg ? primaryAnswer(lastMsg)?.slice(0, 45) + '…' : (language === 'hi' ? 'खाली बातचीत' : 'Empty conversation')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {msgCount > 0 && (
                        <Badge variant={isActive ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 font-bold">
                          {msgCount}
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-70 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSpeaking) stopSpeaking();
                          deleteConversation(conv.id);
                        }}
                        title="Delete Chat Session"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Clear All Chats convenience button */}
          {(conversations || []).length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 justify-center gap-1.5 h-7"
              onClick={() => {
                if (window.confirm(language === 'hi' ? 'क्या आप सभी बातचीत मिटाना चाहते हैं?' : 'Clear all conversation history?')) {
                  if (isSpeaking) stopSpeaking();
                  clearAllConversations();
                }
              }}
            >
              <RotateCcw size={11} />
              {language === 'hi' ? 'सभी बातचीत मिटाएं' : 'Clear All Conversations'}
            </Button>
          )}
        </div>
      </aside>

      {/* ── Main Panel ─────────────────────────────────────────── */}
      <div className="flex-1 w-full min-w-0 space-y-5">

        {/* Active Conversation Header Bar */}
        <Card className="p-4 border-zinc-200/80 bg-white shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-zinc-900" />
            </div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitleText}
                  onChange={e => setEditTitleText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                  className="h-8 px-2 text-sm font-bold border border-zinc-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 flex-1"
                  autoFocus
                />
                <Button size="sm" className="h-8 px-2 bg-zinc-900 hover:bg-zinc-800 text-white" onClick={handleSaveTitle}>
                  <Check size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-sm font-bold text-zinc-900 truncate">
                  {activeConversation?.title || 'Chat Session'}
                </h3>
                <Button
                  size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 shrink-0"
                  onClick={() => {
                    setEditTitleText(activeConversation?.title || '');
                    setIsEditingTitle(true);
                  }}
                  title="Rename Chat Session"
                >
                  <Edit2 size={12} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold border-zinc-300 text-zinc-700">
              {activeConversation?.messages?.length || 0} {language === 'hi' ? 'संदेश' : 'messages'}
            </Badge>
            {(conversations || []).length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 px-2"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  deleteConversation(activeConvId);
                }}
              >
                <Trash2 size={12} />
                <span className="hidden sm:inline">{language === 'hi' ? 'हटाएं' : 'Delete'}</span>
              </Button>
            )}
          </div>
        </Card>

        {/* ── TOP VOICE QUERY HERO CARD ──────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-xl shadow-zinc-950/20 p-6 sm:p-8">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-zinc-800/40 pointer-events-none blur-3xl" />

          <div className="relative z-10 text-center">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold mb-5 backdrop-blur-sm shadow-inner">
              {appState === 'IDLE'      && !isSpeaking && <><Sparkles size={12} className="text-zinc-400" /> {language === 'hi' ? 'तैयार है (Ready)' : 'Ready for Voice Query'}</>}
              {appState === 'LISTENING' && <><Mic size={12} className="text-red-400 animate-pulse" /> {language === 'hi' ? 'सुन रहे हैं…' : 'Listening…'}</>}
              {appState === 'THINKING'  && <><RefreshCw size={12} className="animate-spin text-zinc-400" /> {language === 'hi' ? 'उत्तर तैयार हो रहा है…' : 'AI Processing…'}</>}
              {isSpeaking               && <><Volume2 size={12} className="text-emerald-400 animate-bounce" /> {language === 'hi' ? 'ऑडियो चल रहा है…' : 'AI Speaking…'}</>}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              {activeConversation?.messages?.length > 0
                ? (language === 'hi' ? 'अगला सवाल पूछें' : 'Ask Next Question')
                : (language === 'hi' ? 'बोलकर सवाल पूछें' : 'Ask with Your Voice')}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
              {language === 'hi'
                ? 'मंडी भाव, सरकारी योजनाएं, फसल सलाह — अपनी भाषा में'
                : 'Mandi rates, government schemes, crop advisory in your local dialect'}
            </p>

            {/* Mic Button & Quick Action Controls */}
            <div className="flex flex-col items-center justify-center gap-3 mb-6">
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
                    'mic-btn-mono',
                    appState === 'LISTENING'  && 'listening',
                    isSpeaking                && 'speaking',
                    isProcessing              && 'processing'
                  )}
                  aria-label={appState === 'LISTENING' ? 'Stop listening' : 'Start listening'}
                >
                  {isSpeaking ? (
                    <div className="waveform text-white">
                      {[...Array(5)].map((_, i) => <div key={i} className="waveform-bar" />)}
                    </div>
                  ) : isProcessing ? (
                    <RefreshCw size={30} className="animate-spin text-white" />
                  ) : appState === 'LISTENING' ? (
                    <MicOff size={30} className="text-white" />
                  ) : (
                    <Mic size={30} className="text-white" />
                  )}
                </button>
              </div>

              {/* Stop AI Voice Button */}
              {isSpeaking && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopSpeaking}
                  className="gap-2 font-bold rounded-full px-5 text-xs shadow-md"
                >
                  <VolumeX size={14} />
                  {language === 'hi' ? 'आवाज़ बंद करें (Stop Voice)' : 'Stop AI Voice Output'}
                </Button>
              )}
            </div>

            {/* Live transcript */}
            {transcript && (
              <p className="text-zinc-200 text-sm font-semibold italic mb-4 animate-pulse px-4 max-w-md mx-auto bg-zinc-900/80 py-2 rounded-xl border border-zinc-800">
                "{transcript}"
              </p>
            )}

            {/* Typed Text Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (typedQuery.trim() && !isProcessing) {
                  handleProcessQuery(typedQuery);
                  setTypedQuery('');
                }
              }}
              className="flex items-center gap-2 max-w-lg mx-auto mb-6"
            >
              <input
                type="text"
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                placeholder={language === 'hi' ? 'यहाँ अपना सवाल लिखें (Type question here)...' : 'Type your question here...'}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 backdrop-blur-sm transition-all"
              />
              <Button
                type="submit"
                disabled={isProcessing || !typedQuery.trim()}
                className="rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2.5 text-xs gap-1.5 shrink-0 transition-all disabled:opacity-50"
              >
                <Send size={13} />
                {language === 'hi' ? 'भेजें' : 'Send'}
              </Button>
            </form>

            {/* Demo Presets */}
            <div className="border-t border-zinc-800/80 pt-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                {language === 'hi' ? 'त्वरित उदाहरण' : 'Quick Preset Examples'}
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all disabled:opacity-40"
                    >
                      <Icon size={12} className="text-zinc-400" />
                      {language === 'hi' ? p.label_hi : p.label_en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton while processing */}
        {isProcessing && <SkeletonCard />}

        {/* ── Distress Prediction Module Card ── */}
        <div className="mb-4">
          <DistressCard cropType="wheat" cropStage="vegetative" daysToLoanDue={15} />
        </div>

        {/* ── BOTTOM CONVERSATION MESSAGE HISTORY THREAD ────────────── */}
        {activeConversation?.messages?.length > 0 && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} />
                {language === 'hi' ? 'बातचीत इतिहास (Message History)' : 'Conversation Messages'}
              </p>
            </div>

            {activeConversation.messages.map((msg, idx) => {
              const msgId = msg._id || msg.id || idx;
              const isDetailedOpen = !!showDetailedMap[msgId];

              return (
                <div key={msgId} className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {/* User Query Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-xl bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-xs shadow-sm space-y-1">
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 font-bold">
                        <span className="flex items-center gap-1">
                          <User size={10} /> {language === 'hi' ? 'आप (किसान)' : 'You'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed">
                        "{msg.transcribedText}"
                      </p>
                    </div>
                  </div>

                  {/* AI Response Card */}
                  <Card className="response-card overflow-hidden border-zinc-200 bg-white shadow-md">
                    {/* Header strip */}
                    <div className={cn(
                      'px-5 sm:px-7 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b text-xs',
                      msg.isHighStakes ? 'bg-amber-50/80 border-amber-200' : 'bg-zinc-50 border-zinc-200'
                    )}>
                      <div className="flex items-center gap-2">
                        {msg.isHighStakes
                          ? <AlertTriangle size={14} className="text-amber-700" />
                          : <CheckCircle2 size={14} className="text-zinc-800" />
                        }
                        <span className={cn('font-bold uppercase tracking-wider text-[11px]',
                          msg.isHighStakes ? 'text-amber-800' : 'text-zinc-800'
                        )}>
                          {msg.isHighStakes
                            ? (language === 'hi' ? 'समीक्षा आवश्यक' : 'Needs Review')
                            : (language === 'hi' ? 'स्वत: सत्यापित' : 'Auto Verified')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ConfidenceBadge level={msg.confidence} />
                        {msg.domain && (
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-zinc-300 text-zinc-700">
                            {msg.domain.replace('_', ' ')}
                          </Badge>
                        )}
                        {/* Convenience: Delete single message turn button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon" variant="ghost"
                              className="h-6 w-6 text-zinc-400 hover:text-red-600 ml-1"
                              onClick={() => {
                                if (isSpeaking) stopSpeaking();
                                deleteMessageFromActiveConv(msgId);
                              }}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{language === 'hi' ? 'यह संदेश हटाएं' : 'Delete message'}</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <CardContent className="p-5 sm:p-7 space-y-4">
                      {/* Short Answer */}
                      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap size={11} className="text-zinc-800" />
                            {language === 'hi' ? 'त्वरित उत्तर' : 'Quick Answer'}
                          </p>
                          <Button
                            size="sm"
                            variant={isSpeaking ? 'destructive' : 'default'}
                            className="h-7 text-xs gap-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white"
                            onClick={() => handlePlayTTS(primaryAnswer(msg))}
                          >
                            {isSpeaking
                              ? <><VolumeX size={12} /> {language === 'hi' ? 'रोकें' : 'Stop'}</>
                              : <><Volume2 size={12} /> {language === 'hi' ? 'सुनें' : 'Play'}</>}
                          </Button>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                          {primaryAnswer(msg)}
                        </p>
                        {msg.shortAnswerEn && msg.shortAnswerHi && (
                          <p className="text-xs text-zinc-500 italic">
                            {dialect !== 'en' ? `EN: ${msg.shortAnswerEn}` : `HI: ${msg.shortAnswerHi}`}
                          </p>
                        )}
                      </div>

                      {/* Detailed Answer Accordion */}
                      {detailedAnswer(msg) && detailedAnswer(msg) !== primaryAnswer(msg) && (
                        <div className="border border-zinc-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleDetailed(msgId)}
                            className="w-full flex items-center justify-between px-5 py-2.5 bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs font-semibold text-zinc-900"
                          >
                            <span className="flex items-center gap-2 text-zinc-600">
                              <MessageSquare size={13} />
                              {language === 'hi' ? 'विस्तृत उत्तर देखें' : 'View Detailed Answer'}
                            </span>
                            {isDetailedOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                          {isDetailedOpen && (
                            <div className="p-4 border-t border-zinc-200 space-y-3 bg-white">
                              <p className="text-sm text-zinc-800 leading-relaxed">
                                {detailedAnswer(msg)}
                              </p>
                              <Button
                                size="sm" variant={isSpeaking ? 'destructive' : 'outline'} className="h-7 text-xs gap-1.5 px-3 border-zinc-300"
                                onClick={() => handlePlayTTS(detailedAnswer(msg))}
                              >
                                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                {language === 'hi' ? 'विस्तृत सुनें' : 'Play Detailed'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* High-stakes Warning */}
                      {msg.isHighStakes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                            <ShieldAlert size={15} className="text-amber-700 shrink-0" />
                            {language === 'hi' ? 'मानव सत्यापन आवश्यक है' : 'Human Verification Required'}
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed">{msg.trustNote}</p>
                        </div>
                      )}

                      {/* Actionable steps */}
                      {msg.actionableSteps?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {language === 'hi' ? 'अनुशंसित कदम' : 'Recommended Steps'}
                          </p>
                          <div className="space-y-1.5">
                            {msg.actionableSteps.map((step, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                                <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <p className="text-zinc-800 font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {msg.followUpQuestions?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {language === 'hi' ? 'आगे पूछें' : 'Follow-up Questions'}
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {msg.followUpQuestions.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => handleProcessQuery(q)}
                                disabled={isProcessing}
                                className="text-left flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-900 transition-all disabled:opacity-50"
                              >
                                <ArrowRight size={12} className="shrink-0 text-zinc-600" />
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Skeleton while thinking */}
        {isProcessing && <SkeletonCard />}
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
