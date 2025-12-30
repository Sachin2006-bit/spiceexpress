import mongoose from 'mongoose';

// Lane rate schema with rate type (per kg or per package)
const laneRateSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  rateType: { type: String, enum: ['perKg', 'perPackage'], default: 'perKg' },
  rate: { type: Number, required: true }
}, { _id: false });

// Default charges schema for preset taxes & duties
const defaultChargesSchema = new mongoose.Schema({
  docketCharge: { type: Number, default: 0 },
  doorDeliveryCharge: { type: Number, default: 0 },
  handlingCharge: { type: Number, default: 0 },
  pickupCharge: { type: Number, default: 0 },
  transhipmentCharge: { type: Number, default: 0 },
  insurance: { type: Number, default: 0 },
  fuelSurcharge: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  other: { type: Number, default: 0 },
  carrierRisk: { type: Number, default: 0 },
  ownerRisk: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 0 }  // GST percentage (e.g., 18 for 18%)
}, { _id: false });

const customerSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String }, // Optional - will default to company if not provided
  company: String,
  address: String,
  state: String,
  city: String,
  pin: String,
  phone: String,
  fax: String,
  email: String,
  hsnCode: String,
  cftRatio: String,
  gst1: String,
  gstin: String,
  pan: String,
  bankName: String,
  accountNo: String,
  micr: String,
  ifsc: String,
  // Rate mapping: key is "from-to" lane, value is lane rate details
  rate: {
    type: Map,
    of: laneRateSchema,
    default: {}
  },
  // Default charges for LR creation
  defaultCharges: {
    type: defaultChargesSchema,
    default: () => ({})
  }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
