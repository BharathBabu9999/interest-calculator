import Accordion from './Accordion';

export function IntroSection() {
  return (
    <Accordion 
      title="How Interest Is Calculated: A Three-Part System"
      defaultOpen={true}
    >
      <p className="text-gray-700 mb-4">
        Our calculator uses a sophisticated three-part calculation method to ensure accuracy and fairness:
      </p>
      
      <p className="text-gray-700 mb-3">
        <strong>1. Years Interest (Compounding Component):</strong> On each anniversary of the transaction date, the 
        accumulated interest for that complete year is calculated and added to the principal. For example, if you lent 
        $5,000 at 1.5% monthly on January 15, 2023, on January 15, 2024 (the first anniversary), exactly 12 months of 
        interest would be calculated: $5,000 × 1.5% × 12 = $900. This $900 is added to the principal, making the new 
        principal $5,900. The next year's interest compounds on this higher amount.
      </p>
      
      <p className="text-gray-700 mb-3">
        <strong>2. Months Interest (Simple Interest Component):</strong> After the last anniversary date but before 
        the current date, any complete months are calculated using simple interest on the compounded principal. If we're 
        calculating as of May 15, 2024 (4 months after the January 15 anniversary), the calculator determines there are 
        4 complete months and calculates: $5,900 × 1.5% × 4 = $354 in additional interest for those months.
      </p>
      
      <p className="text-gray-700 mb-4">
        <strong>3. Days Interest (Precise Daily Component):</strong> For the remaining days in the current month, the 
        calculator uses precise daily interest rates. If we're calculating as of May 23, 2024, there are 8 days into May 
        (after May 15). The daily rate is calculated based on the actual number of days in May (31 days), so the daily 
        rate would be 1.5% ÷ 31. This ensures fairness whether the month has 28, 30, or 31 days.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Real-World Example: Understanding Your Loan Balance</h3>
      
      <p className="text-gray-700 mb-4">
        Let's walk through a practical example. Suppose you lent a friend $10,000 on June 10, 2022, at 2% monthly interest. 
        You want to know how much they owe as of November 29, 2025 (today). Here's how our calculator determines the amount:
      </p>
      
      <p className="text-gray-700 mb-2">
        <strong>Anniversary 1 - June 10, 2023:</strong> After one full year, 12 months of interest: $10,000 × 2% × 12 = $2,400. 
        New principal: $12,400
      </p>
      
      <p className="text-gray-700 mb-2">
        <strong>Anniversary 2 - June 10, 2024:</strong> Second year interest: $12,400 × 2% × 12 = $2,976. 
        New principal: $15,376
      </p>
      
      <p className="text-gray-700 mb-2">
        <strong>Anniversary 3 - June 10, 2025:</strong> Third year interest: $15,376 × 2% × 12 = $3,690.24. 
        New principal: $19,066.24
      </p>
      
      <p className="text-gray-700 mb-4">
        <strong>Remaining period (June 10 to Nov 29, 2025):</strong> That's 5 complete months plus 19 days. 
        Months interest: $19,066.24 × 2% × 5 = $1,906.62. 
        Days interest (19 days in November): approximately $245.82. 
        <strong>Total owed: $21,218.68</strong>
      </p>

      <p className="text-gray-700">
        This level of precision ensures both lender and borrower understand exactly how the debt has grown, with 
        complete transparency in the calculation methodology. Every step is visible in the calculator's detailed breakdown.
      </p>
    </Accordion>
  );
}

export function HowToUseSection() {
  return (
    <Accordion title="How to Use This Calculator">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">1. Add Transactions</h3>
          <p className="text-gray-700 mb-3">
            Click "Add Transaction" and enter the date, amount, and interest rate. Choose between "Loan" 
            (money lent) or "Repayment" (money received back).
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">2. View Calculations</h3>
          <p className="text-gray-700 mb-3">
            Each transaction automatically calculates its current value with interest. Click "Details" on any 
            transaction to see the complete breakdown of how interest compounds over time.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">3. Export Reports</h3>
          <p className="text-gray-700 mb-3">
            Download your data as CSV for spreadsheet analysis or PDF for professional reports. Perfect for 
            sharing with clients or maintaining records.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">4. Bulk Operations</h3>
          <p className="text-gray-700 mb-3">
            Import multiple transactions via CSV or update all interest rates at once with the "Update All Rates" 
            button when market rates change.
          </p>
        </div>
      </div>
    </Accordion>
  );
}

export function FAQSection() {
  return (
    <Accordion title="Frequently Asked Questions">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">How does anniversary-based compounding work?</h3>
          <p className="text-gray-700">
            Unlike calendar year-end compounding, our calculator compounds interest exactly one year from each 
            transaction date. For example, a loan on March 15, 2023 will compound on March 15, 2024, then 
            March 15, 2025, and so on. This provides more accurate calculations for private financing.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">What does the interest rate represent?</h3>
          <p className="text-gray-700">
            The interest rate is entered as a monthly percentage. For example, 2% means 2% per month, which 
            equals 24% per year (simple interest) or approximately 26.8% annually with compounding.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Can I track multiple clients?</h3>
          <p className="text-gray-700">
            Currently, the calculator works with one client at a time. You can export the data for one client, 
            clear all transactions, and start tracking a new client. We recommend keeping separate CSV files 
            for different clients.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Is my data saved?</h3>
          <p className="text-gray-700">
            All data is stored locally in your browser. It's not sent to any server, ensuring complete privacy. 
            However, this means if you clear your browser data or use a different device, your transactions won't 
            be available. Always export important data as backup.
          </p>
        </div>
      </div>
    </Accordion>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 px-6 rounded-lg mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">About This Tool</h3>
            <p className="text-gray-300 text-sm">
              Professional interest calculator for private financing, loans, and repayments. Built with precision 
              algorithms for accurate financial tracking.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Features</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Anniversary-based compounding</li>
              <li>• Multi-currency support</li>
              <li>• CSV/PDF export</li>
              <li>• Detailed breakdowns</li>
              <li>• Bulk operations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Legal & Information</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                <a href="#privacy" className="hover:text-blue-400 transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-blue-400 transition">Terms of Service</a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-400 transition">About This Calculator</a>
              </li>
              <li className="text-gray-400 text-xs mt-4">
                This calculator is for informational purposes only. Consult a financial advisor for 
                professional advice. All calculations are provided as-is without warranty.
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>© 2025 Interest Calculator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
