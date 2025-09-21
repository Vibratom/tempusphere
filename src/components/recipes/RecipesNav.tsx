'use client';

import React from 'react';
import Link from 'next/link';
import { BookCopy, ShoppingBag, CalendarDays } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tools = [
    { value: 'cookbook', icon: BookCopy, label: 'Cookbook', href: '/recipes/cookbook' },
    { value: 'shopping-list', icon: ShoppingBag, label: 'Shopping List', href: '/recipes/shopping-list' },
    { value: 'meal-planner', icon: CalendarDays, label: 'Meal Planner', href: '/recipes/meal-planner' },
];

const ResponsiveTabsTrigger = ({ value, href, icon: Icon, children }: { value: string, href: string, icon: React.ElementType, children: React.ReactNode }) => (
    <TabsTrigger value={value} asChild className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
        <Link href={href}>
            <Icon className="w-5 h-5" />
            <span className="hidden lg:inline text-xs">{children}</span>
        </Link>
    </TabsTrigger>
);

export function RecipesNav({ activeTool }: { activeTool: string }) {
    const adjustedActiveTool = activeTool === '' ? 'cookbook' : activeTool;
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
