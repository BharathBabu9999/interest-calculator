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
 * Calculate months between two dates
 * For same day of month (e.g., 19th to 19th), returns whole months
 * Otherwise calculates fractional months
 */
function getMonthsBetween(fromDate: Date, toDate: Date): number {
  const yearDiff = toDate.getFullYear() - fromDate.getFullYear();
  const monthDiff = toDate.getMonth() - fromDate.getMonth();
  const dayDiff = toDate.getDate() - fromDate.getDate();
  
  let months = yearDiff * 12 + monthDiff;
  
  // If same day of month (e.g., anniversary dates), return exact whole months
  if (dayDiff === 0) {
    return months;
  }
  
  // Add fractional month for day difference
  if (dayDiff > 0) {
    const daysInFromMonth = getExactDaysInMonth(fromDate);
    months += dayDiff / daysInFromMonth;
  } else if (dayDiff < 0) {
    months -= 1;
    const prevMonth = new Date(toDate.getFullYear(), toDate.getMonth() - 1, 1);
    const daysInPrevMonth = getExactDaysInMonth(prevMonth);
    months += (daysInPrevMonth + dayDiff) / daysInPrevMonth;
  }
  
  return months;
}

/**
 * Calculate total outstanding balance (loans - repayments)
 */
export function calculateTotalBalance(
  transactions: Transaction[],
  asOfDate: Date
): {
  totalLoans: number;
  totalRepayments: number;
  netBalance: number;
} {
  let totalLoans = 0;
  let totalRepayments = 0;

  transactions.forEach((transaction) => {
    const breakdown = calculateCurrentValue(transaction, asOfDate);
    
    if (transaction.type === 'loan') {
      totalLoans += breakdown.currentValue;
    } else {
      totalRepayments += breakdown.currentValue;
    }
  });

  return {
    totalLoans,
    totalRepayments,
    netBalance: totalLoans - totalRepayments,
  };
}
