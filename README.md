# Ledger — My Expenses Tracker 💰

A full-featured expense tracking app. Sign in once and your ledger syncs to every device; row-level security keeps each account's data private.

**✨ Live app: [my-expenses-tracker-tk-47.vercel.app](https://my-expenses-tracker-tk-47.vercel.app)**

## Features

- **Track Expenses** — add, edit, delete, search, and filter by category, date range, or payment method
- **Categories & Budgets** — custom categories with icons, colors, and per-category monthly budgets
- **Analytics Dashboard** — monthly totals, category donut chart, six-month trend, budget overview
- **CSV Export** — download your full ledger any time from Settings
- **Multi-currency** — USD, EUR, GBP, INR, JPY, PKR
- **Installable (PWA)** — Add to Home Screen on mobile or install from the address bar on desktop
- **Dark Mode** — "Midnight ledger" theme, remembered across visits
- **Sample Data** — one click loads several months of realistic entries to explore the app

## Built With

[Next.js](https://nextjs.org/) · [TypeScript](https://www.typescriptlang.org/) · [Tailwind CSS](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/) · [Supabase](https://supabase.com/) · Deployed on [Vercel](https://vercel.com/)

## Running Locally

```bash
npm install
npm run dev
```

Requires Node.js 18+ and a free [Supabase](https://supabase.com) project: run `supabase/schema.sql` in the SQL Editor, then copy `.env.local.example` to `.env.local` and fill in your project URL and publishable key.

## Roadmap

- [ ] Recurring expenses
- [ ] Receipt upload
- [ ] React Native mobile app
- [ ] Push notifications

## License

Open source under the [MIT License](LICENSE).
