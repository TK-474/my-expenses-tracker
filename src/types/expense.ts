export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  category: string;
  date: Date;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  notes?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}

export interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}

