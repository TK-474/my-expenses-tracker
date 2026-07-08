'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Expense } from '@/types';
import { useExpenses } from '@/context/expenses-context';
import { DATE_RANGE_PRESETS, PAYMENT_METHODS } from '@/lib/constants';
import { resolvePreset } from '@/utils/dates';
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
import { ExpenseFormDialog } from '@/features/expenses/expense-form-dialog';
import { DeleteExpenseDialog } from '@/features/expenses/delete-expense-dialog';
import { ExpenseList } from '@/features/expenses/expense-list';

const PRESETS = DATE_RANGE_PRESETS.filter(p => p.value !== 'custom');

export default function ExpensesPage() {
  const { hydrated, expenses, categories, settings } = useExpenses();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const filtered = useMemo(() => {
    const range = rangeFilter === 'all' ? null : resolvePreset(rangeFilter);
    const query = search.trim().toLowerCase();
    return expenses.filter(expense => {
      if (categoryFilter !== 'all' && expense.category !== categoryFilter)
        return false;
      if (methodFilter !== 'all' && expense.paymentMethod !== methodFilter)
        return false;
      if (range) {
        const date = new Date(expense.date);
        if (date < range.start || date > range.end) return false;
      }
      if (
        query &&
        !expense.description.toLowerCase().includes(query) &&
        !(expense.notes ?? '').toLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [expenses, search, categoryFilter, rangeFilter, methodFilter]);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const isFiltering =
    search.trim() !== '' ||
    categoryFilter !== 'all' ||
    rangeFilter !== 'all' ||
    methodFilter !== 'all';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">The book of record</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Expenses
          </h1>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus /> New entry
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.name}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rangeFilter} onValueChange={setRangeFilter}>
          <SelectTrigger className="w-full sm:w-40">
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
          <SelectTrigger className="w-full sm:w-40">
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
                  : 'Your ledger is empty. Record your first expense to begin.'}
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
              <ExpenseList
                expenses={filtered}
                categories={categories}
                currency={settings.currency}
                onEdit={expense => { setEditing(expense); setFormOpen(true); }}
                onDelete={setDeleting}
              />
              <div className="mt-2 flex items-baseline border-t-2 border-double pt-3">
                <span className="eyebrow">
                  {isFiltering ? 'Filtered total' : 'Total'} · {filtered.length}{' '}
                  {filtered.length === 1 ? 'entry' : 'entries'}
                </span>
                <span className="leader-dots" aria-hidden />
                <span className="tabular text-lg font-semibold">
                  {formatCurrency(total, settings.currency)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editing}
      />
      <DeleteExpenseDialog expense={deleting} onOpenChange={() => setDeleting(null)} />
    </div>
  );
}
