
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { LayoutTemplate, Shapes, Type, Upload, Image as ImageIcon, Palette } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

const toolTabs = [
    { value: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { value: 'elements', icon: Shapes, label: 'Elements' },
    { value: 'text', icon: Type, label: 'Text' },
    { value: 'uploads', icon: Upload, label: 'Uploads' },
    { value: 'photos', icon: ImageIcon, label: 'Photos' },
    { value: 'branding', icon: Palette, label: 'Branding' },
];

export function LeftSidebar() {
    return (
        <div className="h-full bg-background border-r flex">
            <Tabs defaultValue="templates" className="w-full flex" orientation="vertical">
                <TabsList className="h-full flex flex-col justify-start p-2 gap-2 bg-muted/50 rounded-none border-r">
                    {toolTabs.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex flex-col h-16 w-16 gap-1 p-2">
                           <tab.icon className="h-5 w-5" />
                           <span className="text-xs">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                
                <div className="flex-1 p-4">
                    <TabsContent value="templates">
                        <h3 className="font-semibold text-lg mb-4">Templates</h3>
                        <ScrollArea className="h-[calc(100vh-150px)]">
                           <div className="space-y-2">
                                {/* Placeholder for templates */}
                                <Card className="h-24 w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">Template 1</Card>
                                <Card className="h-24 w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">Template 2</Card>
                                <Card className="h-24 w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">Template 3</Card>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="elements">
                         <h3 className="font-semibold text-lg mb-4">Elements</h3>
                         {/* Placeholder */}
                    </TabsContent>
                    <TabsContent value="text">
                        <h3 className="font-semibold text-lg mb-4">Text</h3>
                        {/* Placeholder */}
                    </TabsContent>
                     <TabsContent value="uploads">
                        <h3 className="font-semibold text-lg mb-4">Uploads</h3>
                        <Button>Upload Image</Button>
                    </TabsContent>
                    <TabsContent value="photos">
                        <h3 className="font-semibold text-lg mb-4">Photos</h3>
                        {/* Placeholder */}
                    </TabsContent>
                    <TabsContent value="branding">
                        <h3 className="font-semibold text-lg mb-4">Branding</h3>
                        {/* Placeholder */}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
