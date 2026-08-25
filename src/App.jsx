import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import UserVoiceApp from './components/UserVoiceApp';
import PublicSchemesDashboard from './components/PublicSchemesDashboard';
import CommunityIntel from './components/CommunityIntel';
import Footer from './components/Footer';
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
    <main style={{ minHeight: 'calc(100vh - 140px)' }}>
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fbfbfa' }}>
        <Header />
        <MainContent />
        <Footer />
      </div>
    </AppProvider>
  );
}
