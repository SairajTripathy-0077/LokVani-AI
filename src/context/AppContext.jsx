import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_INTEL = [
  { id: '1', item: 'Tamatar (Tomato)', price: 28, unit: 'kg', location: 'Azamgarh Mandi', reporter: 'Ramesh Farmer', timestamp: '10 mins ago', verified: true, trend: 'up' },
  { id: '2', item: 'Pyaaz (Onion)', price: 34, unit: 'kg', location: 'Gorakhpur Market', reporter: 'Sunil Vendor', timestamp: '25 mins ago', verified: true, trend: 'flat' },
  { id: '3', item: 'Aloo (Potato)', price: 18, unit: 'kg', location: 'Varanasi Mandi', reporter: 'Vijay Vendor', timestamp: '1 hour ago', verified: true, trend: 'down' },
  { id: '4', item: 'Gehun (Wheat)', price: 24, unit: 'kg', location: 'Jaunpur Mandi', reporter: 'Amit Farmer', timestamp: '2 hours ago', verified: true, trend: 'up' }
];

const INITIAL_QUERIES = [
  {
    id: 'q-101',
    user: 'Ramesh Kumar (Tomato Farmer)',
    location: 'Azamgarh, UP',
    queryText: 'Mujhe PM-Kisan scheme ke liye apply karna hai aur tamatar ka mandi bhav jan-na hai.',
    timestamp: 'Just now',
    domain: 'GOVT_SCHEME',
    is_high_stakes: true,
    status: 'PENDING_TRUST_REVIEW', // PENDING_TRUST_REVIEW | VERIFIED_BY_TRUST_NODE | AUTO_VERIFIED
    short_answer_hi: 'PM-Kisan yojana ke liye Aadhar card, bank account, aur zameen ka Khasra paper zaroori hai.',
    short_answer_en: 'PM-Kisan scheme requires Aadhar card, bank account, and Khasra land paper.',
    risk_category: 'FINANCIAL_ELIGIBILITY',
    trust_note: 'Requires Kirana operator to check local Khasra document format before submittal.',
    actionable_steps: [
      'Aadhar card bank account se link rakhein',
      'Khasra land document ready rakhein',
      'Kirana CSC node par bio-metric e-KYC karein'
    ]
  },
  {
    id: 'q-100',
    user: 'Sunita Devi (Street Vendor)',
    location: 'Gorakhpur, UP',
    queryText: 'Aaj pyaaz ka thok rate kya chal raha hai?',
    timestamp: '15 mins ago',
    domain: 'MARKET_PRICE',
    is_high_stakes: false,
    status: 'AUTO_VERIFIED',
    short_answer_hi: 'Gorakhpur Mandi me aaj pyaaz ₹34 prati kilo bik raha hai.',
    short_answer_en: 'Onion is selling at ₹34/kg in Gorakhpur Mandi today.',
    risk_category: 'NONE',
    trust_note: 'Auto-verified via community price ticker.',
    actionable_steps: ['Mandi me 10 baje se pehle pahunchein']
  }
];

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('voice'); // 'voice' | 'trust' | 'intel'
  const [language, setLanguage] = useState('hi'); // 'hi' | 'en'
  const [queries, setQueries] = useState(() => {
    const saved = localStorage.getItem('lokvani_queries');
    return saved ? JSON.parse(saved) : INITIAL_QUERIES;
  });
  const [communityIntel, setCommunityIntel] = useState(() => {
    const saved = localStorage.getItem('lokvani_intel');
    return saved ? JSON.parse(saved) : INITIAL_INTEL;
  });
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('lokvani_api_key') || '');

  useEffect(() => {
    localStorage.setItem('lokvani_queries', JSON.stringify(queries));
  }, [queries]);

  useEffect(() => {
    localStorage.setItem('lokvani_intel', JSON.stringify(communityIntel));
  }, [communityIntel]);

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
      id: Date.now().toString(),
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

  const saveApiKey = (key) => {
    setGeminiKey(key);
    localStorage.setItem('lokvani_api_key', key);
  };

  const pendingReviewsCount = queries.filter(q => q.status === 'PENDING_TRUST_REVIEW').length;

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      language,
      setLanguage,
      queries,
      addQuery,
      approveQuery,
      communityIntel,
      addCommunityIntel,
      pendingReviewsCount,
      geminiKey,
      saveApiKey
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
