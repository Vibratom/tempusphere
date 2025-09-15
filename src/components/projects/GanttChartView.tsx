
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isToday, isWeekend, isSameMonth } from 'date-fns';
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
                start = startOfWeek(addDays(currentDate, -28), { weekStartsOn: 1 });
                end = endOfWeek(addDays(currentDate, 28), { weekStartsOn: 1 });
                break;
            case 'month':
            default:
                start = startOfMonth(currentDate);
                end = endOfMonth(currentDate);
                if (!isSameMonth(currentDate, new Date())) {
                    start = startOfMonth(currentDate);
                    end = endOfMonth(currentDate);
                } else {
                    const projectStart = tasks.length > 0 ? parseISO(tasks[0].startDate || tasks[0].dueDate!) : startOfMonth(new Date());
                    start = startOfWeek(startOfMonth(projectStart), { weekStartsOn: 1 });
                    end = endOfWeek(addDays(new Date(), 30), { weekStartsOn: 1 });
                }
                break;
        }
        
        const validDateRange = eachDayOfInterval({ start, end });
        let columns;
        if (viewMode === 'week') {
            const weekCount = Math.ceil(validDateRange.length / 7);
            columns = `repeat(${weekCount}, minmax(140px, 1fr))`;
        } else {
            columns = `repeat(${validDateRange.length}, minmax(40px, 1fr))`;
        }
        
        return { dateRange: validDateRange, gridTemplateColumns: columns };
    }, [viewMode, currentDate, tasks]);


    const handleDateChange = (direction: 'prev' | 'next') => {
        const amount = direction === 'prev' ? -1 : 1;
        switch (viewMode) {
            case 'day':
                setCurrentDate(addDays(currentDate, amount * 15));
                break;
            case 'week':
                setCurrentDate(addDays(currentDate, amount * 28));
                break;
            case 'month':
                setCurrentDate(prev => {
                    const newDate = new Date(prev);
                    newDate.setMonth(newDate.getMonth() + amount);
                    return newDate;
                });
                break;
        }
    };
    
    const getTaskPosition = (task: TaskCard) => {
        const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate!);
        const endDate = task.dueDate ? parseISO(task.dueDate) : startDate;
        
        if (startDate > endDate) return null; // Invalid date range

        const startDayIndex = differenceInDays(startDate, dateRange[0]);
        const endDayIndex = differenceInDays(endDate, dateRange[0]);

        if (viewMode === 'week') {
             const startWeekIndex = Math.floor(startDayIndex / 7);
            const endWeekIndex = Math.floor(endDayIndex / 7);
            
            const startOffset = (startDayIndex % 7) / 7;
            const endOffset = ((endDayIndex % 7) + 1) / 7;

            const gridColumnStart = Math.max(0, startWeekIndex + startOffset) + 1;
            const gridColumnEnd = Math.min(dateRange.length / 7, endWeekIndex + endOffset) + 1;

            if (gridColumnStart >= gridColumnEnd) return null;
            
            return { gridColumnStart, gridColumnEnd };
        }
        
        const gridColumnStart = Math.max(0, startDayIndex) + 1;
        const gridColumnEnd = Math.min(dateRange.length, endDayIndex + 1) + 1;

        if (gridColumnStart >= gridColumnEnd) return null;
        
        return { gridColumnStart, gridColumnEnd };
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
        
        if (viewMode === 'month') {
            const months: { [key: string]: Date[] } = {};
            dateRange.forEach(date => {
                const monthKey = format(date, 'MMMM yyyy');
                if (!months[monthKey]) {
                    months[monthKey] = [];
                }
                months[monthKey].push(date);
            });

            return (
                 <div className="contents">
                    {Object.entries(months).map(([month, days]) => (
                        <React.Fragment key={month}>
                            <div className="col-span-full text-center font-semibold p-2 border-b border-l bg-muted/30" style={{ gridColumn: `${differenceInDays(days[0], dateRange[0]) + 1} / span ${days.length}` }}>
                                {month}
                            </div>
                            {days.map(date => (
                                <div key={date.toISOString()} className={cn(
                                    "text-center border-l p-2",
                                    isToday(date) && "bg-primary/20",
                                )}>
                                    <div className="text-xs">{format(date, 'E')}</div>
                                    <div className="font-semibold">{format(date, 'd')}</div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            )
        }

        return (
            <>
                {dateRange.map(date => (
                    <div key={date.toISOString()} className={cn(
                        "text-center border-l p-2",
                        isToday(date) && "bg-primary/20",
                    )}>
                        <div className="text-xs">{format(date, 'E')}</div>
                        <div className="font-semibold">{format(date, 'd')}</div>
                    </div>
                ))}
            </>
        )
    };
    
    const todayIndex = differenceInDays(new Date(), dateRange[0]);
    let todayPosition;
    if (viewMode === 'week') {
        todayPosition = (todayIndex / 7) + 1;
    } else {
        todayPosition = todayIndex + (new Date().getHours() / 24) + 1;
    }

    return (
        <Card className="h-[75vh] flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Gantt Chart</CardTitle>
                    <CardDescription>A timeline of your project tasks.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}><ChevronLeft/></Button>
                    <span className="font-semibold text-lg w-48 text-center">{format(currentDate, viewMode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}</span>
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
                    <div className="w-56 sticky left-0 bg-background z-20 border-r">
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
                        <div className="min-w-max h-full flex flex-col">
                             <div className="grid border-b sticky top-0 bg-background z-10" style={{ gridTemplateColumns }}>
                                <Header />
                            </div>
                            <div className="relative grid flex-1" style={{ gridTemplateColumns, gridTemplateRows: `repeat(${tasks.length}, 3rem)` }}>
                                {dateRange.map((date, i) => {
                                    if (viewMode === 'week' && i % 7 !== 0) return null;
                                    const colIndex = viewMode === 'week' ? Math.floor(i / 7) : i;
                                    
                                    return (
                                        <div key={i} className={cn(
                                            "border-l h-full",
                                            isWeekend(date) && viewMode !== 'week' && "bg-muted/30",
                                        )} style={{gridColumn: colIndex + 1}}></div>
                                    )
                                })}
                                 {todayIndex >= 0 && todayIndex < dateRange.length && (
                                     <div className="absolute top-0 bottom-0 border-r-2 border-destructive z-10" style={{ gridColumn: todayPosition }}></div>
                                 )}
                                {tasks.map((task, index) => {
                                    const pos = getTaskPosition(task);
                                    if (!pos) return null;
                                    const status = getTaskStatus(task.id);
                                    return (
                                        <TooltipProvider key={task.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div 
                                                        className="h-8 bg-primary rounded-md flex items-center px-2 text-primary-foreground text-xs font-medium cursor-pointer hover:opacity-90 overflow-hidden relative self-center" 
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
