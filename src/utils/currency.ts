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
  // Always show 2 decimal places for better precision
  return `${symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}
