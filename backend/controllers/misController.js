import Customer from '../models/Customer.js';
import LR from '../models/LR.js';
import Invoice from '../models/Invoice.js';

// GET /api/mis/summary/:customerId
export const getCustomerMIS = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) return res.status(400).json({ error: 'Customer id is required' });
    const customer = await Customer.findById(customerId).lean();
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // LRs
    const lrs = await LR.find({ customerCode: customer.code }).sort({ date: -1 }).lean();
    // Invoices
    const invoices = await Invoice.find({ customerCode: customer.code }).sort({ date: -1 }).lean();

    // Summary
    const totalOrders = lrs.length;
    const totalSpent = lrs.reduce((sum, lr) => sum + (lr.amount || 0), 0);
    const lastOrderDate = lrs[0]?.date || null;
    const delivered = lrs.filter(lr => lr.status === 'delivered').length;
    const pending = lrs.filter(lr => lr.status === 'pending').length;
    const inTransit = lrs.filter(lr => lr.status === 'in-transit').length;
    const cancelled = lrs.filter(lr => lr.status === 'cancelled').length;

    res.json({
      customer,
      totalOrders,
      totalSpent,
      lastOrderDate,
      delivered,
      pending,
      inTransit,
      cancelled,
      lrs,
      invoices
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load MIS', details: err.message });
  }
};
