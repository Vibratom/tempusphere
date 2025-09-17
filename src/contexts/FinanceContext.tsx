'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (transactionId: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  budgets: Budget[];
  setBudgets: Dispatch<SetStateAction<Budget[]>>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance:transactionsV2', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finance:budgetsV1', []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: `txn-${Date.now()}-${Math.random()}` };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const removeTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const value = {
    transactions,
    setTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    budgets,
    setBudgets
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
