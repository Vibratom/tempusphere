
'use client';

import { FinanceJournal } from '@/components/finance/FinanceJournal';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense, useEffect, useState } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import { usePathname } from 'next/navigation';
import { FinanceNav } from '@/components/finance/FinanceNav';


function JournalContent() {
  const pathname = usePathname();
  const activeTool = pathname.split('/')[2] || 'dashboard';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SettingsProvider>
      <CalendarProvider>
        <ChecklistProvider>
          <ProjectsProvider>
            <FinanceProvider>
              <div className="min-h-screen w-full bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                   <div className="w-full max-w-7xl flex flex-col flex-1 gap-4">
                      <FinanceNav activeTool={activeTool} />
                      {isClient && <FinanceJournal />}
                   </div>
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

export default function JournalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JournalContent />
    </Suspense>
  );
}
