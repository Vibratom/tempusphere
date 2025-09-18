
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface Habit {
    id: string;
    name: string;
    frequency: 'daily' | 'weekly';
    completions: string[]; // Array of ISO date strings
    createdAt: string; // ISO date string
}

interface ProductivityContextType {
    habits: Habit[];
    setHabits: Dispatch<SetStateAction<Habit[]>>;
    addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void;
    toggleHabitCompletion: (habitId: string, date: string) => void;
    removeHabit: (habitId: string) => void;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export function ProductivityProvider({ children }: { children: ReactNode }) {
    const [habits, setHabits] = useLocalStorage<Habit[]>('productivity:habitsV1', []);

    const addHabit = (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => {
        const newHabit: Habit = {
            ...habit,
            id: `habit-${Date.now()}`,
            completions: [],
            createdAt: new Date().toISOString()
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const toggleHabitCompletion = (habitId: string, date: string) => {
        setHabits(prev => prev.map(habit => {
            if (habit.id === habitId) {
                const completions = [...habit.completions];
                const index = completions.indexOf(date);
                if (index > -1) {
                    completions.splice(index, 1);
                } else {
                    completions.push(date);
                }
                return { ...habit, completions };
            }
            return habit;
        }));
    };

    const removeHabit = (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
    };

    const value = {
        habits,
        setHabits,
        addHabit,
        toggleHabitCompletion,
        removeHabit
    };

    return <ProductivityContext.Provider value={value}>{children}</ProductivityContext.Provider>;
}

export function useProductivity() {
    const context = useContext(ProductivityContext);
    if (context === undefined) {
        throw new Error('useProductivity must be used within a ProductivityProvider');
    }
    return context;
}
