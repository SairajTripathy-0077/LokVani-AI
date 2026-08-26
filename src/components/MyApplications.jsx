import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Landmark,
  Inbox,
  Lock,
  Send,
  ClipboardList
} from 'lucide-react';

const CLOSED_STATUSES = ['APPROVED', 'REJECTED', 'WITHDRAWN'];

// TESTING BYPASS: set VITE_ALLOW_EARLY_COMPLAINT=true to always enable the complain button
const ALLOW_EARLY_COMPLAINT = import.meta.env.VITE_ALLOW_EARLY_COMPLAINT === 'true';

const STATUS_META = {
  WAITING:    { en: 'Waiting',        hi: 'प्रतीक्षारत', tone: 'open' },
  COMPLAINED: { en: 'Complaint filed', hi: 'शिकायत दर्ज', tone: 'escalated' },
  APPROVED:   { en: 'Approved',       hi: 'स्वीकृत',     tone: 'good' },
  REJECTED:   { en: 'Rejected',       hi: 'अस्वीकृत',    tone: 'bad' },
  WITHDRAWN:  { en: 'Withdrawn',      hi: 'वापस लिया',   tone: 'closed' }
};

const BADGE_TONES = {
  open:      'border border-black/[0.08] bg-white text-zinc-600',
  escalated: 'bg-red-50 text-red-700',
  good:      'bg-zinc-900 text-white',
  bad:       'bg-zinc-100 text-zinc-500',
  closed:    'bg-zinc-100 text-zinc-500'
};

function daysBetween(from) {
  return Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / 86400000));
}

