'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@/types';
import { db } from '@/services/db';
import { useAuth } from '@/context/auth-context';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  SUBSCRIPTIONS_CATEGORY,
  STORAGE_KEYS,
} from '@/lib/constants';
import { SAMPLE_TRANSACTIONS, SAMPLE_BUDGETS } from '@/lib/sample-data';

interface Settings {
  currency: string;
}

const DEFAULT_SETTINGS: Settings = { currency: 'PKR' };

interface TransactionsContextValue {
  /** False until the signed-in user's data has been fetched */
  hydrated: boolean;
  transactions: Transaction[];
  categories: Category[];
  subscriptions: Subscription[];
  settings: Settings;
  /** Entries still sitting in this browser's pre-Supabase localStorage */
  legacyLocalCount: number;
  addTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateTransaction: (input: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<void>;
  updateCategory: (input: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubscription: (input: CreateSubscriptionInput) => Promise<void>;
  updateSubscription: (input: UpdateSubscriptionInput) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  setCurrency: (currency: string) => void;
  loadSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  migrateLocalData: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Pre-Supabase data this browser may still hold (all treated as expenses) */
function readLegacyLocal(): {
  transactions: CreateTransactionInput[];
  categories: CreateCategoryInput[];
} {
  if (typeof window === 'undefined') return { transactions: [], categories: [] };
  try {
    const transactions = (
      JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) ?? '[]') as Array<
        Omit<Transaction, 'date' | 'type'> & { date: string }
      >
    ).map(e => ({
      type: 'expense' as const,
      amount: e.amount,
      description: e.description,
      category: e.category,
      date: new Date(e.date),
      paymentMethod: e.paymentMethod,
      bank: e.bank,
      notes: e.notes,
    }));
    const categories = (
      JSON.parse(
        localStorage.getItem(STORAGE_KEYS.CATEGORIES) ?? '[]'
      ) as Category[]
    ).map(c => ({
      name: c.name,
      type: 'expense' as const,
      icon: c.icon,
      color: c.color,
      budget: c.budget,
    }));
    return { transactions, categories };
  } catch {
    return { transactions: [], categories: [] };
  }
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [hydrated, setHydrated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [legacyLocalCount, setLegacyLocalCount] = useState(0);

  const refresh = useCallback(async (currentUserId: string) => {
    let cats = await db.fetchCategories();
    if (cats.length === 0) {
      // First sign-in: seed the default expense categories and income sources
      await db.createCategories(
        [...DEFAULT_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES],
        currentUserId
      );
      cats = await db.fetchCategories();
    } else {
      // Backfill categories that accounts predating a feature won't have yet
      const existing = new Set(cats.map(c => c.name.toLowerCase()));
      const missing: CreateCategoryInput[] = [];
      if (!existing.has(SUBSCRIPTIONS_CATEGORY.name.toLowerCase())) {
        missing.push(SUBSCRIPTIONS_CATEGORY);
      }
      if (!cats.some(c => c.type === 'income')) {
        for (const c of DEFAULT_INCOME_CATEGORIES) {
          if (!existing.has(c.name.toLowerCase())) missing.push(c);
        }
      }
      if (missing.length > 0) {
        await db.createCategories(missing, currentUserId);
        cats = await db.fetchCategories();
      }
    }
    const [txns, subs] = await Promise.all([
      db.fetchTransactions(),
      db.fetchSubscriptions(),
    ]);
    setCategories(cats);
    setTransactions(sortByDateDesc(txns));
    setSubscriptions(subs);
  }, []);

  useEffect(() => {
    // Settings stay per-device
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage read on mount
    if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    setLegacyLocalCount(readLegacyLocal().transactions.length);
  }, []);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when signed out
      setTransactions([]);
      setCategories([]);
      setSubscriptions([]);
      setHydrated(false);
      return;
    }
    let cancelled = false;
    refresh(userId)
      .catch(error => console.error('Failed to load ledger:', error))
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, refresh]);

  const addTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      if (!userId) return;
      const transaction = await db.createTransaction(input, userId);
      setTransactions(prev => sortByDateDesc([transaction, ...prev]));
    },
    [userId]
  );

  const updateTransaction = useCallback(async (input: UpdateTransactionInput) => {
    const transaction = await db.updateTransaction(input);
    setTransactions(prev =>
      sortByDateDesc(prev.map(t => (t.id === transaction.id ? transaction : t)))
    );
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await db.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCategory = useCallback(
    async (input: CreateCategoryInput) => {
      if (!userId) return;
      const category = await db.createCategory(input, userId);
      setCategories(prev => [...prev, category]);
    },
    [userId]
  );

  const updateCategory = useCallback(async (input: UpdateCategoryInput) => {
    const category = await db.updateCategory(input);
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await db.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addSubscription = useCallback(
    async (input: CreateSubscriptionInput) => {
      if (!userId) return;
      const subscription = await db.createSubscription(input, userId);
      setSubscriptions(prev => [...prev, subscription]);
    },
    [userId]
  );

  const updateSubscription = useCallback(async (input: UpdateSubscriptionInput) => {
    const subscription = await db.updateSubscription(input);
    setSubscriptions(prev =>
      prev.map(s => (s.id === subscription.id ? subscription : s))
    );
  }, []);

  const deleteSubscription = useCallback(async (id: string) => {
    await db.deleteSubscription(id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);

  const setCurrency = useCallback((currency: string) => {
    setSettings(prev => {
      const next = { ...prev, currency };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
      return next;
    });
  }, []);

  const loadSampleData = useCallback(async () => {
    if (!userId) return;
    await db.createTransactions(SAMPLE_TRANSACTIONS, userId);
    for (const category of await db.fetchCategories()) {
      const budget = SAMPLE_BUDGETS[category.name];
      if (budget != null && category.budget == null) {
        await db.updateCategory({ id: category.id, budget });
      }
    }
    await refresh(userId);
  }, [userId, refresh]);

  const clearAllData = useCallback(async () => {
    if (!userId) return;
    await db.clearAll(userId);
    await refresh(userId);
  }, [userId, refresh]);

  const migrateLocalData = useCallback(async () => {
    if (!userId) return;
    const legacy = readLegacyLocal();
    const existingNames = new Set(categories.map(c => c.name.toLowerCase()));
    const newCategories = legacy.categories.filter(
      c => !existingNames.has(c.name.toLowerCase())
    );
    if (newCategories.length > 0) {
      await db.createCategories(newCategories, userId);
    }
    if (legacy.transactions.length > 0) {
      await db.createTransactions(legacy.transactions, userId);
    }
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    setLegacyLocalCount(0);
    await refresh(userId);
  }, [userId, categories, refresh]);

  return (
    <TransactionsContext.Provider
      value={{
        hydrated,
        transactions,
        categories,
        subscriptions,
        settings,
        legacyLocalCount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        setCurrency,
        loadSampleData,
        clearAllData,
        migrateLocalData,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
