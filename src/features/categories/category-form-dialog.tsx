'use client';

import { useState } from 'react';
import { Category, TransactionType } from '@/types';
import { useTransactions } from '@/context/transactions-context';
import { CURRENCIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this category instead of creating one */
  category?: Category | null;
  /** Preselected type when creating a new category */
  defaultType?: TransactionType;
}

const SWATCHES = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF',
  '#FF8B94', '#95E1D3', '#C7CEEA', '#B4B4B4',
  '#E8A87C', '#85CDCA', '#C38D9E', '#41B3A3',
];

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultType = 'expense',
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {category ? 'Edit category' : 'New category'}
          </DialogTitle>
          <DialogDescription>
            Categories group your entries. Income sources have no budget.
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmounts DialogContent children when closed, so the form
            state below initializes fresh on every open */}
        <CategoryForm
          key={category?.id ?? 'new'}
          category={category}
          defaultType={defaultType}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  defaultType,
  onOpenChange,
}: {
  category?: Category | null;
  defaultType: TransactionType;
  onOpenChange: (open: boolean) => void;
}) {
  const { categories, settings, addCategory, updateCategory } = useTransactions();
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType);
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [color, setColor] = useState(
    () => category?.color ?? SWATCHES[categories.length % SWATCHES.length]
  );
  const [budget, setBudget] = useState(
    category?.budget != null ? String(category.budget) : ''
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isIncome = type === 'income';
  const currencySymbol =
    CURRENCIES.find(c => c.value === settings.currency)?.symbol ?? '$';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('A name is required');
      return;
    }
    const clash = categories.find(
      c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== category?.id
    );
    if (clash) {
      setError('A category with this name already exists');
      return;
    }
    const parsedBudget = !isIncome && budget ? parseFloat(budget) : undefined;
    if (!isIncome && budget && (isNaN(parsedBudget!) || parsedBudget! <= 0)) {
      setError('Budget must be a positive number');
      return;
    }

    const input = {
      name: trimmed,
      type,
      icon: icon.trim() || undefined,
      color,
      // Income categories never carry a budget
      budget: isIncome ? undefined : parsedBudget,
    };
    setSaving(true);
    setError('');
    try {
      if (category) {
        await updateCategory({ id: category.id, ...input });
      } else {
        await addCategory(input);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the category.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              type === t
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'income' ? 'Income source' : 'Expense category'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_5rem] gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category-name">Name</Label>
          <Input
            id="category-name"
            placeholder={isIncome ? 'e.g. Salary' : 'e.g. Subscriptions'}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category-icon">Icon</Label>
          <Input
            id="category-icon"
            placeholder={isIncome ? '💰' : '🧾'}
            maxLength={4}
            className="text-center"
            value={icon}
            onChange={e => setIcon(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map(swatch => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use color ${swatch}`}
              className="size-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: swatch,
                borderColor:
                  color === swatch ? 'var(--foreground)' : 'transparent',
              }}
              onClick={() => setColor(swatch)}
            />
          ))}
        </div>
      </div>

      {!isIncome && (
        <div className="space-y-1.5">
          <Label htmlFor="category-budget">
            Monthly budget{' '}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currencySymbol}
            </span>
            <Input
              id="category-budget"
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              placeholder="No limit"
              className="pl-7 tabular"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : category ? 'Save changes' : 'Add category'}
        </Button>
      </DialogFooter>
    </form>
  );
}
