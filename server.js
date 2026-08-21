import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, isMongoDBConnected } from './db/connection.js';
import { QueryLog } from './db/models/QueryLog.js';
import { TrustReview } from './db/models/TrustReview.js';
import { CommunityIntelModel } from './db/models/CommunityIntel.js';
import { processVoiceQuery } from './src/services/geminiService.js';
import { geminiRotator } from './src/services/geminiKeyRotator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    actionableSteps: ['Aadhar card link check karein', 'Kirana CSC center par e-KYC karein'],
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
    const { transcribed_text, user_location, userId, userEmail, userName } = req.body || {};

    if (!transcribed_text || typeof transcribed_text !== 'string') {
      return res.status(400).json({ error: 'Missing required field: transcribed_text string.' });
    }

    // Fetch current intel for Gemini context
    let intelList = memoryCommunityIntel;
    if (isMongoDBConnected()) {
      const dbIntel = await CommunityIntelModel.find().sort({ createdAt: -1 }).limit(10);
      if (dbIntel && dbIntel.length > 0) intelList = dbIntel;
    }

    // Run AI Engine through Rotator
    const aiResult = await processVoiceQuery(transcribed_text, intelList);

    const initialStatus = aiResult.is_high_stakes ? 'PENDING_TRUST_REVIEW' : 'AUTO_VERIFIED';

    const logEntry = {
      userId: userId || 'anonymous',
      userEmail: userEmail || '',
      userName: userName || 'Guest User',
      transcribedText: transcribed_text,
      userLocation: user_location || 'Azamgarh, UP',
      shortAnswerHi: aiResult.short_answer_hi,
      shortAnswerEn: aiResult.short_answer_en,
      domain: aiResult.domain || 'AGRI_ADVISORY',
      isHighStakes: aiResult.is_high_stakes || false,
      riskCategory: aiResult.risk_category || 'NONE',
      trustNote: aiResult.trust_note || '',
      actionableSteps: aiResult.actionable_steps || [],
      status: initialStatus,
      apiKeyIndexUsed: aiResult.apiKeyIndexUsed || 0,
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
    if (isMongoDBConnected()) {
      const items = await CommunityIntelModel.find().sort({ createdAt: -1 }).limit(30);
      return res.json({ success: true, data: items });
    }
    return res.json({ success: true, data: memoryCommunityIntel });
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

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  LokVani AI Backend API listening on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  CORS Allowed Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`===================================================`);
});
