import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { connectDB, isMongoDBConnected } from './db/connection.js';
import { QueryLog } from './db/models/QueryLog.js';
import { TrustReview } from './db/models/TrustReview.js';
import { CommunityIntelModel } from './db/models/CommunityIntel.js';
import { CropPoolModel } from './db/models/CropPool.js';
import { SchemeApplication } from './db/models/SchemeApplication.js';
import { sendGrievanceEmail, generateComplaintId, getGrievanceEmail, loadDiskEnv } from './db/grievanceMailer.js';
import { processVoiceQuery } from './src/services/geminiService.js';
import { geminiRotator } from './src/services/geminiKeyRotator.js';
import { fetchLiveWeatherData, fetchLiveMandiPrices } from './src/services/realDataService.js';
import { processUserSpeechQuery } from './src/services/aiCoreEngine.js';
import { predictAgriculturePrice } from './src/services/agriMlService.js';
import { getAgmarknetRates } from './src/services/agmarknetDataset.js';
import { getBuyersByLocation } from './src/services/buyerDataEngine.js';

// Input sanitizer: strip control chars, cap at 500 chars
function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, 500);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);

// In-Memory Fallback Caches (if MongoDB is disconnected)
let memoryQueryLogs = [
  {
    _id: 'mem_1',
    userId: 'user_demo_1',
    userName: 'Ramesh Kumar (Farmer)',
    transcribedText: 'PM Kisan yojana ki 17th kisht kab aayegi?',
    userLocation: 'Azamgarh, UP',
    shortAnswerHi: 'PM-Kisan 17th kisht ke liye Aadhar e-KYC verified hona zaroori hai. Kirana dada se Khasra paper verify karayein.',
    shortAnswerEn: 'PM-Kisan 17th installment requires Aadhar e-KYC verification. Verify land papers at Kirana center.',
    domain: 'GOVT_SCHEME',
    isHighStakes: true,
    riskCategory: 'FINANCIAL_ELIGIBILITY',
    trustNote: 'High-stakes scheme eligibility query: Requires land document check.',
    actionableSteps: ['Aadhar card link check karein', 'Kirana Center par e-KYC karein'],
    status: 'PENDING_TRUST_REVIEW',
    createdAt: new Date()
  }
];

let memoryCommunityIntel = [
  { _id: 'intel_1', item: 'Tamatar (Tomato)', price: 28, unit: 'kg', location: 'Azamgarh Mandi', trend: 'up', reportedBy: 'Ramesh Farmer', createdAt: new Date() },
  { _id: 'intel_2', item: 'Pyaaz (Onion)', price: 34, unit: 'kg', location: 'Ghazipur Mandi', trend: 'stable', reportedBy: 'Suresh Vendor', createdAt: new Date() },
  { _id: 'intel_3', item: 'Aloo (Potato)', price: 22, unit: 'kg', location: 'Varanasi Mandi', trend: 'down', reportedBy: 'Anita Devi', createdAt: new Date() },
  { _id: 'intel_4', item: 'Gehun (Wheat)', price: 2400, unit: 'quintal', location: 'Azamgarh Main Mandi', trend: 'stable', reportedBy: 'Kirana Operator', createdAt: new Date() }
];

// In-Memory Fallback for Scheme Applications (if MongoDB is disconnected)
let memorySchemeApplications = [];

// In-Memory Fallback for FPO Crop Pools (Multi-User Real-Time Pooling)
let memoryCropPools = [];

const APPLICATION_STATUSES = ['WAITING', 'COMPLAINED', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
const COMPLAINT_COOLDOWN_DAYS = 7;

// Initialize Database Connection
connectDB().catch(console.error);

// 1. Health & Status Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'LokVani AI Backend API',
    mongoDBConnected: isMongoDBConnected(),
    geminiRotatorStatus: geminiRotator.getActiveKey() ? 'active' : 'fallback',
    timestamp: new Date().toISOString()
  });
});

