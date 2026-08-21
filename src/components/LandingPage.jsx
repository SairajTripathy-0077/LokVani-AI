import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ShieldCheck, Users, ArrowRight, Sparkles, CheckCircle2, Globe2, Zap, Award, HelpCircle, Volume2, Play } from 'lucide-react';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react';

export default function LandingPage() {
  const { setActiveTab, language, setLanguage } = useApp();
  const [demoQuery, setDemoQuery] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const sampleQueries = [
    {
      title_hi: 'PM Kisan 17th kisht kab aayegi?',
      title_en: 'When is PM Kisan 17th installment coming?',
      ans_hi: 'PM-Kisan 17th kisht ke liye Aadhar e-KYC verified hona zaroori hai. Aapke nazdiki Gupta Kirana CSC node se Khasra document verify karayein.',
      ans_en: 'PM-Kisan 17th installment requires Aadhar e-KYC verification. Get your land documents verified at your nearest Kirana CSC center.',
      domain: 'GOVT_SCHEME',
      trust: 'VERIFIED_BY_TRUST_NODE'
    },
    {
      title_hi: 'Azamgarh Mandi me aaj Gehun (Wheat) ka bhav kya hai?',
      title_en: 'What is today\'s wheat price in Azamgarh Mandi?',
      ans_hi: 'Aaj Azamgarh Mandi me Gehun (Wheat) ka dam ₹2,400 per quintal hai. Pichle hafte se ₹50 ki barhotari hui hai.',
      ans_en: 'Today in Azamgarh Mandi, wheat is priced at ₹2,400 per quintal, showing a ₹50 increase from last week.',
      domain: 'MANDI_PRICE',
      trust: 'AUTO_VERIFIED'
    },
    {
      title_hi: 'Dhan ki fasal me patti peeli pad rahi hai, kya karein?',
      title_en: 'Paddy leaves turning yellow, what treatment is needed?',
      ans_hi: 'Dhan me peelapan Zinc aur Nitrogen ki kami se hota hai. 5kg Zinc Sulphate per acre chhidkav karein aur paani ka santulan banaye rakhein.',
      ans_en: 'Yellowing in paddy is caused by Zinc & Nitrogen deficiency. Apply 5kg Zinc Sulphate per acre and maintain water levels.',
      domain: 'AGRI_ADVISORY',
      trust: 'VERIFIED_BY_TRUST_NODE'
    }
  ];

  const handleRunDemo = (queryObj) => {
    setDemoQuery(queryObj.title_hi);
    setIsSimulating(true);
    setDemoResult(null);

    setTimeout(() => {
      setDemoResult(queryObj);
      setIsSimulating(false);

      // Play synthesized audio demo if supported
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = language === 'hi' ? queryObj.ans_hi : queryObj.ans_en;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* 1. HERO SECTION */}
      <section style={{
        padding: '60px 20px 50px',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          lineHeight: 1.15,
          fontWeight: 800,
          marginBottom: '20px',
          letterSpacing: '-0.03em',
          maxWidth: '900px',
          margin: '0 auto 20px'
        }}>
          Inclusive Voice Intelligence for <span style={{ color: 'var(--accent-primary)' }}>Bharat</span> & Underserved Communities
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Speak naturally in your local dialect. LokVani AI connects rural citizens directly with verified Mandi prices, Government Scheme eligibility, and Kirana Trust Node human validation.
        </p>

        {/* Dual Hero CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <SignedOut>
            <button
              onClick={() => setActiveTab('auth')}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '1.02rem', borderRadius: '6px' }}
            >
              Get Started / Sign Up <ArrowRight size={18} />
            </button>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => setActiveTab('voice')}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '1.02rem', borderRadius: '6px' }}
            >
              Launch Dashboard <ArrowRight size={18} />
            </button>
          </SignedIn>

          <button
            onClick={() => setActiveTab('voice')}
            className="btn-secondary"
            style={{ padding: '14px 26px', fontSize: '1.02rem', borderRadius: '6px' }}
          >
            <Mic size={18} color="var(--accent-primary)" /> Try Guest Voice App
          </button>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE VOICE DEMO SIMULATOR */}
      <section style={{
        maxWidth: '960px',
        margin: '0 auto 60px',
        padding: '0 20px'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <Mic size={18} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Interactive Live Voice Simulator</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              ● Powered by Gemini Key-Rotator Engine
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Click any sample voice query below to simulate instant speech transcription & AI response synthesis:
          </p>

          {/* Sample Clickable Query Chips */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleRunDemo(q)}
                disabled={isSimulating}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <Play size={13} color="var(--accent-primary)" />
                <span>{language === 'hi' ? q.title_hi : q.title_en}</span>
              </button>
            ))}
          </div>

          {/* Simulation Output Area */}
          {isSimulating && (
            <div style={{
              padding: '20px',
              background: 'var(--bg-main)',
              border: '1px dashed var(--accent-primary)',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--accent-gold)', fontWeight: 600, margin: 0, fontSize: '0.92rem' }}>
                🎙️ Synthesizing Voice Query: "{demoQuery}"...
              </p>
            </div>
          )}

          {demoResult && !isSimulating && (
            <div style={{
              padding: '20px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-muted)',
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Domain: {demoResult.domain}
                </span>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: demoResult.trust === 'VERIFIED_BY_TRUST_NODE' ? 'var(--accent-cyan)' : 'var(--accent-gold)'
                }}>
                  ✓ {demoResult.trust === 'VERIFIED_BY_TRUST_NODE' ? 'Kirana Node Verified' : 'Auto Verified'}
                </span>
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                {language === 'hi' ? demoResult.ans_hi : demoResult.ans_en}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                <Volume2 size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audio Response Playing...</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. THREE CORE PLATFORM PILLARS */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto 70px',
        padding: '0 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Built for Real Impact at Scale</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Combining state-of-the-art AI language models with ground-level community verification.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Pillar 1 */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '28px',
            borderRadius: '6px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              marginBottom: '20px',
              color: 'var(--accent-primary)'
            }}>
              <Mic size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Multilingual Voice Engine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Supports spoken queries in Hindi, Hinglish, Bhojpuri, and regional dialects with instant speech-to-text and AI text-to-speech audio synthesis.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '28px',
            borderRadius: '6px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              marginBottom: '20px',
              color: 'var(--accent-gold)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Kirana Trust Nodes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              High-stakes queries (e.g. monetary schemes, land records) are routed to local Kirana store operators & CSC centers for human verification.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '28px',
            borderRadius: '6px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              marginBottom: '20px',
              color: 'var(--accent-cyan)'
            }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Community Intel Network</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Live crowdsourced Mandi commodity price tracking combined with real-time Agmarknet government API feeds for transparent crop trading.
            </p>
          </div>
        </div>
      </section>

      {/* 4. IMPACT NUMBERS COUNTER */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '50px 20px'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>50,000+</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>Voice Queries Processed</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>99.4%</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>Trust Review Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>12+</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>Dialects & Languages</div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)' }}>&lt; 1.2s</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>Average Response Time</div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CALL TO ACTION */}
      <section style={{
        padding: '70px 20px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>Ready to Experience LokVani AI?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '32px' }}>
          Sign up with your account or enter directly into the dashboard to test voice queries, review trust items, or check local Mandi prices.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <SignedOut>
            <button
              onClick={() => setActiveTab('auth')}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '6px' }}
            >
              Sign Up / Sign In <ArrowRight size={18} />
            </button>
          </SignedOut>

          <button
            onClick={() => setActiveTab('voice')}
            className="btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '6px' }}
          >
            Enter Dashboard Directly
          </button>
        </div>
      </section>
    </div>
  );
}
