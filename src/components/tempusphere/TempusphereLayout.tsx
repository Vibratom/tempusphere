'use client';

import { useState, useEffect } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { AlarmPanel } from '@/components/tempusphere/AlarmPanel';
import { WorldClocks } from '@/components/tempusphere/WorldClocks';
import { StopwatchPanel } from '@/components/tempusphere/StopwatchPanel';
import { TimerPanel } from '@/components/tempusphere/TimerPanel';
import { SettingsPanel } from '@/components/tempusphere/SettingsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, AlarmClock, Timer, Hourglass, Settings, Expand } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { FullscreenView } from './FullscreenView';
import { AppLogo } from './AppLogo';
import { Footer } from './Footer';

function AppContent() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };


  if (isFullscreen) {
    return <FullscreenView onExit={exitFullscreen}/>
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <AppLogo className="h-6 w-6" />
          <h1 className="text-xl font-semibold tracking-tighter">Tempusphere</h1>
        </div>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          <Expand className="h-5 w-5" />
        </Button>
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
      <Footer />
    </div>
  )
}

export function TempusphereLayout() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
