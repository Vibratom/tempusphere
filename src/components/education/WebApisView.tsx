
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PlatformLink } from '../tempusphere/PlatformLink';
import { Brain, GitCommit, DraftingCompass, Table, Code, Languages, MessageSquare } from 'lucide-react';

const tools = [
    { name: 'Translator', category: 'AI', icon: Languages, href: '/education/translator', color: 'bg-green-500 hover:bg-green-600', description: 'Translate text between languages.' },
    { name: 'AI Text Generator', category: 'AI', icon: MessageSquare, href: '/education/text-generator', color: 'bg-blue-500 hover:bg-blue-600', description: 'Generate text with AI.' },
    { name: 'Chart Editor', category: 'Productivity', icon: GitCommit, href: '/projects/chart', color: 'bg-green-500 hover:bg-green-600', description: 'Create flowcharts and diagrams.' },
    { name: 'Mind Map', category: 'Productivity', icon: Brain, href: '/projects/mindmap', color: 'bg-purple-500 hover:bg-purple-600', description: 'Organize ideas with mind maps.' },
    { name: 'Canvas', category: 'Productivity', icon: DraftingCompass, href: '/projects/canvas', color: 'bg-sky-500 hover:bg-sky-600', description: 'A freeform canvas for your ideas.' },
    { name: 'Spreadsheet', category: 'Productivity', icon: Table, href: '/projects/spreadsheet', color: 'bg-emerald-500 hover:bg-emerald-600', description: 'A simple spreadsheet tool.' },
    { name: 'HTML Editor', category: 'Development', icon: Code, href: '/education/editor', color: 'bg-slate-500 hover:bg-slate-600', description: 'A live HTML editor.' },
];

export function ToolboxView() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold tracking-tighter">Toolbox</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">A collection of AI and productivity tools to help you create and learn.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {tools.map(p => <PlatformLink key={p.name} {...p} />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
