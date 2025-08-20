
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorldClocks } from "./WorldClocks"
import { AlarmPanel } from "./AlarmPanel"
import { StopwatchPanel } from "./StopwatchPanel"
import { TimerPanel } from "./TimerPanel"
import { ConverterPanel } from "./ConverterPanel";
import { SettingsPanel } from "./SettingsPanel"
import { Globe, AlarmClock, Timer, Hourglass, Settings, Scale, Users, CalendarDays, Sunrise, CloudSun } from 'lucide-react';
import { useHotkeys } from "@/hooks/use-hotkeys";
import { stopwatchHandle } from "./StopwatchPanel";
import { timerHandle } from "./TimerPanel";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { ConferencePlanner } from "./ConferencePlanner";
import { CalendarPanel } from "./CalendarPanel";
import { SunMoonPanel } from "./SunMoonPanel";
import { WeatherPanel } from "./WeatherPanel";

export const TABS = ['world-clocks', 'alarms', 'stopwatch', 'timer', 'converter', 'planner', 'calendar', 'sun-moon', 'weather'];

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
    ['Alt+6', () => setActiveTab(TABS[5])],
    ['Alt+7', () => setActiveTab(TABS[6])],
    ['Alt+8', () => setActiveTab(TABS[7])],
    ['Alt+9', () => setActiveTab(TABS[8])],
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
        if (document.activeElement?.tagName === 'INPUT') return;
        if (activeTab === 'stopwatch') {
            e.preventDefault();
            stopwatchHandle.lap();
        }
    }],
     ['R', (e) => {
        if (document.activeElement?.tagName === 'INPUT') return;
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl flex-1 flex flex-col">
          <TooltipProvider>
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-9 h-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="world-clocks" className="flex-col md:flex-row h-auto gap-2 py-2"><Globe/><span>World Clocks</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 1</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="alarms" className="flex-col md:flex-row h-auto gap-2 py-2"><AlarmClock/><span>Alarms</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 2</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="stopwatch" className="flex-col md:flex-row h-auto gap-2 py-2"><Hourglass/><span>Stopwatch</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 3</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="timer" className="flex-col md:flex-row h-auto gap-2 py-2"><Timer/><span>Timer</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 4</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="converter" className="flex-col md:flex-row h-auto gap-2 py-2"><Scale/><span>Converter</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 5</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="planner" className="flex-col md:flex-row h-auto gap-2 py-2"><Users/><span>Planner</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 6</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="calendar" className="flex-col md:flex-row h-auto gap-2 py-2"><CalendarDays/><span>Calendar</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 7</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="sun-moon" className="flex-col md:flex-row h-auto gap-2 py-2"><Sunrise/><span>Sun & Moon</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 8</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="weather" className="flex-col md:flex-row h-auto gap-2 py-2"><CloudSun/><span>Weather</span></TabsTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Alt + 9</p></TooltipContent>
            </Tooltip>
          </TabsList>
          </TooltipProvider>
          <Separator className="w-full my-4"/>
          <TabsContent value="world-clocks" className="animation-fade-in flex-1">
            <WorldClocks />
          </TabsContent>
          <TabsContent value="alarms" className="animation-fade-in flex-1">
            <AlarmPanel />
          </TabsContent>
          <TabsContent value="stopwatch" className="animation-fade-in flex-1">
            <StopwatchPanel />
          </TabsContent>
          <TabsContent value="timer" className="animation-fade-in flex-1">
            <TimerPanel />
          </TabsContent>
           <TabsContent value="converter" className="animation-fade-in flex-1">
            <ConverterPanel />
          </TabsContent>
          <TabsContent value="planner" className="animation-fade-in flex-1">
            <ConferencePlanner />
          </TabsContent>
          <TabsContent value="calendar" className="animation-fade-in flex-1">
            <CalendarPanel />
          </TabsContent>
          <TabsContent value="sun-moon" className="animation-fade-in flex-1">
            <SunMoonPanel />
          </TabsContent>
           <TabsContent value="weather" className="animation-fade-in flex-1">
            <WeatherPanel />
          </TabsContent>
        </Tabs>
    )
}
