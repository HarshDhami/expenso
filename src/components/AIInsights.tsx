import React from 'react';
import { Sparkles, TrendingUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { getSpendingInsights } from '../services/geminiService';
import { Transaction, Budget } from '../types';
import { cn } from '../lib/utils';

interface AIInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: string;
}

export default function AIInsights({ transactions, budgets, currency }: AIInsightsProps) {
  const [insights, setInsights] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const currencySymbol = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(0).replace(/[0-9.,\s]/g, '');

  const fetchInsights = async () => {
    setIsLoading(true);
    const result = await getSpendingInsights(transactions, budgets);
    setInsights(result);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (transactions.length > 0) {
      fetchInsights();
    }
  }, [transactions.length, budgets.length]);

  return (
    <div className={cn(
      "bg-[#141414] text-white rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group transition-all duration-500",
      isCollapsed ? "p-4" : "p-8"
    )}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF00]/10 rounded-full -mr-48 -mt-48 blur-[100px] transition-all group-hover:bg-[#00FF00]/20 duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FF00]/5 rounded-full -ml-32 -mb-32 blur-[80px]" />

      <div className="relative z-10">
        {/* Collapsed Bar Header */}
        <div className={cn(
          "flex items-center justify-between w-full transition-all duration-300",
          isCollapsed ? "opacity-100" : "opacity-0 h-0 overflow-hidden pointer-events-none"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF00] text-black rounded-xl shadow-lg shadow-[#00FF00]/20">
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest uppercase italic serif text-[#00FF00]">Gemini AI</span>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase italic serif text-gray-400">Financial Intelligence</span>
            </div>
          </div>
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Header Section */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-[#00FF00] text-black rounded-[1.5rem] shadow-lg shadow-[#00FF00]/20">
                        <Sparkles size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tighter italic serif">GEMINI AI</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic serif">Financial Intelligence</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsCollapsed(true)}
                      className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white lg:hidden"
                    >
                      <ChevronUp size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400 leading-relaxed font-medium italic serif">
                      Real-time analysis of your spending habits, budget health, and personalized savings opportunities.
                    </p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={fetchInsights}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-50 group/btn"
                      >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} className="text-[#00FF00] group-hover/btn:scale-110 transition-transform" />}
                        <span className="text-sm font-bold tracking-tight">Refresh Analysis</span>
                      </button>
                      <button 
                        onClick={() => setIsCollapsed(true)}
                        className="hidden lg:flex p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-gray-400 hover:text-white"
                        title="Collapse"
                      >
                        <ChevronUp size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center gap-8">
                    <InsightStat label="Daily Avg" value={`${currencySymbol}450`} />
                    <InsightStat label="Savings" value="24%" />
                    <InsightStat label="Health" value="Good" />
                  </div>
                </div>

                {/* Insights Content Section */}
                <div className="lg:col-span-8 bg-white/5 rounded-[2rem] p-6 border border-white/5 min-h-[200px]">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {isLoading ? (
                      <div className="space-y-4 py-4">
                        <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded-full w-1/3 animate-pulse" />
                      </div>
                    ) : (
                      <div className="text-gray-200 leading-relaxed font-medium">
                        {insights ? (
                          <ReactMarkdown>{insights}</ReactMarkdown>
                        ) : (
                          <div className="py-12 text-center space-y-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                              <Sparkles size={40} className="text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500 italic serif max-w-xs mx-auto">
                              Add transactions to unlock personalized AI insights and spending analysis.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InsightStat({ label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest italic serif font-bold">{label}</p>
      <p className="text-sm font-black text-[#00FF00] tracking-tighter">{value}</p>
    </div>
  );
}
