import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clientsApi, type ClientRead, type ClientCreate } from "../api/clients";
import { transactionsApi } from "../api/transactions";
import { calculateTotalBalance } from "../utils/calculator";
import { formatCurrency } from "../utils/currency";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import type { ClientType } from "../types";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "financial_institution", label: "Financial Institution" },
];

interface ClientFormState {
  name: string;
  client_type: ClientType;
  currency: string;
  notes: string;
  phone: string;
  email: string;
  address: string;
  company: string;
}

const empty: ClientFormState = { name: "", client_type: "individual", currency: "INR", notes: "", phone: "", email: "", address: "", company: "" };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState<"" | "individual" | "financial_institution">("");
  const [amountOp, setAmountOp] = useState<"" | ">" | "<">("");
  const [amountVal, setAmountVal] = useState("");
  const [clientBalances, setClientBalances] = useState<Record<string, number>>({});
  const [balancesLoading, setBalancesLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRead | null>(null);
  const [form, setForm] = useState<ClientFormState>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch net balances for all clients
  const fetchBalances = useCallback(async (clientList: ClientRead[]) => {
    if (clientList.length === 0) return;
    setBalancesLoading(true);
    const now = new Date();
    try {
      const txLists = await Promise.all(clientList.map((c) => transactionsApi.list(c.id)));
      const map: Record<string, number> = {};
      clientList.forEach((c, i) => {
        const transactions = txLists[i].map((tx) => ({
          id: tx.id,
          date: new Date(`${tx.date}T00:00:00`),
          amount: tx.amount,
          interestRate: tx.interest_rate,
          type: tx.type as "lend" | "borrow",
          notes: tx.notes ?? "",
          completed: tx.completed ?? false,
        }));
        const { netBalance } = calculateTotalBalance(transactions, now);
        map[c.id] = netBalance;
      });
      setClientBalances(map);
    } catch {
      // silently ignore — balances are optional
    } finally {
      setBalancesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!loading && clients.length > 0) fetchBalances(clients);
  }, [clients, loading, fetchBalances]);

  const openCreate = () => {
    setEditingClient(null);
    setForm(empty);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (client: ClientRead) => {
    setEditingClient(client);
    setForm({ name: client.name, client_type: client.client_type, currency: client.currency, notes: client.notes ?? "", phone: client.phone ?? "", email: client.email ?? "", address: client.address ?? "", company: client.company ?? "" });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
    setForm(empty);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Client name is required");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload: ClientCreate = {
        name: form.name.trim(),
        client_type: form.client_type,
        currency: form.currency,
        notes: form.notes.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        company: form.company.trim() || undefined,
      };
      if (editingClient) {
        const updated = await clientsApi.update(editingClient.id, payload);
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await clientsApi.create(payload);
        setClients((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await clientsApi.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white transition-colors">
      {/* Nav */}
      <header className="border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Interest Calculator</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/summary"
              className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5"
            >
              Portfolio Summary
            </Link>
            <ThemeToggle />
            <span className="text-gray-500 dark:text-slate-400 text-sm hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Clients</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
              Select a client to manage their transactions and calculate interest.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors"
          >
            + Add Client
          </button>
        </div>

        {/* Search */}
        {!loading && clients.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, phone, email, address…"
              className="w-full sm:w-80 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                value={amountOp}
                onChange={(e) => setAmountOp(e.target.value as "" | ">" | "<")}
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 border-r-0 text-gray-900 dark:text-white rounded-l-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10"
              >
                <option value="">Net Amount</option>
                <option value=">">Greater than</option>
                <option value="<">Less than</option>
              </select>
              <input
                type="number"
                min="0"
                value={amountVal}
                onChange={(e) => setAmountVal(e.target.value)}
                placeholder="Amount"
                disabled={amountOp === ""}
                className="w-32 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-r-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-40"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-gray-400 dark:text-slate-400 text-center py-20">Loading clients…</div>
        )}

        {/* Empty */}
        {!loading && clients.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-slate-400 mb-4">No clients yet.</p>
            <button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-colors"
            >
              Add your first client
            </button>
          </div>
        )}

        {/* Client grid */}
        {!loading && clients.length > 0 && (() => {
          const textQuery = search.trim().toLowerCase();
          const numVal = amountVal !== "" ? parseFloat(amountVal) : null;

          const filtered = clients.filter((c) => {
            const textOk = !textQuery ||
              c.name.toLowerCase().includes(textQuery) ||
              (c.phone ?? "").toLowerCase().includes(textQuery) ||
              (c.email ?? "").toLowerCase().includes(textQuery) ||
              (c.address ?? "").toLowerCase().includes(textQuery);
            const typeOk = !clientTypeFilter || c.client_type === clientTypeFilter;
            const net = clientBalances[c.id] ?? 0;
            const amountOk = !amountOp || numVal === null ||
              (amountOp === ">" ? net > numVal : net < numVal);
            return textOk && typeOk && amountOk;
          });
          return (
            <>
              {filtered.length === 0 && (
                <div className="text-gray-400 dark:text-slate-400 text-center py-12 text-sm">
                  No clients match{search ? <> &ldquo;{search}&rdquo;</> : ""}{amountOp && amountVal ? <> with net {amountOp} {amountVal}</> : ""}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((client) => (
              <div
                key={client.id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-3 hover:border-blue-500 transition-colors group cursor-pointer"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{client.name}</h3>
                    {client.company && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{client.company}</p>
                    )}
                    <span className="inline-block mt-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full px-2 py-0.5">
                      {client.currency}
                    </span>
                    <span className="inline-block mt-1 ml-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full px-2 py-0.5">
                      {client.client_type === "financial_institution" ? "Financial Institution" : "Individual"}
                    </span>
                  </div>
                  {/* Actions */}
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(client)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xs"
                      title="Edit client"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-xs"
                      title="Delete client"
                    >
                      {deletingId === client.id ? "…" : "✕"}
                    </button>
                  </div>
                </div>
                {client.notes && (
                  <p className="text-gray-500 dark:text-slate-400 text-xs line-clamp-2">{client.notes}</p>
                )}
                {(client.phone || client.email) && (
                  <div className="flex flex-col gap-0.5">
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        📞 {client.phone}
                      </a>
                    )}
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        ✉ {client.email}
                      </a>
                    )}
                  </div>
                )}
                  <div className="mt-auto pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium group-hover:underline">
                      View transactions →
                    </span>
                    {client.id in clientBalances ? (
                      <span className={`text-xs font-semibold ${
                        clientBalances[client.id] > 0 ? "text-green-600 dark:text-green-400" :
                        clientBalances[client.id] < 0 ? "text-red-500 dark:text-red-400" :
                        "text-gray-400 dark:text-slate-500"
                      }`}>
                        {clientBalances[client.id] > 0 ? "+" : ""}{formatCurrency(clientBalances[client.id], client.currency)}
                      </span>
                    ) : balancesLoading ? (
                      <span className="text-xs text-gray-300 dark:text-slate-600">…</span>
                    ) : null}
                  </div>
              </div>
                ))}
              </div>
            </>
          );
        })()}
      </main>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              {editingClient ? "Edit Client" : "New Client"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Raj Kumar"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Client Type
                </label>
                <select
                  value={form.client_type}
                  onChange={(e) => setForm((f) => ({ ...f, client_type: e.target.value as ClientType }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Company <span className="text-gray-400 dark:text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Phone <span className="text-gray-400 dark:text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Email <span className="text-gray-400 dark:text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="raj@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Address <span className="text-gray-400 dark:text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="123 Main St, Mumbai, India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Notes <span className="text-gray-400 dark:text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Any notes about this client…"
                />
              </div>

              {formError && (
                <div className="bg-red-50 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 rounded-lg px-3 py-2 text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-xl py-2.5 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl py-2.5 text-sm transition-colors"
              >
                {saving ? "Saving…" : editingClient ? "Save Changes" : "Create Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
