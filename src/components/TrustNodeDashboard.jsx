import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertTriangle, CheckCircle2, Edit3, Store, UserCheck, Award, ArrowUpRight } from 'lucide-react';

export default function TrustNodeDashboard() {
  const { queries, approveQuery } = useApp();
  const [editingQueryId, setEditingQueryId] = useState(null);
  const [editHi, setEditHi] = useState('');
  const [editEn, setEditEn] = useState('');
  const [operatorNote, setOperatorNote] = useState('');

  const pendingQueries = queries.filter(q => q.status === 'PENDING_TRUST_REVIEW');
  const verifiedQueries = queries.filter(q => q.status === 'VERIFIED_BY_TRUST_NODE');

  const handleStartEdit = (q) => {
    setEditingQueryId(q.id);
    setEditHi(q.short_answer_hi);
    setEditEn(q.short_answer_en);
    setOperatorNote(q.operator_notes || '');
  };

  const handleSaveApprove = (qId) => {
    approveQuery(qId, editHi, editEn, operatorNote);
    setEditingQueryId(null);
  };

  const handleQuickApprove = (q) => {
    approveQuery(q.id, q.short_answer_hi, q.short_answer_en, 'Verified by Kirana Operator');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Node Header Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.04))', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}>
              <Store size={28} color="#04111d" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>Gupta Kirana & CSC Node</h2>
                <span className="badge badge-verified">
                  <UserCheck size={12} /> Certified Verifier Node
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Azamgarh Village Center #402 • Operator: Ramesh Gupta
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'block', lineHeight: 1 }}>
                {pendingQueries.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Reviews</span>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '20px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', display: 'block', lineHeight: 1 }}>
                {verifiedQueries.length + 18}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Answers</span>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '20px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-teal)', display: 'block', lineHeight: 1 }}>
                99.4%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Node Trust Score</span>
            </div>
          </div>

        </div>
      </div>

      {/* Pending Reviews Queue Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="var(--accent-amber)" />
          High-Stakes Verification Queue ({pendingQueries.length})
        </h3>

        {pendingQueries.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} color="var(--accent-emerald)" style={{ marginBottom: '12px' }} />
            <h4>All High-Stakes Queries Verified!</h4>
            <p style={{ fontSize: '0.88rem' }}>No pending AI answers requiring Kirana node approval at this moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingQueries.map((q) => (
              <div key={q.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-amber)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <span className="badge badge-high-stakes" style={{ marginRight: '8px' }}>
                      {q.risk_category || 'HIGH STAKES'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      From: <strong>{q.user}</strong> ({q.location})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Received: {q.timestamp}
                  </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', marginBottom: '14px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>User Query:</span>
                  <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>"{q.queryText}"</p>
                </div>

                {editingQueryId === q.id ? (
                  /* Edit Mode Form */
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--border-glass-accent)', padding: '16px', borderRadius: '8px', marginBottom: '14px' }}>
                    <h5 style={{ color: 'var(--accent-emerald)', margin: '0 0 10px 0' }}>Edit AI Drafted Answer</h5>
                    
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Hindi Voice Answer:</label>
                    <textarea
                      rows={2}
                      value={editHi}
                      onChange={e => setEditHi(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '10px' }}
                    />

                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>English Translation:</label>
                    <textarea
                      rows={2}
                      value={editEn}
                      onChange={e => setEditEn(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '10px' }}
                    />

                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Operator Note / Document Check:</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified Khasra paper format & local store dosage"
                      value={operatorNote}
                      onChange={e => setOperatorNote(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '12px' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingQueryId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                      <button onClick={() => handleSaveApprove(q.id)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Save & Approve</button>
                    </div>
                  </div>
                ) : (
                  /* AI Draft Display */
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      AI Proposed Spoken Answer:
                    </span>
                    <p style={{ color: '#fff', fontSize: '0.98rem', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {q.short_answer_hi}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      <em>{q.short_answer_en}</em>
                    </p>
                    
                    {q.trust_note && (
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-amber)' }}>
                        <strong>Risk Reason:</strong> {q.trust_note}
                      </div>
                    )}
                  </div>
                )}

                {/* Operator Actions */}
                {editingQueryId !== q.id && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleStartEdit(q)}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    >
                      <Edit3 size={14} /> Edit Answer
                    </button>
                    <button
                      onClick={() => handleQuickApprove(q)}
                      className="btn-primary"
                      style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                    >
                      <ShieldCheck size={16} /> 1-Click Approve & Broadcast
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
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--accent-emerald)" />
          Recently Verified by Your Node ({verifiedQueries.length})
        </h3>

        {verifiedQueries.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>No verified query logs yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {verifiedQueries.map((vq) => (
              <div key={vq.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-verified">
                    <CheckCircle2 size={12} /> Verified by {vq.verified_by || 'Gupta Kirana'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {vq.verified_at || 'Just now'}
                  </span>
                </div>
                <p style={{ color: '#fff', fontSize: '0.92rem', margin: '0 0 4px 0', fontWeight: 600 }}>
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
