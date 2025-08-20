
'use client';

import { useTime } from '@/hooks/use-time';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface DigitalClockProps {
  className?: string;
}

export function DigitalClock({ className }: DigitalClockProps) {
  const time = useTime();
  const { hourFormat, showSeconds, primaryClockTimezone } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: hourFormat === '12h',
    timeZone: primaryClockTimezone === 'utc' ? 'UTC' : undefined,
  };

  if (showSeconds) {
    options.second = '2-digit';
  }

  const timeString = new Intl.DateTimeFormat('default', options).format(time);

  return (
    <div className={cn('text-center', className)}>
      <p className="text-6xl md:text-8xl font-bold tracking-tighter tabular-nums">
        {isClient ? timeString : '00:00:00'}
      </p>
    </div>
  );
}
