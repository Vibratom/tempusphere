

'use client';

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Pencil, Eraser, MousePointer, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Text, Hand, Download, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';

// --- Types ---

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

interface Template {
    name: string;
    description: string;
    objects: Omit<CanvasObject, 'id'>[];
}


// --- Constants ---

const colors = ['#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 792; // 8.5x11 at 144 DPI is 1224x1584, this is a landscape A4-ish ratio

const templates: Template[] = [
  {
    name: 'Title & Subtitle',
    description: 'A classic starting slide for a presentation.',
    objects: [
      { type: 'TEXT', text: 'Click to edit Title', font: 'bold 72px sans-serif', color: '#000000', x: 100, y: 250, width: 0 },
      { type: 'TEXT', text: 'Click to edit subtitle', font: '36px sans-serif', color: '#333333', x: 100, y: 350, width: 0 },
    ],
  },
  {
    name: 'Two Columns with Image',
    description: 'A versatile layout for showcasing an image and text.',
    objects: [
      { type: 'TEXT', text: 'Heading', font: 'bold 48px sans-serif', color: '#000000', x: 50, y: 50, width: 0 },
      { type: 'TEXT', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.', font: '24px sans-serif', color: '#333333', x: 50, y: 120, width: 0 },
      { type: 'IMAGE', data: 'https://picsum.photos/seed/canvas1/500/500', x: 650, y: 150, width: 500, height: 500 },
    ],
  },
  {
    name: 'Blank Canvas',
    description: 'Start from scratch with a clean, empty page.',
    objects: [],
  }
];

// --- Helper Functions ---

const serializeObjects = (objects: CanvasObject[]): string => JSON.stringify(objects);
const deserializeObjects = (json: string): CanvasObject[] => {
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

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

// --- Main Component ---

export function CanvasView() {
    const [isClient, setIsClient] = useState(false);
    const [savedObjects, setSavedObjects] = useLocalStorage<string>('canvas:objects-v6', '[]');
    
    const [tool, setTool] = useState<Tool>('SELECT');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(5);
    
    const [objects, setObjects] = useState<CanvasObject[]>([]);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isMoving, setIsMoving] = useState<Point | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [scale, setScale] = useState(0.5);
    const [viewOffset, setViewOffset] = useState({ x: 50, y: 50 });
    const [isPanning, setIsPanning] = useState(false);

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [exportTransparentBg, setExportTransparentBg] = useState(true);
    const [exportBgColor, setExportBgColor] = useState('#ffffff');
    const { toast } = useToast();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    // --- Initialization and Persistence ---

    useLayoutEffect(() => {
        setIsClient(true);
        const initialObjects = deserializeObjects(savedObjects);
        setObjects(initialObjects);
        const initialEntry = { objects: initialObjects };
        setHistory([initialEntry]);
        setHistoryIndex(0);
    }, []);

    useEffect(() => {
        if (!isClient || historyIndex < 0) return;
        const currentObjects = history[historyIndex]?.objects;
        if(currentObjects) {
          setSavedObjects(serializeObjects(currentObjects));
        }
    }, [history, historyIndex, isClient, setSavedObjects]);


    const updateHistory = (newObjects: CanvasObject[], overwriteLast = false) => {
        const newEntry = { objects: newObjects };
        let newHistory;
        let newIndex;
        if (overwriteLast && historyIndex > -1) {
            newHistory = [...history.slice(0, historyIndex), newEntry];
            newIndex = historyIndex;
        } else {
            newHistory = [...history.slice(0, historyIndex + 1), newEntry];
            newIndex = newHistory.length - 1;
        }
        setHistory(newHistory);
        setHistoryIndex(newIndex);
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

    const applyTemplate = (template: Template) => {
      const newObjects = template.objects.map(obj => ({
        ...obj,
        id: uuidv4(),
      }));
      updateHistory(newObjects);
      setIsTemplateDialogOpen(false);
    }
    
    // --- Canvas Drawing and Rendering ---

    const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
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
            } else {
                 img.onload = () => redrawCanvas(); // Redraw when image loads
            }
        } else if (obj.type === 'TEXT') {
            ctx.font = obj.font;
            ctx.fillStyle = obj.color;
            ctx.textBaseline = 'top';
            ctx.fillText(obj.text, obj.x, obj.y);
        }
    };
    
    const drawSelectionBox = (ctx: CanvasRenderingContext2D, object: CanvasObject) => {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([4 / scale, 2 / scale]);
        
        const bounds = getObjectBounds(object);
        if(bounds) {
             ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        }
    }
    
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(viewOffset.x, viewOffset.y);
        ctx.scale(scale, scale);

        // Draw page background
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        ctx.shadowColor = 'transparent';

        objects.forEach(obj => drawObject(ctx, obj));
        
        const selectedObject = objects.find(o => o.id === selectedObjectId);
        if (selectedObject) {
            drawSelectionBox(ctx, selectedObject);
        }
        ctx.restore();

    }, [objects, selectedObjectId, scale, viewOffset]);

    useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => redrawCanvas());
        resizeObserver.observe(container);
        
        const canvas = canvasRef.current;
        if(canvas) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }

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
        if (e.button === 1 || isPanning) { // Middle mouse button or spacebar panning
            setIsPanning(true);
            return;
        }

        let pos = getCoords(e);
        if (tool === 'SELECT') {
            const clickedObject = findClickedObject(pos);
            setSelectedObjectId(clickedObject ? clickedObject.id : null);
            if (clickedObject) {
                const bounds = getObjectBounds(clickedObject)!;
                setIsMoving({x: pos.x - bounds.x, y: pos.y - bounds.y });
            }
        } else if (tool === 'TEXT') {
            const newTextObject: TextObject = {
                id: uuidv4(),
                type: 'TEXT',
                x: pos.x,
                y: pos.y,
                text: 'New Text',
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
        if (isPanning) {
            setViewOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
            return;
        }
        
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
        }
    };

    const handleMouseUp = () => {
        if (isPanning) setIsPanning(false);
        if (isDrawing) {
            setIsDrawing(false);
            updateHistory(objects, true); // Overwrite the last history entry with the final path
        }
        if (isMoving) {
            setIsMoving(null);
            updateHistory(objects, true);
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
        const rect = canvasRef.current!.getBoundingClientRect();
        const scroll = e.deltaY * -0.001;
        
        // Zoom relative to mouse position
        const newScale = Math.min(Math.max(0.1, scale + scroll), 5);
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mousePointTo = {
          x: (mouseX - viewOffset.x) / scale,
          y: (mouseY - viewOffset.y) / scale,
        };

        setViewOffset({
          x: mouseX - mousePointTo.x * newScale,
          y: mouseY - mousePointTo.y * newScale,
        });

        setScale(newScale);
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
        if (e.key === ' ' && !isPanning) {
            e.preventDefault();
            setIsPanning(true);
        }
    }, [handleUndo, handleRedo, selectedObjectId, objects, editingTextId, isPanning]);
    
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
         if (e.key === ' ') {
            setIsPanning(false);
        }
    }, []);

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;
        container.addEventListener('keydown', handleKeyDown);
        container.addEventListener('keyup', handleKeyUp);
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            container.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);


    // --- Object & Action Handlers ---

    const findClickedObject = (pos: Point): CanvasObject | null => {
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
                        id: uuidv4(), type: 'IMAGE', x: 50, y: 50,
                        width: img.width, height: img.height, data: img.src
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
        setObjects(newObjects); // Live update without history
    }

    const stopEditingText = () => {
        if(editingTextId) {
            updateHistory(objects, true); // Create history entry on blur
            setEditingTextId(null);
        }
    }

    const handleExportPNG = async () => { /* ... (omitted for brevity) */ };
    
    const editingTextObject = editingTextId ? objects.find(o => o.id === editingTextId) as TextObject : null;
    
    if (!isClient) return <div className="w-full h-full bg-muted animate-pulse"></div>;

    return (
        <div className="w-full h-full flex flex-col gap-4" tabIndex={0} ref={canvasContainerRef}>
            <Card>
                <CardHeader>
                    <CardTitle>Design Canvas</CardTitle>
                    <CardDescription>A Canva-like tool for creating designs. Start with a template or a blank page.</CardDescription>
                </CardHeader>
            </Card>

            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Choose a Template</DialogTitle>
                  <DialogDescription>Select a starting point for your design or begin with a blank canvas.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  {templates.map(template => (
                    <Card key={template.name} className="cursor-pointer hover:shadow-md hover:border-primary" onClick={() => applyTemplate(template)}>
                      <CardHeader>
                        <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center text-xs text-muted-foreground">{template.name}</div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <div className="w-full flex-1 relative bg-muted/50 overflow-hidden border rounded-lg">
                {objects.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
                        <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold">Start your design journey</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm">Choose a template to get started, or add elements from the toolbar to create something from scratch.</p>
                        <Button size="lg" onClick={() => setIsTemplateDialogOpen(true)}>
                            <LayoutTemplate className="mr-2"/> Create a design
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="absolute top-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setIsTemplateDialogOpen(true)}><LayoutTemplate className="mr-2"/>Templates</Button>
                            <div className="w-[1px] h-6 bg-border mx-1"></div>
                            <Button variant={tool === 'SELECT' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('SELECT')}><MousePointer /></Button>
                            <Button variant={tool === 'PENCIL' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('PENCIL')}><Pencil /></Button>
                            <Button variant={tool === 'TEXT' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('TEXT')}><Text /></Button>
                            <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <Button asChild variant="ghost" size="icon"><label htmlFor="image-upload"><ImageIcon /></label></Button>
                            <div className="w-[1px] h-6 bg-border mx-1"></div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon"><div className="w-5 h-5 rounded-full border" style={{ backgroundColor: strokeColor }}></div></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2"><div className="grid grid-cols-6 gap-1">{colors.map(c => <Button key={c} size="icon" variant="ghost" className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} onClick={() => setStrokeColor(c)} />)}</div></PopoverContent>
                            </Popover>
                            <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={50} step={1} className="w-24" />
                        </div>
                        
                        {selectedObjectId && (
                            <div className="absolute top-2 right-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md">
                                <Button variant="ghost" size="icon" onClick={bringToFront}><ArrowUp /></Button>
                                <Button variant="ghost" size="icon" onClick={sendToBack}><ArrowDown /></Button>
                                <Button variant="ghost" size="icon" onClick={() => { updateHistory(objects.filter(o => o.id !== selectedObjectId)); setSelectedObjectId(null); }}><Trash2/></Button>
                            </div>
                        )}
                    </>
                )}
                
                <canvas
                    ref={canvasRef}
                    className={cn('absolute inset-0', { 'cursor-crosshair': tool === 'PENCIL' || tool === 'ERASER', 'cursor-text': tool === 'TEXT', 'cursor-grab': isPanning, 'cursor-grabbing': isPanning })}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
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
                        className="absolute z-20 bg-white/80"
                        style={{
                            left: (editingTextObject.x * scale) + viewOffset.x,
                            top: (editingTextObject.y * scale) + viewOffset.y,
                            font: editingTextObject.font,
                            color: editingTextObject.color,
                            width: editingTextObject.width * scale + 20,
                            height: 'auto',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
