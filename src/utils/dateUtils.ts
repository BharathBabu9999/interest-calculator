import { getDaysInMonth, isLeapYear } from 'date-fns';

/**
 * Get the exact number of days in a specific month and year
 */
export function getExactDaysInMonth(date: Date): number {
  return getDaysInMonth(date);
}

/**
 * Check if a year is a leap year
 */
export function isLeapYearCheck(year: number): boolean {
  return isLeapYear(new Date(year, 0, 1));
}

/**
 * Calculate the duration between two dates in years, months, and days
 * Handles February edge cases (Feb 28/29 treated as month-end to month-end)
 */
export function getYearsMonthsDays(
  fromDate: Date,
  toDate: Date
): { years: number; months: number; days: number } {
  let years = toDate.getFullYear() - fromDate.getFullYear();
  let months = toDate.getMonth() - fromDate.getMonth();
  let days = toDate.getDate() - fromDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    // Get days in the previous month
    const prevMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
    days += getExactDaysInMonth(prevMonth);
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Get all anniversary dates (1 year intervals) between two dates (for annual compounding)
 * For a transaction on 21/06/2022, anniversaries are 21/06/2023, 21/06/2024, etc.
 */
export function getAnniversaryDates(fromDate: Date, toDate: Date): Date[] {
  const dates: Date[] = [];
  let yearOffset = 1;
  
  while (true) {
    // Calculate anniversary date by adding yearOffset years
    const anniversary = new Date(
      fromDate.getFullYear() + yearOffset,
      fromDate.getMonth(),
      fromDate.getDate()
    );
    
    // Only include if it's before or equal to toDate
    if (anniversary <= toDate) {
      dates.push(anniversary);
      yearOffset++;
    } else {
      break;
    }
  }

  return dates;
}

/**
 * Format a date as YYYY-MM-DD for input fields
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date as DD/MM/YYYY for display
 */
export function formatDateForDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * Parse a date string from input field (YYYY-MM-DD)
 */
export function parseDateFromInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
