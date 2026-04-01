import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Target } from 'lucide-react';
import { cn } from '../lib/utils';

const schema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.number().min(0.01, "Target amount must be greater than 0"),
  currentAmount: z.number().min(0, "Current amount cannot be negative"),
  deadline: z.string().optional(),
});

interface GoalFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  currency: string;
}

export default function GoalForm({ onSubmit, onClose, currency }: GoalFormProps) {
  const currencySymbol = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(0).replace(/[0-9.,\s]/g, '');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currentAmount: 0,
      targetAmount: 0
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold italic serif flex items-center gap-2">
            <Target size={20} className="text-[#00FF00]" />
            Create Savings Goal
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Goal Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
              placeholder="e.g. New Car, Emergency Fund"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register('targetAmount', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00] font-bold text-lg"
                  placeholder="0.00"
                />
              </div>
              {errors.targetAmount && <p className="text-xs text-red-500">{errors.targetAmount.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Already Saved</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register('currentAmount', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
                  placeholder="0.00"
                />
              </div>
              {errors.currentAmount && <p className="text-xs text-red-500">{errors.currentAmount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Target Date (Optional)</label>
            <input
              type="date"
              {...register('deadline')}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00]"
            />
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
              {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Start Saving'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
