const state = {
  // Business information
  business: {
    name: '',
    phone: '',
    address: ''
  },

  // Client information
  client: {
    name: '',
    phone: '',
    address: ''
  },

  // Array of invoice items
  // Each item has: id, description, quantity, price, total
  items: [],

  // Financial calculations
  taxRate: 0,        // Tax percentage (e.g., 10 for 10%)
  discount: 0,       // Discount amount in currency
  subtotal: 0,       // Sum of all item totals
  total: 0,          // Final amount after tax and discount

  // Invoice metadata
  invoiceNumber: 'INV-0001',
  issueDate: new Date().toISOString().split('T')[0],  // Today's date in YYYY-MM-DD
  dueDate: '',

  // Item ID counter - helps generate unique IDs for items
  nextItemId: 1
};

/**
 * Get the current state
 * @returns {Object} The complete state object
 */
function getState() {
  return state;
}

/**
 * Update business information
 * @param {Object} businessData - Object containing business info
 */
function updateBusiness(businessData) {
  state.business = { ...state.business, ...businessData };
}

/**
 * Update client information
 * @param {Object} clientData - Object containing client info
 */
function updateClient(clientData) {
  state.client = { ...state.client, ...clientData };
}

/**
 * Add a new item to the invoice
 * @param {Object} item - Item object with description, quantity, price
 * @returns {Object} The newly created item with ID and total
 */
function addItem(item) {
  const newItem = {
    id: state.nextItemId++,
    description: item.description || '',
    quantity: parseFloat(item.quantity) || 1,
    price: parseFloat(item.price) || 0,
    total: 0  // Will be calculated
  };
  
  // Calculate item total
  newItem.total = newItem.quantity * newItem.price;
  
  state.items.push(newItem);
  return newItem;
}

/**
 * Update an existing item
 * @param {number} itemId - The ID of the item to update
 * @param {Object} updates - Object containing fields to update
 */
function updateItem(itemId, updates) {
  const item = state.items.find(i => i.id === itemId);
  if (item) {
    // Update the item properties
    if (updates.description !== undefined) item.description = updates.description;
    if (updates.quantity !== undefined) item.quantity = parseFloat(updates.quantity) || 0;
    if (updates.price !== undefined) item.price = parseFloat(updates.price) || 0;
    
    // Recalculate item total
    item.total = item.quantity * item.price;
  }
}

/**
 * Remove an item from the invoice
 * @param {number} itemId - The ID of the item to remove
 */
function removeItem(itemId) {
  state.items = state.items.filter(item => item.id !== itemId);
}

/**
 * Update tax rate
 * @param {number} rate - Tax rate as a percentage
 */
function updateTaxRate(rate) {
  state.taxRate = parseFloat(rate) || 0;
}

/**
 * Update discount amount
 * @param {number} amount - Discount amount in currency
 */
function updateDiscount(amount) {
  state.discount = parseFloat(amount) || 0;
}

/**
 * Update financial totals (subtotal and total)
 * This should be called after any item or financial change
 * @param {Object} totals - Object with subtotal and total
 */
function updateTotals(totals) {
  state.subtotal = totals.subtotal;
  state.total = totals.total;
}

/**
 * Reset the entire state to default values
 * Useful for creating a new invoice
 */
function resetState() {
  state.business = { name: '', phone: '', address: '' };
  state.client = { name: '', phone: '', address: '' };
  state.items = [];
  state.taxRate = 0;
  state.discount = 0;
  state.subtotal = 0;
  state.total = 0;
  state.invoiceNumber = generateInvoiceNumber();
  state.issueDate = new Date().toISOString().split('T')[0];
  state.dueDate = '';
  state.nextItemId = 1;
}

/**
 * Generate a new invoice number
 * @returns {string} A new invoice number
 */
function generateInvoiceNumber() {
  const timestamp = Date.now();
  return `INV-${timestamp.toString().slice(-6)}`;
}

/**
 * Load state from an invoice object (used when loading saved invoices)
 * @param {Object} invoiceData - Complete invoice data
 */
function loadState(invoiceData) {
  state.business = invoiceData.business || state.business;
  state.client = invoiceData.client || state.client;
  state.items = invoiceData.items || [];
  state.taxRate = invoiceData.taxRate || 0;
  state.discount = invoiceData.discount || 0;
  state.subtotal = invoiceData.subtotal || 0;
  state.total = invoiceData.total || 0;
  state.invoiceNumber = invoiceData.invoiceNumber || state.invoiceNumber;
  state.issueDate = invoiceData.issueDate || state.issueDate;
  state.dueDate = invoiceData.dueDate || state.dueDate;
  
  // Set nextItemId to avoid conflicts
  if (state.items.length > 0) {
    state.nextItemId = Math.max(...state.items.map(item => item.id)) + 1;
  }
}

// Export functions to be used by other modules
// (In a browser environment without modules, these will be global)