// 2. Process Voice Query (POST /api/query)
app.post('/api/query', async (req, res) => {
  try {
    const { transcribed_text, user_location, userId, userEmail, userName, dialect, conversation_history } = req.body || {};

    const safeText = sanitizeInput(transcribed_text);
    if (!safeText) {
      return res.status(400).json({ error: 'Missing or invalid transcribed_text (max 500 chars).' });
    }

    // Fetch live Mandi prices from Govt API
    let intelList = [];
    try {
      const apiPrices = await fetchLiveMandiPrices();
      if (apiPrices && apiPrices.length > 0) {
        intelList = apiPrices;
      }
    } catch (err) {
      console.warn('Agmarknet Live API price fetch failed, using fallback database records:', err.message);
    }

    // Fetch crowdsourced Mandi prices from database
    if (isMongoDBConnected()) {
      const dbIntel = await CommunityIntelModel.find().sort({ createdAt: -1 }).limit(10);
      if (dbIntel && dbIntel.length > 0) {
        intelList = [...intelList, ...dbIntel];
      }
    } else {
      intelList = [...intelList, ...memoryCommunityIntel];
    }

    // Dynamic Location Extraction (User explicit location in query > User state location > Default Azamgarh)
    const CITIES_LIST = [
      'Azamgarh', 'Gorakhpur', 'Varanasi', 'Lucknow', 'Kanpur', 'Patna', 'Gaya',
      'Muzaffarpur', 'Jaipur', 'Kota', 'Indore', 'Bhopal', 'Ujjain', 'Mumbai',
      'Pune', 'Nashik', 'Ahmedabad', 'Surat', 'Rajkot', 'Ludhiana', 'Amritsar',
      'Delhi', 'Kolkata', 'Ranchi', 'Bhubaneswar', 'Cuttack', 'Sundergarh', 'Puri',
      'Bangalore', 'Hyderabad', 'Chennai', 'Nagpur', 'Agra', 'Meerut', 'Bareilly',
      'Aligarh', 'Moradabad', 'Saharanpur', 'Jhansi', 'Ayodhya', 'Basti', 'Mau'
    ];

    let detectedCity = 'Azamgarh';
    if (safeText) {
      const lower = safeText.toLowerCase();
      for (const city of CITIES_LIST) {
        if (lower.includes(city.toLowerCase())) {
          detectedCity = city;
          break;
        }
      }
    }
    if (detectedCity === 'Azamgarh' && user_location) {
      const firstPart = String(user_location).split(',')[0].trim();
      if (firstPart) detectedCity = firstPart;
    }

    const weatherData = await fetchLiveWeatherData(detectedCity);

    // Run AI Engine through Rotator (sanitized text, optional dialect, multi-turn history)
    const safeDialect = dialect ? sanitizeInput(dialect).slice(0, 30) : null;
    let aiResult = null;
    let engineSource = 'GEMINI_AI';

    try {
      aiResult = await processVoiceQuery(safeText, intelList, weatherData, safeDialect, conversation_history, `${detectedCity}, India`);
    } catch (geminiErr) {
      console.warn('[API /api/query] AI engine unavailable:', geminiErr.message);
      aiResult = {
        short_answer_hi: 'AI सेवा अस्थायी रूप से अनुपलब्ध है। कृपया कुछ समय बाद पुनः प्रयास करें।',
        short_answer_en: 'AI service is temporarily out of service. Please try again in a moment.',
        detailed_answer_hi: 'AI मॉडल सर्वर कनेक्ट करने में असमर्थ था। कृपया इंटरनेट कनेक्शन या API स्थिति की जांच करें और पुनः प्रयास करें।',
        detailed_answer_en: 'The AI model server was unable to respond. Please check your network connection or API status and try again.',
        confidence: 'LOW',
        follow_up_questions: ['पुनः प्रयास करें / Try again', 'मंडी भाव देखें / Check mandi rates'],
        domain: 'AGRI_ADVISORY',
        is_high_stakes: false,
        risk_category: 'NONE',
        trust_note: 'AI Service Out of Service',
        actionable_steps: ['कृपया कुछ समय बाद पुनः प्रयास करें / Please try again shortly.'],
        distress_score: 0,
        distress_level: 'LOW',
        damage_impact_hi: 'अस्थायी AI सेवा बाधा।',
        damage_impact_en: 'Temporary AI service disruption.',
        apiKeyIndexUsed: -1
      };
      engineSource = 'AI_OUT_OF_SERVICE';
    }

    const initialStatus = aiResult.is_high_stakes ? 'PENDING_TRUST_REVIEW' : 'AUTO_VERIFIED';

    const logEntry = {
      userId: userId || 'anonymous',
      userEmail: userEmail || '',
      userName: userName || 'Guest User',
      transcribedText: safeText,
      userLocation: sanitizeInput(user_location) || 'Azamgarh, UP',
      shortAnswerHi: aiResult.short_answer_hi,
      shortAnswerEn: aiResult.short_answer_en,
      detailedAnswerHi: aiResult.detailed_answer_hi || '',
      detailedAnswerEn: aiResult.detailed_answer_en || '',
      confidence: aiResult.confidence || 'MEDIUM',
      followUpQuestions: aiResult.follow_up_questions || [],
      domain: aiResult.domain || 'AGRI_ADVISORY',
      isHighStakes: aiResult.is_high_stakes || false,
      riskCategory: aiResult.risk_category || 'NONE',
      trustNote: aiResult.trust_note || '',
      actionableSteps: aiResult.actionable_steps || [],
      dialect: safeDialect || 'hi',
      status: initialStatus,
      engineSource,
      apiKeyIndexUsed: aiResult.apiKeyIndexUsed ?? 0,
      createdAt: new Date()
    };

    let savedRecord = null;
    if (isMongoDBConnected()) {
      savedRecord = await QueryLog.create(logEntry);
    } else {
      savedRecord = { _id: `mem_${Date.now()}`, ...logEntry };
      memoryQueryLogs.unshift(savedRecord);
    }

    return res.status(200).json({
      success: true,
      data: savedRecord,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API /api/query Error]:', error);
    return res.status(500).json({ error: 'Internal server error processing voice query.' });
  }
});

// 3. Get Pending Trust Review Queries (GET /api/trust/pending)
app.get('/api/trust/pending', async (req, res) => {
  try {
    if (isMongoDBConnected()) {
      const pendingList = await QueryLog.find({ status: 'PENDING_TRUST_REVIEW' }).sort({ createdAt: -1 });
      return res.json({ success: true, data: pendingList });
    }
    const pending = memoryQueryLogs.filter(q => q.status === 'PENDING_TRUST_REVIEW');
    return res.json({ success: true, data: pending });
  } catch (error) {
    console.error('[API /api/trust/pending Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch pending trust reviews.' });
  }
});

