import nodemailer from 'nodemailer';

const FALLBACK_GRIEVANCE_EMAIL =
  process.env.GRIEVANCE_FALLBACK_EMAIL || 'grievance@lokvani-ai.demo';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  return transporter;
}

export function getGrievanceEmail(schemeGrievanceEmail) {
  return schemeGrievanceEmail || FALLBACK_GRIEVANCE_EMAIL;
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
  const cc = application.userEmail || undefined;
  const subject = `[Grievance] Delay in "${application.schemeNameEn}" — ${daysElapsed} days — Ref ${complaintId}`;
  const text = [
    buildComplaintBody({ ...application, daysElapsed, complaintId }),
    '',
    '──────────',
    buildComplaintBodyHi({ ...application, daysElapsed, complaintId })
  ].join('\n');

  const tx = getTransporter();
  if (!tx) {
    console.warn(
      `[Grievance Mailer] SMTP not configured. Complaint ${complaintId} logged but email NOT sent (would go to ${to}${cc ? `, cc ${cc}` : ''}).`
    );
    return { emailSent: false, to, cc: cc || '' };
  }

  try {
    await tx.sendMail({
      from: `"LokVani AI Grievance Desk" <${process.env.SMTP_USER}>`,
      to,
      cc,
      replyTo: cc,
      subject,
      text
    });
    return { emailSent: true, to, cc: cc || '' };
  } catch (err) {
    console.error(`[Grievance Mailer] Failed to send complaint ${complaintId}:`, err.message);
    return { emailSent: false, to, cc: cc || '', error: err.message };
  }
}

export function generateComplaintId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LV-CMP-${new Date().getFullYear()}-${rand}`;
}
