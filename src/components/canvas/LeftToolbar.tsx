
'use client';

import { Button } from "../ui/button";
import { MousePointer, Crop, Type, Upload, Image as ImageIcon, Palette, Shapes, Pencil, Hand, Frame, LayoutTemplate } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { useProductivity } from "@/contexts/ProductivityContext";
import { useEffect, useState } from "react";

const mainTools = [
    { id: 'select', icon: MousePointer, label: 'Select Tool (V)' },
    { id: 'hand', icon: Hand, label: 'Hand Tool (H)' },
    { id: 'crop', icon: Crop, label: 'Crop Tool (C)' },
    { id: 'text', icon: Type, label: 'Text Tool (T)' },
    { id: 'draw', icon: Pencil, label: 'Draw Tool (B)' },
    { id: 'shape', icon: Shapes, label: 'Shape Tool (U)' },
    { id: 'frame', icon: Frame, label: 'Frame Tool (F)' },
];

const assetTools = [
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'branding', icon: Palette, label: 'Branding' },
]

export function LeftToolbar() {
    const { canvasState, setCanvasState } = useProductivity();
    const [isClient, setIsClient] = useState(false);
    const activeTool = canvasState.tool;
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleToolChange = (toolId: any) => {
        setCanvasState(prev => ({...prev, tool: toolId}));
    }
    
    if (!isClient) {
        return (
            <div className="w-full h-full bg-background border-r flex flex-col items-center py-4 gap-4 md:w-16">
                 <div className="md:hidden p-4 w-full border-b">
                    <h3 className="text-lg font-semibold">Tools & Assets</h3>
                </div>
            </div>
        )
    }

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
                                <Button 
                                  variant={activeTool === tool.id ? 'secondary' : 'ghost'} 
                                  size="icon"
                                  onClick={() => handleToolChange(tool.id)}
                                >
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
