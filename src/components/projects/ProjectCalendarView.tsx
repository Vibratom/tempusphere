
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flag, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
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

export function ProjectCalendarView() {
    const { board, updateTask, removeTask, setBoard } = useProjects();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);

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
                                day_button: "w-full h-full p-0 relative",
                                day: cn(
                                  "h-full w-full p-0 relative",
                                  "focus-within:relative focus-within:z-20",
                                  "[&:has([aria-selected])]:bg-transparent"
                                ),
                                day_selected: "text-primary-foreground",
                                day_today: "text-accent-foreground",
                            }}
                            modifiers={{ hasTask: (date) => tasksByDay[format(date, 'yyyy-MM-dd')]?.length > 0 }}
                            modifiersClassNames={{
                                hasTask: 'rdp-day_hasTask',
                                selected: 'rdp-day_selected',
                                today: 'rdp-day_today',
                            }}
                            components={{
                                Day: ({ date, displayMonth }) => {
                                    const dayKey = format(date, 'yyyy-MM-dd');
                                    const dayTasks = tasksByDay[dayKey] || [];
                                    const isOutside = date.getMonth() !== displayMonth.getMonth();
                                    
                                    const DayContent = (
                                        <Droppable droppableId={`day-${dayKey}`} isDropEnabled={!isOutside}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={cn(
                                                        "h-full w-full relative flex items-center justify-center rounded-md text-sm",
                                                        snapshot.isDraggingOver && "bg-primary/20 ring-2 ring-primary"
                                                    )}
                                                >
                                                    <p>{date.getDate()}</p>
                                                    {dayTasks.length > 0 && (
                                                        <div className="absolute bottom-1.5 flex space-x-1">
                                                            {dayTasks.slice(0, 4).map(task => (
                                                                <div key={task.id} className={cn("h-1.5 w-1.5 rounded-full", priorityColors[task.priority])} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    );

                                    if (dayTasks.length > 0 && !isOutside) {
                                        return (
                                            <Popover>
                                                <PopoverTrigger asChild onFocus={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
                                                    <div className="h-full w-full">{DayContent}</div>
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

                                    return DayContent;
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{selectedDate ? format(selectedDate, 'PPP') : 'Select a day'}</CardTitle>
                                <CardDescription>
                                    {selectedDayTasks.length} task{selectedDayTasks.length !== 1 && 's'} due
                                </CardDescription>
                            </div>
                            <Button size="icon" onClick={() => setIsAddingTask(true)} disabled={!selectedDate}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full -mr-4">
                            <Droppable droppableId="task-list">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 pr-4">
                                        {selectedDayTasks.length > 0 ? (
                                            selectedDayTasks.map((task, index) => {
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
                                            })
                                        ) : (
                                            <div className="text-center text-muted-foreground pt-12">
                                                <p>{selectedDate ? 'No tasks due on this day.' : 'Select a day to see tasks.'}</p>
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </ScrollArea>
                    </CardContent>
                </Card>

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
