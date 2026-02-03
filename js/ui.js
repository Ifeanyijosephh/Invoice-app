/**
 * UI.JS - User Interface Management
 * This file handles all DOM manipulations and user interactions:
 * - Rendering items to tables
 * - Updating preview pane
 * - Setting up event listeners
 * - Handling user input
 */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Business info inputs
  document.getElementById('businessName').addEventListener('input', handleBusinessInput);
  document.getElementById('businessPhone').addEventListener('input', handleBusinessInput);
  document.getElementById('businessAddress').addEventListener('input', handleBusinessInput);
  
  // Client info inputs
  document.getElementById('clientName').addEventListener('input', handleClientInput);
  document.getElementById('clientPhone').addEventListener('input', handleClientInput);
  document.getElementById('clientAddress').addEventListener('input', handleClientInput);
  
  // Financial inputs
  document.getElementById('taxRate').addEventListener('input', handleFinancialInput);
  document.getElementById('discountAmount').addEventListener('input', handleFinancialInput);
  
  // Action buttons
  document.getElementById('addItemBtn').addEventListener('click', handleAddItem);
  document.getElementById('saveInvoiceBtn').addEventListener('click', handleSaveInvoice);
  document.getElementById('downloadPdfBtn').addEventListener('click', handleDownloadPdf);
  document.getElementById('historyBtn').addEventListener('click', handleShowHistory);
}

/**
 * Handle business info input changes
 */
function handleBusinessInput(event) {
  const field = event.target.id.replace('business', '').toLowerCase();
  updateBusiness({ [field]: event.target.value });
  updatePreview();
}

/**
 * Handle client info input changes
 */
function handleClientInput(event) {
  const field = event.target.id.replace('client', '').toLowerCase();
  updateClient({ [field]: event.target.value });
  updatePreview();
}

/**
 * Handle financial input changes (tax, discount)
 */
function handleFinancialInput(event) {
  const state = getState();
  
  if (event.target.id === 'taxRate') {
    updateTaxRate(event.target.value);
  } else if (event.target.id === 'discountAmount') {
    updateDiscount(event.target.value);
  }
  
  // Recalculate and update display
  const totals = recalculateAll(state);
  updateTotals(totals);
  updateSummaryDisplay();
  updatePreview();
}

/**
 * Handle add item button click
 */
function handleAddItem() {
  const newItem = addItem({
    description: '',
    quantity: 1,
    price: 0
  });
  
  renderItems();
  
  // Recalculate totals
  const state = getState();
  const totals = recalculateAll(state);
  updateTotals(totals);
  updateSummaryDisplay();
  updatePreview();
  
  // Focus on the new item's description field
  const newRow = document.querySelector(`tr[data-item-id="${newItem.id}"]`);
  if (newRow) {
    newRow.querySelector('.item-description').focus();
  }
}

/**
 * Handle item removal
 */
function handleRemoveItem(itemId) {
  removeItem(itemId);
  renderItems();
  
  // Recalculate totals
  const state = getState();
  const totals = recalculateAll(state);
  updateTotals(totals);
  updateSummaryDisplay();
  updatePreview();
}

/**
 * Handle item field changes
 */
function handleItemChange(itemId, field, value) {
  updateItem(itemId, { [field]: value });
  
  // Update the total display for this item
  const state = getState();
  const item = state.items.find(i => i.id === itemId);
  if (item) {
    const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
    if (row) {
      row.querySelector('.item-total').textContent = formatCurrency(item.total);
    }
  }
  
  // Recalculate totals
  const totals = recalculateAll(state);
  updateTotals(totals);
  updateSummaryDisplay();
  updatePreview();
}

/**
 * Render all items to the items table
 */