// 4. Submit Kirana Operator Verification (POST /api/trust/verify)
app.post('/api/trust/verify', async (req, res) => {
  try {
    const { queryLogId, operatorId, operatorName, action, operatorNote, modifiedShortAnswerHi, modifiedShortAnswerEn } = req.body || {};

    if (!queryLogId || !action) {
      return res.status(400).json({ error: 'Missing queryLogId or action.' });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : (action === 'MODIFY' ? 'MODIFIED' : 'REJECTED');

    if (isMongoDBConnected()) {
      const updatedLog = await QueryLog.findByIdAndUpdate(
        queryLogId,
        {
          status: newStatus,
          ...(modifiedShortAnswerHi && { shortAnswerHi: modifiedShortAnswerHi }),
          ...(modifiedShortAnswerEn && { shortAnswerEn: modifiedShortAnswerEn }),
          ...(operatorNote && { trustNote: operatorNote })
        },
        { new: true }
      );

      await TrustReview.create({
        queryLogId,
        operatorId: operatorId || 'op_default',
        operatorName: operatorName || 'Kirana Operator',
        action,
        operatorNote: operatorNote || '',
        modifiedShortAnswerHi,
        modifiedShortAnswerEn
      });

      return res.json({ success: true, data: updatedLog });
    }

    // In-memory update fallback
    const item = memoryQueryLogs.find(q => String(q._id) === String(queryLogId));
    if (item) {
      item.status = newStatus;
      if (modifiedShortAnswerHi) item.shortAnswerHi = modifiedShortAnswerHi;
      if (modifiedShortAnswerEn) item.shortAnswerEn = modifiedShortAnswerEn;
      if (operatorNote) item.trustNote = operatorNote;
    }

    return res.json({ success: true, data: item || { _id: queryLogId, status: newStatus } });
  } catch (error) {
    console.error('[API /api/trust/verify Error]:', error);
    return res.status(500).json({ error: 'Failed to verify trust node item.' });
  }
});

// 5. Get & Post Community Intel (GET & POST /api/intel)
app.get('/api/intel', async (req, res) => {
  try {
    const { state = 'Uttar Pradesh', district = '', search = '' } = req.query || {};

    // 1. Get live Agmarknet benchmark data for the requested state & district
    const liveAgmarknet = getAgmarknetRates(state, district);

    // 2. Fetch crowdsourced Mandi prices from database if available
    let dbItems = [];
    if (isMongoDBConnected()) {
      dbItems = await CommunityIntelModel.find().sort({ createdAt: -1 }).limit(20);
    } else {
      dbItems = memoryCommunityIntel;
    }

    // 3. Merge crowdsourced user reports with live Agmarknet benchmark feeds
    const combined = [...dbItems, ...liveAgmarknet];

    // 4. Optional search filter
    let filtered = combined;
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = combined.filter(c => 
        (c.item && c.item.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('[API GET /api/intel Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch community intel.' });
  }
});

app.post('/api/intel', async (req, res) => {
  try {
    const { item, price, unit, location, reportedBy, reporterId, category } = req.body || {};

    if (!item || !price || !location) {
      return res.status(400).json({ error: 'Missing required fields: item, price, location.' });
    }

    const payload = {
      item,
      price: Number(price),
      unit: unit || 'kg',
      location,
      reportedBy: reportedBy || 'Local Farmer',
      reporterId: reporterId || 'anonymous',
      trend: 'stable',
      category: category || 'General Commodity',
      createdAt: new Date()
    };

    if (isMongoDBConnected()) {
      const created = await CommunityIntelModel.create(payload);
      return res.status(201).json({ success: true, data: created });
    }

    const newItem = { _id: `intel_${Date.now()}`, ...payload };
    memoryCommunityIntel.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('[API POST /api/intel Error]:', error);
    return res.status(500).json({ error: 'Failed to record community report.' });
  }
});

// 5b. Agriculture Machine Learning Price Prediction Endpoint (POST /api/agriculture/predict)
app.post('/api/agriculture/predict', (req, res) => {
  try {
    const inputParams = req.body || {};
    const result = predictAgriculturePrice(inputParams);
    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API POST /api/agriculture/predict Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate agriculture price prediction.',
      fallback_warning: 'Agriculture prediction service temporarily unavailable.'
    });
  }
});

