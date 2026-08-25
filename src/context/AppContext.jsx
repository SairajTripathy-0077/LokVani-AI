import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchLiveWeatherData, fetchLiveMandiPrices } from '../services/realDataService';
import { speechService } from '../services/speechService';

const AppContext = createContext();

const DEFAULT_CONVERSATION = {
  id: 'conv_default',
  title: 'General Voice Assistant',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'auth' | 'voice' | 'schemes' | 'intel'

  // Global Language state — persisted in localStorage
  const [language, setLanguageState] = useState(() =>
    localStorage.getItem('lokvani_language') || 'hi'
  );

  // Dialect selection — persisted in localStorage
  const [dialect, setDialect] = useState(() =>
    localStorage.getItem('lokvani_dialect') || 'hi'
  );

  // Global Language switcher helper — syncs language and dialect
  const changeLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('lokvani_language', newLang);
    if (newLang === 'en') {
      setDialect('en');
    } else if (newLang === 'hi' && dialect === 'en') {
      setDialect('hi');
    }
  }, [dialect]);

  const setLanguage = useCallback((langOrFn) => {
    setLanguageState(prev => {
      const next = typeof langOrFn === 'function' ? langOrFn(prev) : langOrFn;
      localStorage.setItem('lokvani_language', next);
      if (next === 'en') setDialect('en');
      else if (next === 'hi' && dialect === 'en') setDialect('hi');
      return next;
    });
  }, [dialect]);

  // Global Speech Output State
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.onSpeakingStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // ── Multi-Conversation / Multi-Chat State ─────────────────────────────────
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('lokvani_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return [DEFAULT_CONVERSATION];
  });

  const [activeConvId, setActiveConvId] = useState(() => {
    const saved = localStorage.getItem('lokvani_active_conv_id');
    if (saved && conversations.some(c => c.id === saved)) {
      return saved;
    }
    return conversations[0]?.id || DEFAULT_CONVERSATION.id;
  });

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('lokvani_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('lokvani_active_conv_id', activeConvId);
  }, [activeConvId]);

  // Get active conversation object
  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0] || DEFAULT_CONVERSATION;

  // Create a new conversation session
  const createConversation = useCallback((title) => {
    const newConv = {
      id: `conv_${Date.now()}`,
      title: title || (language === 'hi' ? 'नई बातचीत' : 'New Chat'),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    return newConv.id;
  }, [language]);

  // Select active conversation
  const selectConversation = useCallback((id) => {
    if (conversations.some(c => c.id === id)) {
      setActiveConvId(id);
    }
  }, [conversations]);

  // Delete a conversation thread
  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fresh = {
          id: `conv_${Date.now()}`,
          title: language === 'hi' ? 'नई बातचीत' : 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setActiveConvId(fresh.id);
        return [fresh];
      }
      if (activeConvId === id) {
        setActiveConvId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeConvId, language]);

  // Rename conversation thread
  const renameConversation = useCallback((id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, title: newTitle.trim(), updatedAt: Date.now() };
      }
      return c;
    }));
  }, []);

  // Add query-response pair to active conversation thread
  const addMessageToActiveConv = useCallback((messageData) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        const updatedMessages = [...conv.messages, messageData];
        // Auto-set title from first user query if title is default
        const isFirstMessage = conv.messages.length === 0;
        const autoTitle = isFirstMessage
          ? (messageData.transcribedText ? messageData.transcribedText.slice(0, 32) + (messageData.transcribedText.length > 32 ? '…' : '') : conv.title)
          : conv.title;

        return {
          ...conv,
          title: autoTitle,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
      }
      return conv;
    }));
  }, [activeConvId]);

  // Legacy Queries state (for backward compatibility)
  const [queries, setQueries] = useState(() => {
    const saved = localStorage.getItem('lokvani_real_queries');
    return saved ? JSON.parse(saved) : [];
  });

  const [communityIntel, setCommunityIntel] = useState(() => {
    const saved = localStorage.getItem('lokvani_real_intel');
    return saved ? JSON.parse(saved) : [];
  });

  const [liveWeather, setLiveWeather] = useState(null);

  useEffect(() => {
    localStorage.removeItem('lokvani_api_key');
  }, []);

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
      changeLanguage,
      dialect,
      setDialect,
      isSpeaking,
      stopSpeaking,
      // Multi-Conversation Chat state & actions
      conversations,
      activeConvId,
      activeConversation,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      addMessageToActiveConv,
      // Legacy queries
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
