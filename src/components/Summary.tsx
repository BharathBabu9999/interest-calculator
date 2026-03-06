import type { Transaction } from '../types';
import { calculateTotalBalance, calculateDailyInterest } from '../utils/calculator';
import { formatCurrency } from '../utils/currency';
import DailyInterestCard from './DailyInterestCard';

interface SummaryProps {
  transactions: Transaction[];
  asOfDate: Date;
  currency: string;
  showDailyValue?: boolean;
}

export default function Summary({ transactions, asOfDate, currency, showDailyValue = false }: SummaryProps) {
  const { totalLent, totalBorrowed, netBalance, principalLent, principalBorrowed } = calculateTotalBalance(
    transactions,
    asOfDate
  );

  const { lent: dailyLent, borrowed: dailyBorrowed, net: dailyNet } = calculateDailyInterest(transactions, asOfDate);

  return (
    <div className="space-y-4 mb-6">
      {showDailyValue && (
        <DailyInterestCard lent={dailyLent} borrowed={dailyBorrowed} net={dailyNet} currency={currency} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Total Lent (Current Value)</h3>
        <p className="text-3xl font-bold text-green-600">{formatCurrency(Math.round(totalLent), currency)}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">(principal: {formatCurrency(Math.round(principalLent), currency)})</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
          Total Borrowed (Current Value)
        </h3>
        <p className="text-3xl font-bold text-amber-600">{formatCurrency(Math.round(totalBorrowed), currency)}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">(principal: {formatCurrency(Math.round(principalBorrowed), currency)})</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Net Outstanding Balance</h3>
        <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(Math.round(netBalance), currency)}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">(principal: {formatCurrency(Math.round(principalLent - principalBorrowed), currency)})</p>
      </div>
    </div>
    </div>
  );
}
