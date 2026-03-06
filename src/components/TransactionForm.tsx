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

const optionalDateStringSchema = z.string().refine((val) => {
  if (!val) return true; // empty is OK
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = val.match(regex);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}, 'Invalid date. Use DD/MM/YYYY format');

const transactionSchema = z.object({
  date: dateStringSchema,
  amount: z.number().positive('Amount must be positive'),
  interestRate: z.number().min(0, 'Interest rate must be non-negative'),
  type: z.enum(['lend', 'borrow']),
  notes: z.string(),
  expectedRepaymentDate: optionalDateStringSchema,
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  loading?: boolean;
}

export default function TransactionForm({ onAddTransaction, loading }: TransactionFormProps) {
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
      type: 'lend',
      notes: '',
      expectedRepaymentDate: '',
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    // Parse DD/MM/YYYY to Date object
    const [day, month, year] = data.date.split('/').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    let expectedRepaymentDate: Date | null = null;
    if (data.expectedRepaymentDate) {
      const [rd, rm, ry] = data.expectedRepaymentDate.split('/').map(Number);
      expectedRepaymentDate = new Date(ry, rm - 1, rd);
    }
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      date: parsedDate,
      amount: data.amount,
      interestRate: data.interestRate,
      type: data.type,
      notes: data.notes,
      completed: false,
      expectedRepaymentDate,
    };

    onAddTransaction(transaction);
    reset({ ...data, date: formatDateForDisplay(new Date()), expectedRepaymentDate: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
        disabled={!!loading}
        aria-disabled={!!loading}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Transaction</h2>
        <svg
          className={`w-6 h-6 text-gray-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t dark:border-slate-700">
          <form onSubmit={handleSubmit(onSubmit)} aria-disabled={!!loading}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date (DD/MM/YYYY)</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              {...register('date')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Interest Rate (% per month)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('interestRate', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.interestRate && (
              <p className="text-red-500 text-xs mt-1">{errors.interestRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lend">Lend</option>
              <option value="borrow">Borrow</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              {...register('notes')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Expected Repayment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              {...register('expectedRepaymentDate')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
            {errors.expectedRepaymentDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expectedRepaymentDate.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={!!loading}
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
        </div>
      )}
    </div>
  );
}
