import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { processUserSpeechQuery } from '../services/aiCoreEngine';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, ShieldCheck, Sparkles, Send, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Wheat, Bug, TrendingUp, Megaphone, Zap, Key } from 'lucide-react';

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
  const { language, addQuery, queries, communityIntel, setActiveTab, geminiKey, addCommunityIntel } = useApp();
  
  // App States: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
  const [appState, setAppState] = useState('IDLE');
  const [transcript, setTranscript] = useState('');
  const [activeQueryResult, setActiveQueryResult] = useState(null);

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
        actionable_steps: aiResponse.actionable_steps || [],
        engine_source: aiResponse.engine_source || 'LOCAL_NLP_ENGINE'
      };

      addQuery(newQuery);
      setActiveQueryResult(newQuery);

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Gemini API Key Alert Banner if empty */}
      {!geminiKey && (
        <div style={{
          background: 'var(--accent-blue-light)',
          border: '1px solid rgba(37, 99, 235, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '0.82rem',
          color: 'var(--accent-blue)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} /> <strong>Gemini API Key is empty.</strong> Add your free key in top header to enable live LLM generation.
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Using Offline Engine</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="ui-card ui-card-accent" style={{ padding: '28px 20px', textAlign: 'center', marginBottom: '24px' }}>
        
        {/* Status Indicator Bar */}
        <div style={{ marginBottom: '16px' }}>
          <span className={`status-tag ${appState === 'LISTENING' ? 'status-high-stakes' : appState === 'THINKING' ? 'status-blue' : appState === 'SPEAKING' ? 'status-verified' : 'status-verified'}`}>
            {appState === 'LISTENING' && <><Mic size={14} /> Listening (Hindi / English)...</>}
            {appState === 'THINKING' && <><RefreshCw size={14} className="spin" /> Processing & Checking Trust Node...</>}
            {appState === 'SPEAKING' && <><Volume2 size={14} /> Playing Spoken Audio Response...</>}
            {appState === 'IDLE' && <><Sparkles size={14} /> Voice Assistant Ready</>}
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '6px' }}>
          {language === 'hi' ? 'बोलकर सवाल पूछें' : 'Speak Your Query'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 auto 20px auto', maxWidth: '520px' }}>
          Mandi rates, Govt scheme eligibility, & crop advisories in simple Hindi/English.
        </p>

        {/* Square Touch Microphone Trigger */}
        <div style={{ marginBottom: '20px' }}>
          <div className="mic-btn-container">
            <button
              onClick={appState === 'LISTENING' ? handleStopListening : handleStartListening}
              className={`mic-btn ${appState === 'LISTENING' ? 'listening' : ''}`}
              title="Tap to Speak"
            >
              {appState === 'LISTENING' ? <MicOff size={48} /> : <Mic size={48} />}
            </button>
          </div>

          {transcript && (
            <div style={{
              marginTop: '16px',
              color: 'var(--accent-blue)',
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Quick Pitch Presets */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Zap size={13} color="var(--accent-emerald)" /> Instant Demo Presets
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {DEMO_PRESETS.map((preset, idx) => {
              const IconComp = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <IconComp size={14} color="var(--accent-emerald)" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Response Card */}
      {activeQueryResult && (
        <div className="ui-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: activeQueryResult.is_high_stakes ? '4px solid var(--accent-amber)' : '4px solid var(--accent-emerald)' }}>
          
          {/* Header Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeQueryResult.status === 'VERIFIED_BY_TRUST_NODE' ? (
                <span className="status-tag status-verified">
                  <ShieldCheck size={14} /> Confirmed by Kirana Node
                </span>
              ) : activeQueryResult.status === 'PENDING_TRUST_REVIEW' ? (
                <span className="status-tag status-pending">
                  <AlertTriangle size={14} /> Under Kirana Node Review
                </span>
              ) : (
                <span className="status-tag status-verified">
                  <CheckCircle2 size={14} /> Auto-Confirmed Response
                </span>
              )}

              {activeQueryResult.engine_source === 'GEMINI_LIVE_AI' && (
                <span className="status-tag status-blue" style={{ fontSize: '0.7rem' }}>
                  <Sparkles size={11} /> Gemini 1.5 Flash Live
                </span>
              )}
            </div>

            <button
              onClick={() => handlePlayTTS(language === 'hi' ? activeQueryResult.short_answer_hi : activeQueryResult.short_answer_en)}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.85rem' }}
            >
              {appState === 'SPEAKING' ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {appState === 'SPEAKING' ? 'Stop Audio' : 'Listen Spoken Answer'}
            </button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
            <strong>User Query:</strong> "{activeQueryResult.queryText}"
          </p>

          {/* Hindi Spoken Text Box */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            marginBottom: '16px'
          }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Spoken Response (Hindi / English)
            </h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
              {activeQueryResult.short_answer_hi}
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              <em>{activeQueryResult.short_answer_en}</em>
            </p>
          </div>

          {/* High-Stakes Notice */}
          {activeQueryResult.status === 'PENDING_TRUST_REVIEW' && (
            <div style={{
              borderLeft: '3px solid var(--accent-amber)',
              paddingLeft: '12px',
              marginBottom: '16px'
            }}>
              <strong style={{ color: 'var(--accent-amber)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} /> Under Kirana Node Verification
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: '2px 0 6px 0' }}>
                {activeQueryResult.trust_note || 'This high-stakes query is queued for local Kirana node verification.'}
              </p>
              <button
                onClick={() => setActiveTab('trust')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Inspect in Kirana Operator Dashboard <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Action Steps */}
          {activeQueryResult.actionable_steps?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>Action Steps:</h5>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-main)', fontSize: '0.88rem', margin: 0 }}>
                {activeQueryResult.actionable_steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Location: {activeQueryResult.location}
            </span>
            <button
              onClick={() => setShowPriceReportModal(true)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Megaphone size={14} color="var(--accent-emerald)" /> Report Local Rate
            </button>
          </div>
        </div>
      )}

      {/* Community Price Report Modal */}
      {showPriceReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="ui-card" style={{ padding: '24px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="var(--accent-emerald)" /> Report Local Market Rate
            </h3>
            <form onSubmit={handlePriceReportSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Commodity</label>
                <input
                  type="text"
                  value={reportItem}
                  onChange={e => setReportItem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Price (₹/kg)</label>
                <input
                  type="number"
                  value={reportPrice}
                  onChange={e => setReportPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Mandi / Location</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPriceReportModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={14} /> Submit Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
