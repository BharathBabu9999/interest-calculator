import type { Transaction, CalculationBreakdown, CompoundingStep } from '../types';
import { getYearsMonthsDays, getAnniversaryDates, getExactDaysInMonth } from './dateUtils';

/**
 * Calculate the current value of a transaction as of a specific date
 * Uses exact day-counting and annual compounding on each 1-year anniversary
 */
export function calculateCurrentValue(
  transaction: Transaction,
  asOfDate: Date
): CalculationBreakdown {
  const { date: transactionDate, amount, interestRate } = transaction;
  
  // If transaction is after asOfDate, current value is 0
  if (transactionDate > asOfDate) {
    return {
      originalAmount: amount,
      duration: { years: 0, months: 0, days: 0 },
      yearsInterest: 0,
      monthsInterest: 0,
      daysInterest: 0,
      currentValue: 0,
      compoundingSteps: [],
    };
  }

  const duration = getYearsMonthsDays(transactionDate, asOfDate);
  const compoundingSteps: CompoundingStep[] = [];
  
  // Get all anniversary dates (1-year intervals) for compounding
  const anniversaryDates = getAnniversaryDates(transactionDate, asOfDate);
  
  let principal = amount;
  let totalYearsInterest = 0;

  // Process each year's compounding
  if (anniversaryDates.length > 0) {
    anniversaryDates.forEach((anniversary, index) => {
      // For anniversary dates, always exactly 12 months of interest
      const monthsBetween = 12;
      const interest = principal * (interestRate / 100) * monthsBetween;
      
      totalYearsInterest += interest;
      
      compoundingSteps.push({
        year: transactionDate.getFullYear() + index + 1,
        date: anniversary,
        principalBefore: principal,
        interest: interest,
        principalAfter: principal + interest,
      });
      
      principal += interest; // Compound
    });
  }

  // Calculate remaining months after last compounding (or from start if no compounding)
  const lastCompoundDate = anniversaryDates.length > 0 
    ? anniversaryDates[anniversaryDates.length - 1]
    : new Date(transactionDate);
  
  const remainingDuration = getYearsMonthsDays(lastCompoundDate, asOfDate);
  
  // Calculate interest for remaining complete months
  let monthsInterest = 0;
  if (remainingDuration.months > 0) {
    monthsInterest = principal * (interestRate / 100) * remainingDuration.months;
  }

  // Calculate interest for remaining days
  let daysInterest = 0;
  if (remainingDuration.days > 0) {
    // Get the month we're calculating days interest for
    const lastMonthDate = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 1);
    const daysInMonth = getExactDaysInMonth(lastMonthDate);
    const dailyRate = (interestRate / 100) / daysInMonth;
    daysInterest = principal * dailyRate * remainingDuration.days;
  }

  const currentValue = principal + monthsInterest + daysInterest;

  return {
    originalAmount: amount,
    duration,
    yearsInterest: totalYearsInterest,
    monthsInterest,
    daysInterest,
    currentValue,
    compoundingSteps,
  };
}

/**
 * Calculate total outstanding balance (lent - borrowed)
 */
export function calculateTotalBalance(
  transactions: Transaction[],
  asOfDate: Date
): {
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
  principalLent: number;
  principalBorrowed: number;
} {
  let totalLent = 0;
  let totalBorrowed = 0;
  let principalLent = 0;
  let principalBorrowed = 0;

  transactions.forEach((transaction) => {
    if (transaction.completed) return; // skip completed transactions
    const breakdown = calculateCurrentValue(transaction, asOfDate);
    
    if (transaction.type === 'lend') {
      totalLent += breakdown.currentValue;
      principalLent += transaction.amount;
    } else {
      totalBorrowed += breakdown.currentValue;
      principalBorrowed += transaction.amount;
    }
  });

  return {
    totalLent,
    totalBorrowed,
    netBalance: totalLent - totalBorrowed,
    principalLent,
    principalBorrowed,
  };
}

/**
 * Approximate daily interest accrual as of a given date.
 * Computed as (balance at +30 days − balance now) ÷ 30 across all active transactions.
 */
export function calculateDailyInterest(
  transactions: Transaction[],
  asOfDate: Date
): { lent: number; borrowed: number; net: number } {
  const asOfDate30 = new Date(asOfDate);
  asOfDate30.setDate(asOfDate30.getDate() + 30);
  const now = calculateTotalBalance(transactions, asOfDate);
  const future = calculateTotalBalance(transactions, asOfDate30);
  return {
    lent: (future.totalLent - now.totalLent) / 30,
    borrowed: (future.totalBorrowed - now.totalBorrowed) / 30,
    net: (future.netBalance - now.netBalance) / 30,
  };
}
