
'use client';

import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface AnalogTimerProps {
  className?: string;
  duration: number; // in seconds
  timeLeft: number; // in seconds
  isEditing: boolean;
  setDuration: (newDuration: number) => void;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return { hours, minutes, seconds };
};

export function AnalogTimer({ className, duration, timeLeft, isEditing, setDuration }: AnalogTimerProps) {
  
  const handleDurationChange = (part: 'h' | 'm' | 's', value: string) => {
    const numValue = parseInt(value) || 0;
    const current = formatTime(duration);
    let newDuration;
    if (part === 'h') {
        newDuration = numValue * 3600 + parseInt(current.minutes) * 60 + parseInt(current.seconds);
    } else if (part === 'm') {
        newDuration = parseInt(current.hours) * 3600 + numValue * 60 + parseInt(current.seconds);
    } else {
        newDuration = parseInt(current.hours) * 3600 + parseInt(current.minutes) * 60 + numValue;
    }
    setDuration(newDuration);
  }

  const { seconds, minutes, hours } = formatTime(timeLeft);
  const totalMinutes = duration / 60;
  const timeLeftMinutes = timeLeft / 60;
  const minuteDeg = (timeLeftMinutes / Math.max(60, totalMinutes)) * 360;

  const totalSeconds = duration % 60 === 0 ? 60 : duration % 60;
  const secondDeg = (timeLeft % 60 / 60) * 360;

  const inputClasses = "w-12 text-2xl font-mono font-bold tracking-tighter text-center bg-transparent border-none shadow-none focus-visible:ring-0 p-0 tabular-nums";


  if (isEditing) {
    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">Set Timer Duration</p>
            <div className="flex items-center justify-center font-mono font-bold tracking-tighter">
                <Input type="number" min="0" max="99" value={formatTime(duration).hours} onChange={(e) => handleDurationChange('h', e.target.value)} className={inputClasses}/>
                <span className="text-2xl">:</span>
                <Input type="number" min="0" max="59" value={formatTime(duration).minutes} onChange={(e) => handleDurationChange('m', e.target.value)} className={inputClasses}/>
                <span className="text-2xl">:</span>
                <Input type="number" min="0" max="59" value={formatTime(duration).seconds} onChange={(e) => handleDurationChange('s', e.target.value)} className={inputClasses}/>
            </div>
        </div>
    )
  }

  return (
    <div className={cn('relative w-64 h-64 flex flex-col items-center justify-center', className)}>
      <svg viewBox="0 0 200 200" className="absolute w-full h-full">
        <circle cx="100" cy="100" r="98" fill="transparent" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="100" cy="100" r="4" fill="hsl(var(--primary))" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="100" y1="10" x2="100" y2="20" stroke="hsl(var(--foreground))" strokeWidth="2" transform={`rotate(${i * 30} 100 100)`}/>
        ))}
        {Array.from({ length: 60 }).map((_, i) => (
           i % 5 !== 0 && <line key={i} x1="100" y1="10" x2="100" y2="14" stroke="hsl(var(--muted-foreground))" strokeWidth="1" transform={`rotate(${i * 6} 100 100)`}/>
        ))}
        {/* Second Hand */}
        <line x1="100" y1="100" x2="100" y2="25" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: 'center', transform: `rotate(${secondDeg}deg)` }}/>
        {/* Minute Hand */}
        <line x1="100" y1="100" x2="100" y2="55" stroke="hsl(var(--foreground))" strokeWidth="4" strokeLinecap="round" style={{ transformOrigin: 'center', transform: `rotate(${minuteDeg}deg)` }}/>
      </svg>
      <div className="z-10 text-center">
        <p className="text-5xl font-mono font-bold tracking-tighter tabular-nums">
            {hours}:{minutes}:{seconds}
        </p>
      </div>
    </div>
  );
}
