
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToolboxView } from '@/components/education/WebApisView';
import { BookOpen } from 'lucide-react';

function EducationContent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SettingsProvider>
      <div className="min-h-screen w-full bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-7xl flex-1 flex flex-col">
                {isClient && <ToolboxView />}
            </div>
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  );
}

export default function EducationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EducationContent />
    </Suspense>
  );
}
