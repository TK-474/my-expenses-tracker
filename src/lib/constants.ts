// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'digital', label: 'Digital Wallet' },
  { value: 'other', label: 'Other' },
] as const;

// Default Categories
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', icon: '🛍️', color: '#FFE66D' },
  { name: 'Entertainment', icon: '🎬', color: '#A8E6CF' },
  { name: 'Healthcare', icon: '⚕️', color: '#FF8B94' },
  { name: 'Utilities', icon: '💡', color: '#95E1D3' },
  { name: 'Education', icon: '📚', color: '#C7CEEA' },
  { name: 'Others', icon: '📦', color: '#B4B4B4' },
];

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

