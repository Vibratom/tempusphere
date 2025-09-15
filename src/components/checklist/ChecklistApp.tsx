
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListChecks, Calendar as CalendarIcon, Flag, GripVertical, Search, ArrowDownUp, Bell, Repeat, Palette, MoreVertical, Upload, Download, Star, Sparkles, CheckCircle2, FileText, Share2, AlertCircle, Landmark, BrainCircuit, DraftingCompass, KanbanSquare, Table, UtensilsCrossed } from 'lucide-react';
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
import { format, formatDistanceToNow, isPast, startOfDay, isToday, addDays, parseISO } from 'date-fns';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCalendar } from '@/contexts/CalendarContext';
import { PlatformLink } from '../tempusphere/PlatformLink';


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
  isRecurring?: boolean;
}

const listColors = [
    { name: 'Default', value: 'hsl(var(--border))' },
    { name: 'Blue', value: 'hsl(210, 80%, 60%)' },
    { name: 'Green', value: 'hsl(140, 60%, 50%)' },
    { name: 'Yellow', value: 'hsl(48, 90%, 50%)' },
    { name: 'Orange', value: 'hsl(25, 90%, 55%)' },
    { name: 'Red', value: 'hsl(0, 80%, 60%)' },
    { name: 'Purple', value: 'hsl(270, 70%, 65%)' },
    { name: 'Pink', value: 'hsl(330, 80%, 60%)' },
];

