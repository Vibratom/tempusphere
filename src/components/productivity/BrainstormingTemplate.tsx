
'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';

interface Block {
  id: string;
  title: string;
  content: string;
}

const createNewBlock = (): Block => ({
  id: uuidv4(),
  title: 'New Section',
  content: '',
});

export function BrainstormingTemplate() {
    const [blocks, setBlocks] = useLocalStorage<Block[]>('brainstorming:blocks-v1', [createNewBlock()]);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleBlockChange = (id: string, field: 'title' | 'content', value: string) => {
        setBlocks(prev => prev.map(block => block.id === id ? { ...block, [field]: value } : block));
    };

    const addBlock = () => {
        setBlocks(prev => [...prev, createNewBlock()]);
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(block => block.id !== id));
    };

    const onDragEnd: OnDragEndResponder = (result) => {
        if (!result.destination) return;
        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setBlocks(items);
    };

    if (!isClient) {
        return null; // Or a skeleton loader
    }

    return (
        <div className="space-y-4">
            <p className="text-center text-muted-foreground">
                Build your own template by adding and arranging content blocks.
            </p>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blocks">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {blocks.map((block, index) => (
                                <Draggable key={block.id} draggableId={block.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="flex gap-2 items-start p-4 border rounded-lg bg-card shadow-sm">
                                            <div {...provided.dragHandleProps} className="pt-2 cursor-grab text-muted-foreground">
                                                <GripVertical />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Input 
                                                    value={block.title} 
                                                    onChange={e => handleBlockChange(block.id, 'title', e.target.value)} 
                                                    className="text-lg font-semibold border-none focus-visible:ring-1" 
                                                />
                                                <Textarea 
                                                    value={block.content} 
                                                    onChange={e => handleBlockChange(block.id, 'content', e.target.value)}
                                                    rows={5}
                                                    placeholder="Start typing..."
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <div className="text-center">
                <Button variant="outline" onClick={addBlock}>
                    <Plus className="mr-2 h-4 w-4" /> Add Section
                </Button>
            </div>
        </div>
    );
}


export function BrainstormingPreview() {
    const [blocks] = useLocalStorage<Block[]>('brainstorming:blocks-v1', []);

    return (
        <div className="prose dark:prose-invert max-w-none">
            {blocks.map(block => (
                <div key={block.id}>
                    <h3>{block.title}</h3>
                    <p>{block.content}</p>
                </div>
            ))}
        </div>
    );
}

    
