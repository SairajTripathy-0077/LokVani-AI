/**
 * poolService.js
 * ──────────────────────────────────────────────────────────────────────────
 * MongoDB-first Multi-User Synchronization Engine for FPO Crop Pools.
 * 
 * Features:
 *  1. Primary MongoDB Atlas REST API (/api/pools) for Vercel serverless persistence
 *  2. Automatic live polling & Firestore dual-sync for instant updates
 *  3. Resilient Local Offline Fallback Cache
 */

import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  query 
} from 'firebase/firestore';

const API_BASE = '/api/pools';
const FIRESTORE_COLLECTION = 'crop_pools';

/**
 * Get or create a persistent unique user ID for creator authorization.
 */
export function getOrCreateUserId() {
  try {
    let id = localStorage.getItem('lokvani_creator_user_id');
    if (!id) {
      id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('lokvani_creator_user_id', id);
    }
    return id;
  } catch (_) {
    return 'usr_guest_farmer';
  }
}

/**
 * Normalize pool object structure to guarantee consistent property names across MongoDB, Firestore, & UI.
 */
export function normalizePool(p) {
  if (!p) return null;
  const poolId = p.poolId || p._id || p.id;
  return {
    id: poolId,
    poolId: poolId,
    commodity_hi: p.commodity_hi || p.commodity || 'फसल',
    commodity_en: p.commodity_en || p.commodity || 'Crop',
    category_hi: p.category_hi || 'सब्ज़ी',
    category_en: p.category_en || 'Vegetable',
    targetQtl: Number(p.targetQtl) || 100,
    filledQtl: Number(p.filledQtl) || 0,
    buyerName: p.buyerName || 'Verified Procurement Partner',
    buyerLocation: p.buyerLocation || 'APMC Mandi Hub',
    offerPrice: Number(p.offerPrice) || 2500,
    deadline: p.deadline ? String(p.deadline).split('T')[0] : new Date().toISOString().split('T')[0],
    qualityRequired: p.qualityRequired || 'Grade A',
    status: p.status || (Number(p.filledQtl) >= Number(p.targetQtl) ? 'CLOSED' : 'OPEN'),
    coordinatorName_hi: p.coordinatorName_hi || 'किराना ट्रस्ट नोड (सत्यापित)',
    coordinatorName_en: p.coordinatorName_en || 'Kirana Trust Node (Verified)',
    participants: Number(p.participants) || 1,
    members: Array.isArray(p.members) ? p.members : [],
    createdBy: p.createdBy || 'Community Farmer',
    createdByUserId: p.createdByUserId || '',
    createdAt: p.createdAt || new Date().toISOString()
  };
}

/**
 * Fetch crop pools from MongoDB REST API (/api/pools).
 * Falls back to Firestore and local storage if offline.
 */
export async function fetchCropPools(state = '', district = '', category = 'All') {
  // 1. Try Primary MongoDB REST API (/api/pools)
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    if (category && category !== 'All') params.append('category', category);

    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const pools = json.data.map(normalizePool);
        try { localStorage.setItem('lokvani_fpo_pools', JSON.stringify(pools)); } catch (_) {}
        return pools;
      }
    }
  } catch (err) {
    console.warn('[poolService] REST API fetch warning:', err.message);
  }

  // 2. Fallback to Firestore if REST API is unavailable
  try {
    if (db) {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      if (!snap.empty) {
        let pools = snap.docs.map(d => normalizePool({ id: d.id, ...d.data() }));
        if (category && category !== 'All') {
          pools = pools.filter(p => 
            p.category_en?.toLowerCase() === category.toLowerCase() ||
            p.category_hi?.toLowerCase() === category.toLowerCase()
          );
        }
        pools.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return pools;
      }
    }
  } catch (_) {}

  // 3. Fallback Local Storage
  try {
    const saved = localStorage.getItem('lokvani_fpo_pools');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizePool);
    }
  } catch (_) {}

  return [];
}

/**
 * Create a new FPO Crop Selling Pool in MongoDB.
 * Dual-syncs to Firestore and local storage.
 */
