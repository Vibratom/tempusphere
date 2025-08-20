'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Square, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
  const milliseconds = (time % 1000).toString().padStart(3, '0');
  return `${minutes}:${seconds}.${milliseconds}`;
};

interface StopwatchPanelProps {
    fullscreen?: boolean;
}

export function StopwatchPanel({ fullscreen = false }: StopwatchPanelProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      const animate = () => {
        setTime(Date.now() - startTimeRef.current);
        timerRef.current = requestAnimationFrame(animate);
      };
      timerRef.current = requestAnimationFrame(animate);
    } else {
        if(timerRef.current) cancelAnimationFrame(timerRef.current);
    }
    return () => {
        if(timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isRunning, time]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleLap = () => {
    setLaps([time, ...laps]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const Container = fullscreen ? 'div' : Card;

  return (
      <Container className={cn(fullscreen ? 'h-full flex flex-col bg-transparent' : '')}>
        <CardHeader>
            <CardTitle>Stopwatch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
            <p className="text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
            {formatTime(time)}
            </p>
            <div className="flex gap-2">
            <Button size="lg" onClick={handleStartStop}>
                {isRunning ? <Pause className="mr-2 h-5 w-5"/> : <Play className="mr-2 h-5 w-5"/>}
                {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button size="lg" variant="secondary" onClick={handleLap} disabled={!isRunning && time === 0}>
                <History className="mr-2 h-5 w-5"/>Lap
            </Button>
            <Button size="lg" variant="secondary" onClick={handleReset}>
                <Square className="mr-2 h-5 w-5"/>Reset
            </Button>
            </div>
        </CardContent>
        <CardFooter className="flex-1 flex-col">
            <ScrollArea className="h-full w-full">
                <div className="space-y-2 pr-4">
                    {laps.map((lap, index) => (
                        <div key={index} className="flex justify-between p-2 rounded-lg bg-background/50 border">
                            <span className="font-medium text-muted-foreground">Lap {laps.length - index}</span>
                            <span className="font-mono">{formatTime(lap - (laps[index+1] || 0) )}</span>
                            <span className="font-mono font-semibold">{formatTime(lap)}</span>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </CardFooter>
      </Container>
  );
}
