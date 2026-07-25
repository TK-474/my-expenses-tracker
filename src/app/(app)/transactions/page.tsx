'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Transaction } from '@/types';
import { useTransactions } from '@/context/transactions-context';
import { DATE_RANGE_PRESETS, PAYMENT_METHODS } from '@/lib/constants';
import { resolvePreset } from '@/utils/dates';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionFormDialog } from '@/features/transactions/transaction-form-dialog';
import { TransactionDetailDialog } from '@/features/transactions/transaction-detail-dialog';
import { DeleteTransactionDialog } from '@/features/transactions/delete-transaction-dialog';
import { TransactionList } from '@/features/transactions/transaction-list';

const PRESETS = DATE_RANGE_PRESETS.filter(p => p.value !== 'custom');

export default function TransactionsPage() {
  const { hydrated, transactions, categories, settings } = useTransactions();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [viewing, setViewing] = useState<Transaction | null>(null);

  // Category dropdown narrows to the selected type
  const categoryOptions =
    typeFilter === 'all'
      ? categories
      : categories.filter(c => c.type === typeFilter);

  const filtered = useMemo(() => {
    const range = rangeFilter === 'all' ? null : resolvePreset(rangeFilter);
    const query = search.trim().toLowerCase();
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) return false;
      if (range) {
        const date = new Date(t.date);
        if (date < range.start || date > range.end) return false;
      }
      if (
        query &&
        !t.description.toLowerCase().includes(query) &&
        !(t.notes ?? '').toLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter, rangeFilter, methodFilter]);

  const { incomeSum, expenseSum } = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;
    for (const t of filtered) {
      if (t.type === 'income') incomeSum += t.amount;
      else expenseSum += t.amount;
    }
    return { incomeSum, expenseSum };
  }, [filtered]);

  const isFiltering =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    rangeFilter !== 'all' ||
    methodFilter !== 'all';

  // Footer figure: net when mixed, otherwise the single-type total
  const hasIncome = incomeSum > 0;
  const hasExpense = expenseSum > 0;
  const footer =
    hasIncome && hasExpense
      ? { label: 'Net', value: incomeSum - expenseSum, signed: true }
      : hasIncome
        ? { label: 'Income', value: incomeSum, signed: false }
        : { label: 'Total', value: expenseSum, signed: false };

  function handleTypeFilter(value: string) {
    setTypeFilter(value);
    setCategoryFilter('all');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">The book of record</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Transactions
          </h1>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus /> New entry
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map(c => (
              <SelectItem key={c.id} value={c.name}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rangeFilter} onValueChange={setRangeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            {PRESETS.map(p => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {PAYMENT_METHODS.map(m => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          {!hydrated ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Opening the ledger…
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-xl">
                {isFiltering ? 'Nothing matches' : 'A blank page'}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                {isFiltering
                  ? 'Try loosening the filters above.'
                  : 'Your ledger is empty. Record your first entry to begin.'}
              </p>
              {!isFiltering && (
                <Button
                  className="mt-4"
                  onClick={() => { setEditing(null); setFormOpen(true); }}
                >
                  <Plus /> First entry
                </Button>
              )}
            </div>
          ) : (
            <>
              <TransactionList
                transactions={filtered}
                categories={categories}
                currency={settings.currency}
                onSelect={setViewing}
                onEdit={t => { setEditing(t); setFormOpen(true); }}
                onDelete={setDeleting}
              />
              <div className="mt-2 flex items-baseline border-t-2 border-double pt-3">
                <span className="eyebrow">
                  {footer.label} · {filtered.length}{' '}
                  {filtered.length === 1 ? 'entry' : 'entries'}
                </span>
                <span className="leader-dots" aria-hidden />
                <span
                  className={cn(
                    'tabular text-lg font-semibold',
                    footer.signed && footer.value >= 0 && 'text-primary'
                  )}
                >
                  {footer.signed && footer.value >= 0 ? '+' : ''}
                  {formatCurrency(footer.value, settings.currency)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <TransactionDetailDialog
        transaction={viewing}
        categories={categories}
        currency={settings.currency}
        onOpenChange={open => { if (!open) setViewing(null); }}
        onEdit={t => {
          setViewing(null);
          setEditing(t);
          setFormOpen(true);
        }}
        onDelete={t => {
          setViewing(null);
          setDeleting(t);
        }}
      />
      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editing}
      />
      <DeleteTransactionDialog
        transaction={deleting}
        onOpenChange={() => setDeleting(null)}
      />
    </div>
  );
}
