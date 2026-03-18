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
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Export Invoice Annexure as Excel with LR breakdown
export const exportInvoiceAnnexure = async (req, res) => {
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
    const lrs = invoice.lrList || [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Invoice Annexure');

    // Define columns matching the reference format
    const columns = [
      { header: 'Sr. No', key: 'srNo', width: 8 },
      { header: 'Blkg Date', key: 'blkgDate', width: 12 },
      { header: 'LR Number', key: 'lrNumber', width: 18 },
      { header: 'LR Type', key: 'lrType', width: 10 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Destination', key: 'destination', width: 12 },
      { header: 'Consignor Name', key: 'consignorName', width: 20 },
      { header: 'Consignee Name', key: 'consigneeName', width: 20 },
      { header: 'No of Packages', key: 'packages', width: 12 },
      { header: 'Actual Weight', key: 'actualWeight', width: 12 },
      { header: 'Charge Weight', key: 'chargeWeight', width: 12 },
      { header: 'Customer Invoice', key: 'customerInvoice', width: 15 },
      { header: 'Declared Customer Invoice Value', key: 'invoiceValue', width: 18 },
      { header: 'Rate Per Kg', key: 'ratePerKg', width: 12 },
      { header: 'Base Freight', key: 'baseFreight', width: 12 },
      { header: 'Docket Charge', key: 'docketCharge', width: 12 },
      { header: 'Pickup Charges', key: 'pickupCharges', width: 12 },
      { header: 'Door Delivery', key: 'doorDelivery', width: 12 },
      { header: 'OPA / ODA', key: 'opaOda', width: 10 },
      { header: 'Handling Charges', key: 'handlingCharges', width: 14 },
      { header: 'Liability (Owner/Carrier Risk)', key: 'liability', width: 18 },
      { header: 'Other Charges', key: 'otherCharges', width: 12 },
      { header: 'Pre Tax Billing Amount', key: 'preTaxAmount', width: 18 },
      { header: 'GST Amount', key: 'gstAmount', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
    ];
    sheet.columns = columns;

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    headerRow.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };

    // Add data rows
    let srNo = 1;
    for (const lr of lrs) {
      const charges = lr.charges || {};
      const shipment = lr.shipmentDetails || {};
      const chargedWeight = shipment.chargedWeight || 0;
      const freight = charges.freight || 0;
      const ratePerKg = chargedWeight > 0 ? +(freight / chargedWeight).toFixed(2) : 0;
      const liability = (charges.carrierRisk || 0) + (charges.ownerRisk || 0);
      const otherCharges = (charges.insurance || 0) + (charges.fuelSurcharge || 0) + (charges.commission || 0) + (charges.other || 0);
      const preTaxAmount = freight + (charges.docketCharge || 0) + (charges.pickupCharge || 0) +
        (charges.doorDeliveryCharge || 0) + (charges.handlingCharge || 0) +
        (charges.transhipmentCharge || 0) + liability + otherCharges;
      const gstAmount = charges.gstCharge || 0;
      const total = charges.total || (preTaxAmount + gstAmount);

      sheet.addRow({
        srNo: srNo++,
        blkgDate: lr.bookingDate ? new Date(lr.bookingDate).toLocaleDateString('en-IN') : '',
        lrNumber: lr.lrNumber || '',
        lrType: 'TBB (M)', // Default type
        source: lr.consignor?.city || '',
        destination: lr.consignee?.city || '',
        consignorName: lr.consignor?.name || '',
        consigneeName: lr.consignee?.name || '',
        packages: shipment.numberOfArticles || 1,
        actualWeight: shipment.actualWeight || 0,
        chargeWeight: chargedWeight,
        customerInvoice: lr.customerInvoice?.number || '',
        invoiceValue: lr.customerInvoice?.value || 0,
        ratePerKg,
        baseFreight: freight,
        docketCharge: charges.docketCharge || 0,
        pickupCharges: charges.pickupCharge || 0,
        doorDelivery: charges.doorDeliveryCharge || 0,
        opaOda: charges.transhipmentCharge || 0,
        handlingCharges: charges.handlingCharge || 0,
        liability,
        otherCharges,
        preTaxAmount,
        gstAmount,
        total,
      });
    }

    // Add totals row
    const totalsRow = sheet.addRow({
      srNo: 'Total',
      packages: lrs.reduce((sum, lr) => sum + (lr.shipmentDetails?.numberOfArticles || 1), 0),
      actualWeight: lrs.reduce((sum, lr) => sum + (lr.shipmentDetails?.actualWeight || 0), 0),
      chargeWeight: lrs.reduce((sum, lr) => sum + (lr.shipmentDetails?.chargedWeight || 0), 0),
      invoiceValue: lrs.reduce((sum, lr) => sum + (lr.customerInvoice?.value || 0), 0),
      baseFreight: lrs.reduce((sum, lr) => sum + (lr.charges?.freight || 0), 0),
      docketCharge: lrs.reduce((sum, lr) => sum + (lr.charges?.docketCharge || 0), 0),
      pickupCharges: lrs.reduce((sum, lr) => sum + (lr.charges?.pickupCharge || 0), 0),
      doorDelivery: lrs.reduce((sum, lr) => sum + (lr.charges?.doorDeliveryCharge || 0), 0),
      opaOda: lrs.reduce((sum, lr) => sum + (lr.charges?.transhipmentCharge || 0), 0),
      handlingCharges: lrs.reduce((sum, lr) => sum + (lr.charges?.handlingCharge || 0), 0),
      liability: lrs.reduce((sum, lr) => sum + (lr.charges?.carrierRisk || 0) + (lr.charges?.ownerRisk || 0), 0),
      otherCharges: lrs.reduce((sum, lr) => sum + (lr.charges?.insurance || 0) + (lr.charges?.fuelSurcharge || 0) + (lr.charges?.commission || 0) + (lr.charges?.other || 0), 0),
      preTaxAmount: lrs.reduce((sum, lr) => {
        const c = lr.charges || {};
        return sum + (c.freight || 0) + (c.docketCharge || 0) + (c.pickupCharge || 0) +
          (c.doorDeliveryCharge || 0) + (c.handlingCharge || 0) + (c.transhipmentCharge || 0) +
          (c.carrierRisk || 0) + (c.ownerRisk || 0) + (c.insurance || 0) + (c.fuelSurcharge || 0) + (c.commission || 0) + (c.other || 0);
      }, 0),
      gstAmount: lrs.reduce((sum, lr) => sum + (lr.charges?.gstCharge || 0), 0),
      total: lrs.reduce((sum, lr) => sum + (lr.charges?.total || 0), 0),
    });
    totalsRow.font = { bold: true };
    totalsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const customerName = customer?.company || invoice.customerCode || 'Customer';
    const fileName = `Invoice_Annexure_${invoice.invoiceNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to export invoice annexure', details: error.message });
  }
};

export const createInvoice = async (req, res) => {
  const {
    customerCode,
    lrList,
    invoiceNo,
    invoiceDate,
    dueDate,
    billingOU,
    companyCode, // 11=SPICE, 12=ASIAN
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

  // Get company details based on companyCode
  const { getCompany } = await import('../config/companies.js');
  const company = getCompany(companyCode || '11');

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
    companyCode: companyCode || '11',
    customerCode,
    lrList,
    invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
    dueDate: dueDate ? new Date(dueDate) : undefined,
    billingOU,
    supplierName: company.name,
    supplierGstin: company.gstin,
    billingAddress: company.address,
    poNumber,
    hsn: hsn || company.hsnCode,
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

    // Get company based on stored companyCode
    const { getCompany } = await import('../config/companies.js');
    const company = getCompany(invoice.companyCode || '11');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.resolve(__dirname, '../views/invoice-template.ejs');

    // Read logo and convert to base64 for embedding in PDF
    const fs = await import('fs');
    let logoBase64 = '';
    try {
      // Remove leading slash from logoPath to make it relative
      const relativeLogoPath = company.logoPath.replace(/^\//, '');
      const logoPath = path.resolve(__dirname, '../public', relativeLogoPath);
      const logoBuffer = fs.readFileSync(logoPath);
      const ext = company.logoPath.endsWith('.jpg') ? 'jpeg' : 'png';
      logoBase64 = `data:image/${ext};base64,${logoBuffer.toString('base64')}`;
    } catch (e) {
      console.warn('Could not load logo:', e.message);
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    let startY = margin;

    // Header
    if (logoBase64) {
      // remove 'data:image/xxx;base64,' prefix for jsPDF
      const base64Data = logoBase64.split(',')[1];
      const ext = company.logoPath.endsWith('.jpg') ? 'JPEG' : 'PNG';
      if (base64Data) {
         try {
           const imgProps = doc.getImageProperties(logoBase64);
           const desiredHeight = 12; // Maintain a reasonable height
           const desiredWidth = (imgProps.width * desiredHeight) / imgProps.height;
           doc.addImage(base64Data, ext, margin, startY, desiredWidth, desiredHeight);
         } catch (e) {
           // Fallback if getImageProperties fails
           doc.addImage(base64Data, ext, margin, startY, 40, 12);
         }
      }
    }
    
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0); // Red
    doc.setFont("helvetica", "italic");
    doc.text("Original For Recipient", pageWidth - margin, startY + 5, { align: "right" });
    
    startY += 20;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", pageWidth / 2, startY, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line((pageWidth / 2) - 15, startY + 1, (pageWidth / 2) + 15, startY + 1);
    
    startY += 10;
    
    // FROM block
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FROM", margin, startY);
    doc.text(company.name || invoice.supplierName || 'SPICE EXPRESS', margin, startY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const compAddr = doc.splitTextToSize(company.address || invoice.billingAddress || '', contentWidth / 2 - 5);
    doc.text(compAddr, margin, startY + 9);
    let currentY = startY + 9 + (compAddr.length * 4);
    doc.text(`State Code (LOS) : ${company.stateCode || '27'} - ${company.state || 'Maharashtra'}`, margin, currentY);
    doc.text(`GSTIN : ${company.gstin || invoice.supplierGstin || '27AEMFS2408G1ZY'}`, margin, currentY + 4);
    doc.text(`PAN : ${company.pan || 'AEMFS2408G'}`, margin, currentY + 8);
    doc.text(`HSN Code : ${company.hsnCode || invoice.hsn || '9969'}`, margin, currentY + 12);
    
    // TO block
    const toX = margin + (contentWidth / 2);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TO", toX, startY);
    doc.text(customer.name || customer.company || '', toX, startY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const custAddr = doc.splitTextToSize(customer.address || '', contentWidth / 2 - 5);
    doc.text(custAddr, toX, startY + 9);
    let custY = startY + 9 + (custAddr.length * 4);
    doc.text(`State Code (LOS) : ${customer.state || ''}`, toX, custY);
    doc.text(`GSTIN : ${customer.gstin || ''}`, toX, custY + 4);
    doc.text(`PAN : ${customer.pan || ''}`, toX, custY + 8);
    
    startY = Math.max(currentY + 12, custY + 8) + 8;
    
    const fv = invoice.freightValue ? Number(invoice.freightValue) : 0;
    const cgst = invoice.cgst ? Number(invoice.cgst) : 0;
    const sgst = invoice.sgst ? Number(invoice.sgst) : 0;
    const igst = invoice.igst ? Number(invoice.igst) : 0;
    const pastDue = invoice.pastDue ? Number(invoice.pastDue) : 0;
    const totalAmount = invoice.totalAmount ? Number(invoice.totalAmount) : 0;
    
    // Left: Summary of Outstanding
    doc.autoTable({
      startY: startY,
      margin: { left: margin },
      tableWidth: contentWidth / 2 - 5,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      headStyles: { fillColor: 255, textColor: 0, fontStyle: 'bold', halign: 'center' },
      head: [[{ content: 'Summary Of Outstanding In Rupees', colSpan: 3 }]],
      body: [
        [{ content: 'Customer Code', fontStyle: 'bold' }, { content: customer.code || invoice.customerCode || '', colSpan: 2 }],
        [{ content: 'Trade Name', fontStyle: 'bold' }, { content: customer.company || customer.name || '', colSpan: 2 }],
        [{ content: 'Current Bills', fontStyle: 'bold' }, { content: 'Past Payment Due', fontStyle: 'bold' }, { content: 'Total Outstanding', fontStyle: 'bold' }],
        [{ content: `Rs. ${totalAmount.toFixed(2)}` }, { content: `Rs. ${pastDue.toFixed(2)}` }, { content: `Rs. ${totalAmount.toFixed(2)}` }]
      ]
    });
    const leftFinalY = doc.lastAutoTable.finalY;
    
    // Right: Invoice Details
    doc.autoTable({
      startY: startY,
      margin: { left: toX },
      tableWidth: contentWidth / 2,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      body: [
        [{ content: 'Place of Supply', fontStyle: 'bold' }, { content: customer.state || 'Maharashtra', halign: 'right' }],
        [{ content: 'Invoice No.', fontStyle: 'bold' }, { content: invoice.invoiceNo || invoice.invoiceNumber || '', halign: 'right' }],
        [{ content: 'Invoice Date', fontStyle: 'bold' }, { content: (invoice.invoiceDate || invoice.date) ? new Date(invoice.invoiceDate || invoice.date).toLocaleDateString('en-IN') : '', halign: 'right' }],
        [{ content: 'Invoice Due Date', fontStyle: 'bold' }, { content: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '', halign: 'right' }]
      ]
    });
    
    startY = Math.max(leftFinalY, doc.lastAutoTable.finalY) + 5;
    
    // Line Items Table
    doc.autoTable({
      startY: startY,
      margin: { left: margin },
      tableWidth: contentWidth,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      headStyles: { fillColor: 255, textColor: 0, fontStyle: 'bold' },
      head: [['S.No.', 'Description', 'Invoice Amount']],
      body: [
        ['1', 'Being Transportation Charges as per annexure attached', { content: `Rs. ${fv.toFixed(2)}`, halign: 'right' }]
      ]
    });
    
    startY = doc.lastAutoTable.finalY + 3;
    
    // Charges Breakdown
    doc.autoTable({
      startY: startY,
      margin: { left: margin },
      tableWidth: contentWidth,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.7 },
        1: { halign: 'right' }
      },
      body: [
        ['Total Freight Amount', `Rs. ${fv.toFixed(2)}`],
        ['CGST', `Rs. ${cgst.toFixed(2)}`],
        ['SGST/UGST', `Rs. ${sgst.toFixed(2)}`],
        [`IGST @ ${invoice.gstPercent || '18'}.0%`, `Rs. ${igst.toFixed(2)}`],
        [{ content: 'Total Invoice Amount', fontStyle: 'bold' }, { content: `Rs. ${totalAmount.toFixed(2)}`, fontStyle: 'bold', halign: 'right' }]
      ]
    });
    
    startY = doc.lastAutoTable.finalY + 4;
    
    // Desc
    doc.setFont("helvetica", "bold");
    doc.text("Description of charges:", margin, startY);
    doc.setFont("helvetica", "normal");
    doc.text(" As per agreed terms", margin + 31, startY);
    
    startY += 6;
    
    // Amount in Words
    doc.rect(margin, startY - 4, contentWidth, 7);
    doc.setFont("helvetica", "bold");
    doc.text("In Words:", margin + 2, startY + 1);
    doc.setFont("helvetica", "normal");
    doc.text(` Rupees ${invoice.amountInWords || 'Zero Only'}`, margin + 15, startY + 1);
    
    startY += 8;
    
    // Terms & Signature Grid
    // Terms
    doc.setFont("helvetica", "bold");
    doc.text("Terms and Conditions", margin, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const coName = company.name || 'Spice Express';
    doc.text(`1. All payments to be made only through Account Payee Cheque /DD/RTGS in favor of ${coName}.`, margin + 2, startY + 4);
    doc.text(`2. Interest @ 2.00% per month or part thereof will be charged if the bill is not paid on due date.`, margin + 2, startY + 8);
    doc.text(`3. All disputes and differences arising out of this will be subject to jurisdiction of Nagpur courts only.`, margin + 2, startY + 12);
    const coEmail = company.email || 'info@spiceexpress.co.in';
    doc.text(`4. Mail your payment advice to ${coEmail}. You can also write to ${coEmail} for any billing related issues.`, margin + 2, startY + 16, { maxWidth: contentWidth * 0.65 });
    
    // Signature
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`For ${coName}`, pageWidth - margin, startY, { align: 'right' });
    doc.setFont("helvetica", "normal");
    doc.line(pageWidth - margin - 40, startY + 18, pageWidth - margin, startY + 18);
    doc.text(`Authorized Signatory`, pageWidth - margin, startY + 22, { align: 'right' });
    
    startY += 28;
    
    // Bank Details
    doc.autoTable({
      startY: startY,
      margin: { left: margin },
      tableWidth: contentWidth,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      body: [
        [
          { content: `Bank Name: ${company.bankName || 'ICICI Bank Ltd'}` },
          { content: `IFSC: ${company.ifsc || 'ICIC0002027'}` },
          { content: `MICR: ${company.code === '11' ? '440229017' : ''}` }
        ],
        [
          { content: `Account Name: ${company.accountName || 'SPICE EXPRESS'}` },
          { content: `Account Number: ${company.accountNo || '202705002621'} (CA)`, colSpan: 2 }
        ]
      ]
    });
    
    startY = doc.lastAutoTable.finalY + 4;
    
    // Disclaimer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const discCust = customer.name || customer.company || 'THE RECIPIENT';
    const disc = `The electronic signature to this system generated invoice shall be as valid as an original signature of such party and shall be effectively binding on ${discCust.toUpperCase()}. This electronically signed invoice shall be deemed (i) to be "written" or "in writing," (ii) to have been signed and (iii) to constitute a record established and maintained in the ordinary course of business and an original written record when printed from electronic files. Such paper copies or "printouts," if introduced as evidence in any judicial, arbitral, mediation or administrative proceeding, will be admissible between the parties to the same extent as physical signed document. This is a computer generated invoice and needs no signature.`;
    doc.text(doc.splitTextToSize(disc, contentWidth), margin, startY);
    
    // Footer
    startY = pageHeight - margin - 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(coName, margin, startY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Registered Office: ${company.address || 'Block D, Plot No. D 464, Martin nagar, Mankapur, Nagpur - 440002, Maharashtra.'}`, margin, startY + 4);
    doc.text(`Email: ${coEmail}`, margin, startY + 8);
    if (company.code === '11') {
      doc.text(`Web: ${company.website || 'www.spiceexpress.in'}`, margin, startY + 12);
    }
    doc.text(`CIN: ${company.cin || ''}`, margin, startY + 16);
    
    if (company.code === '11') {
      doc.setFillColor(196, 30, 58); // red
      doc.rect(pageWidth - margin - 40, startY + 4, 40, 6, 'F');
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("SPEED YOU TRUST", pageWidth - margin - 20, startY + 8, { align: 'center' });
    }

    const pdfBuffer = doc.output('arraybuffer');
    return res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate invoice PDF', details: error.message });
  }
};
