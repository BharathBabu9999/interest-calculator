# Private Financing Interest Calculator

A comprehensive React-based interest calculator designed for managing private financing transactions with variable interest rates and annual compounding. Perfect for tracking multiple loans and repayments with detailed calculation breakdowns.

## 🌟 Features

### Core Functionality
- **Variable Interest Rates**: Each transaction can have its own interest rate (default 2% monthly)
- **Anniversary-Based Compounding**: Interest compounds annually on the transaction anniversary date (not calendar year-end)
- **Multiple Currencies**: Support for INR (default), USD, EUR, GBP, JPY, AUD, and CAD
- **Dual Transaction Types**: Track both loans (money given) and repayments (money received)
- **Current Value Calculation**: Each transaction calculates independently to present-day value

### Calculation Engine
- **Years Interest**: Compounds annually on each anniversary (exactly 12 months of interest)
- **Months Interest**: Simple interest for complete months after last anniversary
- **Days Interest**: Precise daily interest for remaining days in the current month
- **Detailed Breakdown**: Expandable view showing step-by-step compounding with principal before/after each anniversary

### User Interface
- **Client Management**: Track client name and ID with currency selection
- **Collapsible Form**: Clean accordion-style "Add Transaction" form to reduce clutter
- **Inline Editing**: Edit existing transactions directly in the table
- **DD/MM/YYYY Format**: Consistent date format throughout the application
- **No Spinner Arrows**: Clean number inputs without increment/decrement controls
- **Whole Number Summary**: Summary displays rounded values for easy reading

### Data Management
- **CSV Import**: Bulk import transactions from CSV files with flexible date parsing
- **CSV Export**: Export all transactions with DD/MM/YYYY formatted dates
- **PDF Export**: Generate professional PDF reports with transaction details and breakdowns
- **Expandable Details**: Click any transaction to see calculation breakdown and compounding steps

## 📊 How It Works

### Interest Calculation Method

The calculator uses a "current value" approach where each transaction calculates independently:

1. **Transaction Date to First Anniversary** (< 1 year):
   - Calculate months and days of simple interest
   - No compounding occurs

2. **After Each Anniversary** (≥ 1 year):
   - On each anniversary (exactly 1 year from transaction or previous anniversary)
   - Add exactly 12 months of interest to principal
   - Compound: New Principal = Old Principal + Interest

3. **Remaining Period After Last Anniversary**:
   - Complete months: Calculate simple interest on compounded principal
   - Remaining days: Calculate daily interest based on days in current month

**Example**: Transaction on 19/03/2019 at ₹450,000 with 1.5% monthly rate, calculated on 23/11/2025:

