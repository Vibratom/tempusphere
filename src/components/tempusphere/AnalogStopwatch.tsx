
'use client';

import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface AnalogStopwatchProps {
  className?: string;
  time: number; // in milliseconds
}

export function AnalogStopwatch({ className, time }: AnalogStopwatchProps) {
  const minutes = Math.floor(time / 60000);
  const seconds = (time % 60000) / 1000;

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = (minutes / 60) * 360 + (seconds / 60 / 60) * 360;

  return (
    <div className={cn('relative w-64 h-64', className)}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="98" fill="transparent" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="100" cy="100" r="4" fill="hsl(var(--primary))" />

        {/* Major markers (every 5 seconds) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="10"
            x2="100"
            y2="20"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
         {/* Minor markers (every second) */}
        {Array.from({ length: 60 }).map((_, i) => (
           i % 5 !== 0 && <line
            key={i}
            x1="100"
            y1="10"
            x2="100"
            y2="14"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            transform={`rotate(${i * 6} 100 100)`}
          />
        ))}

        {/* Second Hand */}
        <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: 'center', transform: `rotate(${secondDeg}deg)` }}
        />
        {/* Minute Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="55"
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transformOrigin: 'center', transform: `rotate(${minuteDeg}deg)` }}
        />

      </svg>
    </div>
  );
}
