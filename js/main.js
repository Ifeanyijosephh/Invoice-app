/**
 * MAIN.JS - Application Entry Point
 * This file initializes the application and coordinates all modules
 * It runs when the page loads and sets everything up
 */

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('SwiftInvoice - Initializing...');
  
  // Generate initial invoice number
  const currentState = getState();
  if (!currentState.invoiceNumber || currentState.invoiceNumber === 'INV-001') {
    currentState.invoiceNumber = generateInvoiceNumber();
  }
  
  // Set initial dates
  const today = new Date();
  currentState.issueDate = today.toISOString().split('T')[0];
  
  // Set due date to 14 days from now
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 14);
  currentState.dueDate = dueDate.toISOString().split('T')[0];
  
  // Initialize the UI
  initializeUI();
  
  // Add one empty item to start
  if (currentState.items.length === 0) {
    addItem({
      description: '',
      quantity: 1,
      price: 0
    });
    renderItems();
  }
  
  // Initial calculation and display update
  const totals = recalculateAll(currentState);
  updateTotals(totals);
  updateSummaryDisplay();
  updatePreview();
  
  console.log('SwiftInvoice - Ready!');
  
  // Check storage statistics (for debugging)
  const stats = getStorageStats();
  console.log('Storage Stats:', stats);
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSaveInvoice();
  }
  
  // Ctrl/Cmd + P to download PDF
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    handleDownloadPdf();
  }
  
  // Ctrl/Cmd + H to show history
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault();
    handleShowHistory();
  }
  
  // Ctrl/Cmd + N to create new invoice
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    createNewInvoice();
  }
});

/**
 * Create a new invoice (reset everything)
 */
function createNewInvoice() {
  if (confirm('Create a new invoice? Any unsaved changes will be lost.')) {
    resetState();
    
    // Generate new invoice number
    const state = getState();
    state.invoiceNumber = generateInvoiceNumber();
    
    // Set dates
    const today = new Date();
    state.issueDate = today.toISOString().split('T')[0];
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);
    state.dueDate = dueDate.toISOString().split('T')[0];
    
    // Add one empty item
    addItem({
      description: '',
      quantity: 1,
      price: 0
    });
    
    // Reload the form
    loadFormData();
    
    console.log('New invoice created:', state.invoiceNumber);
  }
}

/**
 * Handle before unload - warn if there are unsaved changes
 */
window.addEventListener('beforeunload', function(e) {
  const state = getState();
  
  // Check if there's any data entered
  const hasData = state.business.name || 
                  state.client.name || 
                  state.items.some(item => item.description);
  
  if (hasData) {
    // Check if current invoice is saved
    const savedInvoice = getInvoice(state.invoiceNumber);
    
    if (!savedInvoice) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  }
});

/**
 * Error handling for the application
 */
window.addEventListener('error', function(e) {
  console.error('Application Error:', e.error);
  
  // You can add custom error handling here
  // For example, showing a user-friendly error message
});

/**
 * Handle online/offline status
 */
window.addEventListener('online', function() {
  console.log('Application is online');
  // You can add sync functionality here if you implement cloud storage
});

window.addEventListener('offline', function() {
  console.log('Application is offline - using local storage only');
});

/**
 * Console welcome message
 */
console.log('%c SwiftInvoice ', 'background: #10b981; color: white; font-size: 20px; padding: 10px;');
console.log('%c Invoice Management System ', 'color: #10b981; font-size: 14px;');
console.log('%c Keyboard Shortcuts: ', 'font-weight: bold; font-size: 12px;');
console.log('  Ctrl/Cmd + S : Save Invoice');
console.log('  Ctrl/Cmd + P : Download PDF');
console.log('  Ctrl/Cmd + H : Show History');
console.log('  Ctrl/Cmd + N : New Invoice');