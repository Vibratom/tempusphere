'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { PrimaryClock } from './PrimaryClock';
import { WorldClocks } from './WorldClocks';
import { AlarmPanel } from './AlarmPanel';
import { StopwatchPanel } from './StopwatchPanel';
import { TimerPanel } from './TimerPanel';
import { Button } from '../ui/button';
import { Minimize } from 'lucide-react';

interface FullscreenViewProps {
  onExit: () => void;
}

export function FullscreenView({ onExit }: FullscreenViewProps) {
  const { fullscreenSettings } = useSettings();

  const gridClasses: {[key: number]: string} = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1',
    3: 'grid-cols-1 md:grid-cols-3 grid-rows-3 md:grid-rows-1',
    4: 'grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2',
    5: 'grid-cols-1 md:grid-cols-3 grid-rows-5 md:grid-rows-2',
  }
  
  const visibleComponents = Object.values(fullscreenSettings).filter(Boolean).length;


  return (
    <div className="fixed inset-0 bg-background z-50 p-4 md:p-8 flex flex-col">
      <div className="flex-shrink-0 flex justify-end">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <Minimize className="h-5 w-5" />
        </Button>
      </div>
      <main className={`flex-1 grid gap-4 md:gap-8 ${gridClasses[visibleComponents] || 'grid-cols-1'} p-4 md:p-8`}>
        {fullscreenSettings.primaryClock && <PrimaryClock />}
        {fullscreenSettings.worldClocks && <WorldClocks />}
        {fullscreenSettings.alarms && <AlarmPanel />}
        {fullscreenSettings.stopwatch && <StopwatchPanel />}
        {fullscreenSettings.timer && <TimerPanel />}
      </main>
    </div>
  );
}