// 6. Get User Voice Query History (GET /api/user/queries/:userId)
app.get('/api/user/queries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (isMongoDBConnected()) {
      const userLogs = await QueryLog.find({ userId }).sort({ createdAt: -1 }).limit(20);
      return res.json({ success: true, data: userLogs });
    }
    const userLogs = memoryQueryLogs.filter(q => q.userId === userId);
    return res.json({ success: true, data: userLogs });
  } catch (error) {
    console.error('[API GET /api/user/queries Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch user query history.' });
  }
});

// 6b. Delete Query Record / Chat Session (DELETE /api/user/queries/:id)
app.delete('/api/user/queries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoDBConnected()) {
      await QueryLog.findByIdAndDelete(id);
    }
    memoryQueryLogs = memoryQueryLogs.filter(q => String(q._id) !== String(id));
    return res.json({ success: true, message: 'Query record deleted successfully.' });
  } catch (error) {
    console.error('[API DELETE /api/user/queries/:id Error]:', error);
    return res.status(500).json({ error: 'Failed to delete query record.' });
  }
});

// ─── 7. Verified Buyer Network (GET /api/buyers) ──────────────────────────────
app.get('/api/buyers', (req, res) => {
  try {
    const { state = 'Uttar Pradesh', district = '' } = req.query || {};
    const buyers = getBuyersByLocation(state, district);
    return res.json({ success: true, data: buyers });
  } catch (err) {
    console.error('[API /api/buyers Error]:', err);
    return res.status(500).json({ error: 'Failed to fetch verified buyers.' });
  }
});

