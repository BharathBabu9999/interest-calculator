/**
 * Currency formatting utilities
 */

const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency;
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const formatted = Math.abs(amount).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}
