'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { useExpenses } from '@/context/expenses-context';
import { PAYMENT_METHODS, CURRENCIES } from '@/lib/constants';
import { toInputDate, fromInputDate } from '@/utils/dates';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Fields that can pre-fill a new entry (e.g. logging a subscription payment) */
export type ExpenseDefaults = Partial<
  Pick<Expense, 'amount' | 'description' | 'category' | 'paymentMethod' | 'bank' | 'notes'>
>;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this expense instead of creating one */
  expense?: Expense | null;
  /** Pre-fill values for a new entry; ignored when editing */
  defaults?: ExpenseDefaults;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  defaults,
}: ExpenseFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {expense ? 'Edit entry' : 'New entry'}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? 'Amend this line in your ledger.'
              : 'Record a new line in your ledger.'}
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmounts DialogContent children when closed, so the form
            state below initializes fresh on every open */}
        <ExpenseForm
          key={expense?.id ?? 'new'}
          expense={expense}
          defaults={defaults}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FormState {
  amount: string;
  description: string;
  category: string;
  date: string;
  paymentMethod: string;
  bank: string;
  notes: string;
}

function ExpenseForm({
  expense,
  defaults,
  onOpenChange,
}: {
  expense?: Expense | null;
  defaults?: ExpenseDefaults;
  onOpenChange: (open: boolean) => void;
}) {
  const { categories, settings, addExpense, updateExpense } = useExpenses();
  const [form, setForm] = useState<FormState>(() =>
    expense
      ? {
          amount: String(expense.amount),
          description: expense.description,
          category: expense.category,
          date: toInputDate(new Date(expense.date)),
          paymentMethod: expense.paymentMethod ?? 'card',
          bank: expense.bank ?? '',
          notes: expense.notes ?? '',
        }
      : {
          amount: defaults?.amount != null ? String(defaults.amount) : '',
          description: defaults?.description ?? '',
          category: defaults?.category ?? categories[0]?.name ?? '',
          date: toInputDate(new Date()),
          paymentMethod: defaults?.paymentMethod ?? 'card',
          bank: defaults?.bank ?? '',
          notes: defaults?.notes ?? '',
        }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currencySymbol =
    CURRENCIES.find(c => c.value === settings.currency)?.symbol ?? '$';

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      nextErrors.amount = 'Enter an amount greater than zero';
    }
    if (!form.description.trim()) {
      nextErrors.description = 'A description is required';
    }
    if (!form.category) {
      nextErrors.category = 'Pick a category';
    }
    if (!form.date) {
      nextErrors.date = 'Pick a date';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      amount,
      description: form.description.trim(),
      category: form.category,
      date: fromInputDate(form.date),
      paymentMethod: form.paymentMethod as Expense['paymentMethod'],
      // Bank only applies to card and digital wallet payments; cleared if the method changed
      bank:
        form.paymentMethod === 'card' || form.paymentMethod === 'digital'
          ? form.bank.trim() || undefined
          : undefined,
      notes: form.notes.trim() || undefined,
    };

    setSaving(true);
    setSubmitError('');
    try {
      if (expense) {
        await updateExpense({ id: expense.id, ...input });
      } else {
        await addExpense(input);
      }
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save the entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currencySymbol}
            </span>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7 tabular"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              aria-invalid={!!errors.amount}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Weekly groceries"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={value => set('category', value)}
          >
            <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Payment method</Label>
          <Select
            value={form.paymentMethod}
            onValueChange={value => set('paymentMethod', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(form.paymentMethod === 'card' || form.paymentMethod === 'digital') && (
        <div className="space-y-1.5">
          <Label htmlFor="bank">
            {form.paymentMethod === 'card' ? 'Which bank?' : 'Which bank / wallet?'}
          </Label>
          <Input
            id="bank"
            placeholder={
              form.paymentMethod === 'card'
                ? 'e.g. HBL, Meezan, UBL'
                : 'e.g. JazzCash, Easypaisa, SadaPay'
            }
            value={form.bank}
            onChange={e => set('bank', e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">
          Notes <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Anything worth remembering"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      {submitError && <p className="text-xs text-destructive">{submitError}</p>}

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : expense ? 'Save changes' : 'Add to ledger'}
        </Button>
      </DialogFooter>
    </form>
  );
}
