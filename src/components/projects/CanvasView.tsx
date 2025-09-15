
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Brush, Eraser, Palette, Trash2, MousePointer, Upload, Square, BringToFront, SendToBack, Layers } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types for our canvas objects
type CanvasObject = PathObject | ImageObject;

interface BaseObject {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface PathObject extends BaseObject {
  type: 'path';
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

interface ImageObject extends BaseObject {
  type: 'image';
  image: HTMLImageElement;
  width: number;
  height: number;
}

type Tool = 'select' | 'pencil';

const colors = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e',
];

// Re-serialize objects for localStorage by converting images to data URLs
const serializeObjects = (objects: CanvasObject[]): any[] => {
    return objects.map(obj => {
        if (obj.type === 'image') {
            const { image, ...rest } = obj;
            return { ...rest, type: 'image', src: image.src };
        }
        return obj;
    });
};

// De-serialize objects from localStorage by creating Image elements
const deserializeObjects = (serialized: any[]): Promise<CanvasObject[]> => {
    const promises = serialized.map(obj => {
        if (obj.type === 'image' && obj.src) {
            return new Promise<CanvasObject>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    resolve({ ...obj, image: img });
                };
                img.onerror = () => {
                    // If image fails, resolve with a placeholder-like object or null
                    resolve({ ...obj, image: new Image(100, 100) }); 
                }
                img.src = obj.src;
            });
        }
        return Promise.resolve(obj as CanvasObject);
    });
    return Promise.all(promises);
};


