import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clientsApi, type ClientRead, type ClientCreate } from "../api/clients";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

interface ClientFormState {
  name: string;
  currency: string;
  notes: string;
}

const empty: ClientFormState = { name: "", currency: "INR", notes: "" };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openCreate = () => {
    setEditingClient(null);
    setForm(empty);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (client: ClientRead) => {
    setEditingClient(client);
    setForm({ name: client.name, currency: client.currency, notes: client.notes ?? "" });
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
        currency: form.currency,
        notes: form.notes.trim() || undefined,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white transition-colors">
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
          <div className="mb-6">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full sm:w-72 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
          const filtered = clients.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          );
          return (
            <>
              {filtered.length === 0 && (
                <div className="text-gray-400 dark:text-slate-400 text-center py-12 text-sm">
                  No clients match &ldquo;{search}&rdquo;
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
                    <span className="inline-block mt-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full px-2 py-0.5">
                      {client.currency}
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
                  <div className="mt-auto pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium group-hover:underline">
                    View transactions →
                  </span>
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
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
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
