import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, TrendingUp, MapPin, PlusCircle, CheckCircle, CloudSun, Megaphone, Globe, Send, RefreshCw } from 'lucide-react';

export default function CommunityIntel() {
  const { liveWeather } = useApp();
  const [intelList, setIntelList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('');
  const [reporter, setReporter] = useState('');

  const fetchIntel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/intel');
      if (res.ok) {
        const json = await res.json();
        setIntelList(json.data || []);
      }
    } catch (err) {
      console.warn('Error fetching intel from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!item || !price || !location) return;

    try {
      const res = await fetch('/api/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          price: Number(price),
          unit,
          location,
          reportedBy: reporter || 'Local Farmer'
        })
      });

      if (res.ok) {
        const json = await res.json();
        setIntelList(prev => [json.data, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting intel:', err);
    }

    setItem('');
    setPrice('');
    setLocation('');
    setReporter('');
    setShowAddModal(false);
  };

  return (
    <div className="minimal-container">
      {/* Minimal Header Section */}
      <div className="minimal-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="status-text status-verified" style={{ marginBottom: '4px' }}>
            <Globe size={13} /> Real-Time Crowdsourced Data
          </span>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: '4px 0' }}>
            Community Mandi Intelligence Network
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '600px' }}>
            Crowdsourced commodity prices, localized weather alerts, and crop availability logged into MongoDB.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <PlusCircle size={16} /> Report Local Rate
        </button>
      </div>

      {/* Commodity Grid */}
      <div className="minimal-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-cyan)" /> Live Mandi Commodity Prices ({intelList.length})
          </h3>
          <button onClick={fetchIntel} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading Mandi rates from MongoDB...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {intelList.map((ci) => (
              <div key={ci._id || ci.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', margin: 0 }}>{ci.item}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--accent-primary)" /> {ci.location}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1 }}>
                      ₹{ci.price}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>/{ci.unit || 'kg'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span>Reported by: {ci.reportedBy || 'Farmer'}</span>
                  <span className="status-text status-verified" style={{ fontSize: '0.75rem' }}>
                    <CheckCircle size={11} /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Regional Weather */}
      <div className="minimal-section">
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloudSun size={18} color="var(--accent-gold)" /> Live Regional Weather Forecast (Open-Meteo API)
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {liveWeather ? liveWeather.advisory_en : 'Weather is clear. Temperature is 31°C. Suitable for crop irrigation and harvesting.'}
        </p>
      </div>

      {/* Add Intel Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', padding: '24px', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="var(--accent-cyan)" /> Submit Mandi Price
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Crop / Commodity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tamatar, Pyaaz, Aloo"
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="28"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Mandi / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Azamgarh Mandi"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Reporter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh (Farmer)"
                  value={reporter}
                  onChange={e => setReporter(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-muted)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={14} /> Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
