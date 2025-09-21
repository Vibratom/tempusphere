
'use client';

import { CulinaryApp } from '@/components/culinary/CulinaryApp';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import { CalendarProvider } from '@/contexts/CalendarContext';

export default function CulinaryPage() {
  return (
    <SettingsProvider>
      <ChecklistProvider>
        <CalendarProvider>
          <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
              <div className="w-full max-w-7xl flex-1">
                <CulinaryApp />
              </div>
            </main>
            <Footer />
          </div>
        </CalendarProvider>
      </ChecklistProvider>
    </SettingsProvider>
  );
}
