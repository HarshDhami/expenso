import React from 'react';
import { PieChart, Plus, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Budget, Transaction } from '../types';

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  currency: string;
}

export default function BudgetList({ budgets, transactions, onDelete, onAdd, currency }: BudgetListProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const budgetProgress = budgets.map(b => {
    const spent = transactions
      .filter(t => {
        const date = t.date && typeof (t.date as any).toDate === 'function' 
          ? (t.date as any).toDate() 
          : new Date(t.date as any);
        
        if (isNaN(date.getTime())) return false;

        return t.type === 'expense' && 
               t.category === b.category &&
               date.getMonth() === b.month &&
               date.getFullYear() === b.year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...b,
      spent,
      percent: (spent / b.amount) * 100
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold italic serif">Monthly Budgets</h2>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all active:scale-95 shadow-lg"
        >
          <Plus size={20} />
          <span>Set Budget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgetProgress.map((budget) => (
          <div key={budget.id} className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <PieChart size={24} className="text-[#00FF00]" />
              </div>
              <button 
                onClick={() => onDelete(budget.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{budget.category}</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest italic serif">
                  {new Date(budget.year, budget.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-500">Spent: {formatCurrency(budget.spent, currency)}</span>
                  <span className="text-[#141414]">Limit: {formatCurrency(budget.amount, currency)}</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      budget.percent > 100 ? "bg-red-500" : budget.percent > 80 ? "bg-orange-500" : "bg-[#00FF00]"
                    )}
                    style={{ width: `${Math.min(budget.percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={cn(
                    budget.percent > 100 ? "text-red-500" : "text-gray-400"
                  )}>
                    {budget.percent.toFixed(1)}% used
                  </span>
                  <span className="text-gray-400">
                    {formatCurrency(Math.max(0, budget.amount - budget.spent), currency)} left
                  </span>
                </div>
              </div>

              {budget.percent > 80 && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-xs font-bold",
                  budget.percent > 100 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                )}>
                  <AlertCircle size={14} />
                  {budget.percent > 100 ? "Budget exceeded!" : "Nearing budget limit (80%+)"}
                </div>
              )}
            </div>
          </div>
        ))}

        {budgetProgress.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <PieChart size={40} />
            </div>
            <h3 className="text-xl font-bold italic serif mb-2">No budgets set</h3>
            <p className="text-gray-400 font-medium mb-8">Set monthly limits for categories to control your spending.</p>
            <button 
              onClick={onAdd}
              className="px-8 py-3 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all active:scale-95 shadow-lg"
            >
              Set a Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
