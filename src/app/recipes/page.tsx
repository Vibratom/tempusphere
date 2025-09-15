
'use client';

import { RecipesApp } from '@/components/recipes/RecipesApp';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import { NextUIProvider } from '@nextui-org/react';

function RecipesContent() {
  return (
    <SettingsProvider>
      <div className="min-h-screen w-full bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8">
          <RecipesApp />
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NextUIProvider>
        <RecipesContent />
      </NextUIProvider>
    </Suspense>
  );
}

    