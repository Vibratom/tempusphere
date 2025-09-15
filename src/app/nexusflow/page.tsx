'use client';

import { NexusFlowApp } from '@/components/nexusflow/NexusFlowApp';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { Suspense } from 'react';

function NexusFlowContent() {
  return (
    <SettingsProvider>
      <CalendarProvider>
        <div className="min-h-screen w-full bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center p-4 md:p-8">
              <NexusFlowApp />
          </main>
          <Footer />
        </div>
      </CalendarProvider>
    </SettingsProvider>
  );
}


export default function NexusFlowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NexusFlowContent />
    </Suspense>
  )
}
