import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLiveWeatherData, fetchLiveMandiPrices } from '../services/realDataService';
import { speechService } from '../services/speechService';

const AppContext = createContext();

const DEFAULT_CONVERSATION = {
  id: 'default',
  title: 'Main Chat Session',
  createdAt: new Date().toISOString(),
  messages: []
};

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'auth' | 'voice' | 'schemes' | 'intel'
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('lokvani_language') || 'en'
  );

  useEffect(() => {
    localStorage.setItem('lokvani_language', language);
  }, [language]);

  // Dialect selection — persisted to localStorage
  const [dialect, setDialect] = useState(() =>
    localStorage.getItem('lokvani_dialect') || 'en'
  );

  // Multi-thread conversation session management
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('lokvani_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [DEFAULT_CONVERSATION];
  });

  const [activeConvId, setActiveConvId] = useState(() => {
    return localStorage.getItem('lokvani_active_conv_id') || 'default';
  });

  // Global speech state listener
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => {
    const unsubscribe = speechService.onSpeakingStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  const stopSpeaking = () => {
    speechService.stopSpeaking();
  };

  // Real User Queries (Persisted in localStorage)
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

  // Location Engine State
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('lokvani_location');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userLocation) {
      localStorage.setItem('lokvani_location', JSON.stringify(userLocation));
    }
  }, [userLocation]);

  const requestLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
            if (!res.ok) throw new Error('Geocoding failed');
            const data = await res.json();
            
            const state = data.address.state || 'Uttar Pradesh';
            const district = data.address.state_district || data.address.county || data.address.city || '';
            
            const loc = { lat: latitude, lng: longitude, state, district };
            setUserLocation(loc);
            resolve(loc);
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  };

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

  useEffect(() => {
    localStorage.setItem('lokvani_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('lokvani_active_conv_id', activeConvId);
  }, [activeConvId]);

  // Active Conversation Helper
  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0] || DEFAULT_CONVERSATION;

  const createConversation = (title) => {
    const newConv = {
      id: `conv_${Date.now()}`,
      title: title || `Session ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    return newConv.id;
  };

  const selectConversation = (convId) => {
    if (conversations.some(c => c.id === convId)) {
      setActiveConvId(convId);
    }
  };

  const deleteConversation = (convId) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== convId);
      if (filtered.length === 0) {
        return [DEFAULT_CONVERSATION];
      }
      if (activeConvId === convId) {
        setActiveConvId(filtered[0].id);
      }
      return filtered;
    });
  };

  const renameConversation = (convId, newTitle) => {
    if (!newTitle.trim()) return;
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, title: newTitle.trim() } : c)
    );
  };

  const clearAllConversations = () => {
    const reset = [DEFAULT_CONVERSATION];
    setConversations(reset);
    setActiveConvId(DEFAULT_CONVERSATION.id);
  };

  const addMessageToActiveConv = (messageData) => {
    const targetId = activeConvId;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === targetId || (prev.length === 1 && c.id === prev[0].id)) {
          const updatedMessages = [...(c.messages || []), messageData];
          // Auto-generate title from first question if currently default title
          let title = c.title;
          if (c.messages.length === 0 && messageData.transcribedText) {
            title = messageData.transcribedText.slice(0, 30) + (messageData.transcribedText.length > 30 ? '...' : '');
          }
          return { ...c, title, messages: updatedMessages };
        }
        return c;
      })
    );
  };

  const deleteMessageFromActiveConv = (messageId) => {
    const targetId = activeConvId;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === targetId) {
          return { ...c, messages: (c.messages || []).filter(m => m._id !== messageId && m.id !== messageId) };
        }
        return c;
      })
    );
  };

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
      conversations,
      activeConvId,
      activeConversation,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      clearAllConversations,
      addMessageToActiveConv,
      deleteMessageFromActiveConv,
      isSpeaking,
      stopSpeaking,
      queries,
      addQuery,
      approveQuery,
      communityIntel,
      addCommunityIntel,
      liveWeather,
      pendingReviewsCount,
      userLocation,
      setUserLocation,
      requestLocation,
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
