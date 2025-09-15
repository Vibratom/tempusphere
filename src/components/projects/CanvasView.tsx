
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';

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

export function CanvasView() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('mindmap:nodes-v1', []);
  const [lines, setLines] = useLocalStorage<Line[]>('mindmap:lines-v1', []);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null); // Node ID we are drawing a line from
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

  const handleNodeResize = (id: string, newSize: { width: number, height: number }) => {
    setNodes(nodes.map(node => node.id === id ? { ...node, ...newSize } : node));
  }

  const stopEditing = () => {
    setEditingNodeId(null);
  };
  
  const deleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id));
    setLines(lines.filter(line => line.from !== id && line.to !== id));
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if(isConnecting) {
       const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }
  
  const handleMouseUp = (e: React.MouseEvent, nodeId?: string) => {
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
  
  const getConnectorPosition = (node: Node) => {
    return {
        x: node.x + node.width / 2,
        y: node.y + node.height,
    }
  }

  useEffect(() => {
    if (editingNodeId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingNodeId]);

  return (
    <div 
        ref={canvasRef} 
        className="w-full h-full relative overflow-hidden bg-muted/30" 
        onDoubleClick={handleCanvasDoubleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
    >
      <svg className="absolute w-full h-full pointer-events-none" style={{ top: 0, left: 0 }}>
        {lines.map(line => {
            const fromNode = nodes.find(n => n.id === line.from);
            const toNode = nodes.find(n => n.id === line.to);
            if (!fromNode || !toNode) return null;

            const fromPos = getConnectorPosition(fromNode);
            const toPos = getConnectorPosition(toNode);

            const pathData = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x} ${fromPos.y + 50}, ${toPos.x} ${toPos.y - 50}, ${toPos.x} ${toPos.y}`;

            return <path key={line.id} d={pathData} stroke="hsl(var(--border))" strokeWidth="2" fill="none" />;
        })}
        {isConnecting && nodes.find(n => n.id === isConnecting) && (() => {
            const fromNode = nodes.find(n => n.id === isConnecting)!;
            const fromPos = getConnectorPosition(fromNode);
            const pathData = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x} ${fromPos.y + 50}, ${mousePos.x} ${mousePos.y - 50}, ${mousePos.x} ${mousePos.y}`;
            return <path d={pathData} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="5,5" />;
        })()}
      </svg>
      
      <AnimatePresence>
        {nodes.map(node => (
          <motion.div
            key={node.id}
            drag
            onDragEnd={(event, info) => {
              setNodes(
                nodes.map(n =>
                  n.id === node.id ? { ...n, x: info.point.x, y: info.point.y } : n
                )
              );
            }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={e => { e.stopPropagation(); }}
            onHoverEnd={e => { e.stopPropagation(); }}
            dragMomentum={false}
            className="mindmap-node absolute bg-card shadow-lg rounded-lg p-3 cursor-grab border border-border"
            style={{ x: node.x, y: node.y, width: node.width, height: node.height, minWidth: 150, minHeight: 70 }}
            onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
            onMouseUp={(e) => handleMouseUp(e, node.id)}
          >
             <motion.div 
                className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary/20 border border-primary rounded-full cursor-pointer hidden group-hover:block"
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
             <motion.div
                className="absolute bottom-1 right-1 cursor-se-resize text-muted-foreground opacity-20 hover:opacity-100"
                onPan={(event, info) => {
                    handleNodeResize(node.id, {
                        width: node.width + info.delta.x,
                        height: node.height + info.delta.y,
                    })
                }}
             >
                <GripVertical size={16} transform="rotate(45)" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
