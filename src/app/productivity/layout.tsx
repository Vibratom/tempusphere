
'use client';

import React, { useMemo } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ProductivityNav } from '@/components/productivity/ProductivityNav';

export default function ProductivityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeTool = useMemo(() => pathname.split('/')[2] || 'dashboard', [pathname]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-7xl flex flex-col flex-1 gap-4">
            <ProductivityNav activeTool={activeTool} />
                <Card className="flex-1">
                <CardContent className="p-0 md:p-0 h-full">
                    {children}
                </CardContent>
            </Card>
            </div>
        </main>
        <Footer />
    </div>
  )
}
