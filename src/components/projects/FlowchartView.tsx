

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useTheme } from 'next-themes';
import { AlertCircle, Code, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

// --- Types and Constants ---

type EditorMode = 'visual' | 'code';
type DiagramType = 'flowchart' | 'stateDiagram' | 'mindmap' | 'unknown';

interface VisualNode {
  id: string;
  name: string;
  shape: 'rect' | 'stadium' | 'circle' | 'rhombus' | 'cylinder';
}

interface VisualLink {
  id: string;
  from: string;
  to: string;
  type: 'arrow' | 'line' | 'dotted';
  text: string;
}

// Each row is a chain of nodes and links
interface VisualRow {
    id: string;
    from_node_id: string;
    from_node_name: string;
    from_node_shape: VisualNode['shape'];
    link_type: VisualLink['type'];
    link_text: string;
    to_node_id: string;
    to_node_name: string;
    to_node_shape: VisualNode['shape'];
}

const defaultCode = `flowchart TD
    A[Start] --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(Rethink);
    D --> A;
    B -- No --> E(End);`;

const nodeShapeOptions = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'stadium', label: 'Stadium' },
  { value: 'circle', label: 'Circle' },
  { value: 'rhombus', label: 'Rhombus' },
  { value: 'cylinder', label: 'Cylinder' },
];

const linkTypeOptions = [
  { value: 'arrow', label: '-->' },
  { value: 'line', label: '---' },
  { value: 'dotted', label: '-.->' },
];


const createNewNode = (id: string): VisualNode => ({ id, name: 'Node', shape: 'rect' });
const createNewLink = (): VisualLink => ({ id: `link-${Math.random()}`, from: '', to: '', type: 'arrow', text: '' });

const createNewVisualRow = (): VisualRow => {
    const fromNodeId = `N${Date.now()}${Math.random()}`;
    const toNodeId = `N${Date.now()}${Math.random()}`;
    return {
        id: `row-${Math.random()}`,
        from_node_id: fromNodeId,
        from_node_name: 'Node',
        from_node_shape: 'rect',
        link_type: 'arrow',
        link_text: '',
        to_node_id: toNodeId,
        to_node_name: 'Node',
        to_node_shape: 'rect',
    };
};

// --- Mermaid Initialization ---

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
  logLevel: 5,
});

// --- Helper Functions ---

const getShapeSyntax = (shape: VisualNode['shape']) => {
  switch (shape) {
    case 'stadium': return ['(', ')'];
    case 'circle': return ['((', '))'];
    case 'rhombus': return ['{', '}'];
    case 'cylinder': return ['([', '])'];
    default: return ['[', ']'];
  }
};

const getLinkSyntax = (type: VisualLink['type'], text: string) => {
    const linkType = {
        'line': `---`,
        'dotted': `-.->`,
        'arrow': `-->`,
    }[type];
    
    if (text.trim()) {
        return `-- ${text.trim()} -->`;
    }
    return linkType;
};


// --- Component ---

