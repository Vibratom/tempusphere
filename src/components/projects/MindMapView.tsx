'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const defaultMermaidCode = `mindmap
  root((Mind Map))
    Easy to Use
      Just use indentation
      - Deeper
        - Even Deeper
    Powerful
      Supports Markdown
      **Bold**
      *Italic*
      \`Code\`
    Fun
      Use Emojis!
      :joy:
      :tada:
`;

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
  logLevel: 5, 
});

export function MindMapView() {
  const [code, setCode] = useLocalStorage('mindmap:mermaid-code-v2', defaultMermaidCode);
  const [svg, setSvg] = useState('');
  const [isClient, setIsClient] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
    });

    const renderMermaid = async () => {
      try {
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
  }, [code, isClient, resolvedTheme]);

  if (!isClient) {
    return <div className="w-full h-full bg-muted animate-pulse"></div>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
       <Card>
        <CardHeader>
          <CardTitle>Mind Map Creator</CardTitle>
          <CardDescription>
            Organize your thoughts with a simple, text-based mind map. Just use indentation to create branches.
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
              placeholder="Write your mind map code here..."
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