// ─── 8. Scheme Applications: Apply (POST /api/applications) ──────────────────
app.post('/api/applications', async (req, res) => {
  try {
    const { userId, userEmail, userName, schemeId, schemeNameEn, schemeNameHi,
            ministryEn, applicationRefNo, appliedAt, slaDays, grievanceEmail } = req.body || {};

    if (!userId || !schemeId) {
      return res.status(400).json({ error: 'Missing required fields: userId, schemeId.' });
    }

    const payload = {
      userId: String(userId).slice(0, 128),
      userEmail: sanitizeInput(userEmail).slice(0, 200),
      userName: sanitizeInput(userName).slice(0, 120),
      schemeId: String(schemeId).slice(0, 100),
      schemeNameEn: sanitizeInput(schemeNameEn).slice(0, 200),
      schemeNameHi: sanitizeInput(schemeNameHi).slice(0, 200),
      ministryEn: sanitizeInput(ministryEn).slice(0, 200),
      applicationRefNo: sanitizeInput(applicationRefNo).slice(0, 100),
      appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
      slaDays: Number(slaDays) > 0 ? Number(slaDays) : 30,
      grievanceEmail: sanitizeInput(grievanceEmail).slice(0, 200),
      status: 'WAITING'
    };

    // Duplicate check: same user + same scheme
    if (isMongoDBConnected()) {
      try {
        const existing = await SchemeApplication.findOne({ userId: payload.userId, schemeId: payload.schemeId });
        if (existing) {
          return res.status(409).json({ error: 'Application already recorded for this scheme.', data: existing });
        }
        const created = await SchemeApplication.create(payload);
        return res.status(201).json({ success: true, data: created });
      } catch (dbErr) {
        console.warn('[API POST /api/applications] DB error, using memory store fallback:', dbErr.message);
        if (dbErr.code === 11000) {
          return res.status(409).json({ error: 'Application already recorded for this scheme.' });
        }
      }
    }

    const existingMem = memorySchemeApplications.find(
      a => a.userId === payload.userId && a.schemeId === payload.schemeId
    );
    if (existingMem) {
      return res.status(409).json({ error: 'Application already recorded for this scheme.', data: existingMem });
    }
    const createdMem = { _id: `app_${Date.now()}`, ...payload, complaints: [], createdAt: new Date() };
    memorySchemeApplications.unshift(createdMem);
    return res.status(201).json({ success: true, data: createdMem });
  } catch (error) {
    console.error('[API POST /api/applications Error]:', error);
    return res.status(500).json({ error: 'Failed to record application.' });
  }
});

// ─── 9. Get User Applications (GET /api/applications/user/:userId) ───────────
app.get('/api/applications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // TESTING BYPASS flag surfaced so the frontend can unlock the Complain button
    const allowEarlyComplaint = process.env.ALLOW_EARLY_COMPLAINT === 'true';
    if (isMongoDBConnected()) {
      try {
        const apps = await SchemeApplication.find({ userId }).sort({ appliedAt: -1 });
        return res.json({ success: true, data: apps, allowEarlyComplaint });
      } catch (dbErr) {
        console.warn('[API GET /api/applications] DB query error, using memory store fallback:', dbErr.message);
      }
    }
    const apps = memorySchemeApplications.filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    return res.json({ success: true, data: apps, allowEarlyComplaint });
  } catch (error) {
    console.error('[API GET /api/applications Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// ─── 10. File Grievance Complaint (POST /api/applications/:id/complaint) ─────
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many complaints filed. Please wait before trying again.' }
});

app.post('/api/applications/:id/complaint', complaintLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    let application = null;
    if (isMongoDBConnected()) {
      application = await SchemeApplication.findById(id);
    } else {
      application = memorySchemeApplications.find(a => String(a._id) === String(id));
    }

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (['APPROVED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
      return res.status(400).json({ error: 'This application is already closed.' });
    }

    const daysElapsed = Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / 86400000);

    // TESTING BYPASS: set ALLOW_EARLY_COMPLAINT=true in .env to unlock complaints immediately
    const diskEnv = loadDiskEnv();
    const earlyComplaintAllowed = (diskEnv.ALLOW_EARLY_COMPLAINT || process.env.ALLOW_EARLY_COMPLAINT) === 'true';

    if (!earlyComplaintAllowed && daysElapsed < application.slaDays) {
      return res.status(400).json({
        error: `SLA not yet breached. You can file a complaint after ${application.slaDays} days of waiting.`,
        daysElapsed,
        slaDays: application.slaDays
      });
    }

    const recentComplaint = earlyComplaintAllowed
      ? null
      : (application.complaints || []).find(c =>
          (Date.now() - new Date(c.sentAt).getTime()) < COMPLAINT_COOLDOWN_DAYS * 86400000
        );
    if (recentComplaint) {
      return res.status(429).json({
        error: 'A complaint was already filed within the last 7 days.',
        complaint: recentComplaint
      });
    }

    const complaintId = generateComplaintId();
    const mailResult = await sendGrievanceEmail({ application, daysElapsed, complaintId });

    const complaintEntry = {
      complaintId,
      sentTo: mailResult.to || getGrievanceEmail(application.grievanceEmail),
      ccTo: mailResult.cc || '',
      sentAt: new Date(),
      daysElapsed,
      emailSent: Boolean(mailResult.emailSent),
      note: sanitizeInput(note).slice(0, 500)
    };

    application.status = 'COMPLAINED';
    application.complaints = [...(application.complaints || []), complaintEntry];

    let saved;
    if (isMongoDBConnected()) {
      saved = await SchemeApplication.findByIdAndUpdate(
        id,
        { status: 'COMPLAINED', $push: { complaints: complaintEntry } },
        { new: true }
      );
    } else {
      saved = application;
    }

    return res.json({
      success: true,
      data: { ...saved.toObject?.() ?? saved },
      complaint: complaintEntry,
      emailSent: mailResult.emailSent,
      ...(mailResult.emailSent ? {} : { warning: 'SMTP is not configured or delivery failed — complaint logged locally only.' })
    });
  } catch (error) {
    console.error('[API POST /api/applications/:id/complaint Error]:', error);
    return res.status(500).json({ error: 'Failed to file grievance complaint.' });
  }
});

