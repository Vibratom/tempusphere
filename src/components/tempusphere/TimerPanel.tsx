'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { playSound } from '@/lib/sounds';
import { Play, Pause, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return { hours, minutes, seconds };
};

export function TimerPanel() {
    const [duration, setDuration] = useState(300); // 5 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout>();

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const h = parseInt(e.target.value) || 0;
        setDuration(h * 3600 + (duration % 3600));
    };
    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const m = parseInt(e.target.value) || 0;
        setDuration(Math.floor(duration/3600)*3600 + m * 60 + (duration % 60));
    };
    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const s = parseInt(e.target.value) || 0;
        setDuration(Math.floor(duration/60)*60 + s);
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
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            playSound('Chime');
            clearInterval(timerRef.current);
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

    const { hours, minutes, seconds } = formatTime(timeLeft);
    const progress = (timeLeft / duration) * 100;
    const isEditing = !isRunning && timeLeft === duration;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Countdown Timer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6">
                {isEditing ? (
                    <div className="flex items-center gap-2 text-6xl md:text-7xl font-mono font-bold tracking-tighter">
                        <Input type="number" min="0" max="99" value={formatTime(duration).hours} onChange={handleHoursChange} className="w-28 h-24 text-center text-6xl"/>:
                        <Input type="number" min="0" max="59" value={formatTime(duration).minutes} onChange={handleMinutesChange} className="w-28 h-24 text-center text-6xl"/>:
                        <Input type="number" min="0" max="59" value={formatTime(duration).seconds} onChange={handleSecondsChange} className="w-28 h-24 text-center text-6xl"/>
                    </div>
                ) : (
                    <p className="text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
                        {hours}:{minutes}:{seconds}
                    </p>
                )}
                <Progress value={isRunning ? progress : 100} className="w-full max-w-md"/>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
                <Button size="lg" onClick={handleStartStop} disabled={duration === 0}>
                    {isRunning ? <Pause className="mr-2 h-5 w-5"/> : <Play className="mr-2 h-5 w-5"/>}
                    {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button size="lg" variant="secondary" onClick={handleReset} disabled={isEditing}>
                    <Square className="mr-2 h-5 w-5"/>Reset
                </Button>
            </CardFooter>
        </Card>
    );
}
