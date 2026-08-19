import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ShieldCheck, Users, Globe, Sparkles, Key } from 'lucide-react';

export default function Header() {
  const { activeTab, setActiveTab, language, setLanguage, pendingReviewsCount, geminiKey, saveApiKey } = useApp();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState(geminiKey);

  const handleKeySave = (e) => {
    e.preventDefault();
    saveApiKey(tempKey);
    setShowKeyModal(false);
  };

  return (
    <header style={{
      background: 'rgba(11, 19, 32, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('voice')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Mic size={22} color="#04111d" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, lineHeight: 1 }}>LokVani AI</h1>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>Public Good AI</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Inclusive Voice AI with Edge Kirana Verification
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => setActiveTab('voice')}
            className={`btn-secondary ${activeTab === 'voice' ? 'active-tab' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              border: 'none',
              background: activeTab === 'voice' ? 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))' : 'transparent',
              color: activeTab === 'voice' ? '#04111d' : 'var(--text-main)',
              fontWeight: activeTab === 'voice' ? 700 : 500
            }}
          >
            <Mic size={16} /> Voice App
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            className={`btn-secondary ${activeTab === 'trust' ? 'active-tab' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              border: 'none',
              position: 'relative',
              background: activeTab === 'trust' ? 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))' : 'transparent',
              color: activeTab === 'trust' ? '#04111d' : 'var(--text-main)',
              fontWeight: activeTab === 'trust' ? 700 : 500
            }}
          >
            <ShieldCheck size={16} /> Kirana Node
            {pendingReviewsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--accent-rose)',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('intel')}
            className={`btn-secondary ${activeTab === 'intel' ? 'active-tab' : ''}`}
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              border: 'none',
              background: activeTab === 'intel' ? 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))' : 'transparent',
              color: activeTab === 'intel' ? '#04111d' : 'var(--text-main)',
              fontWeight: activeTab === 'intel' ? 700 : 500
            }}
          >
            <Users size={16} /> Community Intel
          </button>
        </nav>

        {/* Controls: Language Toggle & API Key Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-glass)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <Globe size={14} color="var(--accent-teal)" />
            {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            title="Configure Gemini API Key"
            style={{
              background: geminiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: geminiKey ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
              color: geminiKey ? 'var(--accent-emerald)' : 'var(--text-muted)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem'
            }}
          >
            <Key size={14} />
            {geminiKey ? 'API Key Active' : 'API Settings'}
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '28px', maxWidth: '440px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent-emerald)" /> Gemini API Configuration
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Add your free Google Gemini API Key for live custom LLM synthesis. If left empty, LokVani AI uses its built-in smart offline reasoning engine.
            </p>
            <form onSubmit={handleKeySave}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
