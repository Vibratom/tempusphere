
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const marketingTools = [
    { value: 'channels', label: 'Channels', href: '/productivity/marketing/channels' },
    { value: 'planning', label: 'Planning Template', href: '/productivity/marketing/planning' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeSubTool = useMemo(() => pathname.split('/')[3] || 'channels', [pathname]);

  return (
    <div className="w-full h-full flex flex-col">
        <Tabs defaultValue={activeSubTool} value={activeSubTool} className="w-full flex-1 flex flex-col">
            <div className="text-center mb-6">
                <TabsList className="h-auto">
                    {marketingTools.map(tool => (
                         <TabsTrigger key={tool.value} value={tool.value} asChild>
                            <Link href={tool.href}>{tool.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>