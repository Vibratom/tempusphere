
'use client';

import { MindMap } from '@/components/mind-map/MindMap';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import { ProjectsProvider } from '@/contexts/ProjectsContext';


function MindMapContent() {
  return (
    <SettingsProvider>
        <ProjectsProvider>
          <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
              <MindMap />
            </main>
            <Footer />
          </div>
        </ProjectsProvider>
    </SettingsProvider>
  );
}

export default function MindMapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <MindMapContent />
    </Suspense>
  );
}
