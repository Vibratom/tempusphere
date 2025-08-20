
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorldClocks } from "./WorldClocks"
import { AlarmPanel } from "./AlarmPanel"
import { StopwatchPanel } from "./StopwatchPanel"
import { TimerPanel } from "./TimerPanel"
import { SettingsPanel } from "./SettingsPanel"
import { Globe, AlarmClock, Timer, Hourglass, Settings } from 'lucide-react';
import { useHotkeys } from "@/hooks/use-hotkeys";
import { stopwatchHandle } from "./StopwatchPanel";
import { timerHandle } from "./TimerPanel";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

export const TABS = ['world-clocks', 'alarms', 'stopwatch', 'timer', 'settings'];

interface TabbedPanelsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function TabbedPanels({ activeTab, setActiveTab }: TabbedPanelsProps) {
  useHotkeys([
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
    
    return (
        <>
        <Separator className="w-full max-w-5xl my-4"/>
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
             <Card>
                <SettingsPanel />
             </Card>
          </TabsContent>
        </Tabs>
        </>
    )
}
