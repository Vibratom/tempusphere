
'use client';

import { ChecklistApp } from '@/components/checklist/ChecklistApp';
import { Header } from '@/components/tempusphere/Header';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Footer } from '@/components/tempusphere/Footer';

export default function ChecklistPage() {
  return (
    <SettingsProvider>
      <CalendarProvider>
        <div className="min-h-screen w-full bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center p-4 md:p-8">
              <ChecklistApp />
          </main>
          <Footer />
        </div>
      </CalendarProvider>
    </SettingsProvider>
  );
}
