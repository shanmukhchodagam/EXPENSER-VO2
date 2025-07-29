export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdBy: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Participant {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
  isAdmin: boolean;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string;
  splitAmong: string[];
  splitType: 'equal' | 'custom' | 'percentage';
  customSplit?: { [userId: string]: number };
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settlement {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'other';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}