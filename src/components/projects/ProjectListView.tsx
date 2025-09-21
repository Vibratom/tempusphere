
'use client';

import React, { useMemo, useState } from 'react';
import { useProjects, TaskCard, Priority } from '@/contexts/ProjectsContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const priorityColors: Record<Priority, string> = {
    none: 'text-muted-foreground',
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
};

const EditTaskDialog = ({ task, onSave, onCancel }: { task: TaskCard, onSave: (task: TaskCard) => void, onCancel: () => void }) => {
    const [editedTask, setEditedTask] = useState(task);

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={editedTask.title} onChange={(e) => setEditedTask({...editedTask, title: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">Description</Label>
                        <Textarea id="description" value={editedTask.description || ''} onChange={(e) => setEditedTask({...editedTask, description: e.target.value})} className="col-span-3" rows={4} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("col-span-3 justify-start text-left font-normal", !editedTask.startDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editedTask.startDate ? format(parseISO(editedTask.startDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editedTask.startDate ? parseISO(editedTask.startDate) : undefined} onSelect={(d) => setEditedTask({...editedTask, startDate: d?.toISOString()})} /></PopoverContent>
                        </Popover>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("col-span-3 justify-start text-left font-normal", !editedTask.dueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editedTask.dueDate ? format(parseISO(editedTask.dueDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editedTask.dueDate ? parseISO(editedTask.dueDate) : undefined} onSelect={(d) => setEditedTask({...editedTask, dueDate: d?.toISOString()})} /></PopoverContent>
                        </Popover>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">Priority</Label>
                        <Select value={editedTask.priority} onValueChange={(p) => setEditedTask({...editedTask, priority: p as Priority})}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => onSave(editedTask)}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export function ProjectListView() {
  const { board, updateTask } = useProjects();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);

  const data = useMemo(() => {
    return Object.values(board.tasks).map(task => {
      const column = Object.values(board.columns).find(c => c.taskIds.includes(task.id));
      return {
        ...task,
        status: column ? column.title : 'Unassigned',
      };
    });
  }, [board.tasks, board.columns]);

  const columns: ColumnDef<typeof data[0]>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Task
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('status')}</Badge>
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as Priority;
        return <div className="flex items-center gap-2 capitalize">
            <Flag className={cn("h-4 w-4", priorityColors[priority])} />
            {priority}
        </div>;
      }
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('startDate') as string;
        return date ? format(parseISO(date), 'PPP') : 'N/A';
      }
    },
    {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('dueDate') as string;
          return date ? format(parseISO(date), 'PPP') : 'N/A';
        }
      },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  const handleSave = (task: TaskCard) => {
    updateTask(task);
    setEditingTask(null);
  };

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <Input
          placeholder="Filter tasks..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => setEditingTask(row.original as TaskCard)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingTask && (
        <EditTaskDialog
            task={editingTask}
            onSave={handleSave}
            onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

    