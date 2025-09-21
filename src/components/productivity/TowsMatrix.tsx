
'use client';

import React, { useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, File as FileIcon } from 'lucide-react';
import { Input } from '../ui/input';

interface SwotItem {
  id: string;
  text: string;
}

const ReadonlySwotList = ({ title, items, className }: { title: string, items: SwotItem[], className?: string }) => (
    <div className={className}>
        <h3 className="font-bold mb-2 text-center">{title}</h3>
        <Card className="bg-muted/30 h-full">
            <CardContent className="p-2">
                <ScrollArea className="h-40">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {items.length > 0 ? items.map(item => <li key={item.id}>{item.text}</li>) : <li>No items yet.</li>}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
);

const StrategyQuadrant = ({ title, description, value, onChange, isReadonly = false }: { title: string, description: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, isReadonly?: boolean }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Textarea
                value={value}
                onChange={onChange}
                rows={6}
                placeholder={`List your "${title}" strategies here...`}
                readOnly={isReadonly}
                className={isReadonly ? 'bg-muted/50 border-none' : ''}
            />
        </CardContent>
    </Card>
);

export function TowsMatrix() {
    const [title, setTitle] = useLocalStorage('tows:title', 'My TOWS Matrix');
    const [strengths] = useLocalStorage<SwotItem[]>('swot:strengths', []);
    const [weaknesses] = useLocalStorage<SwotItem[]>('swot:weaknesses', []);
    const [opportunities] = useLocalStorage<SwotItem[]>('swot:opportunities', []);
    const [threats] = useLocalStorage<SwotItem[]>('swot:threats', []);

    const [soStrategies, setSoStrategies] = useLocalStorage('tows:so_strategies', '');
    const [stStrategies, setStStrategies] = useLocalStorage('tows:st_strategies', '');
    const [woStrategies, setWoStrategies] = useLocalStorage('tows:wo_strategies', '');
    const [wtStrategies, setWtStrategies] = useLocalStorage('tows:wt_strategies', '');
    
    const { toast } = useToast();
    const contentRef = useRef<HTMLDivElement>(null);

    const exportToImage = async (format: 'png' | 'pdf') => {
        if (!contentRef.current) return;
        
        const canvas = await html2canvas(contentRef.current, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        });
        
        if (canvas.width === 0 || canvas.height === 0) {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not capture the content to export.' });
            return;
        }

        const fileName = `${title.replace(/ /g, '_')}_TOWS_Matrix.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your TOWS Matrix has been downloaded as a ${format.toUpperCase()} file.` });
    };
    
    const ExportPreview = () => (
         <div ref={contentRef} className="p-8 bg-background">
            <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
                <ReadonlySwotList title="Strengths" items={strengths} className="bg-green-100/30 dark:bg-green-900/30 p-2 rounded-lg" />
                <ReadonlySwotList title="Weaknesses" items={weaknesses} className="bg-red-100/30 dark:bg-red-900/30 p-2 rounded-lg" />
                <ReadonlySwotList title="Opportunities" items={opportunities} className="bg-blue-100/30 dark:bg-blue-900/30 p-2 rounded-lg" />
                <ReadonlySwotList title="Threats" items={threats} className="bg-yellow-100/30 dark:bg-yellow-900/30 p-2 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                 <StrategyQuadrant title="Strengths-Opportunities (SO)" description="" value={soStrategies} onChange={()=>{}} isReadonly />
                 <StrategyQuadrant title="Strengths-Threats (ST)" description="" value={stStrategies} onChange={()=>{}} isReadonly />
                 <StrategyQuadrant title="Weaknesses-Opportunities (WO)" description="" value={woStrategies} onChange={()=>{}} isReadonly />
                 <StrategyQuadrant title="Weaknesses-Threats (WT)" description="" value={wtStrategies} onChange={()=>{}} isReadonly />
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">TOWS Matrix</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Develop strategic options by matching internal strengths and weaknesses with external opportunities and threats from your SWOT analysis.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
                <ReadonlySwotList title="Strengths" items={strengths} className="bg-green-100/30 dark:bg-green-900/30 p-2 rounded-lg" />
                <ReadonlySwotList title="Weaknesses" items={weaknesses} className="bg-red-100/30 dark:bg-red-900/30 p-2 rounded-lg" />
                <ReadonlySwotList title="Opportunities" items={opportunities} className="bg-blue-100/30 dark:bg-blue-900/30 p-2 rounded-lg" />
                <ReadonlySwotList title="Threats" items={threats} className="bg-yellow-100/30 dark:bg-yellow-900/30 p-2 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StrategyQuadrant
                    title="Strengths-Opportunities (SO)"
                    description="How can you use your strengths to take advantage of opportunities?"
                    value={soStrategies}
                    onChange={(e) => setSoStrategies(e.target.value)}
                />
                <StrategyQuadrant
                    title="Strengths-Threats (ST)"
                    description="How can you use your strengths to avoid or mitigate real and potential threats?"
                    value={stStrategies}
                    onChange={(e) => setStStrategies(e.target.value)}
                />
                <StrategyQuadrant
                    title="Weaknesses-Opportunities (WO)"
                    description="How can you use opportunities to overcome the weaknesses you are experiencing?"
                    value={woStrategies}
                    onChange={(e) => setWoStrategies(e.target.value)}
                />
                 <StrategyQuadrant
                    title="Weaknesses-Threats (WT)"
                    description="How can you minimize your weaknesses and avoid threats?"
                    value={wtStrategies}
                    onChange={(e) => setWtStrategies(e.target.value)}
                />
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
