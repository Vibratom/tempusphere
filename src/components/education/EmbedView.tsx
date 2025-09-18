
'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';

const defaultEmbedCode = `<div class="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
    <p class="text-muted-foreground">Paste your embed code in the editor to see a preview.</p>
</div>`;

export function EmbedView() {
    const [embedCode, setEmbedCode] = useLocalStorage<string>('education:embed-code-v3', defaultEmbedCode);

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Interactive Content</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Embed interactive lessons, quizzes, or presentations from platforms like Khan Academy, H5P, Quizizz, or Kahoot by pasting their HTML embed code.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Embed Code</CardTitle>
                        <CardDescription>Paste your HTML embed code here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <Textarea
                            value={embedCode}
                            onChange={(e) => setEmbedCode(e.target.value)}
                            placeholder="e.g., <iframe src='...'></iframe>"
                            className="w-full h-full flex-1 resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                        />
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>The rendered content will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 relative">
                        <div 
                            className="absolute inset-0 w-full h-full"
                            dangerouslySetInnerHTML={{ __html: embedCode }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
