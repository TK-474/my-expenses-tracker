'use client';

import { cn } from '@/lib/utils';

export interface IncomeExpensePoint {
  label: string;
  income: number;
  expense: number;
  /** Highlight (e.g. the current month) */
  emphasis?: boolean;
}

interface IncomeExpenseChartProps {
  points: IncomeExpensePoint[];
  formatValue: (value: number) => string;
}

/** Grouped monthly bars: income vs expense, built from plain divs */
export function IncomeExpenseChart({ points, formatValue }: IncomeExpenseChartProps) {
  const max = Math.max(...points.flatMap(p => [p.income, p.expense]), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {points.map((point, i) => (
          <div
            key={point.label}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <div className="flex h-full w-full items-end justify-center gap-0.5 sm:gap-1">
              <div
                className={cn(
                  'bar-grow w-full max-w-5 rounded-t-sm bg-primary/80 transition-colors group-hover:bg-primary'
                )}
                style={
                  {
                    height: `${Math.max((point.income / max) * 100, point.income > 0 ? 2 : 0)}%`,
                    '--stagger': i,
                  } as React.CSSProperties
                }
                title={`${point.label} income: ${formatValue(point.income)}`}
              />
              <div
                className={cn(
                  'bar-grow w-full max-w-5 rounded-t-sm bg-terracotta/70 transition-colors group-hover:bg-terracotta'
                )}
                style={
                  {
                    height: `${Math.max((point.expense / max) * 100, point.expense > 0 ? 2 : 0)}%`,
                    '--stagger': i,
                  } as React.CSSProperties
                }
                title={`${point.label} spending: ${formatValue(point.expense)}`}
              />
            </div>
            <span
              className={cn(
                'text-[11px]',
                point.emphasis
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {point.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary/80" aria-hidden />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-terracotta/70" aria-hidden />
          Spending
        </span>
      </div>
    </div>
  );
}
