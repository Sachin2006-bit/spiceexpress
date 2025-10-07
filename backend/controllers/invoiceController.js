// Get all invoices (not just unpaid)
export const getAllInvoices = async (req, res) => {
  let filter = {};
  if (req.user && req.user.role !== 'admin') {
    const lrs = await LR.find({ company: req.user.company }).select('_id');
    const lrIds = lrs.map(lr => lr._id);
    filter.lrList = { $in: lrIds };
  }
  const invoices = await Invoice.find(filter).populate('lrList');
  res.json(invoices);
};

// Get invoice by ID (details)
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Invoice id is required' });
    }
    let invoice = await Invoice.findById(id).populate('lrList').lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    // If user, restrict access to their company only
    if (req.user && req.user.role !== 'admin') {
      const lrs = await LR.find({ company: req.user.company }).select('_id');
      const lrIds = lrs.map(lr => lr._id.toString());
      const invoiceLrIds = (invoice.lrList || []).map(lr => lr._id?.toString());
      const hasAccess = invoiceLrIds.some(id => lrIds.includes(id));
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    res.json(invoice);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get invoice', details: error.message });
  }
};
import Invoice from '../models/Invoice.js';
import LR from '../models/LR.js';
import Customer from '../models/Customer.js';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

export const createInvoice = async (req, res) => {
  const {
    customerCode,
    lrList,
    invoiceNo,
    invoiceDate,
    dueDate,
    billingOU,
    supplierName,
    supplierGstin,
    billingAddress,
    poNumber,
  hsn,
  freightValue,
  gstPercent
  } = req.body;

  if (!customerCode || !String(customerCode).trim()) {
    return res.status(400).json({ error: 'customerCode is required' });
  }
  if (!Array.isArray(lrList) || lrList.length === 0) {
    return res.status(400).json({ error: 'lrList is required and must contain at least one LR id' });
  }

  const lrs = await LR.find({ _id: { $in: lrList } });

  // Sum LR charges.total for invoice
  const totalLrAmount = lrs.reduce((sum, lr) => sum + (lr.charges?.total || 0), 0);
  const freight = Number(freightValue || 0);
  const gst = Number(gstPercent || 0);
  // split GST equally into CGST and SGST for domestic
  const gstAmount = +(freight * (gst / 100));
  const cgst = +(gstAmount / 2);
  const sgst = +(gstAmount / 2);
  const totalAmount = +(totalLrAmount + freight + gstAmount);

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceNo,
    customerCode,
    lrList,
    invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
    dueDate: dueDate ? new Date(dueDate) : undefined,
    billingOU,
    supplierName,
    supplierGstin,
    billingAddress,
    poNumber,
    hsn,
    freightValue: freight,
    cgst,
    sgst,
    totalAmount,
    date: new Date()
  });

  res.status(201).json(invoice);
};

export const getUnpaidInvoices = async (req, res) => {
  let filter = { status: 'unpaid' };
  // Only admins see all invoices; users see only their company's invoices
  if (req.user && req.user.role !== 'admin') {
    // Find all LRs for this company
    const lrs = await LR.find({ company: req.user.company }).select('_id');
    const lrIds = lrs.map(lr => lr._id);
    filter.lrList = { $in: lrIds };
  }
  const invoices = await Invoice.find(filter).populate('lrList');
  res.json(invoices);
};

export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Invoice id is required' });
    }

    const invoice = await Invoice.findById(id).populate('lrList').lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const customer = await Customer.findOne({ code: invoice.customerCode }).lean();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '../views/invoice-template.ejs');

    const html = await ejs.renderFile(templatePath, {
      invoice,
      customer: customer || {},
      lrs: invoice.lrList || [],
    });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
  await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNumber || id}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate invoice PDF', details: error.message });
  }
};
