import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertTriangle, CheckCircle2, Edit3, Store, UserCheck, Award, XCircle, HeartHandshake, Sparkles, Send } from 'lucide-react';

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
    if (confirm('Are you sure you want to reject this AI draft? It will be flagged for model re-training.')) {
      setRejectedIds(prev => [...prev, qId]);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 12px' }}>
      
      {/* Trust Node Header Banner */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
            }}>
              <Store size={26} color="#04111d" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>Gupta Kirana & CSC Node</h2>
                <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>
                  <UserCheck size={12} /> Certified Verifier
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Azamgarh Village Center #402 • Operator: Ramesh Gupta
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'block', lineHeight: 1 }}>
                {pendingQueries.length}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</span>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', display: 'block', lineHeight: 1 }}>
                {verifiedQueries.length + 42}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified</span>
            </div>
          </div>

        </div>
      </div>

      {/* Gamified Civic Engagement Widget */}
      <div className="glass-card glass-card-accent" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <HeartHandshake size={22} color="var(--accent-amber)" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: '#fff', fontSize: '0.98rem', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--accent-amber)" /> Civic Impact This Week
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            🎉 <strong>You have helped 42 farmers & micro-vendors</strong> in Azamgarh get verified government scheme & crop advice this week!
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'none', minWidth: '100px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 700 }}>Village Trust Rating</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'block' }}>99.4%</span>
        </div>
      </div>

      {/* Pending Review Queue Section */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="var(--accent-amber)" />
          Pending Verification Queue ({pendingQueries.length})
        </h3>

        {pendingQueries.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={44} color="var(--accent-emerald)" style={{ marginBottom: '10px' }} />
            <h4 style={{ color: '#fff', marginBottom: '4px' }}>Queue Empty! All Queries Verified</h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>All high-stakes answers have been reviewed and released to villagers.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingQueries.map((q) => (
              <div key={q.id} className="glass-card" style={{ padding: '20px', borderLeft: '5px solid var(--accent-amber)' }}>
                
                {/* User Info & Risk Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <span className="badge badge-high-stakes" style={{ marginRight: '8px', fontSize: '0.72rem' }}>
                      {q.risk_category || 'HIGH STAKES'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                      {q.user} ({q.location})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {q.timestamp}
                  </span>
                </div>

                {/* Original Spoken Query */}
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                    Original Spoken Query:
                  </span>
                  <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>"{q.queryText}"</p>
                </div>

                {/* Why Flagged Reason Banner */}
                {q.trust_note && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                    padding: '8px 12px',
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
                  <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid var(--border-glass-accent)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <h5 style={{ color: 'var(--accent-emerald)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Edit AI Drafted Answer</h5>
                    
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Hindi Voice Text:</label>
                    <textarea
                      rows={2}
                      value={editHi}
                      onChange={e => setEditHi(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '8px', fontSize: '0.9rem' }}
                    />

                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>English Translation:</label>
                    <textarea
                      rows={2}
                      value={editEn}
                      onChange={e => setEditEn(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '8px', fontSize: '0.85rem' }}
                    />

                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Kirana Note:</label>
                    <input
                      type="text"
                      placeholder="e.g. Checked Khasra paper & dosage safety"
                      value={operatorNote}
                      onChange={e => setOperatorNote(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '10px', fontSize: '0.85rem' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingQueryId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                      <button onClick={() => handleSaveApprove(q.id)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Save & Release</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                      AI Proposed Answer Draft:
                    </span>
                    <p style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 4px 0', lineHeight: 1.4 }}>
                      {q.short_answer_hi}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      <em>{q.short_answer_en}</em>
                    </p>
                  </div>
                )}

                {/* 3 Large Touch Action Buttons (Approve / Edit / Reject) */}
                {editingQueryId !== q.id && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                    <button
                      onClick={() => handleReject(q.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: 'var(--accent-rose)',
                        borderRadius: 'var(--radius-full)',
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
                      style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                    >
                      <Edit3 size={16} /> Edit & Send
                    </button>

                    <button
                      onClick={() => handleQuickApprove(q)}
                      className="btn-primary"
                      style={{ fontSize: '0.88rem', padding: '8px 20px' }}
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
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--accent-emerald)" />
          Recently Verified by Node ({verifiedQueries.length})
        </h3>

        {verifiedQueries.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recently verified answers yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {verifiedQueries.map((vq) => (
              <div key={vq.id} className="glass-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>
                    <CheckCircle2 size={12} /> Verified by {vq.verified_by || 'Gupta Kirana Node'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {vq.verified_at || 'Just now'}
                  </span>
                </div>
                <p style={{ color: '#fff', fontSize: '0.92rem', margin: '0 0 2px 0', fontWeight: 600 }}>
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
