import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Edit3, Store, UserCheck, HeartHandshake, Sparkles, XCircle, RefreshCw } from 'lucide-react';

export default function TrustNodeDashboard() {
  const [pendingList, setPendingList] = useState([]);
  const [verifiedList, setVerifiedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingQueryId, setEditingQueryId] = useState(null);
  const [editHi, setEditHi] = useState('');
  const [editEn, setEditEn] = useState('');
  const [operatorNote, setOperatorNote] = useState('');

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trust/pending');
      if (res.ok) {
        const json = await res.json();
        setPendingList(json.data || []);
      }
    } catch (err) {
      console.warn('Error fetching pending trust items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleStartEdit = (q) => {
    setEditingQueryId(q._id);
    setEditHi(q.shortAnswerHi);
    setEditEn(q.shortAnswerEn);
    setOperatorNote(q.trustNote || '');
  };

  const handleAction = async (qId, actionType) => {
    try {
      await fetch('/api/trust/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryLogId: qId,
          operatorId: 'op_gupta_101',
          operatorName: 'Ramesh Gupta (Kirana Owner)',
          action: actionType, // 'APPROVE' | 'MODIFY' | 'REJECT'
          operatorNote,
          modifiedShortAnswerHi: actionType === 'MODIFY' ? editHi : '',
          modifiedShortAnswerEn: actionType === 'MODIFY' ? editEn : ''
        })
      });

      const processedItem = pendingList.find(q => q._id === qId);
      if (processedItem) {
        setVerifiedList(prev => [processedItem, ...prev]);
      }
      setPendingList(prev => prev.filter(q => q._id !== qId));
      setEditingQueryId(null);
    } catch (err) {
      console.error('Error submitting trust verification:', err);
    }
  };

  return (
    <div className="minimal-container">
      {/* Node Header Banner */}
      <div className="minimal-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Store size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0 }}>Gupta Kirana & CSC Node</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Azamgarh District Center #402 • Verified Edge Operator: Ramesh Gupta
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'block', lineHeight: 1 }}>
              {pendingList.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block', lineHeight: 1 }}>
              {verifiedList.length + 42}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified</span>
          </div>
        </div>
      </div>

      {/* Pending Queue Section */}
      <div className="minimal-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--accent-gold)" /> Pending Verification Queue ({pendingList.length})
          </h3>
          <button onClick={fetchPendingQueue} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
            <RefreshCw size={12} /> Refresh Queue
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading pending items...</p>
        ) : pendingList.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={32} color="var(--accent-cyan)" style={{ marginBottom: '6px' }} />
            <h4 style={{ color: 'var(--text-main)' }}>Queue Empty</h4>
            <p style={{ fontSize: '0.82rem' }}>All high-stakes answers have been reviewed and saved to MongoDB.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {pendingList.map((q) => (
              <div key={q._id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="status-text status-pending">
                    [{q.riskCategory || 'HIGH_STAKES'}]
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    User: {q.userName || 'Local Farmer'} ({q.userLocation})
                  </span>
                </div>

                <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '6px' }}>
                  Query: "{q.transcribedText}"
                </p>

                {q.trustNote && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
                    Reason: {q.trustNote}
                  </p>
                )}

                {editingQueryId === q._id ? (
                  <div style={{ padding: '12px 0' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modify Hindi Answer:</label>
                    <textarea
                      rows={2}
                      value={editHi}
                      onChange={e => setEditHi(e.target.value)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingQueryId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Cancel</button>
                      <button onClick={() => handleAction(q._id, 'MODIFY')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Save & Release</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                      {q.shortAnswerHi}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <em>{q.shortAnswerEn}</em>
                    </p>
                  </div>
                )}

                {editingQueryId !== q._id && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction(q._id, 'REJECT')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      <XCircle size={14} /> Reject
                    </button>
                    <button onClick={() => handleStartEdit(q)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      <Edit3 size={14} /> Modify
                    </button>
                    <button onClick={() => handleAction(q._id, 'APPROVE')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                      <ShieldCheck size={14} /> Approve & Save
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
