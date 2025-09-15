
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, Priority } from '@/contexts/ProjectsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Flag, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortKey = 'title' | 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 };
const priorityColors: Record<Priority, string> = {
    none: 'text-muted-foreground',
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
}

export function ProjectListView() {
    const { board } = useProjects();
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('priority');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const tasksWithStatus = useMemo(() => {
        return Object.values(board.tasks).map(task => {
            const column = Object.values(board.columns).find(c => c.taskIds.includes(task.id));
            return {
                ...task,
                status: column ? column.title : 'Unassigned',
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
                    // Handle no due date by pushing them to the end
                    if(compareA === 0) compareA = sortDirection === 'asc' ? Infinity : -Infinity;
                    if(compareB === 0) compareB = sortDirection === 'asc' ? Infinity : -Infinity;
                    break;
                default:
                    compareA = a[sortKey] || '';
                    compareB = b[sortKey] || '';
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
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
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
                            <Button variant="outline" className="w-full md:w-auto flex-shrink-0">
                                <Flag className={cn("mr-2 h-4 w-4", priorityFilter !== 'all' && priorityColors[priorityFilter])}/>
                                <span>Priority</span>
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
                </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <SortableHeader tkey="title" label="Task" />
                            <SortableHeader tkey="status" label="Status" />
                            <SortableHeader tkey="priority" label="Priority" />
                            <SortableHeader tkey="dueDate" label="Due Date" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTasks.length > 0 ? (
                             filteredAndSortedTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                                            {task.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Flag className={cn("h-4 w-4", priorityColors[task.priority])} />
                                            <span className="capitalize">{task.priority === 'none' ? 'None' : task.priority}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
