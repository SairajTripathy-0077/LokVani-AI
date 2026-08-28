import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useDistressScore } from '../hooks/useDistressScore';
import { speechService } from '../services/speechService';
import { AlertTriangle, ShieldAlert, Volume2, VolumeX, CheckCircle, Info, Sparkles, TrendingDown, CloudRain, Calendar } from 'lucide-react';

export default function DistressCard({ cropType = 'wheat', cropStage = 'vegetative', daysToLoanDue = 15, conversationMessages = [] }) {
  const { language } = useApp();
  const distressData = useDistressScore({ cropType, cropStage, daysToLoanDue, conversationMessages });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.onSpeakingStateChange((isSpeaking) => {
      setIsPlayingAudio(isSpeaking);
    });
    return () => unsubscribe();
  }, []);

  if (!distressData.isEnabled) return null;

  if (!distressData.isAvailable) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-500 text-sm flex items-center gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
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
      return;
    }

    const textToRead = language === 'hi'
      ? `कृषि और वित्तीय संकट पूर्वाभास सूचकांक: स्कोर ${score}। ${spokenReasons ? spokenReasons.join('. ') : ''}। सलाह: ${advisory.hi}`
      : `Crop and Financial Distress Risk Index score is ${score} out of 100. ${spokenReasons ? spokenReasons.join('. ') : ''}. Advisory: ${advisory.en}`;

    speechService.speak(textToRead, language === 'hi' ? 'hi-IN' : 'en-US');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 border border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-300">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isUrgent ? 'bg-red-50 text-red-700 border-red-200' :
            isAdvisory ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {isUrgent ? <ShieldAlert className="w-5 h-5 text-red-700" /> : <AlertTriangle className="w-5 h-5 text-amber-700" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {language === 'hi' ? 'कृषि एवं वित्तीय संकट पूर्वाभास' : 'Crop & Financial Distress Risk'}
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-wider">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi' ? `फसल: ${distressData.cropType || cropType} (${cropStage})` : `Crop: ${distressData.cropType || cropType} (${cropStage})`}
            </p>
          </div>
        </div>

        {/* Tier badge */}
        <div className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 border ${
          isUrgent ? 'bg-red-50 text-red-700 border-red-200' :
          isAdvisory ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-600' : isAdvisory ? 'bg-amber-600' : 'bg-emerald-600'}`} />
          {isUrgent ? (language === 'hi' ? 'उच्च जोखिम (URGENT)' : 'URGENT RISK') :
           isAdvisory ? (language === 'hi' ? 'सलाह (ADVISORY)' : 'ADVISORY') :
           (language === 'hi' ? 'सामान्य (NORMAL)' : 'NORMAL')}
        </div>
      </div>

      {/* Distress Score Progress Bar */}
      <div className="my-5">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-500 font-bold">{language === 'hi' ? 'संकट सूचकांक स्कोर:' : 'Distress Index Score:'}</span>
          <span className="font-extrabold text-slate-900">
            {score} / 100
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isUrgent ? 'bg-red-600' :
              isAdvisory ? 'bg-amber-600' :
              'bg-emerald-600'
            }`}
            style={{ width: `${Math.max(score, 5)}%` }}
          />
        </div>
      </div>

      {/* Spoken Farmer Reasons */}
      {spokenReasons && spokenReasons.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-900" />
            {language === 'hi' ? 'मुख्य कारण (किसान सरल भाषा):' : 'Key Contributing Factors:'}
          </p>
          <ul className="space-y-1.5">
            {spokenReasons.map((reason, idx) => (
              <li key={idx} className="text-xs text-slate-800 font-medium flex items-start gap-2">
                <span className="text-slate-900 font-bold mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Guidance Snippet */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'hi' ? 'ICAR प्रमाणित सलाह:' : 'ICAR Recommended Action:'}
            </span>
          </div>
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm ${
              isPlayingAudio
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? (language === 'hi' ? 'आवाज़ रोकें' : 'Stop') : (language === 'hi' ? 'सलाह सुनें' : 'Listen')}</span>
          </button>
        </div>
        <p className="text-xs text-slate-800 leading-relaxed font-semibold">
          {language === 'hi' ? advisory.hi : advisory.en}
        </p>
      </div>

      {/* Kirana Trust Node Review Banner for URGENT tier */}
      {isUrgent && (
        <div className="mt-3 pt-3 border-t border-red-200 flex items-center justify-between text-xs text-red-800 bg-red-50 px-3 py-2 rounded-lg border border-red-200 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{language === 'hi' ? 'किराना ट्रस्ट नोड सत्यापन के लिए भेजा गया' : 'Flagged to Kirana Trust Node for Human-in-Loop Verification'}</span>
          </div>
          <span className="text-[10px] bg-red-100 px-2 py-0.5 rounded text-red-800 font-mono font-bold">
            PENDING_REVIEW
          </span>
        </div>
      )}
    </div>
  );
}
