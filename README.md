# My Expenses Tracker 💰

A modern, full-featured expense tracking web application built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Features

- **Track Expenses**: Record and manage all your daily expenses with ease
- **Categories**: Organize expenses into custom categories
- **Budget Management**: Set and monitor budgets for different categories
- **Analytics**: Visualize spending patterns with charts and reports
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode**: Eye-friendly dark theme support

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🎯 Roadmap

### Phase 1: Core Features (Current)
- [x] Project setup with Next.js, TypeScript, Tailwind CSS
- [x] shadcn/ui integration
- [x] Basic project structure
- [ ] Expense CRUD operations
- [ ] Category management
- [ ] Local storage implementation

### Phase 2: Enhanced Features
- [ ] Dashboard with analytics
- [ ] Data visualization (charts)
- [ ] Budget tracking
- [ ] Export data (CSV, PDF)
- [ ] Search and filter expenses

### Phase 3: Advanced Features
- [ ] User authentication
- [ ] Cloud sync
- [ ] Recurring expenses
- [ ] Receipt upload
- [ ] Multi-currency support

### Phase 4: Mobile App
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
