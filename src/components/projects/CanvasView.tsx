
'use client';

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Pencil, Eraser, MousePointer, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Text, Hand } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types
type Tool = 'PENCIL' | 'ERASER' | 'TEXT' | 'SELECT';
interface Point { x: number; y: number; }
type Path = Point[];

interface BaseObject {
  id: string;
}

interface PathObject extends BaseObject {
  type: 'PATH';
  path: Path;
  strokeColor: string;
  strokeWidth: number;
  isErasing: boolean;
}

interface ImageObject extends BaseObject {
  type: 'IMAGE';
  x: number;
  y: number;
  width: number;
  height: number;
  data: string; // Base64 image data
}

interface TextObject extends BaseObject {
  type: 'TEXT';
  x: number;
  y: number;
  text: string;
  font: string;
  color: string;
  width: number;
}

type CanvasObject = PathObject | ImageObject | TextObject;
type HistoryEntry = { objects: CanvasObject[] };

const colors = ['#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

const serializeObjects = (objects: CanvasObject[]): string => JSON.stringify(objects);
const deserializeObjects = (json: string): CanvasObject[] => {
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export function CanvasView() {
    const [isClient, setIsClient] = useState(false);
    const [savedObjects, setSavedObjects] = useLocalStorage<string>('canvas:objects-v5', '[]');
    
    const [tool, setTool] = useState<Tool>('PENCIL');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(5);
    
    const [objects, setObjects] = useState<CanvasObject[]>([]);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isMoving, setIsMoving] = useState<Point | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [scale, setScale] = useState(1);
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    // --- Initialization and Persistence ---

    // Load objects from local storage on mount
    useLayoutEffect(() => {
        setIsClient(true);
        const initialObjects = deserializeObjects(savedObjects);
        if (initialObjects.length > 0) {
            setObjects(initialObjects);
            const initialEntry = { objects: initialObjects };
            setHistory([initialEntry]);
            setHistoryIndex(0);
        } else {
             setHistory([{objects: []}]);
             setHistoryIndex(0);
        }
    }, []);

    // Save to local storage whenever objects change
    useEffect(() => {
        if (!isClient || historyIndex < 0) return;
        const currentObjects = history[historyIndex]?.objects;
        if(currentObjects) {
          setSavedObjects(serializeObjects(currentObjects));
        }
    }, [history, historyIndex, isClient, setSavedObjects]);


    const updateHistory = (newObjects: CanvasObject[]) => {
        const newEntry = { objects: newObjects };
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newEntry]);
        setHistoryIndex(newHistory.length);
        setObjects(newObjects);
    };

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setObjects(history[historyIndex - 1].objects);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setObjects(history[historyIndex + 1].objects);
        }
    }, [history, historyIndex]);


    // --- Canvas Drawing and Rendering ---

    const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
        ctx.save();
        ctx.translate(viewOffset.x, viewOffset.y);
        ctx.scale(scale, scale);

        if (obj.type === 'PATH') {
            ctx.beginPath();
            ctx.strokeStyle = obj.strokeColor;
            ctx.lineWidth = obj.strokeWidth;
            ctx.globalCompositeOperation = obj.isErasing ? 'destination-out' : 'source-over';
            obj.path.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        } else if (obj.type === 'IMAGE') {
            const img = new Image();
            img.src = obj.data;
            if (img.complete) {
                ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
            }
        } else if (obj.type === 'TEXT') {
            ctx.font = obj.font;
            ctx.fillStyle = obj.color;
            ctx.textBaseline = 'top';
            ctx.fillText(obj.text, obj.x, obj.y);
        }

        ctx.restore();
    };
    
    const drawSelectionBox = (ctx: CanvasRenderingContext2D, object: CanvasObject) => {
        ctx.save();
        ctx.translate(viewOffset.x, viewOffset.y);
        ctx.scale(scale, scale);
        
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([4 / scale, 2 / scale]);
        
        const bounds = getObjectBounds(object);
        if(bounds) {
             ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        }

        ctx.restore();
    }
    
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        if (document.body.classList.contains('dark')) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        }
        ctx.lineWidth = 1;
        const gridSize = 50 * scale;
        for (let x = viewOffset.x % gridSize; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = viewOffset.y % gridSize; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();


        objects.forEach(obj => drawObject(ctx, obj));
        
        const selectedObject = objects.find(o => o.id === selectedObjectId);
        if (selectedObject) {
            drawSelectionBox(ctx, selectedObject);
        }
    }, [objects, selectedObjectId, scale, viewOffset]);

    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    // Handle canvas resize
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
                redrawCanvas();
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [redrawCanvas]);


    // --- Event Handlers ---
    
    const getCoords = (e: React.MouseEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - viewOffset.x) / scale,
            y: (e.clientY - rect.top - viewOffset.y) / scale
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const pos = getCoords(e);

        if (isPanning || e.button === 1) return;

        if (tool === 'SELECT') {
            const clickedObject = findClickedObject(pos);
            setSelectedObjectId(clickedObject ? clickedObject.id : null);
            if (clickedObject) {
                setIsMoving({x: pos.x - getObjectBounds(clickedObject)!.x, y: pos.y - getObjectBounds(clickedObject)!.y });
            }
        } else if (tool === 'TEXT') {
            const newTextObject: TextObject = {
                id: uuidv4(),
                type: 'TEXT',
                x: pos.x,
                y: pos.y,
                text: 'Hello World',
                font: '20px sans-serif',
                color: strokeColor,
                width: 100 // placeholder
            };
            updateHistory([...objects, newTextObject]);
            setTool('SELECT');
            setSelectedObjectId(newTextObject.id);
            setEditingTextId(newTextObject.id);
        } else { // PENCIL or ERASER
            setIsDrawing(true);
            const newPath: PathObject = {
                id: uuidv4(),
                type: 'PATH',
                path: [pos],
                strokeColor,
                strokeWidth,
                isErasing: tool === 'ERASER',
            };
            setObjects(prev => [...prev, newPath]);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const pos = getCoords(e);
        if (isDrawing) {
            setObjects(prev => prev.map(obj => {
                if (obj.type === 'PATH' && obj.id === prev[prev.length - 1].id) {
                    return { ...obj, path: [...obj.path, pos] };
                }
                return obj;
            }));
        } else if (isMoving && selectedObjectId) {
            setObjects(prev => prev.map(obj => {
                if (obj.id === selectedObjectId) {
                     const newX = pos.x - isMoving.x;
                     const newY = pos.y - isMoving.y;
                     return {...obj, x: newX, y: newY};
                }
                return obj;
            }))
        } else if (isPanning) {
            setViewOffset(prev => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY,
            }));
        }
    };

    const handleMouseUp = () => {
        if (isDrawing) {
            setIsDrawing(false);
            updateHistory(objects);
        }
        if (isMoving) {
            setIsMoving(null);
            updateHistory(objects);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        const pos = getCoords(e);
        const clickedObject = findClickedObject(pos);
        if (clickedObject?.type === 'TEXT') {
            setEditingTextId(clickedObject.id);
        }
    }
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey) { // Zoom
            const zoomIntensity = 0.1;
            const newScale = scale - e.deltaY * zoomIntensity * 0.01;
            setScale(Math.min(Math.max(0.1, newScale), 5));
        } else { // Pan
            setViewOffset(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY,
            }));
        }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if(editingTextId) return;

        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') { e.preventDefault(); handleUndo(); }
            if (e.key === 'y') { e.preventDefault(); handleRedo(); }
        }
        if(e.key === 'Delete' || e.key === 'Backspace') {
            if(selectedObjectId) {
                updateHistory(objects.filter(o => o.id !== selectedObjectId));
                setSelectedObjectId(null);
            }
        }
        if (e.key === ' ') {
            e.preventDefault();
            setIsPanning(true);
        }
    }, [handleUndo, handleRedo, selectedObjectId, objects, editingTextId]);
    
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
         if (e.key === ' ') {
            setIsPanning(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);


    // --- Object Manipulation ---

    const getObjectBounds = (object: CanvasObject): { x: number, y: number, width: number, height: number } | null => {
        if (object.type === 'PATH') {
            if (object.path.length === 0) return null;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            object.path.forEach(p => {
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            });
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }
        return { x: object.x, y: object.y, width: object.width, height: object.height };
    }
    
    const findClickedObject = (pos: Point): CanvasObject | null => {
        // Iterate backwards to select top-most object
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const bounds = getObjectBounds(obj);
            if (bounds && pos.x >= bounds.x && pos.x <= bounds.x + bounds.width && pos.y >= bounds.y && pos.y <= bounds.y + bounds.height) {
                return obj;
            }
        }
        return null;
    };
    
    const bringToFront = () => {
        if (!selectedObjectId) return;
        const newObjects = [...objects.filter(o => o.id !== selectedObjectId), objects.find(o => o.id === selectedObjectId)!];
        updateHistory(newObjects);
    }

    const sendToBack = () => {
        if (!selectedObjectId) return;
        const newObjects = [objects.find(o => o.id === selectedObjectId)!, ...objects.filter(o => o.id !== selectedObjectId)];
        updateHistory(newObjects);
    }
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const newImage: ImageObject = {
                        id: uuidv4(),
                        type: 'IMAGE',
                        x: -viewOffset.x / scale,
                        y: -viewOffset.y / scale,
                        width: img.width,
                        height: img.height,
                        data: img.src
                    };
                    updateHistory([...objects, newImage]);
                }
                img.src = event.target?.result as string;
            }
            reader.readAsDataURL(file);
        }
    };
    
    const handleTextEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingTextId) return;
        const newObjects = objects.map(o => {
            if (o.id === editingTextId && o.type === 'TEXT') {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                let width = o.width;
                if(ctx) {
                    ctx.font = o.font;
                    width = ctx.measureText(e.target.value).width;
                }
                return { ...o, text: e.target.value, width };
            }
            return o;
        });
        setObjects(newObjects);
    }

    const stopEditingText = () => {
        updateHistory(objects);
        setEditingTextId(null);
    }
    
    const editingTextObject = editingTextId ? objects.find(o => o.id === editingTextId) as TextObject : null;
    
    if (!isClient) {
        return <div className="w-full h-full bg-muted animate-pulse"></div>;
    }

    return (
        <div className="w-full h-full flex items-center justify-center" ref={containerRef} tabIndex={-1}>
            <Card className="w-full flex flex-col" style={{ height: '800px' }}>
                <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
                    <div className="absolute top-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md flex-wrap">
                        <Button variant={tool === 'SELECT' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('SELECT')}><MousePointer /></Button>
                        <Button variant={tool === 'PENCIL' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('PENCIL')}><Pencil /></Button>
                        <Button variant={tool === 'ERASER' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('ERASER')}><Eraser /></Button>
                        <Button variant={tool === 'TEXT' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('TEXT')}><Text /></Button>
                        <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <Button asChild variant="ghost" size="icon"><label htmlFor="image-upload"><ImageIcon /></label></Button>
                        <div className="w-[1px] h-6 bg-border mx-1"></div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: strokeColor }}></div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                                <div className="grid grid-cols-6 gap-1">
                                    {colors.map(c => <Button key={c} size="icon" variant="ghost" className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} onClick={() => setStrokeColor(c)} />)}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={50} step={1} className="w-24" />
                        <div className="w-[1px] h-6 bg-border mx-1"></div>
                        <Button variant="ghost" onClick={() => updateHistory([])}><Trash2 className="mr-2"/>Clear All</Button>
                    </div>

                    {selectedObjectId && (
                         <div className="absolute top-2 right-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md">
                            <Button variant="ghost" size="icon" onClick={bringToFront}><ArrowUp /></Button>
                            <Button variant="ghost" size="icon" onClick={sendToBack}><ArrowDown /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { updateHistory(objects.filter(o => o.id !== selectedObjectId)); setSelectedObjectId(null); }}><Trash2/></Button>
                         </div>
                    )}
                    
                     <canvas
                        ref={canvasRef}
                        className={cn('flex-1 w-full h-full', {
                            'cursor-crosshair': tool === 'PENCIL' || tool === 'ERASER',
                            'cursor-text': tool === 'TEXT',
                            'cursor-grab': isPanning,
                        })}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseOut={handleMouseUp}
                        onDoubleClick={handleDoubleClick}
                        onWheel={handleWheel}
                    />

                    {editingTextObject && (
                        <Input
                            ref={textInputRef}
                            type="text"
                            value={editingTextObject.text}
                            onChange={handleTextEdit}
                            onBlur={stopEditingText}
                            onKeyDown={(e) => e.key === 'Enter' && stopEditingText()}
                            className="absolute z-20"
                            style={{
                                left: (editingTextObject.x * scale) + viewOffset.x,
                                top: (editingTextObject.y * scale) + viewOffset.y,
                                font: editingTextObject.font,
                                color: editingTextObject.color,
                                width: editingTextObject.width * scale + 20,
                                background: 'rgba(255, 255, 255, 0.8)',
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