// ─── 11. Update Application Status (PATCH /api/applications/:id/status) ──────
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${APPLICATION_STATUSES.join(', ')}` });
    }

    if (isMongoDBConnected()) {
      const updated = await SchemeApplication.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Application not found.' });
      return res.json({ success: true, data: updated });
    }

    const item = memorySchemeApplications.find(a => String(a._id) === String(id));
    if (item) item.status = status;
    return res.json({ success: true, data: item || { _id: id, status } });
  } catch (error) {
    console.error('[API PATCH /api/applications/:id/status Error]:', error);
    return res.status(500).json({ error: 'Failed to update application status.' });
  }
});

// ─── 12. FPO Group Selling Pools (GET /api/pools) ───────────────────────────
app.get('/api/pools', async (req, res) => {
  try {
    const { state, district, category } = req.query || {};

    if (isMongoDBConnected()) {
      const filter = {};
      if (category && category !== 'All') {
        filter.$or = [
          { category_en: new RegExp(`^${category}$`, 'i') },
          { category_hi: new RegExp(`^${category}$`, 'i') }
        ];
      }
      const pools = await CropPoolModel.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, data: pools });
    }

    let filtered = [...memoryCropPools];
    if (category && category !== 'All') {
      filtered = filtered.filter(p => 
        p.category_en?.toLowerCase() === category.toLowerCase() ||
        p.category_hi?.toLowerCase() === category.toLowerCase()
      );
    }
    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('[API GET /api/pools Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch crop pools.' });
  }
});

// ─── 13. Create FPO Group Selling Pool (POST /api/pools) ─────────────────────
app.post('/api/pools', async (req, res) => {
  try {
    const {
      commodity_hi,
      commodity_en,
      category_hi,
      category_en,
      targetQtl,
      buyerName,
      buyerLocation,
      state,
      district,
      offerPrice,
      deadline,
      qualityRequired,
      coordinatorName_hi,
      coordinatorName_en,
      createdBy,
      createdByUserId
    } = req.body || {};

    const target = Number(targetQtl);
    const price = Number(offerPrice);

    if (!commodity_hi && !commodity_en) {
      return res.status(400).json({ error: 'Missing commodity name.' });
    }
    if (!target || target <= 0) {
      return res.status(400).json({ error: 'Valid target quantity in quintals is required.' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid offer price is required.' });
    }

    const poolId = `pool_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const newPool = {
      poolId,
      commodity_hi: sanitizeInput(commodity_hi) || sanitizeInput(commodity_en),
      commodity_en: sanitizeInput(commodity_en) || sanitizeInput(commodity_hi),
      category_hi: sanitizeInput(category_hi) || 'सब्ज़ी',
      category_en: sanitizeInput(category_en) || 'Vegetable',
      targetQtl: target,
      filledQtl: 0,
      buyerName: sanitizeInput(buyerName) || 'Regional Mandi FPO Lot',
      buyerLocation: sanitizeInput(buyerLocation) || 'Local APMC Hub',
      state: sanitizeInput(state) || 'Uttar Pradesh',
      district: sanitizeInput(district) || 'Azamgarh',
      offerPrice: price,
      deadline: sanitizeInput(deadline) || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      qualityRequired: sanitizeInput(qualityRequired) || 'Grade A',
      status: 'OPEN',
      coordinatorName_hi: sanitizeInput(coordinatorName_hi) || 'किराना ट्रस्ट नोड (सत्यापित)',
      coordinatorName_en: sanitizeInput(coordinatorName_en) || 'Kirana Trust Node (Verified)',
      participants: 1,
      members: [],
      createdBy: sanitizeInput(createdBy) || 'Community Farmer',
      createdByUserId: sanitizeInput(createdByUserId) || '',
      createdAt: new Date()
    };

    let saved = null;
    if (isMongoDBConnected()) {
      saved = await CropPoolModel.create(newPool);
    } else {
      saved = { _id: `mem_pool_${Date.now()}`, ...newPool };
      memoryCropPools.unshift(saved);
    }

    console.log(`[LokVani FPO Pool Created]: ${newPool.commodity_en} (${newPool.targetQtl}Q @ ₹${newPool.offerPrice}/Q)`);
    broadcastPoolEvent('POOL_CREATED', saved);

    return res.status(201).json({
      success: true,
      data: saved
    });
  } catch (error) {
    console.error('[API POST /api/pools Error]:', error);
    return res.status(500).json({ error: 'Failed to create crop pool.' });
  }
});

