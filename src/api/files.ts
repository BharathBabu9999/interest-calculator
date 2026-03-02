const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export interface ClientFile {
  id: string;
  client_id: string;
  original_filename: string;
  mimetype: string;
  size: number;
  description: string | null;
  created_at: string;
}

export const filesApi = {
  list: async (clientId: string): Promise<ClientFile[]> => {
    const res = await fetch(`${API_BASE}/clients/${clientId}/files`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  upload: async (clientId: string, file: File): Promise<ClientFile> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/clients/${clientId}/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    return res.json();
  },

  fetchBlob: async (fileId: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/files/${fileId}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  },

  download: async (fileId: string, filename: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/files/${fileId}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  updateDescription: async (fileId: string, description: string | null): Promise<ClientFile> => {
    const res = await fetch(`${API_BASE}/files/${fileId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  delete: async (fileId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};