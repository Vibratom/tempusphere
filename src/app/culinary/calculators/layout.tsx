'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
             <div className="px-4 md:px-8">
                <Card className="mb-6 bg-secondary/50">
                  <CardHeader>
                    <CardTitle>Looking for More?</CardTitle>
                    <CardDescription>
                      While we offer a few essential culinary calculators here, our partner site, Axiom, hosts the world's largest database of calculators.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border bg-background p-4">
                        <p className="flex-1 text-base">
                            Explore over <strong className="text-primary">260+ different types</strong> of specialized food and cooking calculators on Axiom.
                        </p>
                        <Button asChild className="mt-4 sm:mt-0">
                            <a href="https://axiom.vibratomstudios.com/food" target="_blank" rel="noopener noreferrer">
                                Explore Axiom Food Calculators <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                  </CardContent>
                </Card>
            </div>
            {children}
        </Tabs>
    </div>
  );
}
