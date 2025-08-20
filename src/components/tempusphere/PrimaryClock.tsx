
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { DigitalClock } from './DigitalClock';
import { AnalogClock } from './AnalogClock';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

export function PrimaryClock() {
  const { primaryClockMode, primaryClockTimezone, clockSize, backgroundImage } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const clockScale = clockSize / 100;

  const containerStyle = useMemo(() => {
    // Base height in rem, corresponds to min-h-[14rem]
    const baseHeight = 14; 
    // Base width for analog clock is 16rem (w-64), digital is wider
    const baseWidth = primaryClockMode === 'analog' ? 16 : 24;

    const scaledHeight = baseHeight * clockScale;
    const scaledWidth = baseWidth * clockScale;

    // We only want to expand, not shrink below the minimum.
    const height = Math.max(baseHeight, scaledHeight);
    const width = Math.max(baseWidth, scaledWidth);


    return {
      minHeight: `${height}rem`,
      // Add some padding to the width to avoid edges touching
      minWidth: `min(${width + 4}rem, 100%)`, 
    };
  }, [clockSize, clockScale, primaryClockMode]);


  return (
    <Card className="overflow-hidden flex items-center justify-center transition-all duration-300" style={containerStyle}>
      <CardContent 
        className="p-6 flex flex-col items-center justify-center relative bg-cover bg-center"
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
      >
        {backgroundImage && <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />}
        <div style={{ transform: `scale(${clockScale})`}} className="transition-transform duration-300 z-10">
            {isClient ? (
              primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock />
            ) : (
              primaryClockMode === 'analog' ? <Skeleton className="w-64 h-64 rounded-full" /> : <Skeleton className="w-80 h-24" />
            )}
        </div>

        <div className="text-muted-foreground mt-4 text-lg font-medium z-10">
          {isClient ? (primaryClockTimezone === 'local' ? 'Local Time' : 'UTC Time') : <Skeleton className="w-24 h-6" />}
        </div>
      </CardContent>
    </Card>
  );
}
