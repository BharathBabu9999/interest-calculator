import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import type { Transaction } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';

// Custom validation for DD/MM/YYYY format
const dateStringSchema = z.string().refine((val) => {
  if (!val) return false;
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = val.match(regex);
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check for valid date
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}, 'Invalid date. Use DD/MM/YYYY format');

const transactionSchema = z.object({
  date: dateStringSchema,
  amount: z.number().positive('Amount must be positive'),
  interestRate: z.number().min(0, 'Interest rate must be non-negative'),
  type: z.enum(['loan', 'repayment']),
  notes: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: formatDateForDisplay(new Date()),
      amount: 0,
      interestRate: 2,
      type: 'loan',
      notes: '',
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    // Parse DD/MM/YYYY to Date object
    const [day, month, year] = data.date.split('/').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      date: parsedDate,
      amount: data.amount,
      interestRate: data.interestRate,
      type: data.type,
      notes: data.notes,
    };

    onAddTransaction(transaction);
    reset({ ...data, date: formatDateForDisplay(new Date()) });
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
      >
        <h2 className="text-xl font-semibold">Add Transaction</h2>
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date (DD/MM/YYYY)</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              {...register('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (% per month)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('interestRate', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.interestRate && (
              <p className="text-red-500 text-xs mt-1">{errors.interestRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="loan">Loan</option>
              <option value="repayment">Repayment</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add Transaction
        </button>
      </form>
        </div>
      )}
    </div>
  );
}
