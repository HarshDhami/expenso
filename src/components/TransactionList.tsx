import React from 'react';
import { Search, Plus, Trash2, Edit2, ArrowUpRight, ArrowDownRight, Tag, Wallet, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Transaction, CATEGORIES, Account } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onAdd: () => void;
  currency: string;
}

export default function TransactionList({ transactions, accounts, onDelete, onEdit, onAdd, currency }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = React.useState('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const allCategories = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00FF00] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 lg:w-40 px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#00FF00]"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 lg:w-48 px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#00FF00]"
          >
            <option value="all">All Categories</option>
            {allCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-6 py-3 bg-[#00FF00] text-black font-bold rounded-2xl hover:bg-[#00FF00]/90 transition-all active:scale-95 shadow-lg shadow-[#00FF00]/20 w-full lg:w-auto justify-center"
          >
            <Plus size={20} />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-[#141414]/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider italic serif">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        t.type === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <span className="text-sm font-medium text-gray-600">{formatDate(t.date as any)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{t.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Wallet size={12} /> Account: {accounts.find(a => a.id === t.accountId)?.name || 'Unknown'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      <Tag size={12} /> {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "text-sm font-bold",
                      t.type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(t)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <Receipt size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-bold italic serif">No transactions found</p>
                        <p className="text-sm text-gray-400">Start tracking your wealth by adding your first transaction.</p>
                      </div>
                      <button 
                        onClick={onAdd}
                        className="mt-2 px-6 py-2 bg-[#141414] text-white font-bold rounded-xl hover:bg-[#141414]/90 transition-all active:scale-95"
                      >
                        Add Transaction
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
