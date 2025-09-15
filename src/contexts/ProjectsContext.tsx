
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import * as pako from 'pako';
import { Base64 } from 'js-base64';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { create } from 'zustand';
import { useCalendar } from './CalendarContext';

export type Priority = 'none' | 'low' | 'medium' | 'high';

export interface TaskCard {
  id: string;
  title: string;
  description?: string;
  startDate?: string; // ISO string
  dueDate?: string; // ISO string for end date
  priority: Priority;
}

export interface Column {
  id:string;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: Record<string, TaskCard>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export const initialData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Brainstorm feature ideas', priority: 'medium' },
    'task-2': { id: 'task-2', title: 'Design the UI mockups', priority: 'high', description: 'Create mockups in Figma for all screen sizes.', startDate: new Date().toISOString(), dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
    'task-3': { id: 'task-3', title: 'Develop the Kanban components', priority: 'high' },
    'task-4': { id: 'task-4', title: 'Implement drag and drop', priority: 'medium', dueDate: new Date().toISOString() },
    'task-5': { id: 'task-5', title: 'Review and test the board', priority: 'low' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-3', 'task-4'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-5'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

export function encodeBoardData(board: BoardData): string {
  const jsonString = JSON.stringify(board);
  const compressed = pako.deflate(jsonString);
  return Base64.fromUint8Array(compressed, true);
}

export function decodeBoardData(encoded: string): BoardData | null {
  try {
    const compressed = Base64.toUint8Array(encoded);
    const jsonString = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(jsonString) as BoardData;
  } catch (error) {
    console.error("Failed to decode board data:", error);
    return null;
  }
}

interface ProjectsState {
  board: BoardData;
  setBoard: (board: BoardData | ((prev: BoardData) => BoardData)) => void;
  addTask: (columnId: string, taskDetails: Partial<TaskCard> & { title: string }) => TaskCard;
  removeTask: (taskId: string, columnId?: string) => void;
  updateTask: (updatedTask: TaskCard) => void;
  addColumn: (title: string) => void;
  removeColumn: (columnId: string) => void;
  handleDragEnd: OnDragEndResponder;
}

export const useProjects = create<ProjectsState>((set, get) => ({
  board: initialData,
  setBoard: (updater) => {
    set(state => {
        const newBoard = typeof updater === 'function' ? updater(state.board) : updater;
        return { board: newBoard };
    });
  },
  addColumn: (title) => {
    const newColumnId = `column-${Date.now()}`;
    const newColumn: Column = {
      id: newColumnId,
      title: title,
      taskIds: [],
    };
    get().setBoard(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumnId]: newColumn,
        },
        columnOrder: [...prev.columnOrder, newColumnId],
    }));
  },
  removeColumn: (columnId: string) => {
    get().setBoard(prev => {
        const newBoard = {...prev};
        const tasksToDelete = newBoard.columns[columnId].taskIds;
        // The calendar event removal will be handled in the UI component
        
        tasksToDelete.forEach(taskId => {
            delete newBoard.tasks[taskId];
        });
        
        delete newBoard.columns[columnId];
        
        newBoard.columnOrder = newBoard.columnOrder.filter(id => id !== columnId);
        return newBoard;
    });
  },
  addTask: (columnId, taskDetails) => {
    const newTaskId = taskDetails.id || `task-${Date.now()}-${Math.random()}`;
    const newTask: TaskCard = {
      priority: 'none',
      ...taskDetails,
      id: newTaskId,
    };
    
    get().setBoard(prev => {
        const column = prev.columns[columnId];
        if (!column) return prev;
        
        return {
          ...prev,
          tasks: { ...prev.tasks, [newTaskId]: newTask },
          columns: {
            ...prev.columns,
            [columnId]: {
              ...column,
              taskIds: [...column.taskIds, newTaskId],
            }
          }
        };
    });
    
    return newTask;
  },
  removeTask: (taskId, columnId) => {
      get().setBoard(prev => {
          const newTasks = { ...prev.tasks };
          delete newTasks[taskId];
          
          let newColumns = { ...prev.columns };
          if (columnId && newColumns[columnId]) {
            newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(id => id !== taskId);
          } else { // if columnId is not provided, search all columns
            Object.keys(newColumns).forEach(colId => {
              newColumns[colId].taskIds = newColumns[colId].taskIds.filter(id => id !== taskId);
            });
          }

          return { ...prev, tasks: newTasks, columns: newColumns };
      });
  },
  updateTask: (updatedTask) => {
      if(!updatedTask) return;

      get().setBoard(prev => ({
        ...prev,
        tasks: { ...prev.tasks, [updatedTask.id]: updatedTask }
      }));
  },
  handleDragEnd: (result) => {
    const { destination, source, draggableId, type } = result;
    const state = get();
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(state.board.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      get().setBoard({ ...state.board, columnOrder: newColumnOrder });
    } else {
        const startColumn = state.board.columns[source.droppableId];
        const endColumn = state.board.columns[destination.droppableId];
        
        if (startColumn === endColumn) {
          const newTaskIds = Array.from(startColumn.taskIds);
          newTaskIds.splice(source.index, 1);
          newTaskIds.splice(destination.index, 0, draggableId);
          const newColumn = { ...startColumn, taskIds: newTaskIds };
          get().setBoard({ ...state.board, columns: { ...state.board.columns, [newColumn.id]: newColumn } });
        } else {
          const startTaskIds = Array.from(startColumn.taskIds);
          startTaskIds.splice(source.index, 1);
          const newStartColumn = { ...startColumn, taskIds: startTaskIds };
    
          const endTaskIds = Array.from(endColumn.taskIds);
          endTaskIds.splice(destination.index, 0, draggableId);
          const newEndColumn = { ...endColumn, taskIds: endTaskIds };
          
          get().setBoard({ ...state.board, columns: { ...state.board.columns, [newStartColumn.id]: newStartColumn, [newEndColumn.id]: newEndColumn } });
        }
    }
  },
}));

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useLocalStorage<BoardData>('projects:boardV2', initialData);
  const setProjectsState = useProjects(state => state.setBoard);

  useEffect(() => {
    setProjectsState(board);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const unsubscribe = useProjects.subscribe(
        (state) => setBoard(state.board)
    );
    return unsubscribe;
  }, [setBoard]);

  // Sync project tasks with due dates to the calendar
  const { events, setEvents } = useCalendar();
  const { board: projectsBoard } = useProjects();
  
  useEffect(() => {
    const projectEvents = Object.values(projectsBoard.tasks)
        .filter(task => task.dueDate)
        .map(task => ({
            id: `proj-${task.id}`, // Keep a unique prefix
            date: task.dueDate!,
            time: '09:00', // Default time
            title: task.title,
            description: `Project Task: ${task.title}`,
            color: 'purple',
            type: 'Work',
            sourceId: task.id,
        }));
    
    // Combine with existing non-project events
    const otherEvents = events.filter(e => e.type !== 'Work');
    const newEvents = [...otherEvents, ...projectEvents];

    // Avoid unnecessary re-renders if the events haven't changed
    if (JSON.stringify(newEvents) !== JSON.stringify(events)) {
        setEvents(newEvents);
    }
  // We only want to run this when the projects board changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsBoard, setEvents]);


  return <>{children}</>;
}

    