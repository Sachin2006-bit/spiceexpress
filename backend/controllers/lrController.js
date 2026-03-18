import LR from '../models/LR.js';
import mongoose from 'mongoose';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

export const createLR = async (req, res) => {
  try {
    // Parse and map nested fields for new schema
    const body = req.body;
    // Consignor (Sender) - use nested structure from frontend
    const consignor = {
      name: body.consignor?.name || '',
      address: body.consignor?.address || '',
      state: body.consignor?.state || '',
      city: body.consignor?.city || '',
      pin: body.consignor?.pin || '',
      phone: body.consignor?.phone || '',
      email: body.consignor?.email || '',
      gstin: body.consignor?.gstin || ''
    };
    // Consignee (Receiver) - use nested structure from frontend
    const consignee = {
      name: body.consignee?.name || '',
      address: body.consignee?.address || '',
      state: body.consignee?.state || '',
      city: body.consignee?.city || '',
      pin: body.consignee?.pin || '',
      phone: body.consignee?.phone || '',
      email: body.consignee?.email || '',
      gstin: body.consignee?.gstin || ''
    };
    // Shipment Details - read from nested structure sent by frontend
    const shipmentDetails = {
      numberOfArticles: body.shipmentDetails?.numberOfArticles ?? body.numberOfArticles,
      actualWeight: body.shipmentDetails?.actualWeight ?? body.actualWeight,
      chargedWeight: body.shipmentDetails?.chargedWeight ?? body.chargedWeight,
      descriptionOfGoods: body.shipmentDetails?.descriptionOfGoods ?? body.descriptionOfGoods,
      declaredValue: body.shipmentDetails?.declaredValue ?? body.declaredValue, /* New Field */
      expectedDeliveryDate: body.shipmentDetails?.expectedDeliveryDate ?? body.expectedDeliveryDate /* New Field */
    };
    // Charges
    const charges = {
      paymentType: body.charges?.paymentType,
      freight: body.charges?.freight,
      docketCharge: body.charges?.docketCharge,
      doorDeliveryCharge: body.charges?.doorDeliveryCharge,
      handlingCharge: body.charges?.handlingCharge,
      pickupCharge: body.charges?.pickupCharge,
      transhipmentCharge: body.charges?.transhipmentCharge,
      insurance: body.charges?.insurance,
      fuelSurcharge: body.charges?.fuelSurcharge,
      commission: body.charges?.commission,
      other: body.charges?.other,
      carrierRisk: body.charges?.carrierRisk,
      ownerRisk: body.charges?.ownerRisk,
      gstCharge: body.charges?.gstCharge,
      total: body.charges?.total
    };
    // Customer Invoice
    const customerInvoice = {
      number: body.invoiceNumber,
      date: body.invoiceDate,
      value: body.invoiceValue
    };

    // Generate LR number if not provided
    let lrNumber = body.lrNumber;
    if (!lrNumber) {
      const date = new Date();
      const year = date.getFullYear();

      // Determine prefix based on company code (11=SE, 12=ATL)
      const companyCode = body.companyCode || '11';
      const prefix = companyCode === '12' ? 'ATL' : 'SE';

      // Count LRs for this company in the current year
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year + 1, 0, 1);
      const count = await LR.countDocuments({
        lrNumber: { $regex: `^${prefix}${year}` }
      });

      // Format: PREFIX + YEAR + 3-digit sequence (e.g., SE2025001, ATL2025002)
      lrNumber = `${prefix}${year}${String(count + 1).padStart(3, '0')}`;
    }

    // Compose LR object
    const lrData = {
      lrNumber,
      bookingDate: body.bookingDate || new Date(),
      status: body.status || 'Booked',
      customer: body.customer,
      dispatchBranch: body.dispatchBranch,
      vehicleNumber: body.vehicleNumber,
      driverName: body.driverName,
      consignor,
      consignee,
      shipmentDetails,
      charges,
      ewayBillNumber: body.ewayBillNumber,
      customerInvoice,
      podDocumentUrl: body.podDocumentUrl,
      company: req.user && req.user.company ? req.user.company : undefined
    };

    const lr = await LR.create(lrData);
    res.status(201).json(lr);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create LR', details: error.message });
  }
};

