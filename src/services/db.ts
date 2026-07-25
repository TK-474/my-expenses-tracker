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
import { getSupabase } from '@/lib/supabase';
import { toInputDate, fromInputDate } from '@/utils/dates';

/**
 * Supabase-backed data access. Every call runs under Row Level Security,
 * so user_id must match the signed-in user on inserts.
 */

interface TransactionRow {
  id: string;
  type: Transaction['type'];
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method: Transaction['paymentMethod'] | null;
  bank: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  type: Category['type'];
  icon: string | null;
  color: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionRow {
  id: string;
  name: string;
  amount: number;
  cadence: Subscription['cadence'];
  billing_day: number;
  billing_month: number | null;
  payment_method: Subscription['paymentMethod'] | null;
  bank: string | null;
  status: Subscription['status'];
  created_at: string;
  updated_at: string;
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    category: row.category,
    // date columns come back as 'YYYY-MM-DD'; parse as local noon to avoid TZ drift
    date: fromInputDate(row.date),
    paymentMethod: row.payment_method ?? undefined,
    bank: row.bank ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    budget: row.budget != null ? Number(row.budget) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    cadence: row.cadence,
    billingDay: row.billing_day,
    billingMonth: row.billing_month ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    bank: row.bank ?? undefined,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function subscriptionToRow(input: CreateSubscriptionInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    amount: input.amount,
    cadence: input.cadence,
    billing_day: input.billingDay,
    billing_month: input.billingMonth ?? null,
    payment_method: input.paymentMethod ?? null,
    bank: input.bank ?? null,
    status: input.status ?? 'active',
  };
}

function transactionToRow(input: CreateTransactionInput, userId: string) {
  return {
    user_id: userId,
    type: input.type,
    amount: input.amount,
    description: input.description,
    category: input.category,
    date: toInputDate(input.date),
    payment_method: input.paymentMethod ?? null,
    bank: input.bank ?? null,
    notes: input.notes ?? null,
  };
}

function categoryToRow(input: CreateCategoryInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    type: input.type,
    icon: input.icon ?? null,
    color: input.color ?? null,
    budget: input.budget ?? null,
  };
}

function throwIf(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export const db = {
  async fetchTransactions(): Promise<Transaction[]> {
    const { data, error } = await getSupabase()
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    throwIf(error);
    return (data as TransactionRow[]).map(mapTransaction);
  },

  async createTransaction(
    input: CreateTransactionInput,
    userId: string
  ): Promise<Transaction> {
    const { data, error } = await getSupabase()
      .from('transactions')
      .insert(transactionToRow(input, userId))
      .select()
      .single();
    throwIf(error);
    return mapTransaction(data as TransactionRow);
  },

  async createTransactions(
    inputs: CreateTransactionInput[],
    userId: string
  ): Promise<void> {
    const { error } = await getSupabase()
      .from('transactions')
      .insert(inputs.map(input => transactionToRow(input, userId)));
    throwIf(error);
  },

  async updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    const { id, ...fields } = input;
    // Explicit nulls so clearing a field (e.g. bank after a payment-method
    // change) actually persists — undefined keys are dropped in JSON.
    const patch: Record<string, unknown> = {};
    if ('type' in fields) patch.type = fields.type;
    if ('amount' in fields) patch.amount = fields.amount;
    if ('description' in fields) patch.description = fields.description;
    if ('category' in fields) patch.category = fields.category;
    if ('date' in fields && fields.date) patch.date = toInputDate(fields.date);
    if ('paymentMethod' in fields) patch.payment_method = fields.paymentMethod ?? null;
    if ('bank' in fields) patch.bank = fields.bank ?? null;
    if ('notes' in fields) patch.notes = fields.notes ?? null;

    const { data, error } = await getSupabase()
      .from('transactions')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    throwIf(error);
    return mapTransaction(data as TransactionRow);
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await getSupabase().from('transactions').delete().eq('id', id);
    throwIf(error);
  },

  async fetchCategories(): Promise<Category[]> {
    const { data, error } = await getSupabase()
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    throwIf(error);
    return (data as CategoryRow[]).map(mapCategory);
  },

  async createCategory(input: CreateCategoryInput, userId: string): Promise<Category> {
    const { data, error } = await getSupabase()
      .from('categories')
      .insert(categoryToRow(input, userId))
      .select()
      .single();
    throwIf(error);
    return mapCategory(data as CategoryRow);
  },

  async createCategories(inputs: CreateCategoryInput[], userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('categories')
      .insert(inputs.map(input => categoryToRow(input, userId)));
    throwIf(error);
  },

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...fields } = input;
    const patch: Record<string, unknown> = {};
    if ('name' in fields) patch.name = fields.name;
    if ('type' in fields) patch.type = fields.type;
    if ('icon' in fields) patch.icon = fields.icon ?? null;
    if ('color' in fields) patch.color = fields.color ?? null;
    if ('budget' in fields) patch.budget = fields.budget ?? null;

    const { data, error } = await getSupabase()
      .from('categories')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    throwIf(error);
    return mapCategory(data as CategoryRow);
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await getSupabase().from('categories').delete().eq('id', id);
    throwIf(error);
  },

  async fetchSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await getSupabase()
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: true });
    throwIf(error);
    return (data as SubscriptionRow[]).map(mapSubscription);
  },

  async createSubscription(
    input: CreateSubscriptionInput,
    userId: string
  ): Promise<Subscription> {
    const { data, error } = await getSupabase()
      .from('subscriptions')
      .insert(subscriptionToRow(input, userId))
      .select()
      .single();
    throwIf(error);
    return mapSubscription(data as SubscriptionRow);
  },

  async updateSubscription(input: UpdateSubscriptionInput): Promise<Subscription> {
    const { id, ...fields } = input;
    const patch: Record<string, unknown> = {};
    if ('name' in fields) patch.name = fields.name;
    if ('amount' in fields) patch.amount = fields.amount;
    if ('cadence' in fields) patch.cadence = fields.cadence;
    if ('billingDay' in fields) patch.billing_day = fields.billingDay;
    if ('billingMonth' in fields) patch.billing_month = fields.billingMonth ?? null;
    if ('paymentMethod' in fields) patch.payment_method = fields.paymentMethod ?? null;
    if ('bank' in fields) patch.bank = fields.bank ?? null;
    if ('status' in fields) patch.status = fields.status;

    const { data, error } = await getSupabase()
      .from('subscriptions')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    throwIf(error);
    return mapSubscription(data as SubscriptionRow);
  },

  async deleteSubscription(id: string): Promise<void> {
    const { error } = await getSupabase().from('subscriptions').delete().eq('id', id);
    throwIf(error);
  },

  async clearAll(userId: string): Promise<void> {
    const supabase = getSupabase();
    const transactions = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);
    throwIf(transactions.error);
    const categories = await supabase.from('categories').delete().eq('user_id', userId);
    throwIf(categories.error);
    const subscriptions = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);
    throwIf(subscriptions.error);
  },
};
