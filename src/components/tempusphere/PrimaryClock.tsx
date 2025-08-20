
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Card } from '@/components/ui/card';
import { DigitalClock } from './DigitalClock';
import { AnalogClock } from './AnalogClock';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface PrimaryClockProps {
    fullscreen?: boolean;
    glass?: boolean;
}

export function PrimaryClock({ fullscreen = false, glass = false }: PrimaryClockProps) {
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
  const baseAnalogWidth = 256;
  const analogClockStyle = primaryClockMode === 'analog' ? { width: `${baseAnalogWidth * clockScale}px`, height: `${baseAnalogWidth * clockScale}px` } : {};

  if (!isClient && !fullscreen) {
    return (
      <Card className="flex flex-col items-center justify-center w-full max-w-3xl min-h-[16rem]">
          <Skeleton className="w-80 h-24" />
          <div className="text-muted-foreground mt-4 text-lg font-medium">
              <Skeleton className="w-24 h-6" />
          </div>
      </Card>
    )
  }
  
  const Container = fullscreen ? 'div' : Card;
  const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : 'bg-transparent') : 'w-full';

  return (
    <Container className={cn(
      "overflow-hidden flex flex-col items-center justify-center transition-all duration-300 relative p-6", 
      containerClass
    )}>
       { !fullscreen && backgroundImage && (
         <>
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${backgroundImage})`}}></div>
            <div className="absolute inset-0 backdrop-blur-md bg-background/80"></div>
         </>
        )}
        <div className="flex flex-col items-center justify-center h-full relative">
            <div style={analogClockStyle} className="transition-all duration-300 flex items-center justify-center">
                {primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock timezone={primaryClockTimezone === 'utc' ? 'UTC' : undefined} />}
            </div>

            <div className={cn(
              "text-lg font-medium z-10 px-3 py-1 rounded-full mt-4",
              "bg-black/20 text-white/90 backdrop-blur-sm"
            )}>
              {primaryClockTimezone === 'local' ? localTimezoneName : 'UTC Time'}
            </div>
        </div>
    </Container>
  );
}
