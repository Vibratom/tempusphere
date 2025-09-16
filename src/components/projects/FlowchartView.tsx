
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Download, Palette, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu';

const diagramTemplates = {
  flowAndProcess: {
    label: "Flow & Process",
    templates: {
        flowchart: { label: "Flowchart", code: `flowchart TD\n    A(Start) --> B{Is it?};\n    B -- Yes --> C(OK);\n    C --> D(Rethink);\n    D --> A;\n    B -- No --> E(End);`},
        swimlane: { label: "Swimlane Chart", code: `flowchart TD\n    subgraph CUSTOMER\n        A[Place a Product Order] --> B\n        H[Finish]\n    end\n    subgraph SALES\n        B(Confirm if order is received) --> C\n        F{Cancel the order}\n    end\n    subgraph STOCKS\n        C(Check the inventory) --> D{Is the product in stock?}\n        D -- NO --> F\n        I(Deliver the order) --> H\n    end\n    subgraph FINANCE\n        D -- YES --> E(Check credit card)\n        E --> G{Is the card valid?}\n        G -- YES --> J(Processing the payment)\n        G -- NO --> F\n        J --> I\n    end`},
        workflow: { label: "Workflow Diagram", code: `flowchart TD\n    A((Start)) --> B[Draft Document];\n    B --> C{Review Required?};\n    C -- Yes --> D[Submit for Review];\n    D --> E{Approved?};\n    E -- No --> B;\n    C -- No --> F[Publish Document];\n    E -- Yes --> F;\n    F --> G((End));`},
        bpmn: { label: "BPMN", code: `bpmn\n    title Simple BPMN Process\n\n    start event: Start\n    task: Step 1\n    exclusive gateway: Is it valid?\n    task: Step 2a\n    task: Step 2b\n    end event: End\n\n    start event -> task\n    task -> exclusive gateway\n    exclusive gateway -- Yes --> task\n    exclusive gateway -- No --> task\n    task -> end event\n    task -> end event`},
        state: { label: "State Diagram", code: `stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]`},
        decisionTree: { label: "Decision Tree", code: `flowchart TD\n    A{Should I deploy on Friday?}\n    A -- Yes --> B{Is there a critical bug fix?};\n    A -- No --> C[Enjoy the weekend!];\n    \n    B -- Yes --> D[Deploy with monitoring];\n    B -- No --> E{Can it wait until Monday?};\n    \n    E -- Yes --> F[Schedule for Monday morning];\n    E -- No --> G[Deploy... but be ready for a long night];`},
    },
  },
  sequenceAndInteraction: {
      label: "Sequence & Interaction",
      templates: {
          sequence: { label: "Sequence Diagram", code: `sequenceDiagram\n    participant Alice\n    participant Bob\n    Alice->>John: Hello John, how are you?\n    loop Healthcheck\n        John->>John: Fight against hypochondria\n    end\n    Note right of John: Rational thoughts <br/>prevail...\n    John-->>Alice: Great!\n    John->>Bob: How about you?\n    Bob-->>John: Jolly good!`},
          uiFlow: { label: "UI Flow", code: `flowchart LR\n    subgraph "User Login Flow"\n        A[Start: User visits Login Page] --> B{Enters credentials};\n        B --> C[Clicks 'Log In' button];\n        C --> D{API: Authenticate user};\n        D -- Success --> E[Redirect to Dashboard];\n        D -- Failure --> F[Show 'Invalid credentials' error];\n        F --> B;\n        E --> G[End: User is logged in];\n    end`},
          interactive: { label: "Interactive Diagram", code: `flowchart TD\n    A[Start] --> B[Go to Google];\n    B --> C[End];\n    \n    click B "https://www.google.com" "This is a tooltip for the Google link"`},
      }
  },
  dataAndStructure: {
      label: "Data & Structure",
      templates: {
          class: { label: "Class Diagram", code: `classDiagram\n    class Animal {\n      +String name\n      +int age\n      +void makeSound()\n    }\n    class Dog {\n      +String breed\n      +void bark()\n    }\n    class Cat {\n      +String color\n      +void meow()\n    }\n    Animal <|-- Dog\n    Animal <|-- Cat`},
          er: { label: "ER Diagram", code: `erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`},
          dataFlow: { label: "Data Flow", code: `graph TD\n    A[External Entity] -- Data --> B{Process Data};\n    B -- Stored Data --> C[(Data Store)];`},
          orgChart: { label: "Org Chart", code: `flowchart TD\n    subgraph "Executive Team"\n        A(CEO)\n    end\n    subgraph "Product Division"\n        B(Head of Product)\n        C(Product Manager)\n        D(UX/UI Designer)\n    end\n    subgraph "Engineering Division"\n        E(CTO)\n        F(Engineering Lead)\n        G[Developer 1]\n        H[Developer 2]\n    end\n    A --> B;\n    A --> E;\n    B --> C;\n    B --> D;\n    E --> F;\n    F --> G;\n    F --> H;`},
      }
  },
  planning: {
      label: "Planning",
      templates: {
          gantt: { label: "Gantt Chart", code: `gantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Section\n    A task           :a1, 2014-01-01, 30d\n    Another task     :after a1  , 20d\n    section Another\n    Task in sec      :2014-01-12  , 12d\n    another task      : 24d`},
          timeline: { label: "Timeline", code: `timeline\n    title Project Development Timeline\n    2024-07-01 : Kick-off & Brainstorming\n    2024-07-15 : UI/UX Design Phase\n             : Initial Mockups\n             : User Feedback Session\n    2024-08-01 : Development Sprint 1\n             : Backend Setup\n             : Frontend Components\n    2024-08-15 : Launch Beta Version`},
      }
  },
  charts: {
      label: "Charts",
      templates: {
          pie: { label: "Pie Chart", code: `pie\n    title Key-Value Distribution\n    "Databases" : 80\n    "Messaging" : 20`},
      }
  },
  styling: {
      label: "Styling",
      templates: {
          stylingDemo: { label: "Styling Demo", code: `flowchart TD\n    A[Start] --> B(Styled Node);\n    B --> C{Decision};\n    \n    style A fill:#f9f,stroke:#333,stroke-width:4px\n    style B fill:#ccf,stroke:#333,stroke-width:2px,stroke-dasharray: 5, 5\n    \n    linkStyle 0 stroke-width:2px,fill:none,stroke:green;\n    linkStyle 1 stroke-width:4px,fill:none,stroke:orange;`},
      }
  }
};


