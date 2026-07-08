'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useExpenses } from '@/context/expenses-context';
import { lastMonths, startOfMonth, endOfMonth, startOfDay } from '@/utils/dates';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DonutChart } from '@/components/charts/donut-chart';
import { TrendChart } from '@/components/charts/trend-chart';
import { BudgetBar } from '@/features/categories/budget-bar';
import { ExpenseFormDialog } from '@/features/expenses/expense-form-dialog';

const FALLBACK_COLORS = ['#796e8e', '#c9a44a', '#c07349', '#6b83a5', '#b0788f'];

export default function DashboardPage() {
  const { hydrated, expenses, categories, settings, loadSampleData } =
    useExpenses();
  const [formOpen, setFormOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const currency = settings.currency;
  const now = new Date();

  const {
    monthTotal,
    lastMonthTotal,
    todayTotal,
    monthCount,
    donutSlices,
    trendPoints,
    budgeted,
    recent,
  } = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const dayStart = startOfDay(now);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevStart = startOfMonth(prevMonthDate);
    const prevEnd = endOfMonth(prevMonthDate);

    let monthTotal = 0;
    let lastMonthTotal = 0;
    let todayTotal = 0;
    let monthCount = 0;
    const byCategory = new Map<string, number>();

    for (const expense of expenses) {
      const date = new Date(expense.date);
      if (date >= monthStart && date <= monthEnd) {
        monthTotal += expense.amount;
        monthCount += 1;
        byCategory.set(
          expense.category,
          (byCategory.get(expense.category) ?? 0) + expense.amount
        );
        if (date >= dayStart) todayTotal += expense.amount;
      } else if (date >= prevStart && date <= prevEnd) {
        lastMonthTotal += expense.amount;
      }
    }

    const donutSlices = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        label: name,
        value,
        color:
          categories.find(c => c.name === name)?.color ??
          FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }));

    const trendPoints = lastMonths(6).map((month, i, arr) => ({
      label: month.label,
      value: expenses
        .filter(e => {
          const d = new Date(e.date);
          return d >= month.start && d <= month.end;
        })
        .reduce((sum, e) => sum + e.amount, 0),
      emphasis: i === arr.length - 1,
    }));

    const budgeted = categories
      .filter(c => c.budget != null && c.budget > 0)
      .map(c => ({
        category: c,
        spent: byCategory.get(c.name) ?? 0,
      }))
      .sort((a, b) => b.spent / b.category.budget! - a.spent / a.category.budget!);

    return {
      monthTotal,
      lastMonthTotal,
      todayTotal,
      monthCount,
      donutSlices,
      trendPoints,
      budgeted,
      recent: expenses.slice(0, 6),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, categories]);

  const monthName = now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const delta = lastMonthTotal > 0 ? (monthTotal - lastMonthTotal) / lastMonthTotal : null;
  const totalBudget = budgeted.reduce((sum, b) => sum + (b.category.budget ?? 0), 0);
  const totalBudgetSpent = budgeted.reduce((sum, b) => sum + b.spent, 0);
  const categoryByName = new Map(categories.map(c => [c.name, c]));

  if (hydrated && expenses.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="eyebrow mb-2">{monthName}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          A fresh ledger
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Nothing has been recorded yet. Add your first expense, or load a few
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
        <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} />
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

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rise-in" style={{ '--stagger': 0 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">Spent this month</CardDescription>
            <CardTitle className="tabular text-2xl sm:text-3xl">
              {formatCurrency(monthTotal, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {delta !== null ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {delta >= 0 ? (
                  <TrendingUp className="size-3.5 text-terracotta" />
                ) : (
                  <TrendingDown className="size-3.5 text-primary" />
                )}
                <span className={delta >= 0 ? 'text-terracotta' : 'text-primary'}>
                  {Math.abs(delta * 100).toFixed(0)}%
                </span>
                vs last month
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No prior month yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="rise-in" style={{ '--stagger': 1 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">Spent today</CardDescription>
            <CardTitle className="tabular text-2xl sm:text-3xl">
              {formatCurrency(todayTotal, currency)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card className="rise-in" style={{ '--stagger': 2 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">Budget used</CardDescription>
            <CardTitle className="tabular text-2xl sm:text-3xl">
              {totalBudget > 0
                ? `${Math.round((totalBudgetSpent / totalBudget) * 100)}%`
                : '—'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0
                ? `${formatCurrency(totalBudgetSpent, currency)} of ${formatCurrency(totalBudget, currency)}`
                : 'No budgets set yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="rise-in" style={{ '--stagger': 3 } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardDescription className="eyebrow">Entries</CardDescription>
            <CardTitle className="tabular text-2xl sm:text-3xl">{monthCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category breakdown */}
        <Card className="rise-in" style={{ '--stagger': 4 } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="font-display text-xl">By category</CardTitle>
            <CardDescription>Where this month went</CardDescription>
          </CardHeader>
          <CardContent>
            {donutSlices.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No entries this month yet.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <DonutChart
                  slices={donutSlices}
                  centerValue={formatCurrency(monthTotal, currency)}
                  centerLabel="this month"
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

        {/* Six-month trend */}
        <Card className="rise-in" style={{ '--stagger': 5 } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="font-display text-xl">The trend</CardTitle>
            <CardDescription>Last six months of spending</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              points={trendPoints}
              formatValue={value => formatCurrency(value, currency)}
            />
          </CardContent>
        </Card>

        {/* Budgets */}
        <Card className="rise-in" style={{ '--stagger': 6 } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="font-display text-xl">Budgets</CardTitle>
            <CardDescription>How each envelope is holding up</CardDescription>
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
                  {recent.map(expense => (
                    <li key={expense.id} className="flex items-baseline text-sm">
                      <span className="mr-2 flex min-w-0 items-center gap-2">
                        <span aria-hidden>
                          {categoryByName.get(expense.category)?.icon ?? '📦'}
                        </span>
                        <span className="truncate">{expense.description}</span>
                      </span>
                      <span className="leader-dots" aria-hidden />
                      <span className="tabular">
                        {formatCurrency(expense.amount, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="ghost" size="sm" className="mt-4 -ml-2">
                  <Link href="/expenses">
                    Open the full ledger <ArrowRight />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
