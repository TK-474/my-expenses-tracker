# Quick Start Guide 🚀

Welcome to My Expenses Tracker! This guide will help you get started quickly.

## 📋 What's Already Set Up

✅ **Next.js 15** with App Router and TypeScript  
✅ **Tailwind CSS** for styling  
✅ **shadcn/ui** components (Button, Card, Input, Form, Table, Dialog, Badge, Select, Label)  
✅ **Project Structure** with organized folders  
✅ **TypeScript Types** for expenses and categories  
✅ **Service Layer** for data management (localStorage-based)  
✅ **Utility Functions** for formatting currency and dates  
✅ **Custom Hooks** (useLocalStorage)  
✅ **Constants** file with default categories and payment methods  
✅ **Home Page** with feature overview  
✅ **Dashboard Page** with summary cards  

## 🎯 Next Steps

### 1. Start the Development Server

```bash
cd my-expenses-tracker
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

### 2. Explore the Pages

- **Home Page** (`/`) - Landing page with feature overview
- **Dashboard** (`/dashboard`) - Main dashboard (ready for you to enhance)

### 3. Build Your First Feature

Here's a suggested order to implement features:

#### Step 1: Create Expense Form Component
Create a form to add new expenses using the existing shadcn/ui components.

Location: `src/features/expenses/AddExpenseForm.tsx`

Use:
- `expenseService.create()` from `src/services/expenseService.ts`
- `categoryService.getAll()` to populate category dropdown
- Form components from `src/components/ui/form.tsx`

#### Step 2: Display Expenses List
Show all expenses in a table or card layout.

Location: `src/features/expenses/ExpensesList.tsx`

Use:
- `expenseService.getAll()` to fetch expenses
- Table component from `src/components/ui/table.tsx`
- Format currency using `formatCurrency()` from `src/utils/formatters.ts`

#### Step 3: Add Edit/Delete Functionality
Allow users to modify or remove expenses.

Use:
- `expenseService.update()` and `expenseService.delete()`
- Dialog component for confirmations

#### Step 4: Create Dashboard Analytics
Add charts and statistics to the dashboard.

Suggested libraries:
```bash
npm install recharts
# or
npm install chart.js react-chartjs-2
```

#### Step 5: Add Filtering and Search
Implement expense filtering by date, category, amount.

Use:
- `ExpenseFilters` type from `src/types/expense.ts`
- `expenseService.getByDateRange()` and `getByCategory()`

### 4. Additional shadcn/ui Components

Add more components as needed:

```bash
# Calendar for date picking
npx shadcn@latest add calendar

# Dropdown menu for actions
npx shadcn@latest add dropdown-menu

# Popover for tooltips
npx shadcn@latest add popover

# Toast for notifications
npx shadcn@latest add toast

# Tabs for organizing content
npx shadcn@latest add tabs

# Charts (requires recharts)
npx shadcn@latest add chart
```

### 5. Set Up Backend (Optional)

Currently using localStorage. To add a real backend:

1. **Option A: Next.js API Routes**
   - Create API routes in `src/app/api/expenses/route.ts`
   - Replace service calls with fetch requests

2. **Option B: External Backend**
   - Set up Express.js, FastAPI, or other backend
   - Update services to call external API
   - Add environment variables in `.env.local`

3. **Option C: Database Integration**
   - Use Prisma or another ORM
   - Connect to PostgreSQL, MongoDB, etc.

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Useful Commands

```bash
# Development
npm run dev           # Start dev server
npm run lint          # Run linter
npm run build         # Build for production
npm start             # Start production server

# Type checking
npx tsc --noEmit      # Check TypeScript types

# Add shadcn component
npx shadcn@latest add [component-name]
```

## 🎨 Customization Tips

### Change Theme Colors
Edit `src/app/globals.css` to modify CSS variables for colors.

### Add New Categories
Update `DEFAULT_CATEGORIES` in `src/lib/constants.ts`

### Modify Currency
Change `CURRENCIES` in `src/lib/constants.ts` or add `.env.local`:
```env
NEXT_PUBLIC_CURRENCY=USD
```

### Add Dark Mode Toggle
Install the theme switcher:
```bash
npx shadcn@latest add theme
```

## 🐛 Troubleshooting

**Build Errors?**
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`

**Linter Errors?**
- Run `npm run lint` to see issues
- Fix automatically: `npm run lint -- --fix` (if available)

**Type Errors?**
- Check `tsconfig.json` is properly configured
- Run `npx tsc --noEmit` to see all type errors

## 💡 Pro Tips

1. **Use React DevTools** - Install browser extension for debugging
2. **Component-First Development** - Build UI components before adding logic
3. **Test Incrementally** - Test each feature as you build it
4. **Version Control** - Commit frequently with meaningful messages
5. **Mobile-First** - Design for mobile screens first, then scale up

## 🎉 You're All Set!

The foundation is ready. Start building your expense tracker features!

For questions or issues, check the main README.md or open an issue on GitHub.

Happy coding! 💪

