
'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Calendar as CalendarIcon, FileText, Share2, Wifi } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSearchParams } from 'next/navigation';
import * as pako from 'pako';
import { Base64 } from 'js-base64';
import { useToast } from '@/hooks/use-toast';
import Peer, { Instance as PeerInstance } from 'simple-peer';


type Priority = 'none' | 'low' | 'medium' | 'high';

interface TaskCard {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority: Priority;
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

const priorityColors: Record<Priority, string> = {
    none: 'bg-transparent',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
}

function encodeBoardData(board: BoardData): string {
  const jsonString = JSON.stringify(board);
  const compressed = pako.deflate(jsonString);
  return Base64.fromUint8Array(compressed, true);
}

function decodeBoardData(encoded: string): BoardData | null {
  try {
    const compressed = Base64.toUint8Array(encoded);
    const jsonString = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(jsonString) as BoardData;
  } catch (error) {
    console.error("Failed to decode board data:", error);
    return null;
  }
}

export function ProjectsApp() {
  const [board, setBoard] = useLocalStorage<BoardData>('projects:boardV1', initialData);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLiveShareModalOpen, setLiveShareModalOpen] = useState(false);
  const [liveShareSignal, setLiveShareSignal] = useState('');
  const [isHost, setIsHost] = useState(false);
  const peerRef = useRef<PeerInstance>();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    const boardParam = searchParams.get('board');
    if (boardParam) {
        const decodedBoard = decodeBoardData(boardParam);
        if (decodedBoard) {
            setBoard(decodedBoard);
            toast({ title: 'Board Loaded!', description: 'A shared board has been loaded from the URL.' });
            // Clear the URL parameter to avoid re-loading on refresh
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            toast({ variant: 'destructive', title: 'Load Failed', description: 'Could not load the shared board from the URL.' });
        }
    }
  }, []);

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
      priority: 'none'
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

  const handleShare = () => {
    const encodedData = encodeBoardData(board);
    const url = new URL(window.location.href);
    url.searchParams.set('board', encodedData);
    navigator.clipboard.writeText(url.toString());
    toast({ title: "Link Copied!", description: "A shareable link to this board has been copied to your clipboard."});
  };

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
  
  const handleSaveEditingTask = () => {
    if (editingTask) {
      updateTask(editingTask);
      setEditingTask(null);
    }
  };

  const startLiveShare = (initiator: boolean) => {
    setIsHost(initiator);
    setLiveShareModalOpen(true);
    
    const peer = new Peer({
      initiator: initiator,
      trickle: false, // Simplifies signaling by exchanging all data at once
    });

    peer.on('signal', (data) => {
      // For the host, this is the offer to be shared. For the guest, this is the answer.
      setLiveShareSignal(JSON.stringify(data));
    });

    peer.on('connect', () => {
      toast({ title: 'Live Session Connected!', description: 'You are now collaborating in real-time.' });
      setLiveShareModalOpen(false);
      if (initiator) {
        // Host sends the current board state to the new peer
        peer.send(JSON.stringify(board));
      }
    });

    peer.on('data', (data) => {
      // Received data from the other peer
      const receivedBoard = JSON.parse(data);
      setBoard(receivedBoard);
      toast({ title: 'Board Updated', description: 'The board has been updated by your collaborator.' });
    });

    peer.on('close', () => {
      toast({ variant: 'destructive', title: 'Session Closed', description: 'The live share session has ended.' });
      peerRef.current = undefined;
    });

    peerRef.current = peer;
  };

  const connectToPeer = () => {
    if (peerRef.current && liveShareSignal) {
      try {
        peerRef.current.signal(JSON.parse(liveShareSignal));
      } catch (e) {
        toast({ variant: 'destructive', title: 'Connection Failed', description: 'The signal data seems to be invalid.' });
      }
    }
  };
  
  const renderLiveShareModal = () => (
    <Dialog open={isLiveShareModalOpen} onOpenChange={setLiveShareModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isHost ? 'Start a Live Share Session' : 'Join a Live Share Session'}</DialogTitle>
          <DialogDescription>
            {isHost
              ? "Copy this signal data and send it to your collaborator. They will use it to connect."
              : "Paste the signal data you received from the host here to connect to the session."}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={liveShareSignal}
          onChange={(e) => !isHost && setLiveShareSignal(e.target.value)}
          placeholder={isHost ? 'Generating signal...' : 'Paste signal data here...'}
          rows={6}
          readOnly={isHost}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(liveShareSignal);
            toast({ title: 'Copied to Clipboard!' });
          }}>Copy</Button>
          {!isHost && <Button onClick={connectToPeer}>Connect</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
                        <Label htmlFor="description" className="text-right pt-2">Description</Label>
                        <Textarea id="description" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !editingTask.dueDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingTask.dueDate ? format(new Date(editingTask.dueDate), "PPP") : <span>Pick a date</span>}
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
        {renderLiveShareModal()}
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Projects</h1>
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
                <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4"/> Share Board
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline"><Wifi className="mr-2 h-4 w-4" /> Live Share</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Live Share Session</AlertDialogTitle>
                            <AlertDialogDescription>
                                Start a new session to host and share your board, or join an existing session using signal data from a host.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => startLiveShare(false)}>Join Session</AlertDialogAction>
                            <AlertDialogAction onClick={() => startLiveShare(true)}>Start Hosting</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
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
                            const tasks = column.taskIds.map(taskId => board.tasks[taskId]).filter(Boolean);

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
                                                                            <AlertDialogAction onClick={() => removeTask(task.id, column.id)}>Delete</AlertDialogAction>
                                                                          </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                      </AlertDialog>
                                                                  </div>
                                                                   <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                                                    {task.description && <FileText className="h-4 w-4"/>}
                                                                    {task.dueDate && <CalendarIcon className="h-4 w-4"/>}
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
                </ScrollArea>
            )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

    