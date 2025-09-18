
'use client';

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useProductivity, CanvasObject, TextObject } from '@/contexts/ProductivityContext';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '../ui/input';

// --- Types ---
interface Point { x: number; y: number; }

// --- Constants ---
const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 792; 

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

// --- Main Component ---

export function Canvas() {
    const { canvasState, setCanvasState } = useProductivity();
    const { slides, activeSlideId, selectedObjectId, tool, strokeColor, strokeWidth, scale, viewOffset } = canvasState;
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
                 img.onload = () => redrawCanvas();
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
        // Event handling logic will be added here
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Event handling logic will be added here
    };

    const handleMouseUp = () => {
        // Event handling logic will be added here
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        // Event handling logic will be added here
    }
    
    const handleWheel = (e: React.WheelEvent) => {
        // Event handling logic will be added here
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
