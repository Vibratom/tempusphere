
'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Plus, Trash2, Zap, ZoomIn, ZoomOut } from 'lucide-react';
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

const NodeComponent = ({ node, onUpdateText, onAddChild, onDelete, onConvertToTask, isSelected, onSelect, onNodeDrag }: {
    node: Node;
    onUpdateText: (id: string, text: string) => void;
    onAddChild: (parentId: string) => void;
    onDelete: (id: string) => void;
    onConvertToTask: (text: string) => void;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
    onNodeDrag: (id: string, info: PanInfo) => void;
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
        onDrag={(event, info) => onNodeDrag(node.id, info)}
        className={cn(
            "absolute p-2 rounded-lg shadow-lg cursor-grab z-10",
            node.id === 'root' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border',
            isSelected && "ring-2 ring-accent"
        )}
        style={{ top: 0, left: 0 }}
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
           <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex gap-1 bg-background p-1 rounded-md border shadow-lg z-20">
                <Button size="icon" variant="ghost" onClick={() => onAddChild(node.id)} className="h-7 w-7"><Plus/></Button>
                {node.id !== 'root' && <Button size="icon" variant="ghost" onClick={() => onDelete(node.id)} className="h-7 w-7 text-destructive"><Trash2/></Button>}
                <Button size="icon" variant="ghost" onClick={() => onConvertToTask(node.text)} className="h-7 w-7 text-green-500"><Zap/></Button>
           </div>
       )}
    </motion.div>
  );
};

const Line = ({ fromNode, toNode }: { fromNode: Node, toNode: Node }) => {
    const fromX = fromNode.x + 88; // approx center of the node (160/2 + p-2)
    const fromY = fromNode.y + 26; // approx middle
    const toX = toNode.x + 88;
    const toY = toNode.y + 26;
    
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

export function CanvasView() {
  const [nodes, setNodes] = useLocalStorage<Node[]>('projects:canvas', initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const addTask = useProjects(state => state.addTask);
  const { toast } = useToast();
  
  const [scale, setScale] = useState(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);

  const handleAddChild = (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;
    
    const childrenCount = nodes.filter(n => n.parentId === parentId).length;
    
    const newX = parentNode.x + 250;
    const newY = parentNode.y + (childrenCount * 100);

    const newNode: Node = {
      id: `node-${Date.now()}`,
      text: 'New Idea',
      x: newX,
      y: newY,
      parentId: parentId,
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeDrag = (id: string, info: PanInfo) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
  };
  
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
    setSelectedNodeId(null);
  };
  
  const handleConvertToTask = (text: string) => {
      const board = useProjects.getState().board;
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
  
  return (
    <Card className="w-full h-full flex flex-col">
        <CardContent className="p-0 flex-1 relative overflow-hidden" onClick={() => setSelectedNodeId(null)}>
            <motion.div 
              className="w-full h-full"
              drag
              dragMomentum={false}
              onDrag={(e, info) => {
                  panX.set(panX.get() + info.delta.x);
                  panY.set(panY.get() + info.delta.y);
              }}
            >
              <motion.div 
                className="relative w-full h-full"
                style={{ x: panX, y: panY, scale, transformOrigin: "50% 50%" }}
              >
                  <svg className="absolute w-[400vw] h-[400vh] pointer-events-none" style={{ top: '-200vh', left: '-200vw' }}>
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
                        onUpdateText={handleUpdateText}
                        onAddChild={handleAddChild}
                        onDelete={handleDelete}
                        onConvertToTask={handleConvertToTask}
                        isSelected={selectedNodeId === node.id}
                        onSelect={setSelectedNodeId}
                        onNodeDrag={(id, info) => {
                          setNodes(nodes.map(n => n.id === id ? { ...n, x: n.x + info.delta.x / scale, y: n.y + info.delta.y / scale } : n));
                        }}
                      />
                  ))}
              </motion.div>
            </motion.div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <Button variant="outline" size="icon" onClick={() => handleZoom('in')}><ZoomIn/></Button>
                <Button variant="outline" size="icon" onClick={() => handleZoom('out')}><ZoomOut/></Button>
                <div className="p-2 bg-muted/80 text-muted-foreground rounded-md text-xs font-mono text-center">
                    {Math.round(scale * 100)}%
                </div>
            </div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-muted/80 p-2 rounded-lg text-sm text-muted-foreground z-20">
                <p><strong>Double-click</strong> node to edit. <strong>Click</strong> node for options. <strong>Drag</strong> background to pan.</p>
            </div>
        </CardContent>
    </Card>
  );
}
