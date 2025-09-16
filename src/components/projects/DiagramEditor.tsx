

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useTheme } from 'next-themes';
import { AlertCircle, Code, Loader2, Pencil, Plus, Trash2, Download } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';


// --- Types and Constants ---

type EditorMode = 'visual' | 'code';
type DiagramType = 'flowchart';

interface VisualNode {
  id: string;
  name: string;
  shape: 'rect' | 'stadium' | 'circle' | 'rhombus' | 'cylinder';
}

interface VisualLink {
  id: string;
  type: 'arrow' | 'line' | 'dotted';
  text: string;
}

// Each column is a chain of nodes and links
interface VisualColumn {
  id: string;
  nodes: VisualNode[];
  links: VisualLink[];
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
    const linkText = text.trim();
    const linkSymbol = {
        'line': `---`,
        'dotted': `-.->`,
        'arrow': `-->`,
    }[type];
    
    if (linkText) {
        return `-- ${linkText} -->`;
    }
    return linkSymbol;
};

const createNewNode = (): VisualNode => ({ id: `N${Date.now()}${Math.random()}`, name: 'Node', shape: 'rect' });
const createNewLink = (): VisualLink => ({ id: `link-${Math.random()}`, type: 'arrow', text: '' });
const createNewColumn = (): VisualColumn => {
    return {
        id: `col-${Math.random()}`,
        nodes: [createNewNode()],
        links: [],
    };
};

// --- Component ---

