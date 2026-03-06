import { formatCurrency } from "../utils/currency";

interface DailyInterestCardProps {
  lent: number;
  borrowed: number;
  net: number;
  currency: string;
  /** Optional badge shown next to the heading (used in multi-currency contexts). */
  currencyLabel?: boolean;
}

export default function DailyInterestCard({
  lent,
  borrowed,
  net,
  currency,
  currencyLabel = false,
}: DailyInterestCardProps) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">
          Approximate Daily Interest
        </h3>
        {currencyLabel && (
          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full px-2 py-0.5">
            {currency}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Lent (daily)</p>
          <p className="text-xl font-bold text-green-600">
            ≈ {formatCurrency(lent, currency)}
            <span className="text-sm font-normal text-gray-400 dark:text-slate-500"> / day</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Borrowed (daily)</p>
          <p className="text-xl font-bold text-amber-600">
            ≈ {formatCurrency(borrowed, currency)}
            <span className="text-sm font-normal text-gray-400 dark:text-slate-500"> / day</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Net (daily)</p>
          <p className={`text-xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
            ≈ {formatCurrency(net, currency)}
            <span className="text-sm font-normal text-gray-400 dark:text-slate-500"> / day</span>
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
        Computed as (value at +30 days − current value) ÷ 30, across all active transactions.
      </p>
    </div>
  );
}
