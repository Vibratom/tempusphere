
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { motion, useMotionValue } from 'framer-motion';
import { X, Palette, Download, Upload, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Line {
  id: string;
  from: string;
  to: string;
}

interface MindMapData {
    nodes: Node[];
    lines: Line[];
}

const colors = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

const defaultColor = 'hsl(var(--card))';
const darkAwareDefaultColor = '#ffffff';
const GRID_SIZE = 20;

export function MindMapView() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('mindmap:nodes-v3', []);
  const [lines, setLines] = useLocalStorage<Line[]>('mindmap:lines-v3', []);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.mindmap-node')) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.round((e.clientX - rect.left - 75) / GRID_SIZE) * GRID_SIZE;
    const y = Math.round((e.clientY - rect.top - 50) / GRID_SIZE) * GRID_SIZE;

    const newNode: Node = {
      id: uuidv4(),
      text: 'New Idea',
      x,
      y,
      width: 150,
      height: 70,
      color: darkAwareDefaultColor,
    };
    setNodes([...nodes, newNode]);
    setEditingNodeId(newNode.id);
  };
  
  const handleNodeChange = (id: string, newText: string) => {
    setNodes(nodes.map(node => (node.id === id ? { ...node, text: newText } : node)));
  };
  
  const setNodeColor = (id: string, color: string) => {
    setNodes(nodes.map(node => (node.id === id ? { ...node, color } : node)));
  };

  const stopEditing = () => {
    setEditingNodeId(null);
  };
  
  const deleteNode = (id: string) => {
    const nodesToDelete = new Set<string>([id]);
    
    // Also delete children recursively, optional based on desired behavior
    const findChildren = (parentId: string) => {
      const children = lines.filter(l => l.from === parentId).map(l => l.to);
      children.forEach(childId => {
        if (!nodesToDelete.has(childId)) {
          nodesToDelete.add(childId);
          findChildren(childId);
        }
      });
    };
    findChildren(id);
    
    setNodes(nodes.filter(node => !nodesToDelete.has(node.id)));
    setLines(lines.filter(line => !nodesToDelete.has(line.from) && !nodesToDelete.has(line.to)));
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if(isConnecting) {
       const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }
  
  const handleMouseUpOnNode = (e: React.MouseEvent, nodeId?: string) => {
    if (isConnecting && nodeId && isConnecting !== nodeId) {
        if(!lines.some(l => (l.from === isConnecting && l.to === nodeId) || (l.from === nodeId && l.to === isConnecting))) {
            const newLine: Line = {
                id: uuidv4(),
                from: isConnecting,
                to: nodeId,
            };
            setLines([...lines, newLine]);
        }
    }
    setIsConnecting(null);
  }

  const handleCanvasMouseUp = () => {
      setIsConnecting(null);
  }
  
  const getConnectorPosition = (node: Node, side: 'top' | 'bottom' | 'left' | 'right') => {
      if (!node) return { x: 0, y: 0 };
      switch(side) {
          case 'top': return { x: node.x + node.width / 2, y: node.y };
          case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
          case 'left': return { x: node.x, y: node.y + node.height / 2 };
          case 'right': return { x: node.x + node.width, y: node.y + node.height };
      }
  }
  
  const handleExportJson = () => {
    const data: MindMapData = { nodes, lines };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mind-map.json';
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Mind Map Saved", description: "Your mind map has been downloaded as a .json file." });
  };
  
  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as MindMapData;
        if (data.nodes && data.lines) {
          setNodes(data.nodes);
          setLines(data.lines);
          toast({ title: "Mind Map Loaded", description: "Successfully loaded your mind map from file." });
        } else {
          throw new Error("Invalid mind map file format.");
        }
      } catch (error) {
        toast({ variant: 'destructive', title: "Import Failed", description: (error as Error).message });
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = {
      minX: Infinity, minY: Infinity,
      maxX: -Infinity, maxY: -Infinity,
    };
    nodes.forEach(node => {
      bounds.minX = Math.min(bounds.minX, node.x);
      bounds.minY = Math.min(bounds.minY, node.y);
      bounds.maxX = Math.max(bounds.maxX, node.x + node.width);
      bounds.maxY = Math.max(bounds.maxY, node.y + node.height);
    });

    if (nodes.length === 0) {
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Cannot export an empty mind map.' });
      return;
    }
    
    const padding = 50;
    const svgWidth = bounds.maxX - bounds.minX + padding * 2;
    const svgHeight = bounds.maxY - bounds.minY + padding * 2;
    
    const nodeColor = getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim();
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    
    const foreignObjectSerializer = new XMLSerializer();

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
        <style>
          .node-text {
             font-family: sans-serif;
             font-size: 14px;
             word-break: break-word;
             padding: 8px;
          }
        </style>
        ${lines.map(line => {
            const fromNode = nodes.find(n => n.id === line.from);
            const toNode = nodes.find(n => n.id === line.to);
            if (!fromNode || !toNode) return '';
            const fromPos = getConnectorPosition(fromNode, 'bottom');
            const toPos = getConnectorPosition(toNode, 'top');
            const pathData = `M ${fromPos.x - bounds.minX + padding} ${fromPos.y - bounds.minY + padding} C ${fromPos.x - bounds.minX + padding} ${fromPos.y - bounds.minY + padding + 50}, ${toPos.x - bounds.minX + padding} ${toPos.y - bounds.minY + padding - 50}, ${toPos.x - bounds.minX + padding} ${toPos.y - bounds.minY + padding}`;
            return `<path d="${pathData}" stroke="hsl(${lineColor})" stroke-width="2" fill="none" />`;
        }).join('')}
        ${nodes.map(node => {
            const div = document.createElement('div');
            div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
            div.setAttribute('class', 'node-text');
            div.style.width = `${node.width}px`;
            div.style.height = `${node.height}px`;
            div.style.color = (node.color === '#ffffff' || node.color === 'hsl(var(--card))') ? `hsl(${nodeColor})` : 'white';
            div.textContent = node.text;

            return `<rect x="${node.x - bounds.minX + padding}" y="${node.y - bounds.minY + padding}" width="${node.width}" height="${node.height}" fill="${node.color || '#ffffff'}" stroke="hsl(${lineColor})" stroke-width="1" rx="8" />
            <foreignObject x="${node.x - bounds.minX + padding}" y="${node.y - bounds.minY + padding}" width="${node.width}" height="${node.height}">${foreignObjectSerializer.serializeToString(div)}</foreignObject>`;
        }).join('')}
      </svg>
    `;
    
    const img = new Image();
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svg);
    
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = svgWidth;
      tempCanvas.height = svgHeight;
      const ctx = tempCanvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'mind-map.png';
      link.href = dataUrl;
      link.click();
      toast({ title: 'Exported as PNG', description: 'Your mind map image has been downloaded.' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate the PNG image.' });
    }

    img.src = url;
  };


  useEffect(() => {
    if (editingNodeId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingNodeId]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full flex flex-col" style={{ height: '800px' }}>
        <CardContent className="p-0 flex-1 relative overflow-hidden">
            <div className="absolute top-2 left-2 z-10 bg-background/80 border rounded-lg p-1 flex gap-1 items-center shadow-md">
                <Button variant="outline" size="sm" onClick={() => importFileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Import</Button>
                <input type="file" ref={importFileRef} accept=".json" className="hidden" onChange={handleImportJson} />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Export</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1">
                       <div className="flex flex-col">
                           <Button variant="ghost" onClick={handleExportJson}>As JSON</Button>
                           <Button variant="ghost" onClick={handleExportPng}>As PNG</Button>
                       </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div 
                ref={canvasRef} 
                className={cn(
                    "w-full h-full relative overflow-hidden",
                    "bg-muted/30 dark:bg-muted/10",
                    isClient && "[--grid-color:hsl(var(--border)_/_0.3)] dark:[--grid-color:hsl(var(--border)_/_0.2)]",
                    isClient && "[background-image:radial-gradient(var(--grid-color)_1px,_transparent_1px)]",
                    "[background-size:20px_20px]"
                )}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleCanvasMouseUp}
            >
                <svg className="absolute w-full h-full pointer-events-none" style={{ top: 0, left: 0 }}>
                    {lines.map(line => {
                        const fromNode = nodes.find(n => n.id === line.from);
                        const toNode = nodes.find(n => n.id === line.to);
                        if (!fromNode || !toNode) return null;

                        const fromPos = getConnectorPosition(fromNode, 'bottom');
                        const toPos = getConnectorPosition(toNode, 'top');

                        const pathData = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x} ${fromPos.y + 50}, ${toPos.x} ${toPos.y - 50}, ${toPos.x} ${toPos.y}`;

                        return <path key={line.id} d={pathData} stroke="hsl(var(--border))" strokeWidth="2" fill="none" />;
                    })}
                    {isConnecting && nodes.find(n => n.id === isConnecting) && (() => {
                        const fromNode = nodes.find(n => n.id === isConnecting)!;
                        const fromPos = getConnectorPosition(fromNode, 'bottom');
                        const pathData = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x} ${fromPos.y + 50}, ${mousePos.x} ${mousePos.y - 50}, ${mousePos.x} ${mousePos.y}`;
                        return <path d={pathData} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="5,5" />;
                    })()}
                </svg>
                
                {nodes.map(node => (
                <motion.div
                    key={node.id}
                    drag
                    onDragEnd={(event, info) => {
                        const rect = canvasRef.current!.getBoundingClientRect();
                        const x = info.point.x - rect.left - node.width/2;
                        const y = info.point.y - rect.top - node.height/2;
                        
                        const newX = Math.round(x / GRID_SIZE) * GRID_SIZE;
                        const newY = Math.round(y / GRID_SIZE) * GRID_SIZE;

                        setNodes(
                            nodes.map(n =>
                                n.id === node.id ? { ...n, x: newX, y: newY } : n
                            )
                        );
                    }}
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={e => { e.stopPropagation(); }}
                    onHoverEnd={e => { e.stopPropagation(); }}
                    dragMomentum={false}
                    className="mindmap-node absolute shadow-lg rounded-lg p-3 cursor-grab border border-border group"
                    style={{ 
                        x: node.x, 
                        y: node.y, 
                        width: node.width, 
                        height: node.height, 
                        minWidth: 150, 
                        minHeight: 70,
                        backgroundColor: node.color || defaultColor
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
                    onMouseUp={(e) => handleMouseUpOnNode(e, node.id)}
                >
                    <motion.div 
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary/20 border-2 border-primary rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => { e.stopPropagation(); setIsConnecting(node.id); }}
                    />

                    <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <Palette className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1">
                                <div className="grid grid-cols-6 gap-1">
                                    {colors.map(c => <button key={c} className="w-6 h-6 rounded-full border" style={{backgroundColor: c}} onClick={(e) => { e.stopPropagation(); setNodeColor(node.id, c); }} />)}
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {editingNodeId === node.id ? (
                        <textarea
                        ref={textareaRef}
                        value={node.text}
                        onChange={(e) => handleNodeChange(node.id, e.target.value)}
                        onBlur={stopEditing}
                        onKeyDown={(e) => {if(e.key === 'Escape') stopEditing()}}
                        className="w-full h-full bg-transparent resize-none focus:outline-none p-2"
                        />
                    ) : (
                        <div className="w-full h-full p-2 break-words" style={{color: (node.color === '#ffffff' || node.color === 'hsl(var(--card))') ? 'hsl(var(--card-foreground))' : 'white'}}>{node.text}</div>
                    )}
                </motion.div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    

    