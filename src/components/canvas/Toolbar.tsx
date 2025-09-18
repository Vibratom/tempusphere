
'use client';

import { Pencil, Eraser, MousePointer, Image as ImageIcon, Text, Hand, Download, LayoutTemplate, ArrowUp, ArrowDown, Trash2, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { v4 as uuidv4 } from 'uuid';
import { type Tool, type CanvasObject, type ImageObject } from '@/app/productivity/page';

const colors = ['#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

interface ToolbarProps {
    tool: Tool;
    setTool: (tool: Tool) => void;
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    selectedObjectId: string | null;
    setIsTemplateDialogOpen: (isOpen: boolean) => void;
    updateHistory: (objects: CanvasObject[], overwriteLast?: boolean) => void;
    objects: CanvasObject[];
    setSelectedObjectId: (id: string | null) => void;
    handleUndo: () => void;
    handleRedo: () => void;
}

export function Toolbar({
    tool,
    setTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    selectedObjectId,
    setIsTemplateDialogOpen,
    updateHistory,
    objects,
    setSelectedObjectId,
    handleUndo,
    handleRedo
}: ToolbarProps) {

    const bringToFront = () => {
        if (!selectedObjectId) return;
        const newObjects = [...objects.filter(o => o.id !== selectedObjectId), objects.find(o => o.id === selectedObjectId)!];
        updateHistory(newObjects);
    }

    const sendToBack = () => {
        if (!selectedObjectId) return;
        const newObjects = [objects.find(o => o.id === selectedObjectId)!, ...objects.filter(o => o.id !== selectedObjectId)];
        updateHistory(newObjects);
    }

     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const newImage: ImageObject = {
                        id: uuidv4(), type: 'IMAGE', x: 50, y: 50,
                        width: img.width, height: img.height, data: img.src
                    };
                    updateHistory([...objects, newImage]);
                }
                img.src = event.target?.result as string;
            }
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="w-full flex-shrink-0 bg-background border-b p-2 flex items-center justify-between gap-2 z-20">
            <div className="flex gap-1 items-center">
                 <Button variant="outline" size="sm" onClick={() => setIsTemplateDialogOpen(true)}><LayoutTemplate className="mr-2"/>Templates</Button>
                 <div className="w-[1px] h-6 bg-border mx-1"></div>
                 <Button variant="ghost" size="icon" onClick={handleUndo}><Undo /></Button>
                 <Button variant="ghost" size="icon" onClick={handleRedo}><Redo /></Button>
                 <div className="w-[1px] h-6 bg-border mx-1"></div>
                 <Button variant={tool === 'SELECT' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('SELECT')}><MousePointer /></Button>
                 <Button variant={tool === 'PENCIL' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('PENCIL')}><Pencil /></Button>
                 <Button variant={tool === 'TEXT' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('TEXT')}><Text /></Button>
                 <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 <Button asChild variant="ghost" size="icon"><label htmlFor="image-upload"><ImageIcon /></label></Button>
                 <div className="w-[1px] h-6 bg-border mx-1"></div>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon"><div className="w-5 h-5 rounded-full border" style={{ backgroundColor: strokeColor }}></div></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2"><div className="grid grid-cols-6 gap-1">{colors.map(c => <Button key={c} size="icon" variant="ghost" className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} onClick={() => setStrokeColor(c)} />)}</div></PopoverContent>
                </Popover>
                <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={50} step={1} className="w-24" />
            </div>

            {selectedObjectId && (
                <div className="flex gap-1 items-center">
                    <Button variant="ghost" size="icon" onClick={bringToFront}><ArrowUp /></Button>
                    <Button variant="ghost" size="icon" onClick={sendToBack}><ArrowDown /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { updateHistory(objects.filter(o => o.id !== selectedObjectId)); setSelectedObjectId(null); }}><Trash2/></Button>
                </div>
            )}
        </div>
    )
}
