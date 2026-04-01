import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Transaction, CATEGORIES, Account } from '../types';
import { getCategorization } from '../services/geminiService';
import { cn } from '../lib/utils';

const schema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

interface TransactionFormProps {
  initialData?: Transaction | null;
  accounts: Account[];
  onSubmit: (data: any) => void;
  onClose: () => void;
  currency: string;
}

export default function TransactionForm({ initialData, accounts, onSubmit, onClose, currency }: TransactionFormProps) {
  const [isCategorizing, setIsCategorizing] = React.useState(false);
  
  const currencySymbol = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(0).replace(/[0-9.,\s]/g, '');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      ...initialData,
      date: new Date(initialData.date as any).toISOString().split('T')[0]
    } : {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      accountId: accounts[0]?.id || ''
    }
  });

  const type = watch('type');
  const description = watch('description');

  const handleAutoCategorize = async () => {
    if (!description) return;
    setIsCategorizing(true);
    const category = await getCategorization(description);
    setValue('category', category);
    setIsCategorizing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold italic serif">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setValue('type', 'expense')}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                type === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'income')}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                type === 'income' ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00] font-bold text-lg"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Description</label>
            <div className="relative">
              <input
                type="text"
                {...register('description')}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
                placeholder="What was this for?"
              />
              <button
                type="button"
                onClick={handleAutoCategorize}
                disabled={isCategorizing || !description}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#00FF00] hover:bg-[#00FF00]/10 rounded-xl disabled:opacity-50 transition-all"
                title="Auto-categorize with AI"
              >
                {isCategorizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
              >
                <option value="">Select Category</option>
                {CATEGORIES[type].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Account</label>
              <select
                {...register('accountId')}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
              >
                <option value="">Select Account</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
              {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <input
              type="checkbox"
              id="isRecurring"
              {...register('isRecurring')}
              className="w-5 h-5 text-[#00FF00] border-none rounded focus:ring-0"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">Recurring Transaction</label>
            
            {watch('isRecurring') && (
              <select
                {...register('recurringInterval')}
                className="ml-auto px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : (initialData ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
