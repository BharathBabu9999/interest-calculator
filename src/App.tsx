import { useState } from "react";
import type { Transaction, Client } from "./types";
import { formatDateForInput } from "./utils/dateUtils";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import Summary from "./components/Summary";
import AdBanner from "./components/AdBanner";
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
    type: "loan",
    notes: "Initial loan",
  },
  {
    id: "2",
    date: new Date(2020, 0, 21), // Jan 21, 2020
    amount: 100,
    interestRate: 2,
    type: "loan",
    notes: "Additional loan",
  },
  {
    id: "3",
    date: new Date(2020, 8, 16), // Sep 16, 2020
    amount: 1000,
    interestRate: 2,
    type: "loan",
    notes: "Third loan",
  },
  {
    id: "4",
    date: new Date(2020, 4, 1), // May 1, 2020
    amount: 100,
    interestRate: 2,
    type: "repayment",
    notes: "First payment",
  },
  {
    id: "5",
    date: new Date(2021, 0, 21), // Jan 21, 2021
    amount: 900,
    interestRate: 2,
    type: "repayment",
    notes: "Second payment",
  },
  {
    id: "6",
    date: new Date(2022, 8, 16), // Sep 16, 2022
    amount: 1000,
    interestRate: 2,
    type: "repayment",
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
    useState<Transaction[]>(sampleTransactions);
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
            Private financing loan and repayment tracker
          </p>
        </div>

        {/* Introduction Section */}
        <IntroSection />

        {/* Top Banner Ad */}
        {/* <AdBanner slot="1234567890" className="mb-6" /> */}

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

        {/* Middle Ad */}
        {/* <AdBanner slot="0987654321" className="mb-6" format="horizontal" /> */}

        {/* Transaction Form */}
        <TransactionForm onAddTransaction={handleAddTransaction} />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-3">
            {/* Sort and Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() =>
                  setSortOrder(
                    sortOrder === "chronological" ? "entry" : "chronological"
                  )
                }
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition whitespace-nowrap"
              >
                Sort:{" "}
                {sortOrder === "chronological"
                  ? "Chronological"
                  : "Entry Order"}
              </button>
              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition whitespace-nowrap"
              >
                Update All Rates
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition whitespace-nowrap"
              >
                Clear All
              </button>
              <button
                onClick={handleLoadExample}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition whitespace-nowrap"
              >
                Load Example
              </button>
            </div>

            {/* Import/Export Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <label className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer text-center whitespace-nowrap">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleExportPDF}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition whitespace-nowrap"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition whitespace-nowrap"
              >
                Export CSV
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

        {/* Bottom Ad */}
        {/* <AdBanner slot="1122334455" className="mb-6" format="rectangle" /> */}
        
        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
