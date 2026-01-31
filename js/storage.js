/**
 * STORAGE.JS - Local Storage Management
 * This file handles saving and retrieving invoices from browser's localStorage:
 * - Save invoices
 * - Load invoices
 * - Get all invoices (for history)
 * - Delete invoices
 */

const STORAGE_KEY = 'swiftinvoice_invoices';

/**
 * Get all invoices from localStorage
 * @returns {Array} Array of all saved invoices
 */
function getAllInvoices() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
}

/**
 * Save an invoice to localStorage
 * @param {Object} invoiceData - The invoice data to save
 * @returns {boolean} True if successful, false otherwise
 */
function saveInvoice(invoiceData) {
  try {
    const invoices = getAllInvoices();
    
    // Create a copy with timestamp
    const invoiceToSave = {
      ...invoiceData,
      savedAt: new Date().toISOString()
    };
    
    // Check if invoice with same number exists
    const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === invoiceData.invoiceNumber);
    
    if (existingIndex !== -1) {
      // Update existing invoice
      invoices[existingIndex] = invoiceToSave;
    } else {
      // Add new invoice
      invoices.push(invoiceToSave);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    return true;
  } catch (error) {
    console.error('Error saving invoice:', error);
    return false;
  }
}

/**
 * Get a specific invoice by invoice number
 * @param {string} invoiceNumber - The invoice number to retrieve
 * @returns {Object|null} The invoice data or null if not found
 */
function getInvoice(invoiceNumber) {
  try {
    const invoices = getAllInvoices();
    return invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null;
  } catch (error) {
    console.error('Error getting invoice:', error);
    return null;
  }
}

/**
 * Delete an invoice from localStorage
 * @param {string} invoiceNumber - The invoice number to delete
 * @returns {boolean} True if successful, false otherwise
 */
function deleteInvoice(invoiceNumber) {
  try {
    const invoices = getAllInvoices();
    const filtered = invoices.filter(inv => inv.invoiceNumber !== invoiceNumber);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
}

/**
 * Clear all invoices from localStorage
 * USE WITH CAUTION - This deletes all saved data
 * @returns {boolean} True if successful, false otherwise
 */
function clearAllInvoices() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing invoices:', error);
    return false;
  }
}

/**
 * Export all invoices as JSON file
 * Useful for backup purposes
 */
function exportInvoices() {
  try {
    const invoices = getAllInvoices();
    const dataStr = JSON.stringify(invoices, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swiftinvoice_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting invoices:', error);
    return false;
  }
}

/**
 * Import invoices from JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
function importInvoices(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedInvoices = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedInvoices)) {
          throw new Error('Invalid file format');
        }
        
        const existingInvoices = getAllInvoices();
        const mergedInvoices = [...existingInvoices];
        
        // Merge imported invoices, avoiding duplicates
        importedInvoices.forEach(imported => {
          const existingIndex = mergedInvoices.findIndex(
            inv => inv.invoiceNumber === imported.invoiceNumber
          );
          
          if (existingIndex === -1) {
            mergedInvoices.push(imported);
          }
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedInvoices));
        resolve(true);
      } catch (error) {
        console.error('Error importing invoices:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Get storage statistics
 * @returns {Object} Object with storage info
 */
function getStorageStats() {
  const invoices = getAllInvoices();
  const dataStr = JSON.stringify(invoices);
  const bytes = new Blob([dataStr]).size;
  const kilobytes = (bytes / 1024).toFixed(2);
  
  return {
    totalInvoices: invoices.length,
    storageSize: `${kilobytes} KB`,
    storageBytes: bytes
  };
}