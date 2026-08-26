import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true },
    sentTo: { type: String, required: true },
    ccTo: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now },
    daysElapsed: { type: Number, required: true },
    emailSent: { type: Boolean, default: false },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const schemeApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, default: '' },
    userName: { type: String, default: '' },
    schemeId: { type: String, required: true },
    schemeNameEn: { type: String, default: '' },
    schemeNameHi: { type: String, default: '' },
    ministryEn: { type: String, default: '' },
    applicationRefNo: { type: String, default: '', maxlength: 100 },
    appliedAt: { type: Date, required: true, default: Date.now },
    slaDays: { type: Number, default: 30 },
    grievanceEmail: { type: String, default: '' },
    status: {
      type: String,
      enum: ['WAITING', 'COMPLAINED', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
      default: 'WAITING'
    },
    complaints: [complaintSchema]
  },
  { timestamps: true }
);

schemeApplicationSchema.index({ userId: 1, schemeId: 1 }, { unique: false });

export const SchemeApplication =
  mongoose.models.SchemeApplication ||
  mongoose.model('SchemeApplication', schemeApplicationSchema);
