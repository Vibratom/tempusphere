
'use client';

import { useProductivity, ImageObject } from '@/contexts/ProductivityContext';
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sliders, Layers, Settings, Sun, Type, Crop, Image as ImageIconProp, File } from "lucide-react";
import { ImageEditor } from '../productivity/Image-editor';
import { PageSettings } from '../productivity/Page-settings';


export function RightSidebar() {
    const { canvasState } = useProductivity();
    const { slides, activeSlideId, selectedObjectId } = canvasState;
    const activeSlide = slides.find(s => s.id === activeSlideId);
    const selectedObject = activeSlide?.objects.find(o => o.id === selectedObjectId);

    const selectedImage = selectedObject?.type === 'IMAGE' ? selectedObject as ImageObject : undefined;
    const selectedText = selectedObject?.type === 'TEXT' ? selectedObject : undefined;
    const selectedShape = selectedObject?.type === 'PATH' ? selectedObject : undefined;

    return (
        <Tabs defaultValue="properties" className="h-full w-full flex flex-col">
            <CardHeader className="p-0">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="properties"><Sliders className="mr-2"/>Properties</TabsTrigger>
                    <TabsTrigger value="layers"><Layers className="mr-2"/>Layers</TabsTrigger>
                    <TabsTrigger value="page"><File className="mr-2"/>Page</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="properties" className="flex-1 overflow-auto">
                 <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIconProp/> Image Properties</CardTitle></CardHeader>
                            <CardContent className="p-0">
                                 <ImageEditor selectedImage={selectedImage} disabled={!selectedImage} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Type/> Text Properties</CardTitle></CardHeader>
                            <CardContent>
                                <Label className="text-muted-foreground">{selectedText ? "Editing Text" : "Select a text element to see properties."}</Label>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crop/> Shape Properties</CardTitle></CardHeader>
                            <CardContent>
                                 <Label className="text-muted-foreground">{selectedShape ? "Editing Shape" : "Select a shape to see properties."}</Label>
                            </CardContent>
                        </Card>
                    </div>
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
