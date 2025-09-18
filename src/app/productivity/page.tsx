
'use client';

import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { LeftSidebar } from '@/components/canvas/LeftSidebar';
import { RightSidebar } from '@/components/canvas/RightSidebar';
import { TopToolbar } from '@/components/canvas/TopToolbar';
import { StatusBar } from '@/components/canvas/StatusBar';
import { Canvas } from '@/components/canvas/Canvas';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { ProductivityProvider } from '@/contexts/ProductivityContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

function ProductivityContent() {
    return (
        <div className="min-h-screen w-full bg-muted/50 flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col">
                <TopToolbar />
                <div className="flex-1 flex overflow-hidden">
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={20} minSize={15}>
                            <LeftSidebar />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col h-full">
                                <div className="flex-1 relative bg-background">
                                    <Canvas />
                                </div>
                                <StatusBar />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={25} minSize={15}>
                            <RightSidebar />
                        </ResizablePanel>
                    </ResizablePanelGroup>
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
