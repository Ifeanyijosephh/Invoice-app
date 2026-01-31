# SwiftInvoice - Invoice Management System

## 📁 File Structure

```
invoice-app/
├── js/
│   ├── state.js          # State management
│   ├── calculations.js   # Financial calculations
│   ├── ui.js            # User interface logic
│   ├── storage.js       # Local storage operations
│   ├── pdf.js           # PDF generation
│   └── main.js          # Application entry point
├── src/
│   ├── index.html       # Main HTML file
│   ├── input.css        # Tailwind input CSS
│   └── output.css       # Compiled Tailwind CSS
└── package.json         # Node dependencies
```

## 🎯 How It Works

### 1. **state.js - The Brain**
This is your single source of truth. All invoice data lives here:
- Business and client information
- Invoice items array
- Tax rate and discount
- Invoice metadata (number, dates)

**Key Functions:**
- `getState()` - Get the entire state
- `addItem()` - Add a new line item
- `updateItem()` - Modify an existing item
- `removeItem()` - Delete an item
- `updateBusiness()` / `updateClient()` - Update contact info
- `resetState()` - Clear everything for a new invoice

### 2. **calculations.js - The Calculator**
Handles all the math:
- Item totals (qty × price)
- Subtotal (sum of all items)
- Tax calculation
- Discount application
- Final total

**Key Functions:**
- `calculateItemTotal(qty, price)` - Calculate single item
- `calculateSubtotal(items)` - Sum all items
- `calculateTotal(subtotal, tax, discount)` - Final calculation
- `recalculateAll(state)` - Recalculate everything
- `formatCurrency(amount)` - Format numbers as currency

### 3. **ui.js - The Interface**
Manages everything the user sees and interacts with:
- Renders items to the table
- Updates the preview pane in real-time
- Handles all user input events
- Shows the history modal

**Key Functions:**
- `initializeEventListeners()` - Set up all button clicks and inputs
- `renderItems()` - Display items in the table
- `updatePreview()` - Update the right-side preview
- `updateSummaryDisplay()` - Show subtotal/total
- `showHistoryModal()` - Display saved invoices

### 4. **storage.js - The Memory**
Saves everything to browser's localStorage:
- Save invoices
- Load invoices
- Get invoice history
- Delete invoices

**Key Functions:**
- `saveInvoice(data)` - Save to localStorage
- `getAllInvoices()` - Get all saved invoices
- `getInvoice(invoiceNumber)` - Load specific invoice
- `deleteInvoice(invoiceNumber)` - Remove an invoice

### 5. **pdf.js - The Printer**
Generates professional PDF invoices using jsPDF library.

**Key Function:**
- `generatePDF(invoiceData)` - Create and download PDF

### 6. **main.js - The Coordinator**
Brings everything together:
- Initializes the app on page load
- Sets up keyboard shortcuts
- Handles page navigation warnings

## 🚀 How to Run

### Option 1: Simple (No Build Process)
1. Make sure your `output.css` is generated from Tailwind
2. Open `src/index.html` in your browser
3. That's it! The app should work

### Option 2: With Live Server (Recommended)
1. Install Live Server extension in VS Code
2. Right-click `src/index.html`
3. Select "Open with Live Server"

### Option 3: With a Simple HTTP Server
```bash
# If you have Python installed
cd invoice-app
python -m http.server 8000

# Then open http://localhost:8000/src/index.html
```

## 🔄 Data Flow

Here's how everything connects:

```
User Input (ui.js)
    ↓
State Updated (state.js)
    ↓
Calculations Run (calculations.js)
    ↓
UI Updates (ui.js)
    ↓
Preview Updates (ui.js)
```

### Example: Adding an Item

1. User clicks "+ Add Item" button
2. `handleAddItem()` in ui.js is called
3. `addItem()` in state.js creates new item
4. `renderItems()` displays it in the table
5. `recalculateAll()` updates totals
6. `updateSummaryDisplay()` shows new amounts
7. `updatePreview()` updates right panel

## ✨ Features

### ✅ Current Features
- ✅ Add/remove invoice items
- ✅ Real-time calculations
- ✅ Live preview pane
- ✅ Save invoices to localStorage
- ✅ Load saved invoices
- ✅ Invoice history
- ✅ PDF generation
- ✅ Tax and discount support
- ✅ Keyboard shortcuts
- ✅ Mobile responsive

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save invoice
- `Ctrl/Cmd + P` - Download PDF
- `Ctrl/Cmd + H` - Show history
- `Ctrl/Cmd + N` - New invoice

## 🎨 Customization

### Change Currency Symbol
In `calculations.js`, find the `formatCurrency()` function:
```javascript
function formatCurrency(amount, currency = '₦') {
  // Change '₦' to your preferred symbol: '$', '€', '£', etc.
}
```

### Change Colors
The app uses Tailwind's emerald color (`bg-emerald-500`). To change:
1. In HTML, find all `emerald` classes
2. Replace with your preferred Tailwind color: `blue`, `purple`, `red`, etc.

### Add More Fields
To add a new field (e.g., "Tax ID"):
1. Add to state in `state.js`:
   ```javascript
   business: {
     name: '',
     phone: '',
     address: '',
     taxId: ''  // Add this
   }
   ```
2. Add input in HTML
3. Add event listener in `ui.js`
4. Update preview in `updatePreview()`

## 🐛 Troubleshooting

### Issue: PDF doesn't generate
**Solution:** Make sure jsPDF is loaded. Check browser console for errors.

### Issue: Data not saving
**Solution:** Check if localStorage is enabled in your browser.

### Issue: Preview not updating
**Solution:** Check browser console for JavaScript errors. Make sure all JS files are loaded in correct order.

### Issue: Styles not working
**Solution:** Make sure `output.css` is generated from Tailwind. Run:
```bash
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

## 📝 Code Comments

Every file is heavily commented to help you understand:
- What each function does
- What parameters it expects
- What it returns
- Why certain decisions were made

## 🔮 Future Enhancements

Ideas for expanding the app:
1. **Cloud Storage** - Save to backend server
2. **Multiple Currencies** - Support different currencies
3. **Email Integration** - Send invoices via email
4. **Payment Tracking** - Mark invoices as paid/unpaid
5. **Recurring Invoices** - Automatic invoice generation
6. **Multi-user Support** - User accounts and authentication
7. **Invoice Templates** - Different designs
8. **Export to Excel** - Additional export format
9. **Client Management** - Save client database
10. **Analytics** - Revenue reports and charts

## 🎓 Learning Resources

If you want to understand more:
- **State Management**: Read about "Single Source of Truth" pattern
- **Event Listeners**: MDN Web Docs on DOM Events
- **LocalStorage**: MDN Web Docs on Web Storage API
- **PDF Generation**: jsPDF documentation
- **Modular JavaScript**: ES6 modules (for future upgrade)

## 📞 Support

Created by: Ifeanyi Joseph
Phone: 08072500911, 07043936131

---

**Happy Invoicing! 🎉**