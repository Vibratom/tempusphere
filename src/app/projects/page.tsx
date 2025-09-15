
'use client';

import React, { Suspense } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanSquare, ListChecks, Table, DraftingCompass, List, BarChartHorizontal, Calendar, BrainCircuit } from 'lucide-react';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsProvider } from '@/contexts/ProjectsContext';

// Dynamically import components for lazy loading
const ProjectsApp = React.lazy(() => import('@/components/projects/ProjectsApp').then(module => ({ default: module.ProjectsApp })));
const ProjectListView = React.lazy(() => import('@/components/projects/ProjectListView').then(module => ({ default: module.ProjectListView })));
const GanttChartView = React.lazy(() => import('@/components/projects/GanttChartView').then(module => ({ default: module.GanttChartView })));
const CalendarPanel = React.lazy(() => import('@/components/tempusphere/CalendarPanel').then(module => ({ default: module.CalendarPanel })));
const MindMapView = React.lazy(() => import('@/components/projects/MindMapView').then(module => ({ default: module.MindMapView })));
const SpreadsheetView = React.lazy(() => import('@/components/projects/SpreadsheetView').then(module => ({ default: module.SpreadsheetView })));
const ChecklistApp = React.lazy(() => import('@/components/checklist/ChecklistApp').then(module => ({ default: module.ChecklistApp })));

const PlaceholderTool = ({ name, icon: Icon }: { name: string, icon: React.ComponentType<any> }) => (
    <Card className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <CardHeader>
            <div className="mx-auto bg-muted p-4 rounded-full">
                <Icon className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">{name}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This tool is coming soon!</p>
        </CardContent>
    </Card>
);

const ResponsiveTabsTrigger = ({ value, icon: Icon, children }: { value: string, icon: React.ElementType, children: React.ReactNode }) => (
    <TabsTrigger value={value} className="flex-col h-auto gap-1 p-2 md:p-3 lg:flex-row lg:gap-2">
        <Icon className="w-5 h-5" />
        <span className="hidden lg:inline text-xs">{children}</span>
    </TabsTrigger>
);

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center">
        <p>Loading...</p>
    </div>
);

function ProjectsContent() {
  return (
    <SettingsProvider>
      <CalendarProvider>
        <ChecklistProvider>
          <ProjectsProvider>
            <div className="min-h-screen w-full bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col items-center p-4 md:p-8">
                      <Tabs defaultValue="board" className="w-full max-w-7xl flex flex-col flex-1">
                          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8">
                              <ResponsiveTabsTrigger value="calendar-view" icon={Calendar}>Calendar</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="board" icon={KanbanSquare}>Board</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="list" icon={List}>List</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="gantt" icon={BarChartHorizontal}>Gantt</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="mindmap" icon={BrainCircuit}>Mind Map</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="spreadsheet" icon={Table}>Spreadsheet</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="checklist" icon={ListChecks}>Checklist</ResponsiveTabsTrigger>
                              <ResponsiveTabsTrigger value="canvas" icon={DraftingCompass}>Canvas</ResponsiveTabsTrigger>
                          </TabsList>
                          <Suspense fallback={<LoadingFallback />}>
                              <TabsContent value="calendar-view" className="mt-4 flex-1 flex flex-col">
                                  <CalendarPanel />
                              </TabsContent>
                              <TabsContent value="board" className="mt-4 flex-1 flex flex-col">
                                  <ProjectsApp />
                              </TabsContent>
                              <TabsContent value="list" className="mt-4 flex-1 flex flex-col">
                                  <ProjectListView />
                              </TabsContent>
                              <TabsContent value="gantt" className="mt-4 flex-1 flex flex-col">
                                  <GanttChartView />
                              </TabsContent>
                               <TabsContent value="mindmap" className="mt-4 flex-1 flex flex-col">
                                  <MindMapView />
                              </TabsContent>
                              <TabsContent value="spreadsheet" className="mt-4 flex-1 flex flex-col">
                                  <SpreadsheetView />
                              </TabsContent>
                              <TabsContent value="checklist" className="mt-4">
                                  <ChecklistApp />
                              </TabsContent>
                              <TabsContent value="canvas" className="mt-4">
                                  <PlaceholderTool name="Canvas" icon={DraftingCompass} />
                              </TabsContent>
                          </Suspense>
                      </Tabs>
                    </div>
                </main>
                <Footer />
            </div>
          </ProjectsProvider>
        </ChecklistProvider>
      </CalendarProvider>
    </SettingsProvider>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading Page...</div>}>
      <ProjectsContent />
    </Suspense>
  )
}
