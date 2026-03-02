import { api } from "./client";

export interface TransactionRead {
  id: string;
  client_id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  amount: number;
  interest_rate: number;
  type: "lend" | "borrow";
  notes: string | null;
  completed: boolean;
  created_at: string;
}

export interface TransactionCreate {
  date: string;
  amount: number;
  interest_rate: number;
  type: "lend" | "borrow";
  notes?: string;
  completed?: boolean;
}

export interface TransactionUpdate {
  date?: string;
  amount?: number;
  interest_rate?: number;
  type?: "lend" | "borrow";
  notes?: string;
  completed?: boolean;
}

export const transactionsApi = {
  list: (clientId: string) =>
    api.get<TransactionRead[]>(`/clients/${clientId}/transactions`),

  create: (clientId: string, data: TransactionCreate) =>
    api.post<TransactionRead>(`/clients/${clientId}/transactions`, data),

  update: (id: string, data: TransactionUpdate) =>
    api.put<TransactionRead>(`/transactions/${id}`, data),

  delete: (id: string) => api.delete(`/transactions/${id}`),
};
