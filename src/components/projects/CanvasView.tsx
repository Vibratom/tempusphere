
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Brush, Eraser, Palette, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

type Tool = 'pencil' | 'eraser';

const colors = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e',
];

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [savedCanvas, setSavedCanvas] = useLocalStorage<string | null>('projects:drawingCanvas', null);
  const [isClient, setIsClient] = useState(false);
  
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsClient(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && savedCanvas) {
        const image = new Image();
        image.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0);
        };
        image.src = savedCanvas;
      }
    }
  }, [savedCanvas]);
  
  const getCoords = (e: React.MouseEvent): [number, number] => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale;
      const y = (e.clientY - rect.top - pan.y) / scale;
      return [x, y];
  }

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const [x, y] = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'pencil' ? color : '#FFFFFF'; // Eraser is just a white brush
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if(tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const [x, y] = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      setSavedCanvas(canvas.toDataURL());
    }
  };
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSavedCanvas(null);
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
      setScale(s => direction === 'in' ? Math.min(s * 1.1, 5) : Math.max(s / 1.1, 0.2));
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full flex flex-col" style={{height: '800px'}}>
        <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md">
                <Button variant={tool === 'pencil' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('pencil')} className="h-9 w-9"><Brush/></Button>
                <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')} className="h-9 w-9"><Eraser/></Button>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: color }} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                            {colors.map(c => (
                                <button key={c} onClick={() => setColor(c)} className={cn("w-6 h-6 rounded-full border hover:scale-110 transition-transform", c === color && 'ring-2 ring-ring ring-offset-2 ring-offset-background') } style={{ backgroundColor: c }}/>
                            ))}
                        </div>
                    </PopoverContent>
                 </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Palette/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                        <Slider value={[lineWidth]} onValueChange={(v) => setLineWidth(v[0])} min={1} max={50} step={1}/>
                    </PopoverContent>
                 </Popover>
                <Button variant="ghost" size="icon" onClick={handleClear} className="h-9 w-9 text-destructive"><Trash2/></Button>
            </div>
            
             <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <Button variant="outline" size="icon" onClick={() => handleZoom('in')} className="h-9 w-9"><ZoomIn/></Button>
                <Button variant="outline" size="icon" onClick={() => handleZoom('out')} className="h-9 w-9"><ZoomOut/></Button>
             </div>
            
            <div 
              className="flex-1 w-full h-full bg-card cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            >
              <canvas
                ref={canvasRef}
                width={1200}
                height={780}
                className="w-full h-full"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transformOrigin: 'top left'
                }}
              />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    