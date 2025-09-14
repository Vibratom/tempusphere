
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListChecks, Calendar as CalendarIcon, Flag, GripVertical, Search, ArrowDownUp, Bell } from 'lucide-react';
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
import { format, formatDistanceToNow, isPast, startOfDay, isToday } from 'date-fns';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';


type Priority = 'none' | 'low' | 'medium' | 'high';
type SortBy = 'manual' | 'priority' | 'dueDate' | 'createdAt';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // timestamp
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

interface ListState {
    filter: string;
    sortBy: SortBy;
    showCompleted: boolean;
}

const findTask = (tasks: Task[], taskId: string): Task | null => {
    for (const task of tasks) {
        if (task.id === taskId) return task;
        const found = findTask(task.subtasks, taskId);
        if (found) return found;
    }
    return null;
}

export function ChecklistApp() {
  const [lists, setLists] = useLocalStorage<Checklist[]>('checklist:listsV4', []);
  const [newListName, setNewListName] = useState('');
  const [newTaskState, setNewTaskState] = useState<Record<string, NewTaskState>>({});
  const [listStates, setListStates] = useLocalStorage<Record<string, ListState>>('checklist:listStatesV3', {});
  const [isClient, setIsClient] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notifiedTasks, setNotifiedTasks] = useLocalStorage<string[]>('checklist:notifiedTasks', []);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
  }, []);

  // Reminder effect
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkReminders = () => {
        const today = startOfDay(new Date());
        lists.forEach(list => {
            const findTasksDueToday = (tasks: Task[]) => {
                tasks.forEach(task => {
                    if (task.dueDate && !task.completed && !notifiedTasks.includes(task.id)) {
                        const dueDate = startOfDay(new Date(task.dueDate));
                        if (isToday(dueDate)) {
                            new Notification('Task Due Today!', {
                                body: `Your task "${task.text}" from the list "${list.title}" is due today.`,
                                icon: '/logo.webp'
                            });
                            setNotifiedTasks(prev => [...prev, task.id]);
                        }
                    }
                    if (task.subtasks.length > 0) {
                        findTasksDueToday(task.subtasks);
                    }
                });
            }
            findTasksDueToday(list.tasks);
        });
        
        // Clean up old notified tasks
        const startOfYesterday = startOfDay(new Date(today.getTime() - 86400000));
        setNotifiedTasks(prev => prev.filter(taskId => {
            const task = findTask(lists.flatMap(l => l.tasks), taskId);
            if (!task || !task.dueDate) return false;
            return new Date(task.dueDate) >= startOfYesterday;
        }));
    };

    // Check once on load, then every hour
    checkReminders();
    const intervalId = setInterval(checkReminders, 1000 * 60 * 60);

    return () => clearInterval(intervalId);
  }, [lists, notificationPermission, notifiedTasks, setNotifiedTasks]);
  
  const requestNotificationPermission = () => {
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      toast({ title: 'Notification Permission', description: `Permission ${permission}.` });
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
        createdAt: Date.now(),
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
  
  const handleListStateChange = (id: string, part: Partial<ListState>) => {
      setListStates(prev => ({ ...prev, [id]: { ...(prev[id] || { filter: '', sortBy: 'manual', showCompleted: false }), ...part }}));
  }

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
    const newStates = {...listStates};
    delete newStates[listId];
    setListStates(newStates);
  };

  const removeTask = (listId: string, taskId: string) => {
    setLists(lists.map(list => list.id === listId
        ? { ...list, tasks: findAndModifyTask(list.tasks, taskId, () => null) }
        : list
    ));
  };

  const toggleTask = (listId: string, taskId: string) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        let newTasks = findAndModifyTask(list.tasks, taskId, (task) => {
          const newCompleted = !task.completed;
          const updateSubtasks = (subtasks: Task[]): Task[] => {
            return subtasks.map(st => ({ ...st, completed: newCompleted, subtasks: updateSubtasks(st.subtasks) }));
          };
          return { ...task, completed: newCompleted, subtasks: updateSubtasks(task.subtasks) };
        });
        return { ...list, tasks: newTasks };
      }
      return list;
    }));
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
    const { source, destination, draggableId } = result;
    if (!destination) return;
  
    const listId = destination.droppableId.split('-')[1];
    const list = lists.find(l => l.id === listId);
    if (!list) return;
  
    // Find the task being dragged
    const findTaskAndPath = (tasks: Task[], taskId: string, path: string[] = []): { task: Task; path: string[] } | null => {
        for (let i = 0; i < tasks.length; i++) {
            const currentTask = tasks[i];
            if (currentTask.id === taskId) return { task: currentTask, path: [...path, currentTask.id] };
            const foundInSubtasks = findTaskAndPath(currentTask.subtasks, taskId, [...path, currentTask.id]);
            if (foundInSubtasks) return foundInSubtasks;
        }
        return null;
    };

    const taskInfo = findTaskAndPath(list.tasks, draggableId);
    if (!taskInfo) return;
    const taskToMove = { ...taskInfo.task };

    // Function to remove task from its source
    const removeTaskFromTree = (tasks: Task[], taskId: string): Task[] => {
        return tasks.reduce((acc, task) => {
            if (task.id === taskId) return acc;
            acc.push({ ...task, subtasks: removeTaskFromTree(task.subtasks, taskId) });
            return acc;
        }, [] as Task[]);
    };

    let newTasks = removeTaskFromTree(list.tasks, draggableId);

    // Function to add task to its destination
    const addTaskToTree = (tasks: Task[], parentId: string, taskToAdd: Task, index: number): Task[] => {
        if (parentId === '0') {
            tasks.splice(index, 0, taskToAdd);
            return tasks;
        }
        return tasks.map(task => {
            if (task.id === parentId) {
                task.subtasks.splice(index, 0, taskToAdd);
            } else {
                task.subtasks = addTaskToTree(task.subtasks, parentId, taskToAdd, index);
            }
            return task;
        });
    };

    const destParentId = destination.droppableId.split('-')[2];
    newTasks = addTaskToTree(newTasks, destParentId, taskToMove, destination.index);

    setLists(lists.map(l => l.id === listId ? { ...l, tasks: newTasks } : l));
    handleListStateChange(listId, { sortBy: 'manual' });
  };
  
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => {
        return parseInt(a.id, 10) - parseInt(b.id, 10);
    });
  }, [lists]);

  const DueDateDisplay = ({ dueDate }: { dueDate?: string }) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const dateStartOfDay = startOfDay(date);
    const todayStartOfDay = startOfDay(new Date());
    const isOverdue = isPast(date) && dateStartOfDay.getTime() !== todayStartOfDay.getTime();
    
    return (
      <span className={cn(
        "text-xs text-muted-foreground ml-2",
        isOverdue && "text-destructive font-semibold"
      )}>
        ({formatDistanceToNow(date, { addSuffix: true })})
      </span>
    )
  }

  const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1, none: 0 };
  const priorityColors: Record<Priority, string> = {
      none: 'text-muted-foreground',
      low: 'text-blue-500',
      medium: 'text-yellow-500',
      high: 'text-red-500',
  }

  const getFilteredAndSortedTasks = (tasks: Task[], listId: string): Task[] => {
    const state = listStates[listId] || { filter: '', sortBy: 'manual', showCompleted: false };
    
    // Recursive sort function
    const sortTasks = (tasksToSort: Task[]): Task[] => {
        let sorted = [...tasksToSort];
        switch (state.sortBy) {
            case 'priority':
                sorted.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                });
                break;
            case 'createdAt':
                sorted.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'manual':
            default:
                break; // Keep manual order
        }
        return sorted.map(task => ({ ...task, subtasks: sortTasks(task.subtasks) }));
    };

    let processedTasks = state.sortBy === 'manual' ? tasks : sortTasks(tasks);

    // Recursive filter function
    const filterTasks = (tasksToFilter: Task[], isTopLevel = true): Task[] => {
        return tasksToFilter.reduce((acc, task) => {
            const subtasks = filterTasks(task.subtasks, false);
            
            const matchesFilter = !state.filter || task.text.toLowerCase().includes(state.filter.toLowerCase());
            const hasVisibleSubtask = subtasks.length > 0;
            const isVisible = !task.completed || state.showCompleted;

            if ((matchesFilter || hasVisibleSubtask) && (isTopLevel ? isVisible : true)) {
                acc.push({
                    ...task,
                    subtasks,
                });
            }
            return acc;
        }, [] as Task[]);
    };

    return filterTasks(processedTasks);
  }

  const renderTasks = (tasks: Task[], listId: string, parentId: string) => {
    const listState = listStates[listId] || { filter: '', sortBy: 'manual', showCompleted: false };
    const isDragDisabled = listState.sortBy !== 'manual';
    const droppableId = `tasks-${listId}-${parentId}`;

    return (
      <Droppable droppableId={droppableId} type={`TASK`} isDropDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={cn("space-y-3", snapshot.isDraggingOver && 'bg-muted/50 rounded-md')}>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn('group/task animation-fade-in', snapshot.isDragging && 'shadow-lg rounded-lg bg-background p-2')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {!isDragDisabled && <span {...provided.dragHandleProps} className="pt-1 cursor-grab opacity-30 group-hover/task:opacity-100 transition-opacity"><GripVertical className="h-4 w-4"/></span>}
                        <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(listId, task.id)} className="mt-1" />
                        <div className="flex-1 space-y-1">
                          <label htmlFor={`task-${task.id}`} className={cn("text-sm font-medium leading-none cursor-pointer", task.completed && "line-through text-muted-foreground")}>
                            {task.text}
                            <DueDateDisplay dueDate={task.dueDate} />
                          </label>
                           {task.subtasks && task.subtasks.length > 0 && 
                            <div className="pt-2 pl-4">
                                {renderTasks(task.subtasks, listId, task.id)}
                            </div>
                          }
                          <div className={cn("flex items-center gap-2 transition-opacity duration-200", task.completed ? "opacity-0 h-0" : "opacity-0 group-hover/task:opacity-100")}>
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
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
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

       {notificationPermission !== 'granted' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 mb-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-yellow-800 dark:text-yellow-200" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">Enable notifications to get reminders for tasks that are due today.</p>
                </div>
                <Button size="sm" onClick={requestNotificationPermission}>Enable</Button>
            </div>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {sortedLists.map((list) => {
                const { completed: completedTasks, total: totalTasks } = calculateProgress(list.tasks);
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;
                const listState = listStates[list.id] || { filter: '', sortBy: 'manual', showCompleted: false };
                const finalTasks = getFilteredAndSortedTasks(list.tasks, list.id);

                return (
                    <Card key={list.id} className={cn("flex flex-col transition-opacity", isAllComplete && listState.showCompleted && "opacity-60")}>
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

                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Filter tasks..."
                                    value={listState.filter}
                                    onChange={(e) => handleListStateChange(list.id, { filter: e.target.value })}
                                    className="pl-8"
                                />
                            </div>
                            <div className="flex w-full sm:w-auto items-center justify-between gap-2">
                                <div className="flex items-center space-x-2">
                                    <Switch id={`show-completed-${list.id}`} checked={listState.showCompleted} onCheckedChange={(val) => handleListStateChange(list.id, { showCompleted: val })}/>
                                    <Label htmlFor={`show-completed-${list.id}`} className="text-sm">Show Done</Label>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <ArrowDownUp className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={listState.sortBy} onValueChange={(val) => handleListStateChange(list.id, { sortBy: val as SortBy })}>
                                            <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="dueDate">Due Date</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="createdAt">Creation Date</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        
                        <Separator />

                        <ScrollArea className="flex-1 h-64 -mr-4">
                            <div className="pr-4">
                            {finalTasks.length > 0 ? renderTasks(finalTasks, list.id, '0') : (
                                <p className="text-sm text-muted-foreground text-center pt-4">
                                    {list.tasks.length > 0 ? "No tasks match your filter." : "No tasks yet. Add one above!"}
                                </p>
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
      </DragDropContext>
    </div>
  );
}

    