export async function createCropPool(poolData) {
  const userId = getOrCreateUserId();
  const poolId = poolData.poolId || poolData.id || `pool_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  
  const payload = {
    ...poolData,
    poolId,
    id: poolId,
    createdByUserId: poolData.createdByUserId || userId,
    createdAt: poolData.createdAt || new Date().toISOString()
  };

  const normalized = normalizePool(payload);

  // 1. Save to MongoDB via REST API
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const saved = normalizePool(json.data);
        // Dual-sync to Firestore
        syncToFirestore(saved.id, saved);
        return saved;
      }
    }
  } catch (err) {
    console.warn('[poolService] MongoDB create warning:', err.message);
  }

  // 2. Fallback sync to Firestore directly
  syncToFirestore(poolId, normalized);
  return normalized;
}

/**
 * Join an existing crop pool by contributing quantity in MongoDB.
 */
export async function joinCropPool(poolId, commitData) {
  const { farmerName, phone, village, qtl } = commitData;
  const commitQtl = Number(qtl) || 0;

  // 1. Save contribution in MongoDB
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(poolId)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerName, phone, village: village || '', qtl: commitQtl })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const updated = normalizePool(json.data);
        syncToFirestore(updated.id, updated);
        return updated;
      }
    }
  } catch (err) {
    console.warn('[poolService] MongoDB join warning:', err.message);
  }

  // 2. Firestore fallback join
  try {
    if (db) {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      const targetDoc = snap.docs.find(d => d.id === poolId || d.data().poolId === poolId);
      if (targetDoc) {
        const data = targetDoc.data();
        const newFilled = (data.filledQtl || 0) + commitQtl;
        const newStatus = newFilled >= data.targetQtl ? 'CLOSED' : 'FILLING';
        const members = data.members || [];
        members.push({ farmerName, phone, village: village || '', qtl: commitQtl, joinedAt: new Date().toISOString() });

        const updatePayload = {
          filledQtl: newFilled,
          participants: (data.participants || 1) + 1,
          status: newStatus,
          members
        };

        await updateDoc(doc(db, FIRESTORE_COLLECTION, targetDoc.id), updatePayload);
        return normalizePool({ ...data, ...updatePayload, id: targetDoc.id });
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Update an existing Crop Pool in MongoDB.
 */
export async function updateCropPool(poolId, updatedData) {
  const userId = getOrCreateUserId();
  const payload = {
    ...updatedData,
    createdByUserId: updatedData.createdByUserId || userId
  };
  const normalized = normalizePool(payload);

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(poolId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const saved = normalizePool(json.data);
        syncToFirestore(saved.id, saved);
        return saved;
      }
    }
  } catch (err) {
    console.warn('[poolService] MongoDB update warning:', err.message);
  }

  syncToFirestore(poolId, normalized);
  return normalized;
}

/**
 * Delete a Crop Pool from MongoDB.
 */
export async function deleteCropPool(poolId) {
  const userId = getOrCreateUserId();

  try {
    fetch(`${API_BASE}/${encodeURIComponent(poolId)}?creatorId=${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch (_) {}

  try {
    if (db) {
      deleteDoc(doc(db, FIRESTORE_COLLECTION, poolId)).catch(() => {});
    }
  } catch (_) {}

  return true;
}

/**
 * Subscribe to real-time crop pools stream.
 * Polls MongoDB API every 3s and listens to Firestore snapshot stream.
 */
export function subscribeCropPools(onUpdate) {
  let isSubscribed = true;

  // Poll MongoDB REST API
  const pollInterval = setInterval(async () => {
    if (!isSubscribed) return;
    const pools = await fetchCropPools();
    if (isSubscribed && Array.isArray(pools) && pools.length > 0) {
      onUpdate(pools);
    }
  }, 3000);

  // Initial fetch immediately
  fetchCropPools().then(pools => {
    if (isSubscribed && Array.isArray(pools) && pools.length > 0) {
      onUpdate(pools);
    }
  });

  // Dual-subscribe to Firestore if enabled
  let firestoreUnsub = null;
  try {
    if (db) {
      const poolsQuery = query(collection(db, FIRESTORE_COLLECTION));
      firestoreUnsub = onSnapshot(poolsQuery, (snapshot) => {
        if (!isSubscribed) return;
        if (!snapshot.empty) {
          const pools = snapshot.docs.map(d => normalizePool({ id: d.id, ...d.data() }));
          pools.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          onUpdate(pools);
        }
      }, () => {});
    }
  } catch (_) {}

  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    if (firestoreUnsub) {
      try { firestoreUnsub(); } catch (_) {}
    }
  };
}

// Helper to save Firestore record safely
async function syncToFirestore(docId, data) {
  try {
    if (db && docId) {
      await setDoc(doc(db, FIRESTORE_COLLECTION, docId), data, { merge: true });
    }
  } catch (_) {}
}
