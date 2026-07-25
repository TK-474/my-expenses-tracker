'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Transaction, Category } from '@/types';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onSelect: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

/** Ledger-style entry list: date, description, leader dots, amount */
export function TransactionList({
  transactions,
  categories,
  currency,
  onSelect,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const categoryByName = new Map(categories.map(c => [c.name, c]));

  return (
    <ul className="divide-y divide-border/70">
      {transactions.map((transaction, i) => {
        const category = categoryByName.get(transaction.category);
        const isIncome = transaction.type === 'income';
        return (
          <li
            key={transaction.id}
            role="button"
            tabIndex={0}
            aria-label={`View ${transaction.description}`}
            onClick={() => onSelect(transaction)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(transaction);
              }
            }}
            className="group rise-in -mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
            style={{ '--stagger': Math.min(i, 12) } as React.CSSProperties}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: `${category?.color ?? '#B4B4B4'}33` }}
              aria-hidden
            >
              {category?.icon ?? (isIncome ? '💰' : '📦')}
            </span>

            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">
                {transaction.description}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular">
                  {formatDate(new Date(transaction.date))}
                </span>
                <Badge
                  variant="outline"
                  className="hidden px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
                >
                  {transaction.category}
                </Badge>
                {transaction.paymentMethod && (
                  <span className="hidden sm:inline">
                    <span className="capitalize">{transaction.paymentMethod}</span>
                    {transaction.bank && <> · {transaction.bank}</>}
                  </span>
                )}
              </p>
            </div>

            <span className="leader-dots" aria-hidden />

            <span
              className={cn(
                'tabular shrink-0 font-medium',
                isIncome && 'text-primary'
              )}
            >
              {isIncome ? '+' : ''}
              {formatCurrency(transaction.amount, currency)}
            </span>

            <span className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${transaction.description}`}
                onClick={e => {
                  e.stopPropagation();
                  onEdit(transaction);
                }}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${transaction.description}`}
                onClick={e => {
                  e.stopPropagation();
                  onDelete(transaction);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
