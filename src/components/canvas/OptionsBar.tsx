
'use client';

import { Button } from "../ui/button";
import { Undo, Redo } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet';
import { LeftToolbar } from './LeftToolbar';
import { RightSidebar } from './RightSidebar';
import { useProductivity } from '@/contexts/ProductivityContext';
import { PanelLeft, PanelRight } from 'lucide-react';

export function OptionsBar() {
    const { setCanvasState } = useProductivity();

     const handleUndo = () => {
        setCanvasState(prev => {
            const activeSlide = prev.slides.find(s => s.id === prev.activeSlideId);
            if (!activeSlide || activeSlide.historyIndex <= 0) return prev;
            
            const newHistoryIndex = activeSlide.historyIndex - 1;
            const newObjects = activeSlide.history[newHistoryIndex].objects;
            
            return {
                ...prev,
                slides: prev.slides.map(s => 
                    s.id === prev.activeSlideId 
                    ? { ...s, objects: newObjects, historyIndex: newHistoryIndex }
                    : s
                )
            };
        });
    };

    const handleRedo = () => {
         setCanvasState(prev => {
            const activeSlide = prev.slides.find(s => s.id === prev.activeSlideId);
            if (!activeSlide || activeSlide.historyIndex >= activeSlide.history.length - 1) return prev;

            const newHistoryIndex = activeSlide.historyIndex + 1;
            const newObjects = activeSlide.history[newHistoryIndex].objects;
            
            return {
                ...prev,
                slides: prev.slides.map(s => 
                    s.id === prev.activeSlideId 
                    ? { ...s, objects: newObjects, historyIndex: newHistoryIndex }
                    : s
                )
            };
        });
    };
    
    return (
        <div className="h-14 bg-background border-b px-2 md:px-4 flex items-center justify-between gap-4">
             <div className="md:hidden flex-1">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><PanelLeft /></Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <LeftToolbar />
                    </SheetContent>
                </Sheet>
            </div>
            
            <div className="flex-1 px-2 md:px-8 flex items-center justify-center gap-2">
                 <Button variant="ghost" size="icon" onClick={handleUndo} className="flex md:hidden"><Undo /></Button>
                <Button variant="ghost" size="icon" onClick={handleRedo} className="flex md:hidden"><Redo /></Button>
                <span className="text-sm text-muted-foreground hidden lg:block">Contextual Tool Options will appear here</span>
            </div>

            <div className="md:hidden flex-1 flex justify-end">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><PanelRight /></Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 w-64">
                        <RightSidebar />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