export function DiagramEditor() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v23', defaultCode);
  const [visualColumns, setVisualColumns] = useLocalStorage<VisualColumn[]>('flowchart:visual-cols-v2', [createNewColumn()]);
  
  const [code, setCode] = useState(savedCode);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [diagramType] = useState<DiagramType>('flowchart');
  
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Code Generation & Parsing ---

  const generateMermaidCode = useCallback(() => {
    if (editorMode !== 'visual') return;

    let newCode = `flowchart TD\n`;
    const definedNodes = new Set<string>();

    visualColumns.forEach(col => {
      col.nodes.forEach((node, nodeIndex) => {
        if (node.name.trim() && !definedNodes.has(node.id)) {
          const [start, end] = getShapeSyntax(node.shape);
          newCode += `    ${node.id}${start}"${node.name}"${end}\n`;
          definedNodes.add(node.id);
        }
        
        if (nodeIndex < col.links.length) {
          const link = col.links[nodeIndex];
          const nextNode = col.nodes[nodeIndex + 1];
          if (nextNode) {
            const linkSyntax = getLinkSyntax(link.type, link.text);
            newCode += `    ${node.id} ${linkSyntax} ${nextNode.id}\n`;
          }
        }
      });
    });
    
    // Add cross-column links here in the future

    setCode(newCode);
  }, [editorMode, visualColumns, diagramType]);

  useEffect(() => {
    generateMermaidCode();
  }, [generateMermaidCode]);

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

  const addColumn = () => {
    setVisualColumns(prev => [...prev, createNewColumn()]);
  };
  
  const removeColumn = (colId: string) => {
    setVisualColumns(prev => prev.filter(c => c.id !== colId));
  };
  
  const addRow = (colId: string) => {
    setVisualColumns(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          nodes: [...col.nodes, createNewNode()],
          links: [...col.links, createNewLink()]
        };
      }
      return col;
    }));
  };

  const handleNodeChange = (colId: string, nodeIndex: number, field: 'name' | 'shape', value: string) => {
    setVisualColumns(prev => prev.map(col => {
      if (col.id === colId) {
        const newNodes = [...col.nodes];
        newNodes[nodeIndex] = { ...newNodes[nodeIndex], [field]: value };
        return { ...col, nodes: newNodes };
      }
      return col;
    }));
  };

  const handleExportSVG = () => {
    if (!svg) {
      toast({
        title: "Nothing to Export",
        description: "The diagram preview is empty.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Export Successful",
      description: "Your diagram has been downloaded as an SVG file.",
    });
  };
  
  const LinkEditorRow = ({ colId, linkIndex, link }: { colId: string, linkIndex: number, link: VisualLink }) => {
    const [currentLink, setCurrentLink] = useState(link);

    useEffect(() => {
        setCurrentLink(link);
    }, [link]);

    const handleLocalChange = (field: 'type' | 'text', value: string) => {
        const updatedLink = { ...currentLink, [field]: value };
        setCurrentLink(updatedLink);
    };

    const commitChanges = (field: 'type' | 'text', value: string) => {
        setVisualColumns(prev => prev.map(col => {
            if (col.id === colId) {
                const newLinks = [...col.links];
                newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
                return { ...col, links: newLinks };
            }
            return col;
        }));
    };

    return (
        <AccordionItem value={`link-${link.id}`}>
          <AccordionTrigger className="text-sm px-2 py-2 hover:no-underline bg-background/50 rounded-md">
            Link: {currentLink.text || 'Untitled'}
          </AccordionTrigger>
          <AccordionContent className="p-2 pt-0">
            <div className="bg-background p-2 rounded border space-y-1">
                <Label className="text-xs">Link Style & Text</Label>
                <div className="flex gap-1">
                    <Select
                        value={currentLink.type}
                        onValueChange={v => {
                            handleLocalChange('type', v);
                            commitChanges('type', v);
                        }}
                    >
                        <SelectTrigger className="w-[80px]"><SelectValue/></SelectTrigger>
                        <SelectContent>{linkTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input
                        placeholder="Text on link"
                        value={currentLink.text}
                        onChange={e => handleLocalChange('text', e.target.value)}
                        onBlur={e => commitChanges('text', e.target.value)}
                    />
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>
    );
};


  if (!isClient) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <Card>
            <CardHeader className="flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Chart Editor</CardTitle>
                <CardDescription>Use the visual editor or Mermaid syntax to create diagrams. Your work is saved automatically.</CardDescription>
              </div>
            </CardHeader>
        </Card>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
            <Card className="flex flex-col">
                <CardHeader>
                    <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as EditorMode)}>
                        <TabsList className="grid w-full max-w-sm grid-cols-2">
                            <TabsTrigger value="visual"><Pencil className="mr-2"/>Visual</TabsTrigger>
                            <TabsTrigger value="code"><Code className="mr-2"/>Code</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <div className="p-0 flex-1 flex flex-col">
                    {editorMode === 'code' ? (
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                            placeholder="Write your Mermaid diagram code here..."
                        />
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-y">
                                <Button onClick={addColumn}><Plus className="mr-2"/>Add Chain</Button>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="flex gap-4 p-4 items-start">
                                    {visualColumns.map((col) => (
                                        <div key={col.id} className="w-64 bg-muted/50 p-3 rounded-lg space-y-2 flex-shrink-0">
                                            <Button size="sm" variant="destructive" onClick={() => removeColumn(col.id)} className="w-full mb-2">
                                                <Trash2 className="mr-2"/>Remove Chain
                                            </Button>
                                            <Accordion type="multiple" className="w-full space-y-2">
                                                {col.nodes.map((node, nodeIndex) => (
                                                    <React.Fragment key={node.id}>
                                                        <AccordionItem value={`node-${node.id}`}>
                                                            <AccordionTrigger className="text-sm px-2 py-2 hover:no-underline bg-background rounded-md">
                                                              Node: {node.name || 'Untitled'}
                                                            </AccordionTrigger>
                                                            <AccordionContent className="p-2 pt-0">
                                                                <div className="bg-background p-2 rounded border space-y-1">
                                                                    <Label className="text-xs">Node Text & Shape</Label>
                                                                    <Input placeholder="Text" value={node.name} onChange={e => handleNodeChange(col.id, nodeIndex, 'name', e.target.value)} />
                                                                    <Select value={node.shape} onValueChange={v => handleNodeChange(col.id, nodeIndex, 'shape', v)}>
                                                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                                                        <SelectContent>{nodeShapeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                        
                                                        {nodeIndex < col.links.length && (
                                                            <LinkEditorRow colId={col.id} linkIndex={nodeIndex} link={col.links[nodeIndex]} />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </Accordion>
                                            <Button size="sm" variant="outline" onClick={() => addRow(col.id)} className="w-full mt-2">
                                                <Plus className="mr-2"/>Add Node
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="flex flex-col">
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Live Preview</CardTitle>
                        <Button variant="outline" onClick={handleExportSVG}>
                            <Download className="mr-2"/>
                            Download SVG
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
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
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
