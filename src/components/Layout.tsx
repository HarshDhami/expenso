import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Receipt, Wallet, Target, PieChart, LogOut, LogIn, Menu, X, Sparkles, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  handleExportCSV: () => void;
  onLoginClick: () => void;
  onCurrencyChange: (currency: string) => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  handleExportCSV, 
  onLoginClick,
  onCurrencyChange
}: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Rupee' },
    { code: 'USD', symbol: '$', label: 'Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'Pound' },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      {/* Sidebar / Mobile Nav */}
      <nav className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] text-white transform transition-transform duration-300 ease-in-out xl:translate-x-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00FF00] rounded-full flex items-center justify-center text-black">
                <Wallet size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight italic serif">EXPENSO</h1>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="xl:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  activeTab === tab.id 
                    ? "bg-[#00FF00] text-black font-semibold" 
                    : "hover:bg-white/10 text-gray-400 hover:text-white"
                )}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
            
            {!user && (
              <button
                onClick={() => {
                  onLoginClick();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <LogIn size={20} />
                <span>Log In</span>
              </button>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4">
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-white/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="w-full flex items-center gap-3 px-4 py-4 bg-[#00FF00] text-black font-bold rounded-xl hover:bg-[#00FF00]/90 transition-all active:scale-95"
              >
                <LogIn size={20} />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="xl:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#F5F5F0]/80 backdrop-blur-md border-b border-[#141414]/10 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="xl:hidden p-2 hover:bg-[#141414]/5 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-[#141414]/10 rounded-full px-3 py-1">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onCurrencyChange(c.code)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    user?.currency === c.code 
                      ? "bg-[#141414] text-white" 
                      : "hover:bg-gray-100 text-gray-500"
                  )}
                  title={c.label}
                >
                  {c.symbol}
                </button>
              ))}
            </div>

            {!user && (
              <button 
                onClick={onLoginClick}
                className="px-6 py-2 bg-[#00FF00] text-black font-bold rounded-full hover:bg-[#00FF00]/90 transition-all active:scale-95"
              >
                Log In
              </button>
            )}
            <button 
              onClick={handleExportCSV}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-[#141414]/10 rounded-full hover:bg-gray-50 transition-all"
            >
              <FileText size={18} />
              <span className="text-sm font-medium">Export CSV</span>
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
