import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Save,
  MapPin,
  Sprout,
  IndianRupee,
  Cpu,
  Code2,
  Globe,
  Phone,
  Mail,
  GitBranch,
  Activity,
  Award,
  FileText,
  Building2,
  RefreshCw,
  Download,
  Sparkles,
  AlertTriangle,
  Lock,
  Compass,
  Check
} from 'lucide-react';
import { matchSchemesForProfile } from '../services/schemeService';

const STATES_LIST = [
  'Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra',
  'Punjab', 'Haryana', 'West Bengal', 'Odisha', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'All India'
];

const OCCUPATIONS = [
  'Farmer', 'Agriculture Worker', 'Small Merchant', 'Artisan',
  'Worker/Laborer', 'Student', 'Unemployed', 'Senior Citizen', 'Software Engineer / IT Professional'
];

const DIALECTS = [
  { code: 'hi', name: 'Hindi (Standard / मानक)' },
  { code: 'bhoj', name: 'Bhojpuri (भोजपुरी)' },
  { code: 'awadh', name: 'Awadhi (अवधी)' },
  { code: 'en', name: 'English (Indian)' },
];

const inputCls =
  'w-full rounded-xl border border-black/[0.1] bg-zinc-50 px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 tabular-nums transition-all duration-300 focus:bg-white focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900';

const labelCls =
  'block text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 mb-2';

export default function Dashboard() {
  const { language, userProfile, updateUserProfile, requestLocation, setActiveTab } = useApp();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ ...userProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Keep form data synced if userProfile changes externally
  useEffect(() => {
    setFormData({ ...userProfile });
  }, [userProfile]);

  // Calculate Profile Completion Score
  const calculateCompletion = () => {
    const fields = [
      formData.fullName,
      formData.age,
      formData.gender,
      formData.state,
      formData.district,
      formData.occupation,
      formData.annualIncome,
      formData.phone,
      formData.technicalRole
    ];
    const filled = fields.filter(val => val !== undefined && val !== null && String(val).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionScore = calculateCompletion();

  // Matched schemes calculation
  const matchedSchemes = matchSchemesForProfile(formData);
  const eligibleSchemesCount = matchedSchemes.filter(s => s.status === 'Eligible' && s.matchScore >= 75).length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaveSuccess(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGeolocate = async () => {
    setIsLocating(true);
    try {
      const loc = await requestLocation();
      if (loc) {
        setFormData(prev => ({
          ...prev,
          state: loc.state || prev.state,
          district: loc.district || prev.district,
          gpsCoordinates: `${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E`
        }));
      }
    } catch (err) {
      console.warn('Geolocation error:', err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lokvani_profile_${formData.fullName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

      {/* ── Top Header Banner ─────────────────────────────────── */}
      <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-condensed text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {language === 'hi' ? `स्वागत है, ${formData.fullName || 'नागरिक'}` : `Welcome back, ${formData.fullName || 'User'}`}
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-sm text-zinc-500">
            {language === 'hi'
              ? 'अपनी व्यक्तिगत एवं तकनीकी जानकारी अपडेट करें। यह विवरण आपकी योजनाओं और सामुदायिक सेवाओं के लिए उपयोग होता है।'
              : 'Complete your profile details below to unlock personalized scheme matching, priority community intel, and direct benefit tracking.'}
          </p>
        </div>
      </header>


      {/* ── Main Details Configuration Form Card ────────────── */}
      <section className="rounded-[1.75rem] bg-white p-1.5 ring-1 ring-black/[0.06] shadow-[0_32px_80px_-40px_rgba(24,24,27,0.18)]">
        <form onSubmit={handleSave} className="rounded-[calc(1.75rem-6px)] p-6 sm:p-9">

          <div className="space-y-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-condensed text-lg font-bold text-zinc-900">
                  {language === 'hi' ? 'सार्वजनिक योजनाओं की पात्रता विवरण' : 'Public Schemes Eligibility Profile'}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  These details match your profile against central & state welfare schemes.
                </p>
              </div>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Profile updated successfully!
                </span>
              )}
            </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="fullName" className={labelCls}>Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="age" className={labelCls}>Age (Years) *</label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleChange}
                    required
                    min="18"
                    max="110"
                    placeholder="e.g. 38"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className={labelCls}>Gender</label>
                  <select id="gender" name="gender" value={formData.gender || ''} onChange={handleChange} className={inputCls}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="state" className={labelCls}>State</label>
                  <select id="state" name="state" value={formData.state || ''} onChange={handleChange} className={inputCls}>
                    <option value="">Select State</option>
                    {STATES_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="district" className={labelCls}>District</label>
                  <div className="relative">
                    <input
                      id="district"
                      type="text"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleChange}
                      placeholder="e.g. Azamgarh"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={isLocating}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800"
                      title="Fetch GPS District"
                    >
                      <MapPin size={14} className={isLocating ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="occupation" className={labelCls}>Primary Occupation</label>
                  <select id="occupation" name="occupation" value={formData.occupation || ''} onChange={handleChange} className={inputCls}>
                    <option value="">Select Occupation</option>
                    {OCCUPATIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="annualIncome" className={labelCls}>Annual Household Income (₹)</label>
                  <input
                    id="annualIncome"
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome || ''}
                    onChange={handleChange}
                    step="5000"
                    placeholder="e.g. 120000"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="landHoldingAcres" className={labelCls}>Land Holding (Acres)</label>
                  <input
                    id="landHoldingAcres"
                    type="number"
                    name="landHoldingAcres"
                    value={formData.landHoldingAcres || ''}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="e.g. 1.8"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="casteCategory" className={labelCls}>Social Category</label>
                  <select id="casteCategory" name="casteCategory" value={formData.casteCategory || ''} onChange={handleChange} className={inputCls}>
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-zinc-50 px-4 py-3 sm:col-span-1">
                  <input
                    type="checkbox"
                    id="isBpl"
                    name="isBpl"
                    checked={formData.isBpl}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="isBpl" className="cursor-pointer text-xs font-semibold text-zinc-800">
                    BPL / Ration Card Holder
                  </label>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-zinc-50 px-4 py-3 sm:col-span-1">
                  <input
                    type="checkbox"
                    id="isDisability"
                    name="isDisability"
                    checked={formData.isDisability}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="isDisability" className="cursor-pointer text-xs font-semibold text-zinc-800">
                    Divyangjan / Special Disability Status
                  </label>
                </div>
              </div>
            </div>


          {/* Bottom Save Action Bar */}
          <div className="mt-8 flex items-center justify-between border-t border-black/[0.06] pt-6">
            <button
              type="button"
              onClick={() => setActiveTab('schemes')}
              className="btn-secondary text-xs"
            >
              Go to Schemes Dashboard &rarr;
            </button>

            <button
              type="submit"
              className="btn-primary text-xs"
            >
              <Save size={14} />
              <span>{saveSuccess ? 'Saved ✓' : 'Save Details & Unlock All Features'}</span>
            </button>
          </div>

        </form>
      </section>

    </div>
  );
}
