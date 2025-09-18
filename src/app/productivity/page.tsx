
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
import { ProductivityProvider } from '@/contexts/ProductivityContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

function ProductivityContent() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <Header />
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
