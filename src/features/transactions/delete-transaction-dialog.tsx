'use client';

import { Transaction } from '@/types';
import { useTransactions } from '@/context/transactions-context';
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

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({
  transaction,
  onOpenChange,
}: DeleteTransactionDialogProps) {
  const { deleteTransaction, settings } = useTransactions();

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Strike this entry?
          </DialogTitle>
          <DialogDescription>
            {transaction && (
              <>
                &ldquo;{transaction.description}&rdquo; for{' '}
                <span className="tabular">
                  {formatCurrency(transaction.amount, settings.currency)}
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
              if (transaction) {
                await deleteTransaction(transaction.id).catch(console.error);
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
