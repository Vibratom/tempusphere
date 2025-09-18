
'use client';

import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Label } from "../ui/label";

export function RightSidebar() {
    return (
        <ScrollArea className="h-full bg-background border-l p-4">
            <h3 className="font-semibold text-lg mb-4">Properties</h3>
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
                    <CardHeader><CardTitle className="text-base">Layers</CardTitle></CardHeader>
                    <CardContent>
                         <Label className="text-muted-foreground">Select an element to manage layers.</Label>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
}
