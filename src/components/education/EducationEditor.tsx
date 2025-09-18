
'use client';

import React, { useState, useMemo } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Editor } from '../Editor';
import { Header } from '../tempusphere/Header';
import { Footer } from '../tempusphere/Footer';

const defaultCode = `
<div style="font-family: sans-serif; padding: 20px;">
    <h1 style="color: #333;">Welcome to Your First Lesson!</h1>
    <p style="font-size: 16px;">This is a live HTML editor. You can create your own educational content right here.</p>
    
    <h2 style="color: #555; border-bottom: 2px solid #eee; padding-bottom: 5px;">How it Works</h2>
    <p>Simply type your HTML in the editor on the left, and see your creation come to life on the right.</p>

    <h2 style="color: #555; border-bottom: 2px solid #eee; padding-bottom: 5px;">Try it Yourself!</h2>
    <ul>
        <li>Change the text in this document.</li>
        <li>Add a <strong>&lt;strong&gt;</strong> tag to make text bold.</li>
        <li>Create a new list of items.</li>
    </ul>

    <div style="background: #f0f0f0; border-left: 5px solid #2196F3; padding: 15px; margin-top: 20px;">
        <h3 style="margin-top: 0;">Example: The Solar System</h3>
        <p>Our solar system consists of the Sun and everything that orbits it, including 8 planets.</p>
    </div>
</div>
`;


export function EducationEditor() {
    const [code, setCode] = useState(defaultCode);

    const sandboxedHtml = useMemo(() => {
        // A simple sanitizer to prevent script execution, not foolproof for production
        // but fine for this client-side tool.
        const sanitized = code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        return sanitized;
    }, [code]);

    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                <div className="w-full max-w-7xl flex-1 flex flex-col">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold tracking-tighter">Education Studio</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">Create your own interactive lessons using HTML. What you type in the editor on the left will appear in the preview on the right.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] rounded-lg border">
                            <ResizablePanel defaultSize={50}>
                                <div className="relative h-full">
                                    <Editor value={code} onValueChange={setCode} onBlur={() => {}} />
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50}>
                                <iframe
                                    srcDoc={sandboxedHtml}
                                    title="Live Preview"
                                    sandbox="allow-same-origin"
                                    className="w-full h-full bg-white"
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </CardContent>
                </div>
            </main>
            <Footer />
        </div>
    );
}
