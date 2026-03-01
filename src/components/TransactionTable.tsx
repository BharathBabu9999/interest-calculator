import { useState, Fragment } from 'react';
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
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);

  const sortedTransactions =
    sortOrder === 'chronological'
      ? [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime())
      : transactions;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(tid => tid !== id) 
        : [...prev, id]
    );
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 dark:text-slate-400">No transactions yet. Add a transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {sortedTransactions.map((transaction) => {
              const breakdown = calculateCurrentValue(transaction, asOfDate);
              const isExpanded = expandedIds.includes(transaction.id);
              const isEditing = editingId === transaction.id;

              if (isEditing && editForm) {
                return (
                  <tr key={transaction.id} className="bg-blue-50 dark:bg-blue-900/20">
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
                          setEditForm({ ...editForm, type: e.target.value as 'lend' | 'borrow' })
                        }
                        className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded"
                      >
                        <option value="lend">Lend</option>
                        <option value="borrow">Borrow</option>
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
                        className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <input
                        type="text"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(breakdown.currentValue, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:text-green-800 dark:hover:text-green-400 mr-3"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <Fragment key={transaction.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDateForDisplay(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          transaction.type === 'lend'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {transaction.type === 'lend' ? 'Lend' : 'Borrow'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.interestRate}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate">
                      {transaction.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(breakdown.currentValue, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleExpand(transaction.id)}
                        className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 mr-3"
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
                      <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-slate-700/30">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Calculation Breakdown</h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Duration</p>
                              <p className="text-sm font-medium">
                                {breakdown.duration.years}yrs {breakdown.duration.months}months{' '}
                                {breakdown.duration.days}days
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Original Amount</p>
                              <p className="text-sm font-medium">
                                {formatCurrency(breakdown.originalAmount, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Years Interest</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(breakdown.yearsInterest, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Months Interest</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(breakdown.monthsInterest, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Days Interest</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(breakdown.daysInterest, currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Current Value</p>
                              <p className="text-sm font-bold text-blue-600">
                                {formatCurrency(breakdown.currentValue, currency)}
                              </p>
                            </div>
                          </div>

                          {breakdown.compoundingSteps.length > 0 && (
                            <div className="mt-4">
                                  <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Annual Compounding Steps
                              </h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead className="bg-gray-100 dark:bg-slate-700">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400">
                                        Year
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400">
                                        Date
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400">
                                        Principal Before
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400">
                                        Interest
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400">
                                        Principal After
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {breakdown.compoundingSteps.map((step, idx) => (
                                      <tr key={idx}>
                                        <td className="px-3 py-2 dark:text-slate-300">{step.year}</td>
                                        <td className="px-3 py-2 dark:text-slate-300">
                                          {formatDateForDisplay(step.date)}
                                        </td>
                                        <td className="px-3 py-2 dark:text-slate-300">
                                          {formatCurrency(step.principalBefore, currency)}
                                        </td>
                                        <td className="px-3 py-2 text-green-600 dark:text-green-400">
                                          {formatCurrency(step.interest, currency)}
                                        </td>
                                        <td className="px-3 py-2 font-semibold dark:text-white">
                                          {formatCurrency(step.principalAfter, currency)}
                                        </td>
                                      </tr>
                                    ))}
                                    {/* Remaining Months Row */}
                                    {breakdown.duration.months > 0 && (() => {
                                      const lastStep = breakdown.compoundingSteps[breakdown.compoundingSteps.length - 1];
                                      const principal = lastStep ? lastStep.principalAfter : breakdown.originalAmount;
                                      const monthEndDate = new Date(asOfDate);
                                      monthEndDate.setDate(monthEndDate.getDate() - breakdown.duration.days);
                                      
                                      return (
                                          <tr className="bg-gray-50 dark:bg-slate-700/40">
                                          <td className="px-3 py-2 italic text-gray-500 dark:text-slate-400">Months ({breakdown.duration.months})</td>
                                          <td className="px-3 py-2 italic text-gray-500 dark:text-slate-400">{formatDateForDisplay(monthEndDate)}</td>
                                          <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{formatCurrency(principal, currency)}</td>
                                          <td className="px-3 py-2 green-600 dark:text-green-400 font-medium">+{formatCurrency(breakdown.monthsInterest, currency)}</td>
                                          <td className="px-3 py-2 text-gray-700 dark:text-slate-300">{formatCurrency(principal + breakdown.monthsInterest, currency)}</td>
                                        </tr>
                                      );
                                    })()}
                                    {/* Remaining Days Row */}
                                    {breakdown.duration.days > 0 && (() => {
                                      const lastStep = breakdown.compoundingSteps[breakdown.compoundingSteps.length - 1];
                                      const principal = lastStep ? lastStep.principalAfter : breakdown.originalAmount;
                                      const runningPrincipal = principal + breakdown.monthsInterest;
                                      
                                      return (
                                          <tr className="bg-gray-50 dark:bg-slate-700/40">
                                          <td className="px-3 py-2 italic text-gray-500 dark:text-slate-400">Days ({breakdown.duration.days})</td>
                                          <td className="px-3 py-2 italic text-gray-500 dark:text-slate-400">{formatDateForDisplay(asOfDate)}</td>
                                          <td className="px-3 py-2 text-gray-500 dark:text-slate-400">{formatCurrency(runningPrincipal, currency)}</td>
                                          <td className="px-3 py-2 text-green-600 dark:text-green-400 font-medium">+{formatCurrency(breakdown.daysInterest, currency)}</td>
                                          <td className="px-3 py-2 font-bold text-gray-900 dark:text-white">{formatCurrency(breakdown.currentValue, currency)}</td>
                                        </tr>
                                      );
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
