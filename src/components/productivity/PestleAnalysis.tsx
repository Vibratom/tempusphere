
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Landmark, DollarSign, Users, Cpu, Scale, Leaf, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

type PestleCategory = 'political' | 'economic' | 'social' | 'technological' | 'legal' | 'environmental';

interface PestleItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): PestleItem => ({ id: uuidv4(), text });

const PestleColumn = ({ title, items, setItems, placeholder, className, icon: Icon, isReadonly = false }: { title: string, items: PestleItem[], setItems: React.Dispatch<React.SetStateAction<PestleItem[]>>, placeholder: string, className?: string, icon: React.ElementType, isReadonly?: boolean }) => {
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
                    <div className="space-y-2 p-2 rounded-md min-h-[100px] flex-1">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                                {isReadonly ? (
                                    <p className="flex-1 text-sm p-2">{item.text}</p>
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

export function PestleAnalysis() {
    const [title, setTitle] = useLocalStorage('pestle:title', 'My PESTLE Analysis');
    const [political, setPolitical] = useLocalStorage<PestleItem[]>('pestle:political', []);
    const [economic, setEconomic] = useLocalStorage<PestleItem[]>('pestle:economic', []);
    const [social, setSocial] = useLocalStorage<PestleItem[]>('pestle:social', []);
    const [technological, setTechnological] = useLocalStorage<PestleItem[]>('pestle:technological', []);
    const [legal, setLegal] = useLocalStorage<PestleItem[]>('pestle:legal', []);
    const [environmental, setEnvironmental] = useLocalStorage<PestleItem[]>('pestle:environmental', []);
    const { toast } = useToast();
    const contentRef = useRef<HTMLDivElement>(null);

    const exportToImage = async (format: 'png' | 'pdf') => {
        if (!contentRef.current) return;
        
        const canvas = await html2canvas(contentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        const fileName = `${title.replace(/ /g, '_')}_PESTLE.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your PESTLE analysis has been downloaded as a ${format.toUpperCase()} file.` });
    };
    
    const ExportPreview = () => (
        <div ref={contentRef} className="p-8 bg-background">
            <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
            <div className="grid grid-cols-3 gap-6">
                <PestleColumn title="Political" items={political} setItems={setPolitical} placeholder="" icon={Landmark} className="bg-red-100/30 dark:bg-red-900/30 border-red-500" isReadonly/>
                <PestleColumn title="Economic" items={economic} setItems={setEconomic} placeholder="" icon={DollarSign} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" isReadonly/>
                <PestleColumn title="Social" items={social} setItems={setSocial} placeholder="" icon={Users} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" isReadonly/>
                <PestleColumn title="Technological" items={technological} setItems={setTechnological} placeholder="" icon={Cpu} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" isReadonly/>
                <PestleColumn title="Legal" items={legal} setItems={setLegal} placeholder="" icon={Scale} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" isReadonly/>
                <PestleColumn title="Environmental" items={environmental} setItems={setEnvironmental} placeholder="" icon={Leaf} className="bg-teal-100/30 dark:bg-teal-900/30 border-teal-500" isReadonly/>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
             <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">PESTLE Analysis</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Analyze the macro-environmental factors that impact your organization: Political, Economic, Social, Technological, Legal, and Environmental.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PestleColumn title="Political" items={political} setItems={setPolitical} placeholder="e.g., Government policy..." icon={Landmark} className="bg-red-100/30 dark:bg-red-900/30 border-red-500" />
                <PestleColumn title="Economic" items={economic} setItems={setEconomic} placeholder="e.g., Inflation rates..." icon={DollarSign} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" />
                <PestleColumn title="Social" items={social} setItems={setSocial} placeholder="e.g., Population growth..." icon={Users} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                <PestleColumn title="Technological" items={technological} setItems={setTechnological} placeholder="e.g., New automation..." icon={Cpu} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" />
                <PestleColumn title="Legal" items={legal} setItems={setLegal} placeholder="e.g., Employment laws..." icon={Scale} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                <PestleColumn title="Environmental" items={environmental} setItems={setEnvironmental} placeholder="e.g., Climate change..." icon={Leaf} className="bg-teal-100/30 dark:bg-teal-900/30 border-teal-500" />
            </div>

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
