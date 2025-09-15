
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isToday, isWeekend, addMonths } from 'date-fns';
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

    const { dateRange, gridTemplateColumns, numColumns } = useMemo(() => {
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
                end = endOfMonth(addMonths(currentDate, 1));
                break;
        }
        
        const validDateRange = eachDayOfInterval({ start, end });
        
        let columns;
        let numCols = validDateRange.length;

        if (viewMode === 'week') {
            numCols = Math.ceil(validDateRange.length / 7);
            columns = `repeat(${numCols}, minmax(140px, 1fr))`;
        } else {
            columns = `repeat(${numCols}, minmax(50px, 1fr))`;
        }
        
        return { dateRange: validDateRange, gridTemplateColumns: columns, numColumns: numCols };
    }, [viewMode, currentDate]);


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
                setCurrentDate(prev => addMonths(prev, amount));
                break;
        }
    };
    
    const getTaskPosition = (task: TaskCard) => {
        const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate!);
        const endDate = task.dueDate ? parseISO(task.dueDate!) : startDate;
        
        if (startDate > endDate) return null; // Invalid date range

        const isMilestone = !task.startDate || !task.dueDate || task.startDate === task.dueDate;

        if (viewMode === 'week') {
            const startDayIndex = differenceInDays(startDate, dateRange[0]);
            const endDayIndex = differenceInDays(endDate, dateRange[0]);
            const startWeekIndex = Math.floor(startDayIndex / 7);
            const endWeekIndex = Math.floor(endDayIndex / 7);
            
            const startOffset = (startDayIndex % 7) / 7;
            const endOffset = ((endDayIndex % 7) + 1) / 7;

            const gridColumnStart = startWeekIndex + 1 + startOffset;
            const gridColumnEnd = endWeekIndex + 1 + endOffset;
            
            if (gridColumnStart > numColumns || gridColumnEnd < 1) return null;

            return { gridColumn: `${gridColumnStart} / ${gridColumnEnd}`, isMilestone };
        }
        
        const startDayIndex = differenceInDays(startDate, dateRange[0]) + 1;
        const endDayIndex = differenceInDays(endDate, dateRange[0]) + 1;
        
        if (startDayIndex > dateRange.length || endDayIndex < 1) return null;

        const gridColumnStart = Math.max(1, startDayIndex);
        const gridColumnEnd = Math.min(dateRange.length + 1, endDayIndex + 1);

        return { gridColumn: `${gridColumnStart} / ${gridColumnEnd}`, isMilestone };
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
                        <div key={weekStart.toISOString()} className="text-center border-r border-b p-2 font-semibold bg-muted/30 sticky top-0">
                            Week of {format(weekStart, 'MMM d')}
                        </div>
                    ))}
                </>
            );
        }
        
        const months: { [key: string]: Date[] } = {};
        dateRange.forEach(date => {
            const monthKey = format(date, 'MMMM yyyy');
            if (!months[monthKey]) {
                months[monthKey] = [];
            }
            months[monthKey].push(date);
        });

        return (
             <>
                {Object.entries(months).map(([month, days]) => (
                    <React.Fragment key={month}>
                        <div className="text-center font-semibold p-2 border-b border-r bg-muted/30 sticky top-0" style={{ gridColumn: `${differenceInDays(days[0], dateRange[0]) + 1} / span ${days.length}` }}>
                            {month}
                        </div>
                        {days.map(date => (
                            <div key={date.toISOString()} className={cn(
                                "text-center border-r border-b p-2 whitespace-nowrap sticky top-[49px]",
                                isToday(date) && "bg-primary/20",
                                isWeekend(date) && viewMode !== 'week' && "bg-muted/30",
                                viewMode !== 'day' && 'bg-muted/30'
                            )}>
                                {viewMode === 'day' && <div className="text-xs">{format(date, 'E')}</div>}
                                <div className="font-semibold">{format(date, 'd')}</div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </>
        )
    };
    
    const todayIndex = differenceInDays(new Date(), dateRange[0]);
    let todayPosition: number | undefined;
    if (todayIndex >= 0 && todayIndex < dateRange.length) {
        if (viewMode === 'week') {
            todayPosition = (todayIndex / 7);
        } else {
            todayPosition = todayIndex + (new Date().getHours() / 24);
        }
    }


    return (
        <Card className="h-[75vh] flex flex-col">
            <CardHeader className="flex-row items-center justify-between flex-shrink-0">
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
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="w-full h-full">
                    <div className="grid min-w-max" style={{ gridTemplateColumns: `224px ${gridTemplateColumns}`, gridTemplateRows: `auto auto repeat(${tasks.length}, 3rem)` }}>
                        {/* Headers */}
                        <div className="font-semibold p-2 border-b border-r bg-muted/30 sticky top-0 left-0 z-20" style={{gridRow: '1 / span 2'}}>Task</div>
                        <Header />
                        
                        {/* Task List & Timeline Grid */}
                        {tasks.map((task, index) => (
                             <React.Fragment key={task.id}>
                                <div className="h-12 flex items-center p-2 border-b border-r truncate sticky left-0 bg-background z-10" style={{ gridRow: index + 3}}>
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
                                <div className="relative border-b" style={{gridRow: index + 3, gridColumn: `2 / -1`}}>
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
                                                                className="absolute h-7 w-7 self-center cursor-pointer hover:opacity-90 z-10"
                                                                style={{ 
                                                                    top: '50%',
                                                                    left: `calc((${pos.gridColumn.split('/')[0].trim()}) / ${numColumns} * 100%)`,
                                                                    transform: 'translateY(-50%) translateX(-50%) rotate(45deg)'
                                                                }}
                                                            >
                                                                <div className={cn("w-full h-full rounded-sm", priorityColors[task.priority])}></div>
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                className="absolute h-8 bg-primary rounded-md flex items-center px-2 text-primary-foreground text-xs font-medium cursor-pointer hover:opacity-90 overflow-hidden self-center" 
                                                                style={{ 
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    gridColumn: pos.gridColumn,
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
                        {/* Vertical Grid Lines underneath tasks */}
                        <div className="absolute top-0 right-0 bottom-0 grid pointer-events-none" style={{left: '224px', gridTemplateColumns, gridTemplateRows: `auto auto repeat(${tasks.length}, 3rem)`}}>
                             {Array.from({ length: numColumns }).map((_, i) => (
                                <div key={i} className="border-r h-full" style={{gridColumn: i + 1, gridRow: `1 / -1`}}></div>
                             ))}
                             {/* Today Marker */}
                             {todayPosition !== undefined && (
                                <div className="absolute top-0 bottom-0 border-r-2 border-destructive z-20" style={{ left: `calc(${todayPosition} * (100% / ${numColumns}))` }}></div>
                             )}
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

    