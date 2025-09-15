
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ChevronLeft, ChevronRight, Flag, ZoomIn, ZoomOut } from 'lucide-react';
import { format, addDays, differenceInDays, startOfMonth, eachDayOfInterval, parseISO, isToday, isWeekend, addMonths } from 'date-fns';
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

const zoomLevels = [
    { name: 'Quarter', days: 90, columnWidth: 30 },
    { name: 'Month', days: 60, columnWidth: 40 },
    { name: 'Week', days: 30, columnWidth: 50 },
    { name: 'Day', days: 14, columnWidth: 60 },
];


export function GanttChartView() {
    const { board } = useProjects();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [zoomLevel, setZoomLevel] = useState(2); // Index of zoomLevels array, default to 'Week'

    const tasks = useMemo(() => {
        return Object.values(board.tasks)
            .filter(task => task.startDate || task.dueDate)
            .sort((a, b) => {
                const aDate = a.startDate ? new Date(a.startDate) : new Date(a.dueDate!);
                const bDate = b.startDate ? new Date(b.startDate) : new Date(b.dueDate!);
                return aDate.getTime() - bDate.getTime();
            });
    }, [board.tasks]);

    const { dateRange, gridTemplateColumns, numColumns, columnWidth, months } = useMemo(() => {
        const { days, columnWidth: cw } = zoomLevels[zoomLevel];
        const start = addDays(startOfMonth(currentDate), -Math.floor(days/2));
        const end = addDays(start, days);
        
        const range = eachDayOfInterval({ start, end });

        const monthData: { [key: string]: Date[] } = {};
        range.forEach(date => {
            const monthKey = format(date, 'MMMM yyyy');
            if (!monthData[monthKey]) {
                monthData[monthKey] = [];
            }
            monthData[monthKey].push(date);
        });
        
        return { 
            dateRange: range, 
            gridTemplateColumns: `repeat(${range.length}, minmax(${cw}px, 1fr))`,
            numColumns: range.length,
            columnWidth: cw,
            months: monthData,
        };
    }, [zoomLevel, currentDate]);


    const handleDateChange = (direction: 'prev' | 'next') => {
        const amount = direction === 'prev' ? -1 : 1;
        const zoomInfo = zoomLevels[zoomLevel];
        
        let moveAmount = 7; // Default to week
        if (zoomInfo.name === 'Day') moveAmount = 3;
        if (zoomInfo.name === 'Week') moveAmount = 7;
        if (zoomInfo.name === 'Month') moveAmount = 30;
        if (zoomInfo.name === 'Quarter') moveAmount = 45;
        
        setCurrentDate(current => addDays(current, amount * moveAmount));
    };
    
    const handleZoom = (direction: 'in' | 'out') => {
        if (direction === 'in') {
            setZoomLevel(prev => Math.min(zoomLevels.length - 1, prev + 1));
        } else {
            setZoomLevel(prev => Math.max(0, prev - 1));
        }
    };
    
    const getTaskPosition = (task: TaskCard) => {
        const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate!);
        const endDate = task.dueDate ? parseISO(task.dueDate!) : startDate;
        
        if (startDate > endDate) return null; // Invalid date range

        const isMilestone = !task.startDate || !task.dueDate || task.startDate === task.dueDate;
        
        const startDayIndex = differenceInDays(startDate, dateRange[0]);
        const endDayIndex = differenceInDays(endDate, dateRange[0]);
        
        if (endDayIndex < 0 || startDayIndex >= dateRange.length) return null;

        const gridColumnStart = Math.max(1, startDayIndex + 1);
        const gridColumnEnd = Math.min(dateRange.length + 1, endDayIndex + 2);

        return { gridColumn: `${gridColumnStart} / span ${gridColumnEnd - gridColumnStart}`, isMilestone };
    }
    
    const getTaskStatus = (taskId: string) => {
        const column = Object.values(board.columns).find(c => c.taskIds.includes(taskId));
        return column ? column.title : 'Unassigned';
    };

    const todayIndex = differenceInDays(new Date(), dateRange[0]);
    let todayPosition: number | undefined;
    if (todayIndex >= 0 && todayIndex < dateRange.length) {
        const now = new Date();
        todayPosition = todayIndex + (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
    }
    
    const taskColWidth = 'minmax(200px, 1fr)';

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
                        <Button variant="outline" size="icon" onClick={() => handleZoom('out')} disabled={zoomLevel === 0}>
                            <ZoomOut />
                        </Button>
                         <Button variant="outline" size="icon" onClick={() => handleZoom('in')} disabled={zoomLevel === zoomLevels.length - 1}>
                            <ZoomIn />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="w-full h-full">
                    <div className="min-w-max relative">
                        <div 
                            className="grid bg-background" 
                            style={{ 
                                gridTemplateColumns: `${taskColWidth} ${gridTemplateColumns}`,
                                gridTemplateRows: `auto auto repeat(${tasks.length}, 40px)`
                            }}
                        >
                            {/* Headers */}
                            <div className="font-semibold p-2 border-b border-r bg-muted/50 sticky top-0 left-0 z-30 flex items-end">Task</div>
                            
                            {/* Month Headers */}
                            {Object.entries(months).map(([month, daysInMonth]) => (
                                <div key={month} className="text-center font-semibold p-2 border-b border-r bg-muted/30 sticky top-0 z-20" style={{ gridColumn: `${differenceInDays(daysInMonth[0], dateRange[0]) + 2} / span ${daysInMonth.length}` }}>
                                    {month}
                                </div>
                            ))}

                            {/* Day Headers */}
                            {dateRange.map((date, i) => (
                                <div key={date.toISOString()} className={cn(
                                    "text-center border-r border-b p-1 whitespace-nowrap sticky top-[49px] bg-muted/30 text-xs md:text-sm z-20",
                                    isToday(date) && "bg-primary/20",
                                    isWeekend(date) && "bg-muted/50",
                                )} style={{ gridColumn: i + 2, gridRow: 2 }}>
                                    <div className="text-xs">{format(date, 'E')}</div>
                                    <div className="font-semibold">{format(date, 'd')}</div>
                                </div>
                            ))}

                            {/* Vertical Grid Lines */}
                            {dateRange.map((_, i) => (
                               <div key={i} className="border-r" style={{ gridColumn: i + 2, gridRow: `3 / span ${tasks.length}`}}></div>
                            ))}

                            {/* Today Marker */}
                             {todayPosition !== undefined && (
                                <div className="absolute top-0 bottom-0 border-r-2 border-destructive z-10" style={{ left: `calc(${taskColWidth} + ${todayPosition * columnWidth}px)`, marginLeft: '1px' }}></div>
                             )}

                            {/* Task List & Timeline Grid */}
                            {tasks.map((task, index) => (
                                 <React.Fragment key={task.id}>
                                    <div className="h-10 flex items-center p-2 border-b border-r truncate sticky left-0 bg-background z-10 text-xs md:text-sm" style={{ gridRow: index + 3, gridColumn: 1 }}>
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
                                    <div className="relative border-b h-10 flex items-center" style={{gridRow: index + 3, gridColumn: `2 / -1`}}>
                                        {/* Task Bar */}
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
                                                                    style={{ 
                                                                        top: '50%',
                                                                        left: `calc((${pos.gridColumn.split(' / ')[0]} - 1) * ${columnWidth}px + ${columnWidth / 2}px)`,
                                                                    }}
                                                                >
                                                                    <div className={cn("w-full h-full rounded-sm", priorityColors[task.priority])}></div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    className="absolute h-7 bg-primary rounded-md flex items-center px-2 text-primary-foreground text-xs font-medium cursor-pointer hover:opacity-90 overflow-hidden" 
                                                                    style={{ 
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)',
                                                                        left: `calc((${pos.gridColumn.split(' / ')[0]} - 1) * ${columnWidth}px)`,
                                                                        width: `calc(${pos.gridColumn.split('span ')[1]} * ${columnWidth}px - 4px)`,
                                                                    }}
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
                                 </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
