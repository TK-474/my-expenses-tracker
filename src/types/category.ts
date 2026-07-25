import { TransactionType } from './transaction';

export interface Category {
  id: string;
  name: string;
  /** Whether this category groups income or expense transactions */
  type: TransactionType;
  icon?: string;
  color?: string;
  /** Monthly budget; only meaningful for expense categories */
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  budget?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

