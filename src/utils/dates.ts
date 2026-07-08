/**
 * Date range helpers for filtering and analytics
 */

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export interface DateRange {
  start: Date;
  end: Date;
}

/** Resolve a DATE_RANGE_PRESETS value to a concrete range; null means "all time" */
export function resolvePreset(preset: string): DateRange | null {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'last7days': {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: startOfDay(s), end: endOfDay(now) };
    }
    case 'last30days': {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { start: startOfDay(s), end: endOfDay(now) };
    }
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'lastMonth': {
      const m = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfMonth(m), end: endOfMonth(m) };
    }
    case 'thisYear':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: endOfDay(now),
      };
    default:
      return null;
  }
}

/** Last `count` months as {label, start, end}, oldest first */
export function lastMonths(count: number): Array<DateRange & { label: string }> {
  const now = new Date();
  const months: Array<DateRange & { label: string }> = [];
  for (let i = count - 1; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: month.toLocaleDateString('en-US', { month: 'short' }),
      start: startOfMonth(month),
      end: endOfMonth(month),
    });
  }
  return months;
}

/** Format a Date for <input type="date"> */
export function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse an <input type="date"> value as local noon to avoid timezone drift */
export function fromInputDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}
