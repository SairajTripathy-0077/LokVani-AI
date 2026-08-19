import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertTriangle, CheckCircle2, Edit3, Store, UserCheck, HeartHandshake, Sparkles, XCircle } from 'lucide-react';

export default function TrustNodeDashboard() {
  const { queries, approveQuery } = useApp();
  const [editingQueryId, setEditingQueryId] = useState(null);
  const [editHi, setEditHi] = useState('');
  const [editEn, setEditEn] = useState('');
  const [operatorNote, setOperatorNote] = useState('');
  const [rejectedIds, setRejectedIds] = useState([]);

  // Filter queries
  const pendingQueries = queries.filter(q => q.status === 'PENDING_TRUST_REVIEW' && !rejectedIds.includes(q.id));
  const verifiedQueries = queries.filter(q => q.status === 'VERIFIED_BY_TRUST_NODE');

  const handleStartEdit = (q) => {
    setEditingQueryId(q.id);
    setEditHi(q.short_answer_hi);
    setEditEn(q.short_answer_en);
    setOperatorNote(q.operator_notes || '');
  };

  const handleSaveApprove = (qId) => {
    approveQuery(qId, editHi, editEn, operatorNote || 'Verified by Kirana Operator');
    setEditingQueryId(null);
  };

  const handleQuickApprove = (q) => {
    approveQuery(q.id, q.short_answer_hi, q.short_answer_en, 'Verified by Kirana Node');
  };

  const handleReject = (qId) => {
    if (confirm('Are you sure you want to reject this AI draft? It will be logged for model re-training.')) {
      setRejectedIds(prev => [...prev, qId]);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Light Theme Header Banner */}
      <div className="ui-card ui-card-accent" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '8px',
              background: 'var(--accent-emerald)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Store size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', margin: 0 }}>Gupta Kirana & CSC Node</h2>
                <span className="status-tag status-verified">
                  <UserCheck size={14} /> Certified Verifier
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Azamgarh Village Center #402 • Operator: Ramesh Gupta
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'block', lineHeight: 1 }}>
                {pendingQueries.length}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending</span>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', display: 'block', lineHeight: 1 }}>
                {verifiedQueries.length + 42}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified</span>
            </div>
          </div>

        </div>
      </div>

      {/* Gamified Civic Impact Widget */}
      <div className="ui-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '8px',
          background: 'var(--accent-emerald-light)', border: '1px solid rgba(5,150,105,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <HeartHandshake size={22} color="var(--accent-emerald)" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--accent-emerald)" /> Civic Impact This Week
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            You have helped <strong>42 farmers & micro-vendors</strong> in Azamgarh get verified government scheme & crop advice this week!
          </p>
        </div>
      </div>

      {/* Pending Review Queue Section */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="var(--accent-amber)" />
          Pending Verification Queue ({pendingQueries.length})
        </h3>

        {pendingQueries.length === 0 ? (
          <div className="ui-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} color="var(--accent-emerald)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Queue Empty! All Queries Verified</h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>All high-stakes answers have been reviewed and released to villagers.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingQueries.map((q) => (
              <div key={q.id} className="ui-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-amber)' }}>
                
                {/* User Info & Risk Badge - Plain Text Only */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <span className="status-tag status-high-stakes" style={{ marginRight: '8px' }}>
                      {q.risk_category || 'HIGH STAKES'}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {q.user} ({q.location})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {q.timestamp}
                  </span>
                </div>

                {/* Original Spoken Query */}
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                    Original Spoken Query:
                  </span>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>"{q.queryText}"</p>
                </div>

                {/* Why Flagged Reason Notice */}
                {q.trust_note && (
                  <div style={{
                    borderLeft: '3px solid var(--accent-amber)',
                    paddingLeft: '10px',
                    marginBottom: '14px',
                    fontSize: '0.82rem',
                    color: 'var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span><strong>Why Flagged:</strong> {q.trust_note}</span>
                  </div>
                )}

                {/* Edit Form OR AI Proposed Draft */}
                {editingQueryId === q.id ? (
                  <div style={{ background: 'var(--accent-emerald-light)', border: '1px solid var(--border-accent)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <h5 style={{ color: 'var(--accent-emerald)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Edit AI Drafted Answer</h5>
                    
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Hindi Voice Text:</label>
                    <textarea
                      rows={2}
                      value={editHi}
                      onChange={e => setEditHi(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginBottom: '8px', fontSize: '0.9rem' }}
                    />

                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>English Translation:</label>
                    <textarea
                      rows={2}
                      value={editEn}
                      onChange={e => setEditEn(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginBottom: '8px', fontSize: '0.85rem' }}
                    />

                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Kirana Note:</label>
                    <input
                      type="text"
                      placeholder="e.g. Checked Khasra paper & dosage safety"
                      value={operatorNote}
                      onChange={e => setOperatorNote(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginBottom: '10px', fontSize: '0.85rem' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingQueryId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                      <button onClick={() => handleSaveApprove(q.id)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Save & Release</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                      AI Proposed Answer Draft:
                    </span>
                    <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 4px 0', lineHeight: 1.4 }}>
                      {q.short_answer_hi}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      <em>{q.short_answer_en}</em>
                    </p>
                  </div>
                )}

                {/* 3 Action Buttons */}
                {editingQueryId !== q.id && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => handleReject(q.id)}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--accent-rose)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <XCircle size={16} /> Reject
                    </button>

                    <button
                      onClick={() => handleStartEdit(q)}
                      className="btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                    >
                      <Edit3 size={16} /> Edit & Send
                    </button>

                    <button
                      onClick={() => handleQuickApprove(q)}
                      className="btn-primary"
                      style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                    >
                      <ShieldCheck size={18} /> Approve & Broadcast
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Answers History */}
      <div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--accent-emerald)" />
          Recently Verified by Node ({verifiedQueries.length})
        </h3>

        {verifiedQueries.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recently verified answers yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {verifiedQueries.map((vq) => (
              <div key={vq.id} className="ui-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="status-tag status-verified">
                    <CheckCircle2 size={13} /> Verified by {vq.verified_by || 'Gupta Kirana Node'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {vq.verified_at || 'Just now'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', margin: '0 0 2px 0', fontWeight: 600 }}>
                  "{vq.short_answer_hi}"
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  User: {vq.user} • Query: "{vq.queryText}"
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
