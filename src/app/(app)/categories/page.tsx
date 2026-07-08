'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Category } from '@/types';
import { useExpenses } from '@/context/expenses-context';
import { startOfMonth, endOfMonth } from '@/utils/dates';
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
  const { hydrated, expenses, categories, settings, deleteCategory } =
    useExpenses();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // This month's spend and all-time entry count per category name
  const stats = useMemo(() => {
    const monthStart = startOfMonth();
    const monthEnd = endOfMonth();
    const map = new Map<string, { monthSpend: number; count: number }>();
    for (const expense of expenses) {
      const entry = map.get(expense.category) ?? { monthSpend: 0, count: 0 };
      entry.count += 1;
      const date = new Date(expense.date);
      if (date >= monthStart && date <= monthEnd) {
        entry.monthSpend += expense.amount;
      }
      map.set(expense.category, entry);
    }
    return map;
  }, [expenses]);

  const deletingCount = deleting ? stats.get(deleting.name)?.count ?? 0 : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Columns of the ledger</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Categories
          </h1>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus /> New category
        </Button>
      </div>

      {!hydrated ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Opening the ledger…
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => {
            const stat = stats.get(category.name);
            const monthSpend = stat?.monthSpend ?? 0;
            const overBudget =
              category.budget != null && monthSpend > category.budget;
            return (
              <Card
                key={category.id}
                className="rise-in group relative overflow-hidden"
                style={{ '--stagger': i } as React.CSSProperties}
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
                        {category.icon ?? '📦'}
                      </span>
                      <div>
                        <p className="font-display text-lg font-medium leading-tight">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat?.count ?? 0}{' '}
                          {(stat?.count ?? 0) === 1 ? 'entry' : 'entries'} all
                          time
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
                      This month
                    </span>
                    <span className="leader-dots" aria-hidden />
                    <span className="tabular font-medium">
                      {formatCurrency(monthSpend, settings.currency)}
                    </span>
                  </div>

                  {category.budget != null ? (
                    <div className="space-y-1.5">
                      <BudgetBar spent={monthSpend} budget={category.budget} />
                      <p className="text-xs text-muted-foreground">
                        {overBudget ? (
                          <span className="font-medium text-terracotta">
                            {formatCurrency(monthSpend - category.budget, settings.currency)}{' '}
                            over the{' '}
                            {formatCurrency(category.budget, settings.currency)}{' '}
                            budget
                          </span>
                        ) : (
                          <>
                            {formatCurrency(category.budget - monthSpend, settings.currency)}{' '}
                            left of{' '}
                            {formatCurrency(category.budget, settings.currency)}
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/70">
                      No budget set
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
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
                      {deletingCount === 1 ? 'entry keeps' : 'entries keep'}{' '}
                      the label but will no longer match a category.
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
