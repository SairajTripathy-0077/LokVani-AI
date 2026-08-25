import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLiveWeatherData, fetchLiveMandiPrices } from '../services/realDataService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'auth' | 'voice' | 'schemes' | 'intel'
  const [language, setLanguage] = useState('hi'); // 'hi' | 'en'

  // Dialect selection — persisted to localStorage
  const [dialect, setDialect] = useState(() =>
    localStorage.getItem('lokvani_dialect') || 'hi'
  );

  // Real User Queries (Persisted in localStorage, empty on fresh start)
  const [queries, setQueries] = useState(() => {
    const saved = localStorage.getItem('lokvani_real_queries');
    return saved ? JSON.parse(saved) : [];
  });

  // Real-Time Community Intel (Populated via live Agmarknet API + User Reports)
  const [communityIntel, setCommunityIntel] = useState(() => {
    const saved = localStorage.getItem('lokvani_real_intel');
    return saved ? JSON.parse(saved) : [];
  });

  const [liveWeather, setLiveWeather] = useState(null);

  // SECURITY: Clear any legacy API key that may have been stored in localStorage
  useEffect(() => {
    localStorage.removeItem('lokvani_api_key');
  }, []);

  // Load Real-Time Data from Public APIs on mount
  useEffect(() => {
    async function loadRealData() {
      const weather = await fetchLiveWeatherData('Azamgarh');
      setLiveWeather(weather);

      const livePrices = await fetchLiveMandiPrices();
      if (livePrices && livePrices.length > 0) {
        setCommunityIntel(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueLive = livePrices.filter(lp => !existingIds.has(lp.id));
          return [...uniqueLive, ...prev];
        });
      }
    }
    loadRealData();
  }, []);

  useEffect(() => {
    localStorage.setItem('lokvani_real_queries', JSON.stringify(queries));
  }, [queries]);

  useEffect(() => {
    localStorage.setItem('lokvani_real_intel', JSON.stringify(communityIntel));
  }, [communityIntel]);

  useEffect(() => {
    localStorage.setItem('lokvani_dialect', dialect);
  }, [dialect]);

  const addQuery = (newQuery) => {
    setQueries(prev => [newQuery, ...prev]);
  };

  const approveQuery = (queryId, updatedAnswerHi, updatedAnswerEn, operatorNotes = '') => {
    setQueries(prev => prev.map(q => {
      if (q.id === queryId) {
        return {
          ...q,
          status: 'VERIFIED_BY_TRUST_NODE',
          short_answer_hi: updatedAnswerHi || q.short_answer_hi,
          short_answer_en: updatedAnswerEn || q.short_answer_en,
          operator_notes: operatorNotes,
          verified_by: 'Gupta Kirana & CSC Node (Azamgarh)',
          verified_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return q;
    }));
  };

  const addCommunityIntel = (item, price, unit = 'kg', location = 'Local Mandi', reporter = 'You') => {
    const newEntry = {
      id: 'user-' + Date.now(),
      item,
      price: Number(price),
      unit,
      location,
      reporter,
      timestamp: 'Just now',
      verified: true,
      trend: 'up'
    };
    setCommunityIntel(prev => [newEntry, ...prev]);
  };

  const pendingReviewsCount = queries.filter(q => q.status === 'PENDING_TRUST_REVIEW').length;

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      language,
      setLanguage,
      dialect,
      setDialect,
      queries,
      addQuery,
      approveQuery,
      communityIntel,
      addCommunityIntel,
      liveWeather,
      pendingReviewsCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
