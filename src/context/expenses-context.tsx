'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
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
  SUBSCRIPTIONS_CATEGORY,
  STORAGE_KEYS,
} from '@/lib/constants';
import { SAMPLE_EXPENSES, SAMPLE_BUDGETS } from '@/lib/sample-data';

interface Settings {
  currency: string;
}

const DEFAULT_SETTINGS: Settings = { currency: 'PKR' };

interface ExpensesContextValue {
  /** False until the signed-in user's data has been fetched */
  hydrated: boolean;
  expenses: Expense[];
  categories: Category[];
  subscriptions: Subscription[];
  settings: Settings;
  /** Entries still sitting in this browser's pre-Supabase localStorage */
  legacyLocalCount: number;
  addExpense: (input: CreateExpenseInput) => Promise<void>;
  updateExpense: (input: UpdateExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

function sortByDateDesc(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Pre-Supabase data this browser may still hold */
function readLegacyLocal(): {
  expenses: CreateExpenseInput[];
  categories: CreateCategoryInput[];
} {
  if (typeof window === 'undefined') return { expenses: [], categories: [] };
  try {
    const expenses = (
      JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) ?? '[]') as Array<
        Omit<Expense, 'date'> & { date: string }
      >
    ).map(e => ({
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
      icon: c.icon,
      color: c.color,
      budget: c.budget,
    }));
    return { expenses, categories };
  } catch {
    return { expenses: [], categories: [] };
  }
}

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [hydrated, setHydrated] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [legacyLocalCount, setLegacyLocalCount] = useState(0);

  const refresh = useCallback(async (currentUserId: string) => {
    let cats = await db.fetchCategories();
    if (cats.length === 0) {
      // First sign-in: give the account the default set of categories
      await db.createCategories(DEFAULT_CATEGORIES, currentUserId);
      cats = await db.fetchCategories();
    } else if (!cats.some(c => c.name === SUBSCRIPTIONS_CATEGORY.name)) {
      // Existing accounts predating the subscriptions feature still get the
      // category that logged subscription payments are filed under.
      await db.createCategory(SUBSCRIPTIONS_CATEGORY, currentUserId);
      cats = await db.fetchCategories();
    }
    const [exps, subs] = await Promise.all([
      db.fetchExpenses(),
      db.fetchSubscriptions(),
    ]);
    setCategories(cats);
    setExpenses(sortByDateDesc(exps));
    setSubscriptions(subs);
  }, []);

  useEffect(() => {
    // Settings stay per-device
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage read on mount
    if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    setLegacyLocalCount(readLegacyLocal().expenses.length);
  }, []);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when signed out
      setExpenses([]);
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

  const addExpense = useCallback(
    async (input: CreateExpenseInput) => {
      if (!userId) return;
      const expense = await db.createExpense(input, userId);
      setExpenses(prev => sortByDateDesc([expense, ...prev]));
    },
    [userId]
  );

  const updateExpense = useCallback(async (input: UpdateExpenseInput) => {
    const expense = await db.updateExpense(input);
    setExpenses(prev =>
      sortByDateDesc(prev.map(e => (e.id === expense.id ? expense : e)))
    );
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await db.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
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
    await db.createExpenses(SAMPLE_EXPENSES, userId);
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
    if (legacy.expenses.length > 0) {
      await db.createExpenses(legacy.expenses, userId);
    }
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    setLegacyLocalCount(0);
    await refresh(userId);
  }, [userId, categories, refresh]);

  return (
    <ExpensesContext.Provider
      value={{
        hydrated,
        expenses,
        categories,
        subscriptions,
        settings,
        legacyLocalCount,
        addExpense,
        updateExpense,
        deleteExpense,
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
    </ExpensesContext.Provider>
  );
}

export function useExpenses(): ExpensesContextValue {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
}
