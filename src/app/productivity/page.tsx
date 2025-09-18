
'use client';

import { Suspense } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CanvasView } from '@/components/projects/CanvasView';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';

function ProductivityContent() {
  return (
    <SettingsProvider>
      <div className="min-h-screen w-full bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col p-4 md:p-8">
          <CanvasView />
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  )
}

export default function ProductivityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductivityContent />
    </Suspense>
  );
}
