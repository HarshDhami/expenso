import React from 'react';
import { Wallet, Plus, Trash2, CreditCard, Landmark, Smartphone } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Account, ACCOUNT_TYPES } from '../types';

interface AccountListProps {
  accounts: Account[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  currency: string;
}

export default function AccountList({ accounts, onDelete, onAdd, currency }: AccountListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold italic serif">My Accounts</h2>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all active:scale-95 shadow-lg"
        >
          <Plus size={20} />
          <span>Add Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="group relative bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF00]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "p-4 rounded-2xl",
                  account.type === 'cash' ? "bg-green-50 text-green-600" : 
                  account.type === 'bank' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                )}>
                  {account.type === 'cash' ? <CreditCard size={24} /> : 
                   account.type === 'bank' ? <Landmark size={24} /> : <Smartphone size={24} />}
                </div>
                <button 
                  onClick={() => onDelete(account.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic serif mb-1">{account.type}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{account.name}</h3>
                <p className="text-3xl font-black tracking-tighter text-[#141414]">
                  {formatCurrency(account.balance, currency)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Wallet size={40} />
            </div>
            <h3 className="text-xl font-bold italic serif mb-2">No accounts found</h3>
            <p className="text-gray-400 font-medium mb-8">Add your bank, cash, or UPI accounts to start tracking.</p>
            <button 
              onClick={onAdd}
              className="px-8 py-3 bg-[#141414] text-white font-bold rounded-2xl hover:bg-[#141414]/90 transition-all active:scale-95 shadow-lg"
            >
              Add Your First Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
