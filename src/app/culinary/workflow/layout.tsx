'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const workflowTools = [
    { value: 'timers', label: 'Kitchen Timer Station', href: '/culinary/workflow/timers' },
    { value: 'checklist', label: 'Recipe Preparation Checklist', href: '/culinary/workflow/checklist' },
    { value: 'kds', label: 'Kitchen Display System (KDS) Light', href: '/culinary/workflow/kds' },
];

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeSubTool = useMemo(() => pathname.split('/')[3] || 'timers', [pathname]);

  return (
    <div className="w-full h-full flex flex-col">
        <Tabs defaultValue={activeSubTool} value={activeSubTool} className="w-full flex-1 flex flex-col">
            <div className="text-center my-6">
                <TabsList className="h-auto">
                    {workflowTools.map(tool => (
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
