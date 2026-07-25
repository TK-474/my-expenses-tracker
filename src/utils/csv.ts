import { Transaction } from '@/types';
import { toInputDate } from './dates';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Payment Method', 'Bank', 'Notes'];
  const rows = transactions.map(t => [
    toInputDate(new Date(t.date)),
    t.type,
    escapeCsv(t.description),
    escapeCsv(t.category),
    t.amount.toFixed(2),
    t.paymentMethod ?? '',
    escapeCsv(t.bank ?? ''),
    escapeCsv(t.notes ?? ''),
  ]);
  return [header, ...rows].map(row => row.join(',')).join('\n');
}

export function downloadCsv(transactions: Transaction[], filename = 'transactions.csv'): void {
  const blob = new Blob([transactionsToCsv(transactions)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
