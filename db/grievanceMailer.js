import fs from 'fs';
import path from 'path';

export function loadDiskEnv() {
  const env = { ...process.env };
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.substring(0, idx).trim();
          const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (k && v) env[k] = v;
        }
      });
    }
  } catch (_) {}
  return env;
}

const FALLBACK_GRIEVANCE_EMAIL =
  process.env.GRIEVANCE_FALLBACK_EMAIL || 'grievance@lokvani-ai.demo';

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

export function getGrievanceEmail(schemeGrievanceEmail) {
  const fallback = process.env.GRIEVANCE_FALLBACK_EMAIL || process.env.VITE_GRIEVANCE_FALLBACK_EMAIL;
  return fallback || schemeGrievanceEmail || FALLBACK_GRIEVANCE_EMAIL;
}

function buildComplaintBody({
  userName, userEmail, schemeNameEn, ministryEn,
  applicationRefNo, appliedAt, daysElapsed, complaintId
}) {
  const appliedDate = new Date(appliedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return [
    'To the concerned Grievance Officer,',
    '',
    `Subject: Delay in disbursement of benefits under "${schemeNameEn}" (LokVani Complaint ID: ${complaintId})`,
    '',
    'Respected Sir/Madam,',
    '',
    `I, ${userName} (${userEmail || 'email not provided'}), submitted an application for the scheme "${schemeNameEn}"${
      ministryEn ? ` administered by the ${ministryEn}` : ''
    }.`,
    '',
    `Application submitted on: ${appliedDate}`,
    applicationRefNo ? `Government application/reference number: ${applicationRefNo}` : null,
    `Days elapsed since application: ${daysElapsed} days`,
    `Expected resolution timeline (SLA): as per scheme guidelines`,
    '',
    `Despite the elapsed time of ${daysElapsed} days, I have neither received the benefit nor any status update regarding my application. I kindly request the concerned department to review my application and provide an update at the earliest.`,
    '',
    'Thanking you,',
    '',
    `${userName}`,
    userEmail ? `Email: ${userEmail}` : '',
    `LokVani Complaint Reference: ${complaintId}`
  ]
    .filter(Boolean)
    .join('\n');
}

function buildComplaintBodyHi({
  userName, schemeNameEn, appliedAt, daysElapsed, complaintId
}) {
  const appliedDate = new Date(appliedAt).toLocaleDateString('hi-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return [
    'आदरणीय शिकायत अधिकारी महोदय,',
    '',
    `विषय: "${schemeNameEn}" योजना के लाभ में देरी (लोकवाणी शिकायत आईडी: ${complaintId})`,
    '',
    'महोदय/महोदया,',
    '',
    `मैं, ${userName}, ने "${schemeNameEn}" योजना हेतु आवेदन किया था।`,
    '',
    `आवेदन दिनांक: ${appliedDate}`,
    `बीते दिन: ${daysElapsed} दिन`,
    '',
    `अब तक ${daysElapsed} दिन बीत जाने पर भी मुझे योजना का लाभ अथवा कोई स्थिति जानकारी प्राप्त नहीं हुई है। कृपया संबंधित विभाग मेरे आवेदन की समीक्षा कर शीघ्र उत्तर दें।`,
    '',
    'सधन्यवाद,',
    `${userName}`,
    `लोकवाणी शिकायत संदर्भ: ${complaintId}`
  ].join('\n');
}

export async function sendGrievanceEmail({ application, daysElapsed, complaintId }) {
  const to = getGrievanceEmail(application.grievanceEmail);
  const cc = application.userEmail || '';
  const subject = `[Grievance] Delay in "${application.schemeNameEn}" — ${daysElapsed} days — Ref ${complaintId}`;
  const message = [
    buildComplaintBody({ ...application, daysElapsed, complaintId }),
    '',
    '──────────',
    buildComplaintBodyHi({ ...application, daysElapsed, complaintId })
  ].join('\n');

  const env = loadDiskEnv();
  const EMAILJS_SERVICE_ID = env.EMAILJS_SERVICE_ID || env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = env.EMAILJS_TEMPLATE_ID || env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = env.EMAILJS_PUBLIC_KEY || env.VITE_EMAILJS_PUBLIC_KEY;
  const EMAILJS_PRIVATE_KEY = env.EMAILJS_PRIVATE_KEY || env.VITE_EMAILJS_PRIVATE_KEY;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn(
      `[Grievance Mailer] EmailJS missing keys (SERVICE_ID: "${EMAILJS_SERVICE_ID}", TEMPLATE_ID: "${EMAILJS_TEMPLATE_ID}", PUBLIC_KEY: "${EMAILJS_PUBLIC_KEY}").`
    );
    return { emailSent: false, to, cc };
  }

  const payloadParams = {
    to_email: to,
    cc_email: cc,
    reply_to: cc || undefined,
    subject,
    message,
    complaint_id: complaintId,
    applicant_name: application.userName || '',
    scheme_name: application.schemeNameEn || ''
  };

  try {
    // Attempt 1: Standard REST call with user_id
    let res = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        ...(EMAILJS_PRIVATE_KEY ? { accessToken: EMAILJS_PRIVATE_KEY } : {}),
        template_params: payloadParams
      })
    });

    // Attempt 2: If private key / accessToken caused 401/403, retry without accessToken
    if (!res.ok && EMAILJS_PRIVATE_KEY) {
      res = await fetch(EMAILJS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: payloadParams
        })
      });
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`EmailJS responded ${res.status}: ${errText.slice(0, 200)}`);
    }

    console.log(`[Grievance Mailer] Outbound complaint email sent successfully to ${to} for complaint ${complaintId}.`);
    return { emailSent: true, to, cc };
  } catch (err) {
    console.error(`[Grievance Mailer] Failed to send complaint ${complaintId}:`, err.message);
    return { emailSent: false, to, cc, error: err.message };
  }
}

export function generateComplaintId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LV-CMP-${new Date().getFullYear()}-${rand}`;
}
