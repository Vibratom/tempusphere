
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { AlertCircle, Code, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '../ui/label';

const defaultCode = `flowchart TD
    A[Start] --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(Rethink);
    D --> A;
    B -- No --> E(End);`;

type EditorMode = 'visual' | 'code';
type NodeShape = 'rect' | 'stadium' | 'circle' | 'rhombus' | 'cylinder';
type LinkType = 'arrow' | 'line' | 'dotted';

interface VisualRow {
  id: string;
  from_node_name: string;
  from_node_shape: NodeShape;
  link_type: LinkType;
  link_name: string;
  to_node_name: string;
  to_node_shape: NodeShape;
  link_type2: LinkType;
  link_name2: string;
  to_node_name2: string;
  to_node_shape2: NodeShape;
  link_type3: LinkType;
  link_name3: string;
  to_node_name3: string;
  to_node_shape3: NodeShape;
  link_type4: LinkType;
  link_name4: string;
  to_node_name4: string;
  to_node_shape4: NodeShape;
}

const nodeShapeOptions: { value: NodeShape, label: string }[] = [
  { value: 'rect', label: 'Rectangle' },
  { value: 'stadium', label: 'Stadium' },
  { value: 'circle', label: 'Circle' },
  { value: 'rhombus', label: 'Rhombus' },
  { value: 'cylinder', label: 'Cylinder' },
];

const linkTypeOptions: { value: LinkType, label: string }[] = [
  { value: 'arrow', label: '-->' },
  { value: 'line', label: '---' },
  { value: 'dotted', label: '-.->' },
];

const createEmptyRow = (): VisualRow => ({
  id: uuidv4(),
  from_node_name: '', from_node_shape: 'rect',
  link_name: '', link_type: 'arrow',
  to_node_name: '', to_node_shape: 'rect',
  link_name2: '', link_type2: 'arrow',
  to_node_name2: '', to_node_shape2: 'rect',
  link_name3: '', link_type3: 'arrow',
  to_node_name3: '', to_node_shape3: 'rect',
  link_name4: '', link_type4: 'arrow',
  to_node_name4: '', to_node_shape4: 'rect',
});

function generateMermaidCode(rows: VisualRow[]): string {
    let code = 'flowchart TD\n';
    const definedNodes = new Set<string>();

    const defineNode = (nodeName: string, nodeShape: NodeShape) => {
        if (nodeName && !definedNodes.has(nodeName)) {
            let shapeSyntax;
            switch (nodeShape) {
                case 'stadium': shapeSyntax = `(${nodeName})`; break;
                case 'circle': shapeSyntax = `((${nodeName}))`; break;
                case 'rhombus': shapeSyntax = `{${nodeName}}`; break;
                case 'cylinder': shapeSyntax = `([${nodeName}])`; break;
                default: shapeSyntax = `[${nodeName}]`; break;
            }
            code += `    ${nodeName}${shapeSyntax}\n`;
            definedNodes.add(nodeName);
        }
    };
    
    const getLinkSyntax = (linkType: LinkType, linkName: string) => {
      let syntax;
      switch (linkType) {
          case 'line':
              syntax = linkName ? `--- ${linkName} ---` : '---';
              break;
          case 'dotted':
              syntax = linkName ? `-. ${linkName} .->` : '-.->';
              break;
          default: // arrow
              syntax = linkName ? `-- ${linkName} -->` : '-->';
              break;
      }
      return syntax;
    }

    rows.forEach(row => {
        const nodes = [
          { name: row.from_node_name, shape: row.from_node_shape },
          { name: row.to_node_name, shape: row.to_node_shape },
          { name: row.to_node_name2, shape: row.to_node_shape2 },
          { name: row.to_node_name3, shape: row.to_node_shape3 },
          { name: row.to_node_name4, shape: row.to_node_shape4 },
        ];
        const links = [
            { from: row.from_node_name, to: row.to_node_name, type: row.link_type, name: row.link_name },
            { from: row.to_node_name, to: row.to_node_name2, type: row.link_type2, name: row.link_name2 },
            { from: row.to_node_name2, to: row.to_node_name3, type: row.link_type3, name: row.link_name3 },
            { from: row.to_node_name3, to: row.to_node_name4, type: row.link_type4, name: row.link_name4 },
        ];

        nodes.forEach(node => defineNode(node.name, node.shape));

        links.forEach(link => {
            if (link.from && link.to) {
                code += `    ${link.from} ${getLinkSyntax(link.type, link.name)} ${link.to}\n`;
            }
        });
    });

    return code;
}


mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
  logLevel: 5, 
});

