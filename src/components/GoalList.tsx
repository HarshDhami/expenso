import React from 'react';
import { Target, Plus, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Goal } from '../types';

interface GoalListProps {
  goals: Goal[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  currency: string;
}

export default function GoalList({ goals, onDelete, onAdd, currency }: GoalListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold italic serif">Savings Goals</h2>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all active:scale-95 shadow-lg"
        >
          <Plus size={20} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <Target size={24} className="text-[#00FF00]" />
                </div>
                <button 
                  onClick={() => onDelete(goal.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{goal.name}</h3>
                  {goal.deadline && (
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Calendar size={12} /> Target: {formatDate(goal.deadline as any)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-500">Saved: {formatCurrency(goal.currentAmount, currency)}</span>
                    <span className="text-[#141414]">Goal: {formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00FF00] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400">{percent.toFixed(1)}% complete</span>
                    <span className="text-gray-400">
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), currency)} left
                    </span>
                  </div>
                </div>

                {percent >= 100 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold">
                    <TrendingUp size={14} /> Goal reached! 🎉
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Target size={40} />
            </div>
            <h3 className="text-xl font-bold italic serif mb-2">No savings goals</h3>
            <p className="text-gray-400 font-medium mb-8">Dreaming of something big? Start a goal and track your progress.</p>
            <button 
              onClick={onAdd}
              className="px-8 py-3 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all active:scale-95 shadow-lg"
            >
              Create a Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
