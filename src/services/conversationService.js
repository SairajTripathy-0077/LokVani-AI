/**
 * LokVani AI — Conversation Management & Persistence Service
 * Handles persistence, smart title extraction, date grouping, and CRUD operations
 * for multi-thread voice-AI conversation sessions.
 */

const STORAGE_KEY = 'lokvani_conversations';
const ACTIVE_CONV_KEY = 'lokvani_active_conv_id';

const DEFAULT_CONVERSATION = {
  id: 'default',
  title: 'New Conversation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: []
};

/**
 * Generate natural conversation title from first user prompt
 */
export function generateSmartTitle(queryText = '') {
  if (!queryText || typeof queryText !== 'string') return 'New Conversation';
  const text = queryText.trim();
  if (text.length <= 32) return text;

  // Extract key topic if present
  const lower = text.toLowerCase();
  if (lower.includes('weather') || lower.includes('baarish') || lower.includes('mausam')) {
    return text.length > 35 ? 'Weather Advisory' : text;
  }
  if (lower.includes('mandi') || lower.includes('bhav') || lower.includes('rate') || lower.includes('price')) {
    return text.length > 35 ? 'Mandi Price Query' : text;
  }
  if (lower.includes('soil') || lower.includes('mitti') || lower.includes('khad')) {
    return text.length > 35 ? 'Soil & Fertilizer Advisory' : text;
  }
  if (lower.includes('fasal') || lower.includes('crop') || lower.includes('gehun') || lower.includes('tomato')) {
    return text.length > 35 ? 'Crop Recommendation' : text;
  }

  return text.slice(0, 32) + '...';
}

/**
 * Categorize icon hint based on conversation title / content
 */
export function getConversationCategoryIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('weather') || t.includes('mausam') || t.includes('baarish') || t.includes('rain')) return '☁️';
  if (t.includes('mandi') || t.includes('bhav') || t.includes('rate') || t.includes('price') || t.includes('tomato')) return '📈';
  if (t.includes('soil') || t.includes('mitti') || t.includes('khad') || t.includes('fertilizer')) return '🌱';
  if (t.includes('crop') || t.includes('fasal') || t.includes('gehun') || t.includes('wheat') || t.includes('rice')) return '🌾';
  if (t.includes('scheme') || t.includes('yojana') || t.includes('kisan')) return '🛡️';
  return '🎙️';
}

/**
 * Group conversations into Today, Yesterday, Previous 7 Days, and Older
 */
export function groupConversationsByDate(conversations = [], language = 'en') {
  const groups = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: []
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const sevenDaysStart = todayStart - 6 * 86400000;

  (conversations || []).forEach(conv => {
    const createdTime = new Date(conv.updatedAt || conv.createdAt || Date.now()).getTime();

    if (createdTime >= todayStart) {
      groups.today.push(conv);
    } else if (createdTime >= yesterdayStart) {
      groups.yesterday.push(conv);
    } else if (createdTime >= sevenDaysStart) {
      groups.previous7Days.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  const labels = language === 'hi' ? {
    today: 'आज (Today)',
    yesterday: 'बीता कल (Yesterday)',
    previous7Days: 'पिछले 7 दिन (Past 7 Days)',
    older: 'पुराने (Older)'
  } : {
    today: 'Today',
    yesterday: 'Yesterday',
    previous7Days: 'Previous 7 Days',
    older: 'Older'
  };

  return [
    { key: 'today', label: labels.today, items: groups.today },
    { key: 'yesterday', label: labels.yesterday, items: groups.yesterday },
    { key: 'previous7Days', label: labels.previous7Days, items: groups.previous7Days },
    { key: 'older', label: labels.older, items: groups.older }
  ].filter(g => g.items.length > 0);
}

/**
 * Load all conversations from localStorage
 */
export function getStoredConversations() {
  if (typeof window === 'undefined') return [DEFAULT_CONVERSATION];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[conversationService] Error reading conversations:', err);
  }
  return [DEFAULT_CONVERSATION];
}

/**
 * Save conversations array to localStorage
 */
export function saveConversations(conversations) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn('[conversationService] Error saving conversations:', err);
  }
}

/**
 * Load active conversation ID
 */
export function getStoredActiveConvId() {
  if (typeof window === 'undefined') return DEFAULT_CONVERSATION.id;
  return localStorage.getItem(ACTIVE_CONV_KEY) || DEFAULT_CONVERSATION.id;
}

/**
 * Save active conversation ID
 */
export function saveActiveConvId(id) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_CONV_KEY, id);
}
