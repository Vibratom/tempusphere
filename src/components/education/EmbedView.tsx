
'use client';

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const defaultEmbedCode = `<div style="width: 100%;"><div style="position: relative; padding-bottom: 56.25%; padding-top: 0; height: 0;"><iframe title="Anatomy" frameborder="0" width="1200" height="675" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://view.genial.ly/5f35759324cf360d7c77c64f" type="text/html" allowscriptaccess="always" allowfullscreen="true" scrolling="yes" allownetworking="all"></iframe> </div> </div>`;

export function EmbedView() {
    const [embedCode, setEmbedCode] = useLocalStorage<string>('education:embed-code-v2', defaultEmbedCode);
    const [embedUrl, setEmbedUrl] = useLocalStorage<string>('education:embed-url-v2', 'https://view.genial.ly/5f35759324cf360d7c77c64f');
    const [activeTab, setActiveTab] = useState('simple');

    const generatedCode = useMemo(() => {
        if (!embedUrl) return '<p class="text-muted-foreground text-center p-8">Please enter a URL to generate an embed.</p>';
        return `<iframe 
    src="${embedUrl}" 
    title="Embedded Content" 
    frameborder="0" 
    allow="fullscreen; picture-in-picture"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    allowfullscreen
></iframe>`;
    }, [embedUrl]);

    const codeToRender = activeTab === 'simple' ? generatedCode : embedCode;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Interactive Content</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Embed interactive lessons, quizzes, or presentations from platforms like Genially, H5P, Quizizz, or Kahoot.</p>
            </div>
            
            <ResizablePanelGroup direction="horizontal" className="min-h-[60vh] rounded-lg border">
                <ResizablePanel defaultSize={50}>
                    <div className="flex h-full flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="p-2 border-b">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="simple">Simple (URL)</TabsTrigger>
                                    <TabsTrigger value="advanced">Advanced (HTML)</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="simple" className="p-4 space-y-2">
                                <Label htmlFor="embed-url">Embed URL</Label>
                                <Input 
                                    id="embed-url"
                                    value={embedUrl}
                                    onChange={(e) => setEmbedUrl(e.target.value)}
                                    placeholder="Paste the share URL from your platform here"
                                />
                                <p className="text-xs text-muted-foreground">Find the "Share" or "Embed" link from your chosen platform and paste it here.</p>
                            </TabsContent>
                            <TabsContent value="advanced" className="m-0 p-0">
                                <Textarea
                                    value={embedCode}
                                    onChange={(e) => setEmbedCode(e.target.value)}
                                    placeholder="Paste your full embed code here (e.g., an iframe)"
                                    className="w-full h-full flex-1 resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                                    style={{minHeight: '40vh'}}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                     <div className="flex h-full flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Live Preview</h3>
                        </div>
                        <div 
                            className="flex-1 p-4 bg-muted/20 relative"
                            dangerouslySetInnerHTML={{ __html: codeToRender }}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
