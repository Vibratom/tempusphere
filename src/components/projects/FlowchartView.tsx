'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { FileText, Waypoints, GanttChart, PieChart, Download, Shapes, Workflow, Database, AlertCircle, Users, Milestone, CalendarClock, GitBranch, Palette, MousePointerClick, Spline, Network, FileCheck2, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const diagramTemplates = {
  flowchart: `flowchart TD
    A[Start] --> B{Is it?};
    B -- Yes --> C[OK];
    C --> D[Rethink];
    D --> A;
    B -- No --> E[End];
`,
  sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail...
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
`,
  class: `classDiagram
    class Animal {
      +String name
      +int age
      +void makeSound()
    }
    class Dog {
      +String breed
      +void bark()
    }
    class Cat {
      +String color
      +void meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
`,
  state: `stateDiagram-v2
    [*] --> Still
    Still --> [*]

    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
`,
  er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
`,
  pie: `pie
    title Key-Value Distribution
    "Databases" : 80
    "Messaging" : 20
`,
  gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
`,
  uiFlow: `flowchart LR
    subgraph "User Login Flow"
        A[Start: User visits Login Page] --> B{Enters credentials};
        B --> C[Clicks 'Log In' button];
        C --> D{API: Authenticate user};
        D -- Success --> E[Redirect to Dashboard];
        D -- Failure --> F[Show 'Invalid credentials' error];
        F --> B;
        E --> G[End: User is logged in];
    end
`,
  decisionTree: `flowchart TD
    A{Should I deploy on Friday?}
    A -- Yes --> B{Is there a critical bug fix?};
    A -- No --> C[Enjoy the weekend!];
    
    B -- Yes --> D[Deploy with monitoring];
    B -- No --> E{Can it wait until Monday?};
    
    E -- Yes --> F[Schedule for Monday morning];
    E -- No --> G[Deploy... but be ready for a long night];
`,
  orgChart: `flowchart TD
    subgraph "Executive Team"
        A(CEO)
    end
    subgraph "Product Division"
        B(Head of Product)
        C(Product Manager)
        D(UX/UI Designer)
    end
    subgraph "Engineering Division"
        E(CTO)
        F(Engineering Lead)
        G[Developer 1]
        H[Developer 2]
    end
    A --> B;
    A --> E;
    B --> C;
    B --> D;
    E --> F;
    F --> G;
    F --> H;
`,
  timeline: `timeline
    title Project Development Timeline
    2024-07-01 : Kick-off & Brainstorming
    2024-07-15 : UI/UX Design Phase
             : Initial Mockups
             : User Feedback Session
    2024-08-01 : Development Sprint 1
             : Backend Setup
             : Frontend Components
    2024-08-15 : Launch Beta Version
`,
stylingDemo: `flowchart TD
    A[Start] --> B(Styled Node);
    B --> C{Decision};
    
    style A fill:#f9f,stroke:#333,stroke-width:4px
    style B fill:#ccf,stroke:#333,stroke-width:2px,stroke-dasharray: 5, 5
    
    linkStyle 0 stroke-width:2px,fill:none,stroke:green;
    linkStyle 1 stroke-width:4px,fill:none,stroke:orange;
`,
interactive: `flowchart TD
    A[Start] --> B[Go to Google];
    B --> C[End];
    
    click B "https://www.google.com" "This is a tooltip for the Google link"
`,
swimlane: `flowchart TD
    subgraph "Sales"
        A[Qualify Lead] --> B{Contract > $10k?};
    end
    subgraph "Legal"
        B -- Yes --> C[Review Contract];
        C --> D[Approve Contract];
    end
    subgraph "Finance"
        B -- No --> E[Issue Invoice];
        D --> F[Issue Invoice];
    end
`,
workflow: `flowchart TD
    A[Draft Content] --> B{Submit for Review};
    B -- Needs Changes --> A;
    B -- Approved --> C[Schedule for Publishing];
    C --> D((Published));
`,
dataFlow: `graph TD
    A(External Source) --> |Data| B[Process Data];
    B --> C{Store in Database};
    C --> D[Data Store];
`,
bpmn: `graph TD
    A(Start) --> B{Gateway};
    B --> C[Task 1];
    B --> D[Task 2];
    subgraph "Group"
        C --> E[Task 3];
        D --> E;
    end
    E --> F(End);
`,
};

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral';

export function FlowchartView() {
  const [code, setCode] = useLocalStorage('flowchart:mermaid-code-v4', diagramTemplates.flowchart);
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
    return <div className="w-full h-full bg-muted animate-pulse"></div>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Card>
          <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Start from a pre-made template to learn the syntax for various diagram types, including interactive ones.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setCode(diagramTemplates.flowchart)}><Spline className="mr-2"/>Flowchart</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.swimlane)}><Network className="mr-2"/>Swimlane</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.workflow)}><FileCheck2 className="mr-2"/>Workflow</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.dataFlow)}><Database className="mr-2"/>Data Flow</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.bpmn)}><Briefcase className="mr-2"/>BPMN</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.sequence)}><FileText className="mr-2"/>Sequence</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.class)}><Shapes className="mr-2"/>Class</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.state)}><Workflow className="mr-2"/>State</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.er)}><Database className="mr-2"/>ER Diagram</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.pie)}><PieChart className="mr-2"/>Pie Chart</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.gantt)}><GanttChart className="mr-2"/>Gantt</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.uiFlow)}><Milestone className="mr-2"/>UI Flow</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.decisionTree)}><GitBranch className="mr-2"/>Decision Tree</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.orgChart)}><Users className="mr-2"/>Org Chart</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.timeline)}><CalendarClock className="mr-2"/>Timeline</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.stylingDemo)}><Palette className="mr-2"/>Styling Demo</Button>
              <Button variant="outline" onClick={() => setCode(diagramTemplates.interactive)}><MousePointerClick className="mr-2"/>Interactive</Button>
          </CardContent>
      </Card>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-4">
            <Card className="flex flex-col flex-1">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Create a Diagram</CardTitle>
                        <CardDescription>Describe your structure using Mermaid.js syntax.</CardDescription>
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
                <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1">
            <ScrollArea className="h-full w-full">
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
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
