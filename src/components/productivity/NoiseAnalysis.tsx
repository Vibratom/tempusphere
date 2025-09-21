
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, Search, Zap, Construction, Lightbulb, ShieldAlert, CircleHelp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

type NoiseCategory = 'needs' | 'opportunities' | 'improvements' | 'strengths' | 'exceptions';

interface NoiseItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): NoiseItem => ({ id: uuidv4(), text });

const NoiseColumn = ({ title, category, items, setItems, placeholder, className, icon: Icon }: { title: string, category: NoiseCategory, items: NoiseItem[], setItems: React.Dispatch<React.SetStateAction<NoiseItem[]>>, placeholder: string, className?: string, icon: React.ElementType }) => {
    const [newItemText, setNewItemText] = useState('');

    const addItem = () => {
        if (newItemText.trim()) {
            setItems(prev => [...prev, createNewItem(newItemText)]);
            setNewItemText('');
        }
    };

    const updateItem = (id: string, newText: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="flex-row items-center gap-2">
                <Icon className="w-6 h-6" />
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
                <ScrollArea className="h-48">
                  <Droppable droppableId={category}>
                      {(provided, snapshot) => (
                          <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn("space-y-2 p-2 rounded-md min-h-[100px] flex-1", snapshot.isDraggingOver && "bg-muted/50")}
                          >
                              {items.map((item, index) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                      {(provided, snapshot) => (
                                          <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={cn("flex items-center gap-2 p-2 border rounded-md bg-background", snapshot.isDragging && "shadow-lg")}
                                          >
                                              <span {...provided.dragHandleProps} className="cursor-grab text-muted-foreground"><GripVertical className="h-5 w-5" /></span>
                                              <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="border-none focus-visible:ring-0" />
                                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      )}
                                  </Draggable>
                              ))}
                              {provided.placeholder}
                          </div>
                      )}
                  </Droppable>
                </ScrollArea>

                <div className="flex gap-2 mt-auto pt-2 border-t">
                    <Input
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addItem()}
                        placeholder={placeholder}
                    />
                    <Button onClick={addItem}><Plus /></Button>
                </div>
            </CardContent>
        </Card>
    );
};

export function NoiseAnalysis() {
    const [title, setTitle] = useLocalStorage('noise:title', 'My NOISE Analysis');
    const [needs, setNeeds] = useLocalStorage<NoiseItem[]>('noise:needs', []);
    const [opportunities, setOpportunities] = useLocalStorage<NoiseItem[]>('noise:opportunities', []);
    const [improvements, setImprovements] = useLocalStorage<NoiseItem[]>('noise:improvements', []);
    const [strengths, setStrengths] = useLocalStorage<NoiseItem[]>('noise:strengths', []);
    const [exceptions, setExceptions] = useLocalStorage<NoiseItem[]>('noise:exceptions', []);

    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceCategory = source.droppableId as NoiseCategory;
        const destCategory = destination.droppableId as NoiseCategory;

        const stateMap = {
            needs: { items: needs, setItems: setNeeds },
            opportunities: { items: opportunities, setItems: setOpportunities },
            improvements: { items: improvements, setItems: setImprovements },
            strengths: { items: strengths, setItems: setStrengths },
            exceptions: { items: exceptions, setItems: setExceptions },
        };
        
        const sourceList = Array.from(stateMap[sourceCategory].items);
        const [movedItem] = sourceList.splice(source.index, 1);

        if (sourceCategory === destCategory) {
            sourceList.splice(destination.index, 0, movedItem);
            stateMap[sourceCategory].setItems(sourceList);
        } else {
            const destList = Array.from(stateMap[destCategory].items);
            destList.splice(destination.index, 0, movedItem);
            stateMap[sourceCategory].setItems(sourceList);
            stateMap[destCategory].setItems(destList);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">NOISE Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    A user-centric framework focusing on Needs, Opportunities, Improvements, Strengths, and Exceptions.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <NoiseColumn title="Needs" category="needs" items={needs} setItems={setNeeds} placeholder="What are the needs?" icon={Search} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                    <NoiseColumn title="Opportunities" category="opportunities" items={opportunities} setItems={setOpportunities} placeholder="What opportunities exist?" icon={Zap} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                    <NoiseColumn title="Improvements" category="improvements" items={improvements} setItems={setImprovements} placeholder="What can be improved?" icon={Construction} className="bg-orange-100/30 dark:bg-orange-900/30 border-orange-500" />
                    <NoiseColumn title="Strengths" category="strengths" items={strengths} setItems={setStrengths} placeholder="What are our core strengths?" icon={Lightbulb} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" />
                    <NoiseColumn title="Exceptions" category="exceptions" items={exceptions} setItems={setExceptions} placeholder="What are the constraints?" icon={ShieldAlert} className="bg-red-100/30 dark:bg-red-900/30 border-red-500 lg:col-span-1" />
                </div>
            </DragDropContext>
        </div>
    );
}
