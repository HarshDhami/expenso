import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { ACCOUNT_TYPES } from '../types';

const schema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(['cash', 'bank', 'upi']),
  balance: z.number().min(0, "Initial balance cannot be negative"),
});

interface AccountFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  currency: string;
}

export default function AccountForm({ onSubmit, onClose, currency }: AccountFormProps) {
  const currencySymbol = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(0).replace(/[0-9.,\s]/g, '');

  // Only show UPI if the currency is INR
  const filteredAccountTypes = ACCOUNT_TYPES.filter(type => 
    type.value !== 'upi' || currency === 'INR'
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'cash',
      balance: 0
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold italic serif flex items-center gap-2">
            <Wallet size={20} className="text-[#00FF00]" />
            Add New Account
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Account Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
              placeholder="e.g. Main Savings, Pocket Cash"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Account Type</label>
            <select
              {...register('type')}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
            >
              {filteredAccountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Initial Balance</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                {...register('balance', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00] font-bold text-lg"
                placeholder="0.00"
              />
            </div>
            {errors.balance && <p className="text-xs text-red-500">{errors.balance.message}</p>}
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
              {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
