'use client';

import { NexusFlowApp } from '@/components/nexusflow/NexusFlowApp';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';

export default function NexusFlowPage() {
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
