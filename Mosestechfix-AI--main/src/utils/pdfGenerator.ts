import { jsPDF } from 'jspdf';
import { BusinessDocument, BusinessProfile } from '../types';
import { formatUGX } from './calculator';

export function generateDocumentPDF(doc: BusinessDocument, profile: BusinessProfile) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 15;

  // Header Primary Color (Ugandan Tech Green)
  pdf.setFillColor(0, 104, 55); // #006837
  pdf.rect(0, 0, pageWidth, 20, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(profile.name.toUpperCase(), 14, 13);

  pdf.setFontSize(11);
  pdf.text(doc.docType === 'quotation' ? 'OFFICIAL QUOTATION' : 'OFFICIAL INVOICE', pageWidth - 14, 13, { align: 'right' });

  y = 28;

  // Business Info Box (Left)
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('ISSUED BY:', 14, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  y += 5;
  pdf.text(profile.name, 14, y);
  y += 4.5;
  pdf.text(`Tel / WhatsApp: ${profile.phone}`, 14, y);
  y += 4.5;
  pdf.text(`Website: ${profile.website || 'https://mosestechfixsolution.com'}`, 14, y);
  y += 4.5;
  pdf.text(`Email: ${profile.email}`, 14, y);
  y += 4.5;
  pdf.text(`Address: ${profile.address}`, 14, y);
  if (profile.tin) {
    y += 4.5;
    pdf.text(`TIN: ${profile.tin}`, 14, y);
  }

  // Document Details Box (Right)
  let rightY = 28;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('DOCUMENT DETAILS:', pageWidth - 14, rightY, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  rightY += 5;
  pdf.text(`Doc Number: ${doc.docNumber}`, pageWidth - 14, rightY, { align: 'right' });
  rightY += 4.5;
  pdf.text(`Date: ${doc.date}`, pageWidth - 14, rightY, { align: 'right' });
  rightY += 4.5;
  pdf.text(`Due Date: ${doc.dueDate}`, pageWidth - 14, rightY, { align: 'right' });
  rightY += 4.5;
  pdf.text(`Status: ${doc.status.toUpperCase()}`, pageWidth - 14, rightY, { align: 'right' });

  y = Math.max(y, rightY) + 8;

  // Divider Line
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.4);
  pdf.line(14, y, pageWidth - 14, y);
  y += 6;

  // Customer Details Box
  pdf.setFillColor(248, 250, 252);
  pdf.rect(14, y, pageWidth - 28, 18, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(14, y, pageWidth - 28, 18, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('CUSTOMER / CLIENT:', 18, y + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.customerName, 18, y + 10);
  pdf.setFontSize(9);
  pdf.text(`Tel: ${doc.customerPhone}`, 18, y + 14.5);

  y += 24;

  // Items Table Header
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, pageWidth - 28, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);

  pdf.text('ITEM DESCRIPTION', 18, y + 5.5);
  pdf.text('QTY', 120, y + 5.5, { align: 'center' });
  pdf.text('UNIT PRICE (UGX)', 150, y + 5.5, { align: 'right' });
  pdf.text('TOTAL (UGX)', pageWidth - 18, y + 5.5, { align: 'right' });

  y += 8;

  // Table Rows
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30, 41, 59);

  doc.items.forEach((item, idx) => {
    // Alternating background
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y, pageWidth - 28, 8, 'F');
    }

    pdf.text(item.description, 18, y + 5.5);
    pdf.text(item.quantity.toString(), 120, y + 5.5, { align: 'center' });
    pdf.text((item.unitPriceUGX).toLocaleString('en-US'), 150, y + 5.5, { align: 'right' });
    pdf.text((item.totalUGX).toLocaleString('en-US'), pageWidth - 18, y + 5.5, { align: 'right' });

    y += 8;
  });

  pdf.line(14, y, pageWidth - 14, y);
  y += 6;

  // Financial Breakdown Box
  const summaryX = pageWidth - 80;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);

  pdf.text('Subtotal:', summaryX, y);
  pdf.text(formatUGX(doc.subtotalUGX), pageWidth - 18, y, { align: 'right' });
  y += 5;

  if (doc.discountUGX > 0) {
    pdf.text('Discount:', summaryX, y);
    pdf.text(`- ${formatUGX(doc.discountUGX)}`, pageWidth - 18, y, { align: 'right' });
    y += 5;
  }

  if (doc.includeVAT) {
    pdf.text('VAT (18% URA):', summaryX, y);
    pdf.text(formatUGX(doc.vatAmountUGX), pageWidth - 18, y, { align: 'right' });
    y += 5;
  }

  // Grand Total Box
  pdf.setFillColor(0, 104, 55);
  pdf.rect(summaryX - 4, y, 70, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.text('TOTAL AMOUNT:', summaryX, y + 5.5);
  pdf.text(formatUGX(doc.totalUGX), pageWidth - 18, y + 5.5, { align: 'right' });

  y += 16;

  // Payment Terms & Bank/MoMo Info
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text('PAYMENT DETAILS & TERMS:', 14, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  y += 4.5;
  pdf.text(`• Mobile Money (MTN / Airtel): ${profile.phone} (${profile.name})`, 14, y);
  y += 4;
  if (doc.paymentTerms) {
    pdf.text(`• Payment Terms: ${doc.paymentTerms}`, 14, y);
    y += 4;
  }
  if (doc.notes) {
    pdf.text(`• Notes: ${doc.notes}`, 14, y);
    y += 4;
  }

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 12;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Generated using MosesTech Business AI — Your Smart Ugandan Business Assistant.', pageWidth / 2, footerY, { align: 'center' });

  pdf.save(`${doc.docNumber}_${doc.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function getDocumentShareUrl(docId: string): string {
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://mosestech.app';
  return `${origin}?doc=${docId}`;
}

export function generateWhatsAppShareMessage(
  doc: BusinessDocument,
  profile: BusinessProfile,
  customUrl?: string
): string {
  const docUrl = customUrl || getDocumentShareUrl(doc.id);

  const itemsSummary = doc.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.description} @ ${formatUGX(item.unitPriceUGX)} = *${formatUGX(item.totalUGX)}*`
    )
    .join('\n');

  let totalsBreakdown = `*Subtotal:* ${formatUGX(doc.subtotalUGX)}`;
  if (doc.discountUGX > 0) {
    totalsBreakdown += `\n*Discount:* -${formatUGX(doc.discountUGX)}`;
  }
  if (doc.includeVAT && doc.vatAmountUGX) {
    totalsBreakdown += `\n*VAT (18%):* ${formatUGX(doc.vatAmountUGX)}`;
  }
  totalsBreakdown += `\n*GRAND TOTAL:* ${formatUGX(doc.totalUGX)}`;

  return `Hello ${doc.customerName},

Here is your official *${doc.docType.toUpperCase()}* from *${profile.name}*:

📌 *Doc Number:* ${doc.docNumber}
📅 *Date:* ${doc.date}
⌛ *Due Date:* ${doc.dueDate}

🛒 *SUMMARY OF ITEMS:*
${itemsSummary}

💵 *FINANCIAL TOTALS:*
${totalsBreakdown}

🔗 *VIEW ONLINE DOCUMENT:*
${docUrl}

💳 *PAYMENT & SERVICE CONTACTS:*
• Mobile Money (Airtel / MTN): ${profile.phone} (${profile.name})
• Official Website: ${profile.website || 'https://mosestechfixsolution.com'}
${doc.paymentTerms ? `• ${doc.paymentTerms}` : ''}

Thank you for choosing ${profile.name}!`;
}

export function generateWhatsAppShareLink(
  doc: BusinessDocument,
  profile: BusinessProfile,
  customUrl?: string
): string {
  const text = generateWhatsAppShareMessage(doc, profile, customUrl);
  const encoded = encodeURIComponent(text);
  const cleanPhone = doc.customerPhone ? doc.customerPhone.replace(/[^0-9]/g, '') : '';

  if (cleanPhone && cleanPhone.length >= 9) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
