import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MyApplications from './MyApplications';
import {
  matchSchemesForProfile,
  querySchemeWithAi
} from '../services/schemeService';
import {
  FileText,
  User,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  Bot,
  Landmark,
  Edit3,
  Save,
  Award,
  BookOpen,
  X,
  MapPin,
  Sprout,
  IndianRupee,
  ClipboardList,
  Compass,
  Loader2,
  MailCheck
} from 'lucide-react';
import { DEFAULT_SLA_DAYS, DEFAULT_GRIEVANCE_EMAIL } from '../data/expandedSchemesData';

const STATES_LIST = [
  'Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra',
  'Punjab', 'Haryana', 'West Bengal', 'Odisha', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'All India'
];

const OCCUPATIONS = [
  'Farmer', 'Agriculture Worker', 'Small Merchant', 'Artisan',
  'Worker/Laborer', 'Student', 'Unemployed', 'Senior Citizen'
];

const CATEGORIES = [
  'Agriculture', 'Healthcare', 'Financial Inclusion', 'Housing',
  'Women & Child', 'Social Security', 'Education', 'State & Regional'
];

const inputCls =
  'w-full rounded-xl border border-black/[0.1] bg-zinc-50 px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 tabular-nums transition-colors duration-300 focus:bg-white focus:outline-none';

const labelCls =
  'block text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 mb-2';

