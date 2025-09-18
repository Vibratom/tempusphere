
'use client';

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Undo, Redo, Download, PanelLeft, PanelRight } from "lucide-react";
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet';
import { LeftToolbar } from './LeftToolbar';
import { RightSidebar } from './RightSidebar';
import { useProductivity } from '@/contexts/ProductivityContext';

export function OptionsBar() {
    const { canvasState, setCanvasState } = useProductivity();

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
            <div className="flex items-center gap-1 md:gap-2">
                 <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon"><PanelLeft /></Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <LeftToolbar />
                        </SheetContent>
                    </Sheet>
                </div>
                 <div className="w-56">
                    <Input defaultValue="Untitled Design" className="text-base md:text-lg font-semibold border-none focus-visible:ring-0 shadow-none p-0 h-auto text-left" />
                </div>
                <div className="w-[1px] h-6 bg-border mx-1 md:mx-2 hidden md:block"></div>
                 <Button variant="ghost" size="icon" onClick={handleUndo} className="hidden md:flex"><Undo /></Button>
                <Button variant="ghost" size="icon" onClick={handleRedo} className="hidden md:flex"><Redo /></Button>
            </div>
            
            <div className="flex-1 px-2 md:px-8 hidden lg:block">
                 <span className="text-sm text-muted-foreground">Contextual Tool Options will appear here</span>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
                <Button variant="default" size="sm" className="h-8 md:h-10 md:px-4"><Download className="mr-2 h-4 w-4"/>Export</Button>
                 <div className="md:hidden">
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
        </div>
    );
}
