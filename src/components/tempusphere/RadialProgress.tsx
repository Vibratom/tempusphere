
'use client';

import { cn } from '@/lib/utils';

interface RadialProgressProps {
  className?: string;
  progress: number; // 0-100
}

export function RadialProgress({ className, progress }: RadialProgressProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative', className)}>
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke="hsl(var(--border))"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      </svg>
    </div>
  );
}
