export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
  budget?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

