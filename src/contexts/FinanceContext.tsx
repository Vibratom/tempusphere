
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'unpaid' | 'overdue';

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  status: TransactionStatus;
  projectId?: string;
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
}

interface FinanceContextType {
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  removeTransaction: (transactionId: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  budgets: Budget[];
  setBudgets: Dispatch<SetStateAction<Budget[]>>;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  removeBudget: (budgetId: string) => void;
  updateBudget: (budget: Budget) => void;
  categories: string[];
  addCategory: (category: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const defaultCategories = [
    // Income
    'Salary', 
    'Freelance', 
    'Investment Gain', 
    'Interest Income',
    'Loan',
    // Expenses
    'Cost of Goods Sold',
    'Advertising',
    'Commission',
    'Office Supplies',
    'Office Equipment',
    'Groceries', 
    'Utilities', 
    'Rent/Mortgage', 
    'Transportation', 
    'Entertainment', 
    'Interest Expense',
    'Other'
];

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance:transactionsV4', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finance:budgetsV2', []);
  const [categories, setCategories] = useLocalStorage<string[]>('finance:categoriesV2', defaultCategories);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'status'>) => {
    const newTransaction = { ...transaction, id: `txn-${Date.now()}-${Math.random()}`, status: 'paid' as TransactionStatus };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const removeTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories(prev => [...prev, category].sort());
    }
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: `budget-${Date.now()}` };
    setBudgets(prev => [...prev, newBudget]);
  };

  const removeBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };


  const value = {
    transactions,
    setTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    budgets,
    setBudgets,
    addBudget,
    removeBudget,
    updateBudget,
    categories,
    addCategory,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
