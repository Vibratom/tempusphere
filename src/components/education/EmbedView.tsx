
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';

const defaultEmbedCode = `<div style="width: 100%;"><div style="position: relative; padding-bottom: 56.25%; padding-top: 0; height: 0;"><iframe title="Anatomy" frameborder="0" width="1200" height="675" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://view.genial.ly/5f35759324cf360d7c77c64f" type="text/html" allowscriptaccess="always" allowfullscreen="true" scrolling="yes" allownetworking="all"></iframe> </div> </div>`;

export function EmbedView() {
    const [embedCode, setEmbedCode] = useLocalStorage<string>('education:embed-code', defaultEmbedCode);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Interactive Content</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Embed interactive lessons, quizzes, or presentations from platforms like Genially, H5P, or Quizizz.</p>
            </div>
            
            <ResizablePanelGroup direction="horizontal" className="min-h-[60vh] rounded-lg border">
                <ResizablePanel defaultSize={50}>
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Embed Code Editor</h3>
                        </div>
                        <Textarea
                            value={embedCode}
                            onChange={(e) => setEmbedCode(e.target.value)}
                            placeholder="Paste your embed code here (e.g., an iframe)"
                            className="w-full h-full flex-1 resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                        />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                     <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Live Preview</h3>
                        </div>
                        <div 
                            className="flex-1 p-4 bg-muted/20"
                            dangerouslySetInnerHTML={{ __html: embedCode }}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
