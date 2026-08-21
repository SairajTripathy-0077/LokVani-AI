import mongoose from 'mongoose';

const queryLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'anonymous', index: true },
  userEmail: { type: String, default: '' },
  userName: { type: String, default: 'Guest User' },
  transcribedText: { type: String, required: true },
  userLocation: { type: String, default: 'Azamgarh, UP' },
  shortAnswerHi: { type: String, required: true },
  shortAnswerEn: { type: String, required: true },
  domain: { 
    type: String, 
    enum: ['GOVT_SCHEME', 'MARKET_PRICE', 'AGRI_ADVISORY', 'WEATHER'],
    default: 'AGRI_ADVISORY'
  },
  isHighStakes: { type: Boolean, default: false },
  riskCategory: { type: String, default: 'NONE' },
  trustNote: { type: String, default: '' },
  actionableSteps: [{ type: String }],
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
