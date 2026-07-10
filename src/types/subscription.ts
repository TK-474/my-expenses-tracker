export type SubscriptionCadence = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  /** Amount per cycle, in the account's global currency */
  amount: number;
  cadence: SubscriptionCadence;
  /** Day of month it renews (1–31) */
  billingDay: number;
  /** Month it renews (1–12); only set for yearly subscriptions */
  billingMonth?: number;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  /** Bank or wallet provider; only meaningful for 'card' or 'digital' */
  bank?: string;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  cadence: SubscriptionCadence;
  billingDay: number;
  billingMonth?: number;
  paymentMethod?: 'cash' | 'card' | 'digital' | 'other';
  bank?: string;
  status?: SubscriptionStatus;
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  id: string;
}
