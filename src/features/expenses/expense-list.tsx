'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Expense, Category } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  onSelect: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

/** Ledger-style entry list: date, description, leader dots, amount */
export function ExpenseList({
  expenses,
  categories,
  currency,
  onSelect,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const categoryByName = new Map(categories.map(c => [c.name, c]));

  return (
    <ul className="divide-y divide-border/70">
      {expenses.map((expense, i) => {
        const category = categoryByName.get(expense.category);
        return (
          <li
            key={expense.id}
            role="button"
            tabIndex={0}
            aria-label={`View ${expense.description}`}
            onClick={() => onSelect(expense)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(expense);
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
              {category?.icon ?? '📦'}
            </span>

            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">
                {expense.description}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular">
                  {formatDate(new Date(expense.date))}
                </span>
                <Badge
                  variant="outline"
                  className="hidden px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
                >
                  {expense.category}
                </Badge>
                {expense.paymentMethod && (
                  <span className="hidden sm:inline">
                    <span className="capitalize">{expense.paymentMethod}</span>
                    {expense.bank && <> · {expense.bank}</>}
                  </span>
                )}
              </p>
            </div>

            <span className="leader-dots" aria-hidden />

            <span className="tabular shrink-0 font-medium">
              {formatCurrency(expense.amount, currency)}
            </span>

            <span className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${expense.description}`}
                onClick={e => {
                  e.stopPropagation();
                  onEdit(expense);
                }}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${expense.description}`}
                onClick={e => {
                  e.stopPropagation();
                  onDelete(expense);
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
