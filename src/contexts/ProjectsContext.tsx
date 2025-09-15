
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import * as pako from 'pako';
import { Base64 } from 'js-base64';
import { OnDragEndResponder } from '@hello-pangea/dnd';

export type Priority = 'none' | 'low' | 'medium' | 'high';

export interface TaskCard {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority: Priority;
}

export interface Column {
  id: string;
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
    'task-2': { id: 'task-2', title: 'Design the UI mockups', priority: 'high', description: 'Create mockups in Figma for all screen sizes.' },
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

interface ProjectsContextType {
  board: BoardData;
  setBoard: Dispatch<SetStateAction<BoardData>>;
  addTask: (columnId: string, taskDetails: Partial<TaskCard> & { title: string }) => void;
  removeTask: (taskId: string, columnId: string) => void;
  updateTask: (updatedTask: TaskCard) => void;
  addColumn: (title: string) => void;
  handleDragEnd: OnDragEndResponder;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useLocalStorage<BoardData>('projects:boardV1', initialData);

  const addColumn = (title: string) => {
    const newColumnId = `column-${Date.now()}`;
    const newColumn: Column = {
      id: newColumnId,
      title: title,
      taskIds: [],
    };

    setBoard(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...prev.columnOrder, newColumnId],
    }));
  };

  const addTask = (columnId: string, taskDetails: Partial<TaskCard> & { title: string }) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: TaskCard = {
      id: newTaskId,
      priority: 'none',
      ...taskDetails,
    };

    setBoard(prev => {
      const column = prev.columns[columnId];
      if (!column) return prev;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTaskId]: newTask,
        },
        columns: {
          ...prev.columns,
          [columnId]: {
            ...column,
            taskIds: [...column.taskIds, newTaskId],
          }
        }
      }
    });
  }

  const removeTask = (taskId: string, columnId: string) => {
    setBoard(prev => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];
      
      const column = prev.columns[columnId];
      const newTaskIds = column.taskIds.filter(id => id !== taskId);

      return {
        ...prev,
        tasks: newTasks,
        columns: {
          ...prev.columns,
          [columnId]: {
            ...column,
            taskIds: newTaskIds,
          }
        }
      }
    })
  }

  const updateTask = (updatedTask: TaskCard) => {
    if(!updatedTask) return;
    setBoard(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [updatedTask.id]: updatedTask
      }
    }))
  }
  
  const handleDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    setBoard(prev => {
        // Reordering columns
        if (type === 'COLUMN') {
          const newColumnOrder = Array.from(prev.columnOrder);
          newColumnOrder.splice(source.index, 1);
          newColumnOrder.splice(destination.index, 0, draggableId);

          return {
            ...prev,
            columnOrder: newColumnOrder,
          };
        }

        // Reordering tasks
        const startColumn = prev.columns[source.droppableId];
        const endColumn = prev.columns[destination.droppableId];

        if (startColumn === endColumn) {
          // Reordering within the same column
          const newTaskIds = Array.from(startColumn.taskIds);
          newTaskIds.splice(source.index, 1);
          newTaskIds.splice(destination.index, 0, draggableId);

          const newColumn = {
            ...startColumn,
            taskIds: newTaskIds,
          };

          return {
            ...prev,
            columns: {
              ...prev.columns,
              [newColumn.id]: newColumn,
            }
          };
        } else {
          // Moving from one column to another
          const startTaskIds = Array.from(startColumn.taskIds);
          startTaskIds.splice(source.index, 1);
          const newStartColumn = {
            ...startColumn,
            taskIds: startTaskIds,
          };

          const endTaskIds = Array.from(endColumn.taskIds);
          endTaskIds.splice(destination.index, 0, draggableId);
          const newEndColumn = {
            ...endColumn,
            taskIds: endTaskIds,
          };
          
          return {
            ...prev,
            columns: {
              ...prev.columns,
              [newStartColumn.id]: newStartColumn,
              [newEndColumn.id]: newEndColumn,
            }
          };
        }
    });
  };

  const value = {
    board,
    setBoard,
    addTask,
    removeTask,
    updateTask,
    addColumn,
    handleDragEnd
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
