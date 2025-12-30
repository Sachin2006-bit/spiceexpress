export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to fetch customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // If rate is present, ensure it's stored as a Map
    if (update.rate && typeof update.rate === 'object') {
      update.rate = new Map(Object.entries(update.rate));
    }
    const customer = await Customer.findByIdAndUpdate(id, update, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update customer' });
  }
};
import Customer from '../models/Customer.js';
import LR from '../models/LR.js';
import Invoice from '../models/Invoice.js';

export const getAllCustomers = async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
};

export const createCustomer = async (req, res) => {
  try {
    const {
      code, name, company, address, state, city, pin, phone, fax, email, hsnCode, cftRatio, gst1, gstin, pan, bankName, accountNo, micr, ifsc, rate
    } = req.body;

    // Auto-generate customer code if not provided
    let customerCode = code;
    if (!customerCode || customerCode.trim() === '') {
      const year = new Date().getFullYear();
      // Count existing customers to get next sequence number
      const count = await Customer.countDocuments({
        code: { $regex: `^CUST${year}` }
      });
      // Format: CUST + YEAR + 3-digit sequence (e.g., CUST2025001)
      customerCode = `CUST${year}${String(count + 1).padStart(3, '0')}`;
    }

    // Auto-set name from company if not provided
    const customerName = name || company || customerCode;

    // Handle rate if provided
    let customerRate = undefined;
    if (rate && typeof rate === 'object') {
      customerRate = new Map(Object.entries(rate));
    }

    const customer = await Customer.create({
      code: customerCode,
      name: customerName,
      company,
      address,
      state,
      city,
      pin,
      phone,
      fax,
      email,
      hsnCode,
      cftRatio,
      gst1,
      gstin,
      pan,
      bankName,
      accountNo,
      micr,
      ifsc,
      rate: customerRate
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to add customer' });
  }
};

export const getCustomerSummary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Customer id is required' });
    }

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customerId = customer._id;

    const [lrAgg, invoiceAgg, recentLRs] = await Promise.all([
      LR.aggregate([
        { $match: { customer: customerId } },
        {
          $group: {
            _id: null,
            totalBusiness: { $sum: '$charges.total' }, // Fixed: was grandTotal
            lrCount: { $sum: 1 },
          },
        },
      ]),
      Invoice.aggregate([
        { $match: { customerCode: customer.code, status: 'unpaid' } }, // Fixed: use customerCode string
        { $group: { _id: null, totalUnpaid: { $sum: '$totalAmount' } } },
      ]),
      LR.find({ customer: customerId })
        .sort({ bookingDate: -1, createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const summary = {
      customer,
      totalBusiness: (lrAgg && lrAgg[0] && lrAgg[0].totalBusiness) || 0,
      lrCount: (lrAgg && lrAgg[0] && lrAgg[0].lrCount) || 0,
      totalUnpaid: (invoiceAgg && invoiceAgg[0] && invoiceAgg[0].totalUnpaid) || 0,
      recentLRs: recentLRs || [],
    };

    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get customer summary', details: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete customer' });
  }
};
