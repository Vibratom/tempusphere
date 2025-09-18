
'use client';

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { ZoomIn, ZoomOut, Save } from "lucide-react";

export function StatusBar() {
    return (
        <div className="h-10 bg-background border-t px-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Save className="h-4 w-4"/>
                <span>All changes saved locally</span>
            </div>
            <div className="flex items-center gap-2 w-48">
                <Button variant="ghost" size="icon" className="h-7 w-7"><ZoomOut /></Button>
                <Slider defaultValue={[100]} max={200} step={10} />
                <Button variant="ghost" size="icon" className="h-7 w-7"><ZoomIn /></Button>
            </div>
        </div>
    );
}
