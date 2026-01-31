/**
 * PDF.JS - PDF Generation
 * This file handles generating PDF invoices using the jsPDF library
 */

/**
 * Generate and download a PDF invoice
 * @param {Object} invoiceData - The invoice data from state
 */
function generatePDF(invoiceData) {
  // Check if jsPDF is available
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Please refresh the page and try again.');
    console.error('jsPDF library not found');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Page settings
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;
  
  // Helper function to add text
  const addText = (text, x, y, fontSize = 10, fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.text(text, x, y);
  };
  
  // Helper function to add line
  const addLine = (y) => {
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };
  
  // === HEADER SECTION ===
  // App name/logo
  doc.setFillColor(16, 185, 129); // Emerald color
  doc.rect(margin, yPos, 60, 10, 'F');
  doc.setTextColor(255, 255, 255);
  addText('SwiftInvoice', margin + 5, yPos + 7, 14, 'bold');
  doc.setTextColor(0, 0, 0);
  
  yPos += 15;
  
  // Invoice title and number
  addText('INVOICE', margin, yPos, 24, 'bold');
  addText(`#${invoiceData.invoiceNumber}`, pageWidth - margin - 40, yPos, 14, 'normal');
  
  yPos += 10;
  
  // === BUSINESS INFO (Left) and INVOICE DETAILS (Right) ===
  const leftCol = margin;
  const rightCol = pageWidth - margin - 60;
  
  // Business info
  addText('From:', leftCol, yPos, 10, 'bold');
  yPos += 6;
  addText(invoiceData.business.name || 'Business Name', leftCol, yPos, 12, 'bold');
  yPos += 5;
  addText(invoiceData.business.address || '', leftCol, yPos, 9);
  yPos += 5;
  addText(invoiceData.business.phone || '', leftCol, yPos, 9);
  
  // Invoice details (right side)
  let detailYPos = yPos - 16;
  addText('Issue Date:', rightCol, detailYPos, 9);
  addText(formatDateForPDF(invoiceData.issueDate), rightCol + 25, detailYPos, 9, 'bold');
  detailYPos += 5;
  
  if (invoiceData.dueDate) {
    addText('Due Date:', rightCol, detailYPos, 9);
    addText(formatDateForPDF(invoiceData.dueDate), rightCol + 25, detailYPos, 9, 'bold');
  }
  
  yPos += 15;
  
  // === CLIENT INFO ===
  addText('Bill To:', leftCol, yPos, 10, 'bold');
  yPos += 6;
  addText(invoiceData.client.name || 'Client Name', leftCol, yPos, 12, 'bold');
  yPos += 5;
  addText(invoiceData.client.address || '', leftCol, yPos, 9);
  yPos += 5;
  addText(invoiceData.client.phone || '', leftCol, yPos, 9);
  
  yPos += 15;
  
  // === ITEMS TABLE ===
  addLine(yPos);
  yPos += 5;
  
  // Table headers
  const colWidths = {
    description: 80,
    quantity: 20,
    price: 35,
    total: 35
  };
  
  const colPositions = {
    description: margin,
    quantity: margin + colWidths.description + 5,
    price: margin + colWidths.description + colWidths.quantity + 10,
    total: margin + colWidths.description + colWidths.quantity + colWidths.price + 15
  };
  
  // Header background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  
  yPos += 6;
  addText('Description', colPositions.description, yPos, 9, 'bold');
  addText('Qty', colPositions.quantity, yPos, 9, 'bold');
  addText('Price', colPositions.price, yPos, 9, 'bold');
  addText('Total', colPositions.total, yPos, 9, 'bold');
  
  yPos += 5;
  addLine(yPos);
  yPos += 7;
  
  // Table rows
  invoiceData.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    addText(item.description || 'N/A', colPositions.description, yPos, 9);
    addText(item.quantity.toString(), colPositions.quantity, yPos, 9);
    addText(formatCurrency(item.price), colPositions.price, yPos, 9);
    addText(formatCurrency(item.total), colPositions.total, yPos, 9);
    
    yPos += 7;
  });
  
  yPos += 3;
  addLine(yPos);
  yPos += 10;
  
  // === SUMMARY SECTION ===
  const summaryX = pageWidth - margin - 60;
  const summaryLabelX = summaryX - 30;
  
  // Subtotal
  addText('Subtotal:', summaryLabelX, yPos, 10);
  addText(formatCurrency(invoiceData.subtotal), summaryX, yPos, 10, 'normal');
  yPos += 7;
  
  // Tax
  if (invoiceData.taxRate > 0) {
    const taxAmount = (invoiceData.subtotal * invoiceData.taxRate) / 100;
    addText(`Tax (${invoiceData.taxRate}%):`, summaryLabelX, yPos, 10);
    addText(formatCurrency(taxAmount), summaryX, yPos, 10, 'normal');
    yPos += 7;
  }
  
  // Discount
  if (invoiceData.discount > 0) {
    addText('Discount:', summaryLabelX, yPos, 10);
    addText(`-${formatCurrency(invoiceData.discount)}`, summaryX, yPos, 10, 'normal');
    yPos += 7;
  }
  
  // Total
  yPos += 2;
  doc.setFillColor(16, 185, 129);
  doc.rect(summaryLabelX - 5, yPos - 5, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  addText('TOTAL:', summaryLabelX, yPos + 2, 12, 'bold');
  addText(formatCurrency(invoiceData.total), summaryX, yPos + 2, 12, 'bold');
  doc.setTextColor(0, 0, 0);
  
  // === FOOTER ===
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Generated by SwiftInvoice - Thank you for your business!',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  // Save the PDF
  const filename = `invoice_${invoiceData.invoiceNumber}_${new Date().getTime()}.pdf`;
  doc.save(filename);
}

/**
 * Format date for PDF display
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDateForPDF(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Alternative: Generate PDF with more detailed styling
 * This is a more advanced version you can use later
 */
function generateDetailedPDF(invoiceData) {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded.');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add company logo if available (you can expand this)
  // doc.addImage(logoBase64, 'PNG', 15, 10, 40, 20);
  
  // Use the basic generatePDF for now, but this function
  // can be expanded with more features like:
  // - Custom colors/branding
  // - Payment terms
  // - Notes section
  // - Bank details
  // - QR codes for payment
  
  generatePDF(invoiceData);
}