import { useState } from 'react';
import type { Transaction } from '../types';
import { calculateCurrentValue } from '../utils/calculator';
import { formatCurrency } from '../utils/currency';
import { formatDateForInput, formatDateForDisplay } from '../utils/dateUtils';

interface TransactionTableProps {
  transactions: Transaction[];
  asOfDate: Date;
  sortOrder: 'chronological' | 'entry';
  currency: string;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  asOfDate,
  sortOrder,
  currency,
  onDeleteTransaction,
  onUpdateTransaction,
}: TransactionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);

  const sortedTransactions =
    sortOrder === 'chronological'
      ? [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime())
      : transactions;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({ ...transaction });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      onUpdateTransaction(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No transactions yet. Add a transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => {
              const breakdown = calculateCurrentValue(transaction, asOfDate);
              const isExpanded = expandedId === transaction.id;
              const isEditing = editingId === transaction.id;

              if (isEditing && editForm) {
                return (
                  <tr key={transaction.id} className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        type="date"
                        value={formatDateForInput(editForm.date)}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: new Date(e.target.value) })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, type: e.target.value as 'loan' | 'repayment' })
                        }
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="loan">Loan</option>
                        <option value="repayment">Repayment</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) =>
                          setEditForm({ ...editForm, amount: parseFloat(e.target.value) })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.interestRate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, interestRate: parseFloat(e.target.value) })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <input
                        type="text"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(breakdown.currentValue, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <>
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateForDisplay(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          transaction.type === 'loan'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type === 'loan' ? 'Loan' : 'Repayment'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.interestRate}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {transaction.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(breakdown.currentValue, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleExpand(transaction.id)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                      <button
                        onClick={() => startEdit(transaction)}
                        className="text-yellow-600 hover:text-yellow-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Calculation Breakdown</h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-medium">
                                {breakdown.duration.years}yrs {breakdown.duration.months}months{' '}
                                {breakdown.duration.days}days
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Original Amount</p>
                              <p className="text-sm font-medium">
                                {formatCurrency(breakdown.originalAmount, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Years Interest</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(breakdown.yearsInterest, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Months Interest</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(breakdown.monthsInterest, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Days Interest</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(breakdown.daysInterest, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Current Value</p>
                              <p className="text-sm font-bold text-blue-600">
                                {formatCurrency(breakdown.currentValue, currency)}
                              </p>
                            </div>
                          </div>

                          {breakdown.compoundingSteps.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                Annual Compounding Steps
                              </h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                        Year
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                        Date
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                        Principal Before
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                        Interest
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                        Principal After
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {breakdown.compoundingSteps.map((step, idx) => (
                                      <tr key={idx}>
                                        <td className="px-3 py-2">{step.year}</td>
                                        <td className="px-3 py-2">
                                          {formatDateForDisplay(step.date)}
                                        </td>
                                        <td className="px-3 py-2">
                                          {formatCurrency(step.principalBefore, currency)}
                                        </td>
                                        <td className="px-3 py-2 text-green-600">
                                          {formatCurrency(step.interest, currency)}
                                        </td>
                                        <td className="px-3 py-2 font-semibold">
                                          {formatCurrency(step.principalAfter, currency)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
