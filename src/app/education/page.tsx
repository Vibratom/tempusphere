
'use client';

import { Suspense } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { WebApisView } from '@/components/education/WebApisView';
import { EmbedView } from '@/components/education/EmbedView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BookCopy } from 'lucide-react';

function EducationContent() {
  return (
    <SettingsProvider>
      <div className="min-h-screen w-full bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-5xl">
                 <Tabs defaultValue="web-apis" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="web-apis"><BookOpen className="mr-2"/>Reference</TabsTrigger>
                        <TabsTrigger value="interactive"><BookCopy className="mr-2"/>Interactive</TabsTrigger>
                    </TabsList>
                    <TabsContent value="web-apis" className="mt-6">
                        <WebApisView />
                    </TabsContent>
                    <TabsContent value="interactive" className="mt-6">
                        <EmbedView />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  );
}

export default function EducationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EducationContent />
    </Suspense>
  );
}
