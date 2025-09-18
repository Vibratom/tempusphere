
'use client';

import React, { useState, useMemo } from 'react';
import { useProductivity, Habit } from '@/contexts/ProductivityContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Target, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, isSameDay, parseISO, startOfDay, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"


const HabitForm = ({ onSave }: { onSave: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void }) => {
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const { toast } = useToast();

    const handleSave = () => {
        if (!name.trim()) {
            toast({ title: "Habit name is required", variant: "destructive" });
            return;
        }
        onSave({ name, frequency });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Habit Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Drink 8 glasses of water" />
                </div>
                <div className="grid gap-2">
                    <Label>Frequency</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily' | 'weekly')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleSave}>Save Habit</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
};

const HabitCalendarView = ({ habit, toggleHabitCompletion }: { habit: Habit, toggleHabitCompletion: (habitId: string, date: string) => void }) => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(today) });
    const completionSet = new Set(habit.completions);

    return (
        <div className="flex justify-between gap-1">
            {weekDays.map(day => {
                const dateKey = day.toISOString().split('T')[0];
                const isCompleted = completionSet.has(dateKey);
                const isFuture = day > today;

                return (
                    <button
                        key={dateKey}
                        disabled={isFuture}
                        onClick={() => toggleHabitCompletion(habit.id, dateKey)}
                        className={cn(
                            "h-10 w-10 rounded-md flex flex-col items-center justify-center border transition-colors",
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted",
                            isSameDay(day, today) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                            isFuture && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className="text-xs">{format(day, 'E')[0]}</span>
                        <span className="font-bold text-sm">{format(day, 'd')}</span>
                    </button>
                );
            })}
        </div>
    );
};

const HabitStatsChart = ({ habit }: { habit: Habit }) => {
    const chartData = useMemo(() => {
        const today = startOfDay(new Date());
        return Array.from({ length: 30 }).map((_, i) => {
            const date = subDays(today, 29 - i);
            const dateKey = date.toISOString().split('T')[0];
            const isCompleted = habit.completions.includes(dateKey);
            return {
                date: format(date, 'MMM d'),
                completions: isCompleted ? 1 : 0,
            };
        });
    }, [habit.completions]);

    return (
        <ChartContainer config={{}} className="h-20 w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} hide/>
                <ChartTooltip content={<ChartTooltipContent hideLabel hideIndicator />} />
                <Bar dataKey="completions" fill="var(--color-primary)" radius={2} />
            </BarChart>
        </ChartContainer>
    );
};

export const HabitTracker = () => {
    const { habits, addHabit, removeHabit, toggleHabitCompletion } = useProductivity();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();

    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => {
        addHabit(habitData);
        toast({ title: "Habit Added!", description: `You're on your way to building the habit: "${habitData.name}"` });
        setIsFormOpen(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <Target className="w-16 h-16 mb-4 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Habit Tracker</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Build good habits, break bad ones. Your journey to self-improvement starts here.</p>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <HabitForm onSave={handleSaveHabit} />
            </Dialog>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Habits</CardTitle>
                    <Button onClick={() => setIsFormOpen(true)}><Plus className="mr-2"/> Add Habit</Button>
                </CardHeader>
                <CardContent>
                    {habits.length > 0 ? (
                        <div className="space-y-4">
                            {habits.map(habit => (
                                <Card key={habit.id}>
                                    <CardHeader className="flex flex-row justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{habit.name}</CardTitle>
                                            <CardDescription>Frequency: {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeHabit(habit.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <HabitCalendarView habit={habit} toggleHabitCompletion={toggleHabitCompletion} />
                                        <HabitStatsChart habit={habit} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                            <Target className="w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold">No Habits Yet</h3>
                            <p className="text-sm">Click "Add Habit" to start tracking your goals.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
