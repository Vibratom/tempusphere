
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
import BoardPage from './board/page';
import CalendarViewPage from './calendar/page';
import ListPage from './list/page';
import GanttPage from './gantt/page';
import CanvasPage from './canvas/page';
import SpreadsheetPage from './spreadsheet/page';
import ChecklistPage from './checklist/page';

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center">
        <p>Loading Tools...</p>
    </div>
);

const toolComponents: Record<string, React.ComponentType> = {
    board: BoardPage,
    calendar: CalendarViewPage,
    list: ListPage,
    gantt: GanttPage,
    canvas: CanvasPage,
    spreadsheet: SpreadsheetPage,
    checklist: ChecklistPage,
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const activeTool = useMemo(() => pathname.split('/').pop() || 'board', [pathname]);

  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading Page...</div>}>
      <SettingsProvider>
        <CalendarProvider>
          <ChecklistProvider>
            <ProjectsProvider>
              <div className="min-h-screen w-full bg-background flex flex-col">
                  <Header />
                  <main className="flex-1 flex flex-col">
                      <div className="flex-1 flex flex-col items-center p-4 md:p-8">
                        <div className="w-full max-w-7xl flex flex-col flex-1 gap-4">
                          <ProjectNav activeTool={activeTool} />
                           <Card className="flex-1">
                              <CardContent className="p-4 md:p-6 h-full">
                                <Suspense fallback={<LoadingFallback />}>
                                   {Object.entries(toolComponents).map(([toolName, ToolComponent]) => (
                                       <div key={toolName} style={{ display: activeTool === toolName ? 'block' : 'none' }} className="h-full w-full">
                                          <ToolComponent />
                                       </div>
                                   ))}
                                </Suspense>
                              </CardContent>
                          </Card>
                        </div>
                      </div>
                  </main>
                  <Footer />
              </div>
            </ProjectsProvider>
          </ChecklistProvider>
        </CalendarProvider>
      </SettingsProvider>
    </Suspense>
  )
}
