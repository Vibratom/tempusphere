
'use client';

import { useState, useEffect } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { PrimaryClock } from '@/components/tempusphere/PrimaryClock';
import { AlarmPanel } from '@/components/tempusphere/AlarmPanel';
import { WorldClocks } from '@/components/tempusphere/WorldClocks';
import { StopwatchPanel, stopwatchHandle } from '@/components/tempusphere/StopwatchPanel';
import { TimerPanel, timerHandle } from '@/components/tempusphere/TimerPanel';
import { SettingsPanel } from '@/components/tempusphere/SettingsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, AlarmClock, Timer, Hourglass, Settings, Expand } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { FullscreenView } from './FullscreenView';
import { AppLogo } from './AppLogo';
import { Footer } from './Footer';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const TABS = ['world-clocks', 'alarms', 'stopwatch', 'timer', 'settings'];

function AppContent() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
  
  const onExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  useHotkeys([
    ['F', toggleFullscreen],
    ['Escape', onExitFullscreen],
    ['Alt+1', () => setActiveTab(TABS[0])],
    ['Alt+2', () => setActiveTab(TABS[1])],
    ['Alt+3', () => {
      setActiveTab(TABS[2]);
      setTimeout(() => document.getElementById('stopwatch-start-btn')?.focus(), 0);
    }],
    ['Alt+4', () => {
      setActiveTab(TABS[3]);
      setTimeout(() => document.getElementById('timer-start-btn')?.focus(), 0);
    }],
    ['Alt+5', () => setActiveTab(TABS[4])],
    [' ', (e) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        if (activeTab === 'stopwatch') {
            e.preventDefault();
            stopwatchHandle.startStop();
        }
        if (activeTab === 'timer') {
            e.preventDefault();
            timerHandle.startStop();
        }
    }],
    ['L', (e) => {
        if (activeTab === 'stopwatch') {
            e.preventDefault();
            stopwatchHandle.lap();
        }
    }],
     ['R', (e) => {
        if (activeTab === 'stopwatch') {
            e.preventDefault();
            stopwatchHandle.reset();
        }
        if (activeTab === 'timer') {
            e.preventDefault();
            timerHandle.reset();
        }
    }],
  ]);

  if (isFullscreen) {
    return <FullscreenView onExit={onExitFullscreen}/>
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <AppLogo className="h-6 w-6" />
          <h1 className="text-xl font-semibold tracking-tighter">Tempusphere</h1>
        </div>
        <div className="flex-1" />
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                        <Expand className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Fullscreen (F)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </header>
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
        <PrimaryClock />
        <Separator className="w-full max-w-5xl"/>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl">
          <TooltipProvider>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="world-clocks" className="flex-col md:flex-row h-auto gap-1 py-2"><Globe/> World Clocks</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 1</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="alarms" className="flex-col md:flex-row h-auto gap-1 py-2"><AlarmClock/> Alarms</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 2</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="stopwatch" className="flex-col md:flex-row h-auto gap-1 py-2"><Hourglass/> Stopwatch</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 3</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="timer" className="flex-col md:flex-row h-auto gap-1 py-2"><Timer/> Timer</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 4</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="settings" className="flex-col md:flex-row h-auto gap-1 py-2"><Settings/> Settings</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 5</p></TooltipContent>
            </Tooltip>
          </TabsList>
          </TooltipProvider>
          <TabsContent value="world-clocks" className="animation-fade-in mt-4">
            <WorldClocks />
          </TabsContent>
          <TabsContent value="alarms" className="animation-fade-in mt-4">
            <AlarmPanel />
          </TabsContent>
          <TabsContent value="stopwatch" className="animation-fade-in mt-4">
            <StopwatchPanel />
          </TabsContent>
          <TabsContent value="timer" className="animation-fade-in mt-4">
            <TimerPanel />
          </TabsContent>
          <TabsContent value="settings" className="animation-fade-in mt-4">
             <SettingsPanel />
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
