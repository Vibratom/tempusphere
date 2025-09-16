'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Download, AlertCircle, Loader2, ChevronDown, ZoomIn, ZoomOut, Move, PanelLeftClose, PanelLeftOpen, Undo2, Redo2, Code, Pencil, Trash2, Link2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import { zoom, ZoomBehavior, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';

const diagramTemplates = {
  flowAndProcess: {
    label: "Flow & Process",
    templates: {
      flowchart: { label: "Flowchart", code: `flowchart TD\n    A(Start) --> B{Is it?};\n    B -- Yes --> C(OK);\n    C --> D(Rethink);\n    D --> A;\n    B -- No --> E(End);`},
      state: { label: "State Diagram", code: `stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]`},
      userJourney: { label: "User Journey", code: `journey\n    title My Work Day\n    section Go to work\n      Make tea: 5: Me\n      Go to work: 3: Me\n      Sit down: 5: Me\n    section Work\n      Plan day: 5: Me\n      Review PRs: 3: Me, Friend\n      Write code: 5: Me`},
    },
  },
  sequenceAndInteraction: {
    label: "Sequence & Interaction",
    templates: {
      sequence: { label: "Sequence Diagram", code: `sequenceDiagram\n    participant Alice\n    participant Bob\n    Alice->>John: Hello John, how are you?\n    loop Healthcheck\n        John->>John: Fight against hypochondria\n    end\n    Note right of John: Rational thoughts <br/>prevail...\n    John-->>Alice: Great!\n    John->>Bob: How about you?\n    Bob-->>John: Jolly good!`},
      packet: { label: "Packet Diagram", code: `packet-diagram\n    "Source Port"\n    "Destination Port"\n    "Sequence Number"\n    "Ack Number"\n    "Data Offset"\n    "Reserved"\n    "Flags"\n    "Window Size"\n    "Checksum"\n    "Urgent Pointer"` },
    }
  },
  dataAndStructure: {
    label: "Data & Structure",
    templates: {
      class: { label: "Class Diagram", code: `classDiagram\n    class Animal {\n      +String name\n      +int age\n      +void makeSound()\n    }\n    class Dog {\n      +String breed\n      +void bark()\n    }\n    class Cat {\n      +String color\n      +void meow()\n    }\n    Animal <|-- Dog\n    Animal <|-- Cat`},
      er: { label: "ER Diagram", code: `erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`},
      requirement: { label: "Requirement Diagram", code: `requirementDiagram\n\n    requirement test_req {\n    id: 1\n    text: the test text.\n    risk: high\n    verifymethod: test\n    }\n\n    element test_entity {\n    type: external_entity\n    }\n\n    test_entity - satisfies -> test_req`},
      sankey: { label: "Sankey Diagram", code: `sankey-beta\n    source,target,value\n    Agricultural 'Waste',Bio-conversion,124.729\n    Bio-conversion,Liquid,0.597\n    Bio-conversion,Losses,26.862`},
      treemap: { label: "Treemap", code: `treemap-beta\n    root(Root)\n      A\n        B\n          C(30)\n          D(50)\n        E(100)`},
    }
  },
  architecture: {
    label: "Architecture",
    templates: {
      block: { label: "Block Diagram", code: `block-beta\n    block:a\n        A\n    end\n    block:b\n        B\n    end\n    a -- "label" --> b`},
      c4: { label: "C4 Diagram", code: `C4Context\n  title System Context diagram for Internet Banking System\n  Enterprise_Boundary(b0, "BankBoundary") {\n    Person(customer, "Personal Banking Customer", "A customer of the bank, with personal bank accounts.")\n    System(bankingSystem, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")\n\n    System_Ext(emailSystem, "E-mail system", "The internal Microsoft Exchange e-mail system.")\n    System_Ext(mainframe, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")\n  }\n\n  Rel(customer, bankingSystem, "Uses")\n  Rel(bankingSystem, emailSystem, "Sends e-mails", "SMTP")\n  Rel_Back(customer, emailSystem, "Sends e-mails to")\n  Rel(bankingSystem, mainframe, "Uses")`},
    }
  },
  planning: {
    label: "Planning",
    templates: {
      gantt: { label: "Gantt Chart", code: `gantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Section\n    A task           :a1, 2014-01-01, 30d\n    Another task     :after a1  , 20d\n    section Another\n    Task in sec      :2014-01-12  , 12d\n    another task      : 24d`},
      timeline: { label: "Timeline", code: `timeline\n    title Project Development Timeline\n    2024-07-01 : Kick-off & Brainstorming\n    2024-07-15 : UI/UX Design Phase\n             : Initial Mockups\n             : User Feedback Session\n    2024-08-01 : Development Sprint 1\n             : Backend Setup\n             : Frontend Components\n    2024-08-15 : Launch Beta Version`},
      mindmap: { label: "Mind Map", code: `mindmap\n  root((Mind Map))\n    Easy to Use\n      Just use indentation\n      - Deeper\n        - Even Deeper\n    Powerful\n      Supports Markdown\n      **Bold**\n      *Italic*\n      \`Code\``},
      kanban: { label: "Kanban Board", code: `kanban-beta\n    %% font-size: 14\n    %% lane-width: 200\n    \n    lanes: To Do, In Progress, Done\n    \n    tasks:\n    task 1, 1, 2d\n    task 2, 1, 3d\n    task 3, 2, 2d\n    task 4, 2, 4d\n    task 5, 2, 5d`},
    }
  },
  charts: {
    label: "Charts",
    templates: {
      pie: { label: "Pie Chart", code: `pie\n    title Key-Value Distribution\n    "Databases" : 80\n    "Messaging" : 20`},
      quadrant: { label: "Quadrant Chart", code: `quadrantChart\n    title Reach and engagement of campaigns\n    x-axis Low Reach --> High Reach\n    y-axis Low Engagement --> High Engagement\n    quadrant-1 We should expand\n    quadrant-2 Need to promote\n    quadrant-3 Re-evaluate\n    quadrant-4 May be improved\n    "Campaign A": [0.3, 0.6]\n    "Campaign B": [0.45, 0.23]\n    "Campaign C": [0.57, 0.69]\n    "Campaign D": [0.78, 0.34]\n    "Campaign E": [0.40, 0.34]\n    "Campaign F": [0.35, 0.78]`},
      radar: { label: "Radar Chart", code: `radar-beta\n    ---\ntitle: Quality attributes of a good report\n---\n    radar-chart\n        "Excellent"\n        "Good"\n        "Passable"\n        "Bad"\n        "Awful"\n\n        "Clarity", 5, 4, 3, 2, 1\n        "Accuracy", 1, 2, 3, 4, 5\n        "Consistency", 5, 4, 3, 2, 1\n        "Completeness", 1, 2, 3, 4, 5\n        "Conciseness", 5, 4, 3, 2, 1`},
      xy: { label: "XY Chart", code: `xychart-beta\n    title "Sales Revenue"\n    x-axis "Months" ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]\n    y-axis "Revenue (in $)" 4000 --> 11000\n    bar [4900, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]\n    line [4900, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`},
    }
  },
  misc: {
    label: "Misc",
    templates: {
      git: { label: "Git Graph", code: `gitGraph\n   commit\n   commit\n   branch develop\n   commit\n   commit\n   commit\n   checkout main\n   commit\n   commit\n   merge develop\n   commit\n   commit`},
      stylingDemo: { label: "Styling Demo", code: `flowchart TD\n    A[Start] --> B(Styled Node);\n    B --> C{Decision};\n    \n    style A fill:#f9f,stroke:#333,stroke-width:4px\n    style B fill:#ccf,stroke:#333,stroke-width:2px,stroke-dasharray: 5, 5\n    \n    linkStyle 0 stroke-width:2px,fill:none,stroke:green;\n    linkStyle 1 stroke-width:4px,fill:none,stroke:orange;`},
    }
  }
};

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral';

