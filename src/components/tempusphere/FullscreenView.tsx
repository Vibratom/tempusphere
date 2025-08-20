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
import { Card, CardContent } from '../ui/card';

interface FullscreenViewProps {
  onExit: () => void;
}

export function FullscreenView({ onExit }: FullscreenViewProps) {
  const { fullscreenSettings, backgroundImage } = useSettings();

  const gridClasses: {[key: number]: string} = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1',
    3: 'grid-cols-1 md:grid-cols-3 grid-rows-3 md:grid-rows-1',
    4: 'grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2',
    5: 'grid-cols-1 md:grid-cols-3 grid-rows-5 md:grid-rows-2', // This can be improved
  }
  
  const visibleComponents = Object.values(fullscreenSettings).filter(Boolean).length;


  return (
    <div 
        className={cn(
            "fixed inset-0 bg-background z-50 p-4 md:p-8 flex flex-col bg-cover bg-center",
        )}
        style={{backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none'}}
    >
      {backgroundImage && <div className="absolute inset-0 bg-background/80 dark:bg-background/60 backdrop-blur-sm z-0" />}
      <div className="flex-shrink-0 flex justify-end relative z-10">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <Minimize className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden relative z-10">
        <Card className="h-full bg-card/50 dark:bg-card/30 backdrop-blur-md border-2 border-border/30 overflow-hidden">
          <CardContent className={`h-full grid gap-4 md:gap-8 ${gridClasses[visibleComponents] || 'grid-cols-1'} p-4 md:p-8`}>
            {fullscreenSettings.primaryClock && <PrimaryClock fullscreen />}
            {fullscreenSettings.worldClocks && <WorldClocks fullscreen />}
            {fullscreenSettings.alarms && <AlarmPanel fullscreen />}
            {fullscreenSettings.stopwatch && <StopwatchPanel fullscreen />}
            {fullscreenSettings.timer && <TimerPanel fullscreen />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
