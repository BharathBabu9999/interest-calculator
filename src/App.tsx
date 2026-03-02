import { useState } from "react";
import type { Transaction, Client } from "./types";
import { formatDateForInput } from "./utils/dateUtils";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import Summary from "./components/Summary";
import PrivacyPolicy from "./components/PrivacyPolicy";
import {
  IntroSection,
  HowToUseSection,
  FAQSection,
  Footer,
} from "./components/ContentSections";
import { exportToPDF, exportToCSV, importFromCSV } from "./utils/export";

// Example/sample transactions
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date(2020, 0, 1), // Jan 1, 2020
    amount: 1000,
    interestRate: 2,
    type: "lend",
    notes: "Initial lend",
  },
  {
    id: "2",
    date: new Date(2020, 0, 21), // Jan 21, 2020
    amount: 100,
    interestRate: 2,
    type: "lend",
    notes: "Additional lend",
  },
  {
    id: "3",
    date: new Date(2020, 8, 16), // Sep 16, 2020
    amount: 1000,
    interestRate: 2,
    type: "lend",
    notes: "Third lend",
  },
  {
    id: "4",
    date: new Date(2020, 4, 1), // May 1, 2020
    amount: 100,
    interestRate: 2,
    type: "borrow",
    notes: "First payment",
  },
  {
    id: "5",
    date: new Date(2021, 0, 21), // Jan 21, 2021
    amount: 900,
    interestRate: 2,
    type: "borrow",
    notes: "Second payment",
  },
  {
    id: "6",
    date: new Date(2022, 8, 16), // Sep 16, 2022
    amount: 1000,
    interestRate: 2,
    type: "borrow",
    notes: "Third payment",
  },
];

function App() {
  const [client, setClient] = useState<Client>({
    name: "John Doe",
    id: "CLIENT-001",
    currency: "INR",
  });
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<"chronological" | "entry">(
    "chronological"
  );
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [newBulkRate, setNewBulkRate] = useState("");

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
  };

  const handleClearAll = () => {
    setTransactions([]);
  };

  const handleLoadExample = () => {
    setTransactions(sampleTransactions);
  };

  const handleExportPDF = () => {
    exportToPDF(client, transactions, asOfDate);
  };

  const handleExportCSV = () => {
    exportToCSV(client, transactions, asOfDate);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importFromCSV(
      file,
      (importedTransactions) => {
        setTransactions([...transactions, ...importedTransactions]);
        // Reset the input
        event.target.value = "";
        alert(
          `Successfully imported ${importedTransactions.length} transactions!`
        );
      },
      (error) => {
        alert(`Import failed: ${error}`);
        event.target.value = "";
      }
    );
  };

  const handleBulkUpdateRate = () => {
    const rate = parseFloat(newBulkRate);
    if (isNaN(rate) || rate < 0) {
      alert("Please enter a valid interest rate (0 or greater)");
      return;
    }

    const updatedTransactions = transactions.map((t) => ({
      ...t,
      interestRate: rate,
    }));

    setTransactions(updatedTransactions);
    setShowBulkUpdateModal(false);
    setNewBulkRate("");
    alert(
      `Updated interest rate to ${rate}% for all ${transactions.length} transactions`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interest Calculator
          </h1>
          <p className="text-gray-600">
            Private financing lend and borrow tracker
          </p>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={client.id}
                onChange={(e) => setClient({ ...client, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={client.currency}
                onChange={(e) =>
                  setClient({ ...client, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                As of Date
              </label>
              <input
                type="date"
                value={formatDateForInput(asOfDate)}
                onChange={(e) => setAsOfDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <Summary
          transactions={transactions}
          asOfDate={asOfDate}
          currency={client.currency}
        />

        {/* Transaction Form */}
        <TransactionForm onAddTransaction={handleAddTransaction} />

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            
            {/* View & Manage */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() =>
                  setSortOrder(
                    sortOrder === "chronological" ? "entry" : "chronological"
                  )
                }
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {sortOrder === "chronological" ? "Sort: Date" : "Sort: Entry"}
              </button>

              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Update Rates
              </button>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
               <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <label className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-white hover:shadow-sm cursor-pointer transition-all">
                    <span>Import</span>
                    <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                  </label>
                  <div className="w-px h-4 bg-slate-300 mx-1"></div>
                  <button onClick={handleExportPDF} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-white hover:shadow-sm transition-all">
                    PDF
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-1"></div>
                  <button onClick={handleExportCSV} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-white hover:shadow-sm transition-all">
                    CSV
                  </button>
               </div>

               <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

               <button
                  onClick={handleLoadExample}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-colors"
                >
                  Load Example
               </button>
               
               <button
                onClick={handleClearAll}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors"
               >
                Clear All
               </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <TransactionTable
          transactions={transactions}
          asOfDate={asOfDate}
          sortOrder={sortOrder}
          currency={client.currency}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}
        />

        {/* Bulk Update Modal */}
        {showBulkUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">
                Update All Interest Rates
              </h3>
              <p className="text-gray-600 mb-4">
                This will change the interest rate for all {transactions.length}{" "}
                transactions.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Interest Rate (% per month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBulkRate}
                  onChange={(e) => setNewBulkRate(e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowBulkUpdateModal(false);
                    setNewBulkRate("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdateRate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  Update All
                </button>
              </div>
            </div>
          </div>
        )}
        {/* How to Use Section */}
        <HowToUseSection />
        {/* Introduction Section */}
        <IntroSection />



        {/* FAQ Section */}
        <FAQSection />

        {/* Privacy Policy */}
        <PrivacyPolicy />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
