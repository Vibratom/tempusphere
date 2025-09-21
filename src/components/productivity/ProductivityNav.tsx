
'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, BrainCircuit } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tools = [
    { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/productivity' },
    { value: 'mom', icon: FileText, label: 'MoM', href: '/productivity/mom' },
    { value: 'swot', icon: BrainCircuit, label: 'SWOT', href: '/productivity/swot' },
];

const ResponsiveTabsTrigger = ({ value, href, icon: Icon, children }: { value: string, href: string, icon: React.ElementType, children: React.ReactNode }) => (
    <TabsTrigger value={value} asChild className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
        <Link href={href}>
            <Icon className="w-5 h-5" />
            <span className="hidden lg:inline text-xs">{children}</span>
        </Link>
    </TabsTrigger>
);

export function ProductivityNav({ activeTool }: { activeTool: string }) {
    const adjustedActiveTool = activeTool === '' ? 'dashboard' : activeTool;
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
