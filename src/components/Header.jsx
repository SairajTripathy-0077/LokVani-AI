import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ShieldCheck, Users, Globe, Key, LogIn, UserPlus } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

export default function Header() {
  const { activeTab, setActiveTab, language, setLanguage, pendingReviewsCount, geminiKey, saveApiKey } = useApp();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState(geminiKey);

  const handleKeySave = (e) => {
    e.preventDefault();
    saveApiKey(tempKey);
    setShowKeyModal(false);
  };

  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 20px'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('voice')}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Mic size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0, lineHeight: 1 }}>LokVani AI</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Inclusive Voice Intelligence for Bharat
            </p>
          </div>
        </div>

        {/* Minimal Nav Links (No Pill Capsules, No Heavy Boxes) */}
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('voice')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'voice' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'voice' ? 700 : 500,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '2px',
              borderBottom: activeTab === 'voice' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            <Mic size={16} /> Voice App
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'trust' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'trust' ? 700 : 500,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '2px',
              borderBottom: activeTab === 'trust' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            <ShieldCheck size={16} /> Kirana Node
            {pendingReviewsCount > 0 && (
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 700 }}>
                [{pendingReviewsCount}]
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('intel')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'intel' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'intel' ? 700 : 500,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '2px',
              borderBottom: activeTab === 'intel' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            <Users size={16} /> Community Intel
          </button>
        </nav>

        {/* Right Action Bar: Language, API Rotator & Clerk Sign-In / Sign-Up */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <Globe size={14} color="var(--accent-primary)" />
            {language === 'hi' ? 'हिंदी' : 'English'}
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <Key size={14} /> Rotator API
          </button>

          {/* Clerk Auth Integration */}
          {isClerkAvailable ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SignedOut>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <SignInButton mode="modal">
                    <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      <LogIn size={13} /> Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      <UserPlus size={13} /> Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton showName={false} />
              </SignedIn>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => alert('Clerk Auth credentials not set in .env. Setup VITE_CLERK_PUBLISHABLE_KEY to activate.')}>
                <LogIn size={14} /> Guest Mode
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-muted)',
            padding: '24px',
            maxWidth: '420px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--accent-gold)" /> Gemini Key Rotator Settings
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter comma-separated API keys for automatic round-robin rotation and failover.
            </p>
            <form onSubmit={handleKeySave}>
              <textarea
                rows={3}
                placeholder="AIzaKey1, AIzaKey2, AIzaKey3"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-muted)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowKeyModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Rotator Keys</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
