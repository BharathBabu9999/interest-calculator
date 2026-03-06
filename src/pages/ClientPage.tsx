import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Transaction, Client } from "../types";
import { formatDateForInput } from "../utils/dateUtils";
import DateInput from "../components/DateInput";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import Summary from "../components/Summary";
import ClientFiles from "../components/ClientFiles";
import PrivacyPolicy from "../components/PrivacyPolicy";
import {
  HowToUseSection,
  IntroSection,
  FAQSection,
  Footer,
} from "../components/ContentSections";
import { exportToPDF, exportToCSV, importFromCSV } from "../utils/export";
import { clientsApi } from "../api/clients";
import { transactionsApi, type TransactionRead } from "../api/transactions";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

// ── helpers ──────────────────────────────────────────────────────────────────

function apiToLocal(tx: TransactionRead): Transaction {
  return {
    id: tx.id,
    // Parse as local midnight so timezone doesn't shift the date
    date: new Date(`${tx.date}T00:00:00`),
    amount: tx.amount,
    interestRate: tx.interest_rate,
    type: tx.type,
    notes: tx.notes ?? "",
    completed: tx.completed ?? false,
    expectedRepaymentDate: tx.expected_repayment_date
      ? new Date(`${tx.expected_repayment_date}T00:00:00`)
      : null,
  };
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ClientPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<"chronological" | "entry">("chronological");
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; details?: { label: string; value: string }[] } | null>(null);

  // Notes editing
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [newBulkRate, setNewBulkRate] = useState("");

  // ── fetch client + transactions ──────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!clientId) return;
    setLoadingClient(true);
    setLoadError(null);
    try {
      const [clientData, txData] = await Promise.all([
        clientsApi.get(clientId),
        transactionsApi.list(clientId),
      ]);
      setClient({ id: clientData.id, name: clientData.name, currency: clientData.currency, clientType: clientData.client_type, notes: clientData.notes, phone: clientData.phone, email: clientData.email, address: clientData.address, company: clientData.company });
      setNotesDraft(clientData.notes ?? "");
      setTransactions(txData.map(apiToLocal));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoadingClient(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── notes handler ────────────────────────────────────────────────────────

  const handleSaveNotes = async () => {
    if (!clientId) return;
    setNotesSaving(true);
    try {
      const updated = await clientsApi.update(clientId, { notes: notesDraft.trim() });
      setClient((prev) => prev ? { ...prev, notes: updated.notes } : prev);
      setNotesEditing(false);
    } catch (e) {
      alert(`Failed to save notes: ${e instanceof Error ? e.message : e}`);
    } finally {
      setNotesSaving(false);
    }
  };

  // ── mutation handlers ────────────────────────────────────────────────────

  const handleAddTransaction = async (transaction: Transaction) => {
    if (!clientId) return;
    try {
      const created = await transactionsApi.create(clientId, {
        date: formatDateForInput(transaction.date),
        amount: transaction.amount,
        interest_rate: transaction.interestRate,
        type: transaction.type,
        notes: transaction.notes || undefined,
        expected_repayment_date: transaction.expectedRepaymentDate
          ? formatDateForInput(transaction.expectedRepaymentDate)
          : undefined,
      });
      const local = apiToLocal(created);
      setTransactions((prev) => [...prev, local]);
      setToast({
        message: "Transaction added",
        type: "success",
        details: [
          { label: "Type",   value: local.type === "lend" ? "Lend" : "Borrow" },
          { label: "Amount", value: new Intl.NumberFormat("en-IN", { style: "currency", currency: client?.currency ?? "INR", maximumFractionDigits: 0 }).format(local.amount) },
          { label: "Date",   value: local.date.toLocaleDateString("en-IN") },
          { label: "Rate",   value: `${local.interestRate}% / month` },
          ...(local.notes ? [{ label: "Notes", value: local.notes }] : []),
        ],
      });
    } catch (err) {
      alert(`Failed to add transaction: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    try {
      const result = await transactionsApi.update(updated.id, {
        date: formatDateForInput(updated.date),
        amount: updated.amount,
        interest_rate: updated.interestRate,
        type: updated.type,
        notes: updated.notes || undefined,
        completed: updated.completed,
        expected_repayment_date: updated.expectedRepaymentDate
          ? formatDateForInput(updated.expectedRepaymentDate)
          : null,
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === result.id ? apiToLocal(result) : t))
      );
    } catch (err) {
      alert(`Failed to update: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleToggleCompleted = async (id: string, completed: boolean) => {
    try {
      const result = await transactionsApi.update(id, { completed });
      setTransactions((prev) =>
        prev.map((t) => (t.id === result.id ? apiToLocal(result) : t))
      );
    } catch (err) {
      alert(`Failed to update: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(`Delete all ${transactions.length} transactions? This cannot be undone.`)) return;
    try {
      await Promise.all(transactions.map((t) => transactionsApi.delete(t.id)));
      setTransactions([]);
    } catch (err) {
      alert(`Failed to clear: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleExportPDF = () => {
    if (client) exportToPDF(client, transactions, asOfDate);
  };

  const handleExportCSV = () => {
    if (client) exportToCSV(client, transactions, asOfDate);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !clientId) return;

    importFromCSV(
      file,
      async (importedTransactions) => {
        event.target.value = "";
        try {
          const created = await Promise.all(
            importedTransactions.map((tx) =>
              transactionsApi.create(clientId, {
                date: formatDateForInput(tx.date),
                amount: tx.amount,
                interest_rate: tx.interestRate,
                type: tx.type,
                notes: tx.notes || undefined,
              })
            )
          );
          setTransactions((prev) => [...prev, ...created.map(apiToLocal)]);
          alert(`Successfully imported ${created.length} transactions!`);
        } catch (err) {
          alert(`Import failed: ${err instanceof Error ? err.message : err}`);
        }
      },
      (error) => {
        alert(`Import failed: ${error}`);
        event.target.value = "";
      }
    );
  };

  const handleBulkUpdateRate = async () => {
    const rate = parseFloat(newBulkRate);
    if (isNaN(rate) || rate < 0) {
      alert("Please enter a valid interest rate (0 or greater)");
      return;
    }
    try {
      const updated = await Promise.all(
        transactions.map((t) =>
          transactionsApi.update(t.id, { interest_rate: rate })
        )
      );
      setTransactions(updated.map(apiToLocal));
      setShowBulkUpdateModal(false);
      setNewBulkRate("");
      alert(`Updated interest rate to ${rate}% for all ${transactions.length} transactions`);
    } catch (err) {
      alert(`Bulk update failed: ${err instanceof Error ? err.message : err}`);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{loadError}</p>
          <button onClick={() => navigate("/")} className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar
        breadcrumb={
          client ? (
            <>
              <span className="font-semibold text-gray-900 dark:text-white truncate max-w-40">{client.name}</span>
              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-full px-2 py-0.5 shrink-0">
                {client.currency}
              </span>
              <span className="text-xs rounded-full px-2 py-0.5 font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 shrink-0">
                {client.clientType === "financial_institution" ? "Financial Institution" : "Individual"}
              </span>
            </>
          ) : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {client?.name ?? "Client"}
          </h1>
        </div>

        {/* As of Date */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">As of Date</label>
            <DateInput
              value={asOfDate}
              onChange={(d) => setAsOfDate(d)}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Summary */}
        {client && (
          <Summary transactions={transactions} asOfDate={asOfDate} currency={client.currency} />
        )}

        {/* Transaction Form */}
        <TransactionForm onAddTransaction={handleAddTransaction} />

        {/* Controls bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "chronological" ? "entry" : "chronological")
                }
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
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button onClick={handleExportPDF} className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm transition-all">
                  PDF
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button onClick={handleExportCSV} className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-600 hover:shadow-sm transition-all">
                  CSV
                </button>
              </div>
              <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {client && (
          <TransactionTable
            transactions={transactions}
            asOfDate={asOfDate}
            sortOrder={sortOrder}
            currency={client.currency}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onToggleCompleted={handleToggleCompleted}
          />
        )}

        {/* Bulk Update Modal */}
        {showBulkUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Update All Interest Rates</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                This will change the interest rate for all {transactions.length} transactions.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  New Interest Rate (% per month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBulkRate}
                  onChange={(e) => setNewBulkRate(e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowBulkUpdateModal(false); setNewBulkRate(""); }}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition"
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

        {/* Static content sections */}
        {/* Contact Info */}
        {(client?.phone || client?.email || client?.address || client?.company || client?.clientType) && (
          <div className="mt-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact Info</h3>
            </div>
            <dl className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {client?.clientType && (
                <div>
                  <dt className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Type</dt>
                  <dd className="text-sm text-gray-800 dark:text-slate-200">
                    {client.clientType === "financial_institution" ? "Financial Institution" : "Individual"}
                  </dd>
                </div>
              )}
              {client?.company && (
                <div>
                  <dt className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Company</dt>
                  <dd className="text-sm text-gray-800 dark:text-slate-200">{client.company}</dd>
                </div>
              )}
              {client?.phone && (
                <div>
                  <dt className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Phone</dt>
                  <dd>
                    <a href={`tel:${client.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      {client.phone}
                    </a>
                  </dd>
                </div>
              )}
              {client?.email && (
                <div>
                  <dt className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Email</dt>
                  <dd>
                    <a href={`mailto:${client.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      {client.email}
                    </a>
                  </dd>
                </div>
              )}
              {client?.address && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Address</dt>
                  <dd className="text-sm text-gray-800 dark:text-slate-200 whitespace-pre-line">{client.address}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Notes */}
        <div className="mt-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notes</h3>
            </div>
            {!notesEditing && (
              <button
                onClick={() => { setNotesDraft(client?.notes ?? ""); setNotesEditing(true); setTimeout(() => notesRef.current?.focus(), 0); }}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {client?.notes ? "Edit" : "+ Add notes"}
              </button>
            )}
          </div>
          <div className="px-6 py-5">
            {notesEditing ? (
              <div className="space-y-3">
                <textarea
                  ref={notesRef}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setNotesEditing(false);
                    if (e.key === "Enter" && e.ctrlKey) handleSaveNotes();
                  }}
                  rows={4}
                  placeholder="Add notes about this client — contact info, relationship details, loan context…"
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={notesSaving}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {notesSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setNotesEditing(false)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <span className="text-xs text-gray-400 dark:text-slate-500 self-center ml-1">Ctrl+Enter to save · Esc to cancel</span>
                </div>
              </div>
            ) : client?.notes ? (
              <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{client.notes}</p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 italic">No notes yet. Click "+ Add notes" to add context about this client.</p>
            )}
          </div>
        </div>

        {clientId && import.meta.env.VITE_ENABLE_FILES !== "false" && (
          <ClientFiles clientId={clientId} />
        )}

        <HowToUseSection />
        <IntroSection />
        <FAQSection />
        <PrivacyPolicy />
        <Footer />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          details={toast.details}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
