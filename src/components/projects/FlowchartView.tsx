
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const defaultMermaidCode = `flowchart TD
    A[Start] --> B{Is it?};
    B -- Yes --> C[OK];
    C --> D[Rethink];
    D --> A;
    B -- No --> E[End];
`;

export function FlowchartView() {
  const [code, setCode] = useLocalStorage('flowchart:mermaid-code-v1', defaultMermaidCode);
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
        const { svg: renderedSvg } = await mermaid.render('mermaid-graph', code);
        setSvg(renderedSvg);
      } catch (error) {
        // Don't toast every time there's a syntax error, just log it.
        console.error("Mermaid render error:", error);
        // Maybe show a small error indicator in the UI instead of a toast
      }
    };

    // Debounce rendering
    const timeoutId = setTimeout(() => {
      if (code.trim()) {
        renderMermaid();
      } else {
        setSvg(''); // Clear SVG if code is empty
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
          <CardTitle>Mermaid.js Editor</CardTitle>
          <CardDescription>
            Create diagrams with text. Try flowcharts, sequence diagrams, Gantt charts, and more.
          </CardDescription>
        </CardHeader>
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
              <div
                ref={mermaidRef}
                dangerouslySetInnerHTML={{ __html: svg }}
                className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
