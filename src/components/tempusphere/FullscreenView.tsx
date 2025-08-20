
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { PrimaryClock } from './PrimaryClock';
import { WorldClocks } from './WorldClocks';
import { AlarmPanel } from './AlarmPanel';
import { StopwatchPanel } from './StopwatchPanel';
import { TimerPanel } from './TimerPanel';
import { Button } from '../ui/button';
import { Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConverterPanel } from './ConverterPanel';
import { ConferencePlanner } from './ConferencePlanner';
import { CalendarPanel } from './CalendarPanel';
import { SunMoonPanel } from './SunMoonPanel';

interface FullscreenViewProps {
  onExit: () => void;
}

export function FullscreenView({ onExit }: FullscreenViewProps) {
  const { fullscreenSettings, backgroundImage } = useSettings();

  const visibleComponents = Object.values(fullscreenSettings).filter(Boolean);
  const count = visibleComponents.length;

  const gridSetup: Record<number, string> = {
    1: "grid-cols-1 grid-rows-1",
    2: "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1",
    3: "grid-cols-1 md:grid-cols-3 grid-rows-3 md:grid-rows-1",
    4: "grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2",
    5: "grid-cols-1 md:grid-cols-3 grid-rows-5 md:grid-rows-2", // Custom layout for 5
    6: "grid-cols-1 md:grid-cols-3 grid-rows-6 md:grid-rows-2",
    7: "grid-cols-1 md:grid-cols-4 grid-rows-7 md:grid-rows-2", // Custom layout for 7
    8: "grid-cols-1 md:grid-cols-4 grid-rows-8 md:grid-rows-2",
    9: "grid-cols-1 md:grid-cols-3 grid-rows-9 md:grid-rows-3",
  };

  const gridClass = gridSetup[count] || "grid-cols-1 grid-rows-1";
  
  const glassEffect = !!backgroundImage;

  return (
    <div 
        className={cn(
            "fixed inset-0 bg-background z-50 p-4 md:p-8 flex flex-col bg-cover bg-center",
        )}
        style={{backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none'}}
    >
      <div className="absolute inset-0 bg-background/80 dark:bg-background/60 backdrop-blur-sm z-0" />
      <div className="flex-shrink-0 flex justify-end relative z-10">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <Minimize className="h-6 w-6" />
        </Button>
      </div>
      <div className={cn(
          "flex-1 overflow-hidden relative z-10 grid gap-4 md:gap-8 h-full p-0",
           gridClass
      )}>
        {fullscreenSettings.primaryClock && <PrimaryClock fullscreen glass={glassEffect} />}
        {fullscreenSettings.worldClocks && <WorldClocks fullscreen glass={glassEffect} />}
        {fullscreenSettings.alarms && <AlarmPanel fullscreen glass={glassEffect} />}
        {fullscreenSettings.stopwatch && <StopwatchPanel fullscreen glass={glassEffect} />}
        {fullscreenSettings.timer && <TimerPanel fullscreen glass={glassEffect} />}
        {fullscreenSettings.converter && <ConverterPanel fullscreen glass={glassEffect} />}
        {fullscreenSettings.planner && <ConferencePlanner fullscreen glass={glassEffect} />}
        {fullscreenSettings.calendar && <CalendarPanel fullscreen glass={glassEffect} />}
        {fullscreenSettings.sunMoon && <SunMoonPanel fullscreen glass={glassEffect} />}
      </div>
    </div>
  );
}
