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
  Inbox
} from 'lucide-react';

const CLOSED_STATUSES = ['APPROVED', 'REJECTED', 'WITHDRAWN'];

// TESTING BYPASS: set VITE_ALLOW_EARLY_COMPLAINT=true to always enable the complain button
const ALLOW_EARLY_COMPLAINT = import.meta.env.VITE_ALLOW_EARLY_COMPLAINT === 'true';

const STATUS_META = {
  WAITING:    { en: 'Waiting',        hi: 'प्रतीक्षारत' },
  COMPLAINED: { en: 'Complaint filed', hi: 'शिकायत दर्ज' },
  APPROVED:   { en: 'Approved',       hi: 'स्वीकृत' },
  REJECTED:   { en: 'Rejected',       hi: 'अस्वीकृत' },
  WITHDRAWN:  { en: 'Withdrawn',      hi: 'वापस लिया' }
};

function daysBetween(from) {
  return Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / 86400000));
}

export default function MyApplications({ userName, userEmail }) {
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
      try { json = JSON.parse(text); } catch (e) {}
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
      try { json = JSON.parse(text); } catch (e) {}
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to file complaint (${res.status})`);

      setApplications(prev => prev.map(a => (a._id === application._id ? { ...a, status: 'COMPLAINED', complaints: [...(a.complaints || []), json.complaint] } : a)));
      setComplaintReceipts(prev => ({
        ...prev,
        [application._id]: { id: json.complaint.complaintId, emailSent: json.emailSent }
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
      try { json = JSON.parse(text); } catch (e) {}
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

  /* ── Card ─────────────────────────────────────────────── */
  const renderCard = (app) => {
    const waiting = daysBetween(app.appliedAt);
    const sla = app.slaDays || 30;
    const pct = Math.min(100, Math.round((waiting / sla) * 100));
    const breached = waiting >= sla;
    const isClosed = CLOSED_STATUSES.includes(app.status);
    const receipt = complaintReceipts[app._id];
    const lastComplaint = (app.complaints || []).slice(-1)[0];

    return (
      <div key={app._id} className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_16px_48px_-32px_rgba(24,24,27,0.18)] sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              {hi ? 'आवेदन दिनांक' : 'Applied on'} · {new Date(app.appliedAt).toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <h3 className="mt-1 font-heading text-lg font-semibold text-zinc-900">
              {hi ? (app.schemeNameHi || app.schemeNameEn) : (app.schemeNameEn || app.schemeNameHi)}
            </h3>
            {app.applicationRefNo && (
              <p className="mt-1 text-xs text-zinc-500 tabular-nums">
                {hi ? 'सरकारी संदर्भ सं.' : 'Govt ref no.'}: {app.applicationRefNo}
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${
            isClosed ? 'bg-zinc-100 text-zinc-500'
              : app.status === 'COMPLAINED' ? 'bg-amber-50 text-amber-700'
              : breached ? 'bg-red-50 text-red-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {hi ? STATUS_META[app.status].hi : STATUS_META[app.status].en}
          </span>
        </div>

        {/* Day counter + SLA bar */}
        {!isClosed && (
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1.5 font-medium ${breached ? 'text-red-700' : 'text-zinc-600'}`}>
                {breached ? <ShieldAlert size={13} strokeWidth={1.5} /> : <Clock size={13} strokeWidth={1.5} />}
                {hi ? `${waiting} दिन बीत गए` : `${waiting} ${waiting === 1 ? 'day' : 'days'} waiting`}
              </span>
              <span className="tabular-nums text-zinc-400">{hi ? `SLA: ${sla} दिन` : `SLA: ${sla}d`}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-premium ${breached ? 'bg-red-500' : 'bg-emerald-600'}`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        )}

        {/* Complaint receipt */}
        {(receipt || lastComplaint) && !receipt && (
          <p className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
            <Mail size={13} strokeWidth={1.5} />
            {hi ? 'शिकायत संदर्भ:' : 'Complaint ref:'}
            <span className="font-medium tabular-nums text-zinc-700">{lastComplaint?.complaintId}</span>
            <span>· {new Date(lastComplaint?.sentAt).toLocaleDateString(hi ? 'hi-IN' : 'en-IN')}</span>
          </p>
        )}
        {receipt && (
          <div className="mb-4 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={14} strokeWidth={1.5} />
              {hi ? 'शिकायत दर्ज हो गई' : 'Complaint filed successfully'}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              {hi ? 'संदर्भ सं.' : 'Reference'}: <span className="font-medium tabular-nums">{receipt.id}</span>
              {' · '}
              {receipt.emailSent
                ? (hi ? 'ईमेल भेज दिया गया (आपको CC किया गया)' : 'Email sent (you were CC’d)')
                : (hi ? 'ईमेल सेवा कॉन्फ़िगर नहीं है — शिकायत रिकॉर्ड हो गई' : 'Email service not configured — complaint logged')}
            </p>
          </div>
        )}

        {/* Actions */}
        {!isClosed && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
            {breached || allowEarlyComplaint ? (
              <button
                onClick={() => handleComplain(app)}
                disabled={busyId === app._id}
                className="btn-secondary inline-flex items-center gap-2 !border-red-200 !text-red-700 hover:!border-red-300 disabled:opacity-60"
              >
                {busyId === app._id
                  ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                  : <AlertTriangle size={14} strokeWidth={1.5} />}
                <span>{hi ? 'शिकायत दर्ज करें' : 'File complaint'}</span>
              </button>
            ) : (
              <button disabled title={hi ? `${sla - waiting} दिन बाद उपलब्ध` : `Available after ${sla - waiting} more day(s)`} className="btn-secondary inline-flex cursor-not-allowed items-center gap-2 opacity-50">
                <AlertTriangle size={14} strokeWidth={1.5} />
                <span>{hi ? `${sla - waiting} दिन बाद शिकायत संभव` : `Complain in ${sla - waiting}d`}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <select
                aria-label={hi ? 'स्थिति अपडेट करें' : 'Update outcome'}
                value=""
                onChange={(e) => e.target.value && handleStatusChange(app, e.target.value)}
                disabled={busyId === app._id}
                className="cursor-pointer rounded-xl border border-black/[0.08] bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 focus:bg-white focus:outline-none"
              >
                <option value="">{hi ? 'नतीजा चुनें…' : 'Update outcome…'}</option>
                <option value="APPROVED">{hi ? STATUS_META.APPROVED.hi : STATUS_META.APPROVED.en}</option>
                <option value="REJECTED">{hi ? STATUS_META.REJECTED.hi : STATUS_META.REJECTED.en}</option>
                <option value="WITHDRAWN">{hi ? STATUS_META.WITHDRAWN.hi : STATUS_META.WITHDRAWN.en}</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── View ─────────────────────────────────────────────── */
  return (
    <section aria-label={hi ? 'मेरे आवेदन' : 'My applications'}>
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h3 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            {hi ? 'मेरे आवेदन' : 'My Applications'}
          </h3>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-zinc-500">
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

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <XCircle size={15} strokeWidth={1.5} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-zinc-50 px-5 py-4">
          <Loader2 size={15} strokeWidth={1.5} className="animate-spin text-[#48734f]" />
          <p className="text-sm text-zinc-500">{hi ? 'आवेदन लोड हो रहे हैं…' : 'Loading your applications…'}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/[0.12] bg-white px-6 py-16 text-center">
          <Inbox size={28} strokeWidth={1.25} className="mx-auto text-zinc-300" />
          <p className="mt-4 text-sm font-medium text-zinc-600">{hi ? 'अभी कोई आवेदन दर्ज नहीं है' : 'No applications tracked yet'}</p>
          <p className="mx-auto mt-2 max-w-[46ch] text-xs leading-relaxed text-zinc-400">
            {hi
              ? 'किसी योजना में आवेदन करने के बाद "मैंने आवेदन किया" पर क्लिक करें — यहाँ दिन-गणक और शिकायत सुविधा मिलेगी।'
              : 'After applying to a scheme, tap “I Applied” in its detail view — your day counter and complaint option will appear here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">{open.map(renderCard)}</div>

          {closed.length > 0 && (
            <>
              <h4 className="mb-4 mt-10 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                <FileText size={12} strokeWidth={1.5} />
                {hi ? 'पूर्ण / बंद आवेदन' : 'Closed applications'}
              </h4>
              <div className="grid gap-5 opacity-75 lg:grid-cols-2">{closed.map(renderCard)}</div>
            </>
          )}
        </>
      )}

      {/* Identity footer for transparency */}
      <p className="mt-8 flex items-center gap-2 text-[11px] text-zinc-400">
        <Landmark size={11} strokeWidth={1.5} />
        {hi ? 'आवेदन से जुड़ी पहचान:' : 'Tracked for'} <span className="font-medium text-zinc-500">{userName || user?.displayName || 'Guest'}{(userEmail || user?.email) ? ` · ${userEmail || user.email}` : ''}</span>
      </p>
    </section>
  );
}
