import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientsApi, type ClientRead } from "../api/clients";
import { transactionsApi, type TransactionRead } from "../api/transactions";
import { calculateTotalBalance } from "../utils/calculator";
import { formatCurrency } from "../utils/currency";
import DateInput from "../components/DateInput";
import { exportSummaryToPDF, exportSummaryToExcel, type SummaryExportRow } from "../utils/export";
import Navbar from "../components/Navbar";
import type { Transaction } from "../types";

// ── helpers ──────────────────────────────────────────────────────────────────

function apiToLocal(tx: TransactionRead): Transaction {
  return {
    id: tx.id,
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

interface ClientSummary {
  client: ClientRead;
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
  txCount: number;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const navigate = useNavigate();

  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [summaries, setSummaries] = useState<ClientSummary[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<"name" | "clientType" | "txCount" | "totalLent" | "totalBorrowed" | "netBalance">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientTypeFilter, setClientTypeFilter] = useState<"" | "individual" | "financial_institution">("");
  const [netBalanceOp, setNetBalanceOp] = useState<"" | ">" | "<">("");
  const [netBalanceVal, setNetBalanceVal] = useState("");

  const toggleExcluded = (id: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clients = await clientsApi.list();
      if (clients.length === 0) {
        setSummaries([]);
        return;
      }

      // Fetch all clients' transactions in parallel
      const txLists = await Promise.all(
        clients.map((c) => transactionsApi.list(c.id))
      );

      const result: ClientSummary[] = clients.map((client, i) => {
        const transactions = txLists[i].map(apiToLocal);
        const { totalLent, totalBorrowed, netBalance } =
          calculateTotalBalance(transactions, asOfDate);
        return {
          client,
          totalLent,
          totalBorrowed,
          netBalance,
          txCount: transactions.length,
        };
      });

      setSummaries(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── sorted rows ──────────────────────────────────────────────────────────────

  const sortedSummaries = [...summaries].sort((a, b) => {
    let cmp = 0;
    if (sortCol === "name") cmp = a.client.name.localeCompare(b.client.name);
    else if (sortCol === "clientType") cmp = a.client.client_type.localeCompare(b.client.client_type);
    else if (sortCol === "txCount") cmp = a.txCount - b.txCount;
    else if (sortCol === "totalLent") cmp = a.totalLent - b.totalLent;
    else if (sortCol === "totalBorrowed") cmp = a.totalBorrowed - b.totalBorrowed;
    else if (sortCol === "netBalance") cmp = a.netBalance - b.netBalance;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // ── filtered rows ─────────────────────────────────────────────────────────────

  const numVal = netBalanceVal !== "" ? parseFloat(netBalanceVal) : null;
  const filteredSummaries = sortedSummaries.filter(({ client, netBalance }) => {
    const typeOk = !clientTypeFilter || client.client_type === clientTypeFilter;
    const balOk = !netBalanceOp || numVal === null ||
      (netBalanceOp === ">" ? netBalance > numVal : netBalance < numVal);
    return typeOk && balOk;
  });

  // ── grand totals grouped by currency ────────────────────────────────────────

  const totalsMap = filteredSummaries.reduce<
    Record<string, { lent: number; borrowed: number; net: number }>
  >((acc, { client, totalLent, totalBorrowed, netBalance }) => {
    if (excluded.has(client.id)) return acc;
    const cur = client.currency;
    if (!acc[cur]) acc[cur] = { lent: 0, borrowed: 0, net: 0 };
    acc[cur].lent += totalLent;
    acc[cur].borrowed += totalBorrowed;
    acc[cur].net += netBalance;
    return acc;
  }, {});

  const grandTotals = Object.entries(totalsMap).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  // ── export helpers ──────────────────────────────────────────────────────────

  const buildExportRows = (): SummaryExportRow[] =>
    filteredSummaries.map(({ client, totalLent, totalBorrowed, netBalance, txCount }) => ({
      name: client.name,
      currency: client.currency,
      txCount,
      totalLent,
      totalBorrowed,
      netBalance,
      included: !excluded.has(client.id),
    }));

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar active="summary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title + date picker + export buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Portfolio Summary
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
              Net financial position across all clients
            </p>
            <button
              onClick={() => navigate("/", { state: { openAddClient: true } })}
              className="inline-flex items-center gap-1.5 mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </button>
          </div>
          <div className="flex items-end gap-3 shrink-0">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                As of Date
              </label>
              <DateInput
                value={asOfDate}
                onChange={(d) => setAsOfDate(d)}
                className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!loading && sortedSummaries.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => exportSummaryToPDF(buildExportRows(), asOfDate)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => exportSummaryToExcel(buildExportRows(), asOfDate)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  title="Download Excel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        {!loading && summaries.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value as "" | "individual" | "financial_institution")}
              className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="financial_institution">Financial Institution</option>
            </select>
            <div className="flex gap-0">
              <select
                value={netBalanceOp}
                onChange={(e) => setNetBalanceOp(e.target.value as "" | ">" | "<")}
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 border-r-0 text-gray-900 dark:text-white rounded-l-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10"
              >
                <option value="">Net Balance</option>
                <option value=">">Greater than</option>
                <option value="<">Less than</option>
              </select>
              <input
                type="number"
                min="0"
                value={netBalanceVal}
                onChange={(e) => setNetBalanceVal(e.target.value)}
                placeholder="Amount"
                disabled={netBalanceOp === ""}
                className="w-36 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-r-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-40"
              />
            </div>
          </div>
        )}

        {/* Grand total cards */}
        {!loading && grandTotals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {grandTotals.map(([currency, totals]) => (
              <div
                key={currency}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                    Grand Total
                  </span>
                  <span className="text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full px-2 py-0.5">
                    {currency}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                    <span>Total Lent</span>
                    <span className="font-medium text-gray-800 dark:text-slate-200">
                      {formatCurrency(totals.lent, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                    <span>Total Borrowed</span>
                    <span className="font-medium text-gray-800 dark:text-slate-200">
                      {formatCurrency(totals.borrowed, currency)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700 mt-2 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">
                      Net Balance
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        totals.net >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(totals.net, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-700/60 animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/6" />
                </div>
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded w-28" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && summaries.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No clients yet.</p>
            <Link
              to="/"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Add your first client →
            </Link>
          </div>
        )}

        {/* Per-client table */}
        {!loading && summaries.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              {([
                ["name", "Client", "col-span-3 text-left"],
              ] as const).map(([col, label, cls]) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`${cls} flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-start`}
                >
                  {label}
                  <span className="inline-flex flex-col leading-none">
                    <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === col && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                    <svg className={`w-2.5 h-2.5 ${sortCol === col && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                  </span>
                </button>
              ))}
              <button
                onClick={() => handleSort("clientType")}
                className="col-span-1 text-left flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-start"
              >
                Type
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "clientType" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "clientType" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              {([
                ["txCount", "Txns", "col-span-1 text-center"],
                ["totalLent", "Total Lent", "col-span-2 text-right"],
                ["totalBorrowed", "Total Borrowed", "col-span-2 text-right"],
                ["netBalance", "Net Balance", "col-span-2 text-right"],
              ] as const).map(([col, label, cls]) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`${cls} flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-end`}
                >
                  {label}
                  <span className="inline-flex flex-col leading-none">
                    <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === col && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                    <svg className={`w-2.5 h-2.5 ${sortCol === col && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                  </span>
                </button>
              ))}
              <div className="col-span-1 text-center">Include</div>
            </div>

            {/* Rows */}
            {filteredSummaries.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                No clients match the current filters.
              </div>
            )}
            {filteredSummaries.map(
              ({ client, totalLent, totalBorrowed, netBalance, txCount }) => (
                <div
                  key={client.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-700/60 last:border-0 items-center hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer ${
                    excluded.has(client.id) ? "opacity-40" : ""
                  }`}
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  {/* Client name */}
                  <div className="col-span-3">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {client.name}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {client.currency}
                    </span>
                  </div>

                  {/* Client type */}
                  <div className="col-span-1">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {client.client_type === "financial_institution" ? "Fin. Inst." : "Individual"}
                    </span>
                  </div>

                  {/* Transaction count */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm text-gray-500 dark:text-slate-400">{txCount}</span>
                  </div>

                  {/* Total lent */}
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {txCount === 0
                        ? "—"
                        : formatCurrency(totalLent, client.currency)}
                    </span>
                  </div>

                  {/* Total borrowed */}
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {txCount === 0
                        ? "—"
                        : formatCurrency(totalBorrowed, client.currency)}
                    </span>
                  </div>

                  {/* Net balance */}
                  <div className="col-span-2 text-right">
                    {txCount === 0 ? (
                      <span className="text-sm text-gray-400 dark:text-slate-500">No data</span>
                    ) : (
                      <span
                        className={`text-sm font-bold ${
                          netBalance > 0
                            ? "text-green-600"
                            : netBalance < 0
                            ? "text-red-600"
                            : "text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        {netBalance > 0 ? "+" : ""}
                        {formatCurrency(netBalance, client.currency)}
                      </span>
                    )}
                  </div>

                  {/* Include toggle */}
                  <div
                    className="col-span-1 flex justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={!excluded.has(client.id)}
                      onChange={() => toggleExcluded(client.id)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                      title={excluded.has(client.id) ? "Excluded from totals" : "Included in totals"}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
