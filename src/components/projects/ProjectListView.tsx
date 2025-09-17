
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority, TaskCard, ResourceType, LinkedResource } from '@/contexts/ProjectsContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flag, Search, ArrowUp, ArrowDown, Plus, Calendar as CalendarIcon, MoreHorizontal, Edit, Trash2, Send, Link as LinkIcon, GitCommit, Brain, DraftingCompass } from 'lucide-react';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useCalendar } from '@/contexts/CalendarContext';
import { useChecklist } from '@/contexts/ChecklistContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type SortKey = 'title' | 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 };
const priorityColors: Record<Priority, string> = {
    none: 'text-muted-foreground',
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
}

const resourceMap: Record<ResourceType, { icon: React.ElementType, href: string }> = {
    'chart': { icon: GitCommit, href: '/projects/chart' },
    'mindmap': { icon: Brain, href: '/projects/mindmap' },
    'canvas': { icon: DraftingCompass, href: '/projects/canvas' },
};


const NewTaskDialog = () => {
    const { board, addTask } = useProjects();
    const { addEvent } = useCalendar();
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
        
        const newTaskDetails: Partial<TaskCard> & { title: string } = {
            title,
            description: description || undefined,
            priority,
            startDate: startDate?.toISOString(),
            dueDate: dueDate?.toISOString()
        };

        const newTask = addTask(columnId, newTaskDetails);
        if (newTask.dueDate) {
            addEvent({
                date: newTask.dueDate,
                time: '09:00',
                title: newTask.title,
                description: `Project Task: ${newTask.title}`,
                color: 'purple',
                type: 'Work',
                sourceId: newTask.id,
            });
        }

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
    const { events, updateEvent, addEvent, removeEvent } = useCalendar();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState<Priority>('none');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [linkedResources, setLinkedResources] = useState<LinkedResource[]>([]);

    React.useEffect(() => {
        if (task) {
            const currentColumn = Object.values(board.columns).find(c => c.taskIds.includes(task.id));
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(currentColumn?.title || '');
            setPriority(task.priority);
            setStartDate(task.startDate ? new Date(task.startDate) : undefined);
            setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
            setLinkedResources(task.linkedResources || []);
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
            dueDate: dueDate?.toISOString(),
            linkedResources
        };
        onSave(updatedTask, status);

        const calendarEvent = events.find(e => e.sourceId === task.id);
        if (updatedTask.dueDate) {
            const eventData = {
                date: updatedTask.dueDate,
                time: '09:00',
                title: updatedTask.title,
                description: `Project Task: ${updatedTask.title}`,
                color: 'purple',
                type: 'Work',
                sourceId: updatedTask.id,
            };
            if (calendarEvent) {
                updateEvent({ ...calendarEvent, ...eventData });
            } else {
                addEvent(eventData);
            }
        } else if (calendarEvent) {
            removeEvent(calendarEvent.id);
        }
    }
    
    const handleAddResource = (type: ResourceType) => {
        if (linkedResources.some(r => r.type === type)) return;
        const newResource: LinkedResource = { type, label: `${type.charAt(0).toUpperCase() + type.slice(1)}` };
        setLinkedResources([...linkedResources, newResource]);
    }

    const handleRemoveResource = (type: ResourceType) => {
        setLinkedResources(linkedResources.filter(r => r.type !== type));
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
                    <Separator />
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Linked Resources</Label>
                         <div className="col-span-3 space-y-2">
                             {linkedResources.length > 0 && (
                                <div className="space-y-2">
                                {linkedResources.map(resource => {
                                    const { icon: Icon, href } = resourceMap[resource.type];
                                    return (
                                        <div key={resource.type} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-muted-foreground"/>
                                                <Link href={href} className="text-sm font-medium hover:underline">{resource.label}</Link>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveResource(resource.type)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    )
                                })}
                                </div>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <LinkIcon className="mr-2 h-4 w-4" /> Add Resource
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {Object.keys(resourceMap).map(type => (
                                        <DropdownMenuItem key={type} onSelect={() => handleAddResource(type as ResourceType)} disabled={linkedResources.some(r => r.type === type)}>
                                            <resourceMap[type as ResourceType].icon className="mr-2 h-4 w-4"/>
                                            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!title.trim() || !status}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ProjectListView() {
    const { board, updateTask, removeTask, setBoard } = useProjects();
    const { events, removeEvent } = useCalendar();
    const { lists, addTask: addChecklistTask } = useChecklist();
    const { toast } = useToast();
    
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('priority');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
    const [isClient, setIsClient] = useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

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
    
    const handleDeleteTask = (task: typeof tasksWithStatus[0]) => {
        removeTask(task.id, task.columnId);
        const calendarEvent = events.find(e => e.sourceId === task.id);
        if (calendarEvent) {
            removeEvent(calendarEvent.id);
        }
    }

    const handleSendToChecklist = (task: TaskCard, listId: string) => {
        addChecklistTask(listId, {
            text: task.title,
            dueDate: task.dueDate,
            isRecurring: false,
        });
        toast({ title: "Task Sent", description: `"${task.title}" was added to your checklist.`});
    };
    
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
                            <Button variant="outline" className="w-full md:w-[150px] justify-start">
                                <div className="flex items-center gap-2 w-full">
                                    <Flag className={cn("h-4 w-4", priorityFilter !== 'all' && priorityColors[priorityFilter])}/>
                                    <span className="capitalize">{priorityFilter}</span>
                                    <span className="ml-auto">
                                        {sortKey === 'priority' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                                    </span>
                                </div>
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
            <ScrollArea className="flex-1 -mr-4">
                <div className="space-y-3 pr-4">
                    {filteredAndSortedTasks.length > 0 ? (
                        filteredAndSortedTasks.map(task => (
                            <Card key={task.id} className="p-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium">{task.title}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <Badge variant="secondary">{task.status}</Badge>
                                            {isClient && task.dueDate && <span>- Due {format(parseISO(task.dueDate), 'MMM d')}</span>}
                                        </div>
                                         {task.linkedResources && task.linkedResources.length > 0 && (
                                            <div className="flex items-center gap-3 mt-2">
                                                {task.linkedResources.map(resource => {
                                                    const { icon: Icon, href } = resourceMap[resource.type];
                                                    return (
                                                        <Link key={resource.type} href={href}>
                                                            <Badge variant="outline" className="hover:bg-accent">
                                                                <Icon className="mr-1 h-3 w-3"/>
                                                                {resource.label}
                                                            </Badge>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Flag className={cn("h-4 w-4", priorityColors[task.priority])} />
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
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send to Checklist
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                             {lists.length > 0 ? lists.map(list => (
                                                                <DropdownMenuItem key={list.id} onSelect={() => handleSendToChecklist(task, list.id)}>
                                                                    <span>{list.title}</span>
                                                                </DropdownMenuItem>
                                                            )) : <DropdownMenuItem disabled>No checklists found</DropdownMenuItem>}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
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
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteTask(task)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                         <div className="h-24 flex items-center justify-center text-muted-foreground">
                            No tasks found.
                        </div>
                    )}
                </div>
            </ScrollArea>

            <EditTaskDialog
                task={editingTask}
                isOpen={!!editingTask}
                onOpenChange={(open) => !open && setEditingTask(null)}
                onSave={handleSaveTask}
            />
        </div>
    );
}

    

    
