
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfDay, isSameDay, isToday, isFuture, addDays, differenceInDays, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flag, Plus, Edit, Trash2, GripVertical, CheckCircle, Calendar as CalendarIconLucide, FastForward } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';

const priorityColors: Record<Priority, string> = {
    none: 'bg-muted-foreground',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
}

const NewTaskDialog = ({ isOpen, onOpenChange, forDate }: { isOpen: boolean, onOpenChange: (open: boolean) => void, forDate?: Date }) => {
    const { board, addTask } = useProjects();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(board.columnOrder.length > 0 ? board.columns[board.columnOrder[0]].title : '');
    const [priority, setPriority] = useState<Priority>('none');
    const [startDate, setStartDate] = useState<Date | undefined>(forDate);
    const [dueDate, setDueDate] = useState<Date | undefined>(forDate);

    React.useEffect(() => {
        setStartDate(forDate);
        setDueDate(forDate);
    }, [forDate])

    const handleSubmit = () => {
        if (!title.trim() || !status) return;
        const columnId = Object.values(board.columns).find(c => c.title === status)?.id;
        if (!columnId) return;
        
        const newTask: Partial<TaskCard> & { title: string } = {
            title,
            description: description || undefined,
            priority,
            startDate: startDate?.toISOString(),
            dueDate: dueDate?.toISOString()
        };

        addTask(columnId, newTask);
        // Reset form and close
        setTitle('');
        setDescription('');
        setPriority('none');
        setStartDate(undefined);
        setDueDate(undefined);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-title" className="text-right">Title</Label>
                        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="task-desc" className="text-right pt-2">Description</Label>
                        <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-status" className="text-right">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {board.columnOrder.map(colId => (
                                    <SelectItem key={colId} value={board.columns[colId].title}>{board.columns[colId].title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-priority" className="text-right">Priority</Label>
                        <Select value={priority} onValueChange={(p) => setPriority(p as Priority)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Set priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-startDate" className="text-right">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-dueDate" className="text-right">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!title.trim() || !status}>Save task</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const EditTaskDialog = ({ task, isOpen, onOpenChange, onSave }: { task: TaskCard | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (updatedTask: TaskCard, newStatusTitle?: string) => void }) => {
    const { board } = useProjects();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState<Priority>('none');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [dueDate, setDueDate] = useState<Date | undefined>();

    React.useEffect(() => {
        if (task) {
            const currentColumn = Object.values(board.columns).find(c => c.taskIds.includes(task.id));
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(currentColumn?.title || '');
            setPriority(task.priority);
            setStartDate(task.startDate ? new Date(task.startDate) : undefined);
            setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        }
    }, [task, board.columns]);

    const handleSubmit = () => {
        if (!task || !title.trim() || !status) return;
        
        const updatedTask: TaskCard = {
            ...task,
            title,
            description: description || undefined,
            priority,
            startDate: startDate?.toISOString(),
            dueDate: dueDate?.toISOString()
        };
        onSave(updatedTask, status);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-title" className="text-right">Title</Label>
                        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="task-desc" className="text-right pt-2">Description</Label>
                        <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-status" className="text-right">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {board.columnOrder.map(colId => (
                                    <SelectItem key={colId} value={board.columns[colId].title}>{board.columns[colId].title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-priority" className="text-right">Priority</Label>
                        <Select value={priority} onValueChange={(p) => setPriority(p as Priority)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Set priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-startDate" className="text-right">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-dueDate" className="text-right">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!title.trim() || !status}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const Countdown = ({ date }: { date: Date }) => {
    const [timeLeft, setTimeLeft] = useState(differenceInSeconds(date, new Date()));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(differenceInSeconds(date, new Date()));
        }, 1000);
        return () => clearInterval(timer);
    }, [date]);

    if (timeLeft <= 0) {
        return <span className="text-xs text-destructive">Overdue</span>;
    }

    const days = Math.floor(timeLeft / (60 * 60 * 24));
    const hours = Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    const seconds = Math.floor(timeLeft % 60);

    return (
        <span className="text-xs font-mono text-muted-foreground">
            {days > 0 && `${days}d `}
            {hours > 0 && `${hours}h `}
            {minutes > 0 && `${minutes}m `}
            {`${seconds}s`}
        </span>
    );
}

const SummaryCard = ({ title, tasks, icon: Icon, children, showCountdown = false }: { title: string, tasks: TaskCard[], icon: React.ElementType, children?: React.ReactNode, showCountdown?: boolean }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {title}
                    </div>
                    <div className="flex items-center gap-2">
                        {children}
                        <span className="text-sm font-normal text-muted-foreground">{tasks.length}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <div className={cn("h-2 w-2 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                                    <span className="truncate">{task.title}</span>
                                </div>
                                {showCountdown && task.dueDate && (
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <Countdown date={parseISO(task.dueDate)} />
                                        <span className="text-xs text-muted-foreground">{format(parseISO(task.dueDate), 'MMM d')}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {tasks.length > 5 && <p className="text-xs text-muted-foreground text-center pt-1">...and {tasks.length - 5} more.</p>}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No tasks found.</p>
                )}
            </CardContent>
        </Card>
    );
};

const upcomingRangeOptions = [
    { value: '7', label: '7 days' },
    { value: '15', label: '15 days' },
    { value: '30', label: '1 month' },
    { value: '90', label: '3 months' },
    { value: '180', label: '6 months' },
    { value: '365', label: '1 year' },
];

export function ProjectCalendarView() {
    const { board, updateTask, removeTask, setBoard } = useProjects();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [upcomingDays, setUpcomingDays] = useState('7');

    const tasksWithDueDate = useMemo(() => {
        return Object.values(board.tasks).filter(task => !!task.dueDate);
    }, [board.tasks]);
    
    const tasksByDay = useMemo(() => {
        return tasksWithDueDate.reduce((acc, task) => {
            const day = format(parseISO(task.dueDate!), 'yyyy-MM-dd');
            if (!acc[day]) acc[day] = [];
            acc[day].push(task);
            return acc;
        }, {} as Record<string, TaskCard[]>);
    }, [tasksWithDueDate]);

    const selectedDayTasks = useMemo(() => {
        if (!selectedDate) return [];
        const dayKey = format(selectedDate, 'yyyy-MM-dd');
        return (tasksByDay[dayKey] || []).sort((a,b) => (a.title > b.title ? 1 : -1));
    }, [selectedDate, tasksByDay]);

    const handleSaveTask = (updatedTask: TaskCard, newStatusTitle?: string) => {
        const originalColumn = Object.values(board.columns).find(c => c.taskIds.includes(updatedTask.id));
        const originalStatusTitle = originalColumn?.title;

        updateTask(updatedTask);

        if (newStatusTitle && newStatusTitle !== originalStatusTitle) {
            const oldCol = originalColumn;
            const newCol = Object.values(board.columns).find(c => c.title === newStatusTitle);

            if (oldCol && newCol) {
                setBoard(prev => {
                    const newColumns = {...prev.columns};
                    newColumns[oldCol.id].taskIds = newColumns[oldCol.id].taskIds.filter(tid => tid !== updatedTask.id);
                    newColumns[newCol.id].taskIds.push(updatedTask.id);
                    return {...prev, columns: newColumns};
                });
            }
        }
        setEditingTask(null);
    };

    const getTaskStatus = (taskId: string) => {
        return Object.values(board.columns).find(c => c.taskIds.includes(taskId));
    };

    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || !destination.droppableId.startsWith('day-')) {
            return;
        }

        const newDate = parseISO(destination.droppableId.replace('day-', ''));
        const task = board.tasks[draggableId];
        
        if (task) {
            updateTask({ ...task, dueDate: newDate.toISOString() });
        }
    };
    
    const { doneTasks, todaysTasks, upcomingTasks } = useMemo(() => {
        const doneColumnIds = board.columnOrder.filter(id => board.columns[id].title.toLowerCase().includes('done'));
        const doneTaskIds = new Set(doneColumnIds.flatMap(id => board.columns[id].taskIds));

        const allTasks = Object.values(board.tasks);
        const doneTasks = allTasks.filter(task => doneTaskIds.has(task.id)).sort((a, b) => new Date(b.dueDate!).getTime() - new Date(a.dueDate!).getTime());
        
        const activeTasks = allTasks.filter(task => !doneTaskIds.has(task.id));
        
        const todaysTasks = activeTasks.filter(task => task.dueDate && isToday(parseISO(task.dueDate)));
        
        const upcomingTasks = activeTasks.filter(task => {
            if (!task.dueDate) return false;
            const date = parseISO(task.dueDate);
            return isFuture(date) && !isToday(date) && differenceInDays(date, new Date()) <= parseInt(upcomingDays, 10);
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

        return { doneTasks, todaysTasks, upcomingTasks };
    }, [board, upcomingDays]);


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <Card className="lg:col-span-2">
                    <CardContent className="p-2 sm:p-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="p-0 [&_td]:p-0"
                            classNames={{
                                day: cn(
                                  "h-24 w-full p-1 relative",
                                  "focus-within:relative focus-within:z-20",
                                ),
                                day_selected: "text-primary-foreground",
                                day_today: "text-accent-foreground",
                            }}
                            modifiers={{ hasTask: (date) => tasksByDay[format(date, 'yyyy-MM-dd')]?.length > 0 }}
                            modifiersClassNames={{
                                hasTask: 'rdp-day_hasTask',
                            }}
                            components={{
                                Day: ({ date, displayMonth }) => {
                                    const dayKey = format(date, 'yyyy-MM-dd');
                                    const dayTasks = tasksByDay[dayKey] || [];
                                    const isOutside = date.getMonth() !== displayMonth.getMonth();
                                    
                                    const DayContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
                                        <Droppable droppableId={`day-${dayKey}`} isDropEnabled={!isOutside}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={cn(
                                                        "h-full w-full relative flex flex-col items-start p-1 rounded-md text-sm",
                                                        snapshot.isDraggingOver && "bg-primary/20 ring-2 ring-primary"
                                                    )}
                                                    {...props}
                                                >
                                                    <p className={cn("font-semibold", isSameDay(date, selectedDate || new Date(0)) && "text-primary")}>{date.getDate()}</p>
                                                    <div className="flex-1 mt-1 space-y-1 w-full overflow-hidden">
                                                        {dayTasks.slice(0, 3).map(task => (
                                                             <div key={task.id} className={cn("h-1.5 w-full rounded-full", priorityColors[task.priority])} />
                                                        ))}
                                                        {dayTasks.length > 3 && <p className="text-xs text-muted-foreground text-center">+{dayTasks.length - 3} more</p>}
                                                    </div>
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    );

                                    if (dayTasks.length > 0 && !isOutside) {
                                        return (
                                            <Popover>
                                                <PopoverTrigger asChild onFocus={(e) => e.preventDefault()}>
                                                    <div className="h-full w-full cursor-pointer">{DayContent({})}</div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-2">
                                                    <div className="font-bold mb-2">{dayTasks.length} task{dayTasks.length > 1 ? 's' : ''} on {format(date, 'MMM d')}</div>
                                                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                                                        {dayTasks.map(task => (
                                                            <li key={task.id} className="flex items-center gap-2">
                                                                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                                                                <span className="text-xs truncate">{task.title}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    }

                                    return <DayContent />;
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{selectedDate ? format(selectedDate, 'PPP') : 'Select a day'}</CardTitle>
                                <CardDescription>
                                    {selectedDayTasks.length > 0 ? `${selectedDayTasks.length} task${selectedDayTasks.length !== 1 && 's'} due` : 'Project Summary'}
                                </CardDescription>
                            </div>
                            <Button size="icon" onClick={() => setIsAddingTask(true)} disabled={!selectedDate}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full -mr-4">
                             {selectedDayTasks.length > 0 ? (
                                <Droppable droppableId="task-list">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 pr-4">
                                            {selectedDayTasks.map((task, index) => {
                                                const status = getTaskStatus(task.id);
                                                return (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                
                                                                className={cn(
                                                                    "p-3 border rounded-lg bg-muted/50 flex items-start justify-between gap-2 group",
                                                                    snapshot.isDragging && "shadow-lg"
                                                                )}
                                                            >
                                                                <div className="flex items-start gap-3 flex-1">
                                                                    <div {...provided.dragHandleProps} className="cursor-grab pt-1 opacity-50 group-hover:opacity-100 transition-opacity"><GripVertical size={16} /></div>
                                                                    <div className={cn("mt-1.5 h-3 w-3 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium leading-tight">{task.title}</p>
                                                                        {status && <p className="text-xs text-muted-foreground">{status.title}</p>}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingTask(task)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                                <AlertDialogDescription>This will permanently delete the task "{task.title}".</AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction onClick={() => removeTask(task.id, status?.id || '')}>Delete</AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ) : (
                               <div className="space-y-4 pr-4">
                                    <SummaryCard title="Completed Tasks" tasks={doneTasks} icon={CheckCircle} />
                                    <SummaryCard title="Today's Tasks" tasks={todaysTasks} icon={CalendarIconLucide} />
                                    <SummaryCard title="Upcoming" tasks={upcomingTasks} icon={FastForward} showCountdown>
                                        <Select value={upcomingDays} onValueChange={setUpcomingDays}>
                                            <SelectTrigger className="w-32 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {upcomingRangeOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </SummaryCard>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </div>

                <EditTaskDialog
                    task={editingTask}
                    isOpen={!!editingTask}
                    onOpenChange={(open) => !open && setEditingTask(null)}
                    onSave={handleSaveTask}
                />
                 <NewTaskDialog
                    isOpen={isAddingTask}
                    onOpenChange={setIsAddingTask}
                    forDate={selectedDate}
                />
            </div>
        </DragDropContext>
    );
}

    

    