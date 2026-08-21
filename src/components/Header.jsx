import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, ShieldCheck, Users, Globe, LogIn, UserPlus, Home, Lock } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';

export default function Header() {
  const { activeTab, setActiveTab, language, setLanguage, pendingReviewsCount } = useApp();
  const { isSignedIn } = useUser();

  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const handleProtectedTabClick = (tabName) => {
    if (isClerkAvailable && !isSignedIn) {
      setActiveTab('auth');
    } else {
      setActiveTab(tabName);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            borderRadius: '4px'
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

        {/* Minimal Nav Links with Auth Check */}
        <nav style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'home' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'home' ? 700 : 500,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '2px',
              borderBottom: activeTab === 'home' ? '2px solid var(--accent-primary)' : '2px solid transparent'
            }}
          >
            <Home size={16} /> Home
          </button>

          {/* Protected Tab 1: Voice App */}
          <button
            onClick={() => handleProtectedTabClick('voice')}
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
            {isClerkAvailable && !isSignedIn && <Lock size={12} color="var(--text-dim)" style={{ marginLeft: '2px' }} />}
          </button>

          {/* Protected Tab 2: Kirana Node */}
          <button
            onClick={() => handleProtectedTabClick('trust')}
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
            {isClerkAvailable && !isSignedIn ? (
              <Lock size={12} color="var(--text-dim)" style={{ marginLeft: '2px' }} />
            ) : (
              pendingReviewsCount > 0 && (
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 700 }}>
                  [{pendingReviewsCount}]
                </span>
              )
            )}
          </button>

          {/* Protected Tab 3: Community Intel */}
          <button
            onClick={() => handleProtectedTabClick('intel')}
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
            {isClerkAvailable && !isSignedIn && <Lock size={12} color="var(--text-dim)" style={{ marginLeft: '2px' }} />}
          </button>
        </nav>

        {/* Right Action Bar: Language Selector & Clerk Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <Globe size={14} color="var(--accent-primary)" />
            {language === 'hi' ? 'हिंदी' : 'English'}
          </button>

          {/* Clerk Auth Integration */}
          {isClerkAvailable ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SignedOut>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }} onClick={() => setActiveTab('auth')}>
                    <LogIn size={13} /> Sign In
                  </button>
                  <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.78rem' }} onClick={() => setActiveTab('auth')}>
                    <UserPlus size={13} /> Sign Up
                  </button>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton showName={false} />
              </SignedIn>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveTab('auth')}>
                <LogIn size={14} /> Guest Mode
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
