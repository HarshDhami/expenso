import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: any) {
  if (!date) return 'N/A';
  
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (date.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
