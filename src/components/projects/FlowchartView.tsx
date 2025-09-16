'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { AlertCircle, Loader2 } from 'lucide-react';

const defaultCode = `flowchart TD
    A[Start] --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(Rethink);
    D --> A;
    B -- No --> E(End);`;

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
  logLevel: 5, 
});

export function FlowchartView() {
  const [savedCode, setSavedCode] = useLocalStorage('flowchart:mermaid-code-v8', defaultCode);
  const [code, setCode] = useState(savedCode);
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
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
  
  if (!isClient) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Diagram Editor</CardTitle>
                <CardDescription>Use Mermaid syntax to create diagrams. Your work is saved automatically.</CardDescription>
            </CardHeader>
        </Card>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Mermaid Code</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                        placeholder="Write your Mermaid diagram code here..."
                    />
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                    <ScrollArea className="h-full w-full p-4 rounded-lg" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
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