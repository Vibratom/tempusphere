'use client';

import { useTime } from '@/hooks/use-time';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface AnalogClockProps {
  className?: string;
}

export function AnalogClock({ className }: AnalogClockProps) {
  const time = useTime();
  const { showSeconds } = useSettings();

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6 + milliseconds * 0.006;

  return (
    <div className={cn('relative w-64 h-64 mx-auto', className)}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="98" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="100" cy="100" r="4" fill="hsl(var(--primary))" />

        {/* Hour and minute markers */}
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

        {/* Hour Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="55"
          stroke="hsl(var(--foreground))"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ transformOrigin: 'center', transform: `rotate(${hourDeg}deg)` }}
        />
        {/* Minute Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transformOrigin: 'center', transform: `rotate(${minuteDeg}deg)` }}
        />
        {/* Second Hand */}
        {showSeconds && (
            <line
                x1="100"
                y1="110"
                x2="100"
                y2="25"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transformOrigin: 'center', transform: `rotate(${secondDeg}deg)` }}
            />
        )}
      </svg>
    </div>
  );
}
