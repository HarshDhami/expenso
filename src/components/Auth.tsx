import React from 'react';
import { Wallet, Sparkles, TrendingUp, ShieldCheck, Globe, X } from 'lucide-react';
import { loginWithGoogle } from '../firebase';
import { motion } from 'motion/react';

export default function Auth({ onClose }: { onClose?: () => void }) {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setError(null);
    
    try {
      await loginWithGoogle();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for authentication. Please add it to your Firebase Console.');
      } else {
        setError('An unexpected error occurred during sign-in. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
        onClick={!isLoggingIn ? onClose : undefined}
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-5xl bg-[#F5F5F0] rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/20"
      >
        {/* Left Side - Visuals */}
        <div className="hidden lg:flex flex-1 bg-[#141414] text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00FF00]/5 rounded-full -mr-72 -mt-72 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00FF00]/5 rounded-full -ml-48 -mb-48 blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-[#00FF00] rounded-full flex items-center justify-center text-black">
                <Wallet size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight italic serif">EXPENSO</h1>
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl xl:text-7xl font-black tracking-tighter leading-none italic serif">
                TRACK <span className="text-[#00FF00]">EVERY</span> PENNY.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-md">
                The smart, AI-powered expense tracker for modern financial freedom.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
            <Feature icon={<Sparkles className="text-[#00FF00]" size={18} />} title="AI Insights" desc="Smart categorization" />
            <Feature icon={<TrendingUp className="text-[#00FF00]" size={18} />} title="Budgeting" category="Pro" desc="Set limits" />
            <Feature icon={<ShieldCheck className="text-[#00FF00]" size={18} />} title="Secure" desc="Cloud sync" />
            <Feature icon={<Globe className="text-[#00FF00]" size={18} />} title="Multi-Currency" desc="Global support" />
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
          {onClose && !isLoggingIn && (
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 hover:bg-[#141414]/5 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          )}

          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold italic serif">Get Started</h3>
              <p className="text-gray-500 font-medium">Join 10,000+ users tracking their wealth.</p>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-[#141414] text-[#141414] font-bold rounded-3xl hover:bg-gray-50 transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                )}
                <span>{isLoggingIn ? 'Signing in...' : 'Continue with Google'}</span>
              </button>
              
              <p className="text-center text-[10px] text-gray-400 pt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#141414]/5 shadow-sm">
              <p className="text-xs text-gray-500 italic serif">
                "Expenso changed how I view my money. The AI categorization is like magic!"
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div>
                  <p className="text-[10px] font-bold">Alex Rivera</p>
                  <p className="text-[8px] text-gray-400">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Feature({ icon, title, desc, category }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold uppercase tracking-widest italic serif">{title}</span>
        {category && <span className="text-[10px] bg-[#00FF00] text-black px-1.5 py-0.5 rounded font-black">{category}</span>}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
