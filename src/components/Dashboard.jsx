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
  const [activeFormTab, setActiveFormTab] = useState('demographics'); // 'demographics' | 'engineering' | 'logs'
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User Session Initiated', timestamp: new Date().toLocaleTimeString(), detail: `Authenticated as ${user?.email || 'User'}` },
    { id: 2, action: 'Profile Cache Loaded', timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), detail: 'Synced with LokVani storage engine' },
    { id: 3, action: 'Trust Node Check', timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), detail: 'Aadhaar e-KYC Token valid' },
  ]);

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

    setAuditLogs(prev => [
      {
        id: Date.now(),
        action: 'Profile Updated',
        timestamp: new Date().toLocaleTimeString(),
        detail: `Updated details for ${formData.fullName || 'User'}`
      },
      ...prev
    ]);

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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="btn-secondary text-xs"
            title="Export Profile as JSON"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleSave}
            className="btn-primary text-xs"
          >
            <Save size={14} />
            <span>{saveSuccess ? (language === 'hi' ? 'सहेजा गया ✓' : 'Saved ✓') : (language === 'hi' ? 'विवरण सहेजें' : 'Save Profile')}</span>
          </button>
        </div>
      </header>

      {/* ── Notice Banner if Profile is Incomplete ───────────── */}
      {completionScore < 70 && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {language === 'hi' ? 'प्रोफ़ाइल अधूरी है' : 'Profile Action Required'}
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                {language === 'hi'
                  ? 'सभी सरकारी योजनाओं का लाभ उठाने के लिए कृपया अपनी जानकारी पूरी भरें।'
                  : 'Please complete your demographic and identity details below to enable full platform features.'}
              </p>
            </div>
          </div>
          <span className="shrink-0 font-mono text-xs font-bold text-amber-800">
            {completionScore}% Complete
          </span>
        </div>
      )}

      {/* ── System Overview Cards (Bento Grid) ──────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Completion Meter */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all hover:border-black/[0.12]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Completion</span>
            <User size={16} className="text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-condensed text-3xl font-bold text-zinc-900">{completionScore}%</span>
            <span className="text-xs text-zinc-500">score</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>

        {/* Card 2: Eligible Schemes */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all hover:border-black/[0.12]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Scheme Matches</span>
            <Award size={16} className="text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-condensed text-3xl font-bold text-zinc-900">{eligibleSchemesCount}</span>
            <span className="text-xs text-emerald-700 font-semibold">Eligible Now</span>
          </div>
          <button
            onClick={() => setActiveTab('schemes')}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900"
          >
            View Scheme Portal &rarr;
          </button>
        </div>

        {/* Card 3: Identity & Trust Tier */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all hover:border-black/[0.12]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">Trust Level</span>
            <ShieldCheck size={16} className="text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-condensed text-xl font-bold text-zinc-900">
              {formData.cscNodeId ? 'CSC Node' : 'Verified'}
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">Tier 1</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400 font-mono">
            Node: {formData.cscNodeId || 'AZM-NODE-01'}
          </p>
        </div>

        {/* Card 4: Direct Benefit Linkage */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all hover:border-black/[0.12]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">DBT Linkage</span>
            <IndianRupee size={16} className="text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className font-condensed text-xl font-bold text-zinc-900>
              {formData.dbtBankLinked ? 'Active' : 'Pending'}
            </span>
            {formData.dbtBankLinked && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Aadhaar Seeded</span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            {formData.dbtBankLinked ? 'Ready for Direct Transfers' : 'Action needed at Kirana CSC'}
          </p>
        </div>
      </div>

      {/* ── Main Details Configuration Form Card ────────────── */}
      <section className="rounded-[1.75rem] bg-white p-1.5 ring-1 ring-black/[0.06] shadow-[0_32px_80px_-40px_rgba(24,24,27,0.18)]">
        <form onSubmit={handleSave} className="rounded-[calc(1.75rem-6px)] p-6 sm:p-9">

          {/* Form Tabs Switcher */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFormTab('demographics')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeFormTab === 'demographics'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <User size={14} />
                <span>{language === 'hi' ? '1. व्यक्तिगत व योजना विवरण' : '1. Schemes Demographics'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('engineering')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeFormTab === 'engineering'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Code2 size={14} />
                <span>{language === 'hi' ? '2. सॉफ्टवेयर व संपर्क सेटिंग्स' : '2. Engineer & Identity Extensions'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('logs')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeFormTab === 'logs'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Activity size={14} />
                <span>{language === 'hi' ? '3. ऑडिट लॉग' : '3. System Activity Log'}</span>
              </button>
            </div>

            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Profile updated successfully!
              </span>
            )}
          </div>

          {/* ── TAB 1: SCHEMES DEMOGRAPHICS (Exact details from schemes page) ── */}
          {activeFormTab === 'demographics' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="font-condensed text-lg font-bold text-zinc-900">
                  {language === 'hi' ? 'सार्वजनिक योजनाओं की पात्रता विवरण' : 'Public Schemes Eligibility Profile'}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  These details match your profile against central & state welfare schemes.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="fullName" className={labelCls}>Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Ramesh Kumar"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="age" className={labelCls}>Age (Years) *</label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="110"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className={labelCls}>Gender</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="state" className={labelCls}>State</label>
                  <select id="state" name="state" value={formData.state} onChange={handleChange} className={inputCls}>
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
                      value={formData.district}
                      onChange={handleChange}
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
                  <select id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className={inputCls}>
                    {OCCUPATIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="annualIncome" className={labelCls}>Annual Household Income (₹)</label>
                  <input
                    id="annualIncome"
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    step="5000"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="landHoldingAcres" className={labelCls}>Land Holding (Acres)</label>
                  <input
                    id="landHoldingAcres"
                    type="number"
                    name="landHoldingAcres"
                    value={formData.landHoldingAcres}
                    onChange={handleChange}
                    step="0.1"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="casteCategory" className={labelCls}>Social Category</label>
                  <select id="casteCategory" name="casteCategory" value={formData.casteCategory} onChange={handleChange} className={inputCls}>
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
          )}

          {/* ── TAB 2: SOFTWARE ENGINEER & IDENTITY EXTENSIONS ──────────── */}
          {activeFormTab === 'engineering' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="font-condensed text-lg font-bold text-zinc-900">
                  {language === 'hi' ? 'सॉफ्टवेयर इंजीनियर व डिजिटल पहचान सेटिंग्स' : 'Software Engineer & Digital Identity Stack'}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Extended identity credentials, communication preferences, and developer metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="phone" className={labelCls}>Phone Number (WhatsApp)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="secondaryEmail" className={labelCls}>Secondary / Recovery Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="secondaryEmail"
                      type="email"
                      name="secondaryEmail"
                      value={formData.secondaryEmail}
                      onChange={handleChange}
                      placeholder="dev@example.com"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="technicalRole" className={labelCls}>Technical Role / Profession</label>
                  <input
                    id="technicalRole"
                    type="text"
                    name="technicalRole"
                    value={formData.technicalRole}
                    onChange={handleChange}
                    placeholder="Full-Stack Engineer / Agritech Researcher"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="githubUrl" className={labelCls}>GitHub Profile URL</label>
                  <div className="relative">
                    <Code2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="githubUrl"
                      type="text"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="portfolioUrl" className={labelCls}>Portfolio / Web Link</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="portfolioUrl"
                      type="text"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://myportfolio.dev"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cscNodeId" className={labelCls}>CSC Node Affiliation ID</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="cscNodeId"
                      type="text"
                      name="cscNodeId"
                      value={formData.cscNodeId}
                      onChange={handleChange}
                      placeholder="CSC-AZM-4021"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gpsCoordinates" className={labelCls}>Geofence Coordinates</label>
                  <input
                    id="gpsCoordinates"
                    type="text"
                    name="gpsCoordinates"
                    value={formData.gpsCoordinates}
                    onChange={handleChange}
                    readOnly
                    className={`${inputCls} bg-zinc-100 text-zinc-500 font-mono text-xs`}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-zinc-50 px-4 py-3 sm:col-span-1">
                  <input
                    type="checkbox"
                    id="isKycVerified"
                    name="isKycVerified"
                    checked={formData.isKycVerified}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="isKycVerified" className="cursor-pointer text-xs font-semibold text-zinc-800">
                    Aadhaar e-KYC Token Active
                  </label>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-zinc-50 px-4 py-3 sm:col-span-1">
                  <input
                    type="checkbox"
                    id="dbtBankLinked"
                    name="dbtBankLinked"
                    checked={formData.dbtBankLinked}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="dbtBankLinked" className="cursor-pointer text-xs font-semibold text-zinc-800">
                    Direct Benefit Transfer (DBT) Linked
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: AUDIT LOGS ───────────────────────────────────────── */}
          {activeFormTab === 'logs' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-condensed text-lg font-bold text-zinc-900">System Activity & Audit Trail</h3>
                <p className="mt-1 text-xs text-zinc-500">Immutable security event history for your session.</p>
              </div>

              <div className="rounded-xl border border-black/[0.08] bg-zinc-900 text-zinc-100 p-4 font-mono text-xs overflow-x-auto space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-zinc-800 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-zinc-500 shrink-0">[{log.timestamp}]</span>
                    <span className="text-emerald-400 font-bold shrink-0">{log.action}:</span>
                    <span className="text-zinc-300">{log.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
