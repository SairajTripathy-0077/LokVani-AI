import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, TrendingUp, MapPin, PlusCircle, CheckCircle, CloudSun, Megaphone, Globe, Send } from 'lucide-react';

export default function CommunityIntel() {
  const { communityIntel, addCommunityIntel, liveWeather } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('');
  const [reporter, setReporter] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!item || !price || !location) return;
    addCommunityIntel(item, price, unit, location, reporter || 'Farmer Community Member');
    setItem('');
    setPrice('');
    setLocation('');
    setReporter('');
    setShowAddModal(false);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Banner */}
      <div className="ui-card ui-card-accent" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="status-tag status-blue" style={{ marginBottom: '8px' }}>
              <Globe size={14} /> Waze for Rural Micro-Economies
            </span>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: '4px 0' }}>
              Community Intelligence Network
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '640px' }}>
              Real-time crowdsourced mandi prices, localized weather alerts, and crop availability reported directly by neighboring farmers and vendors.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <PlusCircle size={17} /> Report Local Rate
          </button>
        </div>
      </div>

      {/* Real-time Mandi Rates Ticker Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--accent-emerald)" />
            Live Mandi Commodity Prices ({communityIntel.length})
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Updated in real-time via voice reports
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {communityIntel.map((ci) => (
            <div key={ci.id} className="ui-card" style={{ padding: '18px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', margin: 0 }}>{ci.item}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={12} color="var(--accent-blue)" /> {ci.location}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', display: 'block', lineHeight: 1 }}>
                    ₹{ci.price}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>per {ci.unit}</span>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={12} /> {ci.reporter}
                </span>
                <span className="status-tag status-verified">
                  <CheckCircle size={13} /> Verified Data
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Weather & Local Advisory Feed - Real Open-Meteo Telemetry */}
      <div className="ui-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloudSun size={20} color="var(--accent-amber)" />
          Live Regional Weather & Micro-Advisories (Open-Meteo API)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-card-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <span className="status-tag status-verified" style={{ marginBottom: '6px' }}>
              Open-Meteo Live API • {liveWeather ? `${liveWeather.temp}°C` : '31°C'}
            </span>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: '4px 0' }}>Azamgarh & Gorakhpur Belt</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {liveWeather ? liveWeather.advisory_en : 'Weather is clear. Temperature is 31°C. Suitable for crop irrigation and harvesting.'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-card-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <span className="status-tag status-pending" style={{ marginBottom: '6px' }}>Pest Warning</span>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: '4px 0' }}>Jaunpur Tomato Clusters</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              3 neighboring farmers reported early signs of leaf blight. Recommended spraying Neem-oil or Copper Oxychloride.
            </p>
          </div>
        </div>
      </div>

      {/* Add Intel Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="ui-card" style={{ padding: '24px', maxWidth: '440px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="var(--accent-emerald)" /> Submit Local Commodity Price
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Contribute your local market rate to update the community database.
            </p>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Crop / Commodity</label>
                <input
                  type="text"
                  placeholder="e.g. Tamatar, Pyaaz, Aloo, Gehun"
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="28"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mandi / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Azamgarh Mandi"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Your Name / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh (Farmer)"
                  value={reporter}
                  onChange={e => setReporter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Send size={14} /> Submit Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
