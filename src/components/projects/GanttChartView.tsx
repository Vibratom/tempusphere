
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ChevronLeft, ChevronRight, Flag, ZoomIn, ZoomOut } from 'lucide-react';
import { format, addDays, differenceInDays, startOfDay, eachDayOfInterval, parseISO, isToday, isWeekend, startOfWeek, endOfWeek } from 'date-fns';
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

// Zoom levels:
// -3: 1 col = 4 weeks (28 days)
// -2: 1 col = 3 weeks (21 days)
// -1: 1 col = 2 weeks (14 days)
//  0: 1 col = 1 week (7 days) [Default]
// +1: 1 col = 6 days
// +2: 1 col = 5 days
// +3: 1 col = 4 days
// +4: 1 col = 3 days
// +5: 1 col = 2 days
// +6: 1 col = 1 day
const zoomConfig = {
    '-3': { totalDays: 364, daysPerColumn: 28, columnWidth: 140 }, // Approx 1 year
    '-2': { totalDays: 189, daysPerColumn: 21, columnWidth: 120 }, // Approx 6 months
    '-1': { totalDays: 126, daysPerColumn: 14, columnWidth: 100 }, // Approx 4 months
     '0': { totalDays: 91, daysPerColumn: 7, columnWidth: 80 },  // Approx 3 months
     '1': { totalDays: 78, daysPerColumn: 6, columnWidth: 70 },
     '2': { totalDays: 65, daysPerColumn: 5, columnWidth: 60 },
     '3': { totalDays: 52, daysPerColumn: 4, columnWidth: 50 },
     '4': { totalDays: 39, daysPerColumn: 3, columnWidth: 40 },
     '5': { totalDays: 26, daysPerColumn: 2, columnWidth: 40 },
     '6': { totalDays: 30, daysPerColumn: 1, columnWidth: 50 }, // 30 days total for daily view
};

type ZoomLevel = keyof typeof zoomConfig;

