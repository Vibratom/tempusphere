
'use client';

import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import { ProductivityProvider } from '@/contexts/ProductivityContext';
import { HabitTracker } from '@/components/productivity/HabitTracker';

function ProductivityContent() {
  return (
    <SettingsProvider>
      <ProductivityProvider>
        <div className="min-h-screen w-full bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center p-4 md:p-8">
              <HabitTracker />
          </main>
          <Footer />
        </div>
      </ProductivityProvider>
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
