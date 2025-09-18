
'use client';

import React from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { LeftToolbar } from '@/components/canvas/LeftToolbar';
import { RightSidebar } from '@/components/canvas/RightSidebar';
import { OptionsBar } from '@/components/canvas/OptionsBar';
import { StatusBar } from '@/components/canvas/StatusBar';
import { Canvas } from '@/components/canvas/Canvas';
import { SlidesPanel } from '@/components/canvas/SlidesPanel';
import { Header } from '@/components/tempusphere/Header';
import { ProductivityProvider, useProductivity } from '@/contexts/ProductivityContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Undo, Redo, Download } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { PanelLeft, PanelRight } from 'lucide-react';

function ProductivityHeaderContent() {
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
        <>
            <div className="flex-1 flex justify-center items-center gap-2">
                 <Input defaultValue="Untitled Design" className="text-base md:text-lg font-semibold border-none focus-visible:ring-0 shadow-none p-0 h-auto text-center w-56" />
                <div className="w-[1px] h-6 bg-border mx-1 md:mx-2 hidden md:block"></div>
                <Button variant="ghost" size="icon" onClick={handleUndo} className="hidden md:flex"><Undo /></Button>
                <Button variant="ghost" size="icon" onClick={handleRedo} className="hidden md:flex"><Redo /></Button>
            </div>
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
        </>
    );
}


function ProductivityContent() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <Header centerContent={<ProductivityHeaderContent />} />
      <main className="flex-1 flex flex-col">
        <div className="w-full h-full flex flex-col md:flex-row">
          {/* Desktop Layout */}
          <div className="hidden md:flex w-16 flex-shrink-0">
            <LeftToolbar />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <OptionsBar />
            <div className="flex-1 flex overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="flex-1 hidden md:flex">
                <ResizablePanel defaultSize={75} minSize={50}>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 relative bg-muted/50 overflow-auto">
                      <Canvas />
                    </div>
                    <SlidesPanel />
                    <StatusBar />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={15}>
                  <RightSidebar />
                </ResizablePanel>
              </ResizablePanelGroup>

              {/* Mobile Layout */}
              <div className="md:hidden flex-1 flex flex-col h-full">
                <div className="flex-1 relative bg-muted/50 overflow-auto">
                  <Canvas />
                </div>
                <SlidesPanel />
                <StatusBar />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductivityPage() {
  return (
    <SettingsProvider>
      <ProductivityProvider>
        <ProductivityContent />
      </ProductivityProvider>
    </SettingsProvider>
  );
}