export function GanttChartView() {
    const { board } = useProjects();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('0');

    const tasks = useMemo(() => {
        return Object.values(board.tasks)
            .filter(task => task.startDate || task.dueDate)
            .sort((a, b) => {
                const aDate = a.startDate ? new Date(a.startDate) : new Date(a.dueDate!);
                const bDate = b.startDate ? new Date(b.startDate) : new Date(b.dueDate!);
                return aDate.getTime() - bDate.getTime();
            });
    }, [board.tasks]);

    const { dateRange, columns, gridTemplateColumns, totalWidth } = useMemo(() => {
        const config = zoomConfig[zoomLevel];
        const startDate = addDays(currentDate, -Math.floor(config.totalDays / 2));
        
        let cols = [];
        let currentDay = startDate;
        
        while (currentDay < addDays(startDate, config.totalDays)) {
            const endDate = addDays(currentDay, config.daysPerColumn - 1);
            cols.push({ start: currentDay, end: endDate });
            currentDay = addDays(endDate, 1);
        }

        const range = { start: cols[0].start, end: cols[cols.length - 1].end };

        return { 
            dateRange: range, 
            columns: cols,
            gridTemplateColumns: `repeat(${cols.length}, ${config.columnWidth}px)`,
            totalWidth: cols.length * config.columnWidth
        };
    }, [zoomLevel, currentDate]);

    const handleDateChange = (direction: 'prev' | 'next') => {
        const amount = direction === 'prev' ? -1 : 1;
        const { daysPerColumn } = zoomConfig[zoomLevel];
        setCurrentDate(current => addDays(current, amount * daysPerColumn * (zoomLevel === '6' ? 7 : 1))); // Move by a week in daily view
    };
    
    const handleZoom = (direction: 'in' | 'out') => {
        const level = parseInt(zoomLevel, 10);
        if (direction === 'in' && level < 6) {
            setZoomLevel((level + 1).toString() as ZoomLevel);
        } else if (direction === 'out' && level > -3) {
            setZoomLevel((level - 1).toString() as ZoomLevel);
        }
    };
    
    const getTaskPosition = (task: TaskCard) => {
        const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate!);
        const endDate = task.dueDate ? parseISO(task.dueDate!) : startDate;
        
        if (startDate > endDate || endDate < dateRange.start || startDate > dateRange.end) return null;

        const isMilestone = !task.startDate || !task.dueDate || task.startDate === task.dueDate;
        
        const startOffset = differenceInDays(startDate, dateRange.start);
        const endOffset = differenceInDays(endDate, dateRange.start);
        
        const dayWidth = totalWidth / differenceInDays(dateRange.end, dateRange.start);

        const left = startOffset * dayWidth;
        const width = (endOffset - startOffset + 1) * dayWidth;

        return { left, width, isMilestone };
    }
    
    const getTaskStatus = (taskId: string) => {
        const column = Object.values(board.columns).find(c => c.taskIds.includes(taskId));
        return column ? column.title : 'Unassigned';
    };

    const todayOffset = differenceInDays(startOfDay(new Date()), dateRange.start);
    const dayWidth = totalWidth / differenceInDays(dateRange.end, dateRange.start);
    
    const taskColWidth = 200;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-col md:flex-row items-center justify-between flex-shrink-0 gap-4">
                <div className="text-center md:text-left">
                    <CardTitle>Gantt Chart</CardTitle>
                    <CardDescription>A timeline of your project tasks.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}><ChevronLeft/></Button>
                    <span className="font-semibold text-base md:text-lg w-32 md:w-48 text-center">{format(currentDate, 'MMM yyyy')}</span>
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('next')}><ChevronRight/></Button>
                    <div className="flex items-center gap-1 ml-2 md:ml-4">
                        <Button variant="outline" size="icon" onClick={() => handleZoom('out')} disabled={zoomLevel === '-3'}>
                            <ZoomOut />
                        </Button>
                         <Button variant="outline" size="icon" onClick={() => handleZoom('in')} disabled={zoomLevel === '6'}>
                            <ZoomIn />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="w-full h-full">
                    <div className="relative pt-[66px]">
                        {/* Header container */}
                        <div className="sticky top-0 z-20 bg-background flex" style={{ width: taskColWidth + totalWidth }}>
                           <div className="w-[200px] flex-shrink-0 border-b border-r bg-muted/50 flex items-end p-2 font-semibold text-sm">Task</div>
                           <div className="flex-grow">
                                {/* Month headers */}
                                <div className="flex border-b">
                                    {columns.map(({ start }, i) => {
                                        if (i === 0 || start.getDate() === 1) {
                                            const month = format(start, 'MMMM yyyy');
                                            let dayInMonth = 0;
                                            if(start.getMonth() === addDays(dateRange.end, -1).getMonth()){
                                                dayInMonth = differenceInDays(dateRange.end, start);
                                            } else {
                                                dayInMonth = differenceInDays(new Date(start.getFullYear(), start.getMonth() + 1, 0), start);
                                            }
                                            const width = dayInMonth * dayWidth;
                                            return (
                                                <div key={month} className="p-1 text-center font-semibold border-r" style={{ width, minWidth: width }}>
                                                    {month}
                                                </div>
                                            )
                                        }
                                        return null;
                                    })}
                                </div>
                                {/* Day/Week headers */}
                                <div className="flex">
                                    {columns.map(({start, end}, i) => (
                                        <div key={i} className={cn("text-center border-r p-1 text-xs whitespace-nowrap bg-muted/30",
                                          isToday(start) && 'bg-primary/20')} style={{ width: zoomConfig[zoomLevel].columnWidth }}>
                                            {zoomLevel === '6' ? (
                                                <>
                                                   <div>{format(start, 'E')}</div>
                                                   <div className="font-semibold">{format(start, 'd')}</div>
                                                </>
                                            ) : (
                                                <div className="truncate">{format(start, 'd')} - {format(end, 'd')}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                           </div>
                        </div>

                        {/* Today Marker */}
                         {todayOffset >= 0 && todayOffset * dayWidth < totalWidth && (
                            <div className="absolute top-0 bottom-0 border-r-2 border-destructive z-10" style={{ left: taskColWidth + todayOffset * dayWidth + 0.5 * dayWidth}}></div>
                         )}

                        {/* Task Rows */}
                        <div className="flex" style={{ width: taskColWidth + totalWidth }}>
                            {/* Task List */}
                            <div className="w-[200px] flex-shrink-0 border-r bg-background sticky left-0 z-10">
                                {tasks.map(task => (
                                    <div key={task.id} className="h-10 flex items-center p-2 border-b truncate text-sm">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="truncate text-left w-full">{task.title}</TooltipTrigger>
                                                <TooltipContent><p>{task.title}</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                ))}
                            </div>
                            {/* Timeline Grid */}
                            <div className="relative flex-grow">
                                {/* Vertical lines */}
                                <div className="absolute inset-0 flex">
                                    {columns.map((_, i) => (
                                        <div key={i} className="border-r" style={{ width: zoomConfig[zoomLevel].columnWidth }}></div>
                                    ))}
                                </div>
                                {/* Task bars */}
                                {tasks.map((task, index) => (
                                    <div key={task.id} className="relative h-10 border-b flex items-center">
                                       {(pos => {
                                            if (!pos) return null;
                                            const status = getTaskStatus(task.id);
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            {pos.isMilestone ? (
                                                                <div 
                                                                    className="absolute h-6 w-6 self-center cursor-pointer hover:opacity-90 z-10 -translate-y-1/2 -translate-x-1/2 rotate-45"
                                                                    style={{ left: pos.left, top: '50%' }}
                                                                >
                                                                    <div className={cn("w-full h-full rounded-sm", priorityColors[task.priority])}></div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    className="absolute h-7 bg-primary rounded-md flex items-center px-2 text-primary-foreground text-xs font-medium cursor-pointer hover:opacity-90 overflow-hidden" 
                                                                    style={{ left: pos.left, width: pos.width - 4, top: '50%', transform: 'translateY(-50%)' }}
                                                                >
                                                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", priorityColors[task.priority])}></div>
                                                                    <span className="truncate pl-2">{task.title}</span>
                                                                </div>
                                                            )}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className="font-bold mb-2">{task.title} {pos.isMilestone && '(Milestone)'}</div>
                                                            <div className="space-y-1 text-sm">
                                                                {!pos.isMilestone && <p><span className="font-semibold">Start:</span> {task.startDate ? format(parseISO(task.startDate), 'PPP') : 'N/A'}</p>}
                                                                <p><span className="font-semibold">{pos.isMilestone ? 'Date' : 'End'}:</span> {task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'N/A'}</p>
                                                                <p><span className="font-semibold">Status:</span> {status}</p>
                                                                <div className="flex items-center gap-2"><span className="font-semibold">Priority:</span> <Flag className={cn("h-4 w-4", priorityColors[task.priority].replace('bg-','text-'))} /> <span className="capitalize">{task.priority}</span></div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )
                                        })(getTaskPosition(task))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
