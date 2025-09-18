
'use client';

import { Suspense } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { DictionaryApp } from '@/components/education/DictionaryApp';
import { CountryExplorer } from '@/components/education/CountryExplorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Globe } from 'lucide-react';

function EducationContent() {
  return (
    <SettingsProvider>
      <div className="min-h-screen w-full bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-4xl">
                 <Tabs defaultValue="dictionary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dictionary"><BookOpen className="mr-2"/>Dictionary</TabsTrigger>
                        <TabsTrigger value="explorer"><Globe className="mr-2"/>Country Explorer</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dictionary" className="mt-6">
                        <DictionaryApp />
                    </TabsContent>
                    <TabsContent value="explorer" className="mt-6">
                        <CountryExplorer />
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
