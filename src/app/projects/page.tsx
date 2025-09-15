
'use client';

import { ProjectsApp } from '@/components/projects/ProjectsApp';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanSquare, ListChecks, Table, DraftingCompass } from 'lucide-react';
import { ChecklistApp } from '@/components/checklist/ChecklistApp';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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


function ProjectsContent() {
  return (
    <SettingsProvider>
      <CalendarProvider>
        <ChecklistProvider>
            <div className="min-h-screen w-full bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                    <Tabs defaultValue="workflow" className="w-full max-w-7xl">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="workflow"><KanbanSquare className="mr-2"/>Workflow</TabsTrigger>
                            <TabsTrigger value="checklist"><ListChecks className="mr-2"/>Checklist</TabsTrigger>
                            <TabsTrigger value="spreadsheet"><Table className="mr-2"/>Spreadsheet</TabsTrigger>
                            <TabsTrigger value="canvas"><DraftingCompass className="mr-2"/>Canvas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="workflow" className="mt-4">
                            <ProjectsApp />
                        </TabsContent>
                        <TabsContent value="checklist" className="mt-4">
                            <ChecklistApp />
                        </TabsContent>
                        <TabsContent value="spreadsheet" className="mt-4">
                            <PlaceholderTool name="Spreadsheet" icon={Table} />
                        </TabsContent>
                        <TabsContent value="canvas" className="mt-4">
                            <PlaceholderTool name="Canvas" icon={DraftingCompass} />
                        </TabsContent>
                    </Tabs>
                </main>
                <Footer />
            </div>
        </ChecklistProvider>
      </CalendarProvider>
    </SettingsProvider>
  );
}


export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  )
}
