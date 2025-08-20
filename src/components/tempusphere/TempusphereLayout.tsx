'use client';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { AlarmPanel } from '@/components/tempusphere/AlarmPanel';
import { WorldClocks } from '@/components/tempusphere/WorldClocks';
import { StopwatchPanel } from '@/components/tempusphere/StopwatchPanel';
import { TimerPanel } from '@/components/tempusphere/TimerPanel';
import { SettingsPanel } from '@/components/tempusphere/SettingsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Globe, AlarmClock, Timer, Hourglass, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TempusphereLayout() {
  return (
    <SettingsProvider>
      <div className="min-h-screen w-full bg-background">
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <h1 className="text-xl font-semibold tracking-tighter">Tempusphere</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <PrimaryClock />
          <Separator />
          <Tabs defaultValue="world-clocks" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger value="world-clocks" className="flex gap-2 items-center"><Globe size={16}/> World Clocks</TabsTrigger>
              <TabsTrigger value="alarms" className="flex gap-2 items-center"><AlarmClock size={16}/> Alarms</TabsTrigger>
              <TabsTrigger value="stopwatch" className="flex gap-2 items-center"><Hourglass size={16}/> Stopwatch</TabsTrigger>
              <TabsTrigger value="timer" className="flex gap-2 items-center"><Timer size={16}/> Timer</TabsTrigger>
              <TabsTrigger value="settings" className="flex gap-2 items-center"><Settings size={16}/> Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="world-clocks" className="animation-fade-in">
              <WorldClocks />
            </TabsContent>
            <TabsContent value="alarms" className="animation-fade-in">
              <AlarmPanel />
            </TabsContent>
            <TabsContent value="stopwatch" className="animation-fade-in">
              <StopwatchPanel />
            </TabsContent>
            <TabsContent value="timer" className="animation-fade-in">
              <TimerPanel />
            </TabsContent>
            <TabsContent value="settings" className="animation-fade-in">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SettingsPanel />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SettingsProvider>
  );
}
