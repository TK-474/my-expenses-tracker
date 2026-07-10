import { Subscription } from '@/types';
import { startOfDay } from '@/utils/dates';

/** Number of days in a given month (0-indexed month) */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * The next date this subscription renews, on or after today.
 * A billing day that overshoots a short month (e.g. the 31st in February)
 * clamps to that month's last day.
 */
export function nextRenewal(sub: Subscription, from: Date = new Date()): Date {
  const today = startOfDay(from);

  if (sub.cadence === 'yearly') {
    const month = (sub.billingMonth ?? 1) - 1;
    for (let year = today.getFullYear(); ; year++) {
      const day = Math.min(sub.billingDay, daysInMonth(year, month));
      const candidate = new Date(year, month, day);
      if (candidate >= today) return candidate;
    }
  }

  // Monthly: try this month, then roll forward until we land on/after today
  const y = today.getFullYear();
  const m = today.getMonth();
  for (let offset = 0; ; offset++) {
    const month = m + offset;
    const year = y + Math.floor(month / 12);
    const normMonth = ((month % 12) + 12) % 12;
    const day = Math.min(sub.billingDay, daysInMonth(year, normMonth));
    const candidate = new Date(year, normMonth, day);
    if (candidate >= today) return candidate;
  }
}

/** Whole days from today until the subscription's next renewal (0 = today) */
export function daysUntilRenewal(sub: Subscription, from: Date = new Date()): number {
  const today = startOfDay(from);
  const renewal = nextRenewal(sub, from);
  return Math.round((renewal.getTime() - today.getTime()) / 86_400_000);
}

/** Human phrase for the renewal countdown */
export function renewalLabel(sub: Subscription, from: Date = new Date()): string {
  const days = daysUntilRenewal(sub, from);
  if (days === 0) return 'Renews today';
  if (days === 1) return 'Renews tomorrow';
  return `Renews in ${days} days`;
}
