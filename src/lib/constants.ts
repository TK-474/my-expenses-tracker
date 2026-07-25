import { CreateCategoryInput } from '@/types';

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'digital', label: 'Digital Wallet' },
  { value: 'other', label: 'Other' },
] as const;

// The category that logged subscription payments are filed under.
// Guaranteed to exist for every account (see transactions-context).
export const SUBSCRIPTIONS_CATEGORY = {
  name: 'Subscriptions',
  type: 'expense',
  icon: '🔁',
  color: '#8b7fd6',
} as const;

// Default expense categories
export const DEFAULT_CATEGORIES: CreateCategoryInput[] = [
  { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transportation', type: 'expense', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FFE66D' },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#A8E6CF' },
  { name: 'Healthcare', type: 'expense', icon: '⚕️', color: '#FF8B94' },
  { name: 'Utilities', type: 'expense', icon: '💡', color: '#95E1D3' },
  { name: 'Education', type: 'expense', icon: '📚', color: '#C7CEEA' },
  { name: SUBSCRIPTIONS_CATEGORY.name, type: 'expense', icon: SUBSCRIPTIONS_CATEGORY.icon, color: SUBSCRIPTIONS_CATEGORY.color },
  { name: 'Others', type: 'expense', icon: '📦', color: '#B4B4B4' },
];

// Default income sources (categories with type 'income')
export const DEFAULT_INCOME_CATEGORIES: CreateCategoryInput[] = [
  { name: 'Salary', type: 'income', icon: '💰', color: '#4CAF50' },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#26A69A' },
  { name: 'Interest', type: 'income', icon: '📈', color: '#66BB6A' },
  { name: 'Gift', type: 'income', icon: '🎁', color: '#9CCC65' },
  { name: 'Refund', type: 'income', icon: '↩️', color: '#8BC34A' },
  { name: 'Other income', type: 'income', icon: '➕', color: '#7CB342' },
];

// Subscription billing cadences
export const SUBSCRIPTION_CADENCES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

// Currency Options
export const CURRENCIES = [
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
  { value: 'INR', label: '₹ INR', symbol: '₹' },
  { value: 'JPY', label: '¥ JPY', symbol: '¥' },
  { value: 'PKR', label: '₨ PKR', symbol: '₨' },
] as const;

// Date Range Presets
export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'This year', value: 'thisYear' },
  { label: 'Custom', value: 'custom' },
] as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  THEME: 'theme',
} as const;