// ─── 14. Edit / Update Crop Pool (PUT /api/pools/:poolId) ─────────────────────
app.put('/api/pools/:poolId', async (req, res) => {
  try {
    const { poolId } = req.params;
    const {
      commodity_hi,
      commodity_en,
      category_hi,
      category_en,
      targetQtl,
      buyerName,
      buyerLocation,
      offerPrice,
      deadline,
      qualityRequired,
      createdByUserId
    } = req.body || {};

    const target = Number(targetQtl);
    const price = Number(offerPrice);

    const updateFields = {};
    if (commodity_hi) updateFields.commodity_hi = sanitizeInput(commodity_hi);
    if (commodity_en) updateFields.commodity_en = sanitizeInput(commodity_en);
    if (category_hi) updateFields.category_hi = sanitizeInput(category_hi);
    if (category_en) updateFields.category_en = sanitizeInput(category_en);
    if (target && target > 0) updateFields.targetQtl = target;
    if (price && price > 0) updateFields.offerPrice = price;
    if (buyerName) updateFields.buyerName = sanitizeInput(buyerName);
    if (buyerLocation) updateFields.buyerLocation = sanitizeInput(buyerLocation);
    if (deadline) updateFields.deadline = sanitizeInput(deadline);
    if (qualityRequired) updateFields.qualityRequired = sanitizeInput(qualityRequired);

    let updated = null;
    if (isMongoDBConnected()) {
      const existing = await CropPoolModel.findOne({ poolId });
      if (!existing) return res.status(404).json({ error: 'Pool not found.' });

      // Ownership verify check (if pool has a createdByUserId)
      if (existing.createdByUserId && createdByUserId && existing.createdByUserId !== createdByUserId) {
        return res.status(403).json({ error: 'Permission denied. Only the pool creator can edit this card.' });
      }

      Object.assign(existing, updateFields);
      if (existing.filledQtl >= existing.targetQtl) existing.status = 'CLOSED';
      else if (existing.filledQtl > 0) existing.status = 'FILLING';
      else existing.status = 'OPEN';

      await existing.save();
      updated = existing;
    } else {
      const memIndex = memoryCropPools.findIndex(p => p.poolId === poolId || p.id === poolId);
      if (memIndex === -1) return res.status(404).json({ error: 'Pool not found.' });
      const mem = memoryCropPools[memIndex];
      Object.assign(mem, updateFields);
      if (mem.filledQtl >= mem.targetQtl) mem.status = 'CLOSED';
      else if (mem.filledQtl > 0) mem.status = 'FILLING';
      else mem.status = 'OPEN';
      updated = mem;
    }

    console.log(`[LokVani FPO Pool Edited]: ${updated.commodity_en} (${poolId})`);
    broadcastPoolEvent('POOL_EDITED', updated);

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[API PUT /api/pools/:poolId Error]:', error);
    return res.status(500).json({ error: 'Failed to update crop pool.' });
  }
});

