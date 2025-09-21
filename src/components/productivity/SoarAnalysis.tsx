
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, Lightbulb, Rocket, BarChart, Target, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

type SoarCategory = 'strengths' | 'opportunities' | 'aspirations' | 'results';

interface SoarItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): SoarItem => ({ id: uuidv4(), text });

const SoarColumn = ({ title, category, items, setItems, placeholder, className, icon: Icon, isReadonly = false }: { title: string, category: SoarCategory, items: SoarItem[], setItems: React.Dispatch<React.SetStateAction<SoarItem[]>>, placeholder: string, className?: string, icon: React.ElementType, isReadonly?: boolean }) => {
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
                <Droppable droppableId={category} isDropDisabled={isReadonly}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn("space-y-2 p-2 rounded-md min-h-[100px] flex-1", snapshot.isDraggingOver && "bg-muted/50")}
                        >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isReadonly}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={cn("flex items-center gap-2 p-2 border rounded-md bg-background", snapshot.isDragging && "shadow-lg")}
                                        >
                                            {!isReadonly && <span {...provided.dragHandleProps} className="cursor-grab text-muted-foreground"><GripVertical className="h-5 w-5" /></span>}
                                            <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="border-none focus-visible:ring-0" readOnly={isReadonly} />
                                            {!isReadonly && <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {!isReadonly && <div className="flex gap-2">
                    <Input
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addItem()}
                        placeholder={placeholder}
                    />
                    <Button onClick={addItem}><Plus /></Button>
                </div>}
            </CardContent>
        </Card>
    );
};

export function SoarAnalysis() {
    const [title, setTitle] = useLocalStorage('soar:title', 'My SOAR Analysis');
    const [strengths] = useLocalStorage<SoarItem[]>('swot:strengths', []);
    const [opportunities] = useLocalStorage<SoarItem[]>('swot:opportunities', []);
    const [aspirations, setAspirations] = useLocalStorage<SoarItem[]>('soar:aspirations', []);
    const [results, setResults] = useLocalStorage<SoarItem[]>('soar:results', []);
    const { toast } = useToast();
    const soarContentRef = useRef<HTMLDivElement>(null);

    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceCategory = source.droppableId as SoarCategory;
        const destCategory = destination.droppableId as SoarCategory;

        if (sourceCategory === 'strengths' || sourceCategory === 'opportunities' || destCategory === 'strengths' || destCategory === 'opportunities') return;

        const stateMap = {
            aspirations: { items: aspirations, setItems: setAspirations },
            results: { items: results, setItems: setResults },
        };
        
        // @ts-ignore
        const sourceList = Array.from(stateMap[sourceCategory].items);
        const [movedItem] = sourceList.splice(source.index, 1);
        
        if (sourceCategory === destCategory) {
            sourceList.splice(destination.index, 0, movedItem);
             // @ts-ignore
            stateMap[sourceCategory].setItems(sourceList);
        } else {
             // @ts-ignore
            stateMap[sourceCategory].setItems(sourceList);
             // @ts-ignore
            const destList = Array.from(stateMap[destCategory].items);
            destList.splice(destination.index, 0, movedItem);
             // @ts-ignore
            stateMap[destCategory].setItems(destList);
        }
    };
    
    const exportToImage = async (format: 'png' | 'pdf') => {
        if (!soarContentRef.current) return;
        
        const canvas = await html2canvas(soarContentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        const fileName = `${title.replace(/ /g, '_')}_SOAR.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your SOAR analysis has been downloaded as a ${format.toUpperCase()} file.` });
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div ref={soarContentRef} className="p-4 bg-background">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">SOAR Analysis</h1>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                        A strategic planning tool that focuses on strengths and aspirations to drive future results.
                    </p>
                </div>
                
                <Card className="my-6">
                    <CardHeader className="items-center">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                    </CardHeader>
                </Card>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SoarColumn title="Strengths" category="strengths" items={strengths} setItems={() => {}} placeholder="" icon={Lightbulb} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" isReadonly />
                        <SoarColumn title="Opportunities" category="opportunities" items={opportunities} setItems={() => {}} placeholder="" icon={Rocket} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" isReadonly />
                        <SoarColumn title="Aspirations" category="aspirations" items={aspirations} setItems={setAspirations} placeholder="Add an aspiration..." icon={Target} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" />
                        <SoarColumn title="Results" category="results" items={results} setItems={setResults} placeholder="Add a measurable result..." icon={BarChart} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
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
