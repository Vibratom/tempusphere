
'use client';

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListChecks, Calendar as CalendarIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
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
} from "@/components/ui/alert-dialog"
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, formatDistanceToNow, isPast, startOfDay } from 'date-fns';


interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO string
}

interface Checklist {
  id: string;
  title: string;
  tasks: Task[];
}

interface NewTaskState {
    text: string;
    dueDate?: Date;
}

export function ChecklistApp() {
  const [lists, setLists] = useLocalStorage<Checklist[]>('checklist:lists', []);
  const [newListName, setNewListName] = useState('');
  const [newTaskState, setNewTaskState] = useState<Record<string, NewTaskState>>({});

  const addTask = (listId: string) => {
    const taskDetails = newTaskState[listId];
    if (taskDetails && taskDetails.text.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskDetails.text.trim(),
        completed: false,
        dueDate: taskDetails.dueDate ? startOfDay(taskDetails.dueDate).toISOString() : undefined,
      };
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
        )
      );
      setNewTaskState({ ...newTaskState, [listId]: { text: '' } });
    }
  };

  const handleNewTaskChange = (listId: string, part: Partial<NewTaskState>) => {
    setNewTaskState(prev => ({
        ...prev,
        [listId]: {
            ...(prev[listId] || { text: '' }),
            ...part
        }
    }));
  };

  const addList = () => {
    if (newListName.trim()) {
      const newList: Checklist = {
        id: Date.now().toString(),
        title: newListName.trim(),
        tasks: [],
      };
      setLists([...lists, newList]);
      setNewListName('');
    }
  };

  const removeList = (listId: string) => {
    setLists(lists.filter((list) => list.id !== listId));
  };

  const removeTask = (listId: string, taskId: string) => {
    setLists(
      lists.map((list) =>
        list.id === listId
          ? { ...list, tasks: list.tasks.filter((task) => task.id !== taskId) }
          : list
      )
    );
  };

  const toggleTask = (listId: string, taskId: string) => {
    setLists(
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : list
      )
    );
  };
  
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => {
      const aIsComplete = a.tasks.length > 0 && a.tasks.every(t => t.completed);
      const bIsComplete = b.tasks.length > 0 && b.tasks.every(t => t.completed);
      if (aIsComplete && !bIsComplete) return 1;
      if (!aIsComplete && bIsComplete) return -1;
      return 0;
    });
  }, [lists]);

  const DueDateDisplay = ({ dueDate }: { dueDate?: string }) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const isOverdue = isPast(date) && !startOfDay(date).getTime() === startOfDay(new Date()).getTime();
    
    return (
      <span className={cn(
        "text-xs text-muted-foreground ml-2",
        isOverdue && "text-destructive font-semibold"
      )}>
        (Due: {formatDistanceToNow(date, { addSuffix: true })})
      </span>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Checklist</h1>
          <p className="text-lg text-muted-foreground mt-2">Organize your tasks and get things done.</p>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a New List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="E.g., Groceries, Work Tasks..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addList()}
            />
            <Button onClick={addList}>
              <Plus className="mr-2 h-4 w-4" /> Add List
            </Button>
          </div>
        </CardContent>
      </Card>

      {lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLists.map((list) => {
            const completedTasks = list.tasks.filter(t => t.completed).length;
            const totalTasks = list.tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;

            return (
              <Card key={list.id} className={cn("flex flex-col transition-opacity", isAllComplete && "opacity-60")}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{list.title}</CardTitle>
                     {totalTasks > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {completedTasks} / {totalTasks} completed
                        </p>
                    )}
                  </div>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the "{list.title}" list and all its tasks. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeList(list.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                   </AlertDialog>
                </CardHeader>
                 {totalTasks > 0 && 
                  <div className="px-6 pb-2">
                    <Progress value={progress} />
                  </div>
                 }
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new task..."
                      value={newTaskState[list.id]?.text || ''}
                      onChange={(e) => handleNewTaskChange(list.id, { text: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addTask(list.id)}
                    />
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className={cn(newTaskState[list.id]?.dueDate && 'text-primary')}>
                                <CalendarIcon className="h-4 w-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={newTaskState[list.id]?.dueDate}
                                onSelect={(date) => handleNewTaskChange(list.id, { dueDate: date })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button size="icon" onClick={() => addTask(list.id)}><Plus className="h-4 w-4"/></Button>
                  </div>
                  <Separator />
                  <ScrollArea className="flex-1 h-48 -mr-4">
                      <div className="space-y-3 pr-4">
                      {list.tasks.length > 0 ? list.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <Checkbox
                                      id={`task-${task.id}`}
                                      checked={task.completed}
                                      onCheckedChange={() => toggleTask(list.id, task.id)}
                                  />
                                  <label
                                      htmlFor={`task-${task.id}`}
                                      className={cn(
                                          "text-sm font-medium leading-none cursor-pointer",
                                          task.completed ? "line-through text-muted-foreground" : ""
                                      )}
                                  >
                                      {task.text}
                                      <DueDateDisplay dueDate={task.dueDate} />
                                  </label>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeTask(list.id, task.id)}>
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                          </div>
                      )) : (
                          <p className="text-sm text-muted-foreground text-center pt-4">No tasks yet. Add one above!</p>
                      )}
                      </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
            <ListChecks className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">No Lists Yet</h3>
            <p className="text-sm">Create your first list to get started.</p>
        </div>
      )}
    </div>
  );
}
