
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

  // Ensure this only runs on the client
  const timeString = isClient ? new Intl.DateTimeFormat('default', options).format(time) : '00:00:00';

  return (
    <div className={cn('text-center', className)}>
      <p className="text-6xl md:text-8xl font-bold tracking-tighter tabular-nums">
        {timeString}
      </p>
    </div>
  );
}
