
'use client';

import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sliders, Layers, Settings } from "lucide-react";

export function RightSidebar() {
    return (
        <Tabs defaultValue="properties" className="h-full w-full flex flex-col">
            <CardHeader className="p-0">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="properties"><Sliders className="mr-2"/>Properties</TabsTrigger>
                    <TabsTrigger value="layers"><Layers className="mr-2"/>Layers</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="mr-2"/>Settings</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="properties" className="flex-1 overflow-auto">
                 <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Text Properties</CardTitle></CardHeader>
                            <CardContent>
                                <Label className="text-muted-foreground">Select a text element to see properties.</Label>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base">Image Properties</CardTitle></CardHeader>
                            <CardContent>
                                 <Label className="text-muted-foreground">Select an image to see properties.</Label>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base">Shape Properties</CardTitle></CardHeader>
                            <CardContent>
                                 <Label className="text-muted-foreground">Select a shape to see properties.</Label>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="layers" className="flex-1 overflow-auto p-4">
                 <Label className="text-muted-foreground">Layer management will appear here.</Label>
            </TabsContent>
             <TabsContent value="settings" className="flex-1 overflow-auto p-4">
                 <Label className="text-muted-foreground">Document settings will appear here.</Label>
            </TabsContent>
        </Tabs>
    );
}
