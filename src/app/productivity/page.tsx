
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DraftingCompass, Target } from 'lucide-react';
import { HabitTracker } from '@/components/productivity/HabitTracker';

function DesignTool() {
    return (
        <div className="w-full h-full flex flex-col">
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
        </div>
    );
}

function ProductivityContent() {
    return (
        <div className="min-h-screen w-full bg-muted/50 flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center">
                 <Tabs defaultValue="design" className="w-full flex-1 flex flex-col">
                    <div className="flex justify-center p-4">
                        <TabsList className="h-auto">
                            <TabsTrigger value="design" className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
                                <DraftingCompass className="w-5 h-5" />
                                <span>Design</span>
                            </TabsTrigger>
                            <TabsTrigger value="habits" className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
                                <Target className="w-5 h-5" />
                                <span>Habits</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="design" className="flex-1 flex flex-col">
                        <DesignTool />
                    </TabsContent>
                    <TabsContent value="habits" className="p-4 md:p-8 flex-1">
                        <HabitTracker />
                    </TabsContent>
                </Tabs>
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
