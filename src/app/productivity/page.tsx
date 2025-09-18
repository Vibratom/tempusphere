
'use client';

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { LayoutTemplate, Sparkles } from 'lucide-react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { Toolbar } from '@/components/canvas/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { SettingsProvider } from '@/contexts/SettingsContext';

// --- Types ---

export type Tool = 'PENCIL' | 'ERASER' | 'TEXT' | 'SELECT';
export interface Point { x: number; y: number; }
export type Path = Point[];

export interface BaseObject {
  id: string;
}

export interface PathObject extends BaseObject {
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
  data: string; // Base64 image data
}

export interface TextObject extends BaseObject {
  type: 'TEXT';
  x: number;
  y: number;
  text: string;
  font: string;
  color: string;
  width: number;
}

export type CanvasObject = PathObject | ImageObject | TextObject;
export type HistoryEntry = { objects: CanvasObject[] };

export interface Template {
    name: string;
    description: string;
    objects: Omit<CanvasObject, 'id'>[];
}


// --- Constants ---
export const PAGE_WIDTH = 1200;
export const PAGE_HEIGHT = 792; 

const templates: Template[] = [
  {
    name: 'Title & Subtitle',
    description: 'A classic starting slide for a presentation.',
    objects: [
      { type: 'TEXT', text: 'Click to edit Title', font: 'bold 72px sans-serif', color: '#000000', x: 100, y: 250, width: 0 },
      { type: 'TEXT', text: 'Click to edit subtitle', font: '36px sans-serif', color: '#333333', x: 100, y: 350, width: 0 },
    ],
  },
  {
    name: 'Two Columns with Image',
    description: 'A versatile layout for showcasing an image and text.',
    objects: [
      { type: 'TEXT', text: 'Heading', font: 'bold 48px sans-serif', color: '#000000', x: 50, y: 50, width: 0 },
      { type: 'TEXT', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.', font: '24px sans-serif', color: '#333333', x: 50, y: 120, width: 0 },
      { type: 'IMAGE', data: 'https://picsum.photos/seed/canvas1/500/500', x: 650, y: 150, width: 500, height: 500 },
    ],
  },
  {
    name: 'Blank Canvas',
    description: 'Start from scratch with a clean, empty page.',
    objects: [],
  }
];

// --- Helper Functions ---

const serializeObjects = (objects: CanvasObject[]): string => JSON.stringify(objects);
const deserializeObjects = (json: string): CanvasObject[] => {
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// --- Main Component ---

function ProductivityContent() {
    const [isClient, setIsClient] = useState(false);
    const [savedObjects, setSavedObjects] = useLocalStorage<string>('canvas:objects-v6', '[]');
    
    const [tool, setTool] = useState<Tool>('SELECT');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(5);
    
    const [objects, setObjects] = useState<CanvasObject[]>([]);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

    // --- Initialization and Persistence ---

    useLayoutEffect(() => {
        setIsClient(true);
        const initialObjects = deserializeObjects(savedObjects);
        setObjects(initialObjects);
        const initialEntry = { objects: initialObjects };
        setHistory([initialEntry]);
        setHistoryIndex(0);

        if (initialObjects.length === 0) {
            setIsTemplateDialogOpen(true);
        }
    }, []);

    useEffect(() => {
        if (!isClient || historyIndex < 0) return;
        const currentObjects = history[historyIndex]?.objects;
        if(currentObjects) {
          setSavedObjects(serializeObjects(currentObjects));
        }
    }, [history, historyIndex, isClient, setSavedObjects]);


    const updateHistory = (newObjects: CanvasObject[], overwriteLast = false) => {
        const newEntry = { objects: newObjects };
        let newHistory;
        let newIndex;
        if (overwriteLast && historyIndex > -1) {
            newHistory = [...history.slice(0, historyIndex), newEntry];
            newIndex = historyIndex;
        } else {
            newHistory = [...history.slice(0, historyIndex + 1), newEntry];
            newIndex = newHistory.length - 1;
        }
        setHistory(newHistory);
        setHistoryIndex(newIndex);
        setObjects(newObjects);
    };

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setObjects(history[historyIndex - 1].objects);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setObjects(history[historyIndex + 1].objects);
        }
    }, [history, historyIndex]);

    const applyTemplate = (template: Template) => {
      const newObjects = template.objects.map(obj => ({
        ...obj,
        id: uuidv4(),
      }));
      updateHistory(newObjects);
      setIsTemplateDialogOpen(false);
    }
    
    if (!isClient) return <div className="w-full h-screen bg-muted animate-pulse"></div>;

    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col">
                <Toolbar 
                    tool={tool}
                    setTool={setTool}
                    strokeColor={strokeColor}
                    setStrokeColor={setStrokeColor}
                    strokeWidth={strokeWidth}
                    setStrokeWidth={setStrokeWidth}
                    selectedObjectId={selectedObjectId}
                    setIsTemplateDialogOpen={setIsTemplateDialogOpen}
                    updateHistory={updateHistory}
                    objects={objects}
                    setSelectedObjectId={setSelectedObjectId}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                />
                 <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Choose a Template</DialogTitle>
                      <DialogDescription>Select a starting point for your design or begin with a blank canvas.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                      {templates.map(template => (
                        <Card key={template.name} className="cursor-pointer hover:shadow-md hover:border-primary" onClick={() => applyTemplate(template)}>
                          <CardHeader>
                            <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center text-xs text-muted-foreground">{template.name}</div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-xs">{template.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="flex-1 relative bg-muted/50 overflow-hidden">
                   <Canvas 
                        objects={objects}
                        tool={tool}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        selectedObjectId={selectedObjectId}
                        setObjects={setObjects}
                        setSelectedObjectId={setSelectedObjectId}
                        updateHistory={updateHistory}
                        handleUndo={handleUndo}
                        handleRedo={handleRedo}
                        setTool={setTool}
                   />
                </div>
            </main>
            <Footer />
        </div>
    );
}


export default function ProductivityPage() {
    return (
        <SettingsProvider>
            <ProductivityContent />
        </SettingsProvider>
    );
}

