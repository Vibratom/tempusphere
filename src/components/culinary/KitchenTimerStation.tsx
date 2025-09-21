'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, Trash2, Plus, BellRing } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { v4 as uuidv4 } from 'uuid';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Timer {
    id: string;
    name: string;
    duration: number; // in seconds
    timeLeft: number; // in seconds
    isRunning: boolean;
}

const createNewTimer = (): Timer => ({
    id: uuidv4(),
    name: 'New Timer',
    duration: 300,
    timeLeft: 300,
    isRunning: false,
});

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return { hours, minutes, seconds };
};

function TimerCard({ timer, onUpdate, onRemove }: { timer: Timer; onUpdate: (timer: Timer) => void; onRemove: (id: string) => void; }) {
    const { id, name, duration, timeLeft, isRunning } = timer;
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                onUpdate({ ...timer, timeLeft: timer.timeLeft - 1 });
            }, 1000);
        } else if (timeLeft <= 0 && isRunning) {
            playSound('Audio 1');
            onUpdate({ ...timer, isRunning: false, timeLeft: 0 });
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft, onUpdate, timer]);

    const handleStartStop = () => {
        if (!isRunning && timeLeft === 0) {
            onUpdate({ ...timer, isRunning: true, timeLeft: duration });
        } else {
            onUpdate({ ...timer, isRunning: !isRunning });
        }
    };
    
    const handleReset = () => {
        onUpdate({ ...timer, isRunning: false, timeLeft: duration });
    };
    
    const handleDurationChange = (part: 'h' | 'm' | 's', value: string) => {
        const numValue = parseInt(value) || 0;
        const current = formatTime(duration);
        let newDuration;
        if (part === 'h') newDuration = numValue * 3600 + parseInt(current.minutes) * 60 + parseInt(current.seconds);
        else if (part === 'm') newDuration = parseInt(current.hours) * 3600 + numValue * 60 + parseInt(current.seconds);
        else newDuration = parseInt(current.hours) * 3600 + parseInt(current.minutes) * 60 + numValue;
        onUpdate({ ...timer, duration: newDuration, timeLeft: newDuration });
    };

    const { hours, minutes, seconds } = formatTime(timeLeft);
    const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;
    const isEditing = !isRunning && timeLeft === duration;
    const isFinished = timeLeft === 0 && !isRunning && duration > 0;
    
    const inputClasses = "w-10 text-xl font-mono font-bold tracking-tighter text-center bg-transparent border-none shadow-none focus-visible:ring-0 p-0 tabular-nums";

    return (
        <Card className={cn("flex flex-col", isFinished && "border-primary ring-2 ring-primary animate-pulse")}>
            <CardHeader className="flex-row items-center justify-between py-2">
                <Input value={name} onChange={e => onUpdate({ ...timer, name: e.target.value })} className="text-lg font-semibold border-none focus-visible:ring-0 p-0 h-auto"/>
                <Button variant="ghost" size="icon" onClick={() => onRemove(id)}><Trash2 className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-2">
                 {isEditing ? (
                    <div className="flex items-center justify-center font-mono font-bold tracking-tighter">
                        <Input type="number" min="0" max="99" value={formatTime(duration).hours} onChange={(e) => handleDurationChange('h', e.target.value)} className={inputClasses}/>
                        <span className="text-xl">:</span>
                        <Input type="number" min="0" max="59" value={formatTime(duration).minutes} onChange={(e) => handleDurationChange('m', e.target.value)} className={inputClasses}/>
                        <span className="text-xl">:</span>
                        <Input type="number" min="0" max="59" value={formatTime(duration).seconds} onChange={(e) => handleDurationChange('s', e.target.value)} className={inputClasses}/>
                    </div>
                ) : (
                    <p className="text-5xl font-mono font-bold tracking-tighter tabular-nums text-center">
                        {hours}:{minutes}:{seconds}
                    </p>
                )}
                <Progress value={isRunning ? progress : 100} className="w-full max-w-xs"/>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
                <Button size="sm" onClick={handleStartStop} disabled={duration === 0}>
                    {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                    {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button size="sm" variant="secondary" onClick={handleReset} disabled={isEditing}>
                    <Square className="mr-2 h-4 w-4"/>Reset
                </Button>
            </CardFooter>
        </Card>
    )
}


export function KitchenTimerStation() {
    const [timers, setTimers] = useLocalStorage<Timer[]>('culinary:timers-v1', [createNewTimer()]);
    
    const addTimer = () => {
        setTimers(prev => [...prev, createNewTimer()]);
    }
    
    const updateTimer = (updatedTimer: Timer) => {
        setTimers(prev => prev.map(t => t.id === updatedTimer.id ? updatedTimer : t));
    }
    
    const removeTimer = (id: string) => {
        setTimers(prev => prev.filter(t => t.id !== id));
    }

    return (
        <div className="p-4 md:p-8 space-y-4">
            <div className="text-right">
                <Button onClick={addTimer} variant="outline"><Plus className="mr-2 h-4 w-4"/>Add Timer</Button>
            </div>
            {timers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {timers.map(timer => (
                        <TimerCard key={timer.id} timer={timer} onUpdate={updateTimer} onRemove={removeTimer} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                    <BellRing className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">No Timers Running</h3>
                    <p className="text-sm">Click "Add Timer" to get started.</p>
                </div>
            )}
        </div>
    );
}
