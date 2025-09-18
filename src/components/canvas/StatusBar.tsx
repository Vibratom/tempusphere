
'use client';

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { ZoomIn, ZoomOut, Save, Maximize } from "lucide-react";
import { useProductivity } from "@/contexts/ProductivityContext";

export function StatusBar() {
    const { canvasState, setCanvasState } = useProductivity();
    const { scale } = canvasState;

    const handleZoom = (newScale: number) => {
        setCanvasState(prev => ({...prev, scale: Math.min(Math.max(0.1, newScale), 5) }));
    };
    
    const handleZoomIn = () => handleZoom(scale * 1.2);
    const handleZoomOut = () => handleZoom(scale / 1.2);

    const fitToScreen = () => {
         setCanvasState(prev => ({
            ...prev,
            scale: 0.5, // Reset to a reasonable default
            viewOffset: { x: 50, y: 50 } // Center it
        }));
    }

    return (
        <div className="h-10 bg-background border-t px-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Save className="h-4 w-4"/>
                <span>All changes saved locally</span>
            </div>
            <div className="flex items-center gap-2 w-48">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}><ZoomOut /></Button>
                <Slider value={[scale * 100]} onValueChange={(v) => handleZoom(v[0] / 100)} max={200} step={10} />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}><ZoomIn /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fitToScreen}><Maximize /></Button>
            </div>
        </div>
    );
}
