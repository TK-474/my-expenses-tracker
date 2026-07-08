'use client';

import { Expense } from '@/types';
import { useExpenses } from '@/context/expenses-context';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteExpenseDialog({
  expense,
  onOpenChange,
}: DeleteExpenseDialogProps) {
  const { deleteExpense, settings } = useExpenses();

  return (
    <Dialog open={!!expense} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Strike this entry?
          </DialogTitle>
          <DialogDescription>
            {expense && (
              <>
                &ldquo;{expense.description}&rdquo; for{' '}
                <span className="tabular">
                  {formatCurrency(expense.amount, settings.currency)}
                </span>{' '}
                will be removed from your ledger. This cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (expense) {
                await deleteExpense(expense.id).catch(console.error);
              }
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
