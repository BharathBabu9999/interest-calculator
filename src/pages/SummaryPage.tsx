import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientsApi, type ClientRead } from "../api/clients";
import { transactionsApi, apiTransactionToLocal } from "../api/transactions";
import { calculateTotalBalance, calculateCurrentValue, calculateDailyInterest } from '../utils/calculator';
import { formatCurrency } from "../utils/currency";
import DateInput from "../components/DateInput";
import { exportSummaryToPDF, exportSummaryToExcel, type SummaryExportRow } from "../utils/export";
import Navbar from "../components/Navbar";
import ToggleButton from "../components/ToggleButton";
import DailyInterestCard from "../components/DailyInterestCard";
import type { Transaction } from "../types";

interface ClientSummary {
  client: ClientRead;
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
  txCount: number;
  highestRate: number;
  principalLent: number;
  principalBorrowed: number;
  transactions: Transaction[];
}

// ── component ─────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const navigate = useNavigate();

  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [summaries, setSummaries] = useState<ClientSummary[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<"name" | "clientType" | "txCount" | "totalLent" | "totalBorrowed" | "netBalance" | "highestRate">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientTypeFilter, setClientTypeFilter] = useState<"" | "individual" | "financial_institution">("");
  const [netBalanceOp, setNetBalanceOp] = useState<"" | ">" | "<">("");
  const [netBalanceVal, setNetBalanceVal] = useState("");
  const [showDetailedTx, setShowDetailedTx] = useState(false);
  const [showDetailCalc, setShowDetailCalc] = useState(false);
  const [showDailyValue, setShowDailyValue] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) =>
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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

      // Only include active clients
      const activeClients = clients.filter((c) => c.is_active);
      if (activeClients.length === 0) {
        setSummaries([]);
        return;
      }

      // Fetch all clients' transactions in parallel
      const txLists = await Promise.all(
        activeClients.map((c) => transactionsApi.list(c.id))
      );

      const result: ClientSummary[] = activeClients.map((client, i) => {
        const transactions = txLists[i].map(apiTransactionToLocal);
        const { totalLent, totalBorrowed, netBalance, principalLent, principalBorrowed } =
          calculateTotalBalance(transactions, asOfDate);
        const highestRate = transactions.length > 0
          ? Math.max(...transactions.map((t) => t.interestRate))
          : 0;
        return {
          client,
          totalLent,
          totalBorrowed,
          netBalance,
          txCount: transactions.length,
          highestRate,
          principalLent,
          principalBorrowed,
          transactions,
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
    else if (sortCol === "highestRate") cmp = a.highestRate - b.highestRate;
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

  type CurrencyTotals = { lent: number; borrowed: number; net: number; principalLent: number; principalBorrowed: number };

  const totalsMap = filteredSummaries.reduce<Record<string, CurrencyTotals>>(
    (acc, { client, totalLent, totalBorrowed, netBalance, principalLent, principalBorrowed }) => {
    if (excluded.has(client.id)) return acc;
    const cur = client.currency;
    if (!acc[cur]) acc[cur] = { lent: 0, borrowed: 0, net: 0, principalLent: 0, principalBorrowed: 0 };
    acc[cur].lent += totalLent;
    acc[cur].borrowed += totalBorrowed;
    acc[cur].net += netBalance;
    acc[cur].principalLent += principalLent;
    acc[cur].principalBorrowed += principalBorrowed;
    return acc;
  }, {});

  // per-type breakdown (only meaningful when showing all types)
  const byTypeMap = filteredSummaries.reduce<Record<string, Record<string, CurrencyTotals>>>(
    (acc, { client, totalLent, totalBorrowed, netBalance, principalLent, principalBorrowed }) => {
      if (excluded.has(client.id)) return acc;
      const cur = client.currency;
      const typ = client.client_type === "financial_institution" ? "Financial Institution" : "Individual";
      if (!acc[cur]) acc[cur] = {};
      if (!acc[cur][typ]) acc[cur][typ] = { lent: 0, borrowed: 0, net: 0, principalLent: 0, principalBorrowed: 0 };
      acc[cur][typ].lent += totalLent;
      acc[cur][typ].borrowed += totalBorrowed;
      acc[cur][typ].net += netBalance;
      acc[cur][typ].principalLent += principalLent;
      acc[cur][typ].principalBorrowed += principalBorrowed;
      return acc;
    }, {});

  const grandTotals = Object.entries(totalsMap).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  // ── daily totals ─────────────────────────────────────────────────────

  type DailyTotals = { lent: number; borrowed: number; net: number };
  const dailyTotalsMap = filteredSummaries.reduce<Record<string, DailyTotals>>(
    (acc, { client, transactions }) => {
      if (excluded.has(client.id)) return acc;
      const cur = client.currency;
      const daily = calculateDailyInterest(transactions, asOfDate);
      if (!acc[cur]) acc[cur] = { lent: 0, borrowed: 0, net: 0 };
      acc[cur].lent += daily.lent;
      acc[cur].borrowed += daily.borrowed;
      acc[cur].net += daily.net;
      return acc;
    }, {}
  );

  // ── daily totals per type ─────────────────────────────────────────────────

  const dailyByTypeMap = filteredSummaries.reduce<Record<string, Record<string, DailyTotals>>>(
    (acc, { client, transactions }) => {
      if (excluded.has(client.id)) return acc;
      const cur = client.currency;
      const typ = client.client_type === "financial_institution" ? "Financial Institution" : "Individual";
      const daily = calculateDailyInterest(transactions, asOfDate);
      if (!acc[cur]) acc[cur] = {};
      if (!acc[cur][typ]) acc[cur][typ] = { lent: 0, borrowed: 0, net: 0 };
      acc[cur][typ].lent += daily.lent;
      acc[cur][typ].borrowed += daily.borrowed;
      acc[cur][typ].net += daily.net;
      return acc;
    }, {}
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

        {/* Filters + Show Transactions toggle */}
        {!loading && summaries.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
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
            {/* Show Transactions + Detail Calculations toggles */}
            <div className="flex gap-2 flex-wrap">
              <ToggleButton
                active={showDetailedTx}
                onClick={() => {
                  const next = !showDetailedTx;
                  setShowDetailedTx(next);
                  if (next) {
                    setExpandedClients(new Set(summaries.map((s) => s.client.id)));
                  } else {
                    setExpandedClients(new Set());
                    setShowDetailCalc(false);
                  }
                }}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
              >
                {showDetailedTx ? "Hide Transactions" : "Show Transactions"}
              </ToggleButton>
              {showDetailedTx && (
                <ToggleButton
                  active={showDetailCalc}
                  onClick={() => setShowDetailCalc((v) => !v)}
                  activeColor="violet"
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                >
                  {showDetailCalc ? "Hide Calculations" : "Show Detail Calculations"}
                </ToggleButton>
              )}
              <ToggleButton
                active={showDailyValue}
                onClick={() => setShowDailyValue((v) => !v)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              >
                {showDailyValue ? "Hide Daily Value" : "Daily Value"}
              </ToggleButton>
            </div>
          </div>
        )}

        {/* Daily value cards */}
        {!loading && showDailyValue && grandTotals.length > 0 && (
          <div className="mb-6 space-y-3">
            {Object.entries(dailyTotalsMap).sort(([a], [b]) => a.localeCompare(b)).map(([currency, daily]) => (
              <DailyInterestCard key={currency} lent={daily.lent} borrowed={daily.borrowed} net={daily.net} currency={currency} currencyLabel />
            ))}
          </div>
        )}

        {/* Grand total cards */}
        {!loading && grandTotals.length > 0 && (
          <div className="mb-8 space-y-4">
            {grandTotals.map(([currency, totals]) => {
              const typeBreakdown = byTypeMap[currency] ?? {};
              const typeEntries = Object.entries(typeBreakdown).sort(([a], [b]) => a.localeCompare(b));
              const showBreakdown = clientTypeFilter === "" && typeEntries.length > 1;

              const TotalsCard = ({ label, t, isGrand = false, daily }: { label: string; t: CurrencyTotals; isGrand?: boolean; daily?: DailyTotals }) => (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">{label}</span>
                    <span className="text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full px-2 py-0.5">{currency}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-2 text-sm text-gray-500 dark:text-slate-400">
                      <span className="shrink-0">Total Lent</span>
                      <span className="text-right">
                        <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 block">{formatCurrency(t.lent, currency)}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">({formatCurrency(t.principalLent, currency)} principal)</span>
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm text-gray-500 dark:text-slate-400">
                      <span className="shrink-0">Total Borrowed</span>
                      <span className="text-right">
                        <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 block">{formatCurrency(t.borrowed, currency)}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">({formatCurrency(t.principalBorrowed, currency)} principal)</span>
                      </span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-slate-700 mt-2 pt-2 flex justify-between gap-2">
                      <span className="font-semibold text-gray-700 dark:text-slate-300 shrink-0">Net Balance</span>
                      <span className={`${isGrand ? "text-base sm:text-xl" : "text-sm sm:text-lg"} font-bold text-right ${t.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(t.net, currency)}
                      </span>
                    </div>
                    {showDailyValue && daily && (
                      <div className="flex justify-between gap-2 mt-1">
                        <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">Approx. Daily Interest</span>
                        <span className={`text-xs font-semibold ${daily.net >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {daily.net >= 0 ? "+" : ""}{formatCurrency(daily.net, currency)}/day
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <div key={currency} className={`grid gap-4 ${showBreakdown ? `grid-cols-1 sm:grid-cols-${Math.min(typeEntries.length + 1, 3)}` : "grid-cols-1 sm:grid-cols-3"}`}>
                  {showBreakdown ? (
                    <>
                      {typeEntries.map(([typeName, t]) => (
                        <TotalsCard key={typeName} label={typeName} t={t} daily={dailyByTypeMap[currency]?.[typeName]} />
                      ))}
                      <TotalsCard label="Grand Total" t={totals} isGrand daily={dailyTotalsMap[currency]} />
                    </>
                  ) : (
                    <TotalsCard
                      label={clientTypeFilter === "financial_institution" ? "Financial Institution" : clientTypeFilter === "individual" ? "Individual" : "Grand Total"}
                      t={totals}
                      isGrand
                      daily={dailyTotalsMap[currency]}
                    />
                  )}
                </div>
              );
            })}
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
            <div className="overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 min-w-[700px]">
              <button
                onClick={() => handleSort("name")}
                className="col-span-2 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-start"
              >
                Client
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "name" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "name" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <button
                onClick={() => handleSort("clientType")}
                className="col-span-1 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-start"
              >
                Type
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "clientType" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "clientType" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <button
                onClick={() => handleSort("txCount")}
                className="col-span-1 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-center"
              >
                Txns
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "txCount" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "txCount" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <button
                onClick={() => handleSort("totalLent")}
                className="col-span-2 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-end"
              >
                Total Lent
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "totalLent" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "totalLent" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <button
                onClick={() => handleSort("totalBorrowed")}
                className="col-span-2 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-end"
              >
                Total Borrowed
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "totalBorrowed" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "totalBorrowed" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <button
                onClick={() => handleSort("highestRate")}
                className="col-span-1 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-end"
              >
                Rate
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "highestRate" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "highestRate" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <button
                onClick={() => handleSort("netBalance")}
                className="col-span-2 flex items-center gap-1 hover:text-gray-800 dark:hover:text-white transition-colors justify-end"
              >
                Net Balance
                <span className="inline-flex flex-col leading-none">
                  <svg className={`w-2.5 h-2.5 -mb-0.5 ${sortCol === "netBalance" && sortDir === "asc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
                  <svg className={`w-2.5 h-2.5 ${sortCol === "netBalance" && sortDir === "desc" ? "text-blue-500" : "text-gray-300 dark:text-slate-600"}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </span>
              </button>
              <div className="col-span-1 text-center">Include</div>
            </div>

            {/* Rows */}
            {filteredSummaries.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                No clients match the current filters.
              </div>
            )}
            {filteredSummaries.map(
              ({ client, totalLent, totalBorrowed, netBalance, txCount, highestRate, principalLent, principalBorrowed, transactions }) => {
                const isExpanded = expandedClients.has(client.id);
                return (
                <div key={client.id}>
                <div
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-700/60 items-center transition-colors group min-w-[700px] ${
                    excluded.has(client.id) ? "opacity-40" : ""
                  } ${
                    showDetailedTx
                      ? "hover:bg-gray-50/60 dark:hover:bg-slate-700/30 cursor-pointer"
                      : "hover:bg-gray-50/60 dark:hover:bg-slate-700/30 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (showDetailedTx) {
                      toggleExpanded(client.id);
                    } else {
                      navigate(`/clients/${client.id}`);
                    }
                  }}
                >
                  {/* Client name */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {showDetailedTx && (
                        <svg
                          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {client.name}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {client.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Client type */}
                  <div className="col-span-1">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {client.client_type === "financial_institution" ? "Fin. Inst." : "Individual"}
                    </span>
                  </div>

                  {/* Transaction count */}
                  <div className="col-span-1 text-center">
                    <span className="text-xs text-gray-500 dark:text-slate-400">{txCount}</span>
                  </div>

                  {/* Total lent */}
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300 block">
                      {txCount === 0 ? "—" : formatCurrency(totalLent, client.currency)}
                    </span>
                    {txCount > 0 && (
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        ({formatCurrency(principalLent, client.currency)})
                      </span>
                    )}
                  </div>

                  {/* Total borrowed */}
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300 block">
                      {txCount === 0 ? "—" : formatCurrency(totalBorrowed, client.currency)}
                    </span>
                    {txCount > 0 && (
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        ({formatCurrency(principalBorrowed, client.currency)})
                      </span>
                    )}
                  </div>

                  {/* Highest rate */}
                  <div className="col-span-1 text-right">
                    <span className="text-xs text-gray-600 dark:text-slate-300">
                      {txCount === 0 ? "—" : `${highestRate.toFixed(1)}%`}
                    </span>
                  </div>

                  {/* Net balance */}
                  <div className="col-span-2 text-right">
                    {txCount === 0 ? (
                      <span className="text-xs text-gray-400 dark:text-slate-500">No data</span>
                    ) : (
                      <span
                        className={`text-xs font-bold ${
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

                {/* Detailed transactions sub-panel */}
                {showDetailedTx && isExpanded && (
                  <div className="bg-gray-50 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-700/60">
                    {transactions.length === 0 ? (
                      <p className="px-10 py-4 text-xs text-gray-400 dark:text-slate-500 italic">No transactions yet.</p>
                    ) : (
                      <>
                        {/* Mini header */}
                        <div className="grid grid-cols-12 gap-3 px-10 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 border-b border-gray-200 dark:border-slate-700/60 min-w-[700px]">
                          <div className="col-span-2">Date</div>
                          <div className="col-span-1">Type</div>
                          <div className="col-span-2 text-right">Amount</div>
                          <div className="col-span-1 text-right">Rate</div>
                          <div className="col-span-2 text-right">Balance</div>
                          <div className="col-span-2">Reminder</div>
                          <div className="col-span-2">Notes</div>
                        </div>
                        {/* Rows */}
                        {[...transactions]
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((tx) => {
                            const bal = calculateTotalBalance([tx], asOfDate);
                            const txNet = tx.type === "lend" ? bal.netBalance : -bal.netBalance;
                            const calc = showDetailCalc ? calculateCurrentValue(tx, asOfDate) : null;
                            return (
                              <div key={tx.id} className={`border-b border-gray-100 dark:border-slate-700/40 last:border-0 ${tx.completed ? "opacity-50" : ""}` }>
                                {/* Summary row */}
                                <div className="grid grid-cols-12 gap-3 px-10 py-2.5 text-xs min-w-[700px]">
                                  <div className="col-span-2 text-gray-600 dark:text-slate-400 font-mono">
                                    {tx.date.toLocaleDateString("en-GB")}
                                  </div>
                                  <div className="col-span-1">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${
                                        tx.type === "lend"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                      }`}
                                    >
                                      {tx.type === "lend" ? "Lend" : "Borrow"}
                                    </span>
                                  </div>
                                  <div className="col-span-2 text-right font-medium text-gray-700 dark:text-slate-300">
                                    {formatCurrency(tx.amount, client.currency)}
                                  </div>
                                  <div className="col-span-1 text-right text-gray-500 dark:text-slate-400">
                                    {tx.interestRate}%
                                  </div>
                                  <div className={`col-span-2 text-right font-semibold ${
                                    tx.completed ? "text-gray-400" :
                                    tx.type === "lend" ? "text-green-600" : "text-red-500"
                                  }`}>
                                    {tx.completed ? "Completed" : `${txNet >= 0 ? "+" : ""}${formatCurrency(txNet, client.currency)}`}
                                  </div>
                                  <div className="col-span-2 text-gray-500 dark:text-slate-400">
                                    {tx.reminderDate
                                      ? tx.reminderDate.toLocaleDateString("en-GB")
                                      : "—"}
                                  </div>
                                  <div className="col-span-2 text-gray-500 dark:text-slate-400 truncate" title={tx.notes}>
                                    {tx.notes || "—"}
                                  </div>
                                </div>

                                {/* Detail calculation breakdown */}
                                {calc && !tx.completed && (
                                  <div className="mx-10 mb-3 rounded-xl border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/10 text-xs overflow-hidden">
                                    {/* Duration header */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 bg-violet-100/60 dark:bg-violet-900/20 border-b border-violet-200 dark:border-violet-800/40">
                                      <span className="font-semibold text-violet-700 dark:text-violet-300">Calculation Breakdown</span>
                                      <span className="text-violet-500 dark:text-violet-400">
                                        {calc.duration.years}y {calc.duration.months}m {calc.duration.days}d
                                      </span>
                                      <span className="sm:ml-auto font-medium text-gray-600 dark:text-slate-300">
                                        Principal: {formatCurrency(calc.originalAmount, client.currency)}
                                      </span>
                                    </div>

                                    {/* Compounding steps */}
                                    {calc.compoundingSteps.length > 0 && (
                                      <div className="px-4 py-2 border-b border-violet-200 dark:border-violet-800/40 space-y-2">
                                        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1">Annual Compounding</p>
                                        {calc.compoundingSteps.map((step, i) => (
                                          <div key={i} className="text-gray-600 dark:text-slate-300">
                                            <div className="text-gray-500 dark:text-slate-400 mb-0.5">Year {i + 1} ({step.date.toLocaleDateString("en-GB")})</div>
                                            <div className="font-mono text-xs break-all">
                                              {formatCurrency(step.principalBefore, client.currency)}
                                              {" × "}{tx.interestRate}% × 12 = +{formatCurrency(step.interest, client.currency)}
                                              {" → "}{formatCurrency(step.principalAfter, client.currency)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Months + Days interest */}
                                    <div className="px-4 py-2 space-y-1 border-b border-violet-200 dark:border-violet-800/40">
                                      <div className="flex justify-between text-gray-600 dark:text-slate-300">
                                        <span>Months interest ({calc.duration.months}m)</span>
                                        <span className="font-mono">+{formatCurrency(calc.monthsInterest, client.currency)}</span>
                                      </div>
                                      <div className="flex justify-between text-gray-600 dark:text-slate-300">
                                        <span>Days interest ({calc.duration.days}d)</span>
                                        <span className="font-mono">+{formatCurrency(calc.daysInterest, client.currency)}</span>
                                      </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between px-4 py-2 font-semibold">
                                      <span className="text-gray-700 dark:text-slate-200">Current Value (with interest)</span>
                                      <span className={tx.type === "lend" ? "text-green-600" : "text-red-500"}>
                                        {formatCurrency(calc.currentValue, client.currency)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        {/* View client link */}
                        <div className="px-10 py-2.5 flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            View full client page →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                </div>
              );
            }
            )}
            </div>{/* end overflow-x-auto */}
          </div>
        )}
      </div>
    </div>
  );
}
