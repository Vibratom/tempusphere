
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Download, AlertCircle, Loader2, ChevronDown, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import { zoom, ZoomBehavior, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';

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
      zenuml: { label: "ZenUML", code: `zenuml\n    Alice->Bob: Hello Bob\n    Bob->>Alice: Hi Alice`},
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


const customThemes = {
    sunset: {
        primaryColor: '#ff7e5f',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#ff7e5f',
        lineColor: '#d65b40',
        secondaryColor: '#feb47b',
        tertiaryColor: '#ffac7f',
        nodeBkg: '#ff7e5f',
        nodeTextColor: '#ffffff',
        mainBkg: '#fff8f4',
    },
    ocean: {
        primaryColor: '#00b4d8',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#00b4d8',
        lineColor: '#0077b6',
        secondaryColor: '#90e0ef',
        tertiaryColor: '#ade8f4',
        nodeBkg: '#00b4d8',
        nodeTextColor: '#ffffff',
        mainBkg: '#f0f9ff'
    }
}

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base' | 'sunset' | 'ocean';

export function FlowchartView() {
  const [code, setCode] = useLocalStorage('flowchart:mermaid-code-v5', diagramTemplates.flowAndProcess.templates.flowchart.code);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default');
  const [customCSS, setCustomCSS] = useLocalStorage('flowchart:custom-css-v1', '/* Target elements with CSS classes */\n.node-style {\n  font-weight: bold;\n}');

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>();

  useEffect(() => {
    setIsClient(true);
  }, []);

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

    let themeVariables = {};
    let finalTheme: MermaidTheme | 'base' = mermaidTheme;

    if (mermaidTheme === 'sunset' || mermaidTheme === 'ocean') {
        themeVariables = customThemes[mermaidTheme];
        finalTheme = 'base';
    }

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : finalTheme,
      themeVariables,
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
      logLevel: 5,
    });

    const renderMermaid = async () => {
      try {
        const uniqueId = `mermaid-graph-${Date.now()}`;
        const finalCode = `${code}\n${customCSS ? `\n%%{init: {'themeCSS': '${customCSS.replace(/\n/g, ' ')}' }}%%` : ''}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, finalCode);
        setSvg(renderedSvg);
        setRenderError(null);
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
  }, [code, isClient, resolvedTheme, mermaidTheme, customCSS]);
  
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
          <CardHeader>
              <CardTitle>Diagram from Text</CardTitle>
              <CardDescription>Select a template to get started with your diagram.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
                                        <DropdownMenuItem key={template.label} onClick={() => setCode(template.code)}>
                                            {template.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
      </Card>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-4">
            <Card className="flex flex-col flex-1">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Code Editor</CardTitle>
                        <CardDescription>Edit your Mermaid.js syntax here.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportSvg}><Download className="mr-2"/>Export as SVG</Button>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative">
                   <ScrollArea className="absolute inset-0">
                        <Editor
                            value={code}
                            onValueChange={setCode}
                            highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
                            padding={16}
                            className="font-mono text-sm"
                            style={{
                                minHeight: '100%',
                            }}
                        />
                   </ScrollArea>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Customization</CardTitle>
                    <CardDescription>Fine-tune the look and feel of your diagram.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="grid grid-cols-2 gap-4 items-center">
                        <p>Theme</p>
                        <Select value={mermaidTheme} onValueChange={(v) => setMermaidTheme(v as MermaidTheme)} disabled={resolvedTheme === 'dark'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="forest">Forest</SelectItem>
                                <SelectItem value="neutral">Neutral</SelectItem>
                                <SelectItem value="base">Base</SelectItem>
                                <SelectItem value="sunset">Sunset</SelectItem>
                                <SelectItem value="ocean">Ocean</SelectItem>
                                <SelectItem value="dark" disabled>Dark (auto)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex flex-col gap-2">
                        <p>Custom CSS</p>
                        <Textarea
                            value={customCSS}
                            onChange={(e) => setCustomCSS(e.target.value)}
                            className="w-full resize-y border rounded-md p-2 font-mono text-xs"
                            placeholder="e.g., .node-class { fill: #f00; }"
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Live Preview</CardTitle>
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
      </div>
    </div>
  );
}

    

    