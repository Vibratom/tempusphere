'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface TaskCard {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: Record<string, TaskCard>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const initialData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Brainstorm feature ideas' },
    'task-2': { id: 'task-2', title: 'Design the UI mockups' },
    'task-3': { id: 'task-3', title: 'Develop the Kanban components' },
    'task-4': { id: 'task-4', title: 'Implement drag and drop' },
    'task-5': { id: 'task-5', title: 'Review and test the board' },
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


export function NexusFlowApp() {
  const [board, setBoard] = useLocalStorage<BoardData>('nexusflow:boardV1', initialData);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});

  const handleNewTaskTitleChange = (columnId: string, title: string) => {
    setNewTaskTitles(prev => ({...prev, [columnId]: title}));
  }

  const addColumn = () => {
    if(!newColumnName.trim()) return;

    const newColumnId = `column-${Date.now()}`;
    const newColumn: Column = {
      id: newColumnId,
      title: newColumnName.trim(),
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
    setNewColumnName('');
  };

  const addTask = (columnId: string) => {
    const title = newTaskTitles[columnId]?.trim();
    if(!title) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask: TaskCard = {
      id: newTaskId,
      title,
    };

    setBoard(prev => {
      const column = prev.columns[columnId];
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
    setNewTaskTitles(prev => ({...prev, [columnId]: ''}));
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

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Reordering columns
    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(board.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setBoard(prev => ({
        ...prev,
        columnOrder: newColumnOrder,
      }));
      return;
    }

    // Reordering tasks
    const startColumn = board.columns[source.droppableId];
    const endColumn = board.columns[destination.droppableId];

    if (startColumn === endColumn) {
      // Reordering within the same column
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setBoard(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        }
      }));
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
      
      setBoard(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newStartColumn.id]: newStartColumn,
          [newEndColumn.id]: newEndColumn,
        }
      }));
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">NexusFlow</h1>
            <p className="text-lg text-muted-foreground mt-2">Visualize your workflow with a Kanban board.</p>
        </div>

        <div className="flex gap-2 mb-8 max-w-sm">
            <Input 
                placeholder="Add new column..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addColumn()}
            />
            <Button onClick={addColumn}><Plus className="mr-2 h-4 w-4"/>Add Column</Button>
        </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
                <ScrollArea className="flex-1 w-full">
                    <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="flex gap-6 pb-4"
                    >
                        {board.columnOrder.map((columnId, index) => {
                            const column = board.columns[columnId];
                            const tasks = column.taskIds.map(taskId => board.tasks[taskId]);

                            return (
                              <Draggable key={column.id} draggableId={column.id} index={index}>
                                {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="w-80 flex-shrink-0"
                                >
                                  <Card className="bg-muted/50 flex flex-col max-h-full">
                                      <div {...provided.dragHandleProps} className="p-3 border-b flex justify-between items-center cursor-grab">
                                          <h3 className="font-semibold">{column.title}</h3>
                                          <GripVertical className="h-5 w-5 text-muted-foreground" />
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
                                                      >
                                                          <Card className="hover:shadow-md transition-shadow">
                                                              <CardContent className="p-3 flex justify-between items-start">
                                                                  <p className="text-sm font-medium pr-2">{task.title}</p>
                                                                  <AlertDialog>
                                                                      <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><Trash2 className="h-4 w-4"/></Button>
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
                                                                          <AlertDialogAction onClick={() => removeTask(task.id, column.id)}>Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                      </AlertDialogContent>
                                                                    </AlertDialog>
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
                </ScrollArea>
            )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
