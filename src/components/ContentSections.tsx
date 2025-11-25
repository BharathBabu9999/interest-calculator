export function IntroSection() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Calculate Interest for Private Financing</h2>
      <p className="text-gray-700 mb-4">
        Track loans and repayments with precision using our advanced interest calculator. Whether you're managing 
        personal loans, lending to friends and family, or tracking business financing, this tool helps you calculate 
        exact interest amounts with anniversary-based annual compounding.
      </p>
      <p className="text-gray-700 mb-4">
        Unlike simple interest calculators, our system accounts for:
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
        <li><strong>Anniversary-based compounding:</strong> Interest compounds exactly one year from the transaction date</li>
        <li><strong>Variable interest rates:</strong> Each transaction can have its own rate</li>
        <li><strong>Precise day counting:</strong> Accurate calculations down to the exact day</li>
        <li><strong>Multiple currencies:</strong> Support for INR, USD, EUR, GBP, and more</li>
        <li><strong>Detailed breakdowns:</strong> See exactly how interest accumulates over time</li>
      </ul>
      <p className="text-gray-700">
        Perfect for private lenders, financial planners, accountants, and anyone managing personal financing arrangements.
      </p>
    </div>
  );
}

export function HowToUseSection() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4">How to Use This Calculator</h2>
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
    </div>
  );
}

export function FAQSection() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
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
    </div>
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
            <h3 className="font-semibold text-lg mb-3">Legal</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                <a href="#privacy" className="hover:text-blue-400 transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-blue-400 transition">Terms of Service</a>
              </li>
              <li className="text-gray-400 text-xs mt-4">
                This calculator is for informational purposes only. Consult a financial advisor for 
                professional advice.
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
