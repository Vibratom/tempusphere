
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Brush, Eraser, Palette, Trash2, MousePointer, Upload, Square, BringToFront, SendToBack, Layers, Type, ZoomIn, ZoomOut, Grab } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types for our canvas objects
type CanvasObject = PathObject | ImageObject | TextObject;

interface BaseObject {
  id: string;
  x: number;
  y: number;
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

interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  font: string;
  fontSize: number;
  color: string;
  width?: number;
}

type Tool = 'select' | 'pencil' | 'text';

const colors = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e',
];

const serializeObjects = (objects: CanvasObject[]): any[] => {
    return objects.map(obj => {
        if (obj.type === 'image') {
            const { image, ...rest } = obj;
            return { ...rest, type: 'image', src: image.src };
        }
        return obj;
    });
};

const deserializeObjects = (serialized: any[]): Promise<CanvasObject[]> => {
    const promises = serialized.map(obj => {
        if (obj.type === 'image' && obj.src) {
            return new Promise<CanvasObject>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    resolve({ ...obj, image: img } as ImageObject);
                };
                img.onerror = () => {
                    resolve({ ...obj, image: new Image(100, 100) } as ImageObject); 
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [savedObjects, setSavedObjects] = useLocalStorage<any[]>('projects:canvasObjects-v2', []);
  const [history, setHistory] = useState<CanvasObject[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [tool, setTool] = useState<Tool>('select');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isClient, setIsClient] = useState(false);
  const editingInputRef = useRef<HTMLInputElement>(null);
  
  const updateCanvasState = (newObjects: CanvasObject[] | ((prev: CanvasObject[]) => CanvasObject[]), newHistoryEntry = true) => {
    const updatedObjects = typeof newObjects === 'function' ? newObjects(objects) : newObjects;
    setObjects(updatedObjects);

    if (newHistoryEntry) {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, updatedObjects]);
        setHistoryIndex(newHistory.length);
    }
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setObjects(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setObjects(history[newIndex]);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    setIsClient(true);
    if(savedObjects.length > 0) {
        deserializeObjects(savedObjects).then(loadedObjects => {
            updateCanvasState(loadedObjects);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save to local storage effect
  useEffect(() => {
    if (isClient) {
      setSavedObjects(serializeObjects(objects));
    }
  }, [objects, isClient, setSavedObjects]);


  const getCanvasContext = (): CanvasRenderingContext2D | null => {
      const canvas = canvasRef.current;
      return canvas ? canvas.getContext('2d') : null;
  }
  
  // Redraw canvas whenever objects, scale, or offset change
  useEffect(() => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Save context, apply transformations
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(scale, scale);
    
    // Draw grid
    drawGrid(ctx);

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
            ctx.drawImage(obj.image, 0, 0, obj.width, obj.height);
        } else if (obj.type === 'text') {
            if (obj.id !== editingTextId) {
                ctx.font = `${obj.fontSize}px ${obj.font}`;
                ctx.fillStyle = obj.color;
                ctx.textBaseline = 'top';
                ctx.fillText(obj.text, 0, 0);
            }
        }

        ctx.restore();
    });
    
    // Draw selection box
    const selectedObject = objects.find(o => o.id === selectedObjectId);
    if(selectedObject) {
      ctx.save();
      ctx.translate(selectedObject.x, selectedObject.y);
      ctx.strokeStyle = '#09f';
      ctx.lineWidth = 1 / scale;
      ctx.setLineDash([5 / scale, 5 / scale]);
      const bounds = getObjectBounds(selectedObject);
      ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
      ctx.restore();
    }

    // Restore context to pre-transform state
    ctx.restore();
    
  }, [objects, selectedObjectId, editingTextId, scale, viewOffset]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const gridSize = 50;
    const dotRadius = 1;

    ctx.fillStyle = 'hsl(var(--border))';

    const startX = Math.floor(-viewOffset.x / scale / gridSize) * gridSize;
    const startY = Math.floor(-viewOffset.y / scale / gridSize) * gridSize;
    const endX = (canvasWidth - viewOffset.x) / scale;
    const endY = (canvasHeight - viewOffset.y) / scale;

    for (let x = startX; x < endX; x += gridSize) {
        for (let y = startY; y < endY; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius / scale, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
  }


  const getObjectBounds = (obj: CanvasObject): { minX: number, minY: number, width: number, height: number } => {
    if(obj.type === 'path') {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        obj.points.forEach(p => {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        });
        return { minX, minY, width: maxX - minX, height: maxY - minY };
    } else if (obj.type === 'image') {
        return { minX: 0, minY: 0, width: obj.width, height: obj.height };
    } else if (obj.type === 'text') {
        const ctx = getCanvasContext();
        if (ctx) {
            ctx.font = `${obj.fontSize}px ${obj.font}`;
            const metrics = ctx.measureText(obj.text);
            return { minX: 0, minY: 0, width: metrics.width, height: obj.fontSize };
        }
        return { minX: 0, minY: 0, width: obj.text.length * (obj.fontSize / 2), height: obj.fontSize };
    }
    return { minX: 0, minY: 0, width: 0, height: 0 };
  }
  
  const getCoords = (e: React.MouseEvent | React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left - viewOffset.x) / scale;
      const y = (clientY - rect.top - viewOffset.y) / scale;
      return { x, y };
  }
  
  const getObjectAtPosition = (x: number, y: number): CanvasObject | null => {
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const bounds = getObjectBounds(obj);
        if (x >= obj.x + bounds.minX && x <= obj.x + bounds.minX + bounds.width && 
            y >= obj.y + bounds.minY && y <= obj.y + bounds.minY + bounds.height) {
            return obj;
        }
      }
      return null;
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCoords(e);
    
    if (isPanning) {
        setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
        return;
    }

    if (editingTextId) {
        const clickedObject = getObjectAtPosition(x, y);
        if (clickedObject?.id !== editingTextId) {
            setEditingTextId(null);
        }
        return;
    }

    if (tool === 'pencil') {
      setIsDrawing(true);
      const newPath: PathObject = {
        id: uuidv4(),
        type: 'path',
        points: [],
        color,
        lineWidth,
        x: 0, 
        y: 0,
      };

      const pathWithStartPoint: PathObject = {
          ...newPath,
          points: [{ x: x, y: y }],
          x: 0,
          y: 0,
      }
      // Re-center the path
      const bounds = getObjectBounds(pathWithStartPoint);
      pathWithStartPoint.x = bounds.minX;
      pathWithStartPoint.y = bounds.minY;
      pathWithStartPoint.points = pathWithStartPoint.points.map(p => ({ x: p.x - bounds.minX, y: p.y - bounds.minY }));

      updateCanvasState(prev => [...prev, pathWithStartPoint]);
      setSelectedObjectId(pathWithStartPoint.id);
    } else if (tool === 'select') {
        const clickedObject = getObjectAtPosition(x, y);
        setSelectedObjectId(clickedObject?.id || null);
        if(clickedObject) {
            setIsDragging(true);
            setDragStart({ x: x - clickedObject.x, y: y - clickedObject.y });
        }
    } else if (tool === 'text') {
        const newText: TextObject = {
            id: uuidv4(),
            type: 'text',
            text: 'Hello World',
            x,
            y,
            font: 'Arial',
            fontSize: 24,
            color,
        };
        updateCanvasState(prev => [...prev, newText]);
        setSelectedObjectId(newText.id);
        setTool('select');
        setEditingTextId(newText.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCoords(e);

    if (isPanning) {
        setViewOffset({
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y,
        });
        return;
    }

    if (isDrawing && tool === 'pencil') {
      updateCanvasState(prev => prev.map(obj => {
        if (obj.id === selectedObjectId && obj.type === 'path') {
            const newPoints = [...obj.points, { x: x - obj.x, y: y - obj.y }];
            return { ...obj, points: newPoints };
        }
        return obj;
      }), false);
    } else if (isDragging && tool === 'select' && selectedObjectId) {
        updateCanvasState(prev => prev.map(obj => {
            if(obj.id === selectedObjectId) {
                return { ...obj, x: x - dragStart.x, y: y - dragStart.y };
            }
            return obj;
        }), false);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing || isDragging) {
        const currentPath = objects.find(o => o.id === selectedObjectId);
        if (currentPath && currentPath.type === 'path' && currentPath.points.length > 1) {
             updateCanvasState(prev => prev.map(obj => {
                if (obj.id === selectedObjectId && obj.type === 'path') {
                    const bounds = getObjectBounds(obj);
                    return {
                        ...obj,
                        x: obj.x + bounds.minX,
                        y: obj.y + bounds.minY,
                        points: obj.points.map(p => ({ x: p.x - bounds.minX, y: p.y - bounds.minY }))
                    };
                }
                return obj;
            }));
        } else {
             // Create history entry on mouse up for non-path or short-path objects
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, objects]);
            setHistoryIndex(newHistory.length);
        }
    }
    setIsDrawing(false);
    setIsDragging(false);
    setIsPanning(false);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
      const { x, y } = getCoords(e);
      const clickedObject = getObjectAtPosition(x,y);
      if(clickedObject?.type === 'text') {
          setEditingTextId(clickedObject.id);
          setSelectedObjectId(clickedObject.id);
      }
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      setIsPanning(true);
    }
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            handleUndo();
        } else if (e.key === 'y') {
            e.preventDefault();
            handleRedo();
        }
    }
  }, [handleUndo, handleRedo]);
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
        e.preventDefault();
        setIsPanning(false);
    }
  }, []);

  useEffect(() => {
    const cont = containerRef.current;
    cont?.addEventListener('keydown', handleKeyDown);
    cont?.addEventListener('keyup', handleKeyUp);
    return () => {
        cont?.removeEventListener('keydown', handleKeyDown);
        cont?.removeEventListener('keyup', handleKeyUp);
    }
  }, [handleKeyDown, handleKeyUp]);
  
  const handleClear = () => {
    updateCanvasState([]);
    setSelectedObjectId(null);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const {x, y} = getCoords(e as any); // Bit of a hack for coords
              const newImage: ImageObject = {
                  id: uuidv4(),
                  type: 'image',
                  image: img,
                  x,
                  y,
                  width: img.width,
                  height: img.height,
              };
              updateCanvasState(prev => [...prev, newImage]);
              setSelectedObjectId(newImage.id);
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  }
  
  const handleDeleteSelected = () => {
    if(!selectedObjectId) return;
    updateCanvasState(objects.filter(o => o.id !== selectedObjectId));
    setSelectedObjectId(null);
  }
  
  const moveLayer = (direction: 'front' | 'back') => {
      if(!selectedObjectId) return;
      const index = objects.findIndex(o => o.id === selectedObjectId);
      if(index === -1) return;
      
      const newObjects = [...objects];
      const [item] = newObjects.splice(index, 1);
      
      if(direction === 'front') {
          if (index < newObjects.length) {
            newObjects.splice(index + 1, 0, item);
          } else {
            newObjects.push(item);
          }
      } else {
          if (index > 0) {
            newObjects.splice(index - 1, 0, item);
          } else {
            newObjects.unshift(item);
          }
      }
      updateCanvasState(newObjects);
  }

  useEffect(() => {
    if (editingTextId && editingInputRef.current) {
        editingInputRef.current.focus();
    }
  }, [editingTextId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(!editingTextId) return;
      const newObjects = objects.map(obj => {
          if (obj.id === editingTextId && obj.type === 'text') {
              return { ...obj, text: e.target.value };
          }
          return obj;
      });
      updateCanvasState(newObjects, false);
  }

  const handleTextEditBlur = () => {
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, objects]);
      setHistoryIndex(newHistory.length);
      setEditingTextId(null);
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const newScale = scale - e.deltaY * zoomIntensity * 0.1;
        setScale(Math.min(Math.max(0.1, newScale), 10));
    }
  }

  const editingTextObject = editingTextId ? objects.find(o => o.id === editingTextId) as TextObject : null;

  return (
    <div className="w-full h-full flex items-center justify-center" ref={containerRef} tabIndex={-1}>
      <Card className="w-full flex flex-col" style={{ height: '800px' }}>
        <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md flex-wrap">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} className="h-9 w-9"><MousePointer/></Button>
                <Button variant={tool === 'pencil' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('pencil')} className="h-9 w-9"><Brush/></Button>
                <Button variant={tool === 'text' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('text')} className="h-9 w-9"><Type/></Button>
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
                     <Button variant="ghost" size="icon" onClick={handleDeleteSelected} className="h-9 w-9 text-destructive"><Trash2/></Button>
                </div>
             )}

             <div className="absolute bottom-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md">
                <Button variant="ghost" size="icon" onClick={() => setScale(s => s - 0.1)} className="h-9 w-9"><ZoomOut/></Button>
                <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={() => setScale(s => s + 0.1)} className="h-9 w-9"><ZoomIn/></Button>
             </div>
            
            <div 
              className="flex-1 w-full h-full bg-card relative"
              style={{ cursor: isPanning ? 'grabbing' : (tool === 'pencil' ? 'crosshair' : (tool === 'text' ? 'text' : 'default')) }}
              onWheel={handleWheel}
            >
              <canvas
                ref={canvasRef}
                width={1200}
                height={780}
                className="w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
              />
              {editingTextObject && (
                  <input
                    ref={editingInputRef}
                    type="text"
                    value={editingTextObject.text}
                    onChange={handleTextChange}
                    onBlur={handleTextEditBlur}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleTextEditBlur()}}
                    style={{
                        position: 'absolute',
                        left: `${(editingTextObject.x * scale) + viewOffset.x}px`,
                        top: `${(editingTextObject.y * scale) + viewOffset.y}px`,
                        font: `${editingTextObject.fontSize * scale}px ${editingTextObject.font}`,
                        color: editingTextObject.color,
                        background: 'transparent',
                        border: '1px dashed #09f',
                        outline: 'none',
                        zIndex: 100,
                        transformOrigin: 'top left',
                    }}
                  />
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