// ─── 15. Delete Crop Pool (DELETE /api/pools/:poolId) ─────────────────────────
app.delete('/api/pools/:poolId', async (req, res) => {
  try {
    const { poolId } = req.params;
    const creatorId = req.query.creatorId || req.body?.creatorId;

    if (isMongoDBConnected()) {
      const existing = await CropPoolModel.findOne({ poolId });
      if (!existing) {
        return res.status(404).json({ error: 'Pool not found.' });
      }

      if (existing.createdByUserId && creatorId && existing.createdByUserId !== creatorId) {
        return res.status(403).json({ error: 'Permission denied. Only the pool creator can delete this card.' });
      }

      await CropPoolModel.deleteOne({ poolId });
    }

    memoryCropPools = memoryCropPools.filter(p => p.poolId !== poolId && p.id !== poolId);

    console.log(`[LokVani FPO Pool Deleted]: ${poolId}`);
    broadcastPoolEvent('POOL_DELETED', { poolId });

    return res.json({ success: true, message: 'Pool deleted successfully.' });
  } catch (error) {
    console.error('[API DELETE /api/pools/:poolId Error]:', error);
    return res.status(500).json({ error: 'Failed to delete crop pool.' });
  }
});

// ─── 16. Join / Commit Crop to FPO Pool (POST /api/pools/:poolId/join) ───────
app.post('/api/pools/:poolId/join', async (req, res) => {
  try {
    const { poolId } = req.params;
    const { farmerName, phone, village, qtl } = req.body || {};

    const commitQtl = Number(qtl);
    if (!commitQtl || commitQtl <= 0) {
      return res.status(400).json({ error: 'Valid committed quantity is required.' });
    }
    if (!farmerName || !phone) {
      return res.status(400).json({ error: 'Farmer name and phone number are required.' });
    }

    const memberEntry = {
      farmerName: sanitizeInput(farmerName),
      phone: sanitizeInput(phone),
      village: sanitizeInput(village) || 'Nearby Village',
      qtl: commitQtl,
      joinedAt: new Date()
    };

    let updatedPool = null;

    if (isMongoDBConnected()) {
      const pool = await CropPoolModel.findOne({ poolId });
      if (!pool) return res.status(404).json({ error: 'Pool not found.' });

      const newFilled = (pool.filledQtl || 0) + commitQtl;
      const newStatus = newFilled >= pool.targetQtl ? 'CLOSED' : 'FILLING';

      pool.filledQtl = newFilled;
      pool.participants = (pool.participants || 1) + 1;
      pool.status = newStatus;
      pool.members.push(memberEntry);
      await pool.save();
      updatedPool = pool;
    } else {
      const memPool = memoryCropPools.find(p => p.poolId === poolId || p.id === poolId);
      if (!memPool) {
        return res.status(404).json({ error: 'Crop pool not found.' });
      }

      memPool.filledQtl = (memPool.filledQtl || 0) + commitQtl;
      memPool.participants = (memPool.participants || 1) + 1;
      memPool.status = memPool.filledQtl >= memPool.targetQtl ? 'CLOSED' : 'FILLING';
      memPool.members = [...(memPool.members || []), memberEntry];
      updatedPool = memPool;
    }

    broadcastPoolEvent('POOL_UPDATED', updatedPool);

    return res.json({
      success: true,
      data: updatedPool,
      message: 'Successfully joined harvest pool!'
    });
  } catch (error) {
    console.error('[API POST /api/pools/:poolId/join Error]:', error);
    return res.status(500).json({ error: 'Failed to commit quantity to crop pool.' });
  }
});

// Start Express & WebSocket Server (Only in standalone Node mode, not on Vercel Serverless)
if (!process.env.VERCEL) {
  try {
    const server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`  LokVani AI Backend API listening on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  CORS Allowed Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`===================================================`);
    });

    const wss = new WebSocketServer({ server });
    wss.on('connection', async (ws) => {
      wsClients.add(ws);
      try {
        let pools = isMongoDBConnected() ? await CropPoolModel.find().sort({ createdAt: -1 }) : memoryCropPools;
        ws.send(JSON.stringify({ type: 'INIT_POOLS', payload: pools }));
      } catch (_) {}
      ws.on('close', () => wsClients.delete(ws));
      ws.on('error', () => wsClients.delete(ws));
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        setTimeout(() => {
          try { server.close(); } catch (_) {}
          app.listen(PORT);
        }, 1500);
      }
    });
  } catch (err) {
    console.warn('[LokVani Server] Local server init warning:', err.message);
  }
}

export default app;
