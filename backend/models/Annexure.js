import mongoose from 'mongoose';

const annexureSchema = new mongoose.Schema({
  lrId: { type: mongoose.Schema.Types.ObjectId, ref: 'LR' },
  status: { type: String, enum: ['before', 'after'], required: true },
  generatedAt: { type: Date, default: Date.now }
});

const Annexure = mongoose.model('Annexure', annexureSchema);
export default Annexure;
