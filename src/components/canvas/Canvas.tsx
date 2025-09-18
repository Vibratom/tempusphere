
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProductivity, CanvasObject, TextObject, ImageObject, PathObject } from '@/contexts/ProductivityContext';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '../ui/input';

// --- Types ---
interface Point { x: number; y: number; }

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

const applyFilterIntensity = (filterValue: string = 'none', intensity: number = 100): string => {
    if (filterValue === 'none') return 'none';
    const ratio = intensity / 100;
    return filterValue.replace(/([a-zA-Z-]+)\(([^)]+)\)/g, (match, func, val) => {
        const num = parseFloat(val);
        const unit = val.replace(String(num), '');
        if (['hue-rotate'].includes(func)) {
            return `${func}(${(num * ratio).toFixed(2)}${unit})`;
        }
        if (['brightness', 'contrast', 'saturate', 'opacity'].includes(func)) {
            const scaledValue = 100 + (num - 100) * ratio;
            return `${func}(${scaledValue.toFixed(2)}%)`;
        }
        return `${func}(${(num * ratio).toFixed(2)}${unit})`;
    });
};

// --- Main Component ---

export function Canvas() {
    const { canvasState, setCanvasState } = useProductivity();
    const { slides, activeSlideId, selectedObjectId, tool, strokeColor, strokeWidth, scale, viewOffset, page } = canvasState;
    const activeSlide = slides.find(s => s.id === activeSlideId);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [isMoving, setIsMoving] = useState<Point | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    const objects = activeSlide?.objects || [];
    const history = activeSlide?.history || [];
    const historyIndex = activeSlide?.historyIndex || 0;

    // --- History Management ---
    const updateHistory = (newObjects: CanvasObject[], overwriteLast = false) => {
        if (!activeSlideId) return;

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
        
        setCanvasState(prev => ({
            ...prev,
            slides: prev.slides.map(slide => 
                slide.id === activeSlideId 
                ? { ...slide, objects: newObjects, history: newHistory, historyIndex: newIndex }
                : slide
            )
        }));
    };
    
    // --- Canvas Drawing and Rendering ---

    const drawObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
        ctx.save();
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

            const appliedFilter = applyFilterIntensity(obj.activeFilter, obj.filterIntensity);
            ctx.filter = `${appliedFilter !== 'none' ? appliedFilter : ''} brightness(${obj.brightness || 100}%) contrast(${obj.contrast || 100}%) saturate(${obj.saturation || 100}%) hue-rotate(${obj.hue || 0}deg) blur(${obj.blur || 0}px)`.trim();
            
            ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
            ctx.rotate((obj.rotation || 0) * Math.PI / 180);
            ctx.scale(obj.scaleX || 1, obj.scaleY || 1);
            
            if (img.complete) {
                ctx.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            } else {
                 img.onload = () => redrawCanvas();
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
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([4 / scale, 2 / scale]);
        
        const bounds = getObjectBounds(object);
        if(bounds) {
             ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        }
        ctx.setLineDash([]);
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

        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, 0, page.width, page.height);
        ctx.shadowColor = 'transparent';

        objects.forEach(obj => drawObject(ctx, obj));
        
        const selectedObject = objects.find(o => o.id === selectedObjectId);
        if (selectedObject) {
            drawSelectionBox(ctx, selectedObject);
        }
        ctx.restore();

    }, [objects, selectedObjectId, scale, viewOffset, page]);

    useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            const canvas = canvasRef.current;
            if(canvas) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
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
        if (tool === 'hand' || e.button === 1) { // Middle mouse or Hand tool
            setIsPanning(true);
            return;
        }

        if (tool === 'select') {
            const clickedObject = findClickedObject(pos);
            setCanvasState(prev => ({...prev, selectedObjectId: clickedObject ? clickedObject.id : null}));
            if (clickedObject && (clickedObject.type === 'IMAGE' || clickedObject.type === 'TEXT')) {
                setIsMoving({x: pos.x - clickedObject.x, y: pos.y - clickedObject.y });
            }
        } else if (tool === 'text') {
            // Logic to be added
        } else { // Pencil or Eraser
            setIsDrawing(true);
            const newObjects = [...objects, { id: uuidv4(), type: 'PATH', path: [pos], strokeColor, strokeWidth, isErasing: tool === 'draw' ? false : true } as PathObject];
            updateHistory(newObjects, false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const pos = getCoords(e);
        if (isPanning) {
            setCanvasState(prev => ({ ...prev, viewOffset: { x: prev.viewOffset.x + e.movementX, y: prev.viewOffset.y + e.movementY }}));
            return;
        }

        if (isDrawing) {
            const newObjects = objects.map((obj, index) => {
                if (index === objects.length - 1 && obj.type === 'PATH') {
                    return { ...obj, path: [...obj.path, pos] };
                }
                return obj;
            });
            // Update without history for performance
            setCanvasState(prev => ({ ...prev, slides: prev.slides.map(s => s.id === activeSlideId ? {...s, objects: newObjects} : s)}));

        } else if (isMoving && selectedObjectId) {
            const newObjects = objects.map(obj => {
                if (obj.id === selectedObjectId && (obj.type === 'IMAGE' || obj.type === 'TEXT')) {
                     return {...obj, x: pos.x - isMoving.x, y: pos.y - isMoving.y};
                }
                return obj;
            })
            setCanvasState(prev => ({ ...prev, slides: prev.slides.map(s => s.id === activeSlideId ? {...s, objects: newObjects} : s)}));
        }
    };

    const handleMouseUp = () => {
        if (isPanning) setIsPanning(false);
        if (isDrawing) {
            setIsDrawing(false);
            updateHistory(objects); // Finalize history entry
        }
        if (isMoving) {
            setIsMoving(null);
            updateHistory(objects);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        // Event handling logic will be added here
    }
    
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const scroll = e.deltaY * -0.001;
            setCanvasState(prev => ({ ...prev, scale: Math.min(Math.max(0.1, prev.scale + scroll), 5) }));
        }
    };

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
    
    const editingTextObject = editingTextId ? objects.find(o => o.id === editingTextId) as TextObject : null;

    return (
        <div 
          ref={canvasContainerRef}
          className="w-full h-full relative"
          tabIndex={-1}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
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
                    // onChange={handleTextEdit}
                    // onBlur={stopEditingText}
                    // onKeyDown={(e) => e.key === 'Enter' && stopEditingText()}
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

    