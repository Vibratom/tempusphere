'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard } from '@/contexts/ProjectsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flag, Search, ArrowUp, ArrowDown, Plus, Calendar as CalendarIcon, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

type SortKey = 'title' | 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 };
const priorityColors: Record<Priority, string> = {
    none: 'text-muted-foreground',
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
}

const NewTaskDialog = () => {
    const { board, addTask } = useProjects();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(board.columnOrder.length > 0 ? board.columns[board.columnOrder[0]].title : '');
    const [priority, setPriority] = useState<Priority>('none');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [isOpen, setIsOpen] = useState(false);

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
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </DialogTrigger>
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

export function SpreadsheetView() {
    const { board, updateTask, removeTask, setBoard } = useProjects();
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('priority');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [editingTask, setEditingTask] = useState<TaskCard | null>(null);

    const tasksWithStatus = useMemo(() => {
        return Object.values(board.tasks).map(task => {
            const column = Object.values(board.columns).find(c => c.taskIds.includes(task.id));
            return {
                ...task,
                status: column ? column.title : 'Unassigned',
                columnId: column ? column.id : '',
            };
        });
    }, [board.tasks, board.columns]);

    const filteredAndSortedTasks = useMemo(() => {
        let tasks = tasksWithStatus;

        // Filtering
        if (filter) {
            tasks = tasks.filter(task => task.title.toLowerCase().includes(filter.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            tasks = tasks.filter(task => task.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            tasks = tasks.filter(task => task.priority === priorityFilter);
        }

        // Sorting
        tasks.sort((a, b) => {
            let compareA: any;
            let compareB: any;

            switch (sortKey) {
                case 'priority':
                    compareA = priorityMap[a.priority];
                    compareB = priorityMap[b.priority];
                    break;
                case 'dueDate':
                    compareA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    compareB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    if(compareA === 0) compareA = sortDirection === 'asc' ? Infinity : -Infinity;
                    if(compareB === 0) compareB = sortDirection === 'asc' ? Infinity : -Infinity;
                    break;
                default:
                    compareA = a[sortKey as keyof typeof a] || '';
                    compareB = b[sortKey as keyof typeof b] || '';
                    break;
            }
            
            if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
            if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return tasks;
    }, [tasksWithStatus, filter, statusFilter, priorityFilter, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleSaveTask = (updatedTask: TaskCard, newStatusTitle?: string) => {
        const originalTask = tasksWithStatus.find(t => t.id === updatedTask.id);
        const originalStatusTitle = originalTask?.status;

        updateTask(updatedTask);

        if (newStatusTitle && newStatusTitle !== originalStatusTitle) {
            const oldCol = Object.values(board.columns).find(c => c.title === originalStatusTitle);
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
    }
    
    const SortableHeader = ({ tkey, label }: { tkey: SortKey, label: string}) => (
        <TableHead onClick={() => handleSort(tkey)} className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
                {label}
                {sortKey === tkey && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
            </div>
        </TableHead>
    );

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter tasks by title..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-8 w-full"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto shrink-0">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {board.columnOrder.map(colId => (
                                <SelectItem key={colId} value={board.columns[colId].title}>
                                    {board.columns[colId].title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto justify-start px-2">
                                <Flag className={cn("mr-2 h-4 w-4", priorityFilter !== 'all' && priorityColors[priorityFilter])}/>
                                <span className="hidden sm:inline">Priority</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuRadioGroup value={priorityFilter} onValueChange={(p) => setPriorityFilter(p as Priority | 'all')}>
                                <DropdownMenuRadioItem value="all">All Priorities</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="high"><Flag className="h-4 w-4 mr-2 text-red-500"/>High</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="medium"><Flag className="h-4 w-4 mr-2 text-yellow-500"/>Medium</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="low"><Flag className="h-4 w-4 mr-2 text-blue-500"/>Low</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="none"><Flag className="h-4 w-4 mr-2 text-muted-foreground"/>None</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <NewTaskDialog />
                </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-card flex-1">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                            <SortableHeader tkey="title" label="Task" />
                            <SortableHeader tkey="status" label="Status" />
                            <SortableHeader tkey="priority" label="Priority" />
                            <SortableHeader tkey="dueDate" label="End Date" />
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTasks.length > 0 ? (
                             filteredAndSortedTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{task.title}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                                            {task.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Flag className={cn("h-4 w-4", priorityColors[task.priority])} />
                                            <span className="capitalize hidden sm:inline">{task.priority === 'none' ? 'None' : task.priority}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : <span className="text-muted-foreground">No date</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete the task "{task.title}".</AlertDialogDescription>
                                                        </Header>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => removeTask(task.id, task.columnId)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <EditTaskDialog
                task={editingTask}
                isOpen={!!editingTask}
                onOpenChange={(open) => !open && setEditingTask(null)}
                onSave={handleSaveTask}
            />
        </div>
    );
}
