'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const calculatorTools = [
    { value: 'unit-converter', label: 'Unit Converter', href: '/culinary/calculators/unit-converter' },
    { value: 'food-cost', label: 'Food Cost', href: '/culinary/calculators/food-cost' },
    { value: 'yield-percentage', label: 'Yield Percentage', href: '/culinary/calculators/yield-percentage' },
];

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeSubTool = useMemo(() => pathname.split('/')[3] || 'unit-converter', [pathname]);

  return (
    <div className="w-full h-full flex flex-col">
        <Tabs defaultValue={activeSubTool} value={activeSubTool} className="w-full flex-1 flex flex-col">
            <div className="text-center my-6">
                <TabsList className="h-auto">
                    {calculatorTools.map(tool => (
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
