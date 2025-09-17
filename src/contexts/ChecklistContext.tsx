
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCalendar } from './CalendarContext';
import { addDays, startOfDay } from 'date-fns';
import { useProjects } from './ProjectsContext';

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type SortBy = 'manual' | 'priority' | 'dueDate' | 'createdAt';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // timestamp
  dueDate?: string; // ISO string
  priority: Priority;
  subtasks: Task[];
  isRecurring?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

export interface NewTaskState {
    text: string;
    dueDate?: Date;
    isRecurring?: boolean;
}

export interface ListState {
    filter: string;
    sortBy: SortBy;
    showCompleted: boolean;
}

export interface SharedChecklistData {
  lists: Checklist[];
  listStates: Record<string, ListState>;
}

interface ChecklistContextType {
  lists: Checklist[];
  setLists: Dispatch<SetStateAction<Checklist[]>>;
  listStates: Record<string, ListState>;
  setListStates: Dispatch<SetStateAction<Record<string, ListState>>>;
  addTask: (listId: string, taskDetails: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subtasks' | 'priority'>, parentId?: string) => void;
  addList: (list: Checklist) => void;
  removeList: (listId: string) => void;
  setListColor: (listId: string, color: string) => void;
  removeTask: (listId: string, taskId: string) => void;
  toggleTask: (listId: string, taskId: string) => void;
  setTaskRecurring: (listId: string, taskId: string, isRecurring: boolean) => void;
  setTaskPriority: (listId: string, taskId: string, priority: Priority) => void;
  findAndModifyTask: (tasks: Task[], taskId: string, modifier: (task: Task) => Task | null) => Task[];
  findAndAddTask: (tasks: Task[], parentId: string, newTask: Task) => Task[];
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useLocalStorage<Checklist[]>('checklist:listsV8', []);
  const [listStates, setListStates] = useLocalStorage<Record<string, ListState>>('checklist:listStatesV7', {});
  const { addEvent, removeEvent } = useCalendar();
  const { addTask: addProjectTask, board } = useProjects();


  const findTask = (tasks: Task[], taskId: string): Task | null => {
    for (const task of tasks) {
        if (task.id === taskId) return task;
        const found = findTask(task.subtasks, taskId);
        if (found) return found;
    }
    return null;
  }

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

  const addTask = (listId: string, taskDetails: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subtasks' | 'priority'>, parentId?: string) => {
    const newTask: Task = {
        id: Date.now().toString(),
        text: taskDetails.text.trim(),
        completed: false,
        createdAt: Date.now(),
        dueDate: taskDetails.dueDate,
        priority: 'none',
        isRecurring: taskDetails.isRecurring || false,
        subtasks: []
    };
    
    setLists(prevLists =>
      prevLists.map((list) => {
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
            time: '00:00',
            title: newTask.text,
            description: `From checklist: ${lists.find(l => l.id === listId)?.title}`,
            color: 'blue'
        });
    }
  };

  const addList = (list: Checklist) => {
    setLists(prev => [...prev, list]);
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

  const value = {
    lists,
    setLists,
    listStates,
    setListStates,
    addTask,
    addList,
    removeList,
    setListColor,
    removeTask,
    toggleTask,
    setTaskRecurring,
    setTaskPriority,
    findAndModifyTask,
    findAndAddTask
  };

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>;
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
}
