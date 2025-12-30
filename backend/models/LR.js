
import mongoose from 'mongoose';

const lrSchema = new mongoose.Schema({
  // Section 1: Core Shipment Details
  lrNumber: { type: String, required: true, unique: true },
  bookingDate: { type: Date, required: true, default: Date.now },
  status: {
    type: String,
    enum: ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Booked'
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  dispatchBranch: { type: String },
  company: { type: String, required: false }, // Company for access control

  // Section 2: Vehicle & Driver Information
  vehicleNumber: { type: String },
  driverName: { type: String },

  // Section 3: Consignor (Sender) Information
  consignor: {
    name: { type: String, required: true },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    pin: { type: String },
    phone: { type: String },
    email: { type: String },
    gstin: { type: String }
  },

  consignee: {
    name: { type: String, required: true },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    pin: { type: String },
    phone: { type: String },
    email: { type: String },
    gstin: { type: String }
  },

  // Section 5: Shipment & Goods Details
  shipmentDetails: {
    numberOfArticles: { type: Number },
    actualWeight: { type: Number },
    chargedWeight: { type: Number },
    descriptionOfGoods: { type: String }
  },

  // Section 6: Financials and Charges
  charges: {
    paymentType: { type: String, enum: ['TBB', 'PAID', 'TOPAY', 'FOC'], default: 'TBB' },
    freight: { type: Number, default: 0 },
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
    gstCharge: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // Section 7: Associated Documents
  ewayBillNumber: { type: String },
  customerInvoice: {
    number: { type: String },
    date: { type: Date },
    value: { type: Number }
  },
  podDocumentUrl: { type: String }, // For Proof of Delivery

}, { timestamps: true });

const LR = mongoose.model('LR', lrSchema);
export default LR;
