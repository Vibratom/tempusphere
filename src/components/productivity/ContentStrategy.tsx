
'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2, CalendarIcon, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface ContentIdea {
    id: string;
    title: string;
    type: 'Blog Post' | 'Video' | 'Social Media' | 'Newsletter' | 'Other';
    notes: string;
    publishDate?: string;
}

interface Column {
    id: string;
    title: string;
    ideaIds: string[];
}

interface Board {
    ideas: Record<string, ContentIdea>;
    columns: Record<string, Column>;
    columnOrder: string[];
}

const initialBoard: Board = {
    ideas: {
        'idea-1': { id: 'idea-1', title: 'Q3 Earnings Report Analysis', type: 'Blog Post', notes: 'Focus on year-over-year growth.', publishDate: new Date().toISOString() },
    },
    columns: {
        'column-1': { id: 'column-1', title: 'Ideas', ideaIds: ['idea-1'] },
        'column-2': { id: 'column-2', title: 'In Progress', ideaIds: [] },
        'column-3': { id: 'column-3', title: 'In Review', ideaIds: [] },
        'column-4': { id: 'column-4', title: 'Published', ideaIds: [] },
    },
    columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
};

export function ContentStrategy() {
    const [board, setBoard] = useLocalStorage<Board>('content-strategy:board-v1', initialBoard);
    const [isClient, setIsClient] = useState(false);
    const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const addIdea = (columnId: string, title: string) => {
        if (!title.trim()) return;

        const newIdeaId = uuidv4();
        const newIdea: ContentIdea = {
            id: newIdeaId,
            title,
            type: 'Blog Post',
            notes: '',
        };

        setBoard(prev => {
            const newIdeas = { ...prev.ideas, [newIdeaId]: newIdea };
            const column = prev.columns[columnId];
            const newIdeaIds = [...column.ideaIds, newIdeaId];
            const newColumn = { ...column, ideaIds: newIdeaIds };
            return {
                ...prev,
                ideas: newIdeas,
                columns: { ...prev.columns, [columnId]: newColumn },
            };
        });
    };
    
    const updateIdea = (updatedIdea: ContentIdea) => {
        setBoard(prev => ({
            ...prev,
            ideas: { ...prev.ideas, [updatedIdea.id]: updatedIdea },
        }));
        toast({ title: "Idea updated!" });
    };

    const removeIdea = (columnId: string, ideaId: string) => {
        setBoard(prev => {
            const newIdeas = { ...prev.ideas };
            delete newIdeas[ideaId];
            const newColumn = { ...prev.columns[columnId] };
            newColumn.ideaIds = newColumn.ideaIds.filter(id => id !== ideaId);
            return {
                ...prev,
                ideas: newIdeas,
                columns: { ...prev.columns, [columnId]: newColumn },
            };
        });
    };

    const onDragEnd: OnDragEndResponder = (result) => {
        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        if (type === 'COLUMN') {
            const newColumnOrder = Array.from(board.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);
            setBoard(prev => ({ ...prev, columnOrder: newColumnOrder }));
            return;
        }

        const startColumn = board.columns[source.droppableId];
        const endColumn = board.columns[destination.droppableId];

        if (startColumn === endColumn) {
            const newIdeaIds = Array.from(startColumn.ideaIds);
            newIdeaIds.splice(source.index, 1);
            newIdeaIds.splice(destination.index, 0, draggableId);
            const newColumn = { ...startColumn, ideaIds: newIdeaIds };
            setBoard(prev => ({ ...prev, columns: { ...prev.columns, [newColumn.id]: newColumn } }));
        } else {
            const startIdeaIds = Array.from(startColumn.ideaIds);
            startIdeaIds.splice(source.index, 1);
            const newStartColumn = { ...startColumn, ideaIds: startIdeaIds };

            const endIdeaIds = Array.from(endColumn.ideaIds);
            endIdeaIds.splice(destination.index, 0, draggableId);
            const newEndColumn = { ...endColumn, ideaIds: endIdeaIds };
            
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
    
    if (!isClient) return null;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Content Strategy</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Plan, track, and manage your content pipeline from idea to publication.
                </p>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                    {(provided) => (
                        <ScrollArea className="w-full">
                            <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-4 pb-4">
                                {board.columnOrder.map((columnId, index) => {
                                    const column = board.columns[columnId];
                                    const ideas = column.ideaIds.map(id => board.ideas[id]);
                                    return <ColumnComponent key={column.id} column={column} ideas={ideas} index={index} addIdea={addIdea} removeIdea={removeIdea} setEditingIdea={setEditingIdea} />;
                                })}
                                {provided.placeholder}
                            </div>
                            <ScrollBar orientation="horizontal"/>
                        </ScrollArea>
                    )}
                </Droppable>
            </DragDropContext>
            
            {editingIdea && <EditIdeaDialog idea={editingIdea} onSave={updateIdea} onCancel={() => setEditingIdea(null)} />}
        </div>
    );
}

const ColumnComponent = ({ column, ideas, index, addIdea, removeIdea, setEditingIdea }: { column: Column, ideas: ContentIdea[], index: number, addIdea: (c:string, t:string)=>void, removeIdea: (c:string, i:string)=>void, setEditingIdea: (i: ContentIdea)=>void }) => {
    const [newIdeaTitle, setNewIdeaTitle] = useState('');
    return (
         <Draggable draggableId={column.id} index={index}>
            {(provided) => (
                <div {...provided.draggableProps} ref={provided.innerRef} className="w-80 flex-shrink-0">
                    <Card className="flex flex-col h-full bg-muted/30">
                        <CardHeader {...provided.dragHandleProps} className="flex-row items-center justify-between p-3 cursor-grab">
                            <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
                            <Badge variant="secondary">{ideas.length}</Badge>
                        </CardHeader>
                        <Droppable droppableId={column.id} type="IDEA">
                            {(provided, snapshot) => (
                                <CardContent ref={provided.innerRef} {...provided.droppableProps} className={cn("flex-1 p-3 space-y-2 min-h-[100px]", snapshot.isDraggingOver && "bg-primary/10")}>
                                    {ideas.map((idea, index) => (
                                        <Draggable key={idea.id} draggableId={idea.id} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setEditingIdea(idea)}>
                                                    <Card className="hover:bg-accent/10 cursor-pointer">
                                                        <CardContent className="p-3 text-sm font-medium flex items-start justify-between gap-1">
                                                            <span className="flex-1">{idea.title}</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); removeIdea(column.id, idea.id)}}><Trash2 className="h-4 w-4"/></Button>
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
                        <div className="p-3 border-t">
                            <div className="flex gap-2">
                                <Input placeholder="New idea..." value={newIdeaTitle} onChange={e => setNewIdeaTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && (addIdea(column.id, newIdeaTitle), setNewIdeaTitle(''))} />
                                <Button size="icon" onClick={() => (addIdea(column.id, newIdeaTitle), setNewIdeaTitle(''))}><Plus className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </Draggable>
    )
}

const EditIdeaDialog = ({ idea, onSave, onCancel }: { idea: ContentIdea, onSave: (i: ContentIdea) => void, onCancel: () => void }) => {
    const [editedIdea, setEditedIdea] = useState(idea);
    
    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Content Idea</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={editedIdea.title} onChange={e => setEditedIdea({...editedIdea, title: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={editedIdea.type} onValueChange={(v) => setEditedIdea({...editedIdea, type: v as ContentIdea['type']})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Blog Post">Blog Post</SelectItem>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Social Media">Social Media</SelectItem>
                                <SelectItem value="Newsletter">Newsletter</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                      <div className="space-y-2">
                        <Label>Publish Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editedIdea.publishDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {editedIdea.publishDate ? format(parseISO(editedIdea.publishDate), 'PPP') : "Select a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editedIdea.publishDate ? parseISO(editedIdea.publishDate) : undefined} onSelect={d => setEditedIdea({...editedIdea, publishDate: d?.toISOString()})}/></PopoverContent>
                        </Popover>
                     </div>
                     <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea value={editedIdea.notes} onChange={e => setEditedIdea({...editedIdea, notes: e.target.value})} rows={4}/>
                     </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => { onSave(editedIdea); onCancel(); }}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
