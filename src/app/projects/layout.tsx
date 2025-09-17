
'use client';

import React, { Suspense, useMemo } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { usePathname } from 'next/navigation';
import { ProjectNav } from '@/components/projects/ProjectNav';
import { Card, CardContent } from '@/components/ui/card';
import { FinanceProvider } from '@/contexts/FinanceContext';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeTool = useMemo(() => pathname.split('/')[2] || '', [pathname]);

  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading Page...</div>}>
      <SettingsProvider>
        <CalendarProvider>
          <ChecklistProvider>
            <ProjectsProvider>
              <FinanceProvider>
                <div className="min-h-screen w-full bg-background flex flex-col">
                    <Header />
                    <main className="flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col items-center p-4 md:p-8">
                          <div className="w-full max-w-7xl flex flex-col flex-1 gap-4">
                            <ProjectNav activeTool={activeTool} />
                             <Card className="flex-1">
                                <CardContent className="p-0 md:p-0 h-full">
                                  {children}
                                </CardContent>
                            </Card>
                          </div>
                        </div>
                    </main>
                    <Footer />
                </div>
              </FinanceProvider>
            </ProjectsProvider>
          </ChecklistProvider>
        </CalendarProvider>
      </SettingsProvider>
    </Suspense>
  )
}
