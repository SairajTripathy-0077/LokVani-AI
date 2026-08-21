import mongoose from 'mongoose';

const trustReviewSchema = new mongoose.Schema({
  queryLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'QueryLog', required: true, index: true },
  operatorId: { type: String, required: true },
  operatorName: { type: String, default: 'Kirana Operator' },
  operatorLocation: { type: String, default: 'Azamgarh Hub' },
  action: { 
    type: String, 
    enum: ['APPROVE', 'MODIFY', 'REJECT'], 
    required: true 
  },
  operatorNote: { type: String, default: '' },
  modifiedShortAnswerHi: { type: String, default: '' },
  modifiedShortAnswerEn: { type: String, default: '' }
}, {
  timestamps: true
});

export const TrustReview = mongoose.models.TrustReview || mongoose.model('TrustReview', trustReviewSchema);