export const getLRs = async (req, res) => {
  try {
    const { customerCode, fromDate, toDate } = req.query;
    const filter = {};
    // Only admins can see all LRs. Users see only their company's LRs.
    if (req.user && req.user.role !== 'admin') {
      if (req.user.company) {
        filter['company'] = req.user.company;
      } else {
        return res.status(403).json({ error: 'No company assigned to user' });
      }
    }
    if (customerCode) filter.customerCode = customerCode;
    if (fromDate && toDate) {
      filter.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }

    const lrs = await LR.find(filter).sort({ date: -1 });
    res.json(lrs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get LRs', details: error.message });
  }
};

export const getLRById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'LR id is required' });
    }

    const lr = await LR.findById(id).lean();
    if (!lr) {
      return res.status(404).json({ error: 'LR not found' });
    }

    return res.json(lr);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get LR', details: error.message });
  }
};

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const downloadLR = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'LR id is required' });
    }

    const lr = await LR.findById(id).lean();
    if (!lr) {
      return res.status(404).json({ error: 'LR not found' });
    }

    // Determine company based on LR prefix
    const isAsian = lr.lrNumber && lr.lrNumber.startsWith('ATL');
    const companyName = isAsian ? "ASIAN TRANSPORT LOGISTICS" : "SPICE EXPRESS";
    const logoFileName = isAsian ? 'asian-logo.jpg' : 'spice-logo.png';
    const logoFormat = isAsian ? 'JPEG' : 'PNG';

    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logoPath = path.resolve(__dirname, `../public/uploads/logos/${logoFileName}`);
    
    let logoDataUrl = null;
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataUrl = `data:image/${logoFormat.toLowerCase()};base64,${logoBuffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn('Could not load logo:', e.message);
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    
    // --- Helper function to draw an LR box (since the template drew 2 per page) ---
    const drawLRBox = (startY, isCopy = false) => {
        const boxHeight = (pageHeight - (margin * 3)) / 2; // Two boxes per page, with margins
        const contentWidth = pageWidth - (margin * 2);
        
        // --- Main Box Boundary ---
        doc.setDrawColor(0); // Black
        doc.setLineWidth(0.5);
        doc.rect(margin, startY, contentWidth, boxHeight);
        
        // --- 1. Header Section ---
        // Top grey line/background for URL
        doc.setFillColor(240, 240, 240); // Light grey
        doc.rect(margin, startY, contentWidth, 12, 'F');
        doc.line(margin, startY + 12, pageWidth - margin, startY + 12); // Bottom border of grey area
        
        doc.setFontSize(8);
        doc.setTextColor(80); // Dark grey text
        doc.text("TRACK @ www.spiceexpress.co.in", margin + 2, startY + 5);
        doc.text("Email: admin@spiceexpress.co.in", margin + 2, startY + 9);
        
        // Copy Label
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(isCopy ? 200 : 0, 0, 0); // Red if copy, black if original
        doc.text(isCopy ? "(CONSIGNEE COPY)" : "(ORGINAL CONSIGNOR COPY)", pageWidth - margin - 2, startY + 8, { align: "right" });
        
        // Logo
        const logoStartY = startY + 15;
        if (logoDataUrl) {
            // we remove 'data:image/xxx;base64,' prefix for jsPDF
            const base64Data = logoDataUrl.split(',')[1];
            if (base64Data) {
               try {
                 const imgProps = doc.getImageProperties(logoDataUrl);
                 const desiredHeight = 12;
                 const desiredWidth = (imgProps.width * desiredHeight) / imgProps.height;
                 doc.addImage(base64Data, logoFormat, margin + 2, logoStartY, desiredWidth, desiredHeight);
               } catch (e) {
                 doc.addImage(base64Data, logoFormat, margin + 2, logoStartY, 24, 12);
               }
            }
        } else {
            doc.setFillColor(255, 0, 0); // Red color
            doc.circle(margin + 8, logoStartY + 6, 6, 'F');
            doc.setTextColor(255, 255, 255); // White text
            doc.setFontSize(5);
            doc.setFont("helvetica", "bold");
            doc.text("LOGO", margin + 8, logoStartY + 7, { align: 'center' });
        }
        
        // Company Name
        doc.setTextColor(0); // Black
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(companyName, margin + 16, logoStartY + 4);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("On Time Every Time", margin + 16, logoStartY + 8);
        doc.text("Block D, Plot No. D 464, Mankapur, Nagpur 440002", margin + 16, logoStartY + 12);
        doc.setFont("helvetica", "bold");
        doc.text("GST No.: 27AEMFS2408G1ZY", margin + 2, logoStartY + 18);
        
        // LR Info (Top Right)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(lr.lrNumber || 'N/A', pageWidth - margin - 2, logoStartY + 4, { align: "right" });
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const origin = lr.consignor?.city || '';
        const destination = lr.consignee?.city || '';
        doc.text(`Origin: ${origin}`, pageWidth - margin - 2, logoStartY + 10, { align: "right" });
        doc.text(`Destination: ${destination}`, pageWidth - margin - 2, logoStartY + 14, { align: "right" });
        
        // Header Bottom Line
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(margin, startY + 36, pageWidth - margin, startY + 36);
        
        // --- 2. Addresses Section ---
        const addressStartY = startY + 38;
        
        // Column dividers
        doc.setLineWidth(0.2);
        doc.line(margin + (contentWidth * 0.35), startY + 36, margin + (contentWidth * 0.35), addressStartY + 20); // Divider 1
        doc.line(margin + (contentWidth * 0.7), startY + 36, margin + (contentWidth * 0.7), addressStartY + 20); // Divider 2

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Sender's Name:", margin + 2, addressStartY + 3);
        doc.line(margin + 2, addressStartY + 4, margin + 25, addressStartY + 4); // Underline
        
        doc.text("Receiver's Name:", margin + (contentWidth * 0.35) + 2, addressStartY + 3);
        doc.line(margin + (contentWidth * 0.35) + 2, addressStartY + 4, margin + (contentWidth * 0.35) + 28, addressStartY + 4); // Underline

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        // Sender Details
        const senderStr = `${lr.consignor?.code ? lr.consignor.code + ' - ' : ''}${lr.consignor?.name || ''}\n${lr.consignor?.address || ''}\n${lr.consignor?.city || ''}`;
        doc.text(senderStr, margin + 2, addressStartY + 8, { maxWidth: (contentWidth * 0.33) });
        
        // Receiver Details
        const receiverStr = `${lr.consignee?.code ? lr.consignee.code + ' - ' : ''}${lr.consignee?.name || ''}\n${lr.consignee?.address || ''}\n${lr.consignee?.city || ''}`;
        doc.text(receiverStr, margin + (contentWidth * 0.35) + 2, addressStartY + 8, { maxWidth: (contentWidth * 0.33) });
        
        // Date and Packages (Right Column)
        doc.setFont("helvetica", "bold");
        doc.text(`Dt: ${lr.bookingDate ? new Date(lr.bookingDate).toLocaleDateString() : ''}`, pageWidth - margin - 2, addressStartY + 4, { align: 'right' });
        doc.text(`Packages: ${lr.shipmentDetails?.numberOfArticles || ''}`, pageWidth - margin - 2, addressStartY + 10, { align: 'right' });
        
        // --- 3. Shipment Table ---
        const tableStartY = addressStartY + 20;
        
        const actWt = lr.shipmentDetails?.actualWeight ? Number(lr.shipmentDetails.actualWeight).toFixed(3) : '0.000';
        const chgWt = lr.shipmentDetails?.chargedWeight ? Number(lr.shipmentDetails.chargedWeight).toFixed(3) : '0.000';
        
        doc.autoTable({
            startY: tableStartY,
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, halign: 'center', textColor: 0, lineColor: 0, lineWidth: 0.2 },
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'center' }, // Grey header
            columnStyles: {
                0: { halign: 'left', cellWidth: contentWidth * 0.4 },
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'center' }
            },
            head: [['CONTENTS', 'DECLARED VALUE', 'ACTUAL WT.', 'CHARGED WT.', 'MODE']],
            body: [
                [
                    { content: lr.shipmentDetails?.descriptionOfGoods || '' },
                    { content: lr.customerInvoice?.value || '' },
                    { content: actWt },
                    { content: chgWt },
                    lr.transportType || ''
                ]
            ],
            pageBreak: 'avoid'
        });
        
        // --- 4. Footer Section ---
        const footerStartY = doc.lastAutoTable.finalY;
        
        // Footer Column Dividers
        doc.setLineWidth(0.2);
        doc.line(margin + (contentWidth * 0.45), footerStartY, margin + (contentWidth * 0.45), startY + boxHeight); // Divider 1
        doc.line(margin + (contentWidth * 0.75), footerStartY, margin + (contentWidth * 0.75), startY + boxHeight); // Divider 2

        // Disclaimer (Left)
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        const terms = "I/We declare that this consignment does not contain personal mail,cash,contraband,illegal drugs,any prohibited items and commodities which can cause safety hazzrds while transported by air and surface.\nNon Negotiable Consignment Note/Subject to Nagpur Jurisdiction.Please refer to all the terms & conditions printed overleaf of this consignment note.";
        doc.text(terms, margin + 2, footerStartY + 4, { maxWidth: (contentWidth * 0.43) });
        doc.setFontSize(8);
        doc.text("SENDER'S SIGN:.......................................................", margin + 2, footerStartY + 25);
        
        // Received block (Middle)
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("RECEIVED IN GOOD CONDITION", margin + (contentWidth * 0.45) + 2, footerStartY + 4);
        doc.setFont("helvetica", "normal");
        doc.text("Sign & Seal ...............................", margin + (contentWidth * 0.45) + 2, footerStartY + 10);
        doc.text("Name.............................................", margin + (contentWidth * 0.45) + 2, footerStartY + 14);
        doc.text("Mobile No:....................................", margin + (contentWidth * 0.45) + 2, footerStartY + 18);
        doc.text("I.D. No.:........................................", margin + (contentWidth * 0.45) + 2, footerStartY + 22);
        
        // Signature block (Right)
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("For, The SPICE EXPRESS", pageWidth - margin - 2, footerStartY + 6, { align: 'right' });
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text("Booking Branch / FR Code", pageWidth - margin - 2, footerStartY + 10, { align: 'right' });
        doc.text("Dt:...... Sign:.............", pageWidth - margin - 2, footerStartY + 14, { align: 'right' });
        
        // Weight Box (Bottom Right corner of the right column box)
        doc.setLineWidth(0.3);
        doc.rect(pageWidth - margin - 35, startY + boxHeight - 8, 35, 8); // Outer box
        doc.rect(pageWidth - margin - 35, startY + boxHeight - 8, 12, 8); // KG box separation
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("KG", pageWidth - margin - 33, startY + boxHeight - 2);
        doc.setFontSize(14);
        doc.text(`${chgWt}`, pageWidth - margin - 2, startY + boxHeight - 2, { align: 'right' });
    };

    // Draw top box (Original)
    drawLRBox(margin, false);
    
    // Draw separator line with scissors symbol
    const middleY = pageHeight / 2;
    doc.setLineDash([2, 2], 0);
    doc.line(margin, middleY, pageWidth - margin, middleY);
    doc.setLineDash([]); // reset dash
    
    // Draw bottom box (Copy)
    drawLRBox(middleY + 5, true);

    const pdfBuffer = doc.output('arraybuffer');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="lr-${lr.lrNumber || id}.pdf"`
    );
    // Send standard Buffer in Node.js
    return res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('pdfmake generation error:', error);
    return res.status(500).json({ error: 'Failed to generate LR PDF', details: error.message });
  }
};

