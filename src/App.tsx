import React from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  UserProfile,
  Transaction, 
  Account, 
  Budget, 
  Goal
} from './types';

// Error handling types
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = `Permission Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-[32px] shadow-xl border border-[#141414]/5 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold italic serif mb-4">Application Error</h2>
            <p className="text-gray-600 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[#141414] text-white font-bold rounded-2xl hover:bg-black transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import { formatDate } from './lib/utils';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import AccountForm from './components/AccountForm';
import BudgetForm from './components/BudgetForm';
import GoalForm from './components/GoalForm';
import AccountList from './components/AccountList';
import BudgetList from './components/BudgetList';
import GoalList from './components/GoalList';
import Auth from './components/Auth';
import AIInsights from './components/AIInsights';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [currency, setCurrency] = React.useState<string>(() => {
    return localStorage.getItem('user_currency') || 'INR';
  });

  // Country and Currency Detection
  React.useEffect(() => {
    const detectLocation = async () => {
      if (localStorage.getItem('user_currency')) return;

      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.currency) {
          const detectedCurrency = data.currency;
          localStorage.setItem('user_currency', detectedCurrency);
          setCurrency(detectedCurrency);
          
          if (auth.currentUser) {
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
              currency: detectedCurrency,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
      }
    };

    detectLocation();
  }, []);

  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  
  // Modals
  const [showTransactionForm, setShowTransactionForm] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [showAccountForm, setShowAccountForm] = React.useState(false);
  const [showBudgetForm, setShowBudgetForm] = React.useState(false);
  const [showGoalForm, setShowGoalForm] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Auth Listener
  React.useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    window.addEventListener('open-auth', handleOpenAuth);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (!userDoc.exists()) {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              currency: localStorage.getItem('user_currency') || 'INR',
              createdAt: serverTimestamp() as any
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
            localStorage.setItem('user_currency', newUser.currency);
          } else {
            const userData = userDoc.data() as UserProfile;
            setUser(userData);
            setCurrency(userData.currency);
            localStorage.setItem('user_currency', userData.currency);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      window.removeEventListener('open-auth', handleOpenAuth);
    };
  }, []);

  // Show Auth Modal if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  // Data Listeners
  React.useEffect(() => {
    if (!user?.uid) return;

    const qTransactions = query(collection(db, 'transactions'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const qAccounts = query(collection(db, 'accounts'), where('uid', '==', user.uid));
    const qBudgets = query(collection(db, 'budgets'), where('uid', '==', user.uid));
    const qGoals = query(collection(db, 'goals'), where('uid', '==', user.uid));

    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });
    const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'accounts');
    });
    const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budgets');
    });
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'goals');
    });

    return () => {
      unsubTransactions();
      unsubAccounts();
      unsubBudgets();
      unsubGoals();
    };
  }, [user]);

  // Handlers
  const handleUpdateCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('user_currency', newCurrency);

    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { currency: newCurrency });
        setUser(prev => prev ? { ...prev, currency: newCurrency } : null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Account'];
    const rows = transactions.map(t => [
      formatDate(t.date as any),
      t.type,
      t.category,
      t.amount,
      t.description || '',
      t.accountId
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenso_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recurring Expense Processor
  React.useEffect(() => {
    if (!user || transactions.length === 0) return;

    const processRecurring = async () => {
      const now = new Date();
      const recurring = transactions.filter(t => t.isRecurring);
      
      for (const t of recurring) {
        const lastDate = t.date && typeof (t.date as any).toDate === 'function' 
          ? (t.date as any).toDate() 
          : new Date(t.date as any);
          
        if (isNaN(lastDate.getTime())) continue;

        let nextDate = new Date(lastDate);
        
        if (t.recurringInterval === 'daily') nextDate.setDate(lastDate.getDate() + 1);
        else if (t.recurringInterval === 'weekly') nextDate.setDate(lastDate.getDate() + 7);
        else if (t.recurringInterval === 'monthly') nextDate.setMonth(lastDate.getMonth() + 1);
        else if (t.recurringInterval === 'yearly') nextDate.setFullYear(lastDate.getFullYear() + 1);

        if (nextDate <= now) {
          // Check if already added for this period
          const alreadyAdded = transactions.some(existing => {
            const eDate = existing.date && typeof (existing.date as any).toDate === 'function'
              ? (existing.date as any).toDate()
              : new Date(existing.date as any);
            
            return existing.description === t.description && 
                   !isNaN(eDate.getTime()) &&
                   eDate.toDateString() === nextDate.toDateString();
          });

          if (!alreadyAdded) {
            await addDoc(collection(db, 'transactions'), {
              ...t,
              id: undefined,
              date: Timestamp.fromDate(nextDate),
              createdAt: serverTimestamp()
            });
          }
        }
      }
    };

    processRecurring();
  }, [user, transactions.length]);

  const handleAddTransaction = async (data: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      const transactionData: any = {
        ...data,
        uid: user.uid,
        date: Timestamp.fromDate(new Date(data.date)),
      };
      
      if (editingTransaction) {
        await updateDoc(doc(db, 'transactions', editingTransaction.id), transactionData);
      } else {
        transactionData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'transactions'), transactionData);
      }
      
      // Update account balance
      const account = accounts.find(a => a.id === data.accountId);
      if (account) {
        let diff = 0;
        if (editingTransaction) {
          // Reverse old transaction
          const oldAmount = editingTransaction.type === 'income' ? editingTransaction.amount : -editingTransaction.amount;
          const newAmount = data.type === 'income' ? data.amount : -data.amount;
          diff = newAmount - oldAmount;
        } else {
          diff = data.type === 'income' ? data.amount : -data.amount;
        }
        
        const newBalance = account.balance + diff;
        await updateDoc(doc(db, 'accounts', account.id), { balance: newBalance });
      }

      setShowTransactionForm(false);
      setEditingTransaction(null);
    } catch (error) {
      handleFirestoreError(error, editingTransaction ? OperationType.UPDATE : OperationType.CREATE, 'transactions');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const t = transactions.find(t => t.id === id);
      if (t) {
        const account = accounts.find(a => a.id === t.accountId);
        if (account) {
          const newBalance = t.type === 'income' ? account.balance - t.amount : account.balance + t.amount;
          await updateDoc(doc(db, 'accounts', account.id), { balance: newBalance });
        }
        try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
      }
    }
  };

  const handleAddAccount = async (data: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'accounts'), {
        uid: user.uid,
        ...data,
        createdAt: serverTimestamp()
      });
      setShowAccountForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accounts');
    }
  };

  const handleAddBudget = async (data: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'budgets'), {
        uid: user.uid,
        ...data,
        createdAt: serverTimestamp()
      });
      setShowBudgetForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'budgets');
    }
  };

  const handleAddGoal = async (data: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await addDoc(collection(db, 'goals'), {
        uid: user.uid,
        ...data,
        deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
        createdAt: serverTimestamp()
      });
      setShowGoalForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'goals');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#00FF00] mb-4" />
        <p className="text-sm font-bold italic serif tracking-widest uppercase">Loading Wealth...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={logout}
        handleExportCSV={handleExportCSV}
        onLoginClick={() => setShowAuthModal(true)}
        onCurrencyChange={handleUpdateCurrency}
      >
      {activeTab === 'dashboard' && (
        <div className="space-y-8 max-w-7xl mx-auto">
          <AIInsights 
            transactions={transactions} 
            budgets={budgets} 
            currency={currency}
          />
          <Dashboard transactions={transactions} budgets={budgets} accounts={accounts} currency={currency} />
        </div>
      )}

      {activeTab === 'transactions' && (
        <TransactionList 
          transactions={transactions} 
          accounts={accounts}
          onDelete={handleDeleteTransaction}
          onEdit={(t) => { setEditingTransaction(t); setShowTransactionForm(true); }}
          onAdd={() => { setEditingTransaction(null); setShowTransactionForm(true); }}
          currency={currency}
        />
      )}

      {activeTab === 'accounts' && (
        <AccountList 
          accounts={accounts} 
          onDelete={(id) => deleteDoc(doc(db, 'accounts', id))}
          onAdd={() => setShowAccountForm(true)}
          currency={currency}
        />
      )}

      {activeTab === 'budgets' && (
        <BudgetList 
          budgets={budgets} 
          transactions={transactions}
          onDelete={(id) => deleteDoc(doc(db, 'budgets', id))}
          onAdd={() => setShowBudgetForm(true)}
          currency={currency}
        />
      )}

      {activeTab === 'goals' && (
        <GoalList 
          goals={goals} 
          onDelete={(id) => deleteDoc(doc(db, 'goals', id))}
          onAdd={() => setShowGoalForm(true)}
          currency={currency}
        />
      )}

      {/* Modals */}
      {showTransactionForm && (
        <TransactionForm 
          initialData={editingTransaction}
          accounts={accounts}
          onSubmit={handleAddTransaction}
          onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }}
          currency={currency}
        />
      )}

      {showAccountForm && (
        <AccountForm 
          onSubmit={handleAddAccount}
          onClose={() => setShowAccountForm(false)}
          currency={currency}
        />
      )}

      {showBudgetForm && (
        <BudgetForm 
          onSubmit={handleAddBudget}
          onClose={() => setShowBudgetForm(false)}
          currency={currency}
        />
      )}

      {showGoalForm && (
        <GoalForm 
          onSubmit={handleAddGoal}
          onClose={() => setShowGoalForm(false)}
          currency={currency}
        />
      )}

      {showAuthModal && (
        <Auth onClose={() => setShowAuthModal(false)} />
      )}
    </Layout>
    </ErrorBoundary>
  );
}
