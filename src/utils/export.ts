import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import type { Client, Transaction } from '../types';
import { calculateCurrentValue, calculateTotalBalance } from './calculator';
import { getCurrencySymbol } from './currency';
import { formatDateForDisplay } from './dateUtils';

/**
 * Export transactions and calculations to PDF
 */
export function exportToPDF(
  client: Client,
  transactions: Transaction[],
  asOfDate: Date
): void {
  const doc = new jsPDF();
  const currencySymbol = getCurrencySymbol(client.currency);

  // Header
  doc.setFontSize(18);
  doc.text('Interest Calculator Report', 14, 20);

  // Client Info
  doc.setFontSize(12);
  doc.text(`Client: ${client.name}`, 14, 30);
  doc.text(`Client ID: ${client.id}`, 14, 37);
  doc.text(`Currency: ${client.currency}`, 14, 44);
  doc.text(`As of Date: ${formatDateForDisplay(asOfDate)}`, 14, 51);

  // Summary
  const { totalLoans, totalRepayments, netBalance } = calculateTotalBalance(
    transactions,
    asOfDate
  );

  doc.setFontSize(14);
  doc.text('Summary', 14, 62);
  doc.setFontSize(11);
  doc.text(`Total Loans (Current Value): ${currencySymbol}${totalLoans.toFixed(2)}`, 14, 69);
  doc.text(`Total Repayments (Current Value): ${currencySymbol}${totalRepayments.toFixed(2)}`, 14, 76);
  doc.text(`Net Outstanding Balance: ${currencySymbol}${netBalance.toFixed(2)}`, 14, 83);

  // Transactions Table
  const tableData = transactions.map((transaction) => {
    const breakdown = calculateCurrentValue(transaction, asOfDate);
    return [
      formatDateForDisplay(transaction.date),
      transaction.type === 'loan' ? 'Loan' : 'Repayment',
      `${currencySymbol}${transaction.amount.toFixed(2)}`,
      `${transaction.interestRate}%`,
      transaction.notes || '-',
      `${currencySymbol}${breakdown.currentValue.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    head: [['Date', 'Type', 'Amount', 'Rate', 'Notes', 'Current Value']],
    body: tableData,
    startY: 92,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Save the PDF
  doc.save(
    `interest-calculator-${client.id}-${asOfDate.getFullYear()}-${String(asOfDate.getMonth() + 1).padStart(2, '0')}-${String(asOfDate.getDate()).padStart(2, '0')}.pdf`
  );
}

/**
 * Export transactions and calculations to CSV
 */
export function exportToCSV(
  client: Client,
  transactions: Transaction[],
  asOfDate: Date
): void {
  const { totalLoans, totalRepayments, netBalance } = calculateTotalBalance(
    transactions,
    asOfDate
  );
  const currencySymbol = getCurrencySymbol(client.currency);

  // Prepare data for CSV
  const csvData = transactions.map((transaction) => {
    const breakdown = calculateCurrentValue(transaction, asOfDate);
    return {
      Date: formatDateForDisplay(transaction.date),
      Type: transaction.type === 'loan' ? 'Loan' : 'Repayment',
      Amount: transaction.amount.toFixed(2),
      'Interest Rate (%)': transaction.interestRate,
      Notes: transaction.notes || '',
      Duration: `${breakdown.duration.years}y ${breakdown.duration.months}m ${breakdown.duration.days}d`,
      'Years Interest': breakdown.yearsInterest.toFixed(2),
      'Months Interest': breakdown.monthsInterest.toFixed(2),
      'Days Interest': breakdown.daysInterest.toFixed(2),
      'Current Value': breakdown.currentValue.toFixed(2),
    };
  });

  // Add summary rows
  const summaryData = [
    {},
    {
      Date: 'SUMMARY',
      Type: `Currency: ${client.currency} (${currencySymbol})`,
      Amount: '',
      'Interest Rate (%)': '',
      Notes: '',
      Duration: '',
      'Years Interest': '',
      'Months Interest': '',
      'Days Interest': '',
      'Current Value': '',
    },
    {
      Date: 'Total Loans',
      Type: '',
      Amount: '',
      'Interest Rate (%)': '',
      Notes: '',
      Duration: '',
      'Years Interest': '',
      'Months Interest': '',
      'Days Interest': '',
      'Current Value': totalLoans.toFixed(2),
    },
    {
      Date: 'Total Repayments',
      Type: '',
      Amount: '',
      'Interest Rate (%)': '',
      Notes: '',
      Duration: '',
      'Years Interest': '',
      'Months Interest': '',
      'Days Interest': '',
      'Current Value': totalRepayments.toFixed(2),
    },
    {
      Date: 'Net Outstanding Balance',
      Type: '',
      Amount: '',
      'Interest Rate (%)': '',
      Notes: '',
      Duration: '',
      'Years Interest': '',
      'Months Interest': '',
      'Days Interest': '',
      'Current Value': netBalance.toFixed(2),
    },
  ];

  const allData = [...csvData, ...summaryData];

  // Convert to CSV
  const csv = Papa.unparse(allData);

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `interest-calculator-${client.id}-${asOfDate.getFullYear()}-${String(asOfDate.getMonth() + 1).padStart(2, '0')}-${String(asOfDate.getDate()).padStart(2, '0')}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Import transactions from CSV file
 */
export function importFromCSV(
  file: File,
  onSuccess: (transactions: Transaction[]) => void,
  onError: (error: string) => void
): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        const transactions: Transaction[] = (results.data as Record<string, string>[]).map((row) => {
          // Parse date in multiple formats
          let date: Date;
          const dateStr = row.Date || row.date;
          
          if (!dateStr) {
            throw new Error('Date column is required');
          }

          // Try DD/MM/YYYY format first
          const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (ddmmyyyyMatch) {
            const day = parseInt(ddmmyyyyMatch[1], 10);
            const month = parseInt(ddmmyyyyMatch[2], 10);
            const year = parseInt(ddmmyyyyMatch[3], 10);
            date = new Date(year, month - 1, day);
          } else {
            // Try parsing as ISO or other formats
            date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              throw new Error(`Invalid date format: ${dateStr}`);
            }
          }

          const type = (row.Type || row.type || '').toLowerCase();
          if (type !== 'loan' && type !== 'repayment') {
            throw new Error(`Invalid type: ${type}. Must be "Loan" or "Repayment"`);
          }

          const amount = parseFloat(row.Amount || row.amount || '0');
          if (isNaN(amount) || amount <= 0) {
            throw new Error(`Invalid amount: ${row.Amount || row.amount}`);
          }

          const interestRate = parseFloat(row['Interest Rate (%)'] || row['Interest Rate'] || row.interestRate || '2');
          if (isNaN(interestRate) || interestRate < 0) {
            throw new Error(`Invalid interest rate: ${row['Interest Rate (%)']}`);
          }

          return {
            id: crypto.randomUUID(),
            date,
            amount,
            interestRate,
            type: type as 'loan' | 'repayment',
            notes: row.Notes || row.notes || '',
          };
        });

        onSuccess(transactions);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to parse CSV file');
      }
    },
    error: (error) => {
      onError(`Error reading file: ${error.message}`);
    },
  });
}
