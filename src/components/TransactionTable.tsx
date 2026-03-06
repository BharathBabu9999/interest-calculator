import { useState, Fragment } from 'react';
import type { Transaction } from '../types';
import { calculateCurrentValue } from '../utils/calculator';
import { formatCurrency } from '../utils/currency';
import { formatDateForDisplay, parseDDMMYYYY } from '../utils/dateUtils';

interface TransactionTableProps {
  transactions: Transaction[];
  asOfDate: Date;
  currency: string;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onToggleCompleted: (id: string, completed: boolean) => void;
}

type SortColumn =
  | 'date'
  | 'type'
  | 'amount'
  | 'rate'
  | 'notes'
  | 'repaymentDate'
  | 'currentValue'
  | 'status';

  type SortDirection = 'asc' | 'desc';

  export default function TransactionTable({
    transactions,
    asOfDate,
    currency,
    onDeleteTransaction,
    onUpdateTransaction,
    onToggleCompleted,
  }: TransactionTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Compute current value for each transaction for sorting
  const txWithCurrentValue = transactions.map((tx) => ({
    ...tx,
    _currentValue: calculateCurrentValue(tx, asOfDate).currentValue,
  }));

  function compare(a: Transaction & { _currentValue: number }, b: Transaction & { _currentValue: number }, col: SortColumn): number {
    switch (col) {
      case 'date':
        return a.date.getTime() - b.date.getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      case 'amount':
        return a.amount - b.amount;
      case 'rate':
        return a.interestRate - b.interestRate;
      case 'notes':
        return (a.notes || '').localeCompare(b.notes || '');
      case 'repaymentDate':
        if (!a.expectedRepaymentDate && !b.expectedRepaymentDate) return 0;
        if (!a.expectedRepaymentDate) return 1;
        if (!b.expectedRepaymentDate) return -1;
        return a.expectedRepaymentDate.getTime() - b.expectedRepaymentDate.getTime();
      case 'currentValue':
        return a._currentValue - b._currentValue;
      case 'status':
        // Active < Completed
        return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
      default:
        return 0;
    }
  }

  const sortedTransactions = [...txWithCurrentValue].sort((a, b) => {
    const cmp = compare(a, b, sortColumn);
    return sortDirection === 'asc' ? cmp : -cmp;
  });

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

  function handleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  }

  function sortIcon(col: SortColumn) {
    const isAsc = sortColumn === col && sortDirection === 'asc';
    const isDesc = sortColumn === col && sortDirection === 'desc';
    return (
      <span className="inline-flex flex-col leading-none ml-1">
        <svg className={`w-2.5 h-2.5 -mb-0.5 ${isAsc ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600'}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 0l5 6H0z"/></svg>
        <svg className={`w-2.5 h-2.5 ${isDesc ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600'}`} viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
      </span>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('date')}>
                Date {sortIcon('date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('type')}>
                Type {sortIcon('type')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('amount')}>
                Amount {sortIcon('amount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('rate')}>
                Rate {sortIcon('rate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('notes')}>
                Notes {sortIcon('notes')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('repaymentDate')}>
                Repayment Date {sortIcon('repaymentDate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('currentValue')}>
                Current Value {sortIcon('currentValue')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('status')}>
                Status {sortIcon('status')}
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
              const isCompleted = transaction.completed;

              if (isEditing && editForm) {
                return (
                  <Fragment key={transaction.id}>
                    {/* Normal read-only row dimmed while editing */}
                    <tr className="opacity-40 pointer-events-none select-none">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDateForDisplay(transaction.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${transaction.type === 'lend' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {transaction.type === 'lend' ? 'Lend' : 'Borrow'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(transaction.amount, currency)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.interestRate}%</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate">{transaction.notes || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {transaction.expectedRepaymentDate ? formatDateForDisplay(transaction.expectedRepaymentDate) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(breakdown.currentValue, currency)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">—</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">—</td>
                    </tr>

                    {/* Spacious edit panel */}
                    <tr>
                      <td colSpan={9} className="px-6 py-5 bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-700">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Date</label>
                            <input
                              type="text"
                              placeholder="DD/MM/YYYY"
                              defaultValue={formatDateForDisplay(editForm.date)}
                              onBlur={(e) => {
                                const parsed = parseDDMMYYYY(e.target.value);
                                if (parsed) setEditForm({ ...editForm, date: parsed });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Type</label>
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'lend' | 'borrow' })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="lend">Lend</option>
                              <option value="borrow">Borrow</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Amount</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Rate (% / month)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.interestRate}
                              onChange={(e) => setEditForm({ ...editForm, interestRate: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Expected Repayment</label>
                            <input
                              type="text"
                              placeholder="DD/MM/YYYY"
                              defaultValue={editForm.expectedRepaymentDate ? formatDateForDisplay(editForm.expectedRepaymentDate) : ''}
                              onBlur={(e) => {
                                const v = e.target.value.trim();
                                if (!v) {
                                  setEditForm({ ...editForm, expectedRepaymentDate: null });
                                } else {
                                  const parsed = parseDDMMYYYY(v);
                                  if (parsed) setEditForm({ ...editForm, expectedRepaymentDate: parsed });
                                }
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Notes</label>
                            <input
                              type="text"
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.completed}
                                onChange={(e) => setEditForm({ ...editForm, completed: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-slate-300">Mark as completed</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Save changes
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              }

              return (
                <Fragment key={transaction.id}>
                  <tr className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${isCompleted ? 'opacity-50' : ''}`}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {transaction.expectedRepaymentDate
                        ? formatDateForDisplay(transaction.expectedRepaymentDate)
                        : <span className="text-gray-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {isCompleted ? (
                        <span className="line-through text-gray-400 dark:text-slate-500">
                          {formatCurrency(breakdown.currentValue, currency)}
                        </span>
                      ) : (
                        formatCurrency(breakdown.currentValue, currency)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleCompleted(transaction.id, !transaction.completed)}
                        title={isCompleted ? 'Mark as active' : 'Mark as completed'}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          isCompleted
                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                        }`}
                      >
                        {isCompleted ? '✓ Done' : '○ Active'}
                      </button>
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
                        onClick={() => setDeleteTarget(transaction)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 bg-gray-50 dark:bg-slate-700/30">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Calculation Breakdown</h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Duration</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {breakdown.duration.years}yrs {breakdown.duration.months}months{' '}
                                {breakdown.duration.days}days
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Original Amount</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete transaction?</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  <span className="font-medium text-gray-700 dark:text-slate-200">
                    {deleteTarget.type === 'lend' ? 'Lend' : 'Borrow'} &mdash; {formatCurrency(deleteTarget.amount, currency)} on {formatDateForDisplay(deleteTarget.date)}
                  </span>
                  {deleteTarget.notes ? <><br /><span className="italic">{deleteTarget.notes}</span></> : null}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
