'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Expense, Category } from '@/types';
import { PAYMENT_METHODS } from '@/lib/constants';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExpenseDetailDialogProps {
  /** The expense to show; null keeps the dialog closed */
  expense: Expense | null;
  categories: Category[];
  currency: string;
  onOpenChange: (open: boolean) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

/** Read-only detail view for a single ledger entry, with edit/delete shortcuts */
export function ExpenseDetailDialog({
  expense,
  categories,
  currency,
  onOpenChange,
  onEdit,
  onDelete,
}: ExpenseDetailDialogProps) {
  const category = expense
    ? categories.find(c => c.name === expense.category)
    : undefined;
  const methodLabel = expense?.paymentMethod
    ? PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.label
    : undefined;

  return (
    <Dialog open={expense != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {expense && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-xl"
                  style={{ backgroundColor: `${category?.color ?? '#B4B4B4'}33` }}
                  aria-hidden
                >
                  {category?.icon ?? '📦'}
                </span>
                <div className="min-w-0">
                  <p className="eyebrow">{expense.category}</p>
                  <DialogTitle className="font-display text-2xl leading-tight">
                    {expense.description}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="sr-only">
                Details for {expense.description} in {expense.category}
              </DialogDescription>
            </DialogHeader>

            <p className="tabular font-display text-4xl font-semibold tracking-tight">
              {formatCurrency(expense.amount, currency)}
            </p>

            <dl className="divide-y divide-border/70 text-sm">
              <div className="flex items-baseline py-2.5">
                <dt className="text-muted-foreground">Date</dt>
                <span className="leader-dots" aria-hidden />
                <dd className="tabular">
                  {formatDate(new Date(expense.date))}
                </dd>
              </div>
              {methodLabel && (
                <div className="flex items-baseline py-2.5">
                  <dt className="text-muted-foreground">Payment</dt>
                  <span className="leader-dots" aria-hidden />
                  <dd className="text-right">
                    {methodLabel}
                    {expense.bank && (
                      <span className="text-muted-foreground"> · {expense.bank}</span>
                    )}
                  </dd>
                </div>
              )}
              <div className="flex items-baseline py-2.5">
                <dt className="text-muted-foreground">Added</dt>
                <span className="leader-dots" aria-hidden />
                <dd>{formatRelativeTime(new Date(expense.createdAt))}</dd>
              </div>
            </dl>

            {expense.notes && (
              <div className="space-y-1.5">
                <p className="eyebrow">Note</p>
                <p className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive sm:mr-auto"
                onClick={() => onDelete(expense)}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
              <Button onClick={() => onEdit(expense)}>
                <Pencil className="size-4" /> Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
