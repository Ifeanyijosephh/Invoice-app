/**
 * CALCULATIONS.JS - Financial Calculations
 * This file handles all mathematical operations for the invoice:
 * - Item totals (quantity × price)
 * - Subtotal (sum of all items)
 * - Tax calculation
 * - Discount application
 * - Final total
 */

/**
 * Calculate the total for a single item
 * @param {number} quantity - Item quantity
 * @param {number} price - Item price
 * @returns {number} Total for the item
 */
function calculateItemTotal(quantity, price) {
  const qty = parseFloat(quantity) || 0;
  const prc = parseFloat(price) || 0;
  return qty * prc;
}

/**
 * Calculate subtotal from all items in the state
 * @param {Array} items - Array of invoice items
 * @returns {number} Subtotal amount
 */
function calculateSubtotal(items) {
  if (!items || items.length === 0) {
    return 0;
  }
  
  return items.reduce((sum, item) => {
    return sum + (item.total || 0);
  }, 0);
}

/**
 * Calculate tax amount based on subtotal and tax rate
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 10 for 10%)
 * @returns {number} Tax amount
 */
function calculateTax(subtotal, taxRate) {
  const sub = parseFloat(subtotal) || 0;
  const rate = parseFloat(taxRate) || 0;
  return (sub * rate) / 100;
}

/**
 * Calculate the final total
 * Formula: Subtotal + Tax - Discount
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate as percentage
 * @param {number} discount - Discount amount
 * @returns {Object} Object containing subtotal, tax, and total
 */
function calculateTotal(subtotal, taxRate, discount) {
  const sub = parseFloat(subtotal) || 0;
  const tax = calculateTax(sub, taxRate);
  const disc = parseFloat(discount) || 0;
  
  const total = sub + tax - disc;
  
  return {
    subtotal: sub,
    tax: tax,
    discount: disc,
    total: Math.max(0, total) // Ensure total is never negative
  };
}

/**
 * Recalculate all financial values based on current state
 * This is the main function to call when anything changes
 * @param {Object} state - The current state object
 * @returns {Object} Updated totals
 */
function recalculateAll(state) {
  // First, recalculate all item totals
  state.items.forEach(item => {
    item.total = calculateItemTotal(item.quantity, item.price);
  });
  
  // Calculate subtotal from all items
  const subtotal = calculateSubtotal(state.items);
  
  // Calculate final total with tax and discount
  const totals = calculateTotal(subtotal, state.taxRate, state.discount);
  
  return totals;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₦)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = '₦') {
  const num = parseFloat(amount) || 0;
  return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format number with commas for readability
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  const number = parseFloat(num) || 0;
  return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}