type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral';

export function FlowchartView() {
  const [code, setCode] = useLocalStorage('flowchart:mermaid-code-v4', diagramTemplates.flowAndProcess.templates.flowchart.code);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default');
  const [customCSS, setCustomCSS] = useLocalStorage('flowchart:custom-css-v1', '/* Target elements with CSS classes */\n.node-style {\n  font-weight: bold;\n}');

  useEffect(() => {
    setIsClient(true);
  }, []);
  

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
        const finalCode = `${code}\n${customCSS ? `\n%%{init: {'themeCSS': '${customCSS.replace(/\n/g, ' ')}' }}%%` : ''}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, finalCode);
        setSvg(renderedSvg);
        setRenderError(null);
      } catch (error) {
        setRenderError('Invalid syntax. Please check your diagram code.');
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
    }, 50);

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
              <CardDescription>Create complex diagrams by writing code. Start from a template to learn the syntax.</CardDescription>
          </CardHeader>
          <CardContent>
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
                <CardContent className="p-0 flex-1">
                    <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                    placeholder="Write your Mermaid.js code here..."
                    />
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
            <CardHeader>
                <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1">
            <ScrollArea className="h-full w-full">
               <div className="w-full h-full p-4 rounded-lg" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {renderError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-destructive-foreground bg-destructive/80 rounded-lg p-4">
                        <AlertCircle className="w-10 h-10 mb-2"/>
                        <p className="font-semibold">{renderError}</p>
                    </div>
                ) : svg ? (
                    <div
                        ref={mermaidRef}
                        dangerouslySetInnerHTML={{ __html: svg }}
                        className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <p>Diagram will appear here.</p>
                    </div>
                )}
               </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
