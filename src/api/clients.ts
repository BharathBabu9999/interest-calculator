import { api } from "./client";
import type { ClientType } from "../types";

export interface ClientRead {
  id: string;
  name: string;
  client_type: ClientType;
  currency: string;
  notes: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  company: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ClientCreate {
  name: string;
  client_type?: ClientType;
  currency: string;
  notes?: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
}

export interface ClientUpdate {
  name?: string;
  client_type?: ClientType;
  currency?: string;
  notes?: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  is_active?: boolean;
}

export const clientsApi = {
  list: () => api.get<ClientRead[]>("/clients"),
  get: (id: string) => api.get<ClientRead>(`/clients/${id}`),
  create: (data: ClientCreate) => api.post<ClientRead>("/clients", data),
  update: (id: string, data: ClientUpdate) =>
    api.put<ClientRead>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};
