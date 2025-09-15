
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

// Types
interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
}

interface Line {
  id: string;
  from: string;
  to: string;
}

export function MindMapView() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('mindmap:nodes-v2', []);
  const [lines, setLines] = useLocalStorage<Line[]>('mindmap:lines-v2', []);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.mindmap-node')) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newNode: Node = {
      id: uuidv4(),
      text: 'New Idea',
      x: e.clientX - rect.left - 75,
      y: e.clientY - rect.top - 50,
      width: 150,
      height: 100,
    };
    setNodes([...nodes, newNode]);
    setEditingNodeId(newNode.id);
  };
  
  const handleNodeChange = (id: string, newText: string) => {
    setNodes(nodes.map(node => (node.id === id ? { ...node, text: newText } : node)));
  };

  const stopEditing = () => {
    setEditingNodeId(null);
  };
  
  const deleteNode = (id: string) => {
    const nodesToDelete = new Set<string>([id]);
    let changed = true;
    while(changed) {
        changed = false;
        const childNodes = lines.filter(l => nodesToDelete.has(l.from)).map(l => l.to);
        childNodes.forEach(childId => {
            if (!nodesToDelete.has(childId)) {
                nodesToDelete.add(childId);
                changed = true;
            }
        });
    }

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
        // Check if connection already exists
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
      switch(side) {
          case 'top': return { x: node.x + node.width / 2, y: node.y };
          case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
          case 'left': return { x: node.x, y: node.y + node.height / 2 };
          case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
      }
  }

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
            <div 
                ref={canvasRef} 
                className="w-full h-full relative overflow-hidden bg-muted/30" 
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
                    const { x, y } = info.point;
                    setNodes(
                        nodes.map(n =>
                        n.id === node.id ? { ...n, x, y } : n
                        )
                    );
                    }}
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={e => { e.stopPropagation(); }}
                    onHoverEnd={e => { e.stopPropagation(); }}
                    dragMomentum={false}
                    className="mindmap-node absolute bg-card shadow-lg rounded-lg p-3 cursor-grab border border-border group"
                    style={{ x: node.x, y: node.y, width: node.width, height: node.height, minWidth: 150, minHeight: 70 }}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
                    onMouseUp={(e) => handleMouseUpOnNode(e, node.id)}
                >
                    <motion.div 
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary/20 border-2 border-primary rounded-full cursor-pointer hidden group-hover:block"
                        onMouseDown={(e) => { e.stopPropagation(); setIsConnecting(node.id); }}
                    />
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    
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
                        <div className="w-full h-full p-2 break-words">{node.text}</div>
                    )}
                </motion.div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
