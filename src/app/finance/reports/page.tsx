
'use client';

import { FinancialReports } from '@/components/finance/FinancialReports';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import { usePathname } from 'next/navigation';
import { FinanceNav } from '@/components/finance/FinanceNav';


function ReportsContent() {
  const pathname = usePathname();
  const activeTool = pathname.split('/')[2] || 'dashboard';

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
                      <FinancialReports />
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

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
