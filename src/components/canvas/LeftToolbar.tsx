
'use client';

import { Button } from "../ui/button";
import { MousePointer, Crop, Type, Upload, Image as ImageIcon, Palette, Shapes, Pencil, Hand, Frame } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

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
    { id: 'templates', icon: Image, label: 'Templates' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'branding', icon: Palette, label: 'Branding' },
]

export function LeftToolbar() {
    return (
        <div className="w-16 bg-background border-r flex flex-col items-center py-4 gap-4">
            <TooltipProvider>
                <div className="flex flex-col gap-2">
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
                 <div className="mt-auto flex flex-col gap-2">
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
