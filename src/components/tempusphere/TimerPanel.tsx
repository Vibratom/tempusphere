'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { playSound } from '@/lib/sounds';
import { Play, Pause, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

let timerHandle = {
  startStop: () => {},
  reset: () => {},
};

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return { hours, minutes, seconds };
};

interface TimerPanelProps {
    fullscreen?: boolean;
}

function TimerPanelInternal({ fullscreen = false }: TimerPanelProps, ref: any) {
    const [duration, setDuration] = useState(300); // 5 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout>();

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const h = parseInt(e.target.value) || 0;
        const currentMinutes = Math.floor((duration % 3600) / 60);
        const currentSeconds = duration % 60;
        setDuration(h * 3600 + currentMinutes * 60 + currentSeconds);
    };
    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const m = parseInt(e.target.value) || 0;
        const currentHours = Math.floor(duration / 3600);
        const currentSeconds = duration % 60;
        setDuration(currentHours * 3600 + m * 60 + currentSeconds);
    };
    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value) || 0;
        const currentHours = Math.floor(duration / 3600);
        const currentMinutes = Math.floor((duration % 3600) / 60);
        setDuration(currentHours * 3600 + currentMinutes * 60 + s);
    };

    useEffect(() => {
        if (!isRunning) {
            setTimeLeft(duration);
        }
    }, [duration, isRunning]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft <= 0 && isRunning) {
            setIsRunning(false);
            playSound('Chime');
            clearInterval(timerRef.current);
            setTimeLeft(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft]);

    const handleStartStop = () => {
        if (!isRunning && timeLeft === 0) {
            setTimeLeft(duration);
        }
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(duration);
    };

    useImperativeHandle(ref, () => ({
        startStop: handleStartStop,
        reset: handleReset,
    }));

    useEffect(() => {
        timerHandle = {
            startStop: handleStartStop,
            reset: handleReset,
        };
    }, [handleStartStop, handleReset]);

    const { hours, minutes, seconds } = formatTime(timeLeft);
    const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;
    const isEditing = !isRunning && timeLeft === duration;

    const Container = fullscreen ? 'div' : Card;
    const contentClass = fullscreen ? 'bg-transparent' : '';

    return (
        <Container className={cn('flex flex-col h-full', contentClass)}>
            {!fullscreen && <CardHeader>
                <CardTitle>Countdown Timer</CardTitle>
            </CardHeader>}
            <CardContent className={cn("flex-1 flex flex-col items-center justify-center gap-6", fullscreen && "pt-4")}>
                {isEditing ? (
                    <div className="flex items-baseline justify-center gap-2 text-6xl md:text-7xl font-mono font-bold tracking-tighter">
                        <Input type="number" min="0" max="99" value={formatTime(duration).hours} onChange={handleHoursChange} className="w-28 h-24 text-center text-6xl tabular-nums p-0"/>
                        <span className="text-5xl md:text-6xl -translate-y-1">:</span>
                        <Input type="number" min="0" max="59" value={formatTime(duration).minutes} onChange={handleMinutesChange} className="w-28 h-24 text-center text-6xl tabular-nums p-0"/>
                        <span className="text-5xl md:text-6xl -translate-y-1">:</span>
                        <Input type="number" min="0" max="59" value={formatTime(duration).seconds} onChange={handleSecondsChange} className="w-28 h-24 text-center text-6xl tabular-nums p-0"/>
                    </div>
                ) : (
                    <p className="text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
                        {hours}:{minutes}:{seconds}
                    </p>
                )}
                <Progress value={isRunning ? progress : 100} className="w-full max-w-md"/>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button id="timer-start-btn" size="lg" onClick={handleStartStop} disabled={duration === 0}>
                                {isRunning ? <Pause className="mr-2 h-5 w-5"/> : <Play className="mr-2 h-5 w-5"/>}
                                {isRunning ? 'Pause' : 'Start'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Space</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button size="lg" variant="secondary" onClick={handleReset} disabled={isEditing}>
                                <Square className="mr-2 h-5 w-5"/>Reset
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>R</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </CardFooter>
        </Container>
    );
}

const TimerPanel = forwardRef(TimerPanelInternal);
export { TimerPanel, timerHandle };
