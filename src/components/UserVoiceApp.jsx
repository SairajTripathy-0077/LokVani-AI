import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { processVoiceQuery } from '../services/geminiService';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, ShieldCheck, Sparkles, Send, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

const DEMO_PRESETS = [
  {
    label: 'PM-Kisan & Mandi Rate',
    query: 'Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav jan-na hai.',
    icon: '🌾',
    description: 'High-stakes scheme query + local price lookup'
  },
  {
    label: 'Crop Disease Advisory',
    query: 'Tamatar me keede lag rahe hain, konsa pesticide spray karna chahiye?',
    icon: '🐛',
    description: 'High-stakes chemical dosage advisory'
  },
  {
    label: 'Onion Market Rate',
    query: 'Aaj Gorakhpur Mandi me pyaaz ka thoke rate kya hai?',
    icon: '🧅',
    description: 'Low-risk real-time mandi rate check'
  }
];

export default function UserVoiceApp() {
  const { language, addQuery, queries, communityIntel, setActiveTab, geminiKey } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeQueryResult, setActiveQueryResult] = useState(queries[0] || null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const [showPriceReportModal, setShowPriceReportModal] = useState(false);
  const [reportItem, setReportItem] = useState('Tamatar (Tomato)');
  const [reportPrice, setReportPrice] = useState('30');
  const [reportLocation, setReportLocation] = useState('Azamgarh Mandi');

  const { addCommunityIntel } = useApp();

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript('');
    speechService.startListening(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          setIsListening(false);
          handleProcessQuery(result.transcript);
        }
      },
      (err) => {
        console.error(err);
        setIsListening(false);
      },
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  const handleStopListening = () => {
    setIsListening(false);
    speechService.stopListening();
    if (transcript.trim()) {
      handleProcessQuery(transcript);
    }
  };

  const handleProcessQuery = async (queryText) => {
    if (!queryText.trim()) return;
    setIsProcessing(true);

    try {
      const aiResponse = await processVoiceQuery(queryText, communityIntel, geminiKey);
      
      const newQuery = {
        id: 'q-' + Date.now(),
        user: 'Ramesh Kumar (Small Farmer)',
        location: 'Azamgarh, UP',
        queryText,
        timestamp: 'Just now',
        domain: aiResponse.domain,
        is_high_stakes: aiResponse.is_high_stakes,
        status: aiResponse.is_high_stakes ? 'PENDING_TRUST_REVIEW' : 'AUTO_VERIFIED',
        short_answer_hi: aiResponse.short_answer_hi,
        short_answer_en: aiResponse.short_answer_en,
        risk_category: aiResponse.risk_category || 'NONE',
        trust_note: aiResponse.trust_note,
        actionable_steps: aiResponse.actionable_steps || []
      };

      addQuery(newQuery);
      setActiveQueryResult(newQuery);

      // Auto play TTS response if auto-verified
      if (!aiResponse.is_high_stakes) {
        handlePlayTTS(aiResponse.short_answer_hi);
      }
    } catch (e) {
      console.error('Error processing query:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.label);
    setTranscript(preset.query);
    handleProcessQuery(preset.query);
  };

  const handlePlayTTS = (text) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechService.speakText(
        text,
        language === 'hi' ? 'hi-IN' : 'en-IN',
        () => setIsSpeaking(false)
      );
    }
  };

  const handlePriceReportSubmit = (e) => {
    e.preventDefault();
    addCommunityIntel(reportItem, reportPrice, 'kg', reportLocation, 'You (Farmer)');
    setShowPriceReportModal(false);
    alert('Thank you! Your market price update has been broadcasted to neighboring farmers.');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Hero Header Banner */}
      <div className="glass-card glass-card-accent" style={{ padding: '28px', textAlign: 'center', marginBottom: '28px', position: 'relative' }}>
        <span style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--accent-emerald)',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          ✨ Voice-First Mode
        </span>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>
          {language === 'hi' ? 'बोलकर अपना सवाल पूछें' : 'Speak Your Query in Any Indian Language'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          {language === 'hi'
            ? 'फसल सलाह, मंडी भाव, सरकारी योजनाएं और मौसम अलर्ट — एक बटन दबाकर पूछें।'
            : 'Crop advisory, Mandi rates, scheme eligibility & weather updates — no typing required.'}
        </p>

        {/* Dynamic Voice Trigger Button */}
        <div style={{ marginTop: '28px', marginBottom: '16px' }}>
          <div className="mic-btn-container">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Tap to Stop' : 'Tap to Speak'}
            >
              {isListening ? <MicOff size={44} /> : <Mic size={44} />}
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            {isListening ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'inline-block', animation: 'ping 1s infinite' }}></span>
                  Listening... Speak clearly in Hindi/English
                </span>
                <div className="wave-bar-container">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              </div>
            ) : isProcessing ? (
              <span style={{ color: 'var(--accent-teal)', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing query & consulting Trust Node...
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Tap the glowing mic button and ask your question
              </span>
            )}
          </div>

          {transcript && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              display: 'inline-block',
              maxWidth: '80%',
              fontSize: '0.92rem',
              color: 'var(--accent-teal)'
            }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Demo Presets Bar for Pitch Presentation */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '10px' }}>
            ⚡ Instant Pitch Demo Presets (1-Click Try)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                style={{
                  background: selectedPreset === preset.label ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedPreset === preset.label ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span>{preset.icon}</span>
                <span style={{ fontWeight: 600 }}>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Response Display Card */}
      {activeQueryResult && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', borderLeft: activeQueryResult.is_high_stakes ? '4px solid var(--accent-amber)' : '4px solid var(--accent-emerald)' }}>
          
          {/* Header Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                {activeQueryResult.domain}
              </span>

              {activeQueryResult.status === 'VERIFIED_BY_TRUST_NODE' ? (
                <span className="badge badge-verified">
                  <ShieldCheck size={14} /> Verified by Local Kirana Node
                </span>
              ) : activeQueryResult.status === 'PENDING_TRUST_REVIEW' ? (
                <span className="badge badge-pending">
                  <AlertTriangle size={14} /> Pending Kirana Review
                </span>
              ) : (
                <span className="badge badge-verified">
                  <CheckCircle2 size={14} /> Auto-Verified AI Response
                </span>
              )}
            </div>

            <button
              onClick={() => handlePlayTTS(language === 'hi' ? activeQueryResult.short_answer_hi : activeQueryResult.short_answer_en)}
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.82rem' }}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isSpeaking ? 'Stop Audio' : 'Listen Spoken Answer'}
            </button>
          </div>

          {/* Original Query */}
          <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <strong>Query:</strong> "{activeQueryResult.queryText}"
          </div>

          {/* Main Answer Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            border: '1px solid var(--border-glass)',
            marginBottom: '16px'
          }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Answer (Hindi / English)
            </h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '8px', lineHeight: 1.5 }}>
              {activeQueryResult.short_answer_hi}
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <em>{activeQueryResult.short_answer_en}</em>
            </p>
          </div>

          {/* High-Stakes Banner & Kirana Route Notification */}
          {activeQueryResult.status === 'PENDING_TRUST_REVIEW' && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <ShieldAlert size={22} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--accent-amber)', fontSize: '0.9rem', display: 'block', marginBottom: '2px' }}>
                  High-Stakes Verification Active:
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0 }}>
                  {activeQueryResult.trust_note} This query has been sent to your local Kirana/CSC operator for 1-click verification.
                </p>
                <button
                  onClick={() => setActiveTab('trust')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-teal)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  View in Kirana Operator Dashboard <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actionable Steps */}
          {activeQueryResult.actionable_steps?.length > 0 && (
            <div>
              <h5 style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Recommended Action Steps:
              </h5>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                {activeQueryResult.actionable_steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Action */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Location: {activeQueryResult.location}
            </span>

            <button
              onClick={() => setShowPriceReportModal(true)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              📢 Report Local Mandi Price
            </button>
          </div>
        </div>
      )}

      {/* Community Price Report Modal */}
      {showPriceReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '24px', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>📢 Report Local Market Price</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Your report updates the hyper-local community intelligence network for neighboring farmers & vendors.
            </p>
            <form onSubmit={handlePriceReportSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Crop / Commodity</label>
                <input
                  type="text"
                  value={reportItem}
                  onChange={e => setReportItem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Price (₹ per kg)</label>
                <input
                  type="number"
                  value={reportPrice}
                  onChange={e => setReportPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mandi / Location Name</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPriceReportModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={14} /> Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
