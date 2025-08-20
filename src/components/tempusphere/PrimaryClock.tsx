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
  const [localTimezoneName, setLocalTimezoneName] = useState('Local Time');

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        try {
            const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
            setLocalTimezoneName(tzName);
        } catch (e) {
            console.error("Could not determine local timezone", e);
            setLocalTimezoneName('Local Time');
        }
    }
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
      maxWidth: `min(${width + 4}rem, 100%)`, 
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
            "overflow-hidden flex items-center justify-center transition-all duration-300 relative bg-cover bg-center", 
            fullscreen ? "w-full h-full bg-transparent" : "w-full",
            !fullscreen && backgroundImage && "bg-background/80"
        )}
        style={!fullscreen ? {...containerStyle, backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' } : {}}
    >
      <div 
        className={cn(
          "p-6 flex flex-col items-center justify-center w-full h-full",
          !fullscreen && backgroundImage && "backdrop-blur-md"
        )}
      >
        <div style={{ transform: `scale(${clockScale})`}} className="transition-transform duration-300 z-10">
            {primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock />}
        </div>

        <div className={cn(
          "text-lg font-medium z-10 mt-4 px-3 py-1 rounded-full",
           backgroundImage ? "bg-black/20 text-white/90 backdrop-blur-sm" : "text-muted-foreground"
        )}>
          {primaryClockTimezone === 'local' ? localTimezoneName : 'UTC Time'}
        </div>
      </div>
    </Container>
  );
}
