export function IntroSection() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Professional Interest Calculator for Private Lending and Personal Loans</h2>
      
      <p className="text-gray-700 mb-4">
        Managing private loans requires accurate interest calculations to maintain transparency and trust between 
        lenders and borrowers. Our comprehensive interest calculator is specifically designed for private financing 
        arrangements, personal loans, family lending situations, and business-to-business lending where precise 
        tracking of principal and interest is essential for both parties.
      </p>
      
      <p className="text-gray-700 mb-4">
        Unlike basic interest calculators that only provide simple calculations, our advanced tool incorporates 
        anniversary-based compounding methodology. This means interest compounds exactly one year from each transaction 
        date, rather than at arbitrary calendar year-ends. This approach provides more accurate and fair calculations 
        for both lenders and borrowers in private financing arrangements, ensuring that the true cost of borrowing 
        is properly reflected over time.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Understanding Compound Interest in Private Lending</h3>
      
      <p className="text-gray-700 mb-4">
        When you lend money to someone privately, whether it's a friend, family member, or business associate, 
        calculating the interest owed can become surprisingly complex, especially when the loan extends over multiple 
        years. Simple interest calculations—where you just multiply the principal by the rate and time—don't account 
        for the compounding effect that occurs in real-world lending scenarios.
      </p>

      <p className="text-gray-700 mb-4">
        Compound interest is the concept where interest earned or charged in one period is added to the principal, 
        and subsequent interest is calculated on this new, larger amount. For example, if you lend $10,000 at 2% 
        monthly interest with annual compounding, after one year you would have earned $2,400 in interest (2% × 12 months). 
        This interest is then added to your principal, making it $12,400. In the second year, the 2% monthly interest 
        is calculated on $12,400, not the original $10,000, resulting in $2,976 in interest for year two.
      </p>

      <h3 className="text-xl font-semibold mb-3 mt-6">Why Anniversary-Based Compounding Matters</h3>
      
      <p className="text-gray-700 mb-4">
        Traditional financial calculators often compound interest at calendar year-end (December 31st), which works 
        well for institutional lending but can create unfair or inaccurate calculations for private loans. If you 
        lent money on June 15th, why should the compounding happen on December 31st, just six and a half months later, 
        and then a full twelve months after that?
      </p>

      <p className="text-gray-700 mb-4">
        Our calculator uses anniversary-based compounding, which means each loan compounds on its own schedule. A loan 
        made on March 19, 2023 will compound on March 19, 2024, then March 19, 2025, and so on. This ensures that 
        each compounding period represents a true full year from the transaction date, providing fair and consistent 
        calculations regardless of when during the year the loan was made.
      </p>
      
      <h3 className="text-xl font-semibold mb-3 mt-6">Key Features for Professional Loan Management</h3>
      
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
        <li><strong>Anniversary-Based Compounding:</strong> Interest compounds precisely one year from each transaction 
        date, ensuring accurate long-term calculations that reflect the true cost of borrowing over multiple years.</li>
        
        <li><strong>Variable Interest Rates:</strong> Each transaction can have its own interest rate, perfect for 
        scenarios where lending terms change over time, or when you're managing multiple loans with different agreed-upon rates.</li>
        
        <li><strong>Precise Day-by-Day Calculations:</strong> Our algorithm calculates interest down to the exact day, 
        accounting for years, months, and remaining days separately. This three-part calculation ensures maximum accuracy 
        and fairness for both lender and borrower.</li>
        
        <li><strong>Multi-Currency Support:</strong> Track loans in Indian Rupees (INR), US Dollars (USD), Euros (EUR), 
        British Pounds (GBP), Japanese Yen (JPY), Australian Dollars (AUD), or Canadian Dollars (CAD) with proper 
        currency symbols and formatting throughout the interface.</li>
        
        <li><strong>Detailed Breakdown Reports:</strong> See exactly how interest accumulates over time with expandable 
        views showing step-by-step compounding at each anniversary. Understand precisely how your loan balance grows 
        and what portion is principal versus interest.</li>
        
        <li><strong>Import and Export Capabilities:</strong> Bulk import transactions from CSV spreadsheet files or 
        export your data to professional PDF reports and spreadsheet-compatible formats for record-keeping and tax purposes.</li>
      </ul>
      
      <h3 className="text-xl font-semibold mb-3 mt-6">Who Benefits from This Calculator?</h3>
      
      <p className="text-gray-700 mb-3">
        This interest calculator is designed for anyone involved in private lending arrangements:
      </p>
      
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        <li><strong>Private lenders</strong> managing multiple loans to friends, family members, or business associates</li>
        <li><strong>Financial planners</strong> helping clients track and manage personal lending arrangements</li>
        <li><strong>Accountants and bookkeepers</strong> maintaining accurate records for clients with private financing</li>
        <li><strong>Small business owners</strong> tracking business-to-business lending and informal credit arrangements</li>
        <li><strong>Individuals</strong> who have lent money and need to calculate fair repayment amounts with proper interest</li>
        <li><strong>Estate executors</strong> managing outstanding family loans and calculating final settlement amounts</li>
        <li><strong>Real estate investors</strong> who provide seller financing or private mortgages</li>
        <li><strong>Peer-to-peer lenders</strong> tracking returns on multiple loans across different borrowers</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 mt-6">How Interest Is Calculated: A Three-Part System</h3>
      
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
