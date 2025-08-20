
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { DigitalClock } from './DigitalClock';
import { AnalogClock } from './AnalogClock';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export function PrimaryClock() {
  const { primaryClockMode, primaryClockTimezone, clockSize, backgroundImage } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const clockScale = clockSize / 100;

  return (
    <Card className="overflow-hidden">
      <CardContent 
        className="p-6 flex flex-col items-center justify-center min-h-[14rem] relative bg-cover bg-center"
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" style={{backgroundColor: backgroundImage ? 'rgba(var(--card-rgb), 0.5)' : 'transparent'}}/>
        <div style={{ transform: `scale(${clockScale})`}} className="transition-transform duration-300">
            {isClient ? (
            primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock />
            ) : (
            <Skeleton className="w-64 h-24" />
            )}
        </div>

        <div className="text-muted-foreground mt-4 text-lg font-medium z-10">
          {isClient ? (primaryClockTimezone === 'local' ? 'Local Time' : 'UTC Time') : <Skeleton className="w-24 h-6" />}
        </div>
      </CardContent>
    </Card>
  );
}
