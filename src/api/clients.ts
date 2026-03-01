import { api } from "./client";

export interface ClientRead {
  id: string;
  name: string;
  currency: string;
  notes: string | null;
  created_at: string;
}

export interface ClientCreate {
  name: string;
  currency: string;
  notes?: string;
}

export interface ClientUpdate {
  name?: string;
  currency?: string;
  notes?: string;
}

export const clientsApi = {
  list: () => api.get<ClientRead[]>("/clients"),
  get: (id: string) => api.get<ClientRead>(`/clients/${id}`),
  create: (data: ClientCreate) => api.post<ClientRead>("/clients", data),
  update: (id: string, data: ClientUpdate) =>
    api.put<ClientRead>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};
