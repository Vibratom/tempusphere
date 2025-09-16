
'use client';

import React from 'react';
import Link from 'next/link';
import { KanbanSquare, List, BarChartHorizontal, DraftingCompass, Table, ListChecks, Calendar, Spline, Brain, GitCommit } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tools = [
    { value: 'calendar', icon: Calendar, label: 'Calendar', href: '/projects/calendar' },
    { value: 'board', icon: KanbanSquare, label: 'Board', href: '/projects/board' },
    { value: 'list', icon: List, label: 'List', href: '/projects/list' },
    { value: 'gantt', icon: BarChartHorizontal, label: 'Gantt', href: '/projects/gantt' },
    { value: 'spreadsheet', icon: Table, label: 'Spreadsheet', href: '/projects/spreadsheet' },
    { value: 'checklist', icon: ListChecks, label: 'Checklist', href: '/projects/checklist' },
    { value: 'canvas', icon: DraftingCompass, label: 'Canvas', href: '/projects/canvas' },
    { value: 'chart', icon: GitCommit, label: 'Chart', href: '/projects/chart' },
    { value: 'mindmap', icon: Brain, label: 'Mind Map', href: '/projects/mindmap' },
];

const ResponsiveTabsTrigger = ({ value, href, icon: Icon, children }: { value: string, href: string, icon: React.ElementType, children: React.ReactNode }) => (
    <TabsTrigger value={value} asChild className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
        <Link href={href}>
            <Icon className="w-5 h-5" />
            <span className="hidden lg:inline text-xs">{children}</span>
        </Link>
    </TabsTrigger>
);

export function ProjectNav({ activeTool }: { activeTool: string }) {
    const adjustedActiveTool = activeTool;
    return (
        <Tabs defaultValue={adjustedActiveTool} value={adjustedActiveTool} className="flex justify-center">
            <TabsList className="h-auto">
                {tools.map(tool => (
                    <ResponsiveTabsTrigger key={tool.value} value={tool.value} href={tool.href} icon={tool.icon}>
                        {tool.label}
                    </ResponsiveTabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