export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [savedObjects, setSavedObjects] = useLocalStorage<any[]>('projects:canvasObjects-v1', []);
  
  const [tool, setTool] = useState<Tool>('select');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isClient, setIsClient] = useState(false);

  // Load objects from localStorage on initial mount
  useEffect(() => {
    setIsClient(true);
    if(savedObjects.length > 0) {
        deserializeObjects(savedObjects).then(loadedObjects => {
            setObjects(loadedObjects);
        });
    }
  }, []);

  // Redraw canvas whenever objects change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
        ctx.save();
        ctx.translate(obj.x, obj.y);

        if (obj.type === 'path') {
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = obj.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            if (obj.points.length > 0) {
              ctx.moveTo(obj.points[0].x, obj.points[0].y);
              obj.points.forEach(p => ctx.lineTo(p.x, p.y));
              ctx.stroke();
            }
        } else if (obj.type === 'image') {
            ctx.drawImage(obj.image, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        }

        ctx.restore();
    });
    
    // Draw selection box
    const selectedObject = objects.find(o => o.id === selectedObjectId);
    if(selectedObject) {
      ctx.save();
      ctx.translate(selectedObject.x, selectedObject.y);
      ctx.strokeStyle = '#09f';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      if(selectedObject.type === 'path') {
         const bounds = getPathBounds(selectedObject.points);
         ctx.strokeRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
      } else if (selectedObject.type === 'image') {
         ctx.strokeRect(-selectedObject.width/2, -selectedObject.height/2, selectedObject.width, selectedObject.height);
      }
      ctx.restore();
    }
    
    // Save to localStorage after drawing
    if(isClient) {
      setSavedObjects(serializeObjects(objects));
    }
  }, [objects, selectedObjectId, isClient, setSavedObjects]);
  
  const getPathBounds = (points: {x:number, y:number}[]) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach(p => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
      });
      return {minX, minY, maxX, maxY};
  }
  
  const getCoords = (e: React.MouseEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      return { x, y };
  }
  
  const getObjectAtPosition = (x: number, y: number): CanvasObject | null => {
      // Iterate backwards to select top-most object
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.type === 'path') {
            const bounds = getPathBounds(obj.points);
            if (x >= obj.x + bounds.minX && x <= obj.x + bounds.maxX && y >= obj.y + bounds.minY && y <= obj.y + bounds.maxY) {
                return obj;
            }
        } else if (obj.type === 'image') {
            if (x >= obj.x - obj.width/2 && x <= obj.x + obj.width/2 && y >= obj.y - obj.height/2 && y <= obj.y + obj.height/2) {
                return obj;
            }
        }
      }
      return null;
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCoords(e);
    
    if (tool === 'pencil') {
      setIsDrawing(true);
      const newPath: PathObject = {
        id: uuidv4(),
        type: 'path',
        points: [{ x: 0, y: 0 }],
        color,
        lineWidth,
        x: x,
        y: y,
        rotation: 0,
        scale: 1,
      };
      setObjects(prev => [...prev, newPath]);
      setSelectedObjectId(newPath.id);
    } else if (tool === 'select') {
        const clickedObject = getObjectAtPosition(x, y);
        setSelectedObjectId(clickedObject?.id || null);
        if(clickedObject) {
            setIsDragging(true);
            setDragStart({ x: x - clickedObject.x, y: y - clickedObject.y });
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCoords(e);
    if (isDrawing && tool === 'pencil') {
      setObjects(prev => prev.map(obj => {
        if (obj.id === selectedObjectId && obj.type === 'path') {
          return {
            ...obj,
            points: [...obj.points, { x: x - obj.x, y: y - obj.y }],
          };
        }
        return obj;
      }));
    } else if (isDragging && tool === 'select' && selectedObjectId) {
        setObjects(prev => prev.map(obj => {
            if(obj.id === selectedObjectId) {
                return { ...obj, x: x - dragStart.x, y: y - dragStart.y };
            }
            return obj;
        }));
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };
  
  const handleClear = () => {
    setObjects([]);
    setSelectedObjectId(null);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const newImage: ImageObject = {
                  id: uuidv4(),
                  type: 'image',
                  image: img,
                  x: canvasRef.current!.width / 2,
                  y: canvasRef.current!.height / 2,
                  width: img.width,
                  height: img.height,
                  rotation: 0,
                  scale: 1,
              };
              setObjects(prev => [...prev, newImage]);
              setSelectedObjectId(newImage.id);
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  }
  
  const handleDeleteSelected = () => {
    if(!selectedObjectId) return;
    setObjects(prev => prev.filter(o => o.id !== selectedObjectId));
    setSelectedObjectId(null);
  }
  
  const moveLayer = (direction: 'front' | 'back') => {
      if(!selectedObjectId) return;
      const index = objects.findIndex(o => o.id === selectedObjectId);
      if(index === -1) return;
      
      const newObjects = [...objects];
      const [item] = newObjects.splice(index, 1);
      
      if(direction === 'front') {
          newObjects.push(item);
      } else {
          newObjects.unshift(item);
      }
      setObjects(newObjects);
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full flex flex-col" style={{ height: '800px' }}>
        <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md flex-wrap">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} className="h-9 w-9"><MousePointer/></Button>
                <Button variant={tool === 'pencil' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('pencil')} className="h-9 w-9"><Brush/></Button>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: color }} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                            {colors.map(c => <button key={c} onClick={() => setColor(c)} className={cn("w-6 h-6 rounded-full border hover:scale-110 transition-transform", c === color && 'ring-2 ring-ring ring-offset-2 ring-offset-background')} style={{ backgroundColor: c }}/>)}
                        </div>
                    </PopoverContent>
                 </Popover>
                 <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9"><Palette/></Button></PopoverTrigger>
                    <PopoverContent className="w-48 p-2"><Slider value={[lineWidth]} onValueChange={(v) => setLineWidth(v[0])} min={1} max={50} step={1}/></PopoverContent>
                 </Popover>
                <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <Button asChild variant="ghost" size="icon" className="h-9 w-9"><label htmlFor="image-upload" className="cursor-pointer"><Upload/></label></Button>
                <Button variant="ghost" size="icon" onClick={handleClear} className="h-9 w-9 text-destructive"><Trash2/></Button>
            </div>
            
             {selectedObjectId && (
                <div className="absolute top-2 right-2 z-10 bg-background/80 border rounded-lg p-1 flex flex-col gap-1 items-center shadow-md">
                     <Button variant="ghost" size="icon" onClick={() => moveLayer('front')} className="h-9 w-9"><BringToFront/></Button>
                     <Button variant="ghost" size="icon" onClick={() => moveLayer('back')} className="h-9 w-9"><SendToBack/></Button>
                     <Button variant="ghost" size="icon" onClick={handleDeleteSelected} className="h-9 w-9 text-destructive"><Square/></Button>
                </div>
             )}
            
            <div 
              className="flex-1 w-full h-full bg-card"
              style={{ cursor: tool === 'pencil' ? 'crosshair' : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={1200}
                height={780}
                className="w-full h-full"
              />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