export default function MyApplications({ userName, userEmail, onBrowseSchemes }) {
  const { language } = useApp();
  const { user } = useAuth();
  const userId = user?.uid || 'user_demo_1';

  const [applications, setApplications] = useState([]);
  const [allowEarlyComplaint, setAllowEarlyComplaint] = useState(ALLOW_EARLY_COMPLAINT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [complaintReceipts, setComplaintReceipts] = useState({});

  const hi = language === 'hi';

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/applications/user/${encodeURIComponent(userId)}`);
      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (_) {}
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to load applications (${res.status})`);
      setApplications(json.data || []);
      if (typeof json.allowEarlyComplaint === 'boolean') {
        setAllowEarlyComplaint(json.allowEarlyComplaint);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const handleComplain = async (application) => {
    setBusyId(application._id);
    setError('');
    try {
      const res = await fetch(`/api/applications/${application._id}/complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (_) {}
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to file complaint (${res.status})`);

      setApplications(prev => prev.map(a => (a._id === application._id ? { ...a, status: 'COMPLAINED', complaints: [...(a.complaints || []), json.complaint] } : a)));
      setComplaintReceipts(prev => ({
        ...prev,
        [application._id]: { id: json.complaint?.complaintId || `LV-CMP-${Date.now()}`, emailSent: json.emailSent }
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (application, status) => {
    setBusyId(application._id);
    try {
      const res = await fetch(`/api/applications/${application._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (_) {}
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to update status (${res.status})`);
      setApplications(prev => prev.map(a => (a._id === application._id ? { ...a, status } : a)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const open = applications.filter(a => !CLOSED_STATUSES.includes(a.status));
  const closed = applications.filter(a => CLOSED_STATUSES.includes(a.status));

  const stats = [
    { en: 'Active',      hi: 'सक्रिय',     value: open.length },
    { en: 'SLA breached', hi: 'SLA पार',   value: open.filter(a => daysBetween(a.appliedAt) >= (a.slaDays || 30)).length },
    { en: 'Complaints',  hi: 'शिकायतें',    value: applications.reduce((n, a) => n + ((a.complaints || []).length > 0 || a.status === 'COMPLAINED' ? 1 : 0), 0) },
    { en: 'Closed',      hi: 'बंद',        value: closed.length }
  ];

  /* ── Card ─────────────────────────────────────────────── */
  const renderCard = (app) => {
    const waiting = daysBetween(app.appliedAt);
    const sla = app.slaDays || 30;
    const pct = Math.min(100, Math.round((waiting / sla) * 100));
    const breached = waiting >= sla;
    const isClosed = CLOSED_STATUSES.includes(app.status);
    const receipt = complaintReceipts[app._id];
    const lastComplaint = (app.complaints || []).slice(-1)[0];
    const meta = STATUS_META[app.status];

    return (
      <article
        key={app._id}
        className={`group flex flex-col rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_16px_48px_-32px_rgba(24,24,27,0.18)] transition-all duration-700 ease-premium hover:-translate-y-1 hover:border-black/[0.12] hover:shadow-[0_28px_60px_-32px_rgba(24,24,27,0.25)] sm:p-7 ${isClosed ? 'opacity-80' : ''}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 tabular-nums">
              {hi ? 'आवेदन दिनांक' : 'Applied on'} · {new Date(app.appliedAt).toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <h3 className="mt-1 text-balance font-heading text-lg font-semibold leading-snug text-zinc-900">
              {hi ? (app.schemeNameHi || app.schemeNameEn) : (app.schemeNameEn || app.schemeNameHi)}
            </h3>
            {app.applicationRefNo && (
              <p className="mt-1 truncate text-xs text-zinc-400 tabular-nums" title={app.applicationRefNo}>
                {hi ? 'सरकारी संदर्भ सं.' : 'Govt ref no.'} · {app.applicationRefNo}
              </p>
            )}
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${BADGE_TONES[meta.tone]}`}>
            {meta.tone === 'good' && <CheckCircle2 size={11} strokeWidth={2} />}
            {meta.tone === 'escalated' && <ShieldAlert size={11} strokeWidth={2} />}
            {hi ? meta.hi : meta.en}
          </span>
        </div>

        {/* Day counter + SLA bar */}
        {!isClosed && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1.5 font-medium tabular-nums ${breached ? 'text-red-700' : 'text-zinc-600'}`}>
                {breached ? <ShieldAlert size={13} strokeWidth={1.5} /> : <Clock size={13} strokeWidth={1.5} />}
                {hi ? `${waiting} दिन बीत गए` : `${waiting} ${waiting === 1 ? 'day' : 'days'} waiting`}
              </span>
              <span className="tabular-nums text-zinc-400">{hi ? `SLA · ${sla} दिन` : `SLA · ${sla}d`}</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"
              role="progressbar"
              aria-label={hi ? 'SLA प्रगति' : 'SLA progress'}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ease-premium ${breached ? 'bg-red-500' : 'bg-zinc-900'}`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        )}

        {/* Complaint history */}
        {(receipt || (!receipt && lastComplaint)) && (
          receipt ? (
            <div className="mb-5 rounded-2xl border border-black/[0.06] bg-zinc-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <CheckCircle2 size={14} strokeWidth={1.75} className="text-zinc-700" />
                {hi ? 'शिकायत दर्ज हो गई' : 'Complaint filed successfully'}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                {hi ? 'संदर्भ सं.' : 'Reference'} <span className="font-semibold tabular-nums">{receipt.id}</span>
                {' · '}
                {receipt.emailSent
                  ? (hi ? 'ईमेल विभाग को भेज दिया गया, आपको CC किया गया' : 'Emailed to the department, you were CC’d')
                  : (hi ? 'ईमेल सेवा कॉन्फ़िगर नहीं है — शिकायत रिकॉर्ड हो गई' : 'Email service not configured — complaint logged')}
              </p>
            </div>
          ) : (
            <p className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
              <Mail size={13} strokeWidth={1.5} />
              {hi ? 'शिकायत संदर्भ' : 'Complaint ref'}
              <span className="font-medium tabular-nums text-zinc-700">{lastComplaint?.complaintId}</span>
              <span className="tabular-nums">· {new Date(lastComplaint?.sentAt).toLocaleDateString(hi ? 'hi-IN' : 'en-IN')}</span>
            </p>
          )
        )}

        {/* Actions */}
        {!isClosed && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-5">
            {breached || allowEarlyComplaint ? (
              <button
                onClick={() => handleComplain(app)}
                disabled={busyId === app._id}
                className="btn-primary inline-flex items-center gap-2 !bg-zinc-900 hover:!bg-red-700"
              >
                {busyId === app._id
                  ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                  : <Send size={14} strokeWidth={1.5} />}
                <span>{hi ? 'शिकायत दर्ज करें' : 'File complaint'}</span>
              </button>
            ) : (
              <button
                disabled
                title={hi ? `${sla - waiting} दिन बाद उपलब्ध` : `Available after ${sla - waiting} more day(s)`}
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-black/[0.08] bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-400 tabular-nums"
              >
                <Lock size={14} strokeWidth={1.5} />
                <span>{hi ? `${sla - waiting} दिन में खुलेगी` : `Unlocks in ${sla - waiting}d`}</span>
              </button>
            )}

            <select
              aria-label={hi ? 'स्थिति अपडेट करें' : 'Update outcome'}
              value=""
              onChange={(e) => e.target.value && handleStatusChange(app, e.target.value)}
              disabled={busyId === app._id}
              className="cursor-pointer rounded-full border border-black/[0.1] bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all duration-500 ease-premium hover:border-black/[0.2] hover:bg-zinc-50 focus:bg-white focus:outline-none"
            >
              <option value="">{hi ? 'नतीजा चुनें…' : 'Update outcome…'}</option>
              <option value="APPROVED">{hi ? STATUS_META.APPROVED.hi : STATUS_META.APPROVED.en}</option>
              <option value="REJECTED">{hi ? STATUS_META.REJECTED.hi : STATUS_META.REJECTED.en}</option>
              <option value="WITHDRAWN">{hi ? STATUS_META.WITHDRAWN.hi : STATUS_META.WITHDRAWN.en}</option>
            </select>
          </div>
        )}
      </article>
    );
  };

  /* ── View ─────────────────────────────────────────────── */
  return (
    <section aria-label={hi ? 'मेरे आवेदन' : 'My applications'} lang={hi ? 'hi' : 'en'}>
      {/* Page header */}
      <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            <span className="h-1 w-1 rounded-full bg-zinc-900" />
            {hi ? 'आवेदन ग्रहण और शिकायत' : 'Grievance Desk'}
          </span>
          <h3 className="mt-5 font-heading text-3xl font-semibold leading-[1.15] tracking-[-0.01em] text-zinc-900">
            {hi ? 'मेरे आवेदन' : 'My Applications'}
          </h3>
          <p className="mt-3 max-w-[62ch] text-pretty text-[15px] leading-relaxed text-zinc-500">
            {hi
              ? 'हर आवेदन पर बीते दिन देखें। SLA अवधि बीत जाने पर सीधे संबंधित सरकारी विभाग को शिकायत ईमेल भेजें।'
              : 'Track days elapsed for every application. Once the SLA window passes, file a formal complaint emailed straight to the concerned department.'}
          </p>
        </div>
        <button onClick={loadApplications} className="btn-secondary shrink-0 self-start sm:self-auto" disabled={isLoading}>
          <RefreshCw size={14} strokeWidth={1.5} className={isLoading ? 'animate-spin' : ''} />
          <span>{hi ? 'रिफ्रेश' : 'Refresh'}</span>
        </button>
      </header>

      {/* Stat strip */}
      {!isLoading && applications.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map(({ en, hi: hiLabel, value }) => (
            <div key={en} className="rounded-2xl border border-black/[0.06] bg-white px-5 py-4">
              <span className="block font-heading text-2xl font-semibold text-zinc-900 tabular-nums">{value}</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                {hi ? hiLabel : en}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          <XCircle size={15} strokeWidth={1.75} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2" aria-busy="true" aria-live="polite">
          {[0, 1].map(i => (
            <div key={i} className="rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-7">
              <div className="skeleton mb-4 h-3 w-28 rounded-full" />
              <div className="skeleton mb-6 h-5 w-3/4 rounded-lg" />
              <div className="skeleton mb-2 h-3 w-40 rounded-full" />
              <div className="skeleton mb-6 h-1.5 w-full rounded-full" />
              <div className="flex justify-between pt-2">
                <div className="skeleton h-9 w-36 rounded-full" />
                <div className="skeleton h-9 w-32 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/[0.12] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
            <Inbox size={24} strokeWidth={1.25} className="text-zinc-500" />
          </div>
          <h4 className="mt-5 font-heading text-base font-semibold text-zinc-900">
            {hi ? 'अभी कोई आवेदन दर्ज नहीं है' : 'No applications tracked yet'}
          </h4>
          <p className="mx-auto mt-2 max-w-[46ch] text-pretty text-xs leading-relaxed text-zinc-400">
            {hi
              ? 'किसी योजना में आवेदन करने के बाद “मैंने आवेदन किया” पर क्लिक करें — यहाँ दिन-गणक और शिकायत सुविधा मिलेगी।'
              : 'After applying to a scheme, tap “I Applied” in its detail view — your day counter and complaint option will appear here.'}
          </p>
          {onBrowseSchemes && (
            <button onClick={onBrowseSchemes} className="btn-primary mt-6">
              <ClipboardList size={14} strokeWidth={1.5} />
              <span>{hi ? 'योजनाएं ब्राउज़ करें' : 'Browse schemes to apply'}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-2">{open.map(renderCard)}</div>

          {closed.length > 0 && (
            <>
              <h4 className="mb-4 mt-12 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                <FileText size={12} strokeWidth={1.5} />
                {hi ? 'पूर्ण / बंद आवेदन' : 'Closed applications'}
              </h4>
              <div className="grid items-start gap-5 lg:grid-cols-2">{closed.map(renderCard)}</div>
            </>
          )}
        </>
      )}

      {/* Identity footer for transparency */}
      <p className="mt-10 flex items-center gap-2 border-t border-black/[0.06] pt-6 text-[11px] text-zinc-400">
        <Landmark size={11} strokeWidth={1.5} />
        {hi ? 'आवेदन से जुड़ी पहचान:' : 'Tracked for'} <span className="font-medium text-zinc-500">{userName || user?.displayName || 'Guest'}{(userEmail || user?.email) ? ` · ${userEmail || user.email}` : ''}</span>
      </p>
    </section>
  );
}
