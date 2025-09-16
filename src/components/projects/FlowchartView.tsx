
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Download, AlertCircle, Loader2, ChevronDown, PanelLeftClose, PanelLeftOpen, Undo2, Redo2, Code, Pencil, Trash2, Diamond, RectangleHorizontal, Circle, Cylinder, Link as LinkIcon, ArrowRight, CaseSensitive, Indent, Outdent, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Editor } from '@/components/Editor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
      userJourney: { label: "User Journey", code: `journey\n    title My Work Day\n    section Go to work\
      Make tea: 5: Me\
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
      mindmap: { label: "Mind Map", code: `mindmap\n  root((Mind Map))\n    Easy to Use\n      Just use indentation\n      - Deeper\n        - Even Deeper\n    Powerful\n      Supports Markdown\n      **Bold**\n      *Italic*\n      \`Code\``},
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

type DiagramType = 'flowchart' | 'mindmap' | 'stateDiagram' | 'unknown';

type EditorMode = 'visual' | 'code';
// --- Flowchart Specific Types ---
type FlowNodeType = 'node' | 'decision' | 'stadium' | 'cylinder' | 'circle';
interface FlowNode {
  id: string;
  text: string;
  type: FlowNodeType;
}
type LinkType = 'arrow' | 'line' | 'dotted';
interface FlowLink {
  id: string;
  source: string;
  target: string;
  label: string;
  linkType: LinkType;
}

// --- Mindmap Specific Types ---
interface MindMapNode {
  id: string;
  text: string;
  indent: number;
}