- **19/03/2020**: ₹450,000 + (₹450,000 × 1.5% × 12) = ₹531,000
- **19/03/2021**: ₹531,000 + (₹531,000 × 1.5% × 12) = ₹626,580
- **19/03/2022**: ₹626,580 + (₹626,580 × 1.5% × 12) = ₹739,461
- **19/03/2023**: ₹739,461 + (₹739,461 × 1.5% × 12) = ₹872,804
- **19/03/2024**: ₹872,804 + (₹872,804 × 1.5% × 12) = ₹1,030,109
- **19/03/2025**: ₹1,030,109 + (₹1,030,109 × 1.5% × 12) = ₹1,215,528
- **+ 8 months**: ₹1,215,528 × 1.5% × 8 = ₹145,863 (months interest)
- **+ 4 days**: (₹1,215,528 + ₹145,863) × (1.5% / 30) × 4 = ₹2,722 (days interest)
- **Total**: ₹1,364,113

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4 for fast development and optimized production builds
- **Styling**: Tailwind CSS v4 with PostCSS
- **Form Management**: react-hook-form 7.66.1 with Zod 4.1.12 validation
- **Date Handling**: date-fns 4.1.0 for reliable date calculations
- **PDF Generation**: jsPDF 3.0.4 with jspdf-autotable 5.0.2
- **CSV Processing**: PapaParse 5.5.3 for import/export

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd interest-calc
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**:
Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
interest-calc/
├── src/
│   ├── components/
│   │   ├── TransactionForm.tsx    # Collapsible form for adding transactions
│   │   ├── TransactionTable.tsx   # Table with expandable rows and inline editing
│   │   └── Summary.tsx            # Summary dashboard with totals
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces and types
│   ├── utils/
│   │   ├── calculator.ts          # Core interest calculation engine
│   │   ├── currency.ts            # Currency formatting and symbols
│   │   ├── dateUtils.ts           # Date parsing, formatting, and anniversary calculation
│   │   └── export.ts              # PDF and CSV export/import functions
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles and Tailwind imports
├── public/                        # Static assets
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
├── postcss.config.js              # PostCSS/Tailwind configuration
└── README.md                      # This file
```

## 💡 Usage Guide

### Adding Transactions

1. Click "Add Transaction" to expand the form
2. Enter date in DD/MM/YYYY format (e.g., 19/03/2019)
3. Enter amount, interest rate (% per month), and select type (Loan/Repayment)
4. Optionally add notes for reference
5. Click "Add Transaction" to save

### Viewing Calculation Details

- Click on any transaction row to expand
- View duration breakdown (years, months, days)
- See years interest (compounding), months interest, and days interest
- Review "Annual Compounding Steps" table showing each anniversary calculation

### Editing Transactions

- Click "Edit" next to any transaction
- Modify values inline
- Click "Save" to confirm or "Cancel" to discard changes

### Importing Data

1. Click "Import from CSV"
2. Select a CSV file with columns: Date, Amount, Interest Rate, Type, Notes
3. Dates can be in DD/MM/YYYY or other common formats
4. All transactions will be imported and calculations updated

### Exporting Data

- **Export to CSV**: Download all transactions in spreadsheet format
- **Export to PDF**: Generate a professional report with full breakdown

## 🧮 Calculation Examples

### Example 1: Loan with Compounding
- **Transaction**: 10/04/2021, ₹100,000 loan @ 2% monthly
- **As of**: 23/11/2025 (4 years, 7 months, 13 days)
- **Anniversaries**: 10/04/2022, 10/04/2023, 10/04/2024, 10/04/2025
- **Years Interest**: ₹136,421 (from 4 anniversaries)
- **Months Interest**: ₹33,099 (7 months)
- **Days Interest**: ₹2,156 (13 days)
- **Current Value**: ₹271,676

### Example 2: Repayment
- **Transaction**: 15/06/2024, ₹50,000 repayment @ 1.8% monthly
- **As of**: 23/11/2025 (1 year, 5 months, 8 days)
- **Anniversaries**: 15/06/2025
- **Years Interest**: ₹10,800 (1 anniversary)
- **Months Interest**: ₹5,436 (5 months)
- **Days Interest**: ₹792 (8 days)
- **Current Value**: ₹67,028

## ⚙️ Configuration

### Default Settings

- Default currency: INR
- Default interest rate: 2% per month
- Default transaction type: Loan
- Date format: DD/MM/YYYY throughout

### Customization

Edit `src/utils/currency.ts` to add more currencies:

```typescript
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  // Add more currencies here
];
```

## 📝 CSV Import Format

Your CSV file should have these columns (header row required):

```
Date,Amount,Interest Rate,Type,Notes
19/03/2019,450000,1.5,loan,Initial funding
10/04/2021,100000,2,loan,
15/06/2024,50000,1.8,repayment,Partial payment
```

- **Date**: DD/MM/YYYY format (also accepts MM/DD/YYYY, YYYY-MM-DD)
- **Amount**: Numeric value
- **Interest Rate**: Monthly percentage (e.g., 2 for 2%)
- **Type**: "loan" or "repayment"
- **Notes**: Optional text

## 🐛 Troubleshooting

### Calculations seem incorrect
- Ensure dates are in DD/MM/YYYY format
- Check that interest rates are monthly percentages
- Verify transaction types (loan vs repayment)
- Review compounding steps in expandable details

### Import not working
- Verify CSV has proper headers
- Check date format consistency
- Ensure numeric fields contain valid numbers
- Look for special characters in notes field

### Display issues
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Check browser console for errors

## 📄 License

This project is available for private use. Modify and adapt as needed for your financing calculations.

## 🤝 Contributing

Feel free to fork, modify, and enhance the calculator for your specific needs. Key areas for potential enhancement:

- localStorage persistence for saving data
- Multiple client management
- Payment schedules and projections
- Custom compounding frequencies
- Email/SMS notifications for payment reminders
- Multi-language support

## 📧 Support

For questions or issues, please check the calculation breakdown feature to understand how values are computed. The detailed view shows each step of the calculation process.
