
'use client';

import { useProductivity, ImageObject } from '@/contexts/ProductivityContext';
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sliders, Layers, File } from "lucide-react";
import { ImageEditor } from '../productivity/Image-editor';
import { PageSettings } from '../productivity/Page-settings';


export function RightSidebar() {
    const { canvasState } = useProductivity();
    const { slides, activeSlideId, selectedObjectId } = canvasState;
    const activeSlide = slides.find(s => s.id === activeSlideId);
    const selectedObject = activeSlide?.objects.find(o => o.id === selectedObjectId);

    const selectedImage = selectedObject?.type === 'IMAGE' ? selectedObject as ImageObject : undefined;

    return (
        <Tabs defaultValue="properties" className="h-full w-full flex flex-col">
            <div className="p-0 border-b">
                <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent p-0">
                    <TabsTrigger value="properties" className="py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none -mb-px"><Sliders className="mr-2"/>Properties</TabsTrigger>
                    <TabsTrigger value="layers" className="py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none -mb-px"><Layers className="mr-2"/>Layers</TabsTrigger>
                    <TabsTrigger value="page" className="py-2.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none -mb-px"><File className="mr-2"/>Page</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="properties" className="flex-1 overflow-auto">
                 <ScrollArea className="h-full">
                    <ImageEditor selectedImage={selectedImage} disabled={!selectedImage} />
                 </ScrollArea>
            </TabsContent>
            <TabsContent value="layers" className="flex-1 overflow-auto p-4">
                 <Label className="text-muted-foreground">Layer management will appear here.</Label>
            </TabsContent>
             <TabsContent value="page" className="flex-1 overflow-auto">
                <PageSettings />
            </TabsContent>
        </Tabs>
    );
}