export function FlowchartView() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v12', defaultCode);
  const [code, setCode] = useState(savedCode);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [visualRows, setVisualRows] = useState<VisualRow[]>(() => [createEmptyRow()]);
  
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update code from visual editor
  useEffect(() => {
    if (editorMode === 'visual') {
      const newCode = generateMermaidCode(visualRows);
      if(newCode.trim() !== code.trim()) {
        setCode(newCode);
      }
    }
  }, [visualRows, editorMode, code]);


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

  const handleVisualRowChange = (index: number, field: keyof VisualRow, value: string) => {
    const newRows = [...visualRows];
    // @ts-ignore
    newRows[index][field] = value;
    setVisualRows(newRows);
  };
  
  const addVisualRow = () => {
    setVisualRows(prev => [...prev, createEmptyRow()]);
  };
  
  const removeVisualRow = (index: number) => {
    setVisualRows(prev => prev.filter((_, i) => i !== index));
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

                    <TabsContent value="code" className="m-0 flex-1">
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                            placeholder="Write your Mermaid diagram code here..."
                        />
                    </TabsContent>
                    <TabsContent value="visual" className="m-0 flex-1">
                        <ScrollArea className="h-full w-full">
                            <div className="p-4 space-y-2">
                                {visualRows.map((row, index) => (
                                    <div key={row.id} className="grid grid-cols-[repeat(8,_1fr)_auto] items-end gap-2 border p-2 rounded-lg relative">
                                        {/* From Node */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">From</Label>
                                            <Input placeholder="Node Name" value={row.from_node_name} onChange={e => handleVisualRowChange(index, 'from_node_name', e.target.value)} />
                                            <Select value={row.from_node_shape} onValueChange={v => handleVisualRowChange(index, 'from_node_shape', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                        {/* Link */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Link</Label>
                                            <Input placeholder="Link Text" value={row.link_name} onChange={e => handleVisualRowChange(index, 'link_name', e.target.value)} />
                                            <Select value={row.link_type} onValueChange={v => handleVisualRowChange(index, 'link_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{linkTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                        {/* To Node */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">To</Label>
                                            <Input placeholder="Node Name" value={row.to_node_name} onChange={e => handleVisualRowChange(index, 'to_node_name', e.target.value)} />
                                            <Select value={row.to_node_shape} onValueChange={v => handleVisualRowChange(index, 'to_node_shape', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                         {/* Link 2 */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Link</Label>
                                            <Input placeholder="Link Text" value={row.link_name2} onChange={e => handleVisualRowChange(index, 'link_name2', e.target.value)} />
                                            <Select value={row.link_type2} onValueChange={v => handleVisualRowChange(index, 'link_type2', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{linkTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                        {/* To Node 2 */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">To</Label>
                                            <Input placeholder="Node Name" value={row.to_node_name2} onChange={e => handleVisualRowChange(index, 'to_node_name2', e.target.value)} />
                                            <Select value={row.to_node_shape2} onValueChange={v => handleVisualRowChange(index, 'to_node_shape2', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                         {/* Link 3 */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Link</Label>
                                            <Input placeholder="Link Text" value={row.link_name3} onChange={e => handleVisualRowChange(index, 'link_name3', e.target.value)} />
                                            <Select value={row.link_type3} onValueChange={v => handleVisualRowChange(index, 'link_type3', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{linkTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                        {/* To Node 3 */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">To</Label>
                                            <Input placeholder="Node Name" value={row.to_node_name3} onChange={e => handleVisualRowChange(index, 'to_node_name3', e.target.value)} />
                                            <Select value={row.to_node_shape3} onValueChange={v => handleVisualRowChange(index, 'to_node_shape3', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                         {/* Link 4 */}
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Link</Label>
                                            <Input placeholder="Link Text" value={row.link_name4} onChange={e => handleVisualRowChange(index, 'link_name4', e.target.value)} />
                                            <Select value={row.link_type4} onValueChange={v => handleVisualRowChange(index, 'link_type4', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{linkTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                        <Button variant="ghost" size="icon" className="self-center" onClick={() => removeVisualRow(index)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                <Button onClick={addVisualRow} variant="outline"><Plus className="mr-2 h-4 w-4"/>Add Row</Button>
                            </div>
                        </ScrollArea>
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

    