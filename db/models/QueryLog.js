import mongoose from 'mongoose';

const queryLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'anonymous', index: true },
  userEmail: { type: String, default: '' },
  userName: { type: String, default: 'Guest User' },
  transcribedText: { type: String, required: true },
  userLocation: { type: String, default: 'Azamgarh, UP' },
  shortAnswerHi: { type: String, required: true },
  shortAnswerEn: { type: String, required: true },
  detailedAnswerHi: { type: String, default: '' },
  detailedAnswerEn: { type: String, default: '' },
  domain: { 
    type: String, 
    enum: [
      'GOVT_SCHEME', 'MARKET_PRICE', 'AGRI_ADVISORY', 'WEATHER',
      'SOIL_ADVISORY', 'CROP_PREDICTION', 'DISTRESS_CHECK', 'GENERAL_AGRICULTURE'
    ],
    default: 'AGRI_ADVISORY'
  },
  intent: { type: String, default: 'GENERAL_AGRICULTURE' },
  isHighStakes: { type: Boolean, default: false },
  riskCategory: { type: String, default: 'NONE' },
  trustNote: { type: String, default: '' },
  actionableSteps: [{ type: String }],
  followUpQuestions: [{ type: String }],
  sources: [{ type: String }],
  modelResults: { type: mongoose.Schema.Types.Mixed, default: null },
  weatherData: { type: mongoose.Schema.Types.Mixed, default: null },
  mandiData: { type: mongoose.Schema.Types.Mixed, default: null },
  distressData: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { 
    type: String, 
    enum: ['AUTO_VERIFIED', 'PENDING_TRUST_REVIEW', 'APPROVED', 'MODIFIED', 'REJECTED'],
    default: 'AUTO_VERIFIED'
  },
  apiKeyIndexUsed: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const QueryLog = mongoose.models.QueryLog || mongoose.model('QueryLog', queryLogSchema);
