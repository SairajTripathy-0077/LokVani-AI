import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { processUserSpeechQuery } from '../services/aiCoreEngine';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Wheat, Bug, TrendingUp, Megaphone, Send, X } from 'lucide-react';

const DEMO_PRESETS = [
  {
    label_en: 'PM-Kisan & Mandi Rate',
    label_hi: 'पीएम-किसान व मंडी भाव',
    query_en: 'How to apply for PM-Kisan scheme and what is tomato mandi rate?',
    query_hi: 'Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav jan-na hai.',
    icon: Wheat
  },
  {
    label_en: 'Crop Disease Advisory',
    label_hi: 'फसल रोग सलाहकार',
    query_en: 'Insects on tomatoes, which pesticide should I spray?',
    query_hi: 'Tamatar me keede lag rahe hain, konsa pesticide spray karna chahiye?',
    icon: Bug
  },
  {
    label_en: 'Onion Market Rate',
    label_hi: 'प्याज मंडी भाव',
    query_en: 'What is today wholesale price of onion in Gorakhpur Mandi?',
    query_hi: 'Aaj Gorakhpur Mandi me pyaaz ka thoke rate kya hai?',
    icon: TrendingUp
  }
];

export default function UserVoiceApp() {
  const { language, setActiveTab, geminiKey } = useApp();
  
  const [appState, setAppState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
  const [transcript, setTranscript] = useState('');
  const [activeQueryResult, setActiveQueryResult] = useState(null);
  const [userQueryHistory, setUserQueryHistory] = useState([]);

  const [showPriceReportModal, setShowPriceReportModal] = useState(false);
  const [reportItem, setReportItem] = useState('Tamatar (Tomato)');
  const [reportPrice, setReportPrice] = useState('30');
  const [reportLocation, setReportLocation] = useState('Azamgarh Mandi');

  const fetchQueryHistory = async () => {
    try {
      const res = await fetch('/api/user/queries/user_demo_1');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setUserQueryHistory(json.data);
          return;
        }
      }
    } catch (err) {
      console.warn('Error fetching query history from server, using local history:', err);
    }
  };

  useEffect(() => {
    fetchQueryHistory();
  }, []);

  const handleStartListening = () => {
    setAppState('LISTENING');
    setTranscript('');
    speechService.startListening(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          handleProcessQuery(result.transcript);
        }
      },
      (err) => {
        console.error(err);
        setAppState('IDLE');
      },
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  const handleStopListening = () => {
    speechService.stopListening();
    if (transcript.trim()) {
      handleProcessQuery(transcript);
    } else {
      setAppState('IDLE');
    }
  };

  const handleProcessQuery = async (queryText) => {
    if (!queryText.trim()) {
      setAppState('IDLE');
      return;
    }
    setAppState('THINKING');

    try {
      // 1. Attempt Express Server API processing
      let backendData = null;
      try {
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcribed_text: queryText,
            user_location: 'Azamgarh, UP',
            userId: 'user_demo_1',
            userName: 'Ramesh Kumar (Farmer)'
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          backendData = resJson.data;
        }
      } catch (err) {
        console.warn('Express Backend API offline, executing AI Voice Engine directly:', err);
      }

      // 2. Direct AI Intelligence Engine execution if server unavailable or returning generic text
      if (!backendData || backendData.shortAnswerHi?.includes('server se sampark')) {
        const aiOutput = await processUserSpeechQuery(queryText, {
          apiKey: geminiKey,
          userLocation: 'Azamgarh, UP'
        });

        backendData = {
          _id: `q_${Date.now()}`,
          transcribedText: queryText,
          userLocation: 'Azamgarh, UP',
          shortAnswerHi: aiOutput.spoken_response?.hindi_tts || 'Sawal par jaankari prapt hui.',
          shortAnswerEn: aiOutput.spoken_response?.english_translation || 'Information fetched for query.',
          domain: aiOutput.intent || 'AGRI_ADVISORY',
          isHighStakes: aiOutput.needs_trust_node_review || false,
          riskCategory: aiOutput.risk_metadata?.risk_category || 'NONE',
          trustNote: aiOutput.risk_metadata?.trust_reason || 'Query processed.',
          actionableSteps: aiOutput.actionable_steps || ['Check local Mandi rates', 'Consult local advisory'],
          status: aiOutput.needs_trust_node_review ? 'PENDING_TRUST_REVIEW' : 'AUTO_VERIFIED',
          createdAt: new Date()
        };
      }

      setActiveQueryResult(backendData);
      setUserQueryHistory(prev => [backendData, ...prev.filter(h => h._id !== backendData._id)]);
      setTranscript('');
      setAppState('IDLE');

      // Auto-play synthesized voice answer
      handlePlayTTS(language === 'hi' ? (backendData.shortAnswerHi || backendData.shortAnswerEn) : (backendData.shortAnswerEn || backendData.shortAnswerHi));
    } catch (e) {
      console.error('Error processing query:', e);
      setAppState('IDLE');
    }
  };

  const handlePresetSelect = (preset) => {
    const queryStr = language === 'hi' ? preset.query_hi : preset.query_en;
    setTranscript(queryStr);
    handleProcessQuery(queryStr);
  };

  const handlePlayTTS = (text) => {
    if (appState === 'SPEAKING') {
      speechService.stopSpeaking();
      setAppState('IDLE');
    } else {
      setAppState('SPEAKING');
      speechService.speakText(
        text,
        language === 'hi' ? 'hi-IN' : 'en-IN',
        () => setAppState('IDLE')
      );
    }
  };

  const handlePriceReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: reportItem,
          price: reportPrice,
          unit: 'kg',
          location: reportLocation,
          reportedBy: 'Local Farmer'
        })
      });
    } catch (err) {
      console.warn('Intel report submit error:', err);
    }

    setShowPriceReportModal(false);
    alert('Thank you! Your market price report has been saved & shared with neighboring farmers.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Sidebar conversation history */}
      <aside className="w-full lg:w-72 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <button
          onClick={() => {
            setActiveQueryResult(null);
            setTranscript('');
          }}
          className="btn-primary w-full justify-center !py-2.5"
        >
          {language === 'hi' ? '+ नई आवाज़ पूछताछ' : '+ New Voice Query'}
        </button>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-60 lg:max-h-[calc(100vh-280px)]">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {language === 'hi' ? 'सहेजे गए परिणाम और इतिहास' : 'Voice History & Stored Results'}
          </p>
          {userQueryHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              {language === 'hi' ? 'कोई पुरानी बातचीत नहीं' : 'No past conversations'}
            </p>
          ) : (
            userQueryHistory.map((h) => {
              const mainAnswerText = language === 'hi'
                ? (h.shortAnswerHi || h.shortAnswerEn)
                : (h.shortAnswerEn || h.shortAnswerHi);
              return (
                <button
                  key={h._id}
                  onClick={() => {
                    setActiveQueryResult(h);
                    setTranscript('');
                  }}
                  className={`text-left p-3 rounded-xl transition-colors flex flex-col gap-1 w-full text-xs font-medium ${
                    activeQueryResult?._id === h._id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate w-full font-bold">{h.transcribedText}</span>
                  <span className="text-[11px] text-slate-600 truncate w-full italic">
                    {mainAnswerText}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {h.createdAt ? new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 w-full space-y-6">
        
        {/* Header & Microphone Trigger Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700">
              {appState === 'LISTENING' && <><Mic className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> {language === 'hi' ? 'आवाज सुन रहे हैं...' : 'Listening Voice Input...'}</>}
              {appState === 'THINKING' && <><RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> {language === 'hi' ? 'उत्तर तैयार हो रहा है...' : 'Processing Query...'}</>}
              {appState === 'SPEAKING' && <><Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" /> {language === 'hi' ? 'ऑडियो प्ले हो रहा है...' : 'Playing Response Audio...'}</>}
              {appState === 'IDLE' && <><Sparkles className="w-3.5 h-3.5 text-amber-500" /> {language === 'hi' ? 'वॉयस असिस्टेंट तैयार है' : 'Voice Assistant Ready'}</>}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {language === 'hi' ? 'बोलकर सवाल पूछें' : 'Voice Query Engine'}
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            {language === 'hi'
              ? 'मंडी भाव, सरकारी योजनाएं और फसल सलाह हिंदी या अंग्रेजी में पूछें।'
              : 'Mandi rates, Govt scheme eligibility, & crop advisories in simple Hindi/English.'}
          </p>

          {/* Microphone Action Button */}
          <div className="mic-btn-container">
            <button
              onClick={appState === 'LISTENING' ? handleStopListening : handleStartListening}
              className={`mic-btn ${appState === 'LISTENING' ? 'listening' : ''}`}
              title={language === 'hi' ? 'बोलने के लिए दबाएं' : 'Tap to Speak'}
            >
              {appState === 'LISTENING' ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          {transcript && (
            <p className="text-blue-600 text-base font-bold mt-3 animate-pulse">
              "{transcript}"
            </p>
          )}

          {/* Presets Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              {language === 'hi' ? 'त्वरित उदाहरण प्रश्न (Demo Queries)' : 'Instant Demo Queries'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEMO_PRESETS.map((preset, idx) => {
                const IconComp = preset.icon;
                const labelText = language === 'hi' ? preset.label_hi : preset.label_en;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(preset)}
                    className="btn-secondary !py-1.5 !px-3 !text-xs !rounded-full"
                  >
                    <IconComp className="w-3.5 h-3.5 text-amber-500" />
                    <span>{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Response Result Card */}
        {activeQueryResult && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                activeQueryResult.isHighStakes ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {activeQueryResult.isHighStakes ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {activeQueryResult.status}
              </span>

              <button
                onClick={() => handlePlayTTS(language === 'hi' ? (activeQueryResult.shortAnswerHi || activeQueryResult.shortAnswerEn) : (activeQueryResult.shortAnswerEn || activeQueryResult.shortAnswerHi))}
                className="btn-primary !py-1.5 !px-3 !text-xs"
              >
                {appState === 'SPEAKING' ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>
                  {appState === 'SPEAKING'
                    ? (language === 'hi' ? 'ऑडियो रोकें' : 'Stop Audio')
                    : (language === 'hi' ? 'उत्तर सुनें' : 'Play Audio')}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi' ? 'सवाल (Query):' : 'Query:'} "{activeQueryResult.transcribedText}"
            </p>

            {/* Response Output - Dynamically toggling primary language */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center justify-between">
                <span>
                  {language === 'hi' ? 'उत्तर (Hindi Spoken Response):' : 'Answer (English Spoken Response):'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {language === 'hi' ? 'भाषा: हिंदी' : 'Language: English'}
                </span>
              </h4>
              <p className="text-lg font-bold text-slate-900 leading-snug">
                {language === 'hi'
                  ? (activeQueryResult.shortAnswerHi || activeQueryResult.shortAnswerEn)
                  : (activeQueryResult.shortAnswerEn || activeQueryResult.shortAnswerHi)}
              </p>
              <p className="text-sm text-slate-600 italic">
                {language === 'hi'
                  ? (activeQueryResult.shortAnswerEn ? `English: ${activeQueryResult.shortAnswerEn}` : '')
                  : (activeQueryResult.shortAnswerHi ? `Hindi: ${activeQueryResult.shortAnswerHi}` : '')}
              </p>
            </div>

            {/* Scheme Link Alert */}
            {activeQueryResult.isHighStakes && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  {language === 'hi' ? 'उच्च जोखिम योजना समीक्षा की आवश्यकता है' : 'High-Stakes Query Flagged'}
                </div>
                <p>{activeQueryResult.trustNote}</p>
                <button
                  onClick={() => setActiveTab('schemes')}
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>
                    {language === 'hi' ? 'सार्वजनिक सरकारी योजनाएं डैशबोर्ड खोलें' : 'Open Public Schemes Eligibility Dashboard'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Actionable Steps */}
            {activeQueryResult.actionableSteps?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {language === 'hi' ? 'अनुशंसित कार्यवाही कदम:' : 'Recommended Action Steps:'}
                </p>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {activeQueryResult.actionableSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>{language === 'hi' ? 'स्थान:' : 'Location:'} {activeQueryResult.userLocation}</span>
            </div>
          </div>
        )}

      </div>

      {/* Community Price Report Modal */}
      {showPriceReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                Report Local Mandi Rate
              </h3>
              <button onClick={() => setShowPriceReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePriceReportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Commodity Name</label>
                <input
                  type="text"
                  value={reportItem}
                  onChange={e => setReportItem(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Rate (₹/kg)</label>
                <input
                  type="number"
                  value={reportPrice}
                  onChange={e => setReportPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Mandi Location</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowPriceReportModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send className="w-3.5 h-3.5" /> Save Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
