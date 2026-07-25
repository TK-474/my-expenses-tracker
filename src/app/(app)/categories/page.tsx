'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Category, TransactionType } from '@/types';
import { useTransactions } from '@/context/transactions-context';
import { startOfMonth, endOfMonth } from '@/utils/dates';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryFormDialog } from '@/features/categories/category-form-dialog';
import { BudgetBar } from '@/features/categories/budget-bar';

export default function CategoriesPage() {
  const { hydrated, transactions, categories, settings, deleteCategory } =
    useTransactions();

  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // This month's total and all-time entry count per category name
  const stats = useMemo(() => {
    const monthStart = startOfMonth();
    const monthEnd = endOfMonth();
    const map = new Map<string, { monthTotal: number; count: number }>();
    for (const t of transactions) {
      const entry = map.get(t.category) ?? { monthTotal: 0, count: 0 };
      entry.count += 1;
      const date = new Date(t.date);
      if (date >= monthStart && date <= monthEnd) {
        entry.monthTotal += t.amount;
      }
      map.set(t.category, entry);
    }
    return map;
  }, [transactions]);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  const deletingCount = deleting ? stats.get(deleting.name)?.count ?? 0 : 0;

  function openNew(type: TransactionType) {
    setEditing(null);
    setFormType(type);
    setFormOpen(true);
  }

  const renderCard = (category: Category) => {
    const stat = stats.get(category.name);
    const monthTotal = stat?.monthTotal ?? 0;
    const isIncome = category.type === 'income';
    const overBudget =
      !isIncome && category.budget != null && monthTotal > category.budget;
    return (
      <Card
        key={category.id}
        className="rise-in group relative overflow-hidden"
      >
        <span
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: category.color ?? '#B4B4B4' }}
          aria-hidden
        />
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-9 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: `${category.color ?? '#B4B4B4'}33` }}
                aria-hidden
              >
                {category.icon ?? (isIncome ? '💰' : '📦')}
              </span>
              <div>
                <p className="font-display text-lg font-medium leading-tight">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat?.count ?? 0}{' '}
                  {(stat?.count ?? 0) === 1 ? 'entry' : 'entries'} all time
                </p>
              </div>
            </div>
            <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${category.name}`}
                onClick={() => { setEditing(category); setFormOpen(true); }}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${category.name}`}
                onClick={() => setDeleting(category)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-baseline">
            <span className="text-xs text-muted-foreground">
              {isIncome ? 'Received this month' : 'This month'}
            </span>
            <span className="leader-dots" aria-hidden />
            <span className={cn('tabular font-medium', isIncome && 'text-primary')}>
              {isIncome ? '+' : ''}
              {formatCurrency(monthTotal, settings.currency)}
            </span>
          </div>

          {!isIncome &&
            (category.budget != null ? (
              <div className="space-y-1.5">
                <BudgetBar spent={monthTotal} budget={category.budget} />
                <p className="text-xs text-muted-foreground">
                  {overBudget ? (
                    <span className="font-medium text-terracotta">
                      {formatCurrency(monthTotal - category.budget, settings.currency)}{' '}
                      over the{' '}
                      {formatCurrency(category.budget, settings.currency)} budget
                    </span>
                  ) : (
                    <>
                      {formatCurrency(category.budget - monthTotal, settings.currency)}{' '}
                      left of {formatCurrency(category.budget, settings.currency)}
                    </>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/70">No budget set</p>
            ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Columns of the ledger</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Categories
          </h1>
        </div>
        <Button onClick={() => openNew('expense')}>
          <Plus /> New category
        </Button>
      </div>

      {!hydrated ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Opening the ledger…
        </p>
      ) : (
        <div className="space-y-8">
          <section>
            <p className="eyebrow mb-3">Expense categories · {expenseCategories.length}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map(renderCard)}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="eyebrow">Income sources · {incomeCategories.length}</p>
              <Button variant="ghost" size="sm" onClick={() => openNew('income')}>
                <Plus className="size-3.5" /> New source
              </Button>
            </div>
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No income sources yet. Add one to categorise money coming in.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {incomeCategories.map(renderCard)}
              </div>
            )}
          </section>
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        defaultType={formType}
      />

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Remove this column?
            </DialogTitle>
            <DialogDescription>
              {deleting && (
                <>
                  &ldquo;{deleting.name}&rdquo; will be deleted.
                  {deletingCount > 0 && (
                    <>
                      {' '}
                      Its {deletingCount}{' '}
                      {deletingCount === 1 ? 'entry keeps' : 'entries keep'} the
                      label but will no longer match a category.
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleting) {
                  await deleteCategory(deleting.id).catch(console.error);
                }
                setDeleting(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
