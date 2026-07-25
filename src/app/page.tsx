import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const LEDGER_PREVIEW = [
  { icon: '🍔', label: 'Weekly groceries', amount: 'Rs 6,230' },
  { icon: '🚗', label: 'Petrol refill', amount: 'Rs 4,500' },
  { icon: '🎬', label: 'Movie tickets', amount: 'Rs 1,500' },
  { icon: '💡', label: 'Electricity bill', amount: 'Rs 12,000' },
  { icon: '🛍️', label: 'Running shoes', amount: 'Rs 8,999' },
];

const FEATURES = [
  {
    number: '01',
    title: 'Record',
    body: 'Every expense becomes a line in the book — amount, category, date, payment method. Adding one takes seconds, searching them takes less.',
  },
  {
    number: '02',
    title: 'Budget',
    body: 'Give each category a monthly allowance and watch the rules fill in. Gold when you are close, terracotta when you have crossed the line.',
  },
  {
    number: '03',
    title: 'Understand',
    body: 'A dashboard that reads like a well-kept summary page: where the month went, how it compares to the last, and which envelopes are straining.',
  },
  {
    number: '04',
    title: 'Keep it yours',
    body: 'Everything lives in your browser and installs to your home screen like a native app. Export to CSV whenever you want your numbers elsewhere.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" strokeWidth={1.75} />
          <span className="font-display text-xl font-semibold tracking-tight">
            Ledger<span className="text-gold">.</span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Open the ledger</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="eyebrow rise-in mb-4" style={{ '--stagger': 0 } as React.CSSProperties}>
              A quieter way to track money
            </p>
            <h1
              className="rise-in font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
              style={{ '--stagger': 1 } as React.CSSProperties}
            >
              Every cent,
              <br />
              beautifully
              <br />
              <em className="text-primary">accounted for.</em>
            </h1>
            <p
              className="rise-in mt-6 max-w-md text-lg text-muted-foreground"
              style={{ '--stagger': 2 } as React.CSSProperties}
            >
              Ledger is an expense book for people who like their numbers tidy
              — budgets, categories, and charts.
            </p>
            <div
              className="rise-in mt-8 flex flex-wrap gap-3"
              style={{ '--stagger': 3 } as React.CSSProperties}
            >
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Start writing <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/transactions">Browse the book</Link>
              </Button>
            </div>
          </div>

          {/* Ledger page mock */}
          <div
            className="rise-in relative"
            style={{ '--stagger': 4 } as React.CSSProperties}
          >
            <div className="absolute -inset-3 -rotate-2 rounded-lg border bg-card/60" aria-hidden />
            <div className="relative rotate-1 rounded-lg border bg-card p-6 shadow-lg shadow-foreground/5">
              <div className="mb-4 flex items-baseline justify-between border-b-2 border-double pb-3">
                <span className="eyebrow">This month</span>
                <span className="tabular font-display text-2xl font-semibold">
                  Rs 33,229
                </span>
              </div>
              <ul className="space-y-3">
                {LEDGER_PREVIEW.map(row => (
                  <li key={row.label} className="flex items-baseline text-sm">
                    <span className="mr-2 flex items-center gap-2">
                      <span aria-hidden>{row.icon}</span>
                      {row.label}
                    </span>
                    <span className="leader-dots" aria-hidden />
                    <span className="tabular">{row.amount}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Food budget</span>
                  <span className="tabular">Rs 33,229 / Rs 50,000</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features, numbered like ledger folios */}
        <section className="border-y bg-card/50">
          <div className="mx-auto grid w-full max-w-6xl gap-x-12 gap-y-10 px-4 py-16 sm:grid-cols-2 sm:px-6">
            {FEATURES.map(feature => (
              <div key={feature.number} className="flex gap-5">
                <span className="tabular select-none text-3xl font-light text-gold">
                  {feature.number}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-medium">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The first entry takes ten seconds.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            No account, no sync, no spreadsheet guilt. Just a well-kept book.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/dashboard">
              Open your ledger <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span>
            Ledger<span className="text-gold">.</span> — my expenses tracker
          </span>
          <span>Built with Next.js, Tailwind CSS &amp; shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
