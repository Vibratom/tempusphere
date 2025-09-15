
'use client';

import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import * as pako from 'pako';
import { Base64 } from 'js-base64';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { create } from 'zustand';
import Peer, { Instance as PeerInstance } from 'simple-peer';

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

// Export peerRef to be accessible by both the component and the store
export const peerRef: React.MutableRefObject<PeerInstance | undefined> = { current: undefined };

interface ProjectsState {
  board: BoardData;
  setBoard: (board: BoardData | ((prev: BoardData) => BoardData), fromPeer?: boolean) => void;
  addTask: (columnId: string, taskDetails: Partial<TaskCard> & { title: string }) => void;
  removeTask: (taskId: string, columnId: string) => void;
  updateTask: (updatedTask: TaskCard) => void;
  addColumn: (title: string) => void;
  removeColumn: (columnId: string) => void;
  handleDragEnd: OnDragEndResponder;
}

const broadcast = (board: BoardData) => {
    if (peerRef.current && peerRef.current.connected) {
        peerRef.current.send(JSON.stringify(board));
    }
}

export const useProjects = create<ProjectsState>((set, get) => ({
  board: initialData,
  setBoard: (updater, fromPeer = false) => {
    set(state => {
        const newBoard = typeof updater === 'function' ? updater(state.board) : updater;
        if (!fromPeer) {
          broadcast(newBoard);
        }
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
    const newBoard: BoardData = {
        ...get().board,
        columns: {
          ...get().board.columns,
          [newColumnId]: newColumn,
        },
        columnOrder: [...get().board.columnOrder, newColumnId],
    };
    set({ board: newBoard });
    broadcast(newBoard);
  },
  removeColumn: (columnId: string) => {
    const newBoard = {...get().board};
    const tasksToDelete = newBoard.columns[columnId].taskIds;
    
    tasksToDelete.forEach(taskId => {
        delete newBoard.tasks[taskId];
    });
    
    delete newBoard.columns[columnId];
    
    newBoard.columnOrder = newBoard.columnOrder.filter(id => id !== columnId);
    
    set({ board: newBoard });
    broadcast(newBoard);
  },
  addTask: (columnId, taskDetails) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: TaskCard = {
      id: newTaskId,
      priority: 'none',
      ...taskDetails,
    };
    const column = get().board.columns[columnId];
    if (!column) return;

    const newBoard: BoardData = {
      ...get().board,
      tasks: { ...get().board.tasks, [newTaskId]: newTask },
      columns: {
        ...get().board.columns,
        [columnId]: {
          ...column,
          taskIds: [...column.taskIds, newTaskId],
        }
      }
    };
    set({ board: newBoard });
    broadcast(newBoard);
  },
  removeTask: (taskId, columnId) => {
      const newTasks = { ...get().board.tasks };
      delete newTasks[taskId];
      
      const column = get().board.columns[columnId];
      if (!column) return;

      const newTaskIds = column.taskIds.filter(id => id !== taskId);

      const newBoard: BoardData = {
        ...get().board,
        tasks: newTasks,
        columns: {
          ...get().board.columns,
          [columnId]: { ...column, taskIds: newTaskIds }
        }
      };
      set({ board: newBoard });
      broadcast(newBoard);
  },
  updateTask: (updatedTask) => {
      if(!updatedTask) return;
      const newBoard: BoardData = {
        ...get().board,
        tasks: { ...get().board.tasks, [updatedTask.id]: updatedTask }
      };
      set({ board: newBoard });
      broadcast(newBoard);
  },
  handleDragEnd: (result) => {
    const { destination, source, draggableId, type } = result;
    const state = get();
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    let newBoard: BoardData;
    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(state.board.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      newBoard = { ...state.board, columnOrder: newColumnOrder };
    } else {
        const startColumn = state.board.columns[source.droppableId];
        const endColumn = state.board.columns[destination.droppableId];
        
        if (startColumn === endColumn) {
          const newTaskIds = Array.from(startColumn.taskIds);
          newTaskIds.splice(source.index, 1);
          newTaskIds.splice(destination.index, 0, draggableId);
          const newColumn = { ...startColumn, taskIds: newTaskIds };
          newBoard = { ...state.board, columns: { ...state.board.columns, [newColumn.id]: newColumn } };
        } else {
          const startTaskIds = Array.from(startColumn.taskIds);
          startTaskIds.splice(source.index, 1);
          const newStartColumn = { ...startColumn, taskIds: startTaskIds };
    
          const endTaskIds = Array.from(endColumn.taskIds);
          endTaskIds.splice(destination.index, 0, draggableId);
          const newEndColumn = { ...endColumn, taskIds: endTaskIds };
          
          newBoard = { ...state.board, columns: { ...state.board.columns, [newStartColumn.id]: newStartColumn, [newEndColumn.id]: newEndColumn } };
        }
    }
    set({ board: newBoard });
    broadcast(newBoard);
  },
}));

// This provider component is now simpler. It ensures the hook is initialized from localStorage.
export function ProjectsProvider({ children }: { children: ReactNode }) {
    const [board, setBoard] = useLocalStorage<BoardData>('projects:boardV2', initialData);
    const setProjectsState = useProjects.setState;

    React.useEffect(() => {
        setProjectsState({ board });
    }, [board, setProjectsState]);
    
    // Subscribe to Zustand store changes and update localStorage
    React.useEffect(() => {
        const unsubscribe = useProjects.subscribe(
            (state) => setBoard(state.board)
        );
        return unsubscribe;
    }, [setBoard]);


  return <>{children}</>;
}