type EditorMode = 'visual' | 'code';
type NodeType = 'node' | 'decision';
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
  
  const [history, setHistory] = useState([savedCode]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('code');

  const [nodes, setNodes] = useState<FlowNode[]>(() => [
    {id: 'A', text: 'Start', type: 'node'},
    {id: 'B', text: 'Is it?', type: 'decision'},
    {id: 'C', text: 'OK', type: 'node'},
    {id: 'D', text: 'Rethink', type: 'node'},
    {id: 'E', text: 'End', type: 'node'},
  ]);
  const [links, setLinks] = useState<FlowLink[]>(() => [
      { id: 'l1', source: 'A', target: 'B', label: '' },
      { id: 'l2', source: 'B', target: 'C', label: 'Yes' },
      { id: 'l3', source: 'C', target: 'D', label: '' },
      { id: 'l4', source: 'D', target: 'A', label: '' },
      { id: 'l5', source: 'B', target: 'E', label: 'No' },
  ]);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>();
  const panelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    setIsClient(true);
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
            const text = node.text || ' ';
            if(node.type === 'node') newCode += `    ${node.id}["${text}"]\n`;
            if(node.type === 'decision') newCode += `    ${node.id}{"${text}"}\n`;
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
    if (!svgContainerRef.current) return;
    
    const svgSelection = select(svgContainerRef.current).select('svg');
    if (svgSelection.empty()) return;

    const zoomHandler = zoom<HTMLDivElement, unknown>().on('zoom', (event) => {
        select(svgContainerRef.current).select('g').attr('transform', event.transform);
    });
    
    zoomBehaviorRef.current = zoomHandler;
    select(svgContainerRef.current).call(zoomHandler);
    
  }, [svg]);
  
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

  const handleZoomAction = (direction: 'in' | 'out' | 'reset') => {
    if (!svgContainerRef.current || !zoomBehaviorRef.current) return;
    const selection = select(svgContainerRef.current);
    if(direction === 'in') {
        selection.transition().call(zoomBehaviorRef.current.scaleBy, 1.2);
    } else if (direction === 'out') {
        selection.transition().call(zoomBehaviorRef.current.scaleBy, 0.8);
    } else {
        selection.transition().call(zoomBehaviorRef.current.transform, zoomIdentity);
    }
  };
  
  const toggleSidebar = () => {
    if (panelRef.current) {
        panelRef.current.isCollapsed() ? panelRef.current.expand() : panelRef.current.collapse();
    }
  };

  const addNode = (type: NodeType) => {
    const existingIds = nodes.map(n => n.id.charCodeAt(0));
    const nextIdChar = String.fromCharCode(Math.max(65, ...existingIds) + 1);
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
    setLinks(prev => prev.map(l => l.id === id ? {...l, ...part} : l));
  }
  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  }

  if (!isClient) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Card>
          <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Diagram from Text</CardTitle>
                <CardDescription>Select a template or use the visual editor to build your diagram.</CardDescription>
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
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
        <ResizablePanel
          ref={panelRef}
          defaultSize={35}
          minSize={20}
          maxSize={50}
          collapsedSize={0}
          collapsible={true}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className={isSidebarCollapsed ? "hidden" : "min-w-[300px]"}
        >
            <div className="flex flex-col gap-4 h-full p-0">
               <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as EditorMode)} className="flex-1 flex flex-col">
                  <div className="p-4 pb-0">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="visual"><Pencil className="mr-2"/>Visual Editor</TabsTrigger>
                      <TabsTrigger value="code"><Code className="mr-2"/>Code Editor</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="visual" className="flex-1 flex flex-col gap-4 p-4 min-h-0">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Nodes</CardTitle>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => addNode('node')}>Add Node</Button>
                            <Button size="sm" variant="outline" onClick={() => addNode('decision')}>Add Decision</Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {nodes.map(node => (
                              <div key={node.id} className="flex items-center gap-2">
                                <span className="font-mono text-sm text-muted-foreground p-2 bg-muted rounded-md">{node.id}</span>
                                <Input value={node.text} onChange={(e) => updateNode(node.id, e.target.value)} className="flex-1"/>
                                <Button size="icon" variant="ghost" onClick={() => removeNode(node.id)}><Trash2/></Button>
                              </div>
                            ))}
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
                          <div className="space-y-2">
                            {links.map(link => (
                              <div key={link.id} className="grid grid-cols-4 gap-2 items-center">
                                <Select value={link.source} onValueChange={(v) => updateLink(link.id, {source: v})}>
                                    <SelectTrigger><SelectValue placeholder="From"/></SelectTrigger>
                                    <SelectContent>{nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.id}: {n.text}</SelectItem>)}</SelectContent>
                                </Select>
                                <Select value={link.target} onValueChange={(v) => updateLink(link.id, {target: v})}>
                                    <SelectTrigger><SelectValue placeholder="To"/></SelectTrigger>
                                    <SelectContent>{nodes.map(n => <SelectItem key={n.id} value={n.id}>{n.id}: {n.text}</SelectItem>)}</SelectContent>
                                </Select>
                                <Input value={link.label} onChange={(e) => updateLink(link.id, {label: e.target.value})} placeholder="Label (optional)" className="col-span-2"/>
                                <Button size="icon" variant="ghost" onClick={() => removeLink(link.id)} className="col-start-4"><Trash2/></Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="code" className="flex-1 flex flex-col p-4 pt-0 min-h-0">
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
                        <ScrollArea className="absolute inset-0">
                              <Editor
                                  value={code}
                                  onValueChange={setCode}
                                  onBlur={() => handleCodeChange(code)}
                                  highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
                                  padding={16}
                                  className="font-mono text-sm"
                                  style={{ minHeight: '100%' }}
                              />
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
               </Tabs>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
            <Card className="flex flex-col h-full rounded-l-none border-l-0">
                <CardHeader className="flex-row items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                           {isSidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                        </Button>
                        <CardTitle>Live Preview</CardTitle>
                    </div>
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleZoomAction('in')}><ZoomIn /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleZoomAction('out')}><ZoomOut /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleZoomAction('reset')}><Move /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                   <div className="w-full h-full p-4 rounded-lg overflow-hidden cursor-grab" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    {renderError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-destructive-foreground bg-destructive/80 rounded-lg p-4">
                            <AlertCircle className="w-10 h-10 mb-2"/>
                            <p className="font-semibold text-center">Failed to render diagram.</p>
                            <pre className="mt-2 text-xs bg-black/20 p-2 rounded-md whitespace-pre-wrap max-w-full text-left">{renderError}</pre>
                        </div>
                    ) : svg ? (
                        <div
                            ref={svgContainerRef}
                            dangerouslySetInnerHTML={{ __html: svg }}
                            className="w-full h-full flex items-center justify-center [&>svg]:max-w-none [&>svg]:max-h-none"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <p>Diagram will appear here.</p>
                        </div>
                    )}
                   </div>
              </CardContent>
            </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}