export function FlowchartView() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v25', defaultCode);
  const [visualRows, setVisualRows] = useLocalStorage<VisualRow[]>('flowchart:visual-rows-v2', [createNewVisualRow()]);
  
  const [code, setCode] = useState(savedCode);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  
  const diagramType = useMemo((): DiagramType => {
      const trimmedCode = code.trim().toLowerCase();
      if (trimmedCode.startsWith('flowchart') || trimmedCode.startsWith('graph')) return 'flowchart';
      if (trimmedCode.startsWith('statediagram') || trimmedCode.startsWith('state-diagram')) return 'stateDiagram';
      if (trimmedCode.startsWith('mindmap')) return 'mindmap';
      return 'unknown';
  }, [code]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Code Generation & Parsing ---
  
  const generateCodeFromVisual = useCallback(() => {
    if (editorMode !== 'visual') return;
  
    const baseType = diagramType === 'stateDiagram' ? 'stateDiagram-v2' : 'flowchart';
    let newCode = `${baseType} TD\n`;
    const definedNodes = new Set<string>();
  
    visualRows.forEach(row => {
      // Define 'from' node if not already defined
      if (row.from_node_name.trim() && !definedNodes.has(row.from_node_id)) {
        const [start, end] = getShapeSyntax(row.from_node_shape);
        newCode += `    ${row.from_node_id}${start}"${row.from_node_name}"${end}\n`;
        definedNodes.add(row.from_node_id);
      }
  
      // Define 'to' node if not already defined
      if (row.to_node_name.trim() && !definedNodes.has(row.to_node_id)) {
        const [start, end] = getShapeSyntax(row.to_node_shape);
        newCode += `    ${row.to_node_id}${start}"${row.to_node_name}"${end}\n`;
        definedNodes.add(row.to_node_id);
      }
  
      // Add the link
      if (row.from_node_name.trim() && row.to_node_name.trim()) {
        const linkSyntax = getLinkSyntax(row.link_type, row.link_text);
        newCode += `    ${row.from_node_id} ${linkSyntax} ${row.to_node_id}\n`;
      }
    });
    
    setCode(newCode);
  }, [editorMode, visualRows, diagramType]);


  useEffect(() => {
    generateCodeFromVisual();
  }, [generateCodeFromVisual]);

  const { resolvedTheme } = useTheme();

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

  // --- Visual Editor Handlers ---

  const addVisualRow = () => {
    setVisualRows(prev => [...prev, createNewVisualRow()]);
  };
  
  const removeVisualRow = (rowId: string) => {
    setVisualRows(prev => prev.filter(r => r.id !== rowId));
  };
  
  const handleVisualRowChange = (index: number, field: keyof VisualRow, value: string) => {
      const newRows = [...visualRows];
      const newRow = {...newRows[index], [field]: value};
      if (field === 'from_node_name' && !value.trim()) {
          newRow.from_node_id = `N${Date.now()}${Math.random()}`;
      }
      if (field === 'to_node_name' && !value.trim()) {
          newRow.to_node_id = `N${Date.now()}${Math.random()}`;
      }
      newRows[index] = newRow;
      setVisualRows(newRows);
  };


  if (!isClient) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Diagram Editor</CardTitle>
                <CardDescription>Use the visual editor or Mermaid syntax to create diagrams. Your work is saved automatically.</CardDescription>
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
                    <TabsContent value="visual" className="m-0 flex-1 flex flex-col">
                        <div className="p-4 border-b">
                            <Button onClick={addVisualRow}><Plus className="mr-2"/>Add Row</Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-4">
                                {visualRows.map((row, index) => (
                                <Card key={row.id} className="p-3">
                                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                                    {/* From Node */}
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs">From</Label>
                                        <Input placeholder="Node Name" value={row.from_node_name} onChange={e => handleVisualRowChange(index, 'from_node_name', e.target.value)} />
                                        <Select value={row.from_node_shape} onValueChange={v => handleVisualRowChange(index, 'from_node_shape', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                    </div>

                                    {/* Link */}
                                    <div className="flex flex-col gap-1">
                                         <Label className="text-xs">Link</Label>
                                        <Select value={row.link_type} onValueChange={v => handleVisualRowChange(index, 'link_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{linkTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        <Input placeholder="Link Text" value={row.link_text} onChange={e => handleVisualRowChange(index, 'link_text', e.target.value)} />
                                    </div>
                                    
                                    {/* To Node */}
                                     <div className="flex flex-col gap-1">
                                        <Label className="text-xs">To</Label>
                                        <Input placeholder="Node Name" value={row.to_node_name} onChange={e => handleVisualRowChange(index, 'to_node_name', e.target.value)} />
                                        <Select value={row.to_node_shape} onValueChange={v => handleVisualRowChange(index, 'to_node_shape', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <Button size="icon" variant="ghost" onClick={() => removeVisualRow(row.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="code" className="m-0 flex-1">
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                            placeholder="Write your Mermaid diagram code here..."
                        />
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
