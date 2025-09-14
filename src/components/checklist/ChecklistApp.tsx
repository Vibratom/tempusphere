
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListChecks, Calendar as CalendarIcon, Flag, GripVertical } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';


type Priority = 'none' | 'low' | 'medium' | 'high';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO string
  priority: Priority;
  subtasks: Task[];
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
  const [lists, setLists] = useLocalStorage<Checklist[]>('checklist:listsV2', []);
  const [newListName, setNewListName] = useState('');
  const [newTaskState, setNewTaskState] = useState<Record<string, NewTaskState>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const recursivelyUpdateTasks = (tasks: Task[], listId: string, updater: (task: Task) => Task): Task[] => {
    return tasks.map(task => {
        const updatedTask = updater(task);
        if (updatedTask.subtasks.length > 0) {
            updatedTask.subtasks = recursivelyUpdateTasks(updatedTask.subtasks, listId, updater);
        }
        return updatedTask;
    });
  };
  
  const findAndModifyTask = (tasks: Task[], taskId: string, modifier: (task: Task) => Task | null): Task[] => {
    return tasks.reduce((acc, task) => {
        if (task.id === taskId) {
            const modified = modifier(task);
            if(modified) acc.push(modified);
        } else {
            acc.push({
                ...task,
                subtasks: findAndModifyTask(task.subtasks, taskId, modifier)
            });
        }
        return acc;
    }, [] as Task[]);
  };
  
  const findAndAddTask = (tasks: Task[], parentId: string, newTask: Task): Task[] => {
      return tasks.map(task => {
          if (task.id === parentId) {
              return {...task, subtasks: [newTask, ...task.subtasks]}
          }
          return {
            ...task,
            subtasks: findAndAddTask(task.subtasks, parentId, newTask)
          };
      });
  };

  const addTask = (listId: string, parentId?: string) => {
    const taskDetails = newTaskState[parentId || listId];
    if (taskDetails && taskDetails.text.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskDetails.text.trim(),
        completed: false,
        dueDate: taskDetails.dueDate ? startOfDay(taskDetails.dueDate).toISOString() : undefined,
        priority: 'none',
        subtasks: []
      };
      setLists(
        lists.map((list) => {
          if (list.id === listId) {
            if(parentId) {
                return {...list, tasks: findAndAddTask(list.tasks, parentId, newTask)};
            }
            return { ...list, tasks: [newTask, ...list.tasks] };
          }
          return list;
        })
      );
      setNewTaskState({ ...newTaskState, [parentId || listId]: { text: '' } });
    }
  };

  const handleNewTaskChange = (id: string, part: Partial<NewTaskState>) => {
    setNewTaskState(prev => ({ ...prev, [id]: { ...(prev[id] || { text: '' }), ...part }}));
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
    setLists(lists.map(list => list.id === listId
        ? { ...list, tasks: findAndModifyTask(list.tasks, taskId, () => null) }
        : list
    ));
  };

  const toggleTask = (listId: string, taskId: string) => {
    setLists(lists.map(list => list.id === listId
        ? { ...list, tasks: findAndModifyTask(list.tasks, taskId, (task) => ({...task, completed: !task.completed})) }
        : list
    ));
  };
  
  const setTaskPriority = (listId: string, taskId: string, priority: Priority) => {
    setLists(lists.map(list => list.id === listId
        ? { ...list, tasks: findAndModifyTask(list.tasks, taskId, (task) => ({...task, priority})) }
        : list
    ));
  };

  const calculateProgress = (tasks: Task[]): { completed: number, total: number } => {
    let completed = 0;
    let total = 0;
    tasks.forEach(task => {
        total++;
        if(task.completed) completed++;
        const subProgress = calculateProgress(task.subtasks);
        completed += subProgress.completed;
        total += subProgress.total;
    });
    return { completed, total };
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if(type === 'LIST') {
        const reorderedLists = Array.from(lists);
        const [removed] = reorderedLists.splice(source.index, 1);
        reorderedLists.splice(destination.index, 0, removed);
        setLists(reorderedLists);
        return;
    }

    if (type.startsWith('TASK-')) {
        const listId = type.split('-')[1];
        const list = lists.find(l => l.id === listId);
        if(!list) return;

        const reorder = (tasks: Task[], startIndex: number, endIndex: number): Task[] => {
            const result = Array.from(tasks);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };

        const newTasks = reorder(list.tasks, source.index, destination.index);
        setLists(lists.map(l => l.id === listId ? {...l, tasks: newTasks} : l));
    }
  }
  
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => {
      const aProgress = calculateProgress(a.tasks);
      const bProgress = calculateProgress(b.tasks);
      const aIsComplete = aProgress.total > 0 && aProgress.completed === aProgress.total;
      const bIsComplete = bProgress.total > 0 && bProgress.completed === bProgress.total;

      if (aIsComplete && !bIsComplete) return 1;
      if (!aIsComplete && bIsComplete) return -1;
      return 0;
    });
  }, [lists]);

  const DueDateDisplay = ({ dueDate }: { dueDate?: string }) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const isOverdue = isPast(date) && startOfDay(date).getTime() !== startOfDay(new Date()).getTime();
    
    return (
      <span className={cn(
        "text-xs text-muted-foreground ml-2",
        isOverdue && "text-destructive font-semibold"
      )}>
        ({formatDistanceToNow(date, { addSuffix: true })})
      </span>
    )
  }

  const priorityColors: Record<Priority, string> = {
      none: 'text-muted-foreground',
      low: 'text-blue-500',
      medium: 'text-yellow-500',
      high: 'text-red-500',
  }

  const renderTasks = (tasks: Task[], listId: string, level = 0) => {
    return (
      <Droppable droppableId={`tasks-${listId}-${level}`} type={`TASK-${listId}-${level}`}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(snapshot.isDragging && 'shadow-lg rounded-lg bg-background', `ml-${level * 4}`)}
                  >
                    <div className="flex items-start justify-between group">
                      <div className="flex items-start gap-3 flex-1">
                        <span {...provided.dragHandleProps} className="pt-1 cursor-grab opacity-50 group-hover:opacity-100"><GripVertical className="h-4 w-4"/></span>
                        <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(listId, task.id)} className="mt-1" />
                        <div className="flex-1">
                          <label htmlFor={`task-${task.id}`} className={cn("text-sm font-medium leading-none cursor-pointer", task.completed && "line-through text-muted-foreground")}>
                            {task.text}
                            <DueDateDisplay dueDate={task.dueDate} />
                          </label>
                          {task.subtasks && task.subtasks.length > 0 && 
                            <div className="mt-2">
                                {renderTasks(task.subtasks, listId, level + 1)}
                            </div>
                          }
                          <div className={cn("flex items-center gap-2 transition-opacity duration-200", task.completed ? "opacity-0" : "opacity-0 group-hover:opacity-100")}>
                            <Input 
                                placeholder="Add sub-task..."
                                value={newTaskState[task.id]?.text || ''}
                                onChange={(e) => handleNewTaskChange(task.id, {text: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && addTask(listId, task.id)}
                                className="h-7 text-xs"
                            />
                            <Button size="sm" variant="ghost" onClick={() => addTask(listId, task.id)}><Plus className="h-3 w-3 mr-1"/>Add</Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Flag className={cn("h-4 w-4", priorityColors[task.priority])} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setTaskPriority(listId, task.id, 'none')}>None</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTaskPriority(listId, task.id, 'low')}><Flag className={cn("h-4 w-4 mr-2", priorityColors.low)}/>Low</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTaskPriority(listId, task.id, 'medium')}><Flag className={cn("h-4 w-4 mr-2", priorityColors.medium)}/>Medium</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTaskPriority(listId, task.id, 'high')}><Flag className={cn("h-4 w-4 mr-2", priorityColors.high)}/>High</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTask(listId, task.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };
  
  if (!isClient) return null; // Prevent hydration mismatch with drag and drop

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Checklist</h1>
          <p className="text-lg text-muted-foreground mt-2">Organize your tasks and get things done.</p>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a New List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="E.g., Plan a weekend camping trip..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addList()}
            />
            <Button onClick={addList} disabled={!newListName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add List
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <DragDropContext onDragEnd={onDragEnd}>
        {lists.length > 0 ? (
          <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
            {(provided) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
                >
                {sortedLists.map((list, index) => {
                    const { completed: completedTasks, total: totalTasks } = calculateProgress(list.tasks);
                    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                    const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;

                    return (
                        <Draggable key={list.id} draggableId={list.id} index={index}>
                           {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                >
                                <Card className={cn("flex flex-col transition-opacity", isAllComplete && "opacity-60", snapshot.isDragging && "shadow-2xl")}>
                                    <CardHeader className="flex flex-row items-start justify-between cursor-grab" {...provided.dragHandleProps}>
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
                                    <ScrollArea className="flex-1 h-64 -mr-4">
                                        <div className="pr-4">
                                        {list.tasks.length > 0 ? renderTasks(list.tasks, list.id) : (
                                            <p className="text-sm text-muted-foreground text-center pt-4">No tasks yet. Add one above!</p>
                                        )}
                                        </div>
                                    </ScrollArea>
                                    </CardContent>
                                </Card>
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
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                <ListChecks className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold">No Lists Yet</h3>
                <p className="text-sm">Create your first list to get started.</p>
            </div>
        )}
      </DragDropContext>
    </div>
  );
}

    