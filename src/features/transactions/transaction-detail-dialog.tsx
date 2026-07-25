'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Transaction, Category } from '@/types';
import { PAYMENT_METHODS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TransactionDetailDialogProps {
  /** The transaction to show; null keeps the dialog closed */
  transaction: Transaction | null;
  categories: Category[];
  currency: string;
  onOpenChange: (open: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

/** Read-only detail view for a single ledger entry, with edit/delete shortcuts */
export function TransactionDetailDialog({
  transaction,
  categories,
  currency,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailDialogProps) {
  const category = transaction
    ? categories.find(c => c.name === transaction.category)
    : undefined;
  const methodLabel = transaction?.paymentMethod
    ? PAYMENT_METHODS.find(m => m.value === transaction.paymentMethod)?.label
    : undefined;
  const isIncome = transaction?.type === 'income';

  return (
    <Dialog open={transaction != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {transaction && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-xl"
                  style={{ backgroundColor: `${category?.color ?? '#B4B4B4'}33` }}
                  aria-hidden
                >
                  {category?.icon ?? (isIncome ? '💰' : '📦')}
                </span>
                <div className="min-w-0">
                  <p className="eyebrow flex items-center gap-2">
                    {transaction.category}
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-1.5 py-0 text-[10px] font-normal capitalize',
                        isIncome && 'border-primary/40 text-primary'
                      )}
                    >
                      {transaction.type}
                    </Badge>
                  </p>
                  <DialogTitle className="font-display text-2xl leading-tight">
                    {transaction.description}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="sr-only">
                Details for {transaction.description} in {transaction.category}
              </DialogDescription>
            </DialogHeader>

            <p
              className={cn(
                'tabular font-display text-4xl font-semibold tracking-tight',
                isIncome && 'text-primary'
              )}
            >
              {isIncome ? '+' : ''}
              {formatCurrency(transaction.amount, currency)}
            </p>

            <dl className="divide-y divide-border/70 text-sm">
              <div className="flex items-baseline py-2.5">
                <dt className="text-muted-foreground">Date</dt>
                <span className="leader-dots" aria-hidden />
                <dd className="tabular">
                  {formatDate(new Date(transaction.date))}
                </dd>
              </div>
              {methodLabel && (
                <div className="flex items-baseline py-2.5">
                  <dt className="text-muted-foreground">
                    {isIncome ? 'Received via' : 'Payment'}
                  </dt>
                  <span className="leader-dots" aria-hidden />
                  <dd className="text-right">
                    {methodLabel}
                    {transaction.bank && (
                      <span className="text-muted-foreground"> · {transaction.bank}</span>
                    )}
                  </dd>
                </div>
              )}
              <div className="flex items-baseline py-2.5">
                <dt className="text-muted-foreground">Added</dt>
                <span className="leader-dots" aria-hidden />
                <dd>{formatRelativeTime(new Date(transaction.createdAt))}</dd>
              </div>
            </dl>

            {transaction.notes && (
              <div className="space-y-1.5">
                <p className="eyebrow">Note</p>
                <p className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {transaction.notes}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive sm:mr-auto"
                onClick={() => onDelete(transaction)}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
              <Button onClick={() => onEdit(transaction)}>
                <Pencil className="size-4" /> Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
