import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Target, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Transaction, Budget, Account } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  currency: string;
}

export default function Dashboard({ transactions, budgets, accounts, currency }: DashboardProps) {
  const isUnauthenticated = transactions.length === 0 && accounts.length === 0;

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  const COLORS = ['#00FF00', '#141414', '#8E9299', '#FF4444', '#F27D26', '#5A5A40', '#0000FF'];

  // Monthly trends (last 6 months)
  const monthlyData = transactions.reduce((acc: any[], t) => {
    const date = t.date && typeof (t.date as any).toDate === 'function' 
      ? (t.date as any).toDate() 
      : new Date(t.date as any);
      
    if (isNaN(date.getTime())) return acc;

    const month = date.toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      if (t.type === 'income') existing.income += t.amount;
      else existing.expense += t.amount;
    } else {
      acc.push({ 
        month, 
        income: t.type === 'income' ? t.amount : 0, 
        expense: t.type === 'expense' ? t.amount : 0 
      });
    }
    return acc;
  }, []).slice(-6);

  // Budget progress
  const budgetProgress = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      category: b.category,
      budget: b.amount,
      spent,
      percent: (spent / b.amount) * 100
    };
  });

  return (
    <div className="space-y-8">
      {isUnauthenticated && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#00FF00] p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#00FF00]/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-[#00FF00]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold italic serif">Start Your Financial Journey</h3>
              <p className="text-sm font-medium text-black/70">Sign in to sync your data across devices and unlock AI-powered insights.</p>
            </div>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
            className="px-8 py-3 bg-black text-white font-bold rounded-2xl hover:bg-black/90 transition-all active:scale-95 whitespace-nowrap"
          >
            Connect Account
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Balance" 
          value={totalBalance} 
          icon={<Wallet className="text-[#00FF00]" />} 
          currency={currency}
          trend={savingsRate > 0 ? `+${savingsRate.toFixed(1)}% savings` : `${savingsRate.toFixed(1)}% savings`}
        />
        <StatCard 
          title="Total Income" 
          value={totalIncome} 
          icon={<ArrowUpRight className="text-green-500" />} 
          currency={currency}
          color="text-green-600"
        />
        <StatCard 
          title="Total Expense" 
          value={totalExpense} 
          icon={<ArrowDownRight className="text-red-500" />} 
          currency={currency}
          color="text-red-600"
        />
        <StatCard 
          title="Savings Rate" 
          value={savingsRate} 
          icon={<TrendingUp className="text-[#00FF00]" />} 
          isPercent
          color="text-[#00FF00]"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Income vs Expense Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6 italic serif">Income vs Expense Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF00" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#00FF00" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#141414" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6 italic serif">Category Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budgets & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6 italic serif">Budget Progress</h3>
          <div className="space-y-6">
            {budgetProgress.length > 0 ? budgetProgress.map((b) => (
              <div key={b.category} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{b.category}</span>
                  <span>{formatCurrency(b.spent, currency)} / {formatCurrency(b.budget, currency)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(b.percent, 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      b.percent > 100 ? "bg-red-500" : b.percent > 80 ? "bg-orange-500" : "bg-[#00FF00]"
                    )}
                  />
                </div>
                {b.percent > 100 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> Over budget by {formatCurrency(b.spent - b.budget, currency)}
                  </p>
                )}
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400">
                <Target className="mx-auto mb-2 opacity-20" size={48} />
                <p>No budgets set for this month</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Balances */}
        <div className="bg-[#141414] text-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold mb-6 italic serif">My Accounts</h3>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FF00]/20 flex items-center justify-center text-[#00FF00]">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{account.type}</p>
                  </div>
                </div>
                <p className="font-bold">{formatCurrency(account.balance, currency)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, currency, trend, isPercent, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl">
          {icon}
        </div>
        {trend && <span className="text-xs font-medium text-gray-400">{trend}</span>}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className={cn("text-2xl font-bold tracking-tight", color)}>
          {isPercent ? `${value.toFixed(1)}%` : formatCurrency(value, currency)}
        </p>
      </div>
    </div>
  );
}
