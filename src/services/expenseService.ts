import { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/types';

/**
 * Service for managing expenses
 * Currently uses localStorage, can be replaced with API calls later
 */

const STORAGE_KEY = 'expenses';

export const expenseService = {
  /**
   * Get all expenses
   */
  getAll(): Expense[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Get expense by ID
   */
  getById(id: string): Expense | null {
    const expenses = this.getAll();
    return expenses.find(expense => expense.id === id) || null;
  },

  /**
   * Create a new expense
   */
  create(input: CreateExpenseInput): Expense {
    const expenses = this.getAll();
    const newExpense: Expense = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expenses.push(newExpense);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return newExpense;
  },

  /**
   * Update an existing expense
   */
  update(input: UpdateExpenseInput): Expense | null {
    const expenses = this.getAll();
    const index = expenses.findIndex(expense => expense.id === input.id);
    if (index === -1) return null;

    const updatedExpense: Expense = {
      ...expenses[index],
      ...input,
      updatedAt: new Date(),
    };
    expenses[index] = updatedExpense;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return updatedExpense;
  },

  /**
   * Delete an expense
   */
  delete(id: string): boolean {
    const expenses = this.getAll();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    if (filteredExpenses.length === expenses.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExpenses));
    return true;
  },

  /**
   * Get expenses by date range
   */
  getByDateRange(startDate: Date, endDate: Date): Expense[] {
    const expenses = this.getAll();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  },

  /**
   * Get expenses by category
   */
  getByCategory(category: string): Expense[] {
    const expenses = this.getAll();
    return expenses.filter(expense => expense.category === category);
  },

  /**
   * Calculate total amount for given expenses
   */
  calculateTotal(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  },
};

