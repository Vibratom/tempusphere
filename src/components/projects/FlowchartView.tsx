
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Download, AlertCircle, Loader2, ChevronDown, ZoomIn, ZoomOut, Move, PanelLeftClose, PanelLeftOpen, Undo2, Redo2, Code, Pencil, Trash2, Diamond, RectangleHorizontal, Circle, Cylinder, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { OnChange, Editor } from '@/components/Editor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
  logLevel: 5, 
});

const diagramTemplates = {
  flowAndProcess: {
    label: "Flow & Process",
    templates: {
      flowchart: { label: "Flowchart", code: `flowchart TD\n    A(Start) --> B{Is it?};\n    B -- Yes --> C(OK);\n    C --> D(Rethink);\n    D --> A;\n    B -- No --> E(End);`},
      state: { label: "State Diagram", code: `stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]`},
      userJourney: { label: "User Journey", code: `journey\n    title My Work Day\n    section Go to work\      Make tea: 5: Me\
      Go to work: 3: Me\
      Sit down: 5: Me\
    section Work\
      Plan day: 5: Me\
      Review PRs: 3: Me, Friend\
      Write code: 5: Me`},
    },
  },
  sequenceAndInteraction: {
    label: "Sequence & Interaction",
    templates: {
      sequence: { label: "Sequence Diagram", code: `sequenceDiagram\
    participant Alice\
    participant Bob\
    Alice->>John: Hello John, how are you?\
    loop Healthcheck\
        John->>John: Fight against hypochondria\
    end\
    Note right of John: Rational thoughts <br/>prevail...\
    John-->>Alice: Great!\
    John->>Bob: How about you?\
    Bob-->>John: Jolly good!`},
      packet: { label: "Packet Diagram", code: `packet-diagram\
    "Source Port"\
    "Destination Port"\
    "Sequence Number"\
    "Ack Number"\
    "Data Offset"\
    "Reserved"\
    "Flags"\
    "Window Size"\
    "Checksum"\
    "Urgent Pointer"` },
    }
  },
  dataAndStructure: {
    label: "Data & Structure",
    templates: {
      class: { label: "Class Diagram", code: `classDiagram\
    class Animal {\
      +String name\
      +int age\
      +void makeSound()\
    }\
    class Dog {\
      +String breed\
      +void bark()\
    }\
    class Cat {\
      +String color\
      +void meow()\
    }\
    Animal <|-- Dog\
    Animal <|-- Cat`},
      er: { label: "ER Diagram", code: `erDiagram\
    CUSTOMER ||--o{ ORDER : places\
    ORDER ||--|{ LINE-ITEM : contains\
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`},
      requirement: { label: "Requirement Diagram", code: `requirementDiagram\
\
    requirement test_req {\
    id: 1\
    text: the test text.\
    risk: high\
    verifymethod: test\
    }\
\
    element test_entity {\
    type: external_entity\
    }\
\
    test_entity - satisfies -> test_req`},
      sankey: { label: "Sankey Diagram", code: `sankey-beta\
    source,target,value\
    Agricultural 'Waste',Bio-conversion,124.729\
    Bio-conversion,Liquid,0.597\
    Bio-conversion,Losses,26.862`},
      treemap: { label: "Treemap", code: `treemap-beta\
    root(Root)\
      A\
        B\
          C(30)\
          D(50)\
        E(100)`},
    }
  },
  architecture: {
    label: "Architecture",
    templates: {
      block: { label: "Block Diagram", code: `block-beta\
    block:a\
        A\
    end\
    block:b\
        B\
    end\
    a -- "label" --> b`},
      c4: { label: "C4 Diagram", code: `C4Context\
  title System Context diagram for Internet Banking System\
  Enterprise_Boundary(b0, "BankBoundary") {\
    Person(customer, "Personal Banking Customer", "A customer of the bank, with personal bank accounts.")\
    System(bankingSystem, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")\
\
    System_Ext(emailSystem, "E-mail system", "The internal Microsoft Exchange e-mail system.")\
    System_Ext(mainframe, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")\
  }\
\
  Rel(customer, bankingSystem, "Uses")\
  Rel(bankingSystem, emailSystem, "Sends e-mails", "SMTP")\
  Rel_Back(customer, emailSystem, "Sends e-mails to")\
  Rel(bankingSystem, mainframe, "Uses")`},
    }
  },
  planning: {
    label: "Planning",
    templates: {
      gantt: { label: "Gantt Chart", code: `gantt\
    title A Gantt Diagram\
    dateFormat  YYYY-MM-DD\
    section Section\
    A task           :a1, 2014-01-01, 30d\
    Another task     :after a1  , 20d\
    section Another\
    Task in sec      :2014-01-12  , 12d\
    another task      : 24d`},
      timeline: { label: "Timeline", code: `timeline\
    title Project Development Timeline\
    2024-07-01 : Kick-off & Brainstorming\
    2024-07-15 : UI/UX Design Phase\
             : Initial Mockups\
             : User Feedback Session\
    2024-08-01 : Development Sprint 1\
             : Backend Setup\
             : Frontend Components\
    2024-08-15 : Launch Beta Version`},
      mindmap: { label: "Mind Map", code: `mindmap\
  root((Mind Map))\
    Easy to Use\
      Just use indentation\
      - Deeper\
        - Even Deeper\
    Powerful\
      Supports Markdown\
      **Bold**\
      *Italic*\
      \`Code\``},
      kanban: { label: "Kanban Board", code: `kanban-beta\
    %%\ font-size: 14\
    %%\ lane-width: 200\
    \
    lanes: To Do, In Progress, Done\
    \
    tasks:\
    task 1, 1, 2d\
    task 2, 1, 3d\
    task 3, 2, 2d\
    task 4, 2, 4d\
    task 5, 2, 5d`},
    }
  },
  charts: {
    label: "Charts",
    templates: {
      pie: { label: "Pie Chart", code: `pie\
    title Key-Value Distribution\
    "Databases" : 80\
    "Messaging" : 20`},
      quadrant: { label: "Quadrant Chart", code: `quadrantChart\
    title Reach and engagement of campaigns\
    x-axis Low Reach --> High Reach\
    y-axis Low Engagement --> High Engagement\
    quadrant-1 We should expand\
    quadrant-2 Need to promote\
    quadrant-3 Re-evaluate\
    quadrant-4 May be improved\
    "Campaign A": [0.3, 0.6]\
    "Campaign B": [0.45, 0.23]\
    "Campaign C": [0.57, 0.69]\
    "Campaign D": [0.78, 0.34]\
    "Campaign E": [0.40, 0.34]\
    "Campaign F": [0.35, 0.78]`},
      radar: { label: "Radar Chart", code: `radar-beta\
    ---\
title: Quality attributes of a good report\
---\
    radar-chart\
        "Excellent"\
        "Good"\
        "Passable"\
        "Bad"\
        "Awful"\
\
        "Clarity", 5, 4, 3, 2, 1\
        "Accuracy", 1, 2, 3, 4, 5\
        "Consistency", 5, 4, 3, 2, 1\
        "Completeness", 1, 2, 3, 4, 5\
        "Conciseness", 5, 4, 3, 2, 1`},
      xy: { label: "XY Chart", code: `xychart-beta\
    title "Sales Revenue"\
    x-axis "Months" ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]\
    y-axis "Revenue (in $)" 4000 --> 11000\
    bar [4900, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]\
    line [4900, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`},
    }
  },
  misc: {
    label: "Misc",
    templates: {
      git: { label: "Git Graph", code: `gitGraph\
   commit\
   commit\
   branch develop\
   commit\
   commit\
   commit\
   checkout main\
   commit\
   commit\
   merge develop\
   commit\
   commit`},
      stylingDemo: { label: "Styling Demo", code: `flowchart TD\
    A[Start] --> B(Styled Node);\
    B --> C{Decision};\
    \
    style A fill:#f9f,stroke:#333,stroke-width:4px\
    style B fill:#ccf,stroke:#333,stroke-width:2px,stroke-dasharray: 5, 5\
    \
    linkStyle 0 stroke-width:2px,fill:none,stroke:green;\
    linkStyle 1 stroke-width:4px,fill:none,stroke:orange;`},
    }
  }
};

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral';

