// Grievance mailer via EmailJS REST API (no SMTP server required).
// Configure in .env:
//   EMAILJS_SERVICE_ID    – EmailJS service (e.g. service_xxxxxxx)
//   EMAILJS_TEMPLATE_ID   – EmailJS template that uses {{to_email}}, {{cc_email}},
//                           {{subject}}, {{message}} params
//   EMAILJS_PUBLIC_KEY    – EmailJS Public Key (user_id)
//   EMAILJS_PRIVATE_KEY   – EmailJS Private Key (accessToken, required for REST)

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

  // Dynamic dotenv refresh to pick up freshly saved .env changes without server restart
  if (!process.env.EMAILJS_SERVICE_ID) {
    try {
      const dotenv = await import('dotenv');
      dotenv.config({ override: true });
    } catch (_) {}
  }

  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY;
  const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || process.env.VITE_EMAILJS_PRIVATE_KEY;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn(
      `[Grievance Mailer] EmailJS is not configured. Complaint ${complaintId} logged but email NOT sent (would go to ${to}${cc ? `, cc ${cc}` : ''}).`
    );
    return { emailSent: false, to, cc };
  }

  try {
    const res = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        ...(EMAILJS_PRIVATE_KEY ? { accessToken: EMAILJS_PRIVATE_KEY } : {}),
        template_params: {
          to_email: to,
          cc_email: cc,
          reply_to: cc || undefined,
          subject,
          message,
          complaint_id: complaintId,
          applicant_name: application.userName || '',
          scheme_name: application.schemeNameEn || ''
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`EmailJS responded ${res.status}: ${errText.slice(0, 200)}`);
    }

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
