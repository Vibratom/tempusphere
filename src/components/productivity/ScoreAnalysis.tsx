
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, Lightbulb, AlertTriangle, GitFork, MessageSquareReply, CheckCircle2, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

type ScoreCategory = 'strengths' | 'challenges' | 'options' | 'responses' | 'effectiveness';

interface ScoreItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): ScoreItem => ({ id: uuidv4(), text });

const ScoreColumn = ({ title, category, items, setItems, placeholder, className, icon: Icon, isReadonly = false }: { title: string, category: ScoreCategory, items: ScoreItem[], setItems: React.Dispatch<React.SetStateAction<ScoreItem[]>>, placeholder: string, className?: string, icon: React.ElementType, isReadonly?: boolean }) => {
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
                <ScrollArea className={cn(isReadonly ? "h-full" : "h-48")}>
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
                                               {isReadonly ? (
                                                     <p className="flex-1 text-sm p-2">{item.text}</p>
                                                ) : (
                                                    <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="border-none focus-visible:ring-0" />
                                                )}
                                              {!isReadonly && <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>}
                                          </div>
                                      )}
                                  </Draggable>
                              ))}
                              {provided.placeholder}
                          </div>
                      )}
                  </Droppable>
                </ScrollArea>

                {!isReadonly && <div className="flex gap-2 mt-auto pt-2 border-t">
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

export function ScoreAnalysis() {
    const [title, setTitle] = useLocalStorage('score:title', 'My SCORE Analysis');
    const [strengths] = useLocalStorage<ScoreItem[]>('swot:strengths', []);
    const [challenges, setChallenges] = useLocalStorage<ScoreItem[]>('score:challenges', []);
    const [options, setOptions] = useLocalStorage<ScoreItem[]>('score:options', []);
    const [responses, setResponses] = useLocalStorage<ScoreItem[]>('score:responses', []);
    const [effectiveness, setEffectiveness] = useLocalStorage<ScoreItem[]>('score:effectiveness', []);
    const { toast } = useToast();
    const contentRef = useRef<HTMLDivElement>(null);

    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination } = result;
        if (!destination) return;
        
        const sourceCategory = source.droppableId as ScoreCategory;
        const destCategory = destination.droppableId as ScoreCategory;
        
        if (sourceCategory === 'strengths' || destCategory === 'strengths') return;

        const stateMap = {
            challenges: { items: challenges, setItems: setChallenges },
            options: { items: options, setItems: setOptions },
            responses: { items: responses, setItems: setResponses },
            effectiveness: { items: effectiveness, setItems: setEffectiveness },
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
        if (!contentRef.current) return;
        
        const canvas = await html2canvas(contentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        const fileName = `${title.replace(/ /g, '_')}_SCORE.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your SCORE analysis has been downloaded as a ${format.toUpperCase()} file.` });
    };
    
    const ExportPreview = () => (
        <DragDropContext onDragEnd={() => {}}>
            <div ref={contentRef} className="p-8 bg-background">
                <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
                <div className="grid grid-cols-3 gap-6">
                    <ScoreColumn title="Strengths" category="strengths" items={strengths} setItems={setChallenges} placeholder="" icon={Lightbulb} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" isReadonly />
                    <ScoreColumn title="Challenges" category="challenges" items={challenges} setItems={setChallenges} placeholder="" icon={AlertTriangle} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" isReadonly/>
                    <ScoreColumn title="Options" category="options" items={options} setItems={setOptions} placeholder="" icon={GitFork} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" isReadonly/>
                    <ScoreColumn title="Responses" category="responses" items={responses} setItems={setResponses} placeholder="" icon={MessageSquareReply} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" isReadonly/>
                    <ScoreColumn title="Effectiveness" category="effectiveness" items={effectiveness} setItems={setEffectiveness} placeholder="" icon={CheckCircle2} className="bg-sky-100/30 dark:bg-sky-900/30 border-sky-500" isReadonly/>
                </div>
            </div>
        </DragDropContext>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
             <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">SCORE Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    A framework for situational analysis focusing on Strengths, Challenges, Options, Responses, and Effectiveness.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ScoreColumn title="Strengths" category="strengths" items={strengths} setItems={setChallenges} placeholder="" icon={Lightbulb} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" isReadonly />
                    <ScoreColumn title="Challenges" category="challenges" items={challenges} setItems={setChallenges} placeholder="What are the obstacles?" icon={AlertTriangle} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                    <ScoreColumn title="Options" category="options" items={options} setItems={setOptions} placeholder="What can we do?" icon={GitFork} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                    <ScoreColumn title="Responses" category="responses" items={responses} setItems={setResponses} placeholder="What is our chosen path?" icon={MessageSquareReply} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" />
                    <ScoreColumn title="Effectiveness" category="effectiveness" items={effectiveness} setItems={setEffectiveness} placeholder="How do we measure success?" icon={CheckCircle2} className="bg-sky-100/30 dark:bg-sky-900/30 border-sky-500 lg:col-span-1" />
                </div>
            </DragDropContext>

             <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportToImage('png')}><ImageIcon className="mr-2 h-4 w-4" /> Export as PNG</Button>
                <Button variant="outline" onClick={() => exportToImage('pdf')}><FileIcon className="mr-2 h-4 w-4" /> Export as PDF</Button>
            </CardFooter>
            
            <div className="hidden">
                <ExportPreview />
            </div>
        </div>
    );
}
