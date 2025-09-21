
'use client';

import React from 'react';
import Link from 'next/link';
import { Soup, Calculator, Workflow, Trash2, LayoutDashboard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tools = [
    { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/culinary' },
    { value: 'core-tools', icon: Soup, label: 'Core Tools', href: '/culinary/core-tools' },
    { value: 'calculators', icon: Calculator, label: 'Calculators', href: '/culinary/calculators' },
    { value: 'waste-tracker', icon: Trash2, label: 'Waste Tracker', href: '/culinary/waste-tracker' },
    { value: 'workflow', icon: Workflow, label: 'Workflow', href: '/culinary/workflow' },
];

const ResponsiveTabsTrigger = ({ value, href, icon: Icon, children }: { value: string, href: string, icon: React.ElementType, children: React.ReactNode }) => (
    <TabsTrigger value={value} asChild className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
        <Link href={href}>
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">{children}</span>
        </Link>
    </TabsTrigger>
);

export function CulinaryNav({ activeTool }: { activeTool: string }) {
    const adjustedActiveTool = activeTool === '' || activeTool === 'culinary' ? 'dashboard' : activeTool;
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
