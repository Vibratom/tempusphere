'use client';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { AlarmPanel } from '@/components/tempusphere/AlarmPanel';
import { WorldClocks } from '@/components/tempusphere/WorldClocks';
import { StopwatchPanel } from '@/components/tempusphere/StopwatchPanel';
import { TimerPanel } from '@/components/tempusphere/TimerPanel';
import { SettingsPanel } from '@/components/tempusphere/SettingsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Globe, AlarmClock, Timer, Hourglass, Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function TempusphereLayout() {
  return (
    <SettingsProvider>
      <SidebarProvider>
        <div className="min-h-screen w-full">
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <h2 className="text-xl font-semibold">Settings</h2>
            </SidebarHeader>
            <SidebarContent>
              <SettingsPanel />
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                <h1 className="text-xl font-semibold tracking-tighter">Tempusphere</h1>
              </div>
              <div className="ml-auto">
                <SidebarTrigger>
                  <Menu />
                </SidebarTrigger>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <PrimaryClock />
              <Separator />
              <Tabs defaultValue="world-clocks" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger value="world-clocks" className="flex gap-2 items-center"><Globe size={16}/> World Clocks</TabsTrigger>
                  <TabsTrigger value="alarms" className="flex gap-2 items-center"><AlarmClock size={16}/> Alarms</TabsTrigger>
                  <TabsTrigger value="stopwatch" className="flex gap-2 items-center"><Hourglass size={16}/> Stopwatch</TabsTrigger>
                  <TabsTrigger value="timer" className="flex gap-2 items-center"><Timer size={16}/> Timer</TabsTrigger>
                </TabsList>
                <TabsContent value="world-clocks">
                  <WorldClocks />
                </TabsContent>
                <TabsContent value="alarms">
                  <AlarmPanel />
                </TabsContent>
                <TabsContent value="stopwatch">
                  <StopwatchPanel />
                </TabsContent>
                <TabsContent value="timer">
                  <TimerPanel />
                </TabsContent>
              </Tabs>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SettingsProvider>
  );
}
