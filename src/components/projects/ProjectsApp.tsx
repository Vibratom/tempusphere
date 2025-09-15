
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, Calendar as CalendarIcon, FileText, Share2, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { useToast } from '@/hooks/use-toast';
import Peer from 'simple-peer';
import { useProjects, Priority, TaskCard, encodeBoardData, decodeBoardData, peerRef } from '@/contexts/ProjectsContext';


const priorityColors: Record<Priority, string> = {
    none: 'bg-transparent',
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
}


export function ProjectsApp() {
  const { 
    board, 
    setBoard, 
    addColumn: contextAddColumn,
    addTask: contextAddTask,
    removeTask: contextRemoveTask,
    updateTask: contextUpdateTask,
    removeColumn: contextRemoveColumn,
    handleDragEnd
  } = useProjects();

  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLiveShareModalOpen, setLiveShareModalOpen] = useState(false);
  const [liveShareSignal, setLiveShareSignal] = useState('');
  const [isHost, setIsHost] = useState(false);
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
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            toast({ variant: 'destructive', title: 'Load Failed', description: 'Could not load the shared board from the URL.' });
        }
    }

    return () => {
      peerRef.current?.destroy();
    }
  }, []); // Eslint will complain but setBoard and toast are stable

  const handleNewTaskTitleChange = (columnId: string, title: string) => {
    setNewTaskTitles(prev => ({...prev, [columnId]: title}));
  }

  const addColumn = () => {
    if(!newColumnName.trim()) return;
    contextAddColumn(newColumnName.trim());
    setNewColumnName('');
  };

  const addTask = (columnId: string) => {
    const title = newTaskTitles[columnId]?.trim();
    if(!title) return;
    contextAddTask(columnId, { title });
    setNewTaskTitles(prev => ({...prev, [columnId]: ''}));
  }

  const handleShare = () => {
    const encodedData = encodeBoardData(board);
    const url = new URL(window.location.href);
    url.searchParams.set('board', encodedData);
    navigator.clipboard.writeText(url.toString());
    toast({ title: "Link Copied!", description: "A shareable link to this board has been copied to your clipboard."});
  };

  const handleSaveEditingTask = () => {
    if (editingTask) {
      contextUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  const startLiveShare = (initiator: boolean) => {
    setIsHost(initiator);
    setLiveShareModalOpen(true);
    
    peerRef.current?.destroy(); // Destroy any existing peer connection

    const peer = new Peer({
      initiator: initiator,
      trickle: false,
    });

    peer.on('signal', (data) => {
      setLiveShareSignal(JSON.stringify(data));
    });

    peer.on('connect', () => {
      toast({ title: 'Live Session Connected!', description: 'You are now collaborating in real-time.' });
      setLiveShareModalOpen(false);
      if (initiator) {
        peer.send(JSON.stringify(board));
      }
    });

    peer.on('data', (data) => {
      try {
        const receivedBoard = JSON.parse(data.toString());
        // Call setBoard with fromPeer=true to prevent an echo broadcast
        useProjects.getState().setBoard(receivedBoard, true); 
        toast({ title: 'Board Updated', description: 'The board has been updated by your collaborator.' });
      } catch (e) {
        console.error('Failed to parse received board data:', e);
      }
    });

    peer.on('close', () => {
      toast({ variant: 'destructive', title: 'Session Closed', description: 'The live share session has ended.' });
      peerRef.current = undefined;
    });

    peer.on('error', (err) => {
        toast({ variant: 'destructive', title: 'Connection Error', description: err.message });
        console.error('Peer error:', err);
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
              ? "Copy this signal data and send it to your collaborator. They will paste it to generate a response signal for you."
              : "Paste the signal data you received from the host here. Then, copy the generated response and send it back to them."}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={liveShareSignal}
          onChange={(e) => !isHost && setLiveShareSignal(e.target.value)}
          placeholder={isHost ? 'Generating signal...' : 'Paste signal data here...'}
          rows={6}
          readOnly={isHost}
        />
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(liveShareSignal);
            toast({ title: 'Copied to Clipboard!' });
          }}>Copy Signal</Button>
          {!isHost && <Button onClick={connectToPeer}>Generate Response & Connect</Button>}
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
                        <Label htmlFor="description" className="text-right pt-2">Notes</Label>
                        <Textarea id="description" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} className="col-span-3" rows={5} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !editingTask.startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingTask.startDate ? format(new Date(editingTask.startDate), "PPP") : <span>Pick a start date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={editingTask.startDate ? new Date(editingTask.startDate) : undefined}
                                    onSelect={(date) => setEditingTask({...editingTask, startDate: date?.toISOString()})}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn("col-span-3 justify-start text-left font-normal", !editingTask.dueDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingTask.dueDate ? format(new Date(editingTask.dueDate), "PPP") : <span>Pick an end date</span>}
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Board</h1>
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
                <ScrollArea className="w-full whitespace-nowrap">
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
                                  className="w-80 flex-shrink-0 inline-block align-top"
                                >
                                  <Card className="bg-muted/50 flex flex-col h-full">
                                      <div {...provided.dragHandleProps} className="p-3 border-b flex justify-between items-center cursor-grab">
                                          <h3 className="font-semibold">{column.title}</h3>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                               <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Column?</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure you want to delete the "{column.title}" column? All tasks within it will also be deleted. This cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => contextRemoveColumn(columnId)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
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
                                                                            <AlertDialogAction onClick={() => contextRemoveTask(task.id, column.id)}>Delete</AlertDialogAction>
                                                                          </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                      </AlertDialog>
                                                                  </div>
                                                                   <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                                                    {task.description && <FileText className="h-4 w-4"/>}
                                                                    {(task.startDate || task.dueDate) && <CalendarIcon className="h-4 w-4"/>}
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
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
