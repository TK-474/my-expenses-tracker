'use client';

import { useMemo, useState } from 'react';
import {
  Ban,
  Info,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Subscription } from '@/types';
import { useExpenses } from '@/context/expenses-context';
import { SUBSCRIPTIONS_CATEGORY } from '@/lib/constants';
import { formatCurrency } from '@/utils/formatters';
import { daysUntilRenewal, renewalLabel } from '@/utils/subscriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubscriptionFormDialog } from '@/features/subscriptions/subscription-form-dialog';
import { ExpenseFormDialog } from '@/features/expenses/expense-form-dialog';

const ACCENT = SUBSCRIPTIONS_CATEGORY.color;

export default function SubscriptionsPage() {
  const {
    hydrated,
    subscriptions,
    settings,
    updateSubscription,
    deleteSubscription,
  } = useExpenses();
  const currency = settings.currency;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const [logging, setLogging] = useState<Subscription | null>(null);

  const { active, cancelled, monthlyBurn, yearlyTotal } = useMemo(() => {
    const active = subscriptions
      .filter(s => s.status === 'active')
      .sort((a, b) => daysUntilRenewal(a) - daysUntilRenewal(b));
    const cancelled = subscriptions.filter(s => s.status === 'cancelled');
    return {
      active,
      cancelled,
      // Each cadence counts toward its own figure — yearly subs are not
      // annualized into the monthly burn.
      monthlyBurn: active
        .filter(s => s.cadence === 'monthly')
        .reduce((sum, s) => sum + s.amount, 0),
      yearlyTotal: active
        .filter(s => s.cadence === 'yearly')
        .reduce((sum, s) => sum + s.amount, 0),
    };
  }, [subscriptions]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  const renderCard = (sub: Subscription) => {
    const isCancelled = sub.status === 'cancelled';
    const suffix = sub.cadence === 'yearly' ? '/ yr' : '/ mo';
    return (
      <Card key={sub.id} className="rise-in group relative overflow-hidden">
        <span
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: isCancelled ? '#B4B4B4' : ACCENT }}
          aria-hidden
        />
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-medium leading-tight">
                  {sub.name}
                </p>
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[10px] font-normal capitalize"
                >
                  {sub.cadence}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isCancelled ? (
                  'Cancelled'
                ) : (
                  <span>{renewalLabel(sub)}</span>
                )}
                {sub.paymentMethod && (
                  <>
                    {' · '}
                    <span className="capitalize">{sub.paymentMethod}</span>
                    {sub.bank && <> · {sub.bank}</>}
                  </>
                )}
              </p>
            </div>
            <p className="tabular shrink-0 text-right font-medium">
              {formatCurrency(sub.amount, currency)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {suffix}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
            {!isCancelled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogging(sub)}
              >
                <ReceiptText className="size-3.5" /> Log payment
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(sub);
                setFormOpen(true);
              }}
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
            {isCancelled ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateSubscription({ id: sub.id, status: 'active' }).catch(
                    console.error
                  )
                }
              >
                <RotateCcw className="size-3.5" /> Reactivate
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateSubscription({ id: sub.id, status: 'cancelled' }).catch(
                    console.error
                  )
                }
              >
                <Ban className="size-3.5" /> Cancel
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${sub.name}`}
              onClick={() => setDeleting(sub)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Recurring commitments</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Subscriptions
          </h1>
        </div>
        <Button onClick={openNew}>
          <Plus /> New subscription
        </Button>
      </div>

      {/* Burn summary — monthly and yearly plans are counted separately.
          With only yearly subs, the yearly total becomes the headline. */}
      {active.length > 0 && (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {monthlyBurn > 0 ? (
              <>
                <span className="eyebrow">Monthly burn</span>
                <span className="tabular font-display text-3xl font-semibold">
                  {formatCurrency(monthlyBurn, currency)}
                  <span className="text-lg font-normal text-muted-foreground"> / mo</span>
                </span>
                {yearlyTotal > 0 && (
                  <span className="tabular text-sm text-muted-foreground">
                    · {formatCurrency(yearlyTotal, currency)} / yr in yearly plans
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="eyebrow">Yearly plans</span>
                <span className="tabular font-display text-3xl font-semibold">
                  {formatCurrency(yearlyTotal, currency)}
                  <span className="text-lg font-normal text-muted-foreground"> / yr</span>
                </span>
              </>
            )}
            <span className="ml-auto text-sm text-muted-foreground">
              {active.length} active
            </span>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="mb-6 flex items-start gap-2 rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Subscriptions are tracked here only — they are <strong>not</strong>{' '}
          automatically added to your ledger. Use <strong>Log payment</strong> to
          record an actual charge as an expense.
        </span>
      </p>

      {!hydrated ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Opening the ledger…
        </p>
      ) : subscriptions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-display text-xl">Nothing on the books</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Add the services you pay for regularly to see your monthly burn at a
            glance.
          </p>
          <Button className="mt-4" onClick={openNew}>
            <Plus /> Add your first subscription
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map(renderCard)}
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Cancelled · {cancelled.length}</p>
              <div className="grid gap-4 opacity-70 sm:grid-cols-2 lg:grid-cols-3">
                {cancelled.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}

      <SubscriptionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editing}
      />

      {/* Log a payment: opens the normal expense form pre-filled */}
      <ExpenseFormDialog
        open={logging != null}
        onOpenChange={open => { if (!open) setLogging(null); }}
        defaults={
          logging
            ? {
                amount: logging.amount,
                description: logging.name,
                category: SUBSCRIPTIONS_CATEGORY.name,
                paymentMethod: logging.paymentMethod,
                bank: logging.bank,
              }
            : undefined
        }
      />

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Delete this subscription?
            </DialogTitle>
            <DialogDescription>
              {deleting && (
                <>
                  &ldquo;{deleting.name}&rdquo; will be removed from your
                  subscriptions. Any expenses you already logged for it stay in
                  your ledger. This cannot be undone.
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
                  await deleteSubscription(deleting.id).catch(console.error);
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
