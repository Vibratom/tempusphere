
'use client';

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { type Tool, type CanvasObject, type TextObject, type PathObject, type Point, PAGE_WIDTH, PAGE_HEIGHT } from '@/app/productivity/page';

// --- Helper Functions ---

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

// --- Main Canvas Component ---

interface CanvasProps {
    objects: CanvasObject[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    selectedObjectId: string | null;
    setObjects: (objects: CanvasObject[]) => void;
    setSelectedObjectId: (id: string | null) => void;
    updateHistory: (objects: CanvasObject[], overwriteLast?: boolean) => void;
    handleUndo: () => void;
    handleRedo: () => void;
    setTool: (tool: Tool) => void;
}

export function Canvas({
    objects,
    tool,
    strokeColor,
    strokeWidth,
    selectedObjectId,
    setObjects,
    setSelectedObjectId,
    updateHistory,
    handleUndo,
    handleRedo,
    setTool
}: CanvasProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [isMoving, setIsMoving] = useState<Point | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    
    const [scale, setScale] = useState(0.5);
    const [viewOffset, setViewOffset] = useState({ x: 50, y: 50 });
    const [isPanning, setIsPanning] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        const cont = containerRef.current;
        if (!cont) return;

        const resizeObserver = new ResizeObserver(() => redrawCanvas());
        resizeObserver.observe(cont);
        
        const canvas = canvasRef.current;
        if(canvas) {
          canvas.width = cont.clientWidth;
          canvas.height = cont.clientHeight;
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
            setObjects([...objects, newPath]);
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
            setObjects(objects.map(obj => {
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
    }, [handleUndo, handleRedo, selectedObjectId, objects, editingTextId, isPanning, updateHistory, setSelectedObjectId]);
    
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
         if (e.key === ' ') {
            setIsPanning(false);
        }
    }, []);

    useEffect(() => {
        const cont = containerRef.current;
        if (!cont) return;
        cont.focus(); // Focus the container to receive key events
        cont.addEventListener('keydown', handleKeyDown);
        cont.addEventListener('keyup', handleKeyUp);
        return () => {
            cont.removeEventListener('keydown', handleKeyDown);
            cont.removeEventListener('keyup', handleKeyUp);
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

    const editingTextObject = editingTextId ? objects.find(o => o.id === editingTextId) as TextObject : null;

    return (
        <div className="w-full h-full relative" ref={containerRef} tabIndex={-1}>
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
    );
}

