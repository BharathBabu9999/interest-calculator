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
  const isWholeNumber = amount === Math.round(amount);
  return isWholeNumber ? `${symbol}${amount.toFixed(0)}` : `${symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}
