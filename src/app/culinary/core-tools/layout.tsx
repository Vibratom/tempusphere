'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const coreTools = [
    { value: 'book', label: 'Recipe Book', href: '/culinary/core-tools/book' },
    { value: 'inventory', label: 'Inventory', href: '/culinary/core-tools/inventory' },
    { value: 'shopping-list', label: 'Shopping List', href: '/culinary/core-tools/shopping-list' },
];

export default function CoreToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeSubTool = useMemo(() => pathname.split('/')[3] || 'book', [pathname]);

  return (
    <div className="w-full h-full flex flex-col">
        <Tabs defaultValue={activeSubTool} value={activeSubTool} className="w-full flex-1 flex flex-col">
            <div className="text-center my-6">
                <TabsList className="h-auto">
                    {coreTools.map(tool => (
                         <TabsTrigger key={tool.value} value={tool.value} asChild>
                            <Link href={tool.href}>{tool.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            {children}
        </Tabs>
    </div>
  );
}
