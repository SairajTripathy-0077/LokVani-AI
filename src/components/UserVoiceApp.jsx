import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { processUserSpeechQuery } from '../services/aiCoreEngine';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, ShieldCheck, Sparkles, Send, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

const DEMO_PRESETS = [
  {
    label: 'PM-Kisan & Mandi Rate',
    query: 'Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav jan-na hai.',
    icon: '🌾'
  },
  {
    label: 'Crop Disease Advisory',
    query: 'Tamatar me keede lag rahe hain, konsa pesticide spray karna chahiye?',
    icon: '🐛'
  },
  {
    label: 'Onion Market Rate',
    query: 'Aaj Gorakhpur Mandi me pyaaz ka thoke rate kya hai?',
    icon: '🧅'
  }
];

export default function UserVoiceApp() {
  const { language, addQuery, queries, communityIntel, setActiveTab, geminiKey, addCommunityIntel } = useApp();
  
  // App States: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
  const [appState, setAppState] = useState('IDLE');
  const [transcript, setTranscript] = useState('');
  const [activeQueryResult, setActiveQueryResult] = useState(queries[0] || null);

  const [showPriceReportModal, setShowPriceReportModal] = useState(false);
  const [reportItem, setReportItem] = useState('Tamatar (Tomato)');
  const [reportPrice, setReportPrice] = useState('30');
  const [reportLocation, setReportLocation] = useState('Azamgarh Mandi');

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
      // Call AI Core Engine (Local/Backend API)
      const aiResponse = await processUserSpeechQuery(queryText, {
        userLocation: 'Azamgarh, UP',
        apiKey: geminiKey
      });

      const newQuery = {
        id: 'q-' + Date.now(),
        user: 'Ramesh Kumar (Small Farmer)',
        location: 'Azamgarh, UP',
        queryText,
        timestamp: 'Just now',
        domain: aiResponse.intent?.toUpperCase() || 'GENERAL',
        is_high_stakes: aiResponse.needs_trust_node_review,
        status: aiResponse.needs_trust_node_review ? 'PENDING_TRUST_REVIEW' : 'AUTO_VERIFIED',
        short_answer_hi: aiResponse.spoken_response?.hindi_tts || 'Jankari prapt ho gayi hai.',
        short_answer_en: aiResponse.spoken_response?.english_translation || 'Information retrieved.',
        risk_category: aiResponse.risk_metadata?.risk_category || 'NONE',
        trust_note: aiResponse.risk_metadata?.trust_reason || '',
        actionable_steps: aiResponse.actionable_steps || []
      };

      addQuery(newQuery);
      setActiveQueryResult(newQuery);

      // Speak TTS answer if auto-verified
      if (!aiResponse.needs_trust_node_review) {
        handlePlayTTS(aiResponse.spoken_response?.hindi_tts);
      } else {
        setAppState('IDLE');
      }
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

  const handlePriceReportSubmit = (e) => {
    e.preventDefault();
    addCommunityIntel(reportItem, reportPrice, 'kg', reportLocation, 'You (Farmer)');
    setShowPriceReportModal(false);
    alert('Thank you! Your market price report has been shared with neighboring farmers.');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 12px' }}>
      
      {/* Mobile-Optimized Voice Hero Banner */}
      <div className="glass-card glass-card-accent" style={{ padding: '24px 16px', textAlign: 'center', marginBottom: '20px' }}>
        
        {/* Animated State Pill Indicator */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            background: appState === 'LISTENING' ? 'rgba(239, 68, 68, 0.2)' : appState === 'THINKING' ? 'rgba(20, 184, 166, 0.2)' : appState === 'SPEAKING' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: appState === 'LISTENING' ? 'var(--accent-rose)' : appState === 'THINKING' ? 'var(--accent-teal)' : appState === 'SPEAKING' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            border: appState === 'LISTENING' ? '1px solid var(--accent-rose)' : appState === 'THINKING' ? '1px solid var(--accent-teal)' : appState === 'SPEAKING' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {appState === 'LISTENING' && <><span className="dot-ping" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'inline-block' }}></span> Listening (Hindi/English)...</>}
            {appState === 'THINKING' && <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking & Consulting Trust Node...</>}
            {appState === 'SPEAKING' && <><Volume2 size={14} /> Speaking Response Audio...</>}
            {appState === 'IDLE' && <>🎙️ Voice Assistant Ready</>}
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '6px' }}>
          {language === 'hi' ? 'बोलकर पूछें (Voice Search)' : 'Speak Your Query'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 auto 20px auto', maxWidth: '500px' }}>
          Mandi rates, Govt scheme eligibility, & crop advisory — 1 tap to speak.
        </p>

        {/* Large Mobile Touch Microphone Button */}
        <div style={{ marginBottom: '20px' }}>
          <div className="mic-btn-container">
            <button
              onClick={appState === 'LISTENING' ? handleStopListening : handleStartListening}
              className={`mic-btn ${appState === 'LISTENING' ? 'listening' : ''}`}
              style={{
                width: '120px',
                height: '120px',
                fontSize: '2.5rem'
              }}
              title="Tap to Speak"
            >
              {appState === 'LISTENING' ? <MicOff size={52} /> : <Mic size={52} />}
            </button>
          </div>

          {transcript && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'inline-block',
              maxWidth: '90%',
              fontSize: '0.95rem',
              color: 'var(--accent-teal)'
            }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Quick Presets Bar */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px' }}>
            ⚡ 1-Tap Pitch Presets
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Response Display Card */}
      {activeQueryResult && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: activeQueryResult.is_high_stakes ? '5px solid var(--accent-amber)' : '5px solid var(--accent-emerald)' }}>
          
          {/* Status Indicator Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              {activeQueryResult.status === 'VERIFIED_BY_TRUST_NODE' ? (
                <span className="badge badge-verified">
                  <ShieldCheck size={14} /> CONFIRMED BY KIRANA NODE
                </span>
              ) : activeQueryResult.status === 'PENDING_TRUST_REVIEW' ? (
                <span className="badge badge-pending">
                  <AlertTriangle size={14} /> UNDER KIRANA NODE REVIEW
                </span>
              ) : (
                <span className="badge badge-verified">
                  <CheckCircle2 size={14} /> AUTO-CONFIRMED RESPONSE
                </span>
              )}
            </div>

            <button
              onClick={() => handlePlayTTS(language === 'hi' ? activeQueryResult.short_answer_hi : activeQueryResult.short_answer_en)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {appState === 'SPEAKING' ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {appState === 'SPEAKING' ? 'Stop' : 'Listen Answer'}
            </button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            <strong>Query:</strong> "{activeQueryResult.queryText}"
          </p>

          {/* Hindi Main Spoken Text */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-glass)',
            marginBottom: '14px'
          }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '1rem', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Spoken Response (Hindi / English)
            </h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.4 }}>
              {activeQueryResult.short_answer_hi}
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              <em>{activeQueryResult.short_answer_en}</em>
            </p>
          </div>

          {/* High-Stakes Banner Notice */}
          {activeQueryResult.status === 'PENDING_TRUST_REVIEW' && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <ShieldAlert size={20} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--accent-amber)', fontSize: '0.88rem', display: 'block' }}>
                  Under Kirana Node Verification
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: '2px 0 6px 0' }}>
                  {activeQueryResult.trust_note || 'This high-stakes query is queued for local Kirana node verification.'}
                </p>
                <button
                  onClick={() => setActiveTab('trust')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Inspect in Kirana Operator Dashboard <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Action Checklist */}
          {activeQueryResult.actionable_steps?.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '6px' }}>Action Steps:</h5>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-main)', fontSize: '0.88rem', margin: 0 }}>
                {activeQueryResult.actionable_steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Location: {activeQueryResult.location}
            </span>
            <button
              onClick={() => setShowPriceReportModal(true)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              📢 Report Local Rate
            </button>
          </div>
        </div>
      )}

      {/* Community Price Report Modal */}
      {showPriceReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '20px', maxWidth: '400px', width: '92%' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>📢 Report Local Market Rate</h3>
            <form onSubmit={handlePriceReportSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Commodity</label>
                <input
                  type="text"
                  value={reportItem}
                  onChange={e => setReportItem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Price (₹/kg)</label>
                <input
                  type="number"
                  value={reportPrice}
                  onChange={e => setReportPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Mandi / Location</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPriceReportModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={14} /> Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
