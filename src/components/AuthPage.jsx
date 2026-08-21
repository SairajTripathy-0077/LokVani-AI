import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SignIn, SignUp, SignedIn, UserButton } from '@clerk/clerk-react';
import { ShieldCheck, CheckCircle2, Mic, ArrowLeft, Users, Lock } from 'lucide-react';

export default function AuthPage() {
  const { setActiveTab } = useApp();
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'

  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-muted)',
        borderRadius: '8px',
        padding: '36px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Left Side: Brand & Benefits Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <button
              onClick={() => setActiveTab('home')}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '24px' }}
            >
              <ArrowLeft size={14} /> Back to Homepage
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                color: '#fff'
              }}>
                <Mic size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>LokVani AI Account</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.6 }}>
              Join the community-driven voice intelligence network for rural India and Kirana trust verification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="var(--accent-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.92rem', margin: 0 }}>Verified Community Status</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Submit local Mandi prices & voice queries with priority verification.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <ShieldCheck size={18} color="var(--accent-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.92rem', margin: 0 }}>Kirana Node Operator Rights</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Review & validate high-stakes government scheme eligibility queries.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Users size={18} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.92rem', margin: 0 }}>Personalized Query History</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Access past advisory voice responses & Mandi alert history anywhere.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveTab('voice')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '0.84rem',
                textDecoration: 'underline'
              }}
            >
              Skip for now and continue as Guest →
            </button>
          </div>
        </div>

        {/* Right Side: Clerk Authentication Card / Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '24px'
        }}>
          {isClerkAvailable ? (
            <div>
              {/* Toggle Mode Switcher */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '4px',
                width: '100%',
                marginBottom: '20px'
              }}>
                <button
                  onClick={() => setAuthMode('signup')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: authMode === 'signup' ? 'var(--accent-primary)' : 'transparent',
                    color: authMode === 'signup' ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Create Account (Sign Up)
                </button>
                <button
                  onClick={() => setAuthMode('signin')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: authMode === 'signin' ? 'var(--accent-primary)' : 'transparent',
                    color: authMode === 'signin' ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
              </div>

              {/* Clerk Sign Up / Sign In Render */}
              <SignedIn>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '16px' }}>
                    ✓ You are signed in!
                  </p>
                  <UserButton showName={true} />
                  <div style={{ marginTop: '24px' }}>
                    <button
                      onClick={() => setActiveTab('voice')}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Go to Application Dashboard
                    </button>
                  </div>
                </div>
              </SignedIn>

              {authMode === 'signup' ? (
                <SignUp routing="hash" signInUrl="#/signin" redirectUrl="/" />
              ) : (
                <SignIn routing="hash" signUpUrl="#/signup" redirectUrl="/" />
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '16px', color: 'var(--accent-gold)' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Guest Mode Enabled</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Clerk publishable key has not been initialized in `.env`. You can explore all application features in Guest Mode.
              </p>
              <button
                onClick={() => setActiveTab('voice')}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Launch Guest Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