function renderItems() {
  const state = getState();
  const tbody = document.getElementById('itemsTableBody');
  tbody.innerHTML = '';
  
  state.items.forEach(item => {
    const row = createItemRow(item);
    tbody.appendChild(row);
  });
  
  // If no items, show a message
  if (state.items.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" class="px-4 py-8 text-center text-gray-400">
        No items added yet. Click "+ Add Item" to start.
      </td>
    `;
    tbody.appendChild(emptyRow);
  }
}

/**
 * Create a table row for an item
 */
function createItemRow(item) {
  const row = document.createElement('tr');
  row.setAttribute('data-item-id', item.id);
  row.className = 'hover:bg-gray-50';
  
  row.innerHTML = `
    <td class="px-4 py-2">
      <input 
        type="text" 
        value="${item.description}" 
        placeholder="Item description"
        class="item-description w-full p-1 border border-gray-200 rounded"
        data-item-id="${item.id}"
      />
    </td>
    <td class="px-4 py-2">
      <input 
        type="number" 
        value="${item.quantity}" 
        min="0"
        step="1"
        class="item-quantity w-20 p-1 border border-gray-200 rounded text-right"
        data-item-id="${item.id}"
      />
    </td>
    <td class="px-4 py-2">
      <input 
        type="number" 
        value="${item.price}" 
        min="0"
        step="0.01"
        class="item-price w-24 p-1 border border-gray-200 rounded text-right"
        data-item-id="${item.id}"
      />
    </td>
    <td class="px-4 py-2">
      <span class="item-total font-semibold">${formatCurrency(item.total)}</span>
    </td>
    <td class="px-4 py-2">
      <button 
        class="remove-item-btn text-red-500 hover:text-red-700 font-bold"
        data-item-id="${item.id}"
      >
        ✕
      </button>
    </td>
  `;
  
  // Add event listeners to inputs
  const descInput = row.querySelector('.item-description');
  const qtyInput = row.querySelector('.item-quantity');
  const priceInput = row.querySelector('.item-price');
  const removeBtn = row.querySelector('.remove-item-btn');
  
  descInput.addEventListener('input', (e) => {
    handleItemChange(item.id, 'description', e.target.value);
  });
  
  qtyInput.addEventListener('input', (e) => {
    handleItemChange(item.id, 'quantity', e.target.value);
  });
  
  priceInput.addEventListener('input', (e) => {
    handleItemChange(item.id, 'price', e.target.value);
  });
  
  removeBtn.addEventListener('click', () => {
    handleRemoveItem(item.id);
  });
  
  return row;
}

/**
 * Update the summary section display
 */
function updateSummaryDisplay() {
  const state = getState();
  
  document.getElementById('subtotalAmount').textContent = formatCurrency(state.subtotal);
  document.getElementById('totalAmount').textContent = formatCurrency(state.total);
}

/**
 * Update the preview pane
 */
function updatePreview() {
  const state = getState();
  
  // Update invoice metadata
  document.getElementById('previewInvoiceNumber').textContent = state.invoiceNumber;
  document.getElementById('previewIssueDate').textContent = formatDate(state.issueDate);
  document.getElementById('previewDueDate').textContent = state.dueDate ? formatDate(state.dueDate) : 'N/A';
  
  // Update business info
  document.getElementById('previewBusinessName').textContent = state.business.name || 'Business Name';
  document.getElementById('previewBusinessAddress').textContent = state.business.address || 'Business Address';
  document.getElementById('previewBusinessPhone').textContent = state.business.phone || 'Business Phone';
  
  // Update client info
  document.getElementById('previewClientName').textContent = state.client.name || 'Client Name';
  document.getElementById('previewClientAddress').textContent = state.client.address || 'Client Address';
  document.getElementById('previewClientPhone').textContent = state.client.phone || 'Client Phone';
  
  // Update items
  const previewItemsBody = document.getElementById('previewItemsBody');
  previewItemsBody.innerHTML = '';
  
  if (state.items.length === 0) {
    previewItemsBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-2 py-4 text-center text-gray-400 text-sm">
          No items
        </td>
      </tr>
    `;
  } else {
    state.items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-2 py-1 text-sm">${item.description || 'N/A'}</td>
        <td class="px-2 py-1 text-sm">${item.quantity}</td>
        <td class="px-2 py-1 text-sm">${formatCurrency(item.price)}</td>
        <td class="px-2 py-1 text-sm">${formatCurrency(item.total)}</td>
      `;
      previewItemsBody.appendChild(row);
    });
  }
  
  // Update total
  document.getElementById('previewTotal').textContent = formatCurrency(state.total);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Load form data from state
 * Used when loading a saved invoice
 */
function loadFormData() {
  const state = getState();
  
  // Load business info
  document.getElementById('businessName').value = state.business.name || '';
  document.getElementById('businessPhone').value = state.business.phone || '';
  document.getElementById('businessAddress').value = state.business.address || '';
  
  // Load client info
  document.getElementById('clientName').value = state.client.name || '';
  document.getElementById('clientPhone').value = state.client.phone || '';
  document.getElementById('clientAddress').value = state.client.address || '';
  
  // Load financial info
  document.getElementById('taxRate').value = state.taxRate || 0;
  document.getElementById('discountAmount').value = state.discount || 0;
  
  // Render items and update displays
  renderItems();
  updateSummaryDisplay();
  updatePreview();
}

/**
 * Handle save invoice button click
 */
function handleSaveInvoice() {
  const state = getState();
  
  // Validate that invoice has required data
  if (!state.business.name) {
    alert('Please enter business name');
    return;
  }
  
  if (!state.client.name) {
    alert('Please enter client name');
    return;
  }
  
  if (state.items.length === 0) {
    alert('Please add at least one item');
    return;
  }
  
  // Save the invoice
  const success = saveInvoice(state);
  
  if (success) {
    const savedInvoiceNumber = state.invoiceNumber;
    alert(`Invoice ${savedInvoiceNumber} saved successfully!`);
    
    // Ask user if they want to create a new invoice
    const createNew = confirm('Invoice saved! Would you like to create a new invoice?');
    
    if (createNew) {
      // Reset and create new invoice
      resetState();
      const newState = getState();
      newState.invoiceNumber = generateInvoiceNumber();
      
      // Set dates
      const today = new Date();
      newState.issueDate = today.toISOString().split('T')[0];
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 14);
      newState.dueDate = dueDate.toISOString().split('T')[0];
      
      // Add one empty item
      addItem({
        description: '',
        quantity: 1,
        price: 0
      });
      
      // Reload the form
      loadFormData();
      
      console.log('New invoice created:', newState.invoiceNumber);
    }
  } else {
    alert('Failed to save invoice. Please try again.');
  }
}

/**
 * Handle download PDF button click
 */
function handleDownloadPdf() {
  const state = getState();
  
  // Validate that invoice has data
  if (state.items.length === 0) {
    alert('Please add items to the invoice before downloading PDF');
    return;
  }
  
  // Generate and download PDF
  generatePDF(state);
}

/**
 * Handle history button click
 */
function handleShowHistory() {
  showHistoryModal();
}

/**
 * Show history modal with saved invoices
 */
function showHistoryModal() {
  const invoices = getAllInvoices();
  
  if (invoices.length === 0) {
    alert('No saved invoices yet');
    return;
  }
  
  // Create modal HTML
  const modal = document.createElement('div');
  modal.id = 'historyModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  let invoiceListHTML = '';
  invoices.forEach(invoice => {
    invoiceListHTML += `
      <div class="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 cursor-pointer" data-invoice-id="${invoice.invoiceNumber}">
        <div class="flex justify-between items-start mb-2">
          <div>
            <div class="font-bold text-lg">${invoice.invoiceNumber}</div>
            <div class="text-sm text-gray-600">${invoice.business.name} → ${invoice.client.name}</div>
            <div class="text-sm text-gray-500">Date: ${formatDate(invoice.issueDate)}</div>
          </div>
          <div class="text-right">
            <div class="font-bold text-lg text-emerald-600">${formatCurrency(invoice.total)}</div>
            <div class="text-xs text-gray-500">${invoice.items.length} items</div>
          </div>
        </div>
        <div class="flex space-x-2 mt-2">
          <button class="load-invoice-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm" data-invoice-id="${invoice.invoiceNumber}">
            Load
          </button>
          <button class="delete-invoice-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" data-invoice-id="${invoice.invoiceNumber}">
            Delete
          </button>
        </div>
      </div>
    `;
  });
  
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <div class="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Invoice History</h2>
        <button id="closeHistoryModal" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
      </div>
      <div class="p-6 overflow-y-auto flex-1 space-y-3">
        ${invoiceListHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('closeHistoryModal').addEventListener('click', () => {
    modal.remove();
  });
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Load invoice buttons
  document.querySelectorAll('.load-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const invoiceId = btn.getAttribute('data-invoice-id');
      const invoice = getInvoice(invoiceId);
      if (invoice) {
        loadState(invoice);
        loadFormData();
        modal.remove();
      }
    });
  });
  
  // Delete invoice buttons
  document.querySelectorAll('.delete-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const invoiceId = btn.getAttribute('data-invoice-id');
      if (confirm(`Are you sure you want to delete invoice ${invoiceId}?`)) {
        deleteInvoice(invoiceId);
        modal.remove();
        showHistoryModal(); // Refresh the modal
      }
    });
  });
}

/**
 * Initialize the UI when the page loads
 */
function initializeUI() {
  initializeEventListeners();
  loadFormData();
}