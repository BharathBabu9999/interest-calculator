import { api } from "./client";
import type { Transaction } from "../types";

export interface TransactionRead {
  id: string;
  client_id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  amount: number;
  interest_rate: number;
  type: "lend" | "borrow";
  notes: string | null;
  completed: boolean;
  reminder_date: string | null;
  created_at: string;
}

export interface TransactionCreate {
  date: string;
  amount: number;
  interest_rate: number;
  type: "lend" | "borrow";
  notes?: string;
  completed?: boolean;
  reminder_date?: string;
}

export interface TransactionUpdate {
  date?: string;
  amount?: number;
  interest_rate?: number;
  type?: "lend" | "borrow";
  notes?: string;
  completed?: boolean;
  reminder_date?: string | null;
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

/**
 * Converts an API TransactionRead to a local Transaction with proper Date objects.
 * Parses dates as local midnight to prevent timezone-induced date shifts.
 */
export function apiTransactionToLocal(tx: TransactionRead): Transaction {
  return {
    id: tx.id,
    date: new Date(`${tx.date}T00:00:00`),
    amount: tx.amount,
    interestRate: tx.interest_rate,
    type: tx.type,
    notes: tx.notes ?? "",
    completed: tx.completed ?? false,
    reminderDate: tx.reminder_date
      ? new Date(`${tx.reminder_date}T00:00:00`)
      : null,
  };
}