interface Checklist {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

interface NewTaskState {
    text: string;
    dueDate?: Date;
    isRecurring?: boolean;
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

const featureList = [
    { icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, title: 'Full Task Management', description: 'Create, edit, delete, and complete tasks with ease.' },
    { icon: <ListChecks className="h-5 w-5 text-blue-500" />, title: 'Sub-task Hierarchy', description: 'Break down complex tasks into smaller, manageable sub-tasks.' },
    { icon: <GripVertical className="h-5 w-5 text-gray-500" />, title: 'Drag & Drop Reordering', description: 'Manually organize your tasks and sub-tasks exactly how you want them.' },
    { icon: <ArrowDownUp className="h-5 w-5 text-purple-500" />, title: 'Advanced Sorting', description: 'Sort tasks by priority, due date, or creation date to focus on what matters most.' },
    { icon: <Flag className="h-5 w-5 text-red-500" />, title: 'Task Priorities', description: 'Assign priorities (High, Medium, Low) to highlight important tasks.' },
    { icon: <Repeat className="h-5 w-5 text-teal-500" />, title: 'Recurring Tasks', description: 'Set up daily recurring tasks for your habits and routines.' },
    { icon: <Bell className="h-5 w-5 text-yellow-500" />, title: 'Task Reminders', description: 'Get browser notifications for tasks that are due today.' },
    { icon: <CalendarIcon className="h-5 w-5 text-indigo-500" />, title: 'Calendar Integration', description: 'Tasks with a due date automatically appear in your main Tempusphere calendar.' },
    { icon: <Palette className="h-5 w-5 text-pink-500" />, title: 'Custom List Themes', description: 'Personalize each checklist with a unique color theme for better organization.' },
    { icon: <FileText className="h-5 w-5 text-orange-500" />, title: 'Human-Readable Export/Import', description: 'Backup and restore your data using a simple, editable .txt file format.' },
];

const otherPlatforms = [
    { name: 'Momentum', category: 'Finance', icon: Landmark, href: '#', color: 'bg-indigo-500 hover:bg-indigo-600', description: 'Track expenses and manage budgets with ease.' },
    { name: 'EchoLearn', category: 'Education', icon: BrainCircuit, href: '#', color: 'bg-amber-500 hover:bg-amber-600', description: 'Create and share interactive learning modules.' },
    { name: 'Canvas', category: 'Whiteboard', icon: DraftingCompass, href: '#', color: 'bg-sky-500 hover:bg-sky-600', description: 'Collaborate visually with a digital whiteboard.' },
    { name: 'Scribe', category: 'Notes', icon: FileText, href: '#', color: 'bg-gray-500 hover:bg-gray-600', description: 'A clean space for your thoughts and documents.' },
    { name: 'Gridify', category: 'Spreadsheets', icon: Table, href: '#', color: 'bg-emerald-500 hover:bg-emerald-600', description: 'Organize and analyze data in spreadsheets.' },
    { name: 'Epicure', category: 'Recipes', icon: UtensilsCrossed, href: '#', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'Organize recipes and plan your meals.' },
    { name: 'NexusFlow', category: 'Projects', icon: KanbanSquare, href: '/nexusflow', color: 'bg-rose-500 hover:bg-rose-600', description: 'Manage projects with Kanban-style boards.' },
    { name: 'Checklist', category: 'To-Do List', icon: ListChecks, href: '/checklist', color: 'bg-blue-500 hover:bg-blue-600', description: 'Simple checklists for daily tasks and goals.' },
]

export function ChecklistApp() {
  const [lists, setLists] = useLocalStorage<Checklist[]>('checklist:listsV7', []);
  const [newListName, setNewListName] = useState('');
  const [newTaskState, setNewTaskState] = useState<Record<string, NewTaskState>>({});
  const [listStates, setListStates] = useLocalStorage<Record<string, ListState>>('checklist:listStatesV6', {});
  const [isClient, setIsClient] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notifiedTasks, setNotifiedTasks] = useLocalStorage<string[]>('checklist:notifiedTasks', []);
  const { toast } = useToast();
  const { addEvent, removeEvent, setEvents: setCalendarEvents } = useCalendar();
  const importFileRef = useRef<HTMLInputElement>(null);


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
        isRecurring: taskDetails.isRecurring || false,
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
      if (newTask.dueDate) {
          addEvent({
              id: newTask.id,
              date: newTask.dueDate,
              time: '00:00', // Default time, could be improved
              title: newTask.text,
              description: `From checklist: ${lists.find(l => l.id === listId)?.title}`,
              color: 'blue'
          });
      }
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
        color: 'hsl(var(--border))'
      };
      setLists([...lists, newList]);
      setNewListName('');
    }
  };

  const removeList = (listId: string) => {
    const listToRemove = lists.find(list => list.id === listId);
    if (listToRemove) {
        const tasksToRemove = (tasks: Task[]) => {
            tasks.forEach(task => {
                if (task.dueDate) removeEvent(task.id);
                if (task.subtasks) tasksToRemove(task.subtasks);
            })
        }
        tasksToRemove(listToRemove.tasks);
    }
    setLists(lists.filter((list) => list.id !== listId));
    const newStates = {...listStates};
    delete newStates[listId];
    setListStates(newStates);
  };

  const setListColor = (listId: string, color: string) => {
    setLists(lists.map(list => list.id === listId ? { ...list, color } : list));
  }

  const removeTask = (listId: string, taskId: string) => {
    const taskToRemove = findTask(lists.flatMap(l => l.tasks), taskId);
    if(taskToRemove && taskToRemove.dueDate) {
        removeEvent(taskId);
    }
    setLists(lists.map(list => list.id === listId
        ? { ...list, tasks: findAndModifyTask(list.tasks, taskId, () => null) }
        : list
    ));
  };

  const toggleTask = (listId: string, taskId: string) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        let newTasks = findAndModifyTask(list.tasks, taskId, (task) => {
          if (task.isRecurring) {
            return {
              ...task,
              dueDate: task.dueDate ? startOfDay(addDays(new Date(task.dueDate), 1)).toISOString() : undefined,
              completed: false, // It never stays completed
            };
          }
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

  const setTaskRecurring = (listId: string, taskId: string, isRecurring: boolean) => {
    setLists(lists.map(list => list.id === listId
        ? { ...list, tasks: findAndModifyTask(list.tasks, taskId, (task) => ({...task, isRecurring})) }
        : list
    ));
  }
  
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
        if(task.isRecurring) return;
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

    const removeTaskFromTree = (tasks: Task[], taskId: string): Task[] => {
        return tasks.reduce((acc, task) => {
            if (task.id === taskId) return acc;
            acc.push({ ...task, subtasks: removeTaskFromTree(task.subtasks, taskId) });
            return acc;
        }, [] as Task[]);
    };

    let newTasks = removeTaskFromTree(list.tasks, draggableId);

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
        const aProgress = calculateProgress(a.tasks);
        const bProgress = calculateProgress(b.tasks);
        const aIsDone = aProgress.total > 0 && aProgress.completed === aProgress.total;
        const bIsDone = bProgress.total > 0 && bProgress.completed === b.total;
        if (aIsDone && !bIsDone) return 1;
        if (!aIsDone && bIsDone) return -1;
        return parseInt(a.id, 10) - parseInt(b.id, 10);
    });
  }, [lists]);

  const DueDateDisplay = ({ dueDate }: { dueDate?: string }) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const dateStartOfDay = startOfDay(date);
    const todayStartOfDay = startOfDay(new Date());
    const isOverdue = isPast(date) && !isToday(date);
    
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
                break;
        }
        return sorted.map(task => ({ ...task, subtasks: sortTasks(task.subtasks) }));
    };

    let processedTasks = state.sortBy === 'manual' ? tasks : sortTasks(tasks);

    const filterTasks = (tasksToFilter: Task[]): Task[] => {
        return tasksToFilter.reduce((acc, task) => {
            const subtasks = filterTasks(task.subtasks);
            const matchesFilter = !state.filter || task.text.toLowerCase().includes(state.filter.toLowerCase());
            const hasVisibleSubtask = subtasks.length > 0;
            
            let isVisible = !task.completed || state.showCompleted;
            if (task.isRecurring) isVisible = true;

            if (isVisible && (matchesFilter || hasVisibleSubtask)) {
                acc.push({ ...task, subtasks });
            }
            return acc;
        }, [] as Task[]);
    };

    return filterTasks(processedTasks);
  }

  const exportToString = (): string => {
    const taskToString = (task: Task, indent: string): string => {
      let parts = [];
      parts.push(`${indent}- [${task.completed && !task.isRecurring ? 'x' : ' '}] ${task.text}`);
      
      const details = [];
      if (task.priority !== 'none') {
        details.push(`Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`);
      }
      if (task.dueDate) {
        details.push(`Due: ${format(parseISO(task.dueDate), 'yyyy-MM-dd')}`);
      }
      if (task.isRecurring) {
        details.push('Recurring');
      }
      
      if (details.length > 0) {
        parts.push(`(${details.join(') (')})`);
      }
      
      let str = parts.join(' ');
      
      if (task.subtasks && task.subtasks.length > 0) {
        str += '\n' + task.subtasks.map(st => taskToString(st, indent + '  ')).join('\n');
      }
      return str;
    };
  
    return lists.map(list => {
      let title = `# ${list.title}`;
      if (list.color && list.color !== 'hsl(var(--border))') {
        title += ` (Theme: ${list.color})`;
      }
      const tasksStr = list.tasks.map(task => taskToString(task, '')).join('\n');
      return `${title}\n${tasksStr}`;
    }).join('\n---\n');
  };
  
  const handleExport = () => {
    const textData = exportToString();
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tempusphere_checklist_backup.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data Exported', description: 'Your checklists have been saved as a .txt file.' });
  };
  
  const parseFromString = (text: string): { lists: Checklist[], listStates: Record<string, ListState> } => {
    const newLists: Checklist[] = [];
    const newListStates: Record<string, ListState> = {};
  
    const listChunks = text.split('\n---\n');
  
    listChunks.forEach(chunk => {
      const lines = chunk.trim().split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) return;
  
      const titleLine = lines[0];
      const titleMatch = titleLine.match(/^#\s*(.*?)(?:\s\(Theme:\s(.*?)\))?$/);
      if (!titleMatch) return;
  
      const listId = Date.now().toString() + Math.random();
      const newList: Checklist = {
        id: listId,
        title: titleMatch[1],
        color: titleMatch[2] || 'hsl(var(--border))',
        tasks: [],
      };
      
      newListStates[listId] = { filter: '', sortBy: 'manual', showCompleted: false };
  
      const parseTasks = (taskLines: string[], level = 0): [Task[], number] => {
        const tasks: Task[] = [];
        let i = 0;
        while (i < taskLines.length) {
          const line = taskLines[i];
          const indent = (line.match(/^\s*/) || [''])[0].length;
          const currentLevel = indent / 2;
  
          if (currentLevel < level) {
            break; // End of sub-tasks for this level
          }
          
          if (currentLevel === level) {
            const taskMatch = line.match(/^\s*-\s*\[( |x)\]\s*(.*?)(?:\s*\((.*?)\))?$/);
            if (taskMatch) {
              const completed = taskMatch[1] === 'x';
              let text = taskMatch[2].trim();
              const details = taskMatch[3] || '';
              
              let priority: Priority = 'none';
              let dueDate: string | undefined = undefined;
              let isRecurring = false;
              
              const detailParts = details.split(') (');
              detailParts.forEach(part => {
                if (part.startsWith('Priority: ')) {
                  priority = part.replace('Priority: ', '').toLowerCase() as Priority;
                } else if (part.startsWith('Due: ')) {
                  try {
                    dueDate = startOfDay(new Date(part.replace('Due: ', ''))).toISOString();
                  } catch (e) { /* ignore invalid date */ }
                } else if (part === 'Recurring') {
                  isRecurring = true;
                }
              });

              const subTaskLines: string[] = [];
              let j = i + 1;
              while(j < taskLines.length && (taskLines[j].match(/^\s*/) || [''])[0].length / 2 > level) {
                subTaskLines.push(taskLines[j]);
                j++;
              }
              const [subtasks, consumed] = parseTasks(subTaskLines, level + 1);
              
              tasks.push({
                id: Date.now().toString() + Math.random(),
                text,
                completed: completed && !isRecurring,
                createdAt: Date.now(),
                priority,
                dueDate,
                isRecurring,
                subtasks,
              });

              i += 1 + consumed;
            } else {
              i++;
            }
          } else {
            i++;
          }
        }
        return [tasks, i];
      };
      
      const [tasks] = parseTasks(lines.slice(1));
      newList.tasks = tasks;
      newLists.push(newList);
    });
  
    return { lists: newLists, listStates: newListStates };
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if(typeof text !== 'string') throw new Error("Invalid file content");
            
            const { lists: importedLists, listStates: importedListStates } = parseFromString(text);

            if (importedLists.length > 0) {
                setLists(importedLists);
                setListStates(importedListStates);
                
                setCalendarEvents([]);
                const allTasks = importedLists.flatMap(l => {
                    const gatherTasks = (tasks: Task[]): Task[] => tasks.flatMap(t => [t, ...gatherTasks(t.subtasks)]);
                    return gatherTasks(l.tasks);
                });
                
                const tasksWithDueDate = allTasks.filter(t => t.dueDate);
                tasksWithDueDate.forEach(task => {
                    addEvent({
                        id: task.id,
                        date: task.dueDate!,
                        time: '00:00',
                        title: task.text,
                        description: `From checklist`,
                        color: 'blue'
                    });
                })

                toast({ title: 'Import Successful', description: 'Your checklist data has been restored from the .txt file.' });
            } else {
                throw new Error("Could not parse the backup file. Ensure it is a valid .txt backup.");
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Import Failed', description: (error as Error).message });
        }
    };
    reader.readAsText(file);
    if(importFileRef.current) importFileRef.current.value = ""; // Reset file input
  };
  
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
                          <label htmlFor={`task-${task.id}`} className={cn("text-sm font-medium leading-none cursor-pointer", task.completed && !task.isRecurring && "line-through text-muted-foreground")}>
                            {task.text}
                            <DueDateDisplay dueDate={task.dueDate} />
                          </label>
                           {task.subtasks && task.subtasks.length > 0 && 
                            <div className="pt-2 pl-4">
                                {renderTasks(task.subtasks, listId, task.id)}
                            </div>
                          }
                          <div className={cn("flex items-center gap-2 transition-opacity duration-200 h-0 opacity-0 group-hover/task:h-auto group-hover/task:opacity-100", (task.completed && !task.isRecurring) ? "!opacity-0 !h-0" : "")}>
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
                        {task.isRecurring && <Repeat className="h-4 w-4 text-primary mr-1"/>}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Flag className={cn("h-4 w-4", priorityColors[task.priority])} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked={task.isRecurring} onCheckedChange={(checked) => setTaskRecurring(listId, task.id, checked)}>
                                    Daily Recurring
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={task.priority} onValueChange={(p) => setTaskPriority(listId, task.id, p as Priority)}>
                                    <DropdownMenuRadioItem value='none'>None</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value='low'><Flag className={cn("h-4 w-4 mr-2", priorityColors.low)}/>Low</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value='medium'><Flag className={cn("h-4 w-4 mr-2", priorityColors.medium)}/>Medium</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value='high'><Flag className={cn("h-4 w-4 mr-2", priorityColors.high)}/>High</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
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
  
  if (!isClient) return null;

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
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
         <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
                <Button variant="outline" onClick={handleExport} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Upload className="mr-2 h-4 w-4" /> Import Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Import Checklist Data</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will overwrite all your current checklists and their settings. This action cannot be undone. Please ensure you have a backup if needed.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => importFileRef.current?.click()}>
                            Confirm and Import
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <input type="file" ref={importFileRef} onChange={handleImport} accept=".txt" className="hidden" />
            </CardContent>
        </Card>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {sortedLists.map((list) => {
                const { completed: completedTasks, total: totalTasks } = calculateProgress(list.tasks);
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;
                const listState = listStates[list.id] || { filter: '', sortBy: 'manual', showCompleted: false };
                const finalTasks = getFilteredAndSortedTasks(list.tasks, list.id);
                const currentColor = list.color || 'hsl(var(--border))';

                return (
                    <Card key={list.id} className={cn("flex flex-col transition-opacity border-2", isAllComplete && listState.showCompleted && "opacity-60")} style={{ borderColor: currentColor }}>
                        <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>{list.title}</CardTitle>
                            {totalTasks > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">
                                {completedTasks} / {totalTasks} completed
                                </p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>List Options</DropdownMenuLabel>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Palette className="mr-2 h-4 w-4" />
                                        <span>Theme Color</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={currentColor} onValueChange={(color) => setListColor(list.id, color)}>
                                            {listColors.map(color => (
                                                <DropdownMenuRadioItem key={color.name} value={color.value}>
                                                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.value }}></div>
                                                    {color.name}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete List
                                        </DropdownMenuItem>
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </CardHeader>
                        {totalTasks > 0 && 
                        <div className="px-6 pb-2">
                            <Progress value={progress} style={{
                                // @ts-ignore
                                '--primary': currentColor
                            }}/>
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
                                    <Button variant="outline" size="icon" className={cn((newTaskState[list.id]?.dueDate || newTaskState[list.id]?.isRecurring) && 'text-primary')}>
                                        <CalendarIcon className="h-4 w-4"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={newTaskState[list.id]?.dueDate}
                                        onSelect={(date) => handleNewTaskChange(list.id, { dueDate: date })}
                                        initialFocus
                                    />
                                    <div className="p-4 border-t border-border">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`recurring-${list.id}`} 
                                                checked={newTaskState[list.id]?.isRecurring} 
                                                onCheckedChange={(checked) => handleNewTaskChange(list.id, { isRecurring: checked as boolean })}
                                            />
                                            <label htmlFor={`recurring-${list.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Daily Recurring
                                            </label>
                                        </div>
                                    </div>
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
      
       <Card className="mt-12">
            <CardHeader>
                <CardTitle>Other Tools</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="max-w-3xl text-lg text-muted-foreground mb-8">
                    Tempusphere is part of a growing ecosystem of powerful utilities to help with daily tasks.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {otherPlatforms.map(p => <PlatformLink key={p.name} {...p} />)}
                </div>
            </CardContent>
        </Card>

       <Card className="mt-12">
            <CardHeader>
                <CardTitle>Features Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {featureList.map((feature, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                            <div>
                                <h4 className="font-semibold">{feature.title}</h4>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
