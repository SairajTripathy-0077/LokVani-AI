import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import UserVoiceApp from './components/UserVoiceApp';
import PublicSchemesDashboard from './components/PublicSchemesDashboard';
import CommunityIntel from './components/CommunityIntel';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

function MainContent() {
  const { activeTab } = useApp();

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
