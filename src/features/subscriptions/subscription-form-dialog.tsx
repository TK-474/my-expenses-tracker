'use client';

import { useState } from 'react';
import { Subscription } from '@/types';
import { useTransactions } from '@/context/transactions-context';
import {
  PAYMENT_METHODS,
  CURRENCIES,
  SUBSCRIPTION_CADENCES,
} from '@/lib/constants';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface SubscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this subscription instead of creating one */
  subscription?: Subscription | null;
}

export function SubscriptionFormDialog({
  open,
  onOpenChange,
  subscription,
}: SubscriptionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {subscription ? 'Edit subscription' : 'New subscription'}
          </DialogTitle>
          <DialogDescription>
            {subscription
              ? 'Update the details of this recurring cost.'
              : 'Track a recurring cost. This does not post to your ledger.'}
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmounts children when closed, so form state re-initializes on open */}
        <SubscriptionForm
          key={subscription?.id ?? 'new'}
          subscription={subscription}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FormState {
  name: string;
  amount: string;
  cadence: string;
  billingDay: string;
  billingMonth: string;
  paymentMethod: string;
  bank: string;
}

function SubscriptionForm({
  subscription,
  onOpenChange,
}: {
  subscription?: Subscription | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { settings, addSubscription, updateSubscription } = useTransactions();
  const now = new Date();
  const [form, setForm] = useState<FormState>(() =>
    subscription
      ? {
          name: subscription.name,
          amount: String(subscription.amount),
          cadence: subscription.cadence,
          billingDay: String(subscription.billingDay),
          billingMonth: String(subscription.billingMonth ?? now.getMonth() + 1),
          paymentMethod: subscription.paymentMethod ?? 'card',
          bank: subscription.bank ?? '',
        }
      : {
          name: '',
          amount: '',
          cadence: 'monthly',
          billingDay: String(now.getDate()),
          billingMonth: String(now.getMonth() + 1),
          paymentMethod: 'card',
          bank: '',
        }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currencySymbol =
    CURRENCIES.find(c => c.value === settings.currency)?.symbol ?? '$';
  const isYearly = form.cadence === 'yearly';

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const amount = parseFloat(form.amount);
    const billingDay = parseInt(form.billingDay, 10);
    if (!form.name.trim()) nextErrors.name = 'Give it a name';
    if (!form.amount || isNaN(amount) || amount <= 0) {
      nextErrors.amount = 'Enter an amount greater than zero';
    }
    if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
      nextErrors.billingDay = 'Pick a day between 1 and 31';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      name: form.name.trim(),
      amount,
      cadence: form.cadence as Subscription['cadence'],
      billingDay,
      billingMonth: isYearly ? parseInt(form.billingMonth, 10) : undefined,
      paymentMethod: form.paymentMethod as Subscription['paymentMethod'],
      bank:
        form.paymentMethod === 'card' || form.paymentMethod === 'digital'
          ? form.bank.trim() || undefined
          : undefined,
    };

    setSaving(true);
    setSubmitError('');
    try {
      if (subscription) {
        await updateSubscription({ id: subscription.id, ...input });
      } else {
        await addSubscription(input);
      }
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not save the subscription.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Netflix"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

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
          <Label>Cadence</Label>
          <Select value={form.cadence} onValueChange={value => set('cadence', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBSCRIPTION_CADENCES.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Adaptive billing date: monthly asks a day, yearly asks month + day */}
      {isYearly ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Renews in</Label>
            <Select
              value={form.billingMonth}
              onValueChange={value => set('billingMonth', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billingDay">Day</Label>
            <Input
              id="billingDay"
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              className="tabular"
              value={form.billingDay}
              onChange={e => set('billingDay', e.target.value)}
              aria-invalid={!!errors.billingDay}
            />
            {errors.billingDay && (
              <p className="text-xs text-destructive">{errors.billingDay}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="billingDay">Billing day of the month</Label>
          <Input
            id="billingDay"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            className="tabular"
            value={form.billingDay}
            onChange={e => set('billingDay', e.target.value)}
            aria-invalid={!!errors.billingDay}
          />
          {errors.billingDay ? (
            <p className="text-xs text-destructive">{errors.billingDay}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Days past a short month&rsquo;s end roll to its last day.
            </p>
          )}
        </div>
      )}

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

      {submitError && <p className="text-xs text-destructive">{submitError}</p>}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : subscription ? 'Save changes' : 'Add subscription'}
        </Button>
      </DialogFooter>
    </form>
  );
}
