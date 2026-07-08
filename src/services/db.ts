import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types';
import { getSupabase } from '@/lib/supabase';
import { toInputDate, fromInputDate } from '@/utils/dates';

/**
 * Supabase-backed data access. Every call runs under Row Level Security,
 * so user_id must match the signed-in user on inserts.
 */

interface ExpenseRow {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method: Expense['paymentMethod'] | null;
  bank: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
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
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    budget: row.budget != null ? Number(row.budget) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function expenseToRow(input: CreateExpenseInput, userId: string) {
  return {
    user_id: userId,
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
    icon: input.icon ?? null,
    color: input.color ?? null,
    budget: input.budget ?? null,
  };
}

function throwIf(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export const db = {
  async fetchExpenses(): Promise<Expense[]> {
    const { data, error } = await getSupabase()
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    throwIf(error);
    return (data as ExpenseRow[]).map(mapExpense);
  },

  async createExpense(input: CreateExpenseInput, userId: string): Promise<Expense> {
    const { data, error } = await getSupabase()
      .from('expenses')
      .insert(expenseToRow(input, userId))
      .select()
      .single();
    throwIf(error);
    return mapExpense(data as ExpenseRow);
  },

  async createExpenses(inputs: CreateExpenseInput[], userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('expenses')
      .insert(inputs.map(input => expenseToRow(input, userId)));
    throwIf(error);
  },

  async updateExpense(input: UpdateExpenseInput): Promise<Expense> {
    const { id, ...fields } = input;
    // Explicit nulls so clearing a field (e.g. bank after a payment-method
    // change) actually persists — undefined keys are dropped in JSON.
    const patch: Record<string, unknown> = {};
    if ('amount' in fields) patch.amount = fields.amount;
    if ('description' in fields) patch.description = fields.description;
    if ('category' in fields) patch.category = fields.category;
    if ('date' in fields && fields.date) patch.date = toInputDate(fields.date);
    if ('paymentMethod' in fields) patch.payment_method = fields.paymentMethod ?? null;
    if ('bank' in fields) patch.bank = fields.bank ?? null;
    if ('notes' in fields) patch.notes = fields.notes ?? null;

    const { data, error } = await getSupabase()
      .from('expenses')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    throwIf(error);
    return mapExpense(data as ExpenseRow);
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await getSupabase().from('expenses').delete().eq('id', id);
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

  async clearAll(userId: string): Promise<void> {
    const supabase = getSupabase();
    const expenses = await supabase.from('expenses').delete().eq('user_id', userId);
    throwIf(expenses.error);
    const categories = await supabase.from('categories').delete().eq('user_id', userId);
    throwIf(categories.error);
  },
};
