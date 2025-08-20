'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { DigitalClock } from './DigitalClock';
import { AnalogClock } from './AnalogClock';

export function PrimaryClock() {
  const { primaryClockMode, primaryClockTimezone } = useSettings();

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[14rem]">
        {primaryClockMode === 'digital' ? <DigitalClock /> : <AnalogClock />}
        <p className="text-muted-foreground mt-4 text-lg font-medium">
          {primaryClockTimezone === 'local' ? 'Local Time' : 'UTC Time'}
        </p>
      </CardContent>
    </Card>
  );
}
