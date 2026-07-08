'use client';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  /** Rendered in the middle of the donut */
  centerLabel?: string;
  centerValue?: string;
}

const SIZE = 200;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.5; // degrees of breathing room between segments

/** Hand-rolled SVG donut with animated draw-in */
export function DonutChart({ slices, centerLabel, centerValue }: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return null;

  const segments: Array<DonutSlice & { rotate: number; dash: number; stagger: number }> = [];
  let angle = -90;
  for (const [i, slice] of slices.entries()) {
    const sweep = (slice.value / total) * 360;
    const arc = Math.max(sweep - (slices.length > 1 ? GAP : 0), 0.5);
    const dash = (arc / 360) * CIRCUMFERENCE;
    segments.push({ ...slice, rotate: angle, dash, stagger: i });
    angle += sweep;
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto size-48"
      role="img"
      aria-label="Spending by category"
    >
      {segments.map(segment => (
        <circle
          key={segment.label}
          className="donut-segment"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={segment.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${segment.dash} ${CIRCUMFERENCE}`}
          transform={`rotate(${segment.rotate} ${SIZE / 2} ${SIZE / 2})`}
          style={
            {
              '--donut-circumference': CIRCUMFERENCE,
              '--stagger': segment.stagger,
            } as React.CSSProperties
          }
        >
          <title>{segment.label}</title>
        </circle>
      ))}
      {centerValue && (
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          className="fill-foreground font-display text-[1.4rem] font-semibold"
        >
          {centerValue}
        </text>
      )}
      {centerLabel && (
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          className="fill-muted-foreground text-[0.65rem] uppercase tracking-widest"
        >
          {centerLabel}
        </text>
      )}
    </svg>
  );
}
