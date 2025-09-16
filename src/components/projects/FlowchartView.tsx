
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { AlertCircle, Code, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

const defaultCode = `flowchart TD
    A[Start] --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(Rethink);
    D --> A;
    B -- No --> E(End);`;

type EditorMode = 'visual' | 'code';
const MIN_ROWS = 5;
const MIN_COLS = 5;

// A simple approach: grid data is just a 2D array of strings.
// The string can be the node ID and text, e.g., "A[Start]".
type GridData = string[][];

const createEmptyGrid = (rows: number, cols: number): GridData => {
  return Array(rows).fill(null).map(() => Array(cols).fill(''));
};

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
  logLevel: 5, 
});

export function FlowchartView() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v20', defaultCode);
  const [gridData, setGridData] = useLocalStorage<GridData>('flowchart:grid-data-v1', createEmptyGrid(10, 8));
  
  const [code, setCode] = useState(savedCode);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const numRows = gridData.length;
  const numCols = gridData[0]?.length || 0;

  // Generate code from grid data
  useEffect(() => {
    if (editorMode === 'visual') {
      let newCode = 'flowchart TD\n';
      const definedNodes = new Set();
      gridData.forEach(row => {
        row.forEach(cell => {
          if (cell.trim()) {
            const nodeIdMatch = cell.match(/^([a-zA-Z0-9_]+)/);
            if (nodeIdMatch) {
              const nodeId = nodeIdMatch[1];
              if (!definedNodes.has(nodeId)) {
                newCode += `    ${cell}\n`;
                definedNodes.add(nodeId);
              }
            }
          }
        });
      });
      
      // Preserve links from existing code
      const existingLinks = code.split('\n').filter(line => line.includes('-->') || line.includes('---') || line.includes('-.->'));
      if(existingLinks.length > 0) {
        newCode += existingLinks.join('\n');
      }

      if (newCode.trim() !== code.trim()) {
        setCode(newCode);
      }
    }
  }, [gridData, editorMode, code]);


  useEffect(() => {
    if (!isClient) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
    });

    const renderMermaid = async () => {
      try {
        const uniqueId = `mermaid-graph-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, code);
        setSvg(renderedSvg);
        setRenderError(null);
        setSavedCode(code);
      } catch (error: any) {
        setSvg('');
        const errorMessage = error.str || 'Invalid Mermaid syntax.';
        setRenderError(errorMessage);
        console.error(error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (code.trim()) { renderMermaid(); }
      else { setSvg(''); setRenderError(null); }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code, isClient, resolvedTheme, setSavedCode]);


  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGridData = gridData.map((row, r) =>
      r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row
    );
    setGridData(newGridData);
  };
  
  const addRow = () => {
    setGridData(prev => [...prev, Array(numCols).fill('')]);
  };
  
  const addCol = () => {
    setGridData(prev => prev.map(row => [...row, '']));
  };

  const removeRow = (rowIndex: number) => {
    if (numRows > MIN_ROWS) {
        setGridData(prev => prev.filter((_, i) => i !== rowIndex));
    } else {
        toast({ variant: 'destructive', title: `Cannot remove row`, description: `A minimum of ${MIN_ROWS} rows is required.`})
    }
  };

  const removeCol = (colIndex: number) => {
    if (numCols > MIN_COLS) {
        setGridData(prev => prev.map(row => row.filter((_, i) => i !== colIndex)));
    } else {
        toast({ variant: 'destructive', title: `Cannot remove column`, description: `A minimum of ${MIN_COLS} columns is required.`})
    }
  };
  
  if (!isClient) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Diagram Editor</CardTitle>
                <CardDescription>Use the visual grid or Mermaid syntax to create diagrams. Your work is saved automatically.</CardDescription>
            </CardHeader>
        </Card>
        <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
            <ResizablePanel defaultSize={60}>
                 <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as EditorMode)} className="w-full h-full flex flex-col">
                    <div className="p-4 pb-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="visual"><Pencil className="mr-2"/>Visual</TabsTrigger>
                            <TabsTrigger value="code"><Code className="mr-2"/>Code</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="code" className="m-0 flex-1">
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                            placeholder="Write your Mermaid diagram code here..."
                        />
                    </TabsContent>
                    <TabsContent value="visual" className="m-0 flex-1">
                        <div className="p-4 space-y-2 h-full flex flex-col">
                           <div className="flex gap-2">
                                <Button onClick={addRow} variant="outline"><Plus className="mr-2"/> Add Row</Button>
                                <Button onClick={addCol} variant="outline"><Plus className="mr-2"/> Add Column</Button>
                            </div>
                            <ScrollArea className="flex-1 -mr-4">
                                <div className="pr-4">
                                    <table className="border-collapse table-fixed w-full">
                                        <thead className="sticky top-0 bg-muted z-10">
                                            <tr>
                                                <th className="sticky left-0 bg-muted w-14 h-8 border-b border-r z-20"></th>
                                                {Array.from({ length: numCols }).map((_, colIndex) => (
                                                    <th key={colIndex} className="w-40 border p-0 text-center font-medium text-muted-foreground text-sm relative group">
                                                        <div className="p-1">{String.fromCharCode(65 + colIndex)}</div>
                                                        <Button variant="ghost" size="icon" className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeCol(colIndex)}><Trash2 className="h-3 w-3" /></Button>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: numRows }).map((_, rowIndex) => (
                                                <tr key={rowIndex} className="group">
                                                    <td className="sticky left-0 bg-muted w-14 border-r border-b p-0 text-center text-sm text-muted-foreground relative">
                                                        <div className="p-1">{rowIndex + 1}</div>
                                                        <Button variant="ghost" size="icon" className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeRow(rowIndex)}><Trash2 className="h-3 w-3" /></Button>
                                                    </td>
                                                    {Array.from({ length: numCols }).map((_, colIndex) => (
                                                        <td key={colIndex} className="p-0 border">
                                                            <Input 
                                                                type="text"
                                                                value={gridData[rowIndex]?.[colIndex] || ''}
                                                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                                className="w-full h-full p-1.5 bg-transparent border-0 rounded-none shadow-none text-sm focus-visible:ring-2 focus-visible:ring-primary z-10 relative"
                                                                placeholder={`e.g., N${rowIndex}${colIndex}[Text]`}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
                <ScrollArea className="h-full w-full p-4" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    {renderError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-destructive-foreground bg-destructive/80 rounded-lg p-4">
                            <AlertCircle className="w-10 h-10 mb-2"/>
                            <p className="font-semibold text-center">Failed to render diagram.</p>
                            <pre className="mt-2 text-xs bg-black/20 p-2 rounded-md whitespace-pre-wrap max-w-full text-left">{renderError}</pre>
                        </div>
                    ) : svg ? (
                        <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full h-full flex items-center justify-center [&>svg]:max-w-none [&>svg]:max-h-none"/>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {code.trim() ? <Loader2 className="h-8 w-8 animate-spin"/> : <p>Diagram will appear here.</p>}
                        </div>
                    )}
                </ScrollArea>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
}
