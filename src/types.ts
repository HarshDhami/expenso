import { Timestamp } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currency?: string;
  createdAt: Timestamp | string;
}

export interface Transaction {
  id: string;
  uid: string;
  amount: number;
  category: string;
  date: Timestamp | string;
  description?: string;
  type: 'income' | 'expense';
  accountId: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Timestamp | string;
}

export interface Account {
  id: string;
  uid: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  createdAt: Timestamp | string;
}

export interface Budget {
  id: string;
  uid: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt: Timestamp | string;
}

export interface Goal {
  id: string;
  uid: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Timestamp | string;
  createdAt: Timestamp | string;
}

export const CATEGORIES = {
  expense: [
    'Food', 'Rent', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Others'
  ],
  income: [
    'Salary', 'Freelance', 'Investment', 'Gift', 'Others'
  ]
};

export const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'upi', label: 'UPI' }
];
