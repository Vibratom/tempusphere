
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';


// --- Types for Canvas ---

type Tool = 'select' | 'hand' | 'crop' | 'draw' | 'text' | 'shape' | 'frame';
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

export interface ImageObject extends BaseObject {
  type: 'IMAGE';
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
  // Image editing properties
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  activeFilter?: string;
  filterIntensity?: number;
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

export type CanvasObject = PathObject | ImageObject | TextObject;

interface Slide {
    id: string;
    objects: CanvasObject[];
    history: HistoryEntry[];
    historyIndex: number;
}
type HistoryEntry = { objects: CanvasObject[] };

export type PageSize = 'A4' | 'Letter' | 'Widescreen';
export type PageOrientation = 'Portrait' | 'Landscape';

export interface PageSetup {
    size: PageSize;
    orientation: PageOrientation;
    width: number;
    height: number;
}


export interface CanvasState {
    slides: Slide[];
    activeSlideId: string | null;
    selectedObjectId: string | null;
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    scale: number;
    viewOffset: { x: number; y: number };
    page: PageSetup;
}

// --- Main Context ---

interface ProductivityContextType {
    canvasState: CanvasState;
    setCanvasState: Dispatch<SetStateAction<CanvasState>>;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export function ProductivityProvider({ children }: { children: ReactNode }) {
    const [canvasState, setCanvasState] = useLocalStorage<CanvasState>('productivity:canvasStateV4', {
        slides: [{ id: uuidv4(), objects: [], history: [{ objects: [] }], historyIndex: 0 }],
        activeSlideId: null, // will be set to first slide on mount
        selectedObjectId: null,
        tool: 'select',
        strokeColor: '#000000',
        strokeWidth: 5,
        scale: 0.5,
        viewOffset: { x: 50, y: 50 },
        page: { size: 'Widescreen', orientation: 'Landscape', width: 1920, height: 1080 }
    });

    if (canvasState.slides.length > 0 && !canvasState.activeSlideId) {
        setCanvasState(prev => ({...prev, activeSlideId: prev.slides[0].id}));
    }

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
