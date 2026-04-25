// NOTE FOR MAINTAINERS:
// This is the guest (unauthenticated) page. It mirrors ClientPage (src/pages/ClientPage.tsx)
// in layout and behaviour, with guest-specific extras (amber banner, editable client info,
// Load Example / Clear All, localStorage persistence). If you add or change a feature in
// ClientPage.tsx, apply the equivalent change here too so the two stay in sync.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Transaction, Client } from "../types";
import DateInput from "../components/DateInput";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import Summary from "../components/Summary";
import ThemeToggle from "../components/ThemeToggle";
import ToggleButton from "../components/ToggleButton";
import { exportToPDF, exportToCSV, importFromCSV } from "../utils/export";
import { HowToUseSection, IntroSection, FAQSection, Footer } from "../components/ContentSections";
import PrivacyPolicy from "../components/PrivacyPolicy";

const GUEST_CLIENT_KEY = "guest_client";
const GUEST_TX_KEY = "guest_transactions";

function loadGuestClient(): Client {
  try {
    const raw = localStorage.getItem(GUEST_CLIENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Client;
      return { ...parsed, clientType: parsed.clientType ?? "individual", isActive: parsed.isActive ?? true };
    }
  } catch {
    // ignore
  }
  return { name: "Guest Client", id: "GUEST-001", currency: "INR", clientType: "individual", isActive: true };
}

function loadGuestTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(GUEST_TX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<Transaction, "date"> & { date: string }>;
    return parsed.map((t) => ({ ...t, date: new Date(t.date) }));
  } catch {
    // ignore
  }
  return [];
}

const sampleTransactions: Transaction[] = [
  { id: "1", date: new Date(2020, 0, 1),  amount: 1000, interestRate: 2, type: "lend",   notes: "Initial lend",     completed: false },
  { id: "2", date: new Date(2020, 0, 21), amount: 100,  interestRate: 2, type: "lend",   notes: "Additional lend",  completed: false },
  { id: "3", date: new Date(2020, 8, 16), amount: 1000, interestRate: 2, type: "lend",   notes: "Third lend",       completed: false },
  { id: "4", date: new Date(2020, 4, 1),  amount: 100,  interestRate: 2, type: "borrow", notes: "First payment",    completed: false },
  { id: "5", date: new Date(2021, 0, 21), amount: 900,  interestRate: 2, type: "borrow", notes: "Second payment",   completed: false },
  { id: "6", date: new Date(2022, 8, 16), amount: 1000, interestRate: 2, type: "borrow", notes: "Third payment",    completed: false },
];

export default function GuestPage() {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client>(loadGuestClient);
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>(loadGuestTransactions);
  const [sortOrder, setSortOrder] = useState<"chronological" | "entry">("chronological");
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [newBulkRate, setNewBulkRate] = useState("");
  const [showDetailCalc, setShowDetailCalc] = useState(false);
  const [showDailyValue, setShowDailyValue] = useState(false);

  useEffect(() => { localStorage.setItem(GUEST_CLIENT_KEY, JSON.stringify(client)); }, [client]);
  useEffect(() => { localStorage.setItem(GUEST_TX_KEY, JSON.stringify(transactions)); }, [transactions]);

  const handleAddTransaction = (tx: Transaction) => setTransactions((prev) => [...prev, tx]);
  const handleDeleteTransaction = (id: string) => setTransactions((prev) => prev.filter((t) => t.id !== id));
  const handleUpdateTransaction = (updated: Transaction) =>
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const handleToggleCompleted = (id: string, completed: boolean) =>
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));

  const handleLoadExample = () => setTransactions(sampleTransactions);
  const handleClearAll = () => setTransactions([]);

  const handleExportPDF = () => exportToPDF(client, transactions, asOfDate);
  const handleExportCSV = () => exportToCSV(client, transactions, asOfDate);
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importFromCSV(
      file,
      (imported) => { setTransactions((prev) => [...prev, ...imported]); event.target.value = ""; alert(`Imported ${imported.length} transactions!`); },
      (err) => { alert(`Import failed: ${err}`); event.target.value = ""; }
    );
  };

  const handleBulkUpdateRate = () => {
    const rate = parseFloat(newBulkRate);
    if (isNaN(rate) || rate < 0) { alert("Please enter a valid rate (0 or greater)"); return; }
    setTransactions((prev) => prev.map((t) => ({ ...t, interestRate: rate })));
    setShowBulkUpdateModal(false);
    setNewBulkRate("");
    alert(`Updated rate to ${rate}% for all ${transactions.length} transactions`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Guest banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Guest mode</span> — data is saved in this browser only.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => navigate("/login")} className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline">
              Sign in
            </button>
            <button onClick={() => navigate("/register")} className="text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md transition-colors">
              Create account
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {client.name || "Guest Client"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-full px-2 py-0.5">{client.currency}</span>
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-full px-2 py-0.5">Guest</span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Client Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5 mb-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-3">Client Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Name</label>
              <input type="text" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Client ID</label>
              <input type="text" value={client.id} onChange={(e) => setClient({ ...client, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Currency</label>
              <select value={client.currency} onChange={(e) => setClient({ ...client, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* As of Date + Toggles */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">As of Date</label>
            <DateInput value={asOfDate} onChange={(d) => setAsOfDate(d)}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              active={showDetailCalc}
              onClick={() => setShowDetailCalc((v) => !v)}
              activeColor="violet"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            >
              {showDetailCalc ? "Hide Calculations" : "Show Detail Calculations"}
            </ToggleButton>
            <ToggleButton
              active={showDailyValue}
              onClick={() => setShowDailyValue((v) => !v)}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            >
              {showDailyValue ? "Hide Daily Value" : "Daily Value"}
            </ToggleButton>
          </div>
        </div>

        {/* Summary */}
        <Summary transactions={transactions} asOfDate={asOfDate} currency={client.currency} showDailyValue={showDailyValue} />

        {/* Transaction Form */}
        <TransactionForm onAddTransaction={handleAddTransaction} />

        {/* Controls bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => setSortOrder(sortOrder === "chronological" ? "entry" : "chronological")}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {sortOrder === "chronological" ? "Sort: Date" : "Sort: Entry"}
              </button>
              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Update Rates
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
                <label className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm cursor-pointer transition-all">
                  <span>Import</span>
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-1" />
                <button onClick={handleExportPDF} className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm transition-all">PDF</button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-1" />
                <button onClick={handleExportCSV} className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm transition-all">CSV</button>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-600 hidden sm:block" />
              <button
                onClick={handleLoadExample}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 rounded-lg transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-slate-600 border border-transparent hover:border-red-100 dark:hover:border-red-800 rounded-lg transition-colors"
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
          currency={client.currency}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onToggleCompleted={handleToggleCompleted}
          showDetailCalc={showDetailCalc}
        />

        {/* Content sections */}
        <HowToUseSection />
        <IntroSection />
        <FAQSection />
        <PrivacyPolicy />
        <Footer />

        {/* Bulk Update Modal */}
        {showBulkUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Update All Interest Rates</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                This will change the interest rate for all {transactions.length} transactions.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">New Interest Rate (% per month)</label>
                <input
                  type="number" step="0.01" value={newBulkRate} onChange={(e) => setNewBulkRate(e.target.value)}
                  placeholder="e.g., 2.5" autoFocus
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowBulkUpdateModal(false); setNewBulkRate(""); }}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition">
                  Cancel
                </button>
                <button onClick={handleBulkUpdateRate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
                  Update All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
