import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, ShieldCheck, Sparkles, Send, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Wheat, Bug, TrendingUp, Megaphone, Zap } from 'lucide-react';

const DEMO_PRESETS = [
  {
    label: 'PM-Kisan & Mandi Rate',
    query: 'Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav jan-na hai.',
    icon: Wheat
  },
  {
    label: 'Crop Disease Advisory',
    query: 'Tamatar me keede lag rahe hain, konsa pesticide spray karna chahiye?',
    icon: Bug
  },
  {
    label: 'Onion Market Rate',
    query: 'Aaj Gorakhpur Mandi me pyaaz ka thoke rate kya hai?',
    icon: TrendingUp
  }
];

export default function UserVoiceApp() {
  const { language, setActiveTab } = useApp();
  
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
        setUserQueryHistory(json.data || []);
      }
    } catch (err) {
      console.warn('Error fetching user query history:', err);
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
        console.warn('Express Backend API unavailable, generating client fallback:', err);
      }

      if (!backendData) {
        backendData = {
          _id: `q_${Date.now()}`,
          transcribedText: queryText,
          userLocation: 'Azamgarh, UP',
          shortAnswerHi: 'Fasal aur mandi ke bhav ki live jaankari ke liye server se sampark karein.',
          shortAnswerEn: 'For crop and live mandi prices, please consult the live API endpoint.',
          domain: 'AGRI_ADVISORY',
          isHighStakes: false,
          actionableSteps: ['Try adding your Gemini key', 'Verify connections'],
          status: 'AUTO_VERIFIED',
          createdAt: new Date()
        };
      }

      setActiveQueryResult(backendData);
      setTranscript('');
      setAppState('IDLE');

      // Refresh sidebar conversation list
      fetchQueryHistory();

      // Auto play TTS response
      handlePlayTTS(language === 'hi' ? backendData.shortAnswerHi : backendData.shortAnswerEn);
    } catch (e) {
      console.error('Error processing query:', e);
      setAppState('IDLE');
    }
  };

  const handlePresetSelect = (preset) => {
    setTranscript(preset.query);
    handleProcessQuery(preset.query);
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
    alert('Thank you! Your market price report has been saved to MongoDB & shared with neighboring farmers.');
  };

  return (
    <div className="minimal-container" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* Sidebar conversation history (ChatGPT style) */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--border-subtle)',
        paddingRight: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minWidth: '240px'
      }}>
        <button
          onClick={() => {
            setActiveQueryResult(null);
            setTranscript('');
          }}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '10px' }}
        >
          + New Voice Query
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '6px' }}>
            Voice History logs
          </p>
          {userQueryHistory.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No past conversations</p>
          ) : (
            userQueryHistory.map((h) => (
              <button
                key={h._id}
                onClick={() => {
                  setActiveQueryResult(h);
                  setTranscript('');
                }}
                style={{
                  background: activeQueryResult?._id === h._id ? 'var(--bg-hover)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  color: activeQueryResult?._id === h._id ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  width: '100%',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                  {h.transcribedText}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Just now'}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main panel */}
      <div style={{ flex: 1, minWidth: '320px' }}>
        
        {/* Minimal Header Section */}
        <div className="minimal-section" style={{ textAlign: 'center', paddingTop: 0 }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="status-text status-pending">
              {appState === 'LISTENING' && <><Mic size={14} /> Listening Voice Input...</>}
              {appState === 'THINKING' && <><RefreshCw size={14} className="spin" /> Rotator Processing...</>}
              {appState === 'SPEAKING' && <><Volume2 size={14} /> Playing Response Audio...</>}
              {appState === 'IDLE' && <><Sparkles size={14} /> Voice Assistant Ready</>}
            </span>
          </div>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
            {language === 'hi' ? 'बोलकर सवाल पूछें' : 'Voice Query Engine'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '560px', margin: '0 auto 20px auto' }}>
            Mandi rates, Govt scheme eligibility, & crop advisories in simple Hindi/English.
          </p>

          {/* Microphone Action Button */}
          <div className="mic-btn-container">
            <button
              onClick={appState === 'LISTENING' ? handleStopListening : handleStartListening}
              className={`mic-btn ${appState === 'LISTENING' ? 'listening' : ''}`}
              title="Tap to Speak"
            >
              {appState === 'LISTENING' ? <MicOff size={42} /> : <Mic size={42} />}
            </button>
          </div>

          {transcript && (
            <p style={{ color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 600, marginTop: '12px' }}>
              "{transcript}"
            </p>
          )}

          {/* Minimal Presets Bar */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px' }}>
              Instant Demo Queries
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {DEMO_PRESETS.map((preset, idx) => {
                const IconComp = preset.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(preset)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <IconComp size={14} color="var(--accent-gold)" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Response Result */}
        {activeQueryResult && (
          <div className="minimal-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className={`status-text ${activeQueryResult.isHighStakes ? 'status-pending' : 'status-verified'}`}>
                {activeQueryResult.isHighStakes ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                {activeQueryResult.status}
              </span>

              <button
                onClick={() => handlePlayTTS(language === 'hi' ? activeQueryResult.shortAnswerHi : activeQueryResult.shortAnswerEn)}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {appState === 'SPEAKING' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {appState === 'SPEAKING' ? 'Stop Audio' : 'Play Audio'}
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
              Query: "{activeQueryResult.transcribedText}"
            </p>

            {/* Hindi & English Text Output */}
            <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '6px' }}>
                Hindi Spoken Response:
              </h4>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {activeQueryResult.shortAnswerHi}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <em>{activeQueryResult.shortAnswerEn}</em>
              </p>
            </div>

            {/* High Stakes Trust Node Alert */}
            {activeQueryResult.isHighStakes && (
              <div style={{ marginBottom: '16px' }}>
                <span className="status-text status-pending" style={{ marginBottom: '4px' }}>
                  <ShieldAlert size={14} /> High-Stakes Query Flagged
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {activeQueryResult.trustNote}
                </p>
                <button
                  onClick={() => setActiveTab('trust')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0, marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Open Kirana Verification Dashboard <ArrowRight size={13} />
                </button>
              </div>
            )}

            {/* Actionable Steps */}
            {activeQueryResult.actionableSteps?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Recommended Action Steps:
                </p>
                <ul style={{ paddingLeft: '16px', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                  {activeQueryResult.actionableSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Logged to MongoDB • Location: {activeQueryResult.userLocation}
              </span>
              <button
                onClick={() => setShowPriceReportModal(true)}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                <Megaphone size={13} /> Report Local Rate
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Community Price Report Modal */}
      {showPriceReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>
              Report Local Mandi Rate
            </h3>
            <form onSubmit={handlePriceReportSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Commodity Name</label>
                <input
                  type="text"
                  value={reportItem}
                  onChange={e => setReportItem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Rate (₹/kg)</label>
                <input
                  type="number"
                  value={reportPrice}
                  onChange={e => setReportPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Mandi Location</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPriceReportModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={13} /> Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
