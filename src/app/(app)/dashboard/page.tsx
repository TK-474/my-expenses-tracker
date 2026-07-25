'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useTransactions } from '@/context/transactions-context';
import {
  lastMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  resolvePreset,
  fromInputDate,
  type DateRange,
} from '@/utils/dates';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DonutChart } from '@/components/charts/donut-chart';
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart';
import { BudgetBar } from '@/features/categories/budget-bar';
import { TransactionFormDialog } from '@/features/transactions/transaction-form-dialog';

const FALLBACK_COLORS = ['#796e8e', '#c9a44a', '#c07349', '#6b83a5', '#b0788f'];

const RANGE_OPTIONS = [
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This year', value: 'thisYear' },
  { label: 'All time', value: 'allTime' },
  { label: 'Custom range', value: 'custom' },
] as const;

function toSlices(
  byCategory: Map<string, number>,
  colorFor: (name: string) => string | undefined
) {
  return [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      label: name,
      value,
      color: colorFor(name) ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));
}

export default function DashboardPage() {
  const { hydrated, transactions, categories, settings, loadSampleData } =
    useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [rangeFilter, setRangeFilter] = useState<string>('thisMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [donutType, setDonutType] = useState<'expense' | 'income'>('expense');

  const currency = settings.currency;
  const now = new Date();

  // Resolve the selected filter into a concrete range (null = all time) and a label
  const { range, rangeLabel } = useMemo<{
    range: DateRange | null;
    rangeLabel: string;
  }>(() => {
    if (rangeFilter === 'allTime') return { range: null, rangeLabel: 'All time' };
    if (rangeFilter === 'custom') {
      const start = customStart ? startOfDay(fromInputDate(customStart)) : null;
      const end = customEnd ? endOfDay(fromInputDate(customEnd)) : null;
      if (start && end && start <= end) {
        return {
          range: { start, end },
          rangeLabel: `${formatDate(start)} – ${formatDate(end)}`,
        };
      }
      return { range: null, rangeLabel: 'Custom range' };
    }
    return {
      range: resolvePreset(rangeFilter),
      rangeLabel: RANGE_OPTIONS.find(o => o.value === rangeFilter)?.label ?? '',
    };
  }, [rangeFilter, customStart, customEnd]);

  // Equal-length window immediately preceding the range, for delta comparisons
  const prevRange = useMemo<DateRange | null>(() => {
    if (!range) return null;
    const span = range.end.getTime() - range.start.getTime();
    return { start: new Date(range.start.getTime() - span), end: range.start };
  }, [range]);

  const {
    periodIncome,
    periodExpense,
    prevIncome,
    prevExpense,
    todayExpense,
    expenseSlices,
    incomeSlices,
    trendPoints,
    budgeted,
    recent,
  } = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const dayStart = startOfDay(now);

    let periodIncome = 0;
    let periodExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;
    let todayExpense = 0;
    const expenseByCategory = new Map<string, number>();
    const incomeByCategory = new Map<string, number>();
    const monthByCategory = new Map<string, number>();

    for (const t of transactions) {
      const date = new Date(t.date);
      const isIncome = t.type === 'income';

      if (!range || (date >= range.start && date <= range.end)) {
        if (isIncome) {
          periodIncome += t.amount;
          incomeByCategory.set(
            t.category,
            (incomeByCategory.get(t.category) ?? 0) + t.amount
          );
        } else {
          periodExpense += t.amount;
          expenseByCategory.set(
            t.category,
            (expenseByCategory.get(t.category) ?? 0) + t.amount
          );
        }
      }
      if (prevRange && date >= prevRange.start && date < prevRange.end) {
        if (isIncome) prevIncome += t.amount;
        else prevExpense += t.amount;
      }
      // Budgets are a monthly, expense-only concept
      if (!isIncome && date >= monthStart && date <= monthEnd) {
        monthByCategory.set(
          t.category,
          (monthByCategory.get(t.category) ?? 0) + t.amount
        );
      }
      if (!isIncome && date >= dayStart) todayExpense += t.amount;
    }

    const colorFor = (name: string) =>
      categories.find(c => c.name === name)?.color;

    const trendPoints = lastMonths(6).map((month, i, arr) => {
      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const d = new Date(t.date);
        if (d >= month.start && d <= month.end) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      }
      return { label: month.label, income, expense, emphasis: i === arr.length - 1 };
    });

    const budgeted = categories
      .filter(c => c.type === 'expense' && c.budget != null && c.budget > 0)
      .map(c => ({ category: c, spent: monthByCategory.get(c.name) ?? 0 }))
      .sort((a, b) => b.spent / b.category.budget! - a.spent / a.category.budget!);

    return {
      periodIncome,
      periodExpense,
      prevIncome,
      prevExpense,
      todayExpense,
      expenseSlices: toSlices(expenseByCategory, colorFor),
      incomeSlices: toSlices(incomeByCategory, colorFor),
      trendPoints,
      budgeted,
      recent: transactions.slice(0, 6),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, categories, range, prevRange]);

  const monthName = now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const net = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? net / periodIncome : null;
  const incomeDelta =
    prevIncome > 0 ? (periodIncome - prevIncome) / prevIncome : null;
  const expenseDelta =
    prevExpense > 0 ? (periodExpense - prevExpense) / prevExpense : null;
  const categoryByName = new Map(categories.map(c => [c.name, c]));

  const donutSlices = donutType === 'expense' ? expenseSlices : incomeSlices;
  const donutTotal = donutType === 'expense' ? periodExpense : periodIncome;

  if (hydrated && transactions.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="eyebrow mb-2">{monthName}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          A fresh ledger
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Nothing has been recorded yet. Add your first entry, or load a few
          months of sample data to see the dashboard come alive.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => setFormOpen(true)}>
            <Plus /> First entry
          </Button>
          <Button
            variant="outline"
            disabled={seeding}
            onClick={async () => {
              setSeeding(true);
              await loadSampleData().catch(console.error);
              setSeeding(false);
            }}
          >
            <Sparkles /> {seeding ? 'Loading…' : 'Load sample data'}
          </Button>
        </div>
        <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{monthName}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> New entry
        </Button>
      </div>

      {/* Period filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Showing</span>
        <Select value={rangeFilter} onValueChange={setRangeFilter}>
          <SelectTrigger className="w-auto min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rangeFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="Start date"
              className="w-auto"
              value={customStart}
              max={customEnd || undefined}
              onChange={e => setCustomStart(e.target.value)}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              aria-label="End date"
              className="w-auto"
              value={customEnd}
              min={customStart || undefined}
              onChange={e => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rise-in" style={{ '--stagger': 0 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">
              Income · {rangeLabel}
            </CardDescription>
            <CardTitle className="tabular text-2xl text-primary sm:text-3xl">
              {formatCurrency(periodIncome, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeDelta !== null ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {incomeDelta >= 0 ? (
                  <TrendingUp className="size-3.5 text-primary" />
                ) : (
                  <TrendingDown className="size-3.5 text-terracotta" />
                )}
                <span className={incomeDelta >= 0 ? 'text-primary' : 'text-terracotta'}>
                  {Math.abs(incomeDelta * 100).toFixed(0)}%
                </span>
                vs prior period
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No prior period</p>
            )}
          </CardContent>
        </Card>

        <Card className="rise-in" style={{ '--stagger': 1 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">
              Spending · {rangeLabel}
            </CardDescription>
            <CardTitle className="tabular text-2xl sm:text-3xl">
              {formatCurrency(periodExpense, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseDelta !== null ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {expenseDelta >= 0 ? (
                  <TrendingUp className="size-3.5 text-terracotta" />
                ) : (
                  <TrendingDown className="size-3.5 text-primary" />
                )}
                <span className={expenseDelta >= 0 ? 'text-terracotta' : 'text-primary'}>
                  {Math.abs(expenseDelta * 100).toFixed(0)}%
                </span>
                vs prior period
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No prior period</p>
            )}
          </CardContent>
        </Card>

        <Card className="rise-in" style={{ '--stagger': 2 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">Net · {rangeLabel}</CardDescription>
            <CardTitle
              className={cn(
                'tabular text-2xl sm:text-3xl',
                net > 0 && 'text-primary',
                net < 0 && 'text-terracotta'
              )}
            >
              {net >= 0 ? '+' : ''}
              {formatCurrency(net, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {savingsRate !== null
                ? `${Math.round(savingsRate * 100)}% of income saved`
                : 'No income in this period'}
            </p>
          </CardContent>
        </Card>

        <Card className="rise-in" style={{ '--stagger': 3 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">Spent today</CardDescription>
            <CardTitle className="tabular text-2xl sm:text-3xl">
              {formatCurrency(todayExpense, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category / source breakdown */}
        <Card className="rise-in" style={{ '--stagger': 4 } as React.CSSProperties}>
          <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="font-display text-xl">
                {donutType === 'expense' ? 'By category' : 'By source'}
              </CardTitle>
              <CardDescription>
                {donutType === 'expense'
                  ? 'Where your money went'
                  : 'Where your money came from'}
              </CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-xs">
              {(['expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDonutType(t)}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium capitalize transition-colors',
                    donutType === t
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'expense' ? 'Expenses' : 'Income'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {donutSlices.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No {donutType === 'expense' ? 'spending' : 'income'} in this period yet.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <DonutChart
                  slices={donutSlices}
                  centerValue={formatCurrency(donutTotal, currency)}
                  centerLabel={donutType === 'expense' ? 'spent' : 'earned'}
                />
                <ul className="w-full flex-1 space-y-1.5">
                  {donutSlices.slice(0, 6).map(slice => (
                    <li key={slice.label} className="flex items-baseline text-sm">
                      <span className="mr-2 flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: slice.color }}
                          aria-hidden
                        />
                        <span aria-hidden>
                          {categoryByName.get(slice.label)?.icon}
                        </span>
                        {slice.label}
                      </span>
                      <span className="leader-dots" aria-hidden />
                      <span className="tabular">
                        {formatCurrency(slice.value, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Six-month income vs spending */}
        <Card className="rise-in" style={{ '--stagger': 5 } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="font-display text-xl">Income vs spending</CardTitle>
            <CardDescription>The last six months, side by side</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart
              points={trendPoints}
              formatValue={value => formatCurrency(value, currency)}
            />
          </CardContent>
        </Card>

        {/* Budgets */}
        <Card className="rise-in" style={{ '--stagger': 6 } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="font-display text-xl">Budgets</CardTitle>
            <CardDescription>How each envelope is holding up · {monthName}</CardDescription>
          </CardHeader>
          <CardContent>
            {budgeted.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No budgets set. Give a category a monthly limit to track it here.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/categories">
                    Set up budgets <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {budgeted.slice(0, 5).map(({ category, spent }) => (
                  <li key={category.id}>
                    <div className="mb-1.5 flex items-baseline text-sm">
                      <span>
                        <span aria-hidden>{category.icon}</span> {category.name}
                      </span>
                      <span className="leader-dots" aria-hidden />
                      <span className="tabular text-xs text-muted-foreground">
                        {formatCurrency(spent, currency)} /{' '}
                        {formatCurrency(category.budget!, currency)}
                      </span>
                    </div>
                    <BudgetBar spent={spent} budget={category.budget!} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent entries */}
        <Card className="rise-in" style={{ '--stagger': 7 } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="font-display text-xl">Latest entries</CardTitle>
            <CardDescription>The most recent lines in the book</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing recorded yet.
              </p>
            ) : (
              <>
                <ul className="space-y-2.5">
                  {recent.map(t => {
                    const isIncome = t.type === 'income';
                    return (
                      <li key={t.id} className="flex items-baseline text-sm">
                        <span className="mr-2 flex min-w-0 items-center gap-2">
                          <span aria-hidden>
                            {categoryByName.get(t.category)?.icon ??
                              (isIncome ? '💰' : '📦')}
                          </span>
                          <span className="truncate">{t.description}</span>
                        </span>
                        <span className="leader-dots" aria-hidden />
                        <span className={cn('tabular', isIncome && 'text-primary')}>
                          {isIncome ? '+' : ''}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Button asChild variant="ghost" size="sm" className="mt-4 -ml-2">
                  <Link href="/transactions">
                    Open the full ledger <ArrowRight />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