export default function PublicSchemesDashboard() {
  const { language, userProfile, updateUserProfile } = useApp();
  const { user } = useAuth();
  const userId = user?.uid || 'user_demo_1';

  const [dashboardView, setDashboardView] = useState('browse'); // 'browse' | 'applications'
  const [appliedSchemeIds, setAppliedSchemeIds] = useState(new Set());
  const [isApplyFormOpen, setIsApplyFormOpen] = useState(false);
  const [applyRefNo, setApplyRefNo] = useState('');
  const [applyState, setApplyState] = useState('idle'); // 'idle' | 'saving' | 'done'
  const [applyError, setApplyError] = useState('');

  const [profile, setProfile] = useState({ ...userProfile });

  useEffect(() => {
    setProfile({ ...userProfile });
  }, [userProfile]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('matched'); // 'matched' | 'all' | 'ai_assistant'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const matchedSchemes = matchSchemesForProfile(profile);
  const strictlyMatchedSchemes = matchedSchemes.filter(s => s.status === 'Eligible' && s.matchScore >= 75);
  const strongMatches = strictlyMatchedSchemes.length;

  /* Close modal on Escape */
  useEffect(() => {
    if (!selectedScheme) return;
    const onKey = (e) => e.key === 'Escape' && setSelectedScheme(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedScheme]);

  /* Reset apply form whenever a different scheme is opened */
  useEffect(() => {
    resetApplyForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScheme?.id]);

  /* Load which schemes this user has already marked as applied */
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/applications/user/${encodeURIComponent(userId)}`)
      .then(async res => {
        if (!res.ok) return null;
        const text = await res.text();
        try { return JSON.parse(text); } catch (e) { return null; }
      })
      .then(json => {
        if (!cancelled && json?.success) {
          setAppliedSchemeIds(new Set((json.data || []).map(a => a.schemeId)));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const resetApplyForm = () => {
    setIsApplyFormOpen(false);
    setApplyRefNo('');
    setApplyState('idle');
    setApplyError('');
  };

  const handleMarkApplied = async () => {
    if (!selectedScheme) return;
    setApplyState('saving');
    setApplyError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail: user?.email || '',
          userName: profile.fullName,
          schemeId: selectedScheme.id,
          schemeNameEn: selectedScheme.title_en,
          schemeNameHi: selectedScheme.title_hi,
          ministryEn: selectedScheme.ministry_en,
          applicationRefNo: applyRefNo.trim(),
          slaDays: selectedScheme.slaDays || DEFAULT_SLA_DAYS,
          grievanceEmail: selectedScheme.grievanceEmail || DEFAULT_GRIEVANCE_EMAIL
        })
      });
      const text = await res.text();
      let json = {};
      try { json = JSON.parse(text); } catch (e) {}
      if (!res.ok || !json.success) {
        // 409 = already applied — treat as success state
        if (res.status === 409) {
          setAppliedSchemeIds(prev => new Set([...prev, selectedScheme.id]));
          setApplyState('done');
          return;
        }
        throw new Error(json.error || `Failed to record application (${res.status})`);
      }
      setAppliedSchemeIds(prev => new Set([...prev, selectedScheme.id]));
      setApplyState('done');
    } catch (err) {
      setApplyError(err.message);
      setApplyState('idle');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(profile);
    setIsEditingProfile(false);
  };

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setAiResponse('');
    const res = await querySchemeWithAi(profile, aiQuery, language);
    setAiResponse(res);
    setIsAiLoading(false);
  };

  const filteredAllSchemes = matchedSchemes.filter(scheme => {
    const matchSearch = scheme.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        scheme.title_hi.includes(searchQuery) ||
                        scheme.description_en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || scheme.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const TABS = [
    { id: 'matched', label: language === 'hi' ? 'मेरे लिए योग्य योजनाएं' : 'My Matches', icon: Award, count: strongMatches },
    { id: 'all', label: language === 'hi' ? 'सभी सार्वजनिक योजनाएं' : 'All Schemes', icon: BookOpen },
    { id: 'applications', label: language === 'hi' ? 'मेरे आवेदन' : 'My Applications', icon: ClipboardList },
    { id: 'ai_assistant', label: language === 'hi' ? 'AI योजना मित्र' : 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">

      {/* ── Page header ─────────────────────────────────────── */}
      <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            <span className="h-1 w-1 rounded-full bg-emerald-700" />
            {language === 'hi' ? 'सार्वजनिक योजना इंजन' : 'Public Scheme Intelligence'}
          </span>
          <h2 className="mt-5 font-condensed text-balance text-3xl font-semibold leading-[1.15] tracking-normal text-zinc-900 sm:text-[2.4rem]">
            {language === 'hi'
              ? 'आपके लिए कौन सी योजनाएं हैं?'
              : 'Find every scheme you qualify for.'}
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-zinc-500">
            {language === 'hi'
              ? 'अपनी जानकारी दर्ज करें और PM-Kisan, आयुष्मान भारत, PM आवास सहित सभी योजनाओं में अपनी पात्रता देखें।'
              : 'Enter your details once — LokVani matches you against Central & State schemes, benefits and application guidelines.'}
          </p>
        </div>

        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="btn-primary shrink-0 self-start sm:self-auto">
          {isEditingProfile ? <Save size={14} strokeWidth={1.5} /> : <Edit3 size={14} strokeWidth={1.5} />}
          <span>
            {isEditingProfile
              ? (language === 'hi' ? 'संपादक बंद करें' : 'Close editor')
              : (language === 'hi' ? 'प्रोफ़ाइल अपडेट करें' : 'Edit profile')}
          </span>
        </button>
      </header>

      {/* ── Profile editor ──────────────────────────────────── */}
      {(isEditingProfile || !profile.fullName) && (
        <section
          aria-label={language === 'hi' ? 'पात्रता प्रोफाइल' : 'Eligibility profile'}
          className="mb-8 rounded-[1.75rem] bg-white p-1.5 ring-1 ring-black/[0.06] shadow-[0_32px_80px_-40px_rgba(24,24,27,0.18)]"
        >
          <form onSubmit={handleSaveProfile} className="rounded-[calc(1.75rem-6px)] p-7 sm:p-9">
            <div className="mb-8 flex items-center gap-3 border-b border-black/[0.06] pb-5">
              <User size={16} strokeWidth={1.25} className="text-zinc-400" />
              <h3 className="font-condensed text-lg font-semibold text-zinc-900">
                {language === 'hi' ? 'व्यक्तिगत जानकारी' : 'Personal details'}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="pf-name" className={labelCls}>Full name</label>
                <input id="pf-name" type="text" name="fullName" value={profile.fullName || ''} onChange={handleProfileChange} required placeholder="e.g. Ramesh Kumar" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-age" className={labelCls}>Age</label>
                <input id="pf-age" type="number" name="age" value={profile.age || ''} onChange={handleProfileChange} required placeholder="e.g. 38" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-gender" className={labelCls}>Gender</label>
                <select id="pf-gender" name="gender" value={profile.gender || ''} onChange={handleProfileChange} className={inputCls}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              <div>
                <label htmlFor="pf-state" className={labelCls}>State</label>
                <select id="pf-state" name="state" value={profile.state || ''} onChange={handleProfileChange} className={inputCls}>
                  <option value="">Select State</option>
                  {STATES_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="pf-district" className={labelCls}>District</label>
                <input id="pf-district" type="text" name="district" value={profile.district || ''} onChange={handleProfileChange} placeholder="e.g. Azamgarh" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-occ" className={labelCls}>Occupation</label>
                <select id="pf-occ" name="occupation" value={profile.occupation || ''} onChange={handleProfileChange} className={inputCls}>
                  <option value="">Select Occupation</option>
                  {OCCUPATIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="pf-income" className={labelCls}>Annual household income (₹)</label>
                <input id="pf-income" type="number" name="annualIncome" value={profile.annualIncome || ''} onChange={handleProfileChange} step="5000" placeholder="e.g. 120000" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-land" className={labelCls}>Land holding (acres)</label>
                <input id="pf-land" type="number" name="landHoldingAcres" value={profile.landHoldingAcres || ''} onChange={handleProfileChange} step="0.1" placeholder="e.g. 1.8" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-cat" className={labelCls}>Social category</label>
                <select id="pf-cat" name="casteCategory" value={profile.casteCategory || ''} onChange={handleProfileChange} className={inputCls}>
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <input type="checkbox" id="isBpl" name="isBpl" checked={profile.isBpl} onChange={handleProfileChange} className="h-4 w-4 cursor-pointer rounded accent-zinc-900" />
                <label htmlFor="isBpl" className="cursor-pointer text-sm font-medium text-zinc-700">Has BPL / ration card</label>
              </div>

              <div className="flex items-center gap-2.5">
                <input type="checkbox" id="isDisability" name="isDisability" checked={profile.isDisability} onChange={handleProfileChange} className="h-4 w-4 cursor-pointer rounded accent-zinc-900" />
                <label htmlFor="isDisability" className="cursor-pointer text-sm font-medium text-zinc-700">Divyangjan / disability status</label>
              </div>

              <div className="flex justify-end sm:col-span-2 lg:col-span-3">
                <button type="submit" className="btn-primary">
                  <Save size={14} strokeWidth={1.5} />
                  <span>{language === 'hi' ? 'सहें और देखें' : 'Save & calculate matches'}</span>
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* ── Active profile summary ──────────────────────────── */}
      {!isEditingProfile && profile.fullName && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-black/[0.06] bg-white/70 px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-zinc-600">
            <span className="flex items-center gap-1.5 text-zinc-800">
              <User size={13} strokeWidth={1.5} className="text-zinc-400" />
              {profile.fullName}
              <span className="text-zinc-400">· {profile.age}, {profile.gender}</span>
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <MapPin size={13} strokeWidth={1.5} className="text-zinc-400" />
              {profile.district}, {profile.state}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Sprout size={13} strokeWidth={1.5} className="text-[#48734f]" />
              {profile.occupation} · {profile.landHoldingAcres} acres
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <IndianRupee size={13} strokeWidth={1.5} className="text-[#a07a1e]" />
              {Number(profile.annualIncome).toLocaleString('en-IN')}/yr
            </span>
            {profile.isBpl && (
              <span className="rounded-full border border-black/[0.07] bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
                BPL card
              </span>
            )}
          </div>

          <button
            onClick={() => setIsEditingProfile(true)}
            className="group flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors duration-500 ease-premium hover:text-zinc-800"
          >
            <Edit3 size={12} strokeWidth={1.5} className="transition-transform duration-500 ease-premium group-hover:-translate-y-px" />
            Update profile
          </button>
        </div>
      )}

      {/* ── Tabs — segmented pill control ───────────────────── */}
      <div
        role="tablist"
        aria-label={language === 'hi' ? 'योजना टैब' : 'Scheme sections'}
        className="mb-10 inline-flex max-w-full overflow-x-auto rounded-full border border-black/[0.06] bg-white p-1"
      >
        {TABS.map(({ id, label, icon: Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(id)}
              className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-500 ease-premium active:scale-[0.97] ${
                active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon size={13} strokeWidth={1.5} />
              <span>{label}</span>
              {count > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? 'bg-white/15' : 'bg-black/[0.05]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Matched schemes ─────────────────────────────────── */}
      {activeTab === 'matched' && (
        strictlyMatchedSchemes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-black/[0.1] bg-white p-12 text-center">
            <Award size={28} strokeWidth={1.25} className="text-amber-500" />
            <h3 className="font-condensed text-base font-semibold text-zinc-900">
              {language === 'hi' ? 'आपकी प्रोफ़ाइल के लिए कोई सटीक योजना नहीं मिली' : 'No Exact Matches for Current Profile'}
            </h3>
            <p className="max-w-md text-sm text-zinc-500">
              {language === 'hi'
                ? 'कृपया "प्रोफ़ाइल संपादन" पर जाकर अपनी सही जानकारी भरें या "सभी सार्वजनिक योजनाएं" में खोजें।'
                : 'Try editing your profile details or browse the full catalog under "All Schemes".'}
            </p>
            <button onClick={() => setIsEditingProfile(true)} className="btn-primary mt-2">
              {language === 'hi' ? 'प्रोफ़ाइल अपडेट करें' : 'Update Profile'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {strictlyMatchedSchemes.map(scheme => (
              <article
                key={scheme.id}
                className="group flex flex-col rounded-3xl border border-black/[0.06] bg-white p-6 transition-all duration-700 ease-premium hover:-translate-y-1 hover:border-black/[0.1] hover:shadow-[0_28px_60px_-32px_rgba(24,24,27,0.25)] sm:p-7"
              >
                <div className="flex-1">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                      {scheme.category}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f4f8f2] px-2.5 py-0.5 text-[11px] font-semibold text-[#48734f] tabular-nums">
                      <CheckCircle2 size={11} strokeWidth={1.5} />
                      {scheme.matchScore}% {language === 'hi' ? 'योग्य' : 'Match'}
                    </span>
                  </div>

                  <h3 className="text-balance font-condensed text-lg font-semibold leading-snug text-zinc-900">
                    {language === 'hi' ? scheme.title_hi : scheme.title_en}
                  </h3>

                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Landmark size={12} strokeWidth={1.5} />
                    <span>{language === 'hi' ? scheme.ministry_hi : scheme.ministry_en}</span>
                  </p>

                  <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-500">
                    {language === 'hi' ? scheme.description_hi : scheme.description_en}
                  </p>

                  {/* Financial Benefit */}
                  <div className="mt-4 rounded-xl border border-black/[0.05] bg-zinc-50/80 p-3.5">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      {language === 'hi' ? 'लाभ (Benefits)' : 'Benefits'}
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-relaxed text-zinc-800">
                      {language === 'hi' ? scheme.benefits_hi : scheme.benefits_en}
                    </span>
                  </div>
                </div>

                <button onClick={() => setSelectedScheme(scheme)} className="btn-secondary mt-5 w-full">
                  <FileText size={14} strokeWidth={1.5} />
                  <span>{language === 'hi' ? 'दस्तावेज़ व आवेदन विवरण' : 'Documents & Process'}</span>
                </button>
              </article>
            ))}
          </div>
        )
      )}

      {/* ── All schemes directory ───────────────────────────── */}
      {activeTab === 'all' && (
        <div>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={14} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'योजना या मंत्रालय खोजें…' : 'Search scheme or ministry…'}
                aria-label={language === 'hi' ? 'योजना खोजें' : 'Search schemes'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-black/[0.08] bg-white py-2.5 pl-10 pr-4 text-base sm:text-sm text-zinc-900 transition-colors duration-300 placeholder:text-zinc-400 focus:border-black/[0.16] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label={language === 'hi' ? 'श्रेणी फ़िल्टर' : 'Category filters'}>
              {['All', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  aria-pressed={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-500 ease-premium active:scale-[0.96] ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 text-white'
                      : 'border border-black/[0.07] bg-white text-zinc-500 hover:border-black/[0.16] hover:text-zinc-800'
                  }`}
                >
                  {cat === 'All' ? (language === 'hi' ? 'सभी' : 'All') : cat}
                </button>
              ))}
            </div>
          </div>

          {filteredAllSchemes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-black/[0.1] py-20 text-center">
              <Search size={20} strokeWidth={1.25} className="text-zinc-300" />
              <p className="text-sm text-zinc-400">
                {language === 'hi' ? 'कोई योजना नहीं मिली — खोज बदलकर देखें।' : 'No schemes found — try a different search or category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {filteredAllSchemes.map(scheme => (
                <article
                  key={scheme.id}
                  className="group flex flex-col rounded-3xl border border-black/[0.06] bg-white p-6 transition-all duration-700 ease-premium hover:-translate-y-1 hover:border-black/[0.1] hover:shadow-[0_28px_60px_-32px_rgba(24,24,27,0.25)] sm:p-7"
                >
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                        {scheme.category}
                      </span>
                      <span className="shrink-0 rounded-full border border-black/[0.06] bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
                        {scheme.badge}
                      </span>
                    </div>

                    <h3 className="text-balance font-condensed text-lg font-semibold leading-snug text-zinc-900">
                      {language === 'hi' ? scheme.title_hi : scheme.title_en}
                    </h3>

                    <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-500">
                      {language === 'hi' ? scheme.description_hi : scheme.description_en}
                    </p>
                  </div>

                  <button onClick={() => setSelectedScheme(scheme)} className="btn-secondary mt-5 w-full">
                    {language === 'hi' ? 'विवरण देखें' : 'Details & documents'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI assistant ────────────────────────────────────── */}
      {activeTab === 'ai_assistant' && (
        <div className="rounded-[1.75rem] bg-white p-1.5 ring-1 ring-black/[0.06] shadow-[0_32px_80px_-40px_rgba(24,24,27,0.18)]">
          <div className="rounded-[calc(1.75rem-6px)] p-7 sm:p-9">
            <div className="mb-7 flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.07] bg-zinc-50 text-zinc-700">
                <Bot size={18} strokeWidth={1.25} />
              </span>
              <div>
                <h3 className="font-condensed text-lg font-semibold text-zinc-900">
                  {language === 'hi' ? 'AI योजना मित्र' : 'AI Scheme Mitra'}
                </h3>
                <p className="mt-1 max-w-lg text-pretty text-[13px] leading-relaxed text-zinc-500">
                  Ask anything about eligibility, documents or application steps for your matched schemes.
                </p>
              </div>
            </div>

            <form onSubmit={handleAiAsk} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder={
                  language === 'hi'
                    ? 'उदा: क्या मुझे 1.5 एकड़ जमीन के साथ PM Kisan योजना मिलेगी?'
                    : 'e.g. Am I eligible for PM-Kisan with 1.8 acres in UP?'
                }
                aria-label={language === 'hi' ? 'अपना प्रश्न पूछें' : 'Ask your question'}
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                className="flex-1 rounded-2xl border border-black/[0.1] bg-zinc-50 px-5 py-3.5 text-base sm:text-sm text-zinc-900 transition-colors duration-300 placeholder:text-zinc-400 focus:bg-white focus:outline-none"
              />
              <button type="submit" disabled={isAiLoading || !aiQuery.trim()} className="btn-primary sm:self-start">
                <Sparkles size={14} strokeWidth={1.5} />
                <span>{isAiLoading ? (language === 'hi' ? 'विश्लेषण…' : 'Analyzing…') : (language === 'hi' ? 'पूछें' : 'Ask')}</span>
              </button>
            </form>

            {isAiLoading && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-zinc-50 px-5 py-4">
                <Bot size={15} strokeWidth={1.5} className="animate-pulse text-[#48734f]" />
                <p className="text-sm text-zinc-500">
                  {language === 'hi' ? 'आपकी प्रोफ़ाइल योजनाओं से मिलाई जा रही है…' : 'Checking your profile against scheme guidelines…'}
                </p>
              </div>
            )}

            {aiResponse && !isAiLoading && (
              <div className="mt-6 rounded-2xl border border-black/[0.05] bg-zinc-50 p-6 sm:p-7">
                <p className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                  <Sparkles size={12} strokeWidth={1.5} className="text-[#c49a2a]" />
                  {language === 'hi' ? 'AI सलाह' : 'AI advice'}
                </p>
                <p className="max-w-[68ch] whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-700">
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── My Applications (tracker + grievance) ───────────── */}
      {activeTab === 'applications' && (
        <MyApplications
          userName={profile.fullName}
          userEmail={user?.email || ''}
          onBrowseSchemes={() => setActiveTab('matched')}
        />
      )}

      {/* ── Scheme detail modal ─────────────────────────────── */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedScheme(null)}
          />

          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-black/[0.08] bg-white p-6 shadow-2xl transition-all duration-700 ease-premium sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  {selectedScheme.category}
                </span>
                <h2 className="mt-1 font-condensed text-xl font-bold text-zinc-900">
                  {language === 'hi' ? selectedScheme.title_hi : selectedScheme.title_en}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <Landmark size={12} strokeWidth={1.5} />
                  <span>{language === 'hi' ? selectedScheme.ministry_hi : selectedScheme.ministry_en}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                aria-label={language === 'hi' ? 'बंद करें' : 'Close dialog'}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/[0.07] text-zinc-400 transition-all duration-500 ease-premium hover:border-black/[0.16] hover:text-zinc-800 active:scale-[0.95]"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            <section className="mb-6">
              <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Description</h3>
              <p className="text-pretty text-sm leading-relaxed text-zinc-600">
                {language === 'hi' ? selectedScheme.description_hi : selectedScheme.description_en}
              </p>
            </section>

            <section className="mb-6 rounded-2xl border border-black/[0.05] bg-zinc-50 p-5">
              <h3 className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                Financial benefit
              </h3>
              <p className="text-[15px] font-medium leading-relaxed text-zinc-800">
                {language === 'hi' ? selectedScheme.benefits_hi : selectedScheme.benefits_en}
              </p>
            </section>

            <section className="mb-7">
              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                Required documents
              </h3>
              <ul className="space-y-2.5 text-sm text-zinc-600">
                {(language === 'hi' ? selectedScheme.requiredDocuments_hi : selectedScheme.requiredDocuments_en).map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#48734f]" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── Mark as applied ─────────────────────────── */}
            <section className="mb-7 rounded-2xl border border-black/[0.05] bg-zinc-50 p-5">
              {applyState === 'done' || appliedSchemeIds.has(selectedScheme.id) ? (
                <div className="flex items-start gap-3">
                  <MailCheck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#48734f]" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {language === 'hi' ? 'आवेदन दर्ज — ट्रैकिंग शुरू' : 'Application tracked'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {language === 'hi'
                        ? `दिन-गणक चालू हो गया। ${selectedScheme.slaDays || DEFAULT_SLA_DAYS} दिन बीत जाने पर "मेरे आवेदन" टैब से शिकायत दर्ज कर सकते हैं।`
                        : `Day counter started. If you haven't received the benefit within ${selectedScheme.slaDays || DEFAULT_SLA_DAYS} days, file a complaint from the “My Applications” tab.`}
                    </p>
                  </div>
                </div>
              ) : isApplyFormOpen ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-800">
                    {language === 'hi' ? 'आवेदन हो गया? ट्रैकिंग शुरू करें' : 'Already applied? Start tracking'}
                  </p>
                  <label htmlFor="apply-ref" className={labelCls}>
                    {language === 'hi' ? 'सरकारी आवेदन संख्या (वैकल्पिक)' : 'Govt application ref no. (optional)'}
                  </label>
                  <input
                    id="apply-ref"
                    type="text"
                    value={applyRefNo}
                    onChange={(e) => setApplyRefNo(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: PMK/2026/123456' : 'e.g. PMK/2026/123456'}
                    maxLength={100}
                    className={`${inputCls} mb-4`}
                  />
                  {applyError && (
                    <p className="mb-3 text-xs font-medium text-red-600">{applyError}</p>
                  )}
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleMarkApplied}
                      disabled={applyState === 'saving'}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      {applyState === 'saving' && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
                      <span>{language === 'hi' ? 'हाँ, मैंने आवेदन किया' : 'Yes, I applied'}</span>
                    </button>
                    <button onClick={resetApplyForm} className="btn-secondary">
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {language === 'hi' ? 'पोर्टल पर आवेदन किया?' : 'Applied on the portal?'}
                    </p>
                    <p className="mt-1 max-w-[46ch] text-xs leading-relaxed text-zinc-500">
                      {language === 'hi'
                        ? 'ट्रैकिंग शुरू करें — SLA बीतने पर सीधे विभाग को शिकायत भेजें।'
                        : 'Mark it to start the day counter — complain directly if the SLA passes.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsApplyFormOpen(true)}
                    className="btn-secondary shrink-0"
                  >
                    <CheckCircle2 size={14} strokeWidth={1.5} />
                    <span>{language === 'hi' ? 'मैंने आवेदन किया' : 'I Applied ✓'}</span>
                  </button>
                </div>
              )}
            </section>

            <div className="flex justify-end gap-3 border-t border-black/[0.06] pt-5">
              <button onClick={() => setSelectedScheme(null)} className="btn-secondary">
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
              <a
                href={selectedScheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>{language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official portal'}</span>
                <ExternalLink size={14} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
