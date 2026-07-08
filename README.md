# Ledger — My Expenses Tracker 💰

A full-featured expense tracking web app built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase. Sign in once and your ledger syncs to every device; row-level security keeps each account's data private.

## 🚀 Features

- **Track Expenses**: Add, edit, delete, search, and filter expenses (by category, date range, payment method)
- **Categories**: Custom categories with icons, colors, and per-category monthly budgets
- **Budget Management**: Progress bars that turn gold near the limit and terracotta when over
- **Analytics Dashboard**: Month total vs last month, category donut chart, six-month trend, budget overview
- **CSV Export**: Download your full ledger any time from Settings
- **Multi-currency**: USD, EUR, GBP, INR, JPY, PKR
- **Sample Data**: One click loads several months of realistic entries to explore the app
- **Installable (PWA)**: Add to Home Screen on mobile or install from the address bar on desktop
- **Dark Mode**: "Midnight ledger" theme, remembered across visits

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: React Icons / Lucide Icons

## 📦 Project Structure

```
my-expenses-tracker/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── dashboard/        # Dashboard page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── features/
│   │   ├── expenses/         # Expense-related components
│   │   ├── categories/       # Category-related components
│   │   └── dashboard/        # Dashboard components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API and data services
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── public/                   # Static assets
└── package.json
```

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Navigate to the project directory:
```bash
cd my-expenses-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase (free tier is plenty):
   - Create a project at [supabase.com](https://supabase.com)
   - In the dashboard, open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it
   - Copy `.env.local.example` to `.env.local` and fill in the **Project URL** and **anon public key** from **Project Settings → API**

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000), create an account on the login page, and start recording.

> **Note on email confirmation:** by default Supabase requires new accounts to confirm their email. You can turn this off for development under **Authentication → Providers → Email → Confirm email**.

> **Migrating old data:** if you used the earlier localStorage version of this app, Settings will show an "Import to my account" button that moves those entries into Supabase.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Project setup with Next.js, TypeScript, Tailwind CSS
- [x] shadcn/ui integration
- [x] Basic project structure
- [x] Expense CRUD operations
- [x] Category management
- [x] Local storage implementation

### Phase 2: Enhanced Features ✅
- [x] Dashboard with analytics
- [x] Data visualization (custom SVG donut + trend charts)
- [x] Budget tracking with per-category monthly budgets
- [x] Export data (CSV)
- [x] Search and filter expenses (category, date range, payment method)

### Phase 3: Advanced Features (partial)
- [x] Multi-currency support (USD, EUR, GBP, INR, JPY, PKR)
- [x] Installable app (PWA manifest — Add to Home Screen on mobile, install from address bar on desktop)
- [x] User authentication (Supabase email/password)
- [x] Cloud sync (Supabase Postgres with row-level security)
- [ ] Recurring expenses
- [ ] Receipt upload

### Phase 4: Mobile App
- [x] Installable web app via PWA (works today)
- [ ] React Native mobile app
- [ ] Cross-platform sync
- [ ] Push notifications

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

Built with ❤️ using modern web technologies
