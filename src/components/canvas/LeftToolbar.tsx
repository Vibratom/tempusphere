
'use client';

import { Button } from "../ui/button";
import { MousePointer, Crop, Type, Upload, Image as ImageIcon, Palette, Shapes, Pencil, Hand, Frame, LayoutTemplate } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { SheetHeader, SheetTitle } from "../ui/sheet";

const mainTools = [
    { id: 'select', icon: MousePointer, label: 'Select Tool (V)' },
    { id: 'crop', icon: Crop, label: 'Crop Tool (C)' },
    { id: 'text', icon: Type, label: 'Text Tool (T)' },
    { id: 'shape', icon: Shapes, label: 'Shape Tool (U)' },
    { id: 'draw', icon: Pencil, label: 'Draw Tool (B)' },
    { id: 'frame', icon: Frame, label: 'Frame Tool (F)' },
    { id: 'hand', icon: Hand, label: 'Hand Tool (H)' },
];

const assetTools = [
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'branding', icon: Palette, label: 'Branding' },
]

export function LeftToolbar() {
    return (
        <div className="w-full h-full bg-background border-r flex flex-col items-center py-4 gap-4 md:w-16">
             <div className="md:hidden p-4 w-full border-b">
                <h3 className="text-lg font-semibold">Tools & Assets</h3>
            </div>
            <TooltipProvider>
                 <div className="flex md:flex-col gap-2 flex-wrap justify-center p-2 md:p-0">
                    {mainTools.map(tool => (
                        <Tooltip key={tool.id}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <tool.icon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>{tool.label}</p></TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                 <div className="mt-auto flex md:flex-col gap-2 flex-wrap justify-center p-2 md:p-0">
                     {assetTools.map(tool => (
                        <Tooltip key={tool.id}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <tool.icon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>{tool.label}</p></TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </div>
    );
}
