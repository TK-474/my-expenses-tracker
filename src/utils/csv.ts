import { Expense } from '@/types';
import { toInputDate } from './dates';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Bank', 'Notes'];
  const rows = expenses.map(e => [
    toInputDate(new Date(e.date)),
    escapeCsv(e.description),
    escapeCsv(e.category),
    e.amount.toFixed(2),
    e.paymentMethod ?? '',
    escapeCsv(e.bank ?? ''),
    escapeCsv(e.notes ?? ''),
  ]);
  return [header, ...rows].map(row => row.join(',')).join('\n');
}

export function downloadCsv(expenses: Expense[], filename = 'expenses.csv'): void {
  const blob = new Blob([expensesToCsv(expenses)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
