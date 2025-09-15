
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Plus, Trash2, Zap, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectsContext';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId?: string;
}

const initialNodes: Node[] = [
  { id: 'root', text: 'My Project Idea', x: 0, y: 0 },
];

const NodeComponent = ({ node, onUpdate, onUpdateText, onAddChild, onDelete, onConvertToTask, isSelected, onSelect }: {
    node: Node;
    onUpdate: (id: string, newPos: { x: number, y: number }) => void;
    onUpdateText: (id: string, text: string) => void;
    onAddChild: (parentId: string) => void;
    onDelete: (id: string) => void;
    onConvertToTask: (text: string) => void;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  
  const handleUpdate = () => {
    onUpdateText(node.id, editText);
    setIsEditing(false);
  };
  
  return (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
        exit={{ opacity: 0, scale: 0.5 }}
        drag
        dragMomentum={false}
        className={cn(
            "absolute p-2 rounded-lg shadow-lg cursor-grab",
            node.id === 'root' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border',
            isSelected && "ring-2 ring-accent"
        )}
        onDragEnd={(event, info) => {
            onUpdate(node.id, { x: node.x + info.offset.x, y: node.y + info.offset.y });
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
    >
      {isEditing ? (
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          autoFocus
          className="w-40"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="p-2 w-40 truncate">
          {node.text}
        </div>
      )}
      
       {isSelected && (
           <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex gap-1 bg-background p-1 rounded-md border shadow-lg z-10">
                <Button size="icon" variant="ghost" onClick={() => onAddChild(node.id)} className="h-7 w-7"><Plus/></Button>
                {node.id !== 'root' && <Button size="icon" variant="ghost" onClick={() => onDelete(node.id)} className="h-7 w-7 text-destructive"><Trash2/></Button>}
                <Button size="icon" variant="ghost" onClick={() => onConvertToTask(node.text)} className="h-7 w-7 text-green-500"><Zap/></Button>
           </div>
       )}
    </motion.div>
  );
};

const Line = ({ fromNode, toNode }: { fromNode: Node, toNode: Node }) => {
    const fromX = fromNode.x + 80; // center of the node
    const fromY = fromNode.y + 25; // middle of the node
    const toX = toNode.x + 80;
    const toY = toNode.y + 25;
    
    // Simple straight line for now
    return (
        <motion.path
            d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
            stroke="hsl(var(--border))"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
        />
    )
}

export function MindMapView() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('projects:mindmap', initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { addTask } = useProjects();
  const { toast } = useToast();
  
  const [scale, setScale] = useState(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddChild = (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;
    
    const childrenCount = nodes.filter(n => n.parentId === parentId).length;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      text: 'New Idea',
      x: parentNode.x + 250,
      y: parentNode.y + (childrenCount * 100),
      parentId: parentId,
    };
    setNodes([...nodes, newNode]);
  };

  const handleUpdateNodePosition = (id: string, newPos: { x: number, y: number }) => {
      setNodes(nodes.map(n => (n.id === id ? { ...n, x: newPos.x, y: newPos.y } : n)));
  }

  const handleUpdateText = (id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleDelete = (id: string) => {
    const idsToDelete = new Set<string>();
    const queue = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      idsToDelete.add(currentId);
      nodes.forEach(n => {
        if (n.parentId === currentId) {
          queue.push(n.id);
        }
      });
    }

    setNodes(nodes.filter(n => !idsToDelete.has(n.id)));
  };
  
  const handleConvertToTask = (text: string) => {
      const { board } = useProjects.getState();
      const todoColumnId = board.columnOrder.length > 0 ? board.columnOrder[0] : null;

      if(todoColumnId) {
          addTask(todoColumnId, { title: text });
          toast({
              title: "Task Created!",
              description: `"${text}" has been added to your "To Do" list.`
          })
      } else {
          toast({
              variant: "destructive",
              title: "No 'To Do' column found",
              description: "Please create a 'To Do' column on your board first."
          })
      }
  }

  const handleZoom = (direction: 'in' | 'out') => {
      setScale(s => direction === 'in' ? Math.min(s * 1.2, 2) : Math.max(s / 1.2, 0.2));
  };
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setScale(s => {
          const newScale = s - e.deltaY * 0.001;
          return Math.min(Math.max(newScale, 0.2), 2);
        });
      }
    };

    const container = containerRef.current;
    container?.addEventListener('wheel', handleWheel, { passive: false });
    return () => container?.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Card className="w-full h-full flex flex-col">
        <CardContent className="p-0 flex-1 relative overflow-hidden" ref={containerRef} onClick={() => setSelectedNodeId(null)}>
           <motion.div 
             className="mindmap-canvas absolute top-0 left-0 w-full h-full origin-top-left"
             style={{ scale, x: panX, y: panY }}
           >
             <motion.div className="w-full h-full" drag dragMomentum={false}>
                <svg className="absolute w-full h-full pointer-events-none" style={{ top: 0, left: 0, overflow: 'visible' }}>
                    {nodes.map(node => {
                        const parent = nodes.find(p => p.id === node.parentId);
                        if (!parent) return null;
                        return <Line key={`${parent.id}-${node.id}`} fromNode={parent} toNode={node} />
                    })}
                </svg>
                {nodes.map(node => (
                    <NodeComponent
                    key={node.id}
                    node={node}
                    onUpdate={handleUpdateNodePosition}
                    onUpdateText={handleUpdateText}
                    onAddChild={handleAddChild}
                    onDelete={handleDelete}
                    onConvertToTask={handleConvertToTask}
                    isSelected={selectedNodeId === node.id}
                    onSelect={setSelectedNodeId}
                    />
                ))}
              </motion.div>
            </motion.div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <Button variant="outline" size="icon" onClick={() => handleZoom('in')}><ZoomIn/></Button>
                <Button variant="outline" size="icon" onClick={() => handleZoom('out')}><ZoomOut/></Button>
                <div className="p-2 bg-muted/80 text-muted-foreground rounded-md text-xs font-mono text-center">
                    {Math.round(scale * 100)}%
                </div>
            </div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-muted/80 p-2 rounded-lg text-sm text-muted-foreground z-10">
                <p><strong>Double-click</strong> to edit. <strong>Click</strong> a node for options. <strong>Drag</strong> background to pan. <strong>Ctrl + Scroll</strong> to zoom.</p>
            </div>
        </CardContent>
    </Card>
  );
}