export const getLrCount = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    const filter = {};

    if (customerId) {
      filter.customerCode = customerId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const count = await LR.countDocuments(filter);
    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get LR count', details: error.message });
  }
};

export const updateLR = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'LR id is required' });
    }
    const lr = await LR.findById(id);
    if (!lr) {
      return res.status(404).json({ error: 'LR not found' });
    }

    // Support updates coming either as nested objects (consignor/consignee)
    // or legacy flat fields like senderName/receiverName. Merge them into
    // the LR document so later validation uses the nested schema.
    const body = req.body || {};

    // Merge nested consignor/consignee objects if provided
    if (body.consignor && typeof body.consignor === 'object') {
      lr.consignor = { ...(lr.consignor ? lr.consignor.toObject ? lr.consignor.toObject() : lr.consignor : {}), ...body.consignor };
    }
    if (body.consignee && typeof body.consignee === 'object') {
      lr.consignee = { ...(lr.consignee ? lr.consignee.toObject ? lr.consignee.toObject() : lr.consignee : {}), ...body.consignee };
    }

    // Map legacy flat fields into nested objects
    if (body.senderName) lr.consignor = { ...(lr.consignor || {}), name: body.senderName };
    if (body.senderAddress) lr.consignor = { ...(lr.consignor || {}), address: body.senderAddress };
    if (body.senderCity) lr.consignor = { ...(lr.consignor || {}), city: body.senderCity };
    if (body.senderPin) lr.consignor = { ...(lr.consignor || {}), pin: body.senderPin };
    if (body.senderPhone) lr.consignor = { ...(lr.consignor || {}), phone: body.senderPhone };

    if (body.receiverName) lr.consignee = { ...(lr.consignee || {}), name: body.receiverName };
    if (body.receiverAddress) lr.consignee = { ...(lr.consignee || {}), address: body.receiverAddress };
    if (body.receiverCity) lr.consignee = { ...(lr.consignee || {}), city: body.receiverCity };
    if (body.receiverPin) lr.consignee = { ...(lr.consignee || {}), pin: body.receiverPin };
    if (body.receiverPhone) lr.consignee = { ...(lr.consignee || {}), phone: body.receiverPhone };

    // Map other updatable fields that exist on the new schema
    if (body.status !== undefined) lr.status = body.status;
    if (body.customer !== undefined) lr.customer = body.customer;
    if (body.dispatchBranch !== undefined) lr.dispatchBranch = body.dispatchBranch;
    if (body.vehicleNumber !== undefined) lr.vehicleNumber = body.vehicleNumber;
    if (body.driverName !== undefined) lr.driverName = body.driverName;

    // Shipment details
    if (body.shipmentDetails && typeof body.shipmentDetails === 'object') {
      lr.shipmentDetails = { ...(lr.shipmentDetails ? lr.shipmentDetails.toObject ? lr.shipmentDetails.toObject() : lr.shipmentDetails : {}), ...body.shipmentDetails };
    }
    if (body.actualWeight !== undefined) {
      lr.shipmentDetails = { ...(lr.shipmentDetails || {}), actualWeight: body.actualWeight };
    }
    if (body.chargedWeight !== undefined) {
      lr.shipmentDetails = { ...(lr.shipmentDetails || {}), chargedWeight: body.chargedWeight };
    }
    if (body.descriptionOfGoods !== undefined) {
      lr.shipmentDetails = { ...(lr.shipmentDetails || {}), descriptionOfGoods: body.descriptionOfGoods };
    }
    if (body.declaredValue !== undefined) {
      lr.shipmentDetails = { ...(lr.shipmentDetails || {}), declaredValue: body.declaredValue };
    }
    if (body.expectedDeliveryDate !== undefined) {
      lr.shipmentDetails = { ...(lr.shipmentDetails || {}), expectedDeliveryDate: body.expectedDeliveryDate };
    }

    // Charges and invoice (merge if present)
    if (body.charges && typeof body.charges === 'object') {
      lr.charges = { ...(lr.charges ? lr.charges.toObject ? lr.charges.toObject() : lr.charges : {}), ...body.charges };
    }
    if (body.customerInvoice && typeof body.customerInvoice === 'object') {
      lr.customerInvoice = { ...(lr.customerInvoice ? lr.customerInvoice.toObject ? lr.customerInvoice.toObject() : lr.customerInvoice : {}), ...body.customerInvoice };
    }

    // Auto-calculate amount if not provided but rate/chargedWeight are present
    const amt = lr.charges && lr.charges.grandTotal !== undefined ? lr.charges.grandTotal : undefined;
    const chargedWeight = lr.shipmentDetails && lr.shipmentDetails.chargedWeight !== undefined ? Number(lr.shipmentDetails.chargedWeight) : NaN;
    const rate = lr.charges && lr.charges.rate !== undefined ? Number(lr.charges.rate) : NaN;
    if ((amt === undefined || isNaN(Number(amt))) && !isNaN(chargedWeight) && !isNaN(rate) && rate > 0) {
      lr.charges = { ...(lr.charges || {}), grandTotal: chargedWeight * rate };
    }

    // Validate required fields against the new schema
    if (!lr.consignor || !lr.consignor.name) {
      return res.status(400).json({ error: 'Missing required field: consignor.name' });
    }
    if (!lr.consignee || !lr.consignee.name) {
      return res.status(400).json({ error: 'Missing required field: consignee.name' });
    }
    // Customer is only required for TBB (credit billing) mode
    const paymentType = lr.charges?.paymentType;
    if (paymentType === 'TBB' && !lr.customer) {
      return res.status(400).json({ error: 'Missing required field: customer (required for TBB billing)' });
    }
    // Weight validations if present
    if (lr.shipmentDetails && lr.shipmentDetails.actualWeight !== undefined && lr.shipmentDetails.actualWeight < 0) {
      return res.status(400).json({ error: 'Weight values must be positive' });
    }
    if (lr.shipmentDetails && lr.shipmentDetails.chargedWeight !== undefined && lr.shipmentDetails.chargedWeight < 0) {
      return res.status(400).json({ error: 'Weight values must be positive' });
    }

    await lr.save();
    return res.json(lr);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update LR', details: error.message });
  }
};

export const deleteLR = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'LR id is required' });
    }
    const lr = await LR.findById(id);
    if (!lr) {
      return res.status(404).json({ error: 'LR not found' });
    }
    await lr.deleteOne();
    return res.json({ message: 'LR deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete LR', details: error.message });
  }
};
