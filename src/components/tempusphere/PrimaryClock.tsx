
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { DigitalClock } from './DigitalClock';
import { AnalogClock } from './AnalogClock';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export function PrimaryClock() {
  const { primaryClockMode, primaryClockTimezone } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[14rem]">
        {isClient ? (
          primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock />
        ) : (
          <Skeleton className="w-64 h-24" />
        )}
        <div className="text-muted-foreground mt-4 text-lg font-medium">
          {isClient ? (primaryClockTimezone === 'local' ? 'Local Time' : 'UTC Time') : <Skeleton className="w-24 h-6" />}
        </div>
      </CardContent>
    </Card>
  );
}
