import { CreateTransactionInput } from '@/types';

/** Suggested monthly budgets (PKR) applied to default categories when sample data loads */
export const SAMPLE_BUDGETS: Record<string, number> = {
  'Food & Dining': 50000,
  Transportation: 20000,
  Shopping: 30000,
  Entertainment: 15000,
  Healthcare: 10000,
  Utilities: 25000,
  Education: 12000,
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export const SAMPLE_TRANSACTIONS: CreateTransactionInput[] = [
  // Income
  { type: 'income', amount: 250000, description: 'Monthly salary', category: 'Salary', date: daysAgo(2), paymentMethod: 'card', bank: 'HBL' },
  { type: 'income', amount: 45000, description: 'Freelance project', category: 'Freelance', date: daysAgo(11), paymentMethod: 'digital', bank: 'SadaPay' },
  { type: 'income', amount: 3200, description: 'Savings interest', category: 'Interest', date: daysAgo(20), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'income', amount: 250000, description: 'Monthly salary', category: 'Salary', date: daysAgo(32), paymentMethod: 'card', bank: 'HBL' },
  { type: 'income', amount: 60000, description: 'Freelance project', category: 'Freelance', date: daysAgo(48), paymentMethod: 'digital', bank: 'SadaPay' },
  { type: 'income', amount: 250000, description: 'Monthly salary', category: 'Salary', date: daysAgo(62), paymentMethod: 'card', bank: 'HBL' },
  // Expenses
  { type: 'expense', amount: 1450, description: 'Lunch at the corner cafe', category: 'Food & Dining', date: daysAgo(0), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 6230, description: 'Weekly groceries', category: 'Food & Dining', date: daysAgo(1), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'expense', amount: 999, description: 'Streaming subscription', category: 'Entertainment', date: daysAgo(2), paymentMethod: 'digital' },
  { type: 'expense', amount: 4500, description: 'Petrol refill', category: 'Transportation', date: daysAgo(3), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 12000, description: 'Electricity bill', category: 'Utilities', date: daysAgo(4), paymentMethod: 'digital' },
  { type: 'expense', amount: 2875, description: 'Dinner with friends', category: 'Food & Dining', date: daysAgo(5), paymentMethod: 'cash' },
  { type: 'expense', amount: 8999, description: 'Running shoes', category: 'Shopping', date: daysAgo(7), paymentMethod: 'card', bank: 'UBL' },
  { type: 'expense', amount: 1500, description: 'Movie tickets', category: 'Entertainment', date: daysAgo(8), paymentMethod: 'cash' },
  { type: 'expense', amount: 3240, description: 'Pharmacy', category: 'Healthcare', date: daysAgo(10), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'expense', amount: 1820, description: 'Ride share to airport', category: 'Transportation', date: daysAgo(12), paymentMethod: 'digital' },
  { type: 'expense', amount: 5400, description: 'Internet bill', category: 'Utilities', date: daysAgo(14), paymentMethod: 'digital' },
  { type: 'expense', amount: 2499, description: 'Online course', category: 'Education', date: daysAgo(16), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 7650, description: 'Groceries', category: 'Food & Dining', date: daysAgo(18), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'expense', amount: 1200, description: 'Coffee beans', category: 'Food & Dining', date: daysAgo(20), paymentMethod: 'cash' },
  { type: 'expense', amount: 14000, description: 'Winter jacket', category: 'Shopping', date: daysAgo(23), paymentMethod: 'card', bank: 'UBL' },
  { type: 'expense', amount: 850, description: 'Bus pass top-up', category: 'Transportation', date: daysAgo(25), paymentMethod: 'digital' },
  { type: 'expense', amount: 6500, description: 'Concert ticket', category: 'Entertainment', date: daysAgo(34), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 11000, description: 'Dentist check-up', category: 'Healthcare', date: daysAgo(40), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'expense', amount: 5830, description: 'Groceries', category: 'Food & Dining', date: daysAgo(45), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 3999, description: 'Textbook', category: 'Education', date: daysAgo(52), paymentMethod: 'card', bank: 'UBL' },
  { type: 'expense', amount: 4700, description: 'Petrol refill', category: 'Transportation', date: daysAgo(60), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 13000, description: 'Electricity bill', category: 'Utilities', date: daysAgo(64), paymentMethod: 'digital' },
  { type: 'expense', amount: 2250, description: 'Brunch', category: 'Food & Dining', date: daysAgo(70), paymentMethod: 'cash' },
  { type: 'expense', amount: 9500, description: 'Headphones', category: 'Shopping', date: daysAgo(80), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'expense', amount: 6000, description: 'Groceries', category: 'Food & Dining', date: daysAgo(95), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 12500, description: 'Utilities bundle', category: 'Utilities', date: daysAgo(100), paymentMethod: 'digital' },
  { type: 'expense', amount: 3500, description: 'Museum membership', category: 'Entertainment', date: daysAgo(110), paymentMethod: 'card', bank: 'UBL' },
  { type: 'expense', amount: 5200, description: 'Petrol refill', category: 'Transportation', date: daysAgo(120), paymentMethod: 'card', bank: 'HBL' },
  { type: 'expense', amount: 7000, description: 'Groceries', category: 'Food & Dining', date: daysAgo(130), paymentMethod: 'card', bank: 'Meezan' },
  { type: 'expense', amount: 20000, description: 'New desk chair', category: 'Shopping', date: daysAgo(150), paymentMethod: 'card', bank: 'UBL' },
];
