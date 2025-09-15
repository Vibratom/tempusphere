
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
import { FileText, Waypoints, GanttChart, PieChart } from 'lucide-react';

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
`
};

export function FlowchartView() {
  const [code, setCode] = useLocalStorage('flowchart:mermaid-code-v2', diagramTemplates.flowchart);
  const [svg, setSvg] = useState('');
  const [isClient, setIsClient] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
      logLevel: 5, 
    });
  }, [resolvedTheme]);

  useEffect(() => {
    if (!isClient) return;

    const renderMermaid = async () => {
      try {
        // The key is to have a unique ID for mermaid to render into,
        // but it must exist in the DOM before render is called.
        // Using a ref to hold the SVG and then setting it is safer.
        const { svg: renderedSvg } = await mermaid.render('mermaid-graph', code);
        setSvg(renderedSvg);
      } catch (error) {
        console.error("Mermaid render error:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (code.trim()) {
        renderMermaid();
      } else {
        setSvg('');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [code, isClient]);

  if (!isClient) {
    return <div className="w-full h-full bg-muted animate-pulse"></div>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
       <Card>
        <CardHeader>
          <CardTitle>Create a Diagram</CardTitle>
          <CardDescription>
            Use text to create and edit diagrams. Start from scratch or use a template. Your work is saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCode(diagramTemplates.flowchart)}><Waypoints className="mr-2"/>Flowchart</Button>
            <Button variant="outline" onClick={() => setCode(diagramTemplates.sequence)}><FileText className="mr-2"/>Sequence</Button>
            <Button variant="outline" onClick={() => setCode(diagramTemplates.pie)}><PieChart className="mr-2"/>Pie Chart</Button>
            <Button variant="outline" onClick={() => setCode(diagramTemplates.gantt)}><GanttChart className="mr-2"/>Gantt</Button>
        </CardContent>
      </Card>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <Card className="flex flex-col">
          <CardContent className="p-0 flex-1">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
              placeholder="Write your Mermaid.js code here..."
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardContent className="p-4 flex-1">
            <ScrollArea className="h-full w-full">
              {svg ? (
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
