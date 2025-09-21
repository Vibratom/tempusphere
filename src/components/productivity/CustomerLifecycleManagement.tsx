
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Gauge, Activity, Target, Repeat, Heart, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

type SectionType = 'metrics' | 'actions' | 'notes';

interface ClmItem {
  id: string;
  text: string;
}

interface ClmStage {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  metrics: ClmItem[];
  actions: ClmItem[];
  notes: ClmItem[];
}

const createNewItem = (text = ''): ClmItem => ({ id: uuidv4(), text });

const initialStages: ClmStage[] = [
  { id: 'awareness', title: 'Awareness/Reach', description: 'How do people first hear about you?', icon: Gauge, color: 'border-blue-500 bg-blue-100/30 dark:bg-blue-900/30', metrics: [createNewItem('Website traffic'), createNewItem('Social media reach')], actions: [createNewItem('Content marketing plan')], notes: [] },
  { id: 'acquisition', title: 'Acquisition/Consideration', description: 'How do you turn a lead into a prospect?', icon: Target, color: 'border-purple-500 bg-purple-100/30 dark:bg-purple-900/30', metrics: [createNewItem('Lead-to-prospect conversion rate')], actions: [createNewItem('Lead nurturing campaigns')], notes: [] },
  { id: 'conversion', title: 'Conversion/Purchase', description: 'The moment a sale is made.', icon: Activity, color: 'border-green-500 bg-green-100/30 dark:bg-green-900/30', metrics: [createNewItem('Close rate'), createNewItem('Average deal size')], actions: [createNewItem('Sales scripts & proposal templates')], notes: [] },
  { id: 'retention', title: 'Retention', description: 'How do you keep customers coming back?', icon: Repeat, color: 'border-yellow-500 bg-yellow-100/30 dark:bg-yellow-900/30', metrics: [createNewItem('Customer churn rate'), createNewItem('Repeat purchase rate')], actions: [createNewItem('Customer support protocols')], notes: [] },
  { id: 'advocacy', title: 'Advocacy', description: 'How do you turn loyal customers into promoters?', icon: Heart, color: 'border-red-500 bg-red-100/30 dark:bg-red-900/30', metrics: [createNewItem('Net Promoter Score (NPS)'), createNewItem('Number of referrals')], actions: [createNewItem('Referral incentives')], notes: [] },
];

const ClmSection = ({ title, items, setItems, placeholder, isReadonly = false }: { title: string, items: ClmItem[], setItems?: React.Dispatch<React.SetStateAction<ClmItem[]>>, placeholder: string, isReadonly?: boolean }) => {
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
        <div className="space-y-2">
            <h4 className="font-semibold text-muted-foreground">{title}</h4>
            <div className="space-y-1">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-1 group">
                         {isReadonly ? (
                            <p className="flex-1 text-sm p-2 bg-muted/20 rounded-md min-h-[32px]">{item.text || <span className="text-muted-foreground italic">No content</span>}</p>
                        ) : (
                            <>
                                <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="h-8 border-dashed focus-visible:border-solid" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </>
                        )}
                    </div>
                ))}
            </div>
             {!isReadonly && <div className="flex items-center gap-1">
                <Input placeholder={placeholder} value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} className="h-8" />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={addItem}><Plus className="h-4 w-4" /></Button>
            </div>}
        </div>
    );
};

export function CustomerLifecycleManagement() {
    const [stages, setStages] = useLocalStorage<ClmStage[]>('clm:stages-v1', initialStages);
    const [title, setTitle] = useLocalStorage('clm:title', 'Customer Lifecycle Management Plan');
    const { toast } = useToast();
    const contentRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const updateStageSection = (stageId: string, section: SectionType, newItems: ClmItem[]) => {
        setStages(prev => prev.map(stage => 
            stage.id === stageId ? { ...stage, [section]: newItems } : stage
        ));
    };

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

            const fileName = `${title.replace(/ /g, '_')}_CLM.${format}`;
            
            if (format === 'png') {
                canvas.toBlob((blob) => {
                    if(blob) saveAs(blob, fileName);
                });
            } else {
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                const pageHeight = pdfWidth / ratio;
                let heightLeft = canvasHeight;
                let position = 0;
                
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pageHeight);
                heightLeft -= pageHeight * (canvasWidth / pdfWidth);

                while (heightLeft > 0) {
                    position -= pageHeight * (canvasWidth/pdfWidth);
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pageHeight);
                    heightLeft -= pageHeight * (canvasWidth / pdfWidth);
                }
                pdf.save(fileName);
            }
            toast({ title: 'Export Successful', description: `Your CLM analysis has been downloaded as a ${format.toUpperCase()} file.` });
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
             <div className="space-y-6">
                {stages.map(stage => (
                    <Card key={stage.id} className={cn("w-full", stage.color)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl"><stage.icon /> {stage.title}</CardTitle>
                            <CardDescription>{stage.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6">
                           <ClmSection title="Metrics & Insights" items={stage.metrics} placeholder="" isReadonly />
                           <ClmSection title="Actions & Strategy" items={stage.actions} placeholder="" isReadonly />
                           <ClmSection title="Notes" items={stage.notes} placeholder="" isReadonly />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <Dialog open={isExporting} onOpenChange={setIsExporting}>
                <DialogContent className="max-w-7xl w-auto bg-transparent border-none shadow-none p-0" onInteractOutside={(e) => e.preventDefault()}>
                   <div className="absolute top-0 left-[-9999px]"><ExportPreview /></div>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Customer Lifecycle Management</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Manage and optimize every customer interaction across their entire journey with your business.
                </p>
            </div>

            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-lg"/>
                </CardHeader>
            </Card>
            
            <div className="space-y-6">
                {stages.map(stage => (
                    <Card key={stage.id} className={cn("w-full", stage.color)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl"><stage.icon /> {stage.title}</CardTitle>
                            <CardDescription>{stage.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6">
                           <ClmSection title="Metrics & Insights" items={stage.metrics} setItems={(newItems) => updateStageSection(stage.id, 'metrics', newItems as ClmItem[])} placeholder="Add a metric..." />
                           <ClmSection title="Actions & Strategy" items={stage.actions} setItems={(newItems) => updateStageSection(stage.id, 'actions', newItems as ClmItem[])} placeholder="Add an action..." />
                           <ClmSection title="Notes" items={stage.notes} setItems={(newItems) => updateStageSection(stage.id, 'notes', newItems as ClmItem[])} placeholder="Add a note..." />
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportAnalysis('png')}><ImageIcon className="mr-2 h-4 w-4" /> Export as PNG</Button>
                <Button variant="outline" onClick={() => exportAnalysis('pdf')}><FileIcon className="mr-2 h-4 w-4" /> Export as PDF</Button>
            </CardFooter>
        </div>
    );
}
