'use client';

import { cn } from '@/lib/utils';

export interface TrendPoint {
  label: string;
  value: number;
  /** Highlight (e.g. the current month) */
  emphasis?: boolean;
}

interface TrendChartProps {
  points: TrendPoint[];
  formatValue: (value: number) => string;
}

/** Monthly bar chart built from plain divs with a grow-in animation */
export function TrendChart({ points, formatValue }: TrendChartProps) {
  const max = Math.max(...points.map(p => p.value), 1);

  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3">
      {points.map((point, i) => (
        <div
          key={point.label}
          className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
        >
          <span className="tabular text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {formatValue(point.value)}
          </span>
          <div
            className={cn(
              'bar-grow w-full max-w-12 rounded-t-sm transition-colors',
              point.emphasis
                ? 'bg-primary'
                : 'bg-primary/25 group-hover:bg-primary/40'
            )}
            style={
              {
                height: `${Math.max((point.value / max) * 100, point.value > 0 ? 2 : 0)}%`,
                '--stagger': i,
              } as React.CSSProperties
            }
            title={`${point.label}: ${formatValue(point.value)}`}
          />
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
  );
}
