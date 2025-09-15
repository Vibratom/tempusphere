
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isToday, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const priorityColors: Record<Priority, string> = {
    none: 'bg-muted-foreground',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
};

type GanttViewMode = 'day' | 'week' | 'month';

export function GanttChartView() {
    const { board } = useProjects();
    const [viewMode, setViewMode] = useState<GanttViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    const tasks = useMemo(() => {
        return Object.values(board.tasks)
            .filter(task => task.startDate || task.dueDate)
            .sort((a, b) => {
                const aDate = a.startDate ? new Date(a.startDate) : new Date(a.dueDate!);
                const bDate = b.startDate ? new Date(b.startDate) : new Date(b.dueDate!);
                return aDate.getTime() - bDate.getTime();
            });
    }, [board.tasks]);

    const { dateRange, gridTemplateColumns } = useMemo(() => {
        let start, end;
        switch (viewMode) {
            case 'day':
                start = addDays(currentDate, -15);
                end = addDays(currentDate, 15);
                break;
            case 'week':
                start = startOfWeek(addDays(currentDate, -14));
                end = endOfWeek(addDays(currentDate, 14));
                break;
            case 'month':
            default:
                start = startOfMonth(currentDate);
                end = endOfMonth(currentDate);
                break;
        }
        const dateRange = eachDayOfInterval({ start, end });
        const gridTemplateColumns = viewMode === 'week' 
            ? `repeat(${dateRange.length / 7}, minmax(140px, 1fr))` 
            : `repeat(${dateRange.length}, minmax(40px, 1fr))`;
        
        return { dateRange, gridTemplateColumns };
    }, [viewMode, currentDate]);


    const handleDateChange = (direction: 'prev' | 'next') => {
        const amount = direction === 'prev' ? -1 : 1;
        switch (viewMode) {
            case 'day':
                setCurrentDate(addDays(currentDate, amount * 15));
                break;
            case 'week':
                setCurrentDate(addDays(currentDate, amount * 7));
                break;
            case 'month':
                setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + amount)));
                break;
        }
    };
    
    const getTaskPosition = (task: TaskCard) => {
        const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate!);
        const endDate = task.dueDate ? parseISO(task.dueDate) : startDate;
        
        const startIndex = differenceInDays(startDate, dateRange[0]);
        const endIndex = differenceInDays(endDate, dateRange[0]) + 1;

        if (startIndex >= dateRange.length || endIndex < 0) return null;
        
        const clampedStartIndex = Math.max(startIndex, 0);
        const clampedEndIndex = Math.min(endIndex, dateRange.length);
        
        if (clampedStartIndex >= clampedEndIndex) return null;

        return {
            gridColumnStart: clampedStartIndex + 1,
            gridColumnEnd: clampedEndIndex + 1
        }
    }
    
    const getTaskStatus = (taskId: string) => {
        const column = Object.values(board.columns).find(c => c.taskIds.includes(taskId));
        return column ? column.title : 'Unassigned';
    };


    const Header = () => {
        if (viewMode === 'week') {
            const weeks = [];
            for (let i = 0; i < dateRange.length; i += 7) {
                weeks.push(dateRange[i]);
            }
            return (
                <>
                    {weeks.map(weekStart => (
                        <div key={weekStart.toISOString()} className="text-center border-l p-2 font-semibold bg-muted/30">
                            Week of {format(weekStart, 'MMM d')}
                        </div>
                    ))}
                </>
            );
        }

        return (
            <>
                {dateRange.map(date => (
                    <div key={date.toISOString()} className={cn(
                        "text-center border-l p-2",
                        isToday(date) && "bg-primary/20",
                    )}>
                        {viewMode === 'month' && <div className="text-xs">{format(date, 'E')}</div>}
                        <div className="font-semibold">{format(date, 'd')}</div>
                    </div>
                ))}
            </>
        )
    };


    return (
        <Card className="h-[75vh] flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Gantt Chart</CardTitle>
                    <CardDescription>A timeline of your project tasks.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}><ChevronLeft/></Button>
                    <span className="font-semibold text-lg w-32 text-center">{format(currentDate, 'MMM yyyy')}</span>
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('next')}><ChevronRight/></Button>
                     <Select value={viewMode} onValueChange={(v) => setViewMode(v as GanttViewMode)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="View Mode"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex overflow-hidden">
                <div className="flex w-full">
                    <div className="w-56 sticky left-0 bg-background z-10 border-r">
                         <div className="h-[53px] flex items-center p-2 font-semibold border-b bg-muted/30">Task</div>
                         <ScrollArea className="h-[calc(100%-53px)]">
                            {tasks.map(task => (
                                <div key={task.id} className="h-12 flex items-center p-2 border-b truncate">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="truncate text-left w-full">
                                                {task.title}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{task.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            ))}
                         </ScrollArea>
                    </div>

                    <ScrollArea className="flex-1 h-full whitespace-nowrap">
                        <div className="min-w-max">
                             <div className="grid border-b" style={{ gridTemplateColumns }}>
                                <Header />
                            </div>
                            <div className="relative grid h-full" style={{ gridTemplateColumns, gridTemplateRows: `repeat(${tasks.length}, 3rem)` }}>
                                {dateRange.map((date, i) => (
                                    <div key={i} className={cn(
                                        "border-l h-full",
                                        isWeekend(date) && "bg-muted/30",
                                        isToday(date) && "bg-primary/20"
                                    )}></div>
                                ))}
                                {tasks.map((task, index) => {
                                    const pos = getTaskPosition(task);
                                    if (!pos) return null;
                                    const status = getTaskStatus(task.id);
                                    return (
                                        <TooltipProvider key={task.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div 
                                                        className="h-8 bg-primary rounded-md flex items-center px-2 text-primary-foreground text-xs font-medium cursor-pointer hover:opacity-90 overflow-hidden relative" 
                                                        style={{ 
                                                            gridRow: index + 1, 
                                                            gridColumnStart: pos.gridColumnStart,
                                                            gridColumnEnd: pos.gridColumnEnd,
                                                        }}
                                                    >
                                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", priorityColors[task.priority])}></div>
                                                        <span className="truncate pl-2">{task.title}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="font-bold mb-2">{task.title}</div>
                                                    <div className="space-y-1 text-sm">
                                                        <p><span className="font-semibold">Start:</span> {task.startDate ? format(parseISO(task.startDate), 'PPP') : 'N/A'}</p>
                                                        <p><span className="font-semibold">End:</span> {task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'N/A'}</p>
                                                        <p><span className="font-semibold">Status:</span> {status}</p>
                                                        <div className="flex items-center gap-2"><span className="font-semibold">Priority:</span> <Flag className={cn("h-4 w-4", priorityColors[task.priority].replace('bg-','text-'))} /> <span className="capitalize">{task.priority}</span></div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                })}
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}
