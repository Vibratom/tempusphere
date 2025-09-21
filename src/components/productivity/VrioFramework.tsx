
'use client';

import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ImageIcon, File as FileIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '../ui/scroll-area';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

interface VrioResource {
  id: string;
  resource: string;
  value: boolean;
  rarity: boolean;
  imitability: boolean; // Is it costly to imitate?
  organization: boolean;
}

const createNewResource = (): VrioResource => ({
  id: uuidv4(),
  resource: '',
  value: false,
  rarity: false,
  imitability: false,
  organization: false,
});

const getCompetitiveImplication = (resource: VrioResource) => {
    if (!resource.value) return { text: "Competitive Disadvantage", color: "bg-red-500/20 text-red-700 dark:text-red-300" };
    if (!resource.rarity) return { text: "Competitive Parity", color: "bg-gray-500/20 text-gray-700 dark:text-gray-300" };
    if (!resource.imitability) return { text: "Temporary Competitive Advantage", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" };
    if (!resource.organization) return { text: "Unused Competitive Advantage", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" };
    return { text: "Sustained Competitive Advantage", color: "bg-green-500/20 text-green-700 dark:text-green-300" };
};

export function VrioFramework() {
    const [title, setTitle] = useLocalStorage('vrio:title', 'My VRIO Framework');
    const [resources, setResources] = useLocalStorage<VrioResource[]>('vrio:resources', [createNewResource()]);
    const { toast } = useToast();
    const vrioContentRef = useRef<HTMLDivElement>(null);

    const handleResourceChange = (id: string, field: keyof VrioResource, value: string | boolean) => {
        setResources(prev => prev.map(res => res.id === id ? { ...res, [field]: value } : res));
    };

    const addResource = () => {
        setResources(prev => [...prev, createNewResource()]);
    };

    const removeResource = (id: string) => {
        setResources(prev => prev.filter(res => res.id !== id));
    };
    
    const exportToImage = async (format: 'png' | 'pdf') => {
        if (!vrioContentRef.current) return;
        
        const canvas = await html2canvas(vrioContentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        const fileName = `${title.replace(/ /g, '_')}_VRIO.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your VRIO analysis has been downloaded as a ${format.toUpperCase()} file.` });
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div ref={vrioContentRef} className="p-4 bg-background">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">VRIO Framework</h1>
                    <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                        Evaluate your organization's resources and capabilities to identify sources of sustained competitive advantage.
                    </p>
                </div>
                
                <Card className="my-6">
                    <CardHeader className="items-center">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea>
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30%]">Resource/Capability</TableHead>
                                        <TableHead className="text-center">Valuable?</TableHead>
                                        <TableHead className="text-center">Rare?</TableHead>
                                        <TableHead className="text-center">Costly to Imitate?</TableHead>
                                        <TableHead className="text-center">Organized to Capture Value?</TableHead>
                                        <TableHead className="w-[20%]">Competitive Implication</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resources.map(resource => {
                                        const implication = getCompetitiveImplication(resource);
                                        return (
                                            <TableRow key={resource.id}>
                                                <TableCell>
                                                    <Input 
                                                        value={resource.resource} 
                                                        onChange={e => handleResourceChange(resource.id, 'resource', e.target.value)}
                                                        placeholder="e.g., Strong brand recognition"
                                                        className="border-none focus-visible:ring-0 p-0 h-auto"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center"><Checkbox checked={resource.value} onCheckedChange={v => handleResourceChange(resource.id, 'value', v as boolean)}/></TableCell>
                                                <TableCell className="text-center"><Checkbox checked={resource.rarity} onCheckedChange={v => handleResourceChange(resource.id, 'rarity', v as boolean)}/></TableCell>
                                                <TableCell className="text-center"><Checkbox checked={resource.imitability} onCheckedChange={v => handleResourceChange(resource.id, 'imitability', v as boolean)}/></TableCell>
                                                <TableCell className="text-center"><Checkbox checked={resource.organization} onCheckedChange={v => handleResourceChange(resource.id, 'organization', v as boolean)}/></TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${implication.color}`}>
                                                        {implication.text}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeResource(resource.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        <div className="mt-4">
                            <Button variant="outline" onClick={addResource}>
                                <Plus className="mr-2 h-4 w-4" /> Add Resource
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <CardFooter className="border-t pt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => exportToImage('png')}><ImageIcon className="mr-2 h-4 w-4" /> Export as PNG</Button>
                <Button variant="outline" onClick={() => exportToImage('pdf')}><FileIcon className="mr-2 h-4 w-4" /> Export as PDF</Button>
            </CardFooter>
        </div>
    );
}
