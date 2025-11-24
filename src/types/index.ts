export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  interestRate: number; // percentage per month (e.g., 2 for 2%)
  type: 'loan' | 'repayment';
  notes: string;
}

export interface Client {
  name: string;
  id: string;
  currency: string;
}

export interface CalculationBreakdown {
  originalAmount: number;
  duration: {
    years: number;
    months: number;
    days: number;
  };
  yearsInterest: number;
  monthsInterest: number;
  daysInterest: number;
  currentValue: number;
  compoundingSteps: CompoundingStep[];
}

export interface CompoundingStep {
  year: number;
  date: Date;
  principalBefore: number;
  interest: number;
  principalAfter: number;
}
