import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

/**
 * Service for managing categories
 * Currently uses localStorage, can be replaced with API calls later
 */

const STORAGE_KEY = 'categories';

export const categoryService = {
  /**
   * Get all categories
   */
  getAll(): Category[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Initialize with default categories
      this.initializeDefaults();
      return this.getAll();
    }
    return JSON.parse(data);
  },

  /**
   * Initialize default categories
   */
  initializeDefaults(): void {
    const defaultCategories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
      id: crypto.randomUUID(),
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
  },

  /**
   * Get category by ID
   */
  getById(id: string): Category | null {
    const categories = this.getAll();
    return categories.find(category => category.id === id) || null;
  },

  /**
   * Create a new category
   */
  create(input: CreateCategoryInput): Category {
    const categories = this.getAll();
    const newCategory: Category = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    categories.push(newCategory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    return newCategory;
  },

  /**
   * Update an existing category
   */
  update(input: UpdateCategoryInput): Category | null {
    const categories = this.getAll();
    const index = categories.findIndex(category => category.id === input.id);
    if (index === -1) return null;

    const updatedCategory: Category = {
      ...categories[index],
      ...input,
      updatedAt: new Date(),
    };
    categories[index] = updatedCategory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    return updatedCategory;
  },

  /**
   * Delete a category
   */
  delete(id: string): boolean {
    const categories = this.getAll();
    const filteredCategories = categories.filter(category => category.id !== id);
    if (filteredCategories.length === categories.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCategories));
    return true;
  },

  /**
   * Get category by name
   */
  getByName(name: string): Category | null {
    const categories = this.getAll();
    return categories.find(category => 
      category.name.toLowerCase() === name.toLowerCase()
    ) || null;
  },
};

