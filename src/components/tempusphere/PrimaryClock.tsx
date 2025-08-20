'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { DigitalClock } from './DigitalClock';
import { AnalogClock } from './AnalogClock';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface PrimaryClockProps {
    fullscreen?: boolean;
}

export function PrimaryClock({ fullscreen = false }: PrimaryClockProps) {
  const { primaryClockMode, primaryClockTimezone, clockSize, backgroundImage } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const clockScale = isClient ? clockSize / 100 : 1;

  const containerStyle = useMemo(() => {
    if (!isClient) return { minHeight: '14rem' };

    const baseHeight = 14; 
    const baseWidth = primaryClockMode === 'analog' ? 16 : 24;

    const scaledHeight = baseHeight * clockScale;
    const scaledWidth = baseWidth * clockScale;

    const height = Math.max(baseHeight, scaledHeight);
    const width = Math.max(baseWidth, scaledWidth);

    return {
      minHeight: `${height}rem`,
      minWidth: `min(${width + 4}rem, 100%)`, 
    };
  }, [clockSize, clockScale, primaryClockMode, isClient]);


  if (!isClient && !fullscreen) {
    return (
      <Card className="overflow-hidden flex items-center justify-center transition-all duration-300 w-full" style={containerStyle}>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <Skeleton className="w-80 h-24" />
          <div className="text-muted-foreground mt-4 text-lg font-medium">
              <Skeleton className="w-24 h-6" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const Container = fullscreen ? 'div' : Card;

  return (
    <Container 
        className={cn(
            "overflow-hidden flex items-center justify-center transition-all duration-300 relative", 
            fullscreen ? "w-full h-full" : "bg-cover bg-center",
        )}
        style={!fullscreen ? {...containerStyle, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' } : {}}
    >
      <div 
        className={cn(
          "p-6 flex flex-col items-center justify-center w-full h-full", 
          !fullscreen && "relative",
          fullscreen && backgroundImage && "bg-transparent"
        )}
      >
        {!fullscreen && backgroundImage && <div className="absolute inset-0 bg-card/80 dark:bg-card/60 backdrop-blur-sm z-0" />}
        <div style={{ transform: `scale(${clockScale})`}} className="transition-transform duration-300 z-10">
            {primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock />}
        </div>

        <div className="text-muted-foreground mt-4 text-lg font-medium z-10">
          {primaryClockTimezone === 'local' ? 'Local Time' : 'UTC Time'}
        </div>
      </div>
    </Container>
  );
}
