import type { Transaction } from '../types';
import { calculateTotalBalance } from '../utils/calculator';
import { formatCurrency } from '../utils/currency';

interface SummaryProps {
  transactions: Transaction[];
  asOfDate: Date;
  currency: string;
}

export default function Summary({ transactions, asOfDate, currency }: SummaryProps) {
  const { totalLoans, totalRepayments, netBalance } = calculateTotalBalance(
    transactions,
    asOfDate
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Loans (Current Value)</h3>
        <p className="text-3xl font-bold text-green-600">{formatCurrency(Math.round(totalLoans), currency)}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Total Repayments (Current Value)
        </h3>
        <p className="text-3xl font-bold text-red-600">{formatCurrency(Math.round(totalRepayments), currency)}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Net Outstanding Balance</h3>
        <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
          {formatCurrency(Math.round(netBalance), currency)}
        </p>
      </div>
    </div>
  );
}
