
'use client';

import { FinanceApp } from '@/components/finance/FinanceApp';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ChecklistProvider } from '@/contexts/ChecklistContext';

function FinanceContent() {
  return (
    <SettingsProvider>
      <CalendarProvider>
        <ChecklistProvider>
          <ProjectsProvider>
            <FinanceProvider>
              <div className="min-h-screen w-full bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                  <FinanceApp />
                </main>
                <Footer />
              </div>
            </FinanceProvider>
          </ProjectsProvider>
        </ChecklistProvider>
      </CalendarProvider>
    </SettingsProvider>
  )
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinanceContent />
    </Suspense>
  );
}

    