const LinkEditorRow = ({ initialLink, nodeOptions, onUpdate, onRemove, smartMode }: { initialLink: FlowLink, nodeOptions: {value: string, label: string}[], onUpdate: (id: string, part: Partial<FlowLink>) => void, onRemove: (id: string) => void, smartMode: boolean}) => {
    const [link, setLink] = useState(initialLink);
    const { toast } = useToast();

    useEffect(() => {
        setLink(initialLink);
    }, [initialLink]);

    const handleUpdate = (part: Partial<FlowLink>) => {
        const newLink = {...link, ...part};
        if (smartMode && newLink.source && newLink.source === newLink.target) {
            toast({ title: "Invalid Link", description: "A node cannot link to itself in Smart Mode.", variant: "destructive"});
            return;
        }
        setLink(newLink);
        onUpdate(newLink.id, newLink);
    };
    
    return (
        <div className="grid grid-cols-[1fr_1fr_1fr_2fr_auto] gap-2 items-center">
            {smartMode ? (
            <>
                <Select value={link.source} onValueChange={(v) => handleUpdate({source: v})}>
                    <SelectTrigger><SelectValue placeholder="From"/></SelectTrigger>
                    <SelectContent>{nodeOptions.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={link.target} onValueChange={(v) => handleUpdate({target: v})}>
                    <SelectTrigger><SelectValue placeholder="To"/></SelectTrigger>
                    <SelectContent>{nodeOptions.filter(n => n.value !== link.source).map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent>
                </Select>
            </>
            ) : (
            <>
                <Input value={link.source} onChange={(e) => handleUpdate({source: e.target.value})} placeholder="From ID" className="font-mono"/>
                <Input value={link.target} onChange={(e) => handleUpdate({target: e.target.value})} placeholder="To ID" className="font-mono"/>
            </>
            )}
            <Select value={link.linkType} onValueChange={(v: LinkType) => handleUpdate({linkType: v})}>
                <SelectTrigger><SelectValue placeholder="Link Type"/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="arrow">Arrow --&gt;</SelectItem>
                    <SelectItem value="line">Line ---</SelectItem>
                    <SelectItem value="dotted">Dotted -.-></SelectItem>
                </SelectContent>
            </Select>
            <Input value={link.label} onChange={(e) => handleUpdate({label: e.target.value})} placeholder="Label (optional)"/>
            <Button size="icon" variant="ghost" onClick={() => onRemove(link.id)}><Trash2/></Button>
        </div>
    );
};


export function FlowchartView() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v7', diagramTemplates.flowAndProcess.templates.flowchart.code);
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
  const [smartMode, setSmartMode] = useLocalStorage('flowchart:smartMode', true);
  const [selectedDiagram, setSelectedDiagram] = useState<string>("Flowchart");
  const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');

  // --- Visual Editor State ---
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowLinks, setFlowLinks] = useState<FlowLink[]>([]);
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);

  const parseCode = (currentCode: string) => {
    const firstLine = currentCode.trim().split('\n')[0].trim();
    if (firstLine.startsWith('flowchart')) {
      setDiagramType('flowchart');
      const nodes: FlowNode[] = [];
      const links: FlowLink[] = [];
      const nodeRegex = /^\s*([a-zA-Z0-9_]+)(?:\["([^"]+)"\]|\{"([^"]+)"\}|\("([^"]+)"\)|\(\("([^"]+)"\)\)|\[\("([^"]+)"\)\])?/gm;
      const linkRegex = /^\s*([a-zA-Z0-9_]+)\s*(?:--\s*(.*?)\s*--|---|-.-\s*(.*?)\s*-.->|==\s*(.*?)\s*==>)\s*([a-zA-Z0-9_]+)/;
      
      currentCode.split('\n').forEach((line, index) => {
          let match;
          // Node definitions
          while ((match = nodeRegex.exec(line)) !== null) {
              const id = match[1];
              const text = match[2] || match[3] || match[4] || match[5] || match[6] || id;
              let type: FlowNodeType = 'node';
              if (match[0].includes('{')) type = 'decision';
              else if (match[0].includes('((')) type = 'circle';
              else if (match[0].includes('([')) type = 'cylinder';
              else if (match[0].includes('(')) type = 'stadium';

              if(!nodes.find(n=>n.id === id)) nodes.push({ id, text, type });
          }

          // Link definitions
          const linkMatch = line.match(/^\s*(\S+)\s*(---|--\s*.*?\s*--|-.->|-->)\s*(\S+)/);
          if (linkMatch) {
              const source = linkMatch[1];
              const linkSyntax = linkMatch[2];
              let target = linkMatch[3];
              let label = '';
              let linkType: LinkType = 'arrow';
              
              if(linkSyntax.includes('-.->')) linkType = 'dotted';
              else if(linkSyntax.includes('---')) linkType = 'line';

              const labelMatch = linkSyntax.match(/--\s*(.*?)\s*--/);
              if (labelMatch) {
                  label = labelMatch[1];
              }
              if (target.endsWith(';')) target = target.slice(0, -1);
              
              links.push({ id: `link-${index}`, source, target, label, linkType });
          }
      });

      setFlowNodes(nodes);
      setFlowLinks(links);

    } else if (firstLine.startsWith('mindmap')) {
      setDiagramType('mindmap');
      const nodes = currentCode.split('\n').slice(1).map((line, index) => {
        const indent = line.search(/\S|$/);
        return {
          id: `mm-${index}`,
          text: line.trim(),
          indent: Math.floor(indent / 2),
        };
      }).filter(node => node.text);
      setMindMapNodes(nodes);
    } else if (firstLine.startsWith('stateDiagram')) {
        setDiagramType('stateDiagram');
        const nodes: FlowNode[] = [];
        const links: FlowLink[] = [];

        currentCode.split('\n').forEach((line, index) => {
          const linkMatch = line.match(/^\s*(\S+)\s*-->\s*(\S+)(?:\s*:\s*(.*))?/);
          if(linkMatch) {
            const source = linkMatch[1];
            let target = linkMatch[2];
            const label = linkMatch[3] || '';
            if (target.endsWith(';')) target = target.slice(0, -1);
            links.push({ id: `link-${index}`, source, target, label, linkType: 'arrow' });
            if(!nodes.find(n => n.id === source) && source !== '[*]') nodes.push({ id: source, text: source, type: 'stadium' });
            if(!nodes.find(n => n.id === target) && target !== '[*]') nodes.push({ id: target, text: target, type: 'stadium' });
          }
        });
        setFlowNodes(nodes);
        setFlowLinks(links);
    } else {
      setDiagramType('unknown');
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
     if (isClient) parseCode(code);
  }, [isClient]);

  const handleCodeChange = (newCode: string, fromVisual?: boolean) => {
    setCode(newCode);
    if (!fromVisual) {
        parseCode(newCode);
    }
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newCode]);
    setHistoryIndex(newHistory.length);
  }

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newCode = history[newIndex];
      setCode(newCode);
      parseCode(newCode);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newCode = history[newIndex];
      setCode(newCode);
       parseCode(newCode);
    }
  }, [history, historyIndex]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); handleUndo(); }
        else if (e.key === 'y') { e.preventDefault(); handleRedo(); }
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
        const { svg: renderedSvg } = await mermaid.render(uniqueId, code);
        setSvg(renderedSvg);
        setRenderError(null);
        setSavedCode(code);
      } catch (error: any) {
        setSvg('');
        if (error.str) { setRenderError(error.str); }
        else { setRenderError('Invalid syntax. Please check your diagram code.'); }
      }
    };

    const timeoutId = setTimeout(() => {
      if (code.trim()) { renderMermaid(); }
      else { setSvg(''); setRenderError(null); }
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

  const generateCodeFromVisual = () => {
    let newCode = '';
    if (diagramType === 'flowchart' || diagramType === 'stateDiagram') {
        const diagramKeyword = diagramType === 'stateDiagram' ? 'stateDiagram-v2' : 'flowchart';
        newCode = `${diagramKeyword} TD\n`;
        flowNodes.forEach(node => {
            const text = node.text || ' ';
            if(node.type === 'node') newCode += `    ${node.id}["${text}"]\n`;
            if(node.type === 'decision') newCode += `    ${node.id}{"${text}"}\n`;
            if(node.type === 'stadium') newCode += `    ${node.id}("${text}")\n`;
            if(node.type === 'cylinder') newCode += `    ${node.id}[("${text}")]\n`;
            if(node.type === 'circle') newCode += `    ${node.id}(("${text}"))\n`;
        });
        flowLinks.forEach(link => {
            if (link.source && link.target) {
                let linkStr = '';
                switch(link.linkType) {
                    case 'line': linkStr = '---'; break;
                    case 'dotted': linkStr = '-.->'; break;
                    case 'arrow': default: linkStr = '-->'; break;
                }
                if (link.label) newCode += `    ${link.source} -- ${link.label} --${link.linkType === 'arrow' ? '>' : ''} ${link.target}\n`;
                else newCode += `    ${link.source} ${linkStr} ${link.target}\n`;
            }
        });
    } else if (diagramType === 'mindmap') {
        newCode = 'mindmap\n';
        mindMapNodes.forEach(node => {
          newCode += `${'  '.repeat(node.indent)}${node.text}\n`;
        });
    }
    if (code !== newCode) {
        handleCodeChange(newCode, true);
    }
  };
  
  // --- Visual Editor Components ---
  
  const FlowchartEditor = () => {
    const addNode = (type: FlowNodeType) => {
        const existingIds = flowNodes.map(n => n.id.charCodeAt(0)).filter(n => n >= 65 && n <= 90);
        const nextIdChar = String.fromCharCode(existingIds.length > 0 ? Math.max(...existingIds) + 1 : 65);
        const newNode: FlowNode = { id: nextIdChar, text: 'New Node', type };
        setFlowNodes(prev => [...prev, newNode]);
    }
    const updateNode = (id: string, text: string) => {
        setFlowNodes(prev => prev.map(n => n.id === id ? {...n, text} : n));
    }
    const removeNode = (id: string) => {
        setFlowNodes(prev => prev.filter(n => n.id !== id));
        setFlowLinks(prev => prev.filter(l => l.source !== id && l.target !== id));
    }
    const addLink = () => {
        setFlowLinks(prev => [...prev, {id: `l${Date.now()}`, source: '', target: '', label: '', linkType: 'arrow'}]);
    }

    const updateLink = useCallback((id: string, updatedLink: FlowLink) => {
      setFlowLinks(prev => prev.map(l => l.id === id ? updatedLink : l));
    }, []);

    const removeLink = useCallback((id: string) => {
        setFlowLinks(prev => prev.filter(l => l.id !== id));
    }, []);

    useEffect(() => {
        generateCodeFromVisual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flowNodes, flowLinks]);
    
    const nodeOptions = flowNodes.map(n => ({ value: n.id, label: `${n.id}: ${n.text}` }));
    if(diagramType === 'stateDiagram') {
        nodeOptions.unshift({ value: '[*]', label: 'Start/End State' });
    }

    return (
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
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('node')}><RectangleHorizontal/></Button></TooltipTrigger><TooltipContent><p>Add Process</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('decision')}><Diamond/></Button></TooltipTrigger><TooltipContent><p>Add Decision</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('stadium')}><Circle/></Button></TooltipTrigger><TooltipContent><p>Add Start/End</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('cylinder')}><Cylinder/></Button></TooltipTrigger><TooltipContent><p>Add Database</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" onClick={() => addNode('circle')}><Circle/></Button></TooltipTrigger><TooltipContent><p>Add Circle</p></TooltipContent></Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-4 pr-4">
                  {flowNodes.map(node => (
                    <div key={node.id} className="space-y-2 rounded-md border p-3">
                        <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground p-2 bg-muted rounded-md">{node.id}</span>
                        <Input value={node.text} onChange={(e) => updateNode(node.id, e.target.value)} className="flex-1"/>
                        <Button size="icon" variant="ghost" onClick={() => removeNode(node.id)}><Trash2/></Button>
                        </div>
                        {flowLinks.filter(l => l.source === node.id || l.target === node.id).length > 0 && (
                        <div className="pl-8 space-y-1">
                            {flowLinks.filter(l => l.source === node.id || l.target === node.id).map(link => (
                            <div key={link.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <LinkIcon className="h-3 w-3" />
                                {link.source === node.id ? ( <><span className="font-mono">{node.id}</span><ArrowRight className="h-3 w-3" /><span className="font-mono">{link.target || '?'}</span></> ) : ( <><span className="font-mono">{link.source || '?'}</span><ArrowRight className="h-3 w-3" /><span className="font-mono">{node.id}</span></> )}
                                {link.label && <span className="text-xs p-1 bg-muted rounded">({link.label})</span>}
                            </div>
                            ))}
                        </div>
                        )}
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
                <div className="space-y-2 pr-4">
                  {flowLinks.map(link => (
                    <LinkEditorRow 
                        key={link.id}
                        initialLink={link}
                        nodeOptions={nodeOptions}
                        onUpdate={updateLink}
                        onRemove={removeLink}
                        smartMode={smartMode}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
    );
  }

  const MindMapEditor = () => {
    const addNode = () => {
        setMindMapNodes(prev => [...prev, { id: `mm-${Date.now()}`, text: 'New Idea', indent: 1 }]);
    }
    const updateNodeText = (id: string, text: string) => {
        setMindMapNodes(prev => prev.map(n => n.id === id ? {...n, text} : n));
    }
    const updateNodeIndent = (id: string, direction: 'in' | 'out') => {
        setMindMapNodes(prev => prev.map(n => {
            if(n.id === id) {
                const newIndent = direction === 'in' ? n.indent + 1 : Math.max(0, n.indent - 1);
                return {...n, indent: newIndent};
            }
            return n;
        }));
    }
    const removeNode = (id: string) => {
        setMindMapNodes(prev => prev.filter(n => n.id !== id));
    }
    
    useEffect(() => {
        generateCodeFromVisual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mindMapNodes]);

    return (
        <div className="flex-1 flex flex-col gap-4 p-4 pt-0 min-h-0">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Mind Map Editor</CardTitle>
                        <Button size="sm" variant="outline" onClick={addNode}><Plus className="mr-2 h-4 w-4" /> Add Idea</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh]">
                        <div className="space-y-2 pr-4">
                            {mindMapNodes.map(node => (
                                <div key={node.id} className="flex items-center gap-2 group" style={{ paddingLeft: `${node.indent * 20}px`}}>
                                    <Input value={node.text} onChange={(e) => updateNodeText(node.id, e.target.value)} className="flex-1" />
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" onClick={() => updateNodeIndent(node.id, 'out')} disabled={node.indent === 0}><Outdent /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => updateNodeIndent(node.id, 'in')}><Indent /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => removeNode(node.id)}><Trash2 /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
  }

  const VisualEditor = () => {
    switch(diagramType) {
        case 'flowchart':
        case 'stateDiagram':
            return <FlowchartEditor />;
        case 'mindmap':
            return <MindMapEditor />;
        default:
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                    <Pencil className="w-12 h-12 mb-4" />
                    <h3 className="font-semibold">No Visual Editor Available</h3>
                    <p>A visual editor for "{selectedDiagram}" is not yet available. Please use the Code editor.</p>
                </div>
            );
    }
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
          <VisualEditor />
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
    <Card className="flex flex-col h-full rounded-none border-0 md:rounded-lg md:border">
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
                <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full h-full flex items-center justify-center [&>svg]:max-w-none [&>svg]:max-h-none"/>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {code.trim() ? <Loader2 className="h-8 w-8 animate-spin"/> : <p>Diagram will appear here.</p>}
                </div>
            )}
          </div>
      </CardContent>
    </Card>
  );

  if (!isClient) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Card>
          <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Diagram: {selectedDiagram}</CardTitle>
                <CardDescription>Select a template or use the editor to build your diagram.</CardDescription>
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
                                            <DropdownMenuItem key={template.label} onClick={() => { handleCodeChange(template.code); setSelectedDiagram(template.label); parseCode(template.code); }}>
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
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Editor</AccordionTrigger>
              <AccordionContent>
                <div className="h-[50vh] overflow-y-auto">
                    {editorPanel}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex-1 min-h-0">
            {previewPanel}
          </div>
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
