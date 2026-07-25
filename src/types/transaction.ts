export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  /** Whether this is money in ('income') or money out ('expense') */
  type: TransactionType;
  /** Always positive; `type` carries the direction */
  amount: number;
  description: string;
  /** Category name (expense) or source name (income) */
  category: string;
  date: Date;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  /** Bank or wallet: where an expense was paid from, or where income landed */
  bank?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: Date;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  bank?: string;
  notes?: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}
