
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, Download, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SwotCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

interface SwotItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): SwotItem => ({ id: uuidv4(), text });

const SwotColumn = ({ title, category, items, setItems, placeholder, className }: { title: string, category: SwotCategory, items: SwotItem[], setItems: React.Dispatch<React.SetStateAction<SwotItem[]>>, placeholder: string, className?: string }) => {
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
            <CardHeader>
                <CardTitle className="text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
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

                <div className="flex gap-2">
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


export function SwotAnalysis() {
    const [title, setTitle] = useLocalStorage('swot:title', 'My SWOT Analysis');
    const [strengths, setStrengths] = useLocalStorage<SwotItem[]>('swot:strengths', []);
    const [weaknesses, setWeaknesses] = useLocalStorage<SwotItem[]>('swot:weaknesses', []);
    const [opportunities, setOpportunities] = useLocalStorage<SwotItem[]>('swot:opportunities', []);
    const [threats, setThreats] = useLocalStorage<SwotItem[]>('swot:threats', []);
    const { toast } = useToast();

    const contentRef = useRef<HTMLDivElement>(null);

    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceCategory = source.droppableId as SwotCategory;
        const destCategory = destination.droppableId as SwotCategory;

        const stateMap = {
            strengths: { items: strengths, setItems: setStrengths },
            weaknesses: { items: weaknesses, setItems: setWeaknesses },
            opportunities: { items: opportunities, setItems: setOpportunities },
            threats: { items: threats, setItems: setThreats },
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
    
    const exportToImage = async (format: 'png' | 'pdf') => {
        if (!contentRef.current) return;
        
        const canvas = await html2canvas(contentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        const fileName = `${title.replace(/ /g, '_')}_SWOT.${format}`;
        
        if (format === 'png') {
            canvas.toBlob((blob) => {
                if(blob) saveAs(blob, fileName);
            });
        } else {
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF({ orientation: 'l', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save(fileName);
        }

        toast({ title: 'Export Successful', description: `Your SWOT analysis has been downloaded as a ${format.toUpperCase()} file.` });
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">SWOT Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Identify Strengths, Weaknesses, Opportunities, and Threats for your project or business.
                </p>
            </div>
            
            <div ref={contentRef} className="p-4 bg-background">
                <Card>
                    <CardHeader className="items-center">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                    </CardHeader>
                </Card>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <SwotColumn title="Strengths" category="strengths" items={strengths} setItems={setStrengths} placeholder="Add a strength..." className="bg-green-100/30 dark:bg-green-900/30 border-green-500" />
                        <SwotColumn title="Weaknesses" category="weaknesses" items={weaknesses} setItems={setWeaknesses} placeholder="Add a weakness..." className="bg-red-100/30 dark:bg-red-900/30 border-red-500" />
                        <SwotColumn title="Opportunities" category="opportunities" items={opportunities} setItems={setOpportunities} placeholder="Add an opportunity..." className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                        <SwotColumn title="Threats" category="threats" items={threats} setItems={setThreats} placeholder="Add a threat..." className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                    </div>
                </DragDropContext>
            </div>
            
             <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportToImage('png')}><ImageIcon className="mr-2 h-4 w-4" /> Export as PNG</Button>
                <Button variant="outline" onClick={() => exportToImage('pdf')}><FileIcon className="mr-2 h-4 w-4" /> Export as PDF</Button>
            </CardFooter>
        </div>
    );
}
