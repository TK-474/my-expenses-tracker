'use client';

import { cn } from '@/lib/utils';

interface BudgetBarProps {
  spent: number;
  budget: number;
  className?: string;
}

/** Thin budget progress rule; turns gold near the limit, terracotta over it */
export function BudgetBar({ spent, budget, className }: BudgetBarProps) {
  const ratio = budget > 0 ? spent / budget : 0;
  const width = Math.min(ratio, 1) * 100;
  const tone =
    ratio > 1 ? 'bg-terracotta' : ratio > 0.8 ? 'bg-gold' : 'bg-primary';

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', tone)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
