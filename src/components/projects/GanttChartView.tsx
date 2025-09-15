
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ChevronLeft, ChevronRight, Flag, ZoomIn, ZoomOut } from 'lucide-react';
import { format, addDays, differenceInDays, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';
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

const zoomConfig = {
    '-3': { daysPerColumn: 28, columnWidth: 140 }, // 4 weeks
    '-2': { daysPerColumn: 21, columnWidth: 120 }, // 3 weeks
    '-1': { daysPerColumn: 14, columnWidth: 100 }, // 2 weeks
     '0': { daysPerColumn: 7, columnWidth: 80 },   // 1 week (Default)
     '1': { daysPerColumn: 6, columnWidth: 70 },
     '2': { daysPerColumn: 5, columnWidth: 60 },
     '3': { daysPerColumn: 4, columnWidth: 50 },
     '4': { daysPerColumn: 3, columnWidth: 40 },
     '5': { daysPerColumn: 2, columnWidth: 40 },
     '6': { daysPerColumn: 1, columnWidth: 50 },
};

const TOTAL_COLUMNS = 30;
type ZoomLevel = keyof typeof zoomConfig;

export function GanttChartView() {
    const { board } = useProjects();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('0');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const tasks = useMemo(() => {
        return Object.values(board.tasks)
            .filter(task => task.startDate || task.dueDate)
            .sort((a, b) => {
                const aDate = a.startDate ? new Date(a.startDate) : new Date(a.dueDate!);
                const bDate = b.startDate ? new Date(b.startDate) : new Date(b.dueDate!);
                return aDate.getTime() - bDate.getTime();
            });
    }, [board.tasks]);

    const { dateRange, columns, dayWidth, totalWidth } = useMemo(() => {
        const config = zoomConfig[zoomLevel];
        const totalDaysInView = TOTAL_COLUMNS * config.daysPerColumn;
        
        const startDate = addDays(currentDate, -Math.floor(totalDaysInView / 4));
        const endDate = addDays(startDate, totalDaysInView - 1);
        const range = { start: startDate, end: endDate };

        let cols = [];
        let currentDay = startDate;
        for(let i=0; i < TOTAL_COLUMNS; i++) {
            const colEndDate = addDays(currentDay, config.daysPerColumn - 1);
            cols.push({ start: currentDay, end: colEndDate });
            currentDay = addDays(currentDay, config.daysPerColumn);
        }

        const calculatedDayWidth = config.columnWidth / config.daysPerColumn;
        const calculatedTotalWidth = TOTAL_COLUMNS * config.columnWidth;
        
        return { 
            dateRange: range, 
            columns: cols,
            dayWidth: calculatedDayWidth,
            totalWidth: calculatedTotalWidth,
        };
    }, [zoomLevel, currentDate]);

    const handleDateChange = (direction: 'prev' | 'next') => {
        const amount = direction === 'prev' ? -7 : 7;
        setCurrentDate(current => addDays(current, amount));
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
        
        const startOffset = Math.max(0, differenceInDays(startDate, dateRange.start));
        const endOffset = Math.min(differenceInDays(dateRange.end, dateRange.start), differenceInDays(endDate, dateRange.start));
        
        const left = startOffset * dayWidth;
        const width = Math.max(dayWidth, (endOffset - startOffset + 1) * dayWidth);

        return { left, width, isMilestone };
    }
    
    const getTaskStatus = (taskId: string) => {
        const column = Object.values(board.columns).find(c => c.taskIds.includes(taskId));
        return column ? column.title : 'Unassigned';
    };

    const todayOffset = isClient ? differenceInDays(startOfDay(new Date()), dateRange.start) : -1;
    const taskColWidth = 150;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-col md:flex-row items-center justify-between flex-shrink-0 gap-4">
                <div className="text-center md:text-left">
                    <CardTitle>Gantt Chart</CardTitle>
                    <CardDescription>A timeline of your project tasks.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}><ChevronLeft/></Button>
                    <span className="font-semibold text-base md:text-lg w-32 md:w-48 text-center">{isClient ? format(currentDate, 'MMM yyyy') : ''}</span>
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
            <CardContent>
                <ScrollArea className="w-full">
                    <div className="grid" style={{ minWidth: totalWidth + taskColWidth }}>
                        {/* Headers */}
                        <div 
                            className="sticky top-0 z-20 grid"
                            style={{ gridTemplateColumns: `${taskColWidth}px 1fr`}}
                        >
                            {/* 1. Task Header */}
                            <div className="bg-muted border-b border-r font-semibold text-sm flex items-end p-2">Task</div>
                            
                            {/* 2. Date Header */}
                            <div className="grid" style={{ gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, 1fr)` }}>
                                {isClient && columns.map(({ start, end }, i) => {
                                    const config = zoomConfig[zoomLevel];
                                    return (
                                       <div key={i} className="text-center border-b border-r p-1 text-xs whitespace-nowrap bg-muted">
                                            {zoomLevel === '6' ? (
                                                <>
                                                   <div>{format(start, 'E')}</div>
                                                   <div className="font-semibold">{format(start, 'd')}</div>
                                                </>
                                            ) : (
                                                <div className="truncate">{format(start, 'd')} - {format(end, 'd MMM')}</div>
                                            )}
                                        </div>
                                    )
                                 })}
                            </div>
                        </div>

                        {/* Body */}
                        <div 
                            className="grid"
                            style={{ gridTemplateColumns: `${taskColWidth}px 1fr`}}
                        >
                            {/* 3. Task List */}
                            <div className="sticky left-0 z-10 bg-background border-r">
                                 {tasks.map((task) => (
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

                            {/* 4. Timeline Grid & Bars */}
                            <div className="relative">
                                {/* Vertical grid lines */}
                                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, 1fr)` }}>
                                    {columns.map((_, i) => (
                                        <div key={i} className="border-r"></div>
                                    ))}
                                </div>
                                
                                {/* Today Marker */}
                                 {todayOffset >= 0 && (todayOffset * dayWidth) < totalWidth && (
                                    <div className="absolute top-0 bottom-0 border-r-2 border-destructive z-10" style={{ left: todayOffset * dayWidth + (dayWidth / 2) }}></div>
                                 )}

                                {/* Task Rows and Bars */}
                                <div className="relative" style={{ height: `${tasks.length * 40}px`}}>
                                    {tasks.map((task, index) => (
                                         <div key={task.id} className="absolute w-full h-10 border-b flex items-center" style={{ top: `${index * 40}px`}}>
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
                                                                        style={{ left: pos.left, width: pos.width - 2, top: '50%', transform: 'translateY(-50%)' }}
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
                                                                    <p><span className="font-semibold">{pos.isMilestone ? 'Date' : 'End'}:</span> {task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'N_A'}</p>
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
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
