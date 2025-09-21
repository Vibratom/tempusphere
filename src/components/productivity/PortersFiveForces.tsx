
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Users, Briefcase, GitBranch, Handshake, Replace, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

interface PorterItem {
  id: string;
  text: string;
}

const createNewItem = (text = ''): PorterItem => ({ id: uuidv4(), text });

const PorterColumn = ({ title, items, setItems, placeholder, className, icon: Icon }: { title: string, items: PorterItem[], setItems: React.Dispatch<React.SetStateAction<PorterItem[]>>, placeholder: string, className?: string, icon: React.ElementType }) => {
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
                    <div className="space-y-2 p-2 rounded-md min-h-[100px] flex-1">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                                <Input value={item.text} onChange={e => updateItem(item.id, e.target.value)} className="border-none focus-visible:ring-0" />
                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
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

export function PortersFiveForces() {
    const [title, setTitle] = useLocalStorage("porters:title", "My Porter's Five Forces Analysis");
    const [newEntrants, setNewEntrants] = useLocalStorage<PorterItem[]>("porters:newEntrants", []);
    const [buyerPower, setBuyerPower] = useLocalStorage<PorterItem[]>("porters:buyerPower", []);
    const [supplierPower, setSupplierPower] = useLocalStorage<PorterItem[]>("porters:supplierPower", []);
    const [substitutes, setSubstitutes] = useLocalStorage<PorterItem[]>("porters:substitutes", []);
    const [rivalry, setRivalry] = useLocalStorage<PorterItem[]>("porters:rivalry", []);
    const { toast } = useToast();
    const contentRef = useRef<HTMLDivElement>(null);

    const exportToImage = async (format: 'png' | 'pdf') => {
        if (!contentRef.current) return;
        
        const canvas = await html2canvas(contentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        const fileName = `${title.replace(/ /g, '_')}_Porters5Forces.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your analysis has been downloaded as a ${format.toUpperCase()} file.` });
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Porter's Five Forces</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Analyze the competitive landscape and industry structure to identify strategic insights.
                </p>
            </div>
            
            <div ref={contentRef} className="p-4 bg-background">
                <Card className="my-6">
                    <CardHeader className="items-center">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PorterColumn title="Threat of New Entrants" items={newEntrants} setItems={setNewEntrants} placeholder="e.g., Barriers to entry..." icon={Briefcase} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" />
                    <PorterColumn title="Bargaining Power of Buyers" items={buyerPower} setItems={setBuyerPower} placeholder="e.g., Number of customers..." icon={Users} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" />
                    <PorterColumn title="Bargaining Power of Suppliers" items={supplierPower} setItems={setSupplierPower} placeholder="e.g., Number of suppliers..." icon={Handshake} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" />
                    <PorterColumn title="Threat of Substitutes" items={substitutes} setItems={setSubstitutes} placeholder="e.g., Substitute performance..." icon={Replace} className="bg-orange-100/30 dark:bg-orange-900/30 border-orange-500" />
                    <PorterColumn title="Rivalry Among Competitors" items={rivalry} setItems={setRivalry} placeholder="e.g., Number of competitors..." icon={GitBranch} className="bg-red-100/30 dark:bg-red-900/30 border-red-500 lg:col-span-1" />
                </div>
            </div>
            <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportToImage('png')}><ImageIcon className="mr-2 h-4 w-4" /> Export as PNG</Button>
                <Button variant="outline" onClick={() => exportToImage('pdf')}><FileIcon className="mr-2 h-4 w-4" /> Export as PDF</Button>
            </CardFooter>
        </div>
    );
}
