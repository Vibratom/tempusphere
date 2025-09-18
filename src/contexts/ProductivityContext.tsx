
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';


// --- Types for Canvas ---

type Tool = 'PENCIL' | 'ERASER' | 'TEXT' | 'SELECT';
interface Point { x: number; y: number; }
type Path = Point[];

interface BaseObject {
  id: string;
}

interface PathObject extends BaseObject {
  type: 'PATH';
  path: Path;
  strokeColor: string;
  strokeWidth: number;
  isErasing: boolean;
}

interface ImageObject extends BaseObject {
  type: 'IMAGE';
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
}

interface TextObject extends BaseObject {
  type: 'TEXT';
  x: number;
  y: number;
  text: string;
  font: string;
  color: string;
  width: number;
}

type CanvasObject = PathObject | ImageObject | TextObject;
type HistoryEntry = { objects: CanvasObject[] };

interface CanvasState {
    objects: CanvasObject[];
    history: HistoryEntry[];
    historyIndex: number;
    selectedObjectId: string | null;
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    scale: number;
    viewOffset: { x: number; y: number };
}

// --- Types for Habit Tracker ---
export interface Habit {
    id: string;
    name: string;
    frequency: 'daily' | 'weekly';
    completions: string[]; // Array of date strings 'YYYY-MM-DD'
    createdAt: string;
}


// --- Main Context ---

interface ProductivityContextType {
    canvasState: CanvasState;
    setCanvasState: Dispatch<SetStateAction<CanvasState>>;
    habits: Habit[];
    addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void;
    removeHabit: (habitId: string) => void;
    toggleHabitCompletion: (habitId: string, date: string) => void;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export function ProductivityProvider({ children }: { children: ReactNode }) {
    const [canvasState, setCanvasState] = useLocalStorage<CanvasState>('productivity:canvasStateV1', {
        objects: [],
        history: [{ objects: [] }],
        historyIndex: 0,
        selectedObjectId: null,
        tool: 'SELECT',
        strokeColor: '#000000',
        strokeWidth: 5,
        scale: 0.5,
        viewOffset: { x: 50, y: 50 },
    });

    const [habits, setHabits] = useLocalStorage<Habit[]>('productivity:habitsV1', []);

    const addHabit = (habitData: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: uuidv4(),
            completions: [],
            createdAt: new Date().toISOString(),
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const removeHabit = (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
    };

    const toggleHabitCompletion = (habitId: string, date: string) => {
        setHabits(prev => prev.map(habit => {
            if (habit.id === habitId) {
                const completions = new Set(habit.completions);
                if (completions.has(date)) {
                    completions.delete(date);
                } else {
                    completions.add(date);
                }
                return { ...habit, completions: Array.from(completions) };
            }
            return habit;
        }));
    };

    const value = {
        canvasState,
        setCanvasState,
        habits,
        addHabit,
        removeHabit,
        toggleHabitCompletion,
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
