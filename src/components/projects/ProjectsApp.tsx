
'use client';

import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, Calendar as CalendarIcon, FileText, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
import { Textarea } from '../ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProjects, Priority, TaskCard, BoardData } from '@/contexts/ProjectsContext';


const priorityColors: Record<Priority, string> = {
    none: 'bg-transparent',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
}


export function ProjectsApp() {
  const { 
    board, 
    setBoard, 
    addColumn: contextAddColumn,
    addTask: contextAddTask,
    removeTask: contextRemoveTask,
    updateTask: contextUpdateTask,
    removeColumn: contextRemoveColumn,
    handleDragEnd
  } = useProjects();

  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleNewTaskTitleChange = (columnId: string, title: string) => {
    setNewTaskTitles(prev => ({...prev, [columnId]: title}));
  }

  const addColumn = () => {
    if(!newColumnName.trim()) return;
    contextAddColumn(newColumnName.trim());
    setNewColumnName('');
  };

  const addTask = (columnId: string) => {
    const title = newTaskTitles[columnId]?.trim();
    if(!title) return;
    contextAddTask(columnId, { title });
    setNewTaskTitles(prev => ({...prev, [columnId]: ''}));
  }

  const handleExport = () => {
    const jsonString = JSON.stringify(board, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-board.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Board Exported', description: 'Your project board has been saved as a JSON file.' });
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedBoard = JSON.parse(text) as BoardData;
        // Basic validation
        if (importedBoard.tasks && importedBoard.columns && importedBoard.columnOrder) {
          setBoard(importedBoard);
          toast({ title: 'Import Successful', description: 'Your project board has been loaded.' });
        } else {
          throw new Error('Invalid JSON format for project board.');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Import Failed', description: (error as Error).message });
      }
    };
    reader.readAsText(file);
    if(importFileRef.current) importFileRef.current.value = ""; // Reset file input
  }

  const handleSaveEditingTask = () => {
    if (editingTask) {
      contextUpdateTask(editingTask);
      setEditingTask(null);
    }
  };
  
  const renderEditModal = () => {
    if (!editingTask) return null;

    return (
       <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">Notes</Label>
                        <Textarea id="description" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} className="col-span-3" rows={5} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !editingTask.startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingTask.startDate ? format(new Date(editingTask.startDate), "PPP") : <span>Pick a start date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={editingTask.startDate ? new Date(editingTask.startDate) : undefined}
                                    onSelect={(date) => setEditingTask({...editingTask, startDate: date?.toISOString()})}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !editingTask.dueDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingTask.dueDate ? format(new Date(editingTask.dueDate), "PPP") : <span>Pick an end date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined}
                                    onSelect={(date) => setEditingTask({...editingTask, dueDate: date?.toISOString()})}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">Priority</Label>
                        <Select value={editingTask.priority} onValueChange={(p) => setEditingTask({...editingTask, priority: p as Priority})}>
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
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveEditingTask}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }
  
  if (!isClient) {
    return null; // Don't render server-side to avoid hydration mismatch
  }

  return (
    <div className="w-full h-full flex flex-col">
        {renderEditModal()}
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Board</h1>
            <p className="text-lg text-muted-foreground mt-2">Visualize your workflow with a Kanban board.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <div className="flex gap-2 flex-1">
                <Input 
                    placeholder="Add new column..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                />
                <Button onClick={addColumn}><Plus className="mr-2 h-4 w-4"/>Add Column</Button>
            </div>
             <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4"/> Export Board</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import Board</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Import Board Data</AlertDialogTitle>
                            <AlertDialogDescription>This will overwrite your current board. This action cannot be undone. Please ensure you have an exported backup of your current board if needed.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => importFileRef.current?.click()}>Confirm & Import</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden" />
            </div>
        </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
                <ScrollArea className="w-full whitespace-nowrap">
                    <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="flex gap-6 pb-4"
                    >
                        {board.columnOrder.map((columnId, index) => {
                            const column = board.columns[columnId];
                            const tasks = column.taskIds.map(taskId => board.tasks[taskId]).filter(Boolean);

                            return (
                              <Draggable key={column.id} draggableId={column.id} index={index}>
                                {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="w-80 flex-shrink-0 inline-block align-top"
                                >
                                  <Card className="bg-muted/50 flex flex-col h-full">
                                      <div {...provided.dragHandleProps} className="p-3 border-b flex justify-between items-center cursor-grab">
                                          <h3 className="font-semibold">{column.title}</h3>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                               <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Column?</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure you want to delete the "{column.title}" column? All tasks within it will also be deleted. This cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => contextRemoveColumn(columnId)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                      </div>
                                      <ScrollArea className="flex-grow">
                                        <Droppable droppableId={column.id} type="TASK">
                                          {(provided, snapshot) => (
                                              <CardContent
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={cn("p-3 space-y-3 min-h-[100px]", snapshot.isDraggingOver ? 'bg-primary/10' : '')}
                                              >
                                                {tasks.map((task, index) => (
                                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                      <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="group"
                                                        onClick={() => setEditingTask(task)}
                                                      >
                                                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                            <div className={cn("w-full h-1.5 rounded-t-lg", priorityColors[task.priority])} />
                                                              <CardContent className="p-3">
                                                                  <div className="flex justify-between items-start">
                                                                    <p className="text-sm font-medium pr-2">{task.title}</p>
                                                                    <AlertDialog onOpenChange={(e) => e.stopPropagation()}>
                                                                        <AlertDialogTrigger asChild>
                                                                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4"/></Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                          <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                              This action cannot be undone. This will permanently delete the card.
                                                                            </AlertDialogDescription>
                                                                          </AlertDialogHeader>
                                                                          <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => contextRemoveTask(task.id, column.id)}>Delete</AlertDialogAction>
                                                                          </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                      </AlertDialog>
                                                                  </div>
                                                                   <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                                                    {task.description && <FileText className="h-4 w-4"/>}
                                                                    {(task.startDate || task.dueDate) && <CalendarIcon className="h-4 w-4"/>}
                                                                  </div>
                                                              </CardContent>
                                                          </Card>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))}
                                                {provided.placeholder}
                                              </CardContent>
                                          )}
                                        </Droppable>
                                      </ScrollArea>
                                      <div className="p-3 border-t">
                                        <div className="flex gap-2">
                                          <Input 
                                            placeholder="New task..."
                                            value={newTaskTitles[column.id] || ''}
                                            onChange={(e) => handleNewTaskTitleChange(column.id, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addTask(column.id)}
                                          />
                                          <Button size="icon" onClick={() => addTask(column.id)}><Plus className="h-4 w-4" /></Button>
                                        </div>
                                      </div>
                                  </Card>
                                </div>
                                )}
                              </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
