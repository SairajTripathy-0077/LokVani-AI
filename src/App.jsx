import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import UserVoiceApp from './components/UserVoiceApp';
import PublicSchemesDashboard from './components/PublicSchemesDashboard';
import CommunityIntel from './components/CommunityIntel';
import { Heart, Github } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

function MainContent() {
  const { activeTab } = useApp();
  const { isSignedIn } = useUser();
  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  // Enforce Sign-In for Voice App, Public Schemes, and Community Intel tabs
  const isProtectedTab = ['voice', 'schemes', 'intel'].includes(activeTab);
  if (isProtectedTab && isClerkAvailable && !isSignedIn) {
    return <AuthPage />;
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 140px)', paddingBottom: '40px' }}>
      {activeTab === 'home' && <LandingPage />}
      {activeTab === 'auth' && <AuthPage />}
      {activeTab === 'voice' && <UserVoiceApp />}
      {activeTab === 'schemes' && <PublicSchemesDashboard />}
      {activeTab === 'intel' && <CommunityIntel />}
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
        <Header />
        <MainContent />
        <footer style={{
          marginTop: 'auto',
          padding: '18px 24px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span>
              LokVani AI • Built for AI for Public Good Track
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Bharat’s Underserved Communities
            </span>

            <a
              href="https://github.com/SairajTripathy-0077/OOSC-Hackathon.git"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <Github size={14} /> GitHub Repository
            </a>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
