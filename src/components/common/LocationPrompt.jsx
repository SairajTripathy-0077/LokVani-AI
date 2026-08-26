import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function LocationPrompt() {
  const { requestLocation, setUserLocation, language } = useApp();
  const lang = language || 'hi';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [selectedState, setSelectedState] = useState('');

  const handleAutoCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestLocation();
    } catch (err) {
      setError(lang === 'hi' ? 'स्थान प्राप्त करने में विफल। कृपया अनुमति दें या मैन्युअल रूप से चुनें।' : 'Failed to capture location. Please allow permissions or select manually.');
      setShowManual(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!selectedState) return;
    setUserLocation({
      lat: null,
      lng: null,
      state: selectedState,
      district: ''
    });
  };

  const text = {
    title: lang === 'hi' ? 'अपना स्थान सेट करें' : 'Set Your Location',
    sub: lang === 'hi' ? 'स्थानीय मंडी भाव, खरीदार और समाचार देखने के लिए।' : 'To see local mandi prices, buyers, and news.',
    autoBtn: lang === 'hi' ? 'वर्तमान स्थान का उपयोग करें' : 'Use Current Location',
    manualBtn: lang === 'hi' ? 'मैन्युअल रूप से चुनें' : 'Select Manually',
    saveBtn: lang === 'hi' ? 'सहेजें' : 'Save',
    selectPlaceholder: lang === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'
  };

  return (
    <div className="community-int__section" style={{ border: '2px solid var(--accent-primary)', background: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 10px' }}>
        <div style={{ background: 'rgba(72,115,79,0.1)', padding: '12px', borderRadius: '50%', marginBottom: '16px', color: 'var(--accent-primary)' }}>
          <MapPin size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '8px' }}>{text.title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px' }}>
          {text.sub}
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e74c3c', background: 'rgba(231,76,60,0.1)', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {!showManual ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
            <button 
              onClick={handleAutoCapture} 
              className="btn-primary" 
              disabled={loading}
              style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Navigation size={18} />
              )}
              {loading ? (lang === 'hi' ? 'खोज रहा है...' : 'Locating...') : text.autoBtn}
            </button>
            <button 
              onClick={() => setShowManual(true)} 
              className="btn-secondary"
              style={{ padding: '12px' }}
            >
              {text.manualBtn}
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="community-int__field" style={{ marginBottom: 0 }}>
              <select 
                className="community-int__input" 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                required
              >
                <option value="" disabled>{text.selectPlaceholder}</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              {text.saveBtn}
            </button>
          </form>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
