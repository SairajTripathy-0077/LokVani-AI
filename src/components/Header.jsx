import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ShieldCheck, Users, Globe, Key, Sparkles, Shield } from 'lucide-react';

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
      background: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
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
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('voice')}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Mic size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: 0, lineHeight: 1 }}>LokVani AI</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Inclusive Voice AI & Edge Verification Node
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Rectangular Buttons */}
        <nav style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-card-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setActiveTab('voice')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'voice' ? '#ffffff' : 'transparent',
              color: activeTab === 'voice' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              fontWeight: activeTab === 'voice' ? 700 : 500,
              boxShadow: activeTab === 'voice' ? '0 1px 3px rgba(15,23,42,0.08)' : 'none'
            }}
          >
            <Mic size={16} /> Voice App
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              background: activeTab === 'trust' ? '#ffffff' : 'transparent',
              color: activeTab === 'trust' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              fontWeight: activeTab === 'trust' ? 700 : 500,
              boxShadow: activeTab === 'trust' ? '0 1px 3px rgba(15,23,42,0.08)' : 'none'
            }}
          >
            <ShieldCheck size={16} /> Kirana Node
            {pendingReviewsCount > 0 && (
              <span style={{
                background: 'var(--accent-rose)',
                color: '#ffffff',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('intel')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'intel' ? '#ffffff' : 'transparent',
              color: activeTab === 'intel' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              fontWeight: activeTab === 'intel' ? 700 : 500,
              boxShadow: activeTab === 'intel' ? '0 1px 3px rgba(15,23,42,0.08)' : 'none'
            }}
          >
            <Users size={16} /> Community Intel
          </button>
        </nav>

        {/* Controls: Language Toggle & API Key Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Globe size={14} color="var(--accent-blue)" />
            {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Key size={14} />
            {geminiKey ? 'API Active' : 'API Key'}
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="ui-card" style={{ padding: '24px', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-emerald)" /> Gemini API Settings
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Add your Google Gemini API Key. If left empty, LokVani AI uses its built-in offline smart reasoning engine.
            </p>
            <form onSubmit={handleKeySave}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowKeyModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
