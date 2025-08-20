
'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { playSound } from '@/lib/sounds';
import { Play, Pause, Square, Watch, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AnalogTimer } from './AnalogTimer';

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
    glass?: boolean;
}

type TimerViewMode = 'digital' | 'analog';

function TimerPanelInternal({ fullscreen = false, glass = false }: TimerPanelProps, ref: any) {
    const [duration, setDuration] = useState(300); // 5 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout>();
    const [viewMode, setViewMode] = useLocalStorage<TimerViewMode>('timer:view', 'digital');

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

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'digital' ? 'analog' : 'digital');
    }

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
    const containerClass = fullscreen ? (glass ? 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg' : 'bg-transparent') : '';

    const inputClasses = "w-28 h-24 text-6xl md:text-7xl font-mono font-bold tracking-tighter text-center bg-transparent border-none shadow-none focus-visible:ring-0 p-0 tabular-nums";

    return (
        <Container className={cn('flex flex-col h-full', containerClass)}>
            <CardHeader className={cn(fullscreen ? 'hidden' : 'flex', 'flex-row justify-between items-center')}>
                <CardTitle>Countdown Timer</CardTitle>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={toggleViewMode}>
                                {viewMode === 'digital' ? <Watch className="h-5 w-5"/> : <Clock className="h-5 w-5"/>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Toggle View</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </CardHeader>
            <CardContent className={cn("flex-1 flex flex-col items-center justify-center gap-6 p-4", fullscreen && "pt-4")}>
                {viewMode === 'digital' && isEditing ? (
                    <div className="flex items-center justify-center font-mono font-bold tracking-tighter">
                        <Input type="number" min="0" max="99" value={formatTime(duration).hours} onChange={handleHoursChange} className={inputClasses}/>
                        <span className="text-5xl md:text-6xl">:</span>
                        <Input type="number" min="0" max="59" value={formatTime(duration).minutes} onChange={handleMinutesChange} className={inputClasses}/>
                        <span className="text-5xl md:text-6xl">:</span>
                        <Input type="number" min="0" max="59" value={formatTime(duration).seconds} onChange={handleSecondsChange} className={inputClasses}/>
                    </div>
                ) : viewMode === 'digital' && !isEditing ? (
                    <p className="text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
                        {hours}:{minutes}:{seconds}
                    </p>
                ) : (
                    <AnalogTimer duration={duration} timeLeft={timeLeft} isEditing={isEditing} setDuration={setDuration} />
                )}
                <Progress value={isRunning ? progress : 100} className="w-full max-w-md"/>
            </CardContent>
            <CardFooter className="flex justify-center gap-2 p-4 pt-0">
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
