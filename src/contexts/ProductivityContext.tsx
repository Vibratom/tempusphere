
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

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

// --- Main Context ---

interface ProductivityContextType {
    canvasState: CanvasState;
    setCanvasState: Dispatch<SetStateAction<CanvasState>>;
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

    const value = {
        canvasState,
        setCanvasState,
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
