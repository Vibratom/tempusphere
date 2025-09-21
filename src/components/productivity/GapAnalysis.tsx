
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Activity, Target, HelpCircle, Zap, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '../ui/dialog';

interface GapItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): GapItem => ({ id: uuidv4(), text });

const GapColumn = ({ title, items, setItems, placeholder, className, icon: Icon, isReadonly = false }: { title: string, items: GapItem[], setItems?: React.Dispatch<React.SetStateAction<GapItem[]>>, placeholder: string, className?: string, icon: React.ElementType, isReadonly?: boolean }) => {
    const [newItemText, setNewItemText] = useState('');

    const addItem = () => {
        if (newItemText.trim() && setItems) {
            setItems(prev => [...prev, createNewItem(newItemText)]);
            setNewItemText('');
        }
    };

    const updateItem = (id: string, newText: string) => {
        if (setItems) {
            setItems(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
        }
    };

    const removeItem = (id: string) => {
        if (setItems) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="flex-row items-center gap-2">
                <Icon className="w-6 h-6" />
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
                <ScrollArea className={cn(isReadonly ? "h-full" : "h-48")}>
                    <div className="space-y-2 p-2 rounded-md min-h-[100px] flex-1">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                                 {isReadonly ? (
                                    <p className="flex-1 text-sm p-2">{item.text || <span className="text-muted-foreground">No content</span>}</p>
                                ) : (
                                    <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="border-none focus-visible:ring-0" />
                                )}
                                {!isReadonly && <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                        ))}
                    </div>
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

export function GapAnalysis() {
    const [title, setTitle] = useLocalStorage('gap:title', 'My Gap Analysis');
    const [currentState, setCurrentState] = useLocalStorage<GapItem[]>('gap:currentState', []);
    const [futureState, setFutureState] = useLocalStorage<GapItem[]>('gap:futureState', []);
    const [gapDescription, setGapDescription] = useLocalStorage<GapItem[]>('gap:gapDescription', []);
    const [actions, setActions] = useLocalStorage<GapItem[]>('gap:actions', []);
    const { toast } = useToast();
    const contentRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportAnalysis = async (format: 'png' | 'pdf') => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!contentRef.current) {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not find content to export.' });
            setIsExporting(false);
            return;
        }

        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            });
            
            if (canvas.width === 0 || canvas.height === 0) {
                toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not capture the content to export.' });
                setIsExporting(false);
                return;
            }

            const fileName = `${title.replace(/ /g, '_')}_GapAnalysis.${format}`;
            
            if (format === 'png') {
                canvas.toBlob((blob) => {
                    if(blob) saveAs(blob, fileName);
                });
            } else {
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                let pageHeight = pdfWidth / ratio;
                let heightLeft = canvasHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pageHeight);
                heightLeft -= canvasHeight;

                while (heightLeft > 0) {
                    position = heightLeft - canvasHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pageHeight);
                    heightLeft -= canvasHeight;
                }
                pdf.save(fileName);
            }
            toast({ title: 'Export Successful', description: `Your Gap analysis has been downloaded as a ${format.toUpperCase()} file.` });
        } catch (error) {
            console.error("Export error:", error);
            toast({ variant: 'destructive', title: 'Export Error', description: 'An unexpected error occurred during export.' });
        } finally {
            setIsExporting(false);
        }
    };
    
    const ExportPreview = () => (
        <div ref={contentRef} className="p-8 bg-background">
            <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
            <div className="grid grid-cols-2 gap-6">
                <GapColumn title="Current State" items={currentState} placeholder="" icon={Activity} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" isReadonly/>
                <GapColumn title="Future State" items={futureState} placeholder="" icon={Target} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" isReadonly/>
                <GapColumn title="Gap Description" items={gapDescription} placeholder="" icon={HelpCircle} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" isReadonly/>
                <GapColumn title="Actions to Close Gap" items={actions} placeholder="" icon={Zap} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" isReadonly/>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <Dialog open={isExporting} onOpenChange={setIsExporting}>
                <DialogContent className="max-w-7xl w-auto bg-transparent border-none shadow-none p-0" onInteractOutside={(e) => e.preventDefault()}>
                    <ExportPreview />
                </DialogContent>
            </Dialog>
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Gap Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Identify the gap between your current situation and desired future state, and outline the actions needed to bridge it.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GapColumn title="Current State" items={currentState} setItems={setCurrentState} placeholder="e.g., Manual data entry..." icon={Activity} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                <GapColumn title="Future State" items={futureState} setItems={setFutureState} placeholder="e.g., Automated data workflow..." icon={Target} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" />
                <GapColumn title="Gap Description" items={gapDescription} setItems={setGapDescription} placeholder="e.g., Lack of integration tools..." icon={HelpCircle} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                <GapColumn title="Actions to Close Gap" items={actions} setItems={setActions} placeholder="e.g., Implement Zapier..." icon={Zap} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" />
            </div>

            <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportAnalysis('png')}><ImageIcon className="mr-2 h-4 w-4" /> Export as PNG</Button>
                <Button variant="outline" onClick={() => exportAnalysis('pdf')}><FileIcon className="mr-2 h-4 w-4" /> Export as PDF</Button>
            </CardFooter>
        </div>
    );
}
