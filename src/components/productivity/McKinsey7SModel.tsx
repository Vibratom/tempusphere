
'use client';

import React, { useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Target, Network, Cog, Gem, Users, User, Brain, ImageIcon, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

const ElementCard = ({ title, description, value, onChange, icon: Icon, className, isCenter = false, isReadonly = false }: { title: string, description: string, value: string, onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, icon: React.ElementType, className?: string, isCenter?: boolean, isReadonly?: boolean }) => {
    return (
        <Card className={cn("flex flex-col", className, isCenter ? "border-primary border-2 shadow-lg" : "")}>
            <CardHeader className="items-center text-center">
                <div className={cn("p-2 rounded-full mb-2", isCenter ? "bg-primary/20" : "bg-muted")}>
                   <Icon className={cn("w-7 h-7", isCenter ? "text-primary" : "text-muted-foreground")} />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                 {isReadonly ? (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground p-2">{value || `Notes on ${title}...`}</p>
                 ) : (
                    <Textarea
                        value={value}
                        onChange={onChange}
                        rows={isCenter ? 8 : 6}
                        placeholder={`Notes on ${title}...`}
                        className="w-full h-full resize-none"
                    />
                 )}
            </CardContent>
        </Card>
    );
};


export function McKinsey7SModel() {
    const [title, setTitle] = useLocalStorage('mckinsey:title', 'My McKinsey 7-S Analysis');
    const [strategy, setStrategy] = useLocalStorage('mckinsey:strategy', '');
    const [structure, setStructure] = useLocalStorage('mckinsey:structure', '');
    const [systems, setSystems] = useLocalStorage('mckinsey:systems', '');
    const [sharedValues, setSharedValues] = useLocalStorage('mckinsey:sharedValues', '');
    const [style, setStyle] = useLocalStorage('mckinsey:style', '');
    const [staff, setStaff] = useLocalStorage('mckinsey:staff', '');
    const [skills, setSkills] = useLocalStorage('mckinsey:skills', '');
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

        const fileName = `${title.replace(/ /g, '_')}_7S_Model.${format}`;
        
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

        toast({ title: 'Export Successful', description: `Your 7-S Model has been downloaded as a ${format.toUpperCase()} file.` });
    };

    const ExportPreview = () => (
        <div ref={contentRef} className="p-8 bg-background">
             <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
             <div className="grid grid-cols-3 gap-6 items-center">
                <ElementCard title="Strategy" description="" value={strategy} icon={Target} className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500" isReadonly/>
                <ElementCard title="Structure" description="" value={structure} icon={Network} className="bg-green-100/30 dark:bg-green-900/30 border-green-500" isReadonly/>
                <ElementCard title="Systems" description="" value={systems} icon={Cog} className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500" isReadonly/>
                <ElementCard title="Style" description="" value={style} icon={User} className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500" isReadonly/>
                <ElementCard title="Shared Values" description="" value={sharedValues} icon={Gem} isCenter={true} isReadonly/>
                <ElementCard title="Staff" description="" value={staff} icon={Users} className="bg-orange-100/30 dark:bg-orange-900/30 border-orange-500" isReadonly/>
                <div className="md:col-start-2"><ElementCard title="Skills" description="" value={skills} icon={Brain} className="bg-red-100/30 dark:bg-red-900/30 border-red-500" isReadonly/></div>
            </div>
        </div>
    );

    
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">McKinsey 7-S Model</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    Analyze organizational effectiveness through the seven interconnected elements: Strategy, Structure, Systems, Shared Values, Style, Staff, and Skills.
                </p>
            </div>
            
            <Card>
                <CardHeader className="items-center">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold text-center border-none focus-visible:ring-0 h-auto p-0 max-w-md"/>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <ElementCard 
                    title="Strategy" 
                    description="The plan to build competitive advantage."
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    icon={Target}
                    className="bg-blue-100/30 dark:bg-blue-900/30 border-blue-500"
                />
                <ElementCard 
                    title="Structure" 
                    description="How the company is organized."
                    value={structure}
                    onChange={(e) => setStructure(e.target.value)}
                    icon={Network}
                    className="bg-green-100/30 dark:bg-green-900/30 border-green-500"
                />
                 <ElementCard 
                    title="Systems" 
                    description="The daily procedures and processes."
                    value={systems}
                    onChange={(e) => setSystems(e.target.value)}
                    icon={Cog}
                    className="bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-500"
                />

                <ElementCard 
                    title="Style" 
                    description="The leadership style."
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    icon={User}
                    className="bg-purple-100/30 dark:bg-purple-900/30 border-purple-500"
                />

                <ElementCard 
                    title="Shared Values" 
                    description="The core values of the company."
                    value={sharedValues}
                    onChange={(e) => setSharedValues(e.target.value)}
                    icon={Gem}
                    isCenter={true}
                />
                <ElementCard 
                    title="Staff" 
                    description="The employees and their capabilities."
                    value={staff}
                    onChange={(e) => setStaff(e.target.value)}
                    icon={Users}
                     className="bg-orange-100/30 dark:bg-orange-900/30 border-orange-500"
                />
                
                <div className="md:col-start-2">
                    <ElementCard 
                        title="Skills" 
                        description="The actual skills and competencies."
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        icon={Brain}
                        className="bg-red-100/30 dark:bg-red-900/30 border-red-500"
                    />
                </div>
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
