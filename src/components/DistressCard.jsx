import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDistressScore } from '../hooks/useDistressScore';
import { speechService } from '../services/speechService';
import { AlertTriangle, ShieldAlert, Volume2, VolumeX, CheckCircle, Info, Sparkles, TrendingDown, CloudRain, Calendar } from 'lucide-react';

export default function DistressCard({ cropType = 'wheat', cropStage = 'vegetative', daysToLoanDue = 15 }) {
  const { language } = useApp();
  const distressData = useDistressScore({ cropType, cropStage, daysToLoanDue });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!distressData.isEnabled) return null;

  if (!distressData.isAvailable) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md text-slate-400 text-sm flex items-center gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0" />
        <span>{language === 'hi' ? 'इस क्षेत्र के लिए संकट पूर्वानुमान डेटा सीमित है।' : 'Insufficient data for distress prediction in this region.'}</span>
      </div>
    );
  }

  const { score, tier, spokenReasons, advisory, inputs } = distressData;

  const isUrgent = tier === 'URGENT';
  const isAdvisory = tier === 'ADVISORY';

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = language === 'hi'
      ? `${spokenReasons.join('. ')}. सलाह: ${advisory.hi}`
      : `${spokenReasons.join('. ')}. Advisory: ${advisory.en}`;

    setIsPlayingAudio(true);
    speechService.speak(textToRead, language === 'hi' ? 'hi-IN' : 'en-US', () => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all duration-300 shadow-2xl ${
      isUrgent
        ? 'bg-gradient-to-br from-red-950/70 via-slate-900/90 to-slate-950/90 border-red-500/40 shadow-red-950/30'
        : isAdvisory
        ? 'bg-gradient-to-br from-amber-950/60 via-slate-900/90 to-slate-950/90 border-amber-500/40 shadow-amber-950/30'
        : 'bg-gradient-to-br from-emerald-950/50 via-slate-900/90 to-slate-950/90 border-emerald-500/30 shadow-emerald-950/20'
    }`}>
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            isAdvisory ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isUrgent ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                {language === 'hi' ? 'कृषि एवं वित्तीय संकट पूर्वाभास' : 'Crop & Financial Distress Risk'}
              </h3>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 tracking-wider">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'hi' ? `फसल: ${cropType} (${cropStage})` : `Crop: ${cropType} (${cropStage})`}
            </p>
          </div>
        </div>

        {/* Tier badge */}
        <div className={`px-3 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 border shadow-sm ${
          isUrgent ? 'bg-red-500/20 text-red-300 border-red-500/40' :
          isAdvisory ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-400 animate-ping' : isAdvisory ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          {isUrgent ? (language === 'hi' ? 'उच्च जोखिम (URGENT)' : 'URGENT RISK') :
           isAdvisory ? (language === 'hi' ? 'सलाह (ADVISORY)' : 'ADVISORY') :
           (language === 'hi' ? 'सामान्य (NORMAL)' : 'NORMAL')}
        </div>
      </div>

      {/* Distress Score Progress Bar */}
      <div className="my-5">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 font-medium">{language === 'hi' ? 'संकट सूचकांक स्कोर:' : 'Distress Index Score:'}</span>
          <span className={`font-bold ${isUrgent ? 'text-red-400' : isAdvisory ? 'text-amber-400' : 'text-emerald-400'}`}>
            {score} / 100
          </span>
        </div>
        <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isUrgent ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-lg shadow-red-500/50' :
              isAdvisory ? 'bg-gradient-to-r from-emerald-500 to-amber-500 shadow-lg shadow-amber-500/50' :
              'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
            style={{ width: `${Math.max(score, 5)}%` }}
          />
        </div>
      </div>

      {/* Spoken Farmer Reasons */}
      {spokenReasons && spokenReasons.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 mb-4 space-y-2">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            {language === 'hi' ? 'मुख्य कारण (किसान सरल भाषा):' : 'Key Contributing Factors:'}
          </p>
          <ul className="space-y-1.5">
            {spokenReasons.map((reason, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Guidance Snippet */}
      <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {language === 'hi' ? 'ICAR प्रमाणित सलाह:' : 'ICAR Recommended Action:'}
            </span>
          </div>
          <button
            onClick={handleReadAloud}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isPlayingAudio ? (language === 'hi' ? 'रोकें' : 'Stop') : (language === 'hi' ? 'सुनें' : 'Listen')}
          </button>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {language === 'hi' ? advisory.hi : advisory.en}
        </p>
      </div>

      {/* Kirana Trust Node Review Banner for URGENT tier */}
      {isUrgent && (
        <div className="mt-3 pt-3 border-t border-red-900/50 flex items-center justify-between text-xs text-red-300/90 bg-red-950/40 px-3 py-2 rounded-lg border border-red-900/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{language === 'hi' ? 'किराना ट्रस्ट नोड सत्यापन के लिए भेजा गया' : 'Flagged to Kirana Trust Node for Human-in-Loop Verification'}</span>
          </div>
          <span className="text-[10px] bg-red-900/60 px-2 py-0.5 rounded text-red-200 font-mono">
            PENDING_REVIEW
          </span>
        </div>
      )}
    </div>
  );
}
