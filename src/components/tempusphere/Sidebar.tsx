
'use client';
import { TabbedPanels } from "./TabbedPanels";
import { Dispatch, SetStateAction } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { WorldClocks } from "./WorldClocks";
import { AlarmPanel } from "./AlarmPanel";
import { StopwatchPanel } from "./StopwatchPanel";
import { TimerPanel } from "./TimerPanel";
import { TABS } from "./TabbedPanels";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Globe, AlarmClock, Timer, Hourglass, Settings } from 'lucide-react';
import { Separator } from "../ui/separator";

interface SidebarProps {
    header: React.ReactNode;
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
    onTabChange?: () => void;
}

export function Sidebar({ header, activeTab, setActiveTab, onTabChange }: SidebarProps) {
    
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (onTabChange) {
            onTabChange();
        }
    }

    return (
        <div className="w-full max-w-sm border-r flex flex-col bg-background/95">
            {header}
             <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="p-4 flex-1 flex" >
                <TabsList className="grid h-auto grid-rows-4 w-20">
                    <TabsTrigger value="world-clocks" className="flex-col h-auto gap-1 py-2"><Globe className="w-5 h-5" /> <span className="text-xs">World</span></TabsTrigger>
                    <TabsTrigger value="alarms" className="flex-col h-auto gap-1 py-2"><AlarmClock className="w-5 h-5" /> <span className="text-xs">Alarms</span></TabsTrigger>
                    <TabsTrigger value="stopwatch" className="flex-col h-auto gap-1 py-2"><Hourglass className="w-5 h-5" /> <span className="text-xs">Stopwatch</span></TabsTrigger>
                    <TabsTrigger value="timer" className="flex-col h-auto gap-1 py-2"><Timer className="w-5 h-5" /> <span className="text-xs">Timer</span></TabsTrigger>
                </TabsList>
                <Separator orientation="vertical" className="mx-4"/>
                <div className="flex-1">
                    <TabsContent value="world-clocks" className="animation-fade-in h-full mt-0">
                        <WorldClocks />
                    </TabsContent>
                    <TabsContent value="alarms" className="animation-fade-in h-full mt-0">
                        <AlarmPanel />
                    </TabsContent>
                    <TabsContent value="stopwatch" className="animation-fade-in h-full mt-0">
                        <StopwatchPanel />
                    </TabsContent>
                    <TabsContent value="timer" className="animation-fade-in h-full mt-0">
                        <TimerPanel />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
