import mongoose from 'mongoose';

const communityIntelSchema = new mongoose.Schema({
  item: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  location: { type: String, required: true },
  reportedBy: { type: String, default: 'Local Farmer' },
  reporterId: { type: String, default: 'anonymous' },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  category: { type: String, default: 'Vegetable' },
  verifiedCount: { type: Number, default: 1 }
}, {
  timestamps: true
});

export const CommunityIntelModel = mongoose.models.CommunityIntel || mongoose.model('CommunityIntel', communityIntelSchema);