type EditorMode = 'visual' | 'code';
type NodeType = 'node' | 'decision' | 'stadium' | 'cylinder';
interface FlowNode {
  id: string;
  text: string;
  type: NodeType;
}
interface FlowLink {
  id: string;
  source: string;
  target: string;
  label: string;
}

export function FlowchartView() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v5', diagramTemplates.flowAndProcess.templates.flowchart.code);
  const [code, setCode] = useState(savedCode);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [history, setHistory] = useState([savedCode]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default');
  const [editorMode, setEditorMode] = useState<EditorMode>('code');
  const [smartMode, setSmartMode] = useLocalStorage('flowchart:smartMode', true); // Poka-yoke mode

  const [nodes, setNodes] = useState<FlowNode[]>(() => [
    {id: 'A', text: 'Start', type: 'stadium'},
    {id: 'B', text: 'Is it?', type: 'decision'},
    {id: 'C', text: 'OK', type: 'node'},
    {id: 'D', text: 'Rethink', type: 'node'},
    {id: 'E', text: 'End', type: 'stadium'},
  ]);
  const [links, setLinks] = useState<FlowLink[]>(() => [
      { id: 'l1', source: 'A', target: 'B', label: '' },
      { id: 'l2', source: 'B', target: 'C', label: 'Yes' },
      { id: 'l3', source: 'C', target: 'D', label: '' },
      { id: 'l4', source: 'D', target: 'A', label: '' },
      { id: 'l5', source: 'B', target: 'E', label: 'No' },
  ]);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newCode]);
    setHistoryIndex(newHistory.length);
  }

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  // Visual Editor Code Generation
  useEffect(() => {
    if (editorMode === 'visual') {
        let newCode = 'flowchart TD\n';
        
        nodes.forEach(node => {
            const text = node.text || ' '; // Mermaid requires some text
            if(node.type === 'node') newCode += `    ${node.id}["${text}"]\n`;
            if(node.type === 'decision') newCode += `    ${node.id}{"${text}"}\n`;
            if(node.type === 'stadium') newCode += `    ${node.id}("${text}")\n`;
            if(node.type === 'cylinder') newCode += `    ${node.id}[("${text}")]\n`;
        });
        
        links.forEach(link => {
            if (link.source && link.target) {
                if (link.label) {
                    newCode += `    ${link.source} -- "${link.label}" --> ${link.target}\n`;
                } else {
                    newCode += `    ${link.source} --> ${link.target}\n`;
                }
            }
        });
        
        if (code !== newCode) {
            handleCodeChange(newCode);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links, editorMode]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);
  
  useEffect(() => {
    if (!isClient) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
      logLevel: 5,
    });

    const renderMermaid = async () => {
      try {
        const uniqueId = `mermaid-graph-${Date.now()}`;
        const finalCode = `${code}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, finalCode);
        setSvg(renderedSvg);
        setRenderError(null);
        setSavedCode(code);
      } catch (error: any) {
        setSvg('');
        if (error.str) {
             setRenderError(error.str);
        } else {
            setRenderError('Invalid syntax. Please check your diagram code.');
        }
        console.error("Mermaid render error:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (code.trim()) {
        renderMermaid();
      } else {
        setSvg('');
        setRenderError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code, isClient, resolvedTheme, mermaidTheme, setSavedCode]);
  
  const handleExportSvg = () => {
    if (!svg || renderError) {
        toast({ title: "Nothing to Export", description: "The diagram is empty or has errors.", variant: "destructive"});
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
    toast({ title: "SVG Exported", description: "Your diagram has been downloaded."});
  };
  
  const addNode = (type: NodeType) => {
    const existingIds = nodes.map(n => n.id.charCodeAt(0)).filter(n => n >= 65 && n <= 90);
    const nextIdChar = String.fromCharCode(existingIds.length > 0 ? Math.max(...existingIds) + 1 : 65);
    const newNode: FlowNode = { id: nextIdChar, text: 'New Node', type };
    setNodes(prev => [...prev, newNode]);
  }
  const updateNode = (id: string, text: string) => {
    setNodes(prev => prev.map(n => n.id === id ? {...n, text} : n));
  }
  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setLinks(prev => prev.filter(l => l.source !== id && l.target !== id));
  }
  const addLink = () => {
    setLinks(prev => [...prev, {id: `l${Date.now()}`, source: '', target: '', label: ''}]);
  }
  const updateLink = (id: string, part: Partial<FlowLink>) => {
    setLinks(prev => prev.map(l => {
      if (l.id === id) {
        const newLink = {...l, ...part};
        if (smartMode) {
          if (newLink.source && newLink.source === newLink.target) {
            toast({ title: "Invalid Link", description: "A node cannot link to itself in Smart Mode.", variant: "destructive"});
            return l; // revert
          }
        }
        return newLink;
      }
      return l;
    }));
  }
  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  }

  const nodeOptions = nodes.map(n => ({ value: n.id, label: `${n.id}: ${n.text}` }));

  if (!isClient) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  const editorPanel = (
    <div className="flex flex-col gap-4 h-full p-0">
        <div className="p-4 pb-0">
          <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as EditorMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visual"><Pencil className="mr-2"/>Visual</TabsTrigger>
                <TabsTrigger value="code"><Code className="mr-2"/>Code</TabsTrigger>
              </TabsList>
          </Tabs>
        </div>

        { editorMode === 'visual' ? (
          <div className="flex-1 flex flex-col gap-4 p-4 pt-0 min-h-0">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Smart Mode</Label>
                <p className="text-xs text-muted-foreground">Prevents mistakes like self-linking.</p>
              </div>
              <Switch checked={smartMode} onCheckedChange={setSmartMode} />
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nodes</CardTitle>
                  <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('node')}><RectangleHorizontal/></Button></TooltipTrigger>
                            <TooltipContent><p>Add Process</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('decision')}><Diamond/></Button></TooltipTrigger>
                            <TooltipContent><p>Add Decision</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('stadium')}><Circle/></Button></TooltipTrigger>
                            <TooltipContent><p>Add Start/End</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('cylinder')}><Cylinder/></Button></TooltipTrigger>
                            <TooltipContent><p>Add Database</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-4 pr-4">
                    {nodes.map(node => {
                      const nodeLinks = links.filter(l => l.source === node.id || l.target === node.id);
                      return (
                        <div key={node.id} className="space-y-2 rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground p-2 bg-muted rounded-md">{node.id}</span>
                            <Input value={node.text} onChange={(e) => updateNode(node.id, e.target.value)} className="flex-1"/>
                            <Button size="icon" variant="ghost" onClick={() => removeNode(node.id)}><Trash2/></Button>
                          </div>
                           {nodeLinks.length > 0 && (
                            <div className="pl-8 space-y-1">
                              {nodeLinks.map(link => (
                                <div key={link.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <LinkIcon className="h-3 w-3" />
                                    {link.source === node.id ? (
                                        <>
                                            <span className="font-mono">{node.id}</span>
                                            <ArrowRight className="h-3 w-3" />
                                            <span className="font-mono">{link.target || '?'}</span>
                                            {link.label && <span className="text-xs p-1 bg-muted rounded">({link.label})</span>}
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-mono">{link.source || '?'}</span>
                                            <ArrowRight className="h-3 w-3" />
                                            <span className="font-mono">{node.id}</span>
                                             {link.label && <span className="text-xs p-1 bg-muted rounded">({link.label})</span>}
                                        </>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Links</CardTitle>
                  <Button size="sm" variant="outline" onClick={addLink}>Add Link</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-4">
                    {links.map(link => (
                      <div key={link.id} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-center">
                        {smartMode ? (
                          <>
                            <Select value={link.source} onValueChange={(v) => updateLink(link.id, {source: v})}>
                                <SelectTrigger><SelectValue placeholder="From"/></SelectTrigger>
                                <SelectContent>{nodeOptions.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={link.target} onValueChange={(v) => updateLink(link.id, {target: v})}>
                                <SelectTrigger><SelectValue placeholder="To"/></SelectTrigger>
                                <SelectContent>{nodeOptions.filter(n => n.value !== link.source).map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </>
                        ) : (
                          <>
                              <Input value={link.source} onChange={(e) => updateLink(link.id, {source: e.target.value})} placeholder="From ID" className="font-mono"/>
                              <Input value={link.target} onChange={(e) => updateLink(link.id, {target: e.target.value})} placeholder="To ID" className="font-mono"/>
                          </>
                        )}
                        <Input value={link.label} onChange={(e) => updateLink(link.id, {label: e.target.value})} placeholder="Label (optional)"/>
                        <Button size="icon" variant="ghost" onClick={() => removeLink(link.id)}><Trash2/></Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
           <div className="flex-1 flex flex-col p-4 pt-0 min-h-0">
              <Card className="flex flex-col flex-1">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Code Editor</CardTitle>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={handleUndo} disabled={historyIndex <= 0}><Undo2/></Button>
                            <Button variant="ghost" size="icon" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2/></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative">
                  <Editor
                      value={code}
                      onValueChange={setCode}
                      onBlur={() => handleCodeChange(code)}
                  />
                </CardContent>
              </Card>
            </div>
        )}
      </div>
  );
  
  const previewPanel = (
    <Card className="flex flex-col h-full rounded-none border-0">
        <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <div className="w-full h-full p-4 rounded-lg overflow-auto" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {renderError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-destructive-foreground bg-destructive/80 rounded-lg p-4">
                    <AlertCircle className="w-10 h-10 mb-2"/>
                    <p className="font-semibold text-center">Failed to render diagram.</p>
                    <pre className="mt-2 text-xs bg-black/20 p-2 rounded-md whitespace-pre-wrap max-w-full text-left">{renderError}</pre>
                </div>
            ) : svg ? (
                <div
                    dangerouslySetInnerHTML={{ __html: svg }}
                    className="w-full h-full flex items-center justify-center [&>svg]:max-w-none [&>svg]:max-h-none"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {code.trim() ? <Loader2 className="h-8 w-8 animate-spin"/> : <p>Diagram will appear here.</p>}
                </div>
            )}
          </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Card>
          <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Diagram from Text</CardTitle>
                <CardDescription>Select a template or use the visual/code editor to build your diagram.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Templates <ChevronDown className="ml-2"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select a Template</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.values(diagramTemplates).map(category => (
                            <DropdownMenuSub key={category.label}>
                                <DropdownMenuSubTrigger>{category.label}</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        {Object.values(category.templates).map(template => (
                                            <DropdownMenuItem key={template.label} onClick={() => { handleCodeChange(template.code); setEditorMode('code')}}>
                                                {template.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleExportSvg}><Download className="mr-2"/>Export as SVG</Button>
              </div>
          </CardHeader>
      </Card>
      
      {isMobile ? (
        <div className="flex-1 flex flex-col gap-4">
            <ResizablePanelGroup direction="vertical">
                <ResizablePanel>{editorPanel}</ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel>{previewPanel}</ResizablePanel>
            </ResizablePanelGroup>
        </div>
      ) : (
         <ResizablePanelGroup direction="horizontal" className="flex-1 border rounded-lg">
            <ResizablePanel>{editorPanel}</ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>{previewPanel}</ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}

function Description({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-muted-foreground">{children}</p>;
}
